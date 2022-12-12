from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from . import models, schemas


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(email=user.email, hashed_password=fake_hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).offset(skip).limit(limit).all()


def create_user_item(db: Session, item: schemas.ItemCreate, user_id: int):
    db_item = models.Item(**item.dict(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

"""
"""

def hash_password(password: str):
    return password + "PleaseHashIt" # TODO

def is_admin(affiliation: str, name: str):
    admin_list = [("Staff", "관리자")]
    filtered = [item for item in admin_list if item[0] == affiliation and item[1] == name]
    return len(filtered) > 0

def hand_score(my_hand: schemas.HandEnum, prev_hand: schemas.HandEnum):
    if my_hand == prev_hand:
        # draw
        return 0
    elif (my_hand + 3 - prev_hand) % 3 == 2:
        # win
        return 1
    else:
        # lose
        return -1


def get_persons(db: Session):
    return db.query(models.Person).all()

def get_person(db: Session, person_id: int):
    return db.query(models.Person).filter(models.Person.id == person_id).first()

def get_person_by_affilation_and_name(db: Session, affiliation: str, name: str):
    return db.query(models.Person).filter(models.Person.affiliation == affiliation and \
        models.Person.name == name).first()

def create_person(db: Session, affiliation: str, name: str, \
    #hashed_password: str, 
    is_admin: bool = False):
    # 회원 가입
    db_person = models.Person(affiliation=affiliation, name=name, \
        #hashed_password=hash_password(hashed_password)
        )
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    return db_person

"""
def delete_person(db: Session, person: schemas.PersonCreate):
    # 회원 탈퇴 (아마 안 쓸 것)
    db_person = db.query(models.Person).filter(models.Person.affiliation == person.affiliation and \
        models.Person.name == person.name and models.Person.hashed_password == hash_password(person.password)).first()
    db.delete(db_person)
    db.commit()
    db.refresh(db_person)
    return db_person
"""

def get_rooms(db: Session):
    return db.query(models.Room).all()

def get_room(db: Session, room_id: int):
    return db.query(models.Room).filter(models.Room.id == room_id).first()

def get_last_wait_room(db: Session):
    # 마지막 대기 방 반환 (없으면 생성해서 반환)
    print(type(models.Room.state))
    db_room = db.query(models.Room).filter(models.Room.state is schemas.RoomStateEnum.Wait).all()
    if len(db_room) > 0:
        return db_room[-1]
    else:
        return create_room(db)

def create_room(db: Session):
    # 새 대기 방 생성 (이거 대신 get_last_wait_room()을 사용할 것)
    db_room = models.Room(state=schemas.RoomStateEnum.Wait)
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

def update_room_to_enter(db: Session, room_id: int, person_id: int):
    db_room = db.query(models.Room).filter(models.Room.id == room_id and models.Room.state is schemas.RoomStateEnum.Wait)
    db_person = db.query(models.Person).filter(models.Person.id == person_id).first()
    if db_person is None:
        return None
    db_room.update({
        "persons" : db_room.first().persons.append(db_person)
    })
    db.commit()
    db.refresh(db_room)
    return db_room

def update_room_to_quit(db: Session, room_id: int, person_id: int):
    db_room = db.query(models.Room).filter(models.Room.id == room_id and models.Room.state is schemas.RoomStateEnum.Wait)
    db_person = db.query(models.Person).filter(models.Person.id == person_id).first()
    if db_person is None:
        return None
    db_room.update({
        "persons" : db_room.first().persons.remove(db_person)
    })
    db.commit()
    db.refresh(db_room)
    return db_room

def update_room_to_play(db: Session, room_id: int):
    db_room = db.query(models.Room).filter(models.Room.id == room_id and models.Room.state is schemas.RoomStateEnum.Wait)
    db_room.update({
        "state" : schemas.RoomStateEnum.Play,
        "start_time" : datetime.now() + timedelta(seconds=5)
    })
    db.commit()
    db.refresh(db_room)
    return db_room

def update_room_to_end(db: Session, room_id: int):
    db_room = db.query(models.Room).filter(models.Room.id == room_id and models.Room.state is schemas.RoomStateEnum.Play)
    db_room.update({
        "state" : schemas.RoomStateEnum.End
    })
    db.commit()
    db.refresh(db_room)
    return db_room

def get_hands(db: Session, room_id: int):
    db_hands = db.query(models.Hand).filter(models.Hand.room_id == room_id).all()
    db_hands.sort(key=lambda e: e.time)
    return db_hands.reverse()
    # 가장 마지막의 손이 [0]번째 인덱스

def get_hands_from_last(db: Session, room_id: int, limit: int = 15):
    if limit <= 0:
        limit = 1
    db_hands = db.query(models.Hand).filter(models.Hand.room_id == room_id).all()
    db_hands.sort(key=lambda e: e.time)
    return db_hands[-limit:].reverse()
    # 가장 마지막의 손이 [0]번째 인덱스

def get_hands_by_person(db: Session, room_id: int, person_id: int):
    db_hands = db.query(models.Hand).filter(models.Hand.room_id == room_id and \
        models.Hand.person_id == person_id).all()
    return db_hands

def create_hand(db: Session, room_id: int, person_id: int, hand: schemas.HandEnum):
    # 시간 확인
    db_room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if db_room.state is not schemas.RoomStateEnum.Play or db_room.start_time > datetime.now():
        # 오류
        return None
    db_last_hand = get_hands_from_last(db, room_id, limit=1)
    score = hand_score(hand, db_last_hand.hand)
    db_hand = models.Hand(room_id=room_id, person_id=person_id, hand=hand, time=datetime.now(), score=score)
    db.add(db_hand)
    db.commit()
    db.refresh(db_hand)
    # 개인 점수 변경
    update_game(db, room_id=room_id, person_id=person_id, score=score)
    return db_hand

def get_game(db: Session, room_id: int, person_id: int):
    db_game = db.query(models.Game).filter(models.Game.room_id == room_id and \
        models.Game.person_id == person_id).first()
    return db_game

def create_game(db: Session, room_id: int, person_id: int):
    db_game = models.Game(room_id=room_id, person_id=person_id, score=0, \
        win=0, draw=0, lose=0, hands=[])
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game

def create_game_for_all(db: Session, room_id: int, person_ids: list):
    for p in person_ids:
        db_game = models.Game(room_id=room_id, person_id=p, score=0, \
            win=0, draw=0, lose=0, hands=[])
        db.add(db_game)
    db.commit()
    return

def update_game(db: Session, room_id: int, person_id: int, score: int):
    db_room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if db_room.state is not schemas.RoomStateEnum.Play or db_room.start_time > datetime.now():
        # 오류
        return None
    db_game = db.query(models.Game).filter(models.Game.room_id == room_id and \
        models.Game.person_id == person_id)
    if score == 0:
        # draw
        db_game.update({
            "draw": db_game.first().draw + 1
        })
    elif score == 1:
        # win
        db_game.update({
            "win": db_game.first().win + 1,
            "score": db_game.first().score + 1
        })
    elif score == -1:
        # lose
        db_game.update({
            "lose": db_game.first().lose + 1,
            "score": db_game.first().score - 1
        })
    db_game.commit()
    db.refresh(db_game.all())
    return db_game.all()