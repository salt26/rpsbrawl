from typing import List, Tuple

from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
#from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pytz import timezone
import asyncio
import json
import traceback

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
        # Tuple[WebSocket, int, int]: (연결된 웹소켓 클래스, person_id, room_id)
        self.active_connections: List[Tuple[WebSocket, int, int]] = []

    def find_connection_by_websocket(self, websocket: WebSocket):
        return next((x for x in self.active_connections if x[0] == websocket), None)

    def find_connection_by_person_id(self, person_id: int):
        return next((x for x in self.active_connections if x[1] == person_id), None)

    def find_all_connections_by_room_id(self, room_id: int):
        return list(filter(lambda x: x[2] == room_id, self.active_connections))

    async def connect(self, websocket: WebSocket, person_id: int, room_id: int):
        await websocket.accept()
        self.active_connections.append((websocket, person_id, room_id))

    def disconnect(self, websocket: WebSocket):
        self.active_connections = list(filter(lambda x: x[0] != websocket, self.active_connections))

    async def close(self, websocket: WebSocket):
        await websocket.close()
        self.disconnect(websocket=websocket)

    async def close_with_person_id(self, person_id: int):
        connection = self.find_connection_by_person_id(person_id)
        if connection:
            await connection[0].close()
            self.active_connections.remove(connection)

    async def close_with_room_id(self, room_id: int):
        # 한 방 전체의 사람들을 퇴장시킴
        for connection in self.find_all_connections_by_room_id(room_id):
            await connection[0].close()
            if connection in self.active_connections:
                self.active_connections.remove(connection)

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

manager = ConnectionManager()

@app.websocket("/join")
async def websocket_endpoint(websocket: WebSocket, affiliation: str, name: str, db: Session = Depends(get_db)):
    if affiliation is None or name is None or affiliation == "" or name == "":
        await websocket.accept()
        await ConnectionManager.send_text("join", "error", "Both affiliation and name are required", websocket)
        await websocket.close()
        return
    
    # 웹소켓 연결 시작
    # 한 번 연결하면 연결을 끊거나 끊어질 때까지 while True:로 모든 데이터를 다 받아야 하나?
    person = crud.get_person_by_affiliation_and_name(db, affiliation=affiliation, name=name)
    if person is None:
        person = crud.create_person(db, affiliation=affiliation, name=name)
    try:
        room = crud.update_last_wait_room_to_enter(db, person.id)
    except Exception as e:
        if str(e.__cause__).find("UNIQUE constraint failed") != -1:
            await websocket.accept()
            await ConnectionManager.send_text("join", "error", "Person already exists in the Room", websocket)
            await websocket.close()
            return
        else:
            await websocket.accept()
            await ConnectionManager.send_text("join", "error", e.__cause__, websocket)
            await websocket.close()
            return
    if room is None:
        await websocket.accept()
        await ConnectionManager.send_text("join", "error", "Person has already entered in non-end Room", websocket)
        await websocket.close()
        return

    connection = manager.find_connection_by_person_id(person.id)
    if connection:
        # 같은 아이디로 중복 접속하는 경우 기존의 사람을 강제로 로그아웃시킴
        await manager.close_with_person_id(person.id)
        
    await manager.connect(websocket, person.id, room.id)
    try:
        # 개인에게 프로필('affiliation', 'name', 'is_admin', 'room_id', 'person_id'가 포함된 JSON) 반환 응답
        await ConnectionManager.send_json("join", "success", "profile", read_profile(room.id, person.id, db), websocket)
        # 해당 방 전체에게 전적(사람) 목록 반환 응답
        await manager.broadcast_json("join", 'game_list', read_game(room.id, db), room.id)

        # 무한 루프를 돌면서 클라이언트에게 요청을 받고 처리하고 응답
        await after_join(websocket, person.id, room.id, db)

    except WebSocketDisconnect:
        manager.disconnect(websocket)

        # 접속이 끊긴 사람이 대기 방에 있었다면 자동으로 퇴장시킴
        crud.update_room_to_quit(db, room.id, person.id)
        await manager.broadcast_json("disconnected", "game_list", read_game(room.id, db), room.id) # disconnect`ed`
    except:
        if websocket.state == 1:
            # CONNECTED
            await manager.close(websocket)
        else:
            # DISCONNECTED or CONNECTING
            manager.disconnect(websocket)

        # 접속이 끊긴 사람이 대기 방에 있었다면 자동으로 퇴장시킴
        crud.update_room_to_quit(db, room.id, person.id)
        await manager.broadcast_json("disconnect", "game_list", read_game(room.id, db), room.id)   # disconnect

@app.get("/")
def read_root():
    # (디버깅 용도)
    return {"Hello": "World"}

@app.get("/connections")
def read_connections():
    # (디버깅 용도)
    ret = []
    for con in manager.active_connections:
        ret.append({'room_id': con[2], 'person_id': con[1]})
    return {"connections": ret}

@app.get("/room/list", response_model=List[schemas.Room])
def read_all_room(db: Session = Depends(get_db)):
    # 모든 방 목록 반환 (디버깅 용도)
    rooms = crud.get_rooms(db)
    return rooms

@app.get("/room", response_model=schemas.Room)
def read_or_create_wait_room(db: Session = Depends(get_db)):
    # 대기 중인 방이 있다면 그 방을 반환
    # 없다면 새 대기 방을 만들어 그 방을 반환 (디버깅 용도)
    room = crud.get_last_wait_room(db)
    return room

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
        'state': db_room.state,
        "time_offset" : to,
        "time_duration" : td,
        'init_time': it,
        'start_time': st,
        'end_time': et
    }

@app.get("/room/{room_id}/hand")
def read_all_hands(room_id: int, db: Session = Depends(get_db)):
    # 해당 방에서 사람들이 낸 손 목록 모두 반환 (마지막으로 낸 손이 [0]번째 인덱스)
    hands = crud.get_hands(db, room_id=room_id)
    ret = []
    for hand in hands:
        person = crud.get_person(db, person_id=hand.person_id)
        ret.append({
            'affiliation': person.affiliation,
            'name': person.name,
            'hand': hand.hand,
            'score': hand.score,
            'time': hand.time.astimezone(timezone('Asia/Seoul')).strftime("%Y-%m-%d %H:%M:%S.%f %Z"),
            'room_id': hand.room_id,
            #'person_id': hand.person_id
        })
    return ret

@app.get("/room/{room_id}/game")
def read_game(room_id: int, db: Session = Depends(get_db)):
    # 해당 방의 사람들의 {순위, 소속, 이름, 관리자 여부, 점수, win, draw, lose, 방 번호} 반환
    games = crud.get_games_in_room(db, room_id=room_id)
    # 점수가 같다면 이긴 횟수가 많을수록 높은 순위, 이긴 횟수도 같다면 비긴 횟수가 많을수록 높은 순위
    # (많이 낼수록 유리)
    games.sort(key=lambda e: (e.score, e.win, e.draw), reverse=True)
    ret = []
    for index, game in enumerate(games):
        person = crud.get_person(db, person_id=game.person_id)
        ret.append({
            'rank': index + 1, # 순위는 점수가 가장 높은 사람이 1
            'affiliation': person.affiliation,
            'name': person.name,
            'is_admin': person.is_admin,
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
    # 해당 방의 특정 사람의 {소속, 이름, 관리자 여부, 방 번호, 개인 번호} 반환
    game = crud.get_game(db, room_id=room_id, person_id=person_id)
    if game is None:
        return None
        #raise HTTPException(status_code=404, detail="Game not found")
    person = crud.get_person(db, person_id=person_id)
    if person is None:
        return None
        #raise HTTPException(status_code=404, detail="Person not found")
    return {
        'affiliation': person.affiliation,
        'name': person.name,
        'is_admin': person.is_admin,
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

@app.get("/person/find")
def read_person_with_affiliation_and_name(affiliation: str, name: str, \
    db: Session = Depends(get_db)):
    # (디버깅 용도)
    person = crud.get_person_by_affiliation_and_name(db, affiliation, name)
    return person

@app.get("/game/list")
def read_all_games(db: Session = Depends(get_db)):
    # (디버깅 용도)
    return crud.get_games(db)
"""

# 코루틴을 활용하여 방의 게임 시간을 관리
# 하나의 방이 Playing 상태로 바뀔 때(start 요청을 받을 때) asyncio task를 생성하여 예약한 시간만큼 기다린다.
# 입력을 받기 시작할 때 한 번 broadcast로 메시지를 보내고, 게임이 종료될 때 한 번 더 broadcast로 메시지를 보낸다.
# broadcast를 보내는 동안에는 함수를 blocking하지 않는다. 즉, broadcast 시간이 늦어져도 총 게임 시간에는 영향을 주지 않는다.
async def manage_time_for_room(room_id: int, time_offset: int, time_duration: int, db: Session = Depends(get_db)):
    if time_offset < 0:
        time_offset = 0
    if time_duration < 1:
        time_duration = 1

    init_data = {
        "room": read_room(room_id, db),
        "hand_list": read_all_hands(room_id, db),
        "game_list": read_game(room_id, db)
    }
    task1 = asyncio.create_task(manager.broadcast_json("start", "init_data", init_data, room_id))
    task2 = asyncio.create_task(asyncio.sleep(time_offset))
    await task1
    await task2
    
    crud.update_room_to_start(db, room_id)
    task1 = asyncio.create_task(manager.broadcast_json("start", "room_start", read_room(room_id, db), room_id))
    task2 = asyncio.create_task(asyncio.sleep(time_duration))
    await task1
    await task2

    crud.update_room_to_end(db, room_id)  # 백엔드 자체에서 시간으로 입력 가능 여부를 판단하면 안 되고, 함수를 호출한 순간 무조건 Ending 페이즈로 변경해야 한다.
    hand_data = {
        "hand_list": read_all_hands(room_id, db),
        "game_list": read_game(room_id, db)
    }
    await manager.broadcast_json("end", "hand_data", hand_data, room_id)
    await manager.close_with_room_id(room_id)

async def after_join(websocket: WebSocket, person_id: int, room_id: int, db: Session = Depends(get_db)):
    while True:
        # 클라이언트의 요청 대기
        try:
            data = await websocket.receive_json(mode=JSON_RECEIVING_MODE)
            request = data["request"]
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
        except:
            # TypeError의 경우 데이터 스키마가 변경된 경우에 발생하는 것으로 알려져 있음
            await ConnectionManager.send_text("", "error", "Internal server error", websocket)
            traceback.print_exc()
            print("Internal server error")
            raise

        if request == "hand":
            # 손 입력 요청
            # 해당 방에 새로운 손 추가
            _, error_code = crud.create_hand(db, room_id=room_id, person_id=person_id, hand=data["hand"])
            if error_code == 0:
                hand_data = {
                    "hand_list": read_all_hands(room_id, db),
                    "game_list": read_game(room_id, db)
                }
                await manager.broadcast_json("hand", "hand_data", hand_data, room_id)
            elif error_code == 1 or error_code == 11:
                await ConnectionManager.send_text("hand", "error", "Room is not in a play mode", websocket)
                #raise HTTPException(status_code=400, detail="Room is not in a play mode")
            elif error_code == 2 or error_code == 12:
                await ConnectionManager.send_text("hand", "error", "Game not started yet", websocket)
                #raise HTTPException(status_code=403, detail="Game not started yet")
            elif error_code == 3 or error_code == 13:
                await ConnectionManager.send_text("hand", "error", "Person not found", websocket)
                #raise HTTPException(status_code=404, detail="Person not found")
            elif error_code == 4:
                await ConnectionManager.send_text("hand", "error", "Initial hand not found", websocket)
                #raise HTTPException(status_code=500, detail="Initial hand not found")
            elif error_code == 5 or error_code == 15:
                await ConnectionManager.send_text("hand", "error", "Room not found", websocket)
                #raise HTTPException(status_code=404, detail="Room not found")
            elif error_code == 6 or error_code == 16:
                await ConnectionManager.send_text("hand", "error", "Game has ended", websocket)
                #raise HTTPException(status_code=403, detail="Game has ended")
                
        elif request == "quit":
            # 나가기 요청
            # 대기 중인 방일 경우에, 해당 방에 해당 사람이 있으면 제거
            _, error_code = crud.update_room_to_quit(db, room_id, person_id)
            if error_code == 0:
                await ConnectionManager.send_text("quit", "success", "Successfully signed out", websocket)
                await manager.close(websocket)
                await manager.broadcast_json("quit", "game_list", read_game(room_id, db), room_id)
                return
            elif error_code == 1:
                await ConnectionManager.send_text("quit", "error", "Room not found", websocket)
                #raise HTTPException(status_code=404, detail="Room not found")
            elif error_code == 2:
                await ConnectionManager.send_text("quit", "error", "Cannot quit from non-wait Room", websocket)
                #raise HTTPException(status_code=403, detail="Cannot quit from non-wait Room")
            elif error_code == 3:
                await ConnectionManager.send_text("quit", "error", "Person not found", websocket)
                #raise HTTPException(status_code=404, detail="Person not found")
            elif error_code == 4:
                await ConnectionManager.send_text("quit", "error", "Person does not exist in the Room", websocket)
                #raise HTTPException(status_code=404, detail="Person does not exist in the Room")
            
        elif request == "start":
            # 게임 시작 요청

            # 해당 방의 상태 변경
            # 시작 후 time_offset 초 후부터 time_duration 초 동안 손 입력을 받음
            room = read_room(room_id, db)
            if room is None:
                await ConnectionManager.send_text("start", "error", "Room not found", websocket)
                #raise HTTPException(status_code=404, detail="Room not found")
                continue

            # 관리자 권한이 있는 사람이 보낸 요청인지 확인
            db_person = crud.get_person(db, person_id)
            if db_person is None:
                await ConnectionManager.send_text("start", "error", "Person not found", websocket)
                continue
            elif not db_person.is_admin:
                await ConnectionManager.send_text("start", "error", "Forbidden", websocket)
                continue

            if room["state"] == schemas.RoomStateEnum.Wait:
                crud.update_room_to_play(db, room_id=room_id, \
                    time_offset=data["time_offset"], time_duration=data["time_duration"])

                # https://tech.buzzvil.com/blog/asyncio-no-1-coroutine-and-eventloop/
                asyncio.create_task(manage_time_for_room(room_id, time_offset=data["time_offset"], time_duration=data["time_duration"], db=db))
            else:
                await ConnectionManager.send_text("start", "error", "Room is not in a wait mode", websocket)

        else:
            # 오류 메시지 응답
            await ConnectionManager.send_text("", "error", "Bad request", websocket)