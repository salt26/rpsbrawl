from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.post("/users/{user_id}/items/", response_model=schemas.Item)
def create_item_for_user(
    user_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db)
):
    return crud.create_user_item(db=db, item=item, user_id=user_id)


@app.get("/items/", response_model=List[schemas.Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = crud.get_items(db, skip=skip, limit=limit)
    return items

"""
"""

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/room", response_model=List[schemas.Room])
def read_room_list(db: Session = Depends(get_db)):
    # 모든 방 목록 반환
    rooms = crud.get_rooms(db)
    return rooms

@app.get("/room/{room_id}", response_model=schemas.Room)
def read_room(db: Session = Depends(get_db)):
    # 대기 중인 방이 있다면 그 방을 반환
    # 없다면 새 대기 방을 만들어 그 방을 반환
    room = crud.get_last_wait_room(db)
    return room

@app.put("/room/{room_id}", response_model=schemas.Room)
def update_room(room_id: int, db:Session = Depends(get_db)):
    # 해당 방의 상태 변경
    db_room = crud.get_room(db, room_id)
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")

    if db_room.state == schemas.RoomStateEnum.Wait:
        room = crud.update_room_to_play(db, room_id)
    elif db_room.state == schemas.RoomStateEnum.Play:
        room = crud.update_room_to_end(db, room_id)
    else:
        raise HTTPException(status_code=400, detail="Room is end")
    return room

@app.post("/room/{room_id}", response_model=schemas.Room)
def add_person_to_room(room_id: int, person_id: int, db: Session = Depends(get_db)):
    # 대기 중인 방일 경우에, Person 추가하고 해당 방의 인원 수 업데이트
    db_room = crud.update_room_to_enter(db, room_id, person_id)
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return db_room

@app.delete("/room/{room_id}", response_model=schemas.Room)
def delete_person_from_room(room_id: int, person_id: int, db: Session = Depends(get_db)):
    # 대기 중인 방일 경우에, 해당 방에 해당 사람이 있으면 제거하고 해당 방의 인원 수 업데이트
    db_room = crud.update_room_to_quit(db, room_id, person_id)
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return db_room

@app.get("/room/{room_id}/persons", response_model=List[schemas.Person])
def read_persons(room_id: int, db: Session = Depends(get_db)):
    # 해당 방의 사람 목록 반환
    db_room = crud.get_room(db, room_id)
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return db_room.persons

@app.get("/room/{room_id}/game", response_model=List[schemas.Hand])
def read_hands_15(room_id: int, db: Session = Depends(get_db)):
    # 해당 방에서 사람들이 낸 손 목록 15개 반환
    hands = crud.get_hands_from_last(db, room_id)
    return hands

@app.post("/room/{room_id}/game", response_model=schemas.Hand)
def add_hand(room_id: int, person_id: int, hand: schemas.HandEnum, db: Session = Depends(get_db)):
    # 해당 방에 새로운 손 추가
    db_hand = crud.create_hand(db, schemas.HandCreate(room_id=room_id, person_id=person_id, hand=hand))
    return db_hand

@app.post("/person/{person_id}")
def add_person(person_id: int, affiliation: str, name: str, \
    # hashed_password: str,
    is_admin: bool = False, db: Session = Depends(get_db)):
    # 가입한 사람 목록에 Person 추가
    person = crud.create_person(db, affiliation=affiliation, name=name, \
        #hashed_password=hashed_password,
        is_admin=is_admin)
    return person