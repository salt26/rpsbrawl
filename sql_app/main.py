from typing import List

from fastapi import Depends, FastAPI, HTTPException
#from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
#oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    # (디버깅 용도)
    return {"Hello": "World"}

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

@app.post("/room", response_model=schemas.Game)
def add_person_to_room(affiliation: str, name: str, db: Session = Depends(get_db)):
    # 회원가입, 로그인, 방 입장을 동시에 처리
    # 대기 중인 방일 경우에, Person 추가하고 해당 방의 인원 수 업데이트
    person = crud.get_person_by_affilation_and_name(db, affiliation=affiliation, name=name)
    if person is None:
        person = crud.create_person(db, affiliation=affiliation, name=name)
    try:
        room = crud.update_last_wait_room_to_enter(db, person.id)
    except Exception as e:
        if str(e.__cause__).find("UNIQUE constraint failed") != -1:
            raise HTTPException(status_code=400, detail="Person already exists in the Room")
        else:
            raise e
    if room is None:
        raise HTTPException(status_code=400, detail="Person has already entered in non-end Room")
    game = crud.get_game(db, room.id, person.id)

    return game

@app.get("/room/{room_id}")
def read_room(room_id: int, db: Session = Depends(get_db)):
    # 해당 방 반환
    db_room = crud.get_room(db, room_id)
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return db_room

@app.delete("/room/{room_id}")
def delete_person_from_room(room_id: int, person_id: int, db: Session = Depends(get_db)):
    # 대기 중인 방일 경우에, 해당 방에 해당 사람이 있으면 제거
    db_room = crud.update_room_to_quit(db, room_id, person_id)
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room or Person not found")
    
    return db_room

@app.get("/room/{room_id}/persons")
def read_number_of_persons(room_id: int, db: Session = Depends(get_db)):
    # 해당 방의 사람 수(int) 반환
    db_room = crud.get_room(db, room_id)
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return len(db_room.persons)

@app.put("/room/{room_id}/play")
def update_room_to_play(room_id: int, db: Session = Depends(get_db)):
    # 해당 방의 상태 변경
    # 시작 후 5초 후부터 손 입력을 받음
    db_room = crud.get_room(db, room_id)
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")

    if db_room.state == schemas.RoomStateEnum.Wait:
        room = crud.update_room_to_play(db, room_id)
    else:
        raise HTTPException(status_code=400, detail="Room is not in a wait mode")
    return room


@app.put("/room/{room_id}/end")
def update_room_to_end(room_id: int, db: Session = Depends(get_db)):
    # 해당 방의 상태 변경
    # 안에 있는 사람들은 로그아웃 상태(다른 방에 새로 입장할 수 있는 상태)가 됨
    db_room = crud.get_room(db, room_id)
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")

    if db_room.state == schemas.RoomStateEnum.Play:
        room = crud.update_room_to_end(db, room_id)
    else:
        raise HTTPException(status_code=400, detail="Room is not in a play mode")
    return room

@app.post("/room/{room_id}/hand")
def add_hand(room_id: int, person_id: int, hand: schemas.HandEnum, db: Session = Depends(get_db)):
    # 해당 방에 새로운 손 추가
    db_hand, error_code = crud.create_hand(db, room_id=room_id, person_id=person_id, hand=hand)
    if error_code == 0:
        return db_hand
    elif error_code == 1 or error_code == 11:
        raise HTTPException(status_code=400, detail="Room is not in a play mode")
    elif error_code == 2 or error_code == 12:
        raise HTTPException(status_code=403, detail="Game not started yet")
    elif error_code == 3 or error_code == 13:
        raise HTTPException(status_code=404, detail="Person not found")
    elif error_code == 4:
        raise HTTPException(status_code=500, detail="Initial hand not found")
    elif error_code == 5 or error_code == 15:
        raise HTTPException(status_code=404, detail="Room not found")

@app.get("/room/{room_id}/hand")
def read_hands(room_id: int, limit: int = 15, db: Session = Depends(get_db)):
    # 해당 방에서 사람들이 낸 손 목록 limit개 반환 (마지막으로 낸 손이 [0]번째 인덱스)
    hands = crud.get_hands_from_last(db, room_id=room_id, limit=limit)
    ret = []
    for hand in hands:
        person = crud.get_person(db, person_id=hand.person_id)
        ret.append({
            'affiliation': person.affiliation,
            'name': person.name,
            'hand': hand.hand,
            'score': hand.score,
            'time': hand.time,
            'room_id': hand.room_id,
            'person_id': hand.person_id
        })
    return ret

@app.get("/room/{room_id}/hand/list")
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
            'time': hand.time,
            'room_id': hand.room_id,
            'person_id': hand.person_id
        })
    return ret

@app.get("/room/{room_id}/game")
def read_game(room_id: int, db: Session = Depends(get_db)):
    # 해당 방의 사람들의 {순위, 소속, 이름, 점수, win, draw, lose} 반환
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
            'score': game.score,
            'win': game.win,
            'draw': game.draw,
            'lose': game.lose,
            'room_id': game.room_id,
            'person_id': game.person_id
        })
    return ret

"""
# route 없음
def add_person(affiliation: str, name: str, \
    # hashed_password: str,
    db: Session = Depends(get_db)):
    # 회원가입 겸 로그인: 가입한 사람 목록에 Person 추가
    person = crud.get_person_by_affilation_and_name(db, affiliation=affiliation, name=name)
    if person is None:
        person = crud.create_person(db, affiliation=affiliation, name=name, \
            #hashed_password=hashed_password,
        )
    return person

@app.get("/person/list")
def read_persons(db: Session = Depends(get_db)):
    # (디버깅 용도)
    return crud.get_persons(db)

@app.get("/person/find")
def read_person_with_affiliation_and_name(affiliation: str, name: str, \
    db: Session = Depends(get_db)):
    # (디버깅 용도)
    person = crud.get_person_by_affilation_and_name(db, affiliation, name)
    return person

@app.get("/game/list")
def read_all_games(db: Session = Depends(get_db)):
    # (디버깅 용도)
    return crud.get_games(db)
"""