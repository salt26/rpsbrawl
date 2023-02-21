from typing import List, Union, Dict, Tuple

from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
#from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pytz import timezone
import threading
import asyncio
import json
import traceback
import random

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
#oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

origins = [
    "http://localhost:3000" # TODO 포트 번호 바꾸기
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False, # OAuth 사용 시 True로 바꾸기
    allow_methods=["*"],
    allow_headers=["*"],
)

JSON_SENDING_MODE = "text"
JSON_RECEIVING_MODE = "text"

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ConnectionManager:
    def __init__(self):
        # List[WebSocket, int, int]: [연결된 웹소켓 클래스, person_id, room_id]
        # 방에 입장하지 않은 사람은 room_id = -1
        self.active_connections: List[List[Union[WebSocket, int]]] = []

    def find_connection_by_websocket(self, websocket: WebSocket):
        return next((x for x in self.active_connections if x[0] == websocket), None)

    def find_connection_by_person_id(self, person_id: int):
        return next((x for x in self.active_connections if x[1] == person_id), None)

    def find_all_connections_by_room_id(self, room_id: int):
        return list(filter(lambda x: x[2] == room_id, self.active_connections))

    def change_room_id(self, person_id: int, new_room_id: int):
        connection = self.find_connection_by_person_id(person_id)
        connection[2] = new_room_id

    def get_room_id(self, person_id: int):
        connection = self.find_connection_by_person_id(person_id)
        return connection[2]

    async def connect(self, websocket: WebSocket, person_id: int, room_id: int = -1):
        await websocket.accept()
        self.active_connections.append([websocket, person_id, room_id])

    def disconnect(self, websocket: WebSocket):
        self.active_connections = list(filter(lambda x: x[0] != websocket, self.active_connections))

    async def close(self, websocket: WebSocket):
        await websocket.close()
        self.disconnect(websocket=websocket)

    async def close_with_person_id(self, person_id: int):
        connection = self.find_connection_by_person_id(person_id)
        if connection:
            await connection[0].close()
            try:
                self.active_connections.remove(connection)
            except:
                pass

    async def send_text(request: str, response: str, message: str, websocket: WebSocket):
        obj = {}
        obj["request"] = request
        obj["response"] = response
        obj["type"] = "message"
        obj["message"] = message
        await websocket.send_json(obj, mode=JSON_SENDING_MODE)

    async def send_json(request: str, response: str, type: str, data: dict or list, websocket: WebSocket):
        obj = {}
        obj["request"] = request
        obj["response"] = response
        obj["type"] = type
        obj["data"] = data
        await websocket.send_json(obj, mode=JSON_SENDING_MODE)

    async def broadcast_json(self, request: str, type: str, data: dict or list, room_id: int):
        # 한 방 전체의 사람들에게 공통된 JSON을 보냄
        obj = {}
        obj["request"] = request
        obj["response"] = "broadcast"
        obj["type"] = type
        obj["data"] = data
        for connection in self.find_all_connections_by_room_id(room_id):
            await connection[0].send_json(obj, mode=JSON_SENDING_MODE)

    async def broadcast_text(self, request: str, message: str, room_id: int):
        # 한 방 전체의 사람들에게 공통된 JSON을 보냄
        obj = {}
        obj["request"] = request
        obj["response"] = "broadcast"
        obj["type"] = "message"
        obj["message"] = message
        for connection in self.find_all_connections_by_room_id(room_id):
            await connection[0].send_json(obj, mode=JSON_SENDING_MODE)

class BotManager:
    def __init__(self) -> None:
        # List[int, int]: [bot_id, room_id]
        # 플레이 중인 방에서 현재 돌아가고 있는 봇만 이 목록에 표시된다.
        self.active_bots: List[List[int]] = []

    def get_skilled_bot(self, room_id: int, db: Session = Depends(get_db)):
        # Person 중 is_human이 False이고 이름이 "S-"로 시작하는 봇들을 모두 찾는다.
        # 그 중 현재 active_bots에 있는 봇들은 거른다.
        # 남는 봇이 있으면 반환한다.
        # 남는 봇이 없으면 새로 만들어 반환한다.
        bots = crud.get_bots(db, "S")
        remaining_bots = list(set(map(lambda b: b.id, bots)).difference(set(map(lambda b: b[0], self.active_bots))))
        if len(remaining_bots) > 0:
            self.active_bots.append([remaining_bots[0], room_id])
            return crud.get_person(db, remaining_bots[0])
        else:
            bot = crud.create_bot(db, "S")
            # 새 봇의 이름 예: "S-1676609745-962277"
            self.active_bots.append([bot.id, room_id])
            return bot

    def get_dumb_bot(self, room_id: int, db: Session = Depends(get_db)):
        # Person 중 is_human이 False이고 이름이 "D-"로 시작하는 봇들을 모두 찾는다.
        # 그 중 현재 active_bots에 있는 봇들은 거른다.
        # 남는 봇이 있으면 반환한다.
        # 남는 봇이 없으면 새로 만들어 반환한다.
        bots = crud.get_bots(db, "D")
        remaining_bots = list(set(map(lambda b: b.id, bots)).difference(set(map(lambda b: b[0], self.active_bots))))
        if len(remaining_bots) > 0:
            self.active_bots.append([remaining_bots[0], room_id])
            return crud.get_person(db, remaining_bots[0])
        else:
            bot = crud.create_bot(db, "D")
            # 새 봇의 이름 예: "D-1676609975-480407"
            self.active_bots.append([bot.id, room_id])
            return bot

    def release_bot(self, bot_id: int):
        self.active_bots = list(filter(lambda b: b[0] != bot_id, self.active_bots))

class HandManager:
    def __init__(self) -> None:
        # 사용법:
        # schemas.HandEnum(self.active_rooms[room_id][person_id]) = (last_hand, last_score_gain)
        self.active_rooms: Dict[int, Dict[int, Tuple[int, int]]] = {}

    def initialize_for_room(self, room_id: int, person_ids: List[int]):
        # 방에서 게임이 시작될 때 호출해주어야 함
        self.active_rooms[room_id] = {}
        for p in person_ids:
            self.active_rooms[room_id][p] = (-1, 0)

    def get_last_hand_for_each_person(self, room_id: int):
        # 방 번호가 잘못되었거나 게임이 끝난 방이거나 해당 방에서 initialize_for_room()을 호출한 적이 없는 경우: {} (빈 dict) 반환
        # 정상적인 경우: 방에 입장해 있는 모든 사람들에 대해 person_id를 key로, 
        #               Tuple(마지막 손의 int 값(낸 적이 없는 경우 -1), 마지막 손을 내서 변화한 점수 int 값(낸 적이 없는 경우 0))을 value로 하는 dict 반환
        if room_id in self.active_rooms and self.active_rooms[room_id] is not None:
            return self.active_rooms[room_id].copy()
        else:
            return {}

    def get_last_hand(self, room_id: int, person_id: int):
        if room_id in self.active_rooms and self.active_rooms[room_id] is not None and \
            person_id in self.active_rooms[room_id] and self.active_rooms[room_id][person_id] is not None:
            return self.active_rooms[room_id][person_id][0]
        else:
            return -1

    def get_last_score_gain(self, room_id: int, person_id: int):
        if room_id in self.active_rooms and self.active_rooms[room_id] is not None and \
            person_id in self.active_rooms[room_id] and self.active_rooms[room_id][person_id] is not None:
            return self.active_rooms[room_id][person_id][1]
        else:
            return 0

    def update_last_hand(self, room_id: int, person_id: int, last_hand: int, last_score_gain: int):
        if last_hand in iter(schemas.HandEnum) and room_id in self.active_rooms and self.active_rooms[room_id] is not None:
            self.active_rooms[room_id][person_id] = (last_hand, last_score_gain)

    def end_for_room(self, room_id: int):
        # 방에서 게임이 종료될 때 데이터 삭제
        self.active_rooms.pop(room_id, None)

cManager = ConnectionManager()
bManager = BotManager()         # bManager는 lock과 함께 사용 -> lock은 없어도 됨
hManager = HandManager()        # hManager 역시 lock과 함께 사용 -> lock은 없어도 됨
#lock = threading.Lock()

@app.websocket("/signin")
async def websocket_endpoint(websocket: WebSocket, name: str, db: Session = Depends(get_db)):
    if name is None or name == "":
        await websocket.accept()
        await ConnectionManager.send_text("signin", "error", "Name is required", websocket)
        await websocket.close()
        return
    
    person = crud.get_person_by_name(db, name=name)
    if person is None:
        person = crud.create_person(db, name=name)

    
    connection = cManager.find_connection_by_person_id(person.id)
    if connection:
        # 같은 이름의 사람이 현재 접속 중이고 그 사람이 대기 방 또는 플레이 중인 방에 있는 경우에는 로그인할 수 없음
        if connection[2] != -1:
            await websocket.accept()
            await ConnectionManager.send_text("signin", "error", "The same person has already entered in non-end room", websocket)
            await websocket.close()
            return

        # 같은 이름으로 중복 접속하는 경우, 기존의 사람이 방 목록 화면에 있었다면 그 사람을 강제로 로그아웃시킴
        await cManager.close_with_person_id(person.id)
        
    # 웹소켓 연결 시작
    await cManager.connect(websocket, person.id)
    try:
        # 재접속(Play 중인 방에서 연결이 끊겼다가 다시 접속하는 경우)인지 확인
        # 이때 방 garbage collection(종료 시간이 넘었는데 여전히 Play 상태인 방들을 End 상태로 변경)도 일어남
        recon_room_id = crud.check_person_playing(db, person.id)
        if recon_room_id == -1:
            #print("재접속 아님")
            profile_and_room_list = {
                'name': person.name,
                'person_id': person.id,
                'rooms': read_non_end_rooms(db)
            }
            # 개인에게 프로필과 방 목록이 포함된 정보 응답
            await ConnectionManager.send_json("signin", "success", "profile_and_room_list", profile_and_room_list, websocket)

        else:
            # 재접속 시도
            #print("재접속 시도")
            cManager.change_room_id(person.id, recon_room_id)
            recon_data = {
                'name': person.name,
                'person_id': person.id,
                'room': read_room(recon_room_id, db),
                'hand_list': read_hands(recon_room_id, 6, db),
                'game_list': read_game(recon_room_id, db)
            }
            await ConnectionManager.send_json("signin", 'reconnected', "recon_data", recon_data, websocket)

        # 무한 루프를 돌면서 클라이언트에게 요청을 받고 처리하고 응답
        await after_signin(websocket, person.id, db)

    except WebSocketDisconnect:
        #print("연결 끊어짐")
        room_id = cManager.find_connection_by_websocket(websocket)[2]
        cManager.disconnect(websocket)

        # 접속이 끊긴 사람이 대기 방에 있었다면 자동으로 퇴장시킴
        crud.update_room_to_quit(db, room_id, person.id)
        await cManager.broadcast_json("disconnected", "game_list", read_game(room_id, db), room_id) # disconnect`ed`
    except Exception:
        #print("다른 예외")
        traceback.print_exc()
        room_id = cManager.find_connection_by_websocket(websocket)[2]
        if websocket.state == 1:
            # CONNECTED
            await cManager.close(websocket)
        else:
            # DISCONNECTED or CONNECTING
            cManager.disconnect(websocket)

        # 접속이 끊긴 사람이 대기 방에 있었다면 자동으로 퇴장시킴
        crud.update_room_to_quit(db, room_id, person.id)
        #print("접속 끊긴 사람 퇴장 완료")
        await cManager.broadcast_json("disconnect", "game_list", read_game(room_id, db), room_id)   # disconnect
    

@app.get("/")
def read_root():
    # (디버깅 용도)
    return {"Hello": "World"}

@app.get("/connections")
def read_connections():
    # (디버깅 용도)
    ret = []
    for con in cManager.active_connections:
        ret.append({'room_id': con[2], 'person_id': con[1]})
    return {"connections": ret}

@app.get("/room/list", response_model=List[schemas.Room])
def read_all_room(db: Session = Depends(get_db)):
    # 모든 방 목록 반환 (디버깅 용도)
    rooms = crud.get_rooms(db)
    return rooms
    # TODO 최종 배포 시에는 반드시! 지워야 함!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

@app.get("/room/{room_id}")
def read_room(room_id: int, db: Session = Depends(get_db)):
    # 해당 방 반환
    db_room = crud.get_room(db, room_id)
    if db_room is None:
        return None
        #raise HTTPException(status_code=404, detail="Room not found")
    
    to = -1
    td = -1
    it = ""
    st = ""
    et = ""
    if db_room.time_offset is not None:
        to = db_room.time_offset
    if db_room.time_duration is not None:
        td = db_room.time_duration
    if db_room.init_time is not None:
        it = db_room.init_time.astimezone(timezone('Asia/Seoul')).strftime("%Y-%m-%d %H:%M:%S.%f %Z")
    if db_room.start_time is not None:
        st = db_room.start_time.astimezone(timezone('Asia/Seoul')).strftime("%Y-%m-%d %H:%M:%S.%f %Z")
    if db_room.end_time is not None:
        et = db_room.end_time.astimezone(timezone('Asia/Seoul')).strftime("%Y-%m-%d %H:%M:%S.%f %Z")

    return {
        'id': room_id,
        'state': db_room.state,
        "time_offset" : to,
        "time_duration" : td,
        'init_time': it,
        'start_time': st,
        'end_time': et,
        'name': db_room.name,
        'mode': db_room.mode,
        'has_password': not(db_room.password is None or db_room.password == ""),
        'bot_skilled': db_room.bot_skilled,
        'bot_dumb': db_room.bot_dumb,
        'max_persons': db_room.max_persons,
        'num_persons': len(db_room.persons) + db_room.bot_skilled + db_room.bot_dumb
    }


@app.get("/room/non-end/list")
def read_non_end_rooms(db: Session = Depends(get_db)):
    # 종료 상태가 아닌 모든 방 목록 반환
    db_rooms = crud.get_non_end_rooms(db)
    if db_rooms is None:
        return None
        #raise HTTPException(status_code=404, detail="Room not found")
    
    rooms = []
    for room in db_rooms:
        to = -1
        td = -1
        it = ""
        st = ""
        et = ""
        if room.time_offset is not None:
            to = room.time_offset
        if room.time_duration is not None:
            td = room.time_duration
        if room.init_time is not None:
            it = room.init_time.astimezone(timezone('Asia/Seoul')).strftime("%Y-%m-%d %H:%M:%S.%f %Z")
        if room.start_time is not None:
            st = room.start_time.astimezone(timezone('Asia/Seoul')).strftime("%Y-%m-%d %H:%M:%S.%f %Z")
        if room.end_time is not None:
            et = room.end_time.astimezone(timezone('Asia/Seoul')).strftime("%Y-%m-%d %H:%M:%S.%f %Z")

        rooms.append({
            'id': room.id,
            'state': room.state,
            "time_offset" : to,
            "time_duration" : td,
            'init_time': it,
            'start_time': st,
            'end_time': et,
            'name': room.name,
            'mode': room.mode,
            'has_password': not(room.password is None or room.password == ""),
            'bot_skilled': room.bot_skilled,
            'bot_dumb': room.bot_dumb,
            'max_persons': room.max_persons,
            'num_persons': len(room.persons) + room.bot_skilled + room.bot_dumb
        })
    
    return rooms

@app.get("/room/{room_id}/hand")
def read_hands(room_id: int, limit: int = 6, db: Session = Depends(get_db)):
    # 해당 방에서 사람들이 낸 손 목록 limit개 반환 (마지막으로 낸 손이 마지막 인덱스)
    hands = crud.get_hands_from_last(db, room_id=room_id, limit=limit)
    ret = []
    for hand in hands:
        person = crud.get_person(db, person_id=hand.person_id)
        game = crud.get_game(db, room_id, person.id)
        ret.append({
            'team': game.team,
            'name': person.name,
            'is_human': person.is_human,
            'hand': hand.hand,
            'score': hand.score,
            'time': hand.time.astimezone(timezone('Asia/Seoul')).strftime("%Y-%m-%d %H:%M:%S.%f %Z"),
            'room_id': hand.room_id,
            #'person_id': hand.person_id
        })
    return ret

@app.get("/room/{room_id}/hand/list")
def read_all_hands(room_id: int, db: Session = Depends(get_db)):
    # 해당 방에서 사람들이 낸 손 목록 모두 반환 (가장 먼저 낸 손이 [0]번째 인덱스, 마지막으로 낸 손이 마지막 인덱스)
    hands = crud.get_hands(db, room_id=room_id)
    ret = []
    for hand in hands:
        person = crud.get_person(db, person_id=hand.person_id)
        game = crud.get_game(db, room_id, person.id)
        ret.append({
            'team': game.team,
            'name': person.name,
            'is_human': person.is_human,
            'hand': hand.hand,
            'score': hand.score,
            'time': hand.time.astimezone(timezone('Asia/Seoul')).strftime("%Y-%m-%d %H:%M:%S.%f %Z"),
            'room_id': hand.room_id,
            #'person_id': hand.person_id
        })
    return ret

@app.get("/room/{room_id}/game")
def read_game(room_id: int, db: Session = Depends(get_db)):
    # 해당 방의 사람들의 {순위, 팀 번호, 이름, 방장 여부, 점수, win, draw, lose, 방 번호} 반환
    # person_id가 -1이 아닌 값으로 주어지는 경우, 해당 사람이 있으면 그 사람은 항상 목록의 0번째 인덱스에 정렬

    games = crud.get_games_in_room(db, room_id=room_id, only_human=False)
    # 점수가 같다면 이긴 횟수가 많을수록 높은 순위, 이긴 횟수도 같다면 비긴 횟수가 많을수록 높은 순위
    # (많이 낼수록 유리)
        
    games.sort(key=lambda e: (e.score, e.win, e.draw), reverse=True)
    ret = []
    for index, game in enumerate(games):
        person = crud.get_person(db, person_id=game.person_id)
        ret.append({
            'rank': index + 1, # 순위는 점수가 가장 높은 사람이 1
            'team': game.team,
            'name': person.name,
            'is_host': game.is_host,
            'is_human': person.is_human,
            'score': game.score,
            'win': game.win,
            'draw': game.draw,
            'lose': game.lose,
            'room_id': game.room_id,
            #'person_id': game.person_id
        })
    return ret

@app.get("/profile/{room_id}/{person_id}")
def read_profile(room_id: int, person_id: int, db: Session = Depends(get_db)):
    # 해당 방의 특정 사람의 {팀 번호, 이름, 방장 여부, 방 번호, 개인 번호} 반환
    game = crud.get_game(db, room_id=room_id, person_id=person_id)
    if game is None:
        return None
        #raise HTTPException(status_code=404, detail="Game not found")
    person = crud.get_person(db, person_id=person_id)
    if person is None:
        return None
        #raise HTTPException(status_code=404, detail="Person not found")
    return {
        'team': game.team,
        'name': person.name,
        'is_host': game.is_host,
        'room_id': game.room_id,
        'person_id': game.person_id
    }

@app.get("/person/{person_id}")
def read_person(person_id: int, db: Session = Depends(get_db)):
    return crud.get_person(db, person_id)

"""
@app.get("/person/list")
def read_persons(db: Session = Depends(get_db)):
    # (디버깅 용도)
    return crud.get_persons(db)

@app.get("/game/list")
def read_all_games(db: Session = Depends(get_db)):
    # (디버깅 용도)
    return crud.get_games(db)
"""

async def skilled_bot_ai(room_id: int, bot_id: int, db: Session = Depends(get_db)):
    # 1. 손 입력 받기 시작 전에는 0.1 ~ 1.5초마다 방 상태를 보고, 손을 낼 수 있는 상황이 되면 2.의 과정으로 넘어간다. 아니면 1.을 반복한다.
    # 2.1. Normal 모드:  현재 보이는 마지막 손을 불러오고, 이로부터 또 0.2 ~ 0.3초 지났을 때 아까 불러온 손을 이기는 손을 낸다. 마지막 손을 내고 1.0 ~ 1.3초 지났을 때 2.를 반복한다.
    # 2.2. Limited 모드: 현재 보이는 마지막 손을 불러오고, 이를 이기는 손을 낼 수 있는 상태이면 이로부터 0.2 ~ 0.3초 지났을 때 이기는 손을 낸 후에 1.0 ~ 1.3초 기다렸다가 2.를 반복한다.
    #                                                    이를 이기는 손을 낼 수 없는 상태이면 0.2 ~ 0.3초 기다렸다가 2.를 반복한다.
    # 손을 불러오는 시점에 먼저 DB로부터 방(Room) 상태를 확인하여, 만약 end_time이 None이 아니거나 방이 End 상태이면 종료한다.
    # 종료할 때 해당 봇의 person 정보는 삭제되지 않는다.
    # 봇은 본질적으로 broadcast 등의 네트워크 응답을 일절 받을 수 없다.
    while True:
        #lock.acquire()
        room = crud.get_room(db, room_id)
        #lock.release()
        if room is None or room.end_time is not None or room.state == schemas.RoomStateEnum.End:
            #lock.acquire()
            bManager.release_bot(bot_id)
            #lock.release()
            #print("skilled_bot " + str(bot_id) + " in room " + str(room_id) + " has terminated")
            return
        elif room.start_time is not None:
            #lock.acquire()
            old_hand = crud.get_hands_from_last(db, room_id, 1)[0].hand
            #lock.release()
            #print("skilled bot has observed hand " + str(old_hand))
            await asyncio.sleep(0.2 + random.random() * 0.1)

            new_hand = (int(old_hand) + 2) % 3

            #lock.acquire()
            last_hand = hManager.get_last_hand(room_id, bot_id)

            if room.mode == schemas.RoomModeEnum.Limited and last_hand == new_hand:
                #lock.release()
                #print("skilled bot skip")
                await asyncio.sleep(0.2 + random.random() * 0.1)
            else:
                hand_obj, error_code = crud.create_hand(db, room_id, bot_id, schemas.HandEnum(new_hand), last_hand=last_hand)
                if error_code == 0:
                    hManager.update_last_hand(room_id, bot_id, new_hand, hand_obj.score)
                    hand_data = {
                        "hand_list": read_hands(room_id, 6, db),
                        "game_list": read_game(room_id, db),
                        "last_hand": hManager.get_last_hand_for_each_person(room_id)
                    }
                    #lock.release()
                    task1 = asyncio.create_task(cManager.broadcast_json("hand", "hand_data", hand_data, room_id))
                    task2 = asyncio.create_task(asyncio.sleep(1.0 + random.random() * 0.3))
                    await task1
                    await task2
                else:
                    #lock.release()
                    #print("skilled bot hand failed: error_code " + str(error_code))
                    pass
        else:
            await asyncio.sleep(0.1 + random.random() * 1.4)

async def dumb_bot_ai(room_id: int, bot_id: int, db: Session = Depends(get_db)):
    # 1. 손 입력 받기 시작 전에는 0.1 ~ 1.5초마다 방 상태를 보고, 손을 낼 수 있는 상황이 되면 2.의 과정으로 넘어간다. 아니면 1.을 반복한다.
    # 2.1. Normal 모드:  현재 보이는 마지막 손을 불러오고, 이로부터 또 0.2 ~ 0.8초 지났을 때 아까 불러온 손을 이기는 손을 낸다. 마지막 손을 내고 1.0 ~ 1.3초 지났을 때 2.를 반복한다.
    # 2.2. Limited 모드: 현재 보이는 마지막 손을 불러오고, 이를 이기는 손을 낼 수 있는 상태이면 이로부터 0.2 ~ 0.8초 지났을 때 이기는 손을 낸 후에 1.0 ~ 1.3초 기다렸다가 2.를 반복한다.
    #                                                    이를 이기는 손을 낼 수 없는 상태이면 0.2 ~ 0.8초 기다렸다가 2.를 반복한다.
    # 손을 불러오는 시점에 먼저 DB로부터 방(Room) 상태를 확인하여, 만약 end_time이 None이 아니거나 방이 End 상태이면 종료한다.
    # 종료할 때 해당 봇의 person 정보는 삭제되지 않는다.
    # 봇은 본질적으로 broadcast 등의 네트워크 응답을 일절 받을 수 없다.
    while True:
        #lock.acquire()
        room = crud.get_room(db, room_id)
        #lock.release()
        if room is None or room.end_time is not None or room.state == schemas.RoomStateEnum.End:
            #lock.acquire()
            bManager.release_bot(bot_id)
            #lock.release()
            #print("dumb_bot " + str(bot_id) + " in room " + str(room_id) + " has terminated")
            return
        elif room.start_time is not None:
            #lock.acquire()
            old_hand = crud.get_hands_from_last(db, room_id, 1)[0].hand
            #lock.release()
            #print("dumb bot has observed hand " + str(old_hand))
            await asyncio.sleep(0.2 + random.random() * 0.6)

            new_hand = (int(old_hand) + 1) % 3
            
            #lock.acquire()
            last_hand = hManager.get_last_hand(room_id, bot_id)

            if room.mode == schemas.RoomModeEnum.Limited and last_hand == new_hand:
                #lock.release()
                #print("dumb bot skip")
                await asyncio.sleep(0.2 + random.random() * 0.6)
            else:
                hand_obj, error_code = crud.create_hand(db, room_id, bot_id, schemas.HandEnum(new_hand), last_hand=last_hand)
                if error_code == 0:
                    hManager.update_last_hand(room_id, bot_id, new_hand, hand_obj.score)
                    hand_data = {
                        "hand_list": read_hands(room_id, 6, db),
                        "game_list": read_game(room_id, db),
                        "last_hand": hManager.get_last_hand_for_each_person(room_id)
                    }
                    #lock.release()
                    task1 = asyncio.create_task(cManager.broadcast_json("hand", "hand_data", hand_data, room_id))
                    task2 = asyncio.create_task(asyncio.sleep(1.0 + random.random() * 0.3))
                    await task1
                    await task2
                else:
                    #lock.release()
                    #print("dumb bot hand failed: error_code " + str(error_code))
                    pass
        else:
            await asyncio.sleep(0.1 + random.random() * 1.4)

# 코루틴을 활용하여 방의 게임 시간을 관리
# 하나의 방이 Playing 상태로 바뀔 때(start 요청을 받을 때) asyncio task를 생성하여 예약한 시간만큼 기다린다.
# 입력을 받기 시작할 때 한 번 broadcast로 메시지를 보내고, 게임이 종료될 때 한 번 더 broadcast로 메시지를 보낸다.
# broadcast를 보내는 동안에는 함수를 blocking하지 않는다. 즉, broadcast 시간이 늦어져도 총 게임 시간에는 영향을 주지 않는다.
async def manage_time_for_room(room_id: int, time_offset: int, time_duration: int, db: Session = Depends(get_db)):
    if time_offset < 0:
        time_offset = 0
    if time_duration < 1:
        time_duration = 1

    #lock.acquire()
    init_data = {
        "room": read_room(room_id, db),
        "hand_list": read_all_hands(room_id, db),
        "game_list": read_game(room_id, db)
    }
    #lock.release()
    task1 = asyncio.create_task(cManager.broadcast_json("start", "init_data", init_data, room_id))
    task2 = asyncio.create_task(asyncio.sleep(time_offset))
    await task1
    await task2
    
    #lock.acquire()
    crud.update_room_to_start(db, room_id)
    room = read_room(room_id, db)
    #lock.release()
    task1 = asyncio.create_task(cManager.broadcast_json("start", "room_start", room, room_id))
    task2 = asyncio.create_task(asyncio.sleep(time_duration))
    await task1
    await task2

    #lock.acquire()
    crud.update_room_end_time(db, room_id)  # 백엔드 자체에서 시간으로 입력 가능 여부를 판단하면 안 되고, 함수를 호출한 순간 무조건 결과 창 표시 상태로 변경해야 한다.
    hand_data = {
        "room": read_room(room_id, db),
        "hand_list": read_all_hands(room_id, db),
        "game_list": read_game(room_id, db)
    }
    #lock.release()
    task1 = asyncio.create_task(cManager.broadcast_json("end", "hand_data", hand_data, room_id))
    task2 = asyncio.create_task(asyncio.sleep(crud.END_WAITING_TIME))
    await task1
    await task2

    #lock.acquire()
    hManager.end_for_room(room_id)
    old_room = crud.update_room_to_end(db, room_id)    # 방을 End 페이즈로 바꾸고 모든 인원을 새 방으로 이동
    old_games = crud.get_games_in_room(db, room_id, True)
    #lock.release()

    # 옮겨야 하는 정보?
    # 1. 사람, 팀, 방장 권한
    # 2. 게임 방 이름, 모드, 비밀번호, 숙련봇 수, 트롤봇 수, 최대 인원
    # 방에 있던 사람 일부가 접속을 끊은 경우, 이 사람들은 새 방으로 입장시키지 말아야 한다.
    # 접속을 끊은 사람 중에 방장이 있다면?
    connected_persons = list(map(lambda e: e[1], cManager.find_all_connections_by_room_id(room_id)))
    new_host_id = -1
    for g in old_games:
        if g.is_host:
            if g.person_id in connected_persons:
                new_host_id = g.person_id
                #lock.acquire()
                new_room, _ = crud.create_room_and_enter(db, g.person_id, old_room.name, old_room.mode, old_room.password)
                crud.update_room_setting(db, new_room.id, bot_skilled=old_room.bot_skilled, bot_dumb=old_room.bot_dumb, max_persons=old_room.max_persons)
                #lock.release()
                break
            elif len(connected_persons) == 0:
                return
            else:
                # 방장 이양 후 방 생성
                new_host_id = connected_persons[0]
                #lock.acquire()
                new_room, _ = crud.create_room_and_enter(db, connected_persons[0], old_room.name, old_room.mode, old_room.password)
                crud.update_room_setting(db, new_room.id, bot_skilled=old_room.bot_skilled, bot_dumb=old_room.bot_dumb, max_persons=old_room.max_persons)
                #lock.release()
                break
    #lock.acquire()
    for person_id in connected_persons:
        if person_id != new_host_id:
            crud.update_room_to_enter(db, new_room.id, person_id, old_room.password)
        cManager.change_room_id(person_id, new_room.id)
        crud.update_game_for_team(db, new_room.id, person_id, crud.get_game(db, room_id, person_id).team)
    # 해당 방 전체에게 입장 데이터(방 정보 및 전적(사람) 목록) 응답
    join_data = {"room": read_room(new_room.id, db), "game_list": read_game(new_room.id, db)}
    #lock.release()
    await cManager.broadcast_json("end", "join_data", join_data, new_room.id)

# 방의 시간 관리 함수를 돌리는 스레드에서 봇을 함께 비동기로 돌리도록 함
async def run_game_for_room(room_id: int, time_offset: int, time_duration: int):
    # 봇 person을 봇 풀에서 가져오거나 중복되지 않게 새로 만들어 가져온다.
    # 스레드를 새로 만들어 그 스레드에서 skilled_bot_ai()를 돌린다!

    # DB 세션을 새로 만들어서, 스레드 당 하나의 세션을 가지도록 해야 여러 스레드가 DB에 동시에 접근해서 생기는 문제가 발생하지 않는다.
    db = SessionLocal()
    try:
        #lock.acquire()
        room = crud.get_room(db, room_id)
        #lock.release()
        if room is None:
            return
        tasks = []
        #lock.acquire()
        for _ in range(room.bot_skilled):
            bot_id = bManager.get_skilled_bot(room_id, db).id
            _, error_code = crud.update_room_to_enter_bot(db, room_id, bot_id)
            if error_code != 0:
                print("skilled bot enter failed: error_code " + str(error_code))
                pass
            tasks.append(skilled_bot_ai(room_id, bot_id, db))
        for _ in range(room.bot_dumb):
            bot_id = bManager.get_dumb_bot(room_id, db).id
            _, error_code = crud.update_room_to_enter_bot(db, room_id, bot_id)
            if error_code != 0:
                print("dumb bot enter failed: error_code " + str(error_code))
            tasks.append(dumb_bot_ai(room_id, bot_id, db))
            
        games = crud.get_games_in_room(db, room_id, False)
        #print(list(map(lambda g: g.person_id, games)))
        hManager.initialize_for_room(room_id, list(map(lambda g: g.person_id, games)))
        #lock.release()

        tasks.append(manage_time_for_room(room_id, time_offset, time_duration, db))
        await asyncio.gather(*tasks)
    finally:
        db.close()

# 멀티스레드로 방의 시간 관리 함수를 돌려서, 요청을 보낸 사람의 접속이 끊어져서 메인 스레드에서 Exception이 발생하더라도 끝까지 게임이 진행될 수 있게 함
def manage_time_for_room_threading(room_id: int, time_offset: int, time_duration: int):
    asyncio.run(run_game_for_room(room_id, time_offset, time_duration))
    
async def after_signin(websocket: WebSocket, person_id: int, db: Session = Depends(get_db)):
    while True:
        # 클라이언트의 요청 대기
        try:
            data = await websocket.receive_json(mode=JSON_RECEIVING_MODE)
            request = data["request"]
            room_id = cManager.get_room_id(person_id)
        except json.decoder.JSONDecodeError:
            # JSON 형식이 아닌 문자열을 클라이언트에서 보낸 경우 발생
            await ConnectionManager.send_text("", "error", "Bad request", websocket)
            continue
        except KeyError:
            # JSON에 "request"라는 key가 없는 경우 발생
            await ConnectionManager.send_text("", "error", "Bad request", websocket)
            continue
        except WebSocketDisconnect:
            raise
        except TypeError:
            # TypeError의 경우 데이터 스키마가 변경된 경우에 발생하는 것으로 알려져 있음
            await ConnectionManager.send_text("", "error", "Internal server error", websocket)
            traceback.print_exc()
            print("Data migration required!")
            raise
        except:
            await ConnectionManager.send_text("", "error", "Internal server error", websocket)
            traceback.print_exc()
            print("Internal server error")
            raise

        if request == "refresh":
            # 방 목록 화면에서 방 목록 새로고침 요청
            # 연결이 끊긴 상태가 아니라면...
            await ConnectionManager.send_json("refresh", "success", "room_list", read_non_end_rooms(db), websocket)

        elif request == "join":
            # 방 입장 요청

            # 방 비밀번호는 다음과 같이 처리한다.
            # 1. 사용자가 입장할 방 선택
            # 2. 프론트엔드에서 비밀번호가 포함되지 않은 정보로 방 입장 요청 (그 방이 비밀 방이더라도)
            # 3. 백엔드에서 해당 방의 최신 정보와 비교하여, 비밀번호가 필요 없는 방이면 입장 성공 응답, 비밀번호가 필요한 방이면 해당 방의 최신 정보와 함께 입장 실패 응답
            # 4. 프론트엔드에서 비밀번호 입력 창을 표시하고 사용자가 비밀번호 입력
            # 5. 프론트엔드에서 비밀번호가 포함된 정보로 방 입장 재요청
            # 6. 백엔드에서 해당 방의 최신 정보와 비교하여, 비밀번호가 필요 없는 방이거나 비밀번호가 필요한 방이지만 비밀번호가 같은 경우 입장 성공 응답, 비밀번호가 필요한 방이고 비밀번호가 틀린 경우 입장 실패 응답

            # 비밀번호를 처리함에 있어 해시 함수가 필요하겠지? 복호화가 불가능한 해시 함수이면 좋겠다. 다만 같은 문자열은 같은 해시 문자열을 가지므로 둘이 같은지 비교하는 것은 가능하다.
            # 언제 암호화를 해야 하지? 프론트엔드에서 전송할 때? 백엔드에서 받고 나서?

            # 방에 입장하면 네 가지 변경이 필요하다.
            # 1. Game 오브젝트 생성해서 DB에 저장
            # 2. ConnectionManager에서 해당 유저의 방 번호 변경
            # 3. 해당 유저가 접속한 방의 모든 사람들(본인 포함)에게 최신 전적(사람) 목록 전송
            
            if room_id != -1:
                await ConnectionManager.send_text("join", "error", "You are already in a room", websocket)
                continue

            _, error_code = crud.update_room_to_enter(db, data.get("room_id", -1), person_id, data.get("password"))
            if error_code == 0:
                cManager.change_room_id(person_id, data["room_id"])
                # 해당 방 전체에게 입장 데이터(방 정보 및 전적(사람) 목록) 응답
                join_data = {"room": read_room(data["room_id"], db), "game_list": read_game(data["room_id"], db)}
                await cManager.broadcast_json("join", "join_data", join_data, data["room_id"])
            elif error_code == 1:
                await ConnectionManager.send_text("join", "error", "Room not found", websocket)
            elif error_code == 2:
                await ConnectionManager.send_text("join", "error", "Cannot join in non-wait room", websocket)
            elif error_code == 3:
                await ConnectionManager.send_text("join", "error", "Person not found", websocket)
            elif error_code == 4:
                # 비밀번호 불일치
                await ConnectionManager.send_json("join", "error_refresh", "room", read_room(data["room_id"], db), websocket)
            elif error_code == 5:
                await ConnectionManager.send_text("join", "error", "The same person has already entered in non-end room", websocket)
            elif error_code == 6:
                await ConnectionManager.send_text("join", "error", "Room is full", websocket)

        elif request == "create":
            # 방 생성 요청
            if room_id != -1:
                await ConnectionManager.send_text("create", "error", "You are already in a room", websocket)
                continue

            # https://stackoverflow.com/questions/43634618/how-do-i-test-if-int-value-exists-in-python-enum-without-using-try-catch
            mode = data.get("mode", 0)
            if mode not in iter(schemas.RoomModeEnum):
                await ConnectionManager.send_text("create", "error", "Bad request: mode", websocket)
                continue

            room, error_code = crud.create_room_and_enter(db, person_id, data.get("room_name"), schemas.RoomModeEnum(mode), data.get("password"))
            if error_code == 0:
                cManager.change_room_id(person_id, room.id)
                # 개인에게 입장 데이터(방 정보 및 전적(사람) 목록) 응답
                join_data = {"room": read_room(room.id, db), "game_list": read_game(room.id, db)}
                await ConnectionManager.send_json("create", "success", "join_data", join_data, websocket)
            elif error_code == 2:
                await ConnectionManager.send_text("create", "error", "Bad request", websocket)
            elif error_code == 3:
                await ConnectionManager.send_text("create", "error", "Person not found", websocket)
            elif error_code == 5:
                await ConnectionManager.send_text("create", "error", "The same person has already entered in non-end room", websocket)

        elif request == "setting":
            # 방 설정 변경 요청
            if room_id == -1:
                await ConnectionManager.send_text("setting", "error", "You are not in any room", websocket)
                continue

            # 관리자 권한이 있는 사람이 보낸 요청인지 확인
            db_person = crud.get_person(db, person_id)
            if db_person is None:
                await ConnectionManager.send_text("setting", "error", "Person not found", websocket)
                continue

            game = crud.get_game(db, room_id, person_id)
            if game is None:
                await ConnectionManager.send_text("setting", "error", "You are not in that room", websocket)
                continue
            elif not game.is_host:
                await ConnectionManager.send_text("setting", "error", "Only the host can change the room settings", websocket)
                continue

            mode = data.get("mode")
            if mode is not None:
                if mode not in iter(schemas.RoomModeEnum):
                    await ConnectionManager.send_text("setting", "error", "Bad request: mode", websocket)
                    continue
                mode = schemas.RoomModeEnum(mode)

            room, error_code = crud.update_room_setting(db, room_id, name=data.get("name"), mode=mode, \
                password=data.get("password"), bot_skilled=data.get("bot_skilled"), bot_dumb=data.get("bot_dumb"), max_persons=data.get("max_persons"))
            if error_code == 0:
                await cManager.broadcast_json("setting", "room", read_room(room.id, db), room.id)
            elif error_code == 1:
                await ConnectionManager.send_text("setting", "error", "Room not found", websocket)
            elif error_code == 2:
                await ConnectionManager.send_text("setting", "error", "Cannot change the settings of the non-wait room", websocket)
            elif error_code == 3:
                await ConnectionManager.send_text("setting", "error", "Bad request: name", websocket)
            elif error_code == 13:
                await ConnectionManager.send_text("setting", "error", "Bad request: password", websocket)
            elif error_code == 23:
                await ConnectionManager.send_text("setting", "error", "Bad request: max_persons", websocket)
            elif error_code == 33:
                await ConnectionManager.send_text("setting", "error", "Bad request: bot_skilled", websocket)
            elif error_code == 43:
                await ConnectionManager.send_text("setting", "error", "Bad request: bot_dumb", websocket)
            elif error_code == 53:
                await ConnectionManager.send_text("setting", "error", "Bad request: exceed max_persons", websocket)
            

        elif request == "team":
            # 팀 변경 요청
            if room_id == -1:
                await ConnectionManager.send_text("team", "error", "You are not in any room", websocket)
                continue
            
            _, error_code = crud.update_game_for_team(db, room_id, person_id, data.get("team", -1))
            if error_code == 0:
                await cManager.broadcast_json("team", "game_list", read_game(room_id, db), room_id)
            elif error_code == 1:
                await ConnectionManager.send_text("team", "error", "Room not found", websocket)
            elif error_code == 2:
                await ConnectionManager.send_text("team", "error", "Cannot change the team in the non-wait room", websocket)
            elif error_code == 3:
                await ConnectionManager.send_text("team", "error", "You are not in that room", websocket)
            elif error_code == 4:
                await ConnectionManager.send_text("team", "error", "Bad request", websocket)

        elif request == "hand":
            # 손 입력 요청
            # 해당 방에 새로운 손 추가
            if room_id == -1:
                await ConnectionManager.send_text("hand", "error", "You are not in any room", websocket)
                continue

            hand = data.get("hand", -1)
            if hand not in iter(schemas.HandEnum):
                await ConnectionManager.send_text("hand", "error", "Bad request: hand", websocket)
                continue

            #lock.acquire()
            last_hand = hManager.get_last_hand(room_id, person_id)
            #lock.release()
            hand_obj, error_code = crud.create_hand(db, room_id=room_id, person_id=person_id, hand=schemas.HandEnum(hand), last_hand=last_hand)
            if error_code == 0:
                #lock.acquire()
                hManager.update_last_hand(room_id, person_id, hand, hand_obj.score)
                hand_data = {
                    "hand_list": read_hands(room_id, 6, db),
                    "game_list": read_game(room_id, db),
                    "last_hand": hManager.get_last_hand_for_each_person(room_id)
                }
                #lock.release()
                await cManager.broadcast_json("hand", "hand_data", hand_data, room_id)
            elif error_code == 1 or error_code == 11:
                await ConnectionManager.send_text("hand", "error", "Room is not in a play mode", websocket)
            elif error_code == 2 or error_code == 12:
                await ConnectionManager.send_text("hand", "error", "Game not started yet", websocket)
            elif error_code == 3 or error_code == 13:
                await ConnectionManager.send_text("hand", "error", "Person not found", websocket)
            elif error_code == 4:
                await ConnectionManager.send_text("hand", "error", "Initial hand not found", websocket)
            elif error_code == 5 or error_code == 15:
                await ConnectionManager.send_text("hand", "error", "Room not found", websocket)
            elif error_code == 6 or error_code == 16:
                await ConnectionManager.send_text("hand", "error", "Game has ended", websocket)
            elif error_code == 7:
                await ConnectionManager.send_text("hand", "error", "Cannot play the same hand in a row (limited mode)", websocket)
                
        elif request == "quit":
            # 나가기 요청
            # 대기 중인 방일 경우에, 해당 방에 해당 사람이 있으면 제거
            if room_id == -1:
                await ConnectionManager.send_text("quit", "error", "You are not in any room", websocket)
                continue

            _, error_code = crud.update_room_to_quit(db, room_id, person_id)
            if error_code == 0:
                cManager.change_room_id(person_id, -1)
                await ConnectionManager.send_text("quit", "success", "Successfully left the room", websocket)
                await cManager.broadcast_json("quit", "game_list", read_game(room_id, db), room_id)
            elif error_code == 1:
                await ConnectionManager.send_text("quit", "error", "Room not found", websocket)
            elif error_code == 2:
                await ConnectionManager.send_text("quit", "error", "Cannot quit from non-wait room", websocket)
            elif error_code == 3:
                await ConnectionManager.send_text("quit", "error", "Person not found", websocket)
            elif error_code == 4:
                await ConnectionManager.send_text("quit", "error", "You are not in that room", websocket)
        
        elif request == "signout":
            # 로그아웃 요청
            # 접속 종료
            
            # 요청을 날릴 때 있던 곳이 대기 방이면 퇴장 처리도 한다.
            # 방 목록 화면에 있었거나 플레이 중인 방에 있었어도 로그아웃이 가능하지만, 퇴장 처리는 되지 않는다.
            if room_id != -1:
                _, error_code = crud.update_room_to_quit(db, room_id, person_id)
                if error_code == 0:
                    cManager.change_room_id(person_id, -1)
                    await cManager.broadcast_json("signout", "game_list", read_game(room_id, db), room_id)

            await ConnectionManager.send_text("signout", "success", "Successfully signed out", websocket)
            await cManager.close(websocket)
            return

        elif request == "start":
            # 게임 시작 요청

            if room_id == -1:
                await ConnectionManager.send_text("start", "error", "You are not in any room", websocket)
                continue

            # 해당 방의 상태 변경
            # 시작 후 time_offset 초 후부터 time_duration 초 동안 손 입력을 받음
            room = read_room(room_id, db)
            if room is None:
                await ConnectionManager.send_text("start", "error", "Room not found", websocket)
                continue

            # 관리자 권한이 있는 사람이 보낸 요청인지 확인
            db_person = crud.get_person(db, person_id)
            if db_person is None:
                await ConnectionManager.send_text("start", "error", "Person not found", websocket)
                continue

            game = crud.get_game(db, room_id, person_id)
            if game is None:
                await ConnectionManager.send_text("start", "error", "You are not in that room", websocket)
                continue
            elif not game.is_host:
                await ConnectionManager.send_text("start", "error", "Only the host can start the game", websocket)
                continue

            if room["state"] == schemas.RoomStateEnum.Wait:
                crud.update_room_to_play(db, room_id=room_id, \
                    time_offset=data.get("time_offset", 5), time_duration=data.get("time_duration", 60))

                # https://tech.buzzvil.com/blog/asyncio-no-1-coroutine-and-eventloop/
                # 멀티스레드를 사용하여, start 요청을 보낸 사람(방장)이 접속 종료 시 해당 방의 게임이 멈춰버리던 문제 해결
                threading.Thread(target=manage_time_for_room_threading, args=(room_id, data.get("time_offset", 5), data.get("time_duration", 60))).start()
            else:
                await ConnectionManager.send_text("start", "error", "Room is not in a wait mode", websocket)

        else:
            # 오류 메시지 응답
            await ConnectionManager.send_text("", "error", "Bad request", websocket)