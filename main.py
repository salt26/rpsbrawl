from typing import Union, Tuple
from datetime import datetime
from enum import IntEnum
from fastapi import FastAPI
from pydantic import BaseModel
from sql_app import schemas

app = FastAPI()



@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/room/list")
def read_room_list():
    # 모든 방 목록 반환
    pass

@app.get("/room")
def read_room():
    # 대기 중인 방이 있다면 그 방 번호를 반환
    # 없다면 새 대기 방을 만들어 그 방 번호를 반환
    pass

@app.put("/room/{room_id}")
def update_room(room_id: int, new_state: schemas.RoomStateEnum):
    # 해당 방의 상태 변경
    return {"new_state": new_state, "room_id": room_id}

@app.get("/room/{room_id}")
def read_persons(room_id: int, q: Union[str, None] = None):
    # 해당 방의 사람 목록 반환
    return {"room_id": room_id, "q": q}

@app.post("/room/{room_id}")
def add_person(room_id: int, affiliation: str, name: str, is_admin: bool = False):
    # 대기 중인 방일 경우에, Person 추가하고 해당 방의 인원 수 업데이트
    pass

@app.delete("/room/{room_id}")
def delete_person(room_id: int, affiliation: str, name: str):
    # 대기 중인 방일 경우에, 해당 방에 해당 사람이 있으면 제거하고 해당 방의 인원 수 업데이트
    pass

@app.get("/room/{room_id}/game")
def read_hands(room_id: int):
    # 해당 방에서 사람들이 낸 손 목록 반환
    pass

@app.post("/room/{room_id}/game")
def add_hand(room_id: int, affiliation: str, name: str, hand: schemas.HandEnum):
    # 해당 방에 새로운 손 추가
    pass