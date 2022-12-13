from sqlalchemy import and_, or_
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from . import models, schemas

from pydantic import parse_obj_as
import random


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

# 알려진 문제 목록 TODO
# * 상태가 Wait이 아닌 Play인 방에서 사람이 퇴장할 수 있음
# * (해결) Hand를 추가하거나 읽을 때 항상 null이 반환되고 아무것도 추가되지 않는 것으로 보임
# * 사람의 is_active가 false인 상태에서 다시 로그인을 하면(방에 입장하면) 같은 사람으로 로그인되어야 하는데 새로 생긴다. true인 상태에서 새로 로그인하면(방에 입장하면) 막혀야 하는데 역시 새로 생긴다.
# * 한 사람이 동시에 여러 방에 입장할 수 있다. (이미 입장한 방이 Play 모드로 바뀌고 새 방에 입장하는 경우)
# * 게임 시작 시 추가되는 첫 번째 Hand의 person_id가 1부터 시작한다 (조금 더 확인 필요)
# * 1분 시간 제한 넣기

def hash_password(password: str):
    return password + "PleaseHashIt" # TODO

def check_admin(affiliation: str, name: str):
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
    return parse_obj_as(schemas.List[schemas.Person], db.query(models.Person).all())

def get_person(db: Session, person_id: int):
    return schemas.Person.from_orm(db.query(models.Person).filter(models.Person.id == person_id).first())

def get_person_by_affilation_and_name(db: Session, affiliation: str, name: str):
    return schemas.Person.from_orm(db.query(models.Person).filter(and_(models.Person.affiliation == affiliation, \
        models.Person.name == name)).first())

def create_person(db: Session, affiliation: str, name: str, \
    #hashed_password: str, 
    ):
    # 회원 가입
    db_person = models.Person(affiliation=affiliation, name=name, \
        #hashed_password=hash_password(hashed_password),
        is_admin=check_admin(affiliation, name))
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    return schemas.Person.from_orm(db_person)

"""
def delete_person(db: Session, person: schemas.PersonCreate):
    # 회원 탈퇴 (아마 안 쓸 것)
    db_person = db.query(models.Person).filter(and_(models.Person.affiliation == person.affiliation, \
        models.Person.name == person.name, models.Person.hashed_password == hash_password(person.password))).first()
    db.delete(db_person)
    db.commit()
    db.refresh(db_person)
    return db_person
"""

def get_rooms(db: Session):
    return parse_obj_as(schemas.List[schemas.Room], db.query(models.Room).all())

def get_room(db: Session, room_id: int):
    db_room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if db_room is None:
        return None
    return schemas.Room.from_orm(db_room)

def get_last_wait_room(db: Session):
    # 마지막 대기 방 반환 (없으면 생성해서 반환)
    db_room = db.query(models.Room).filter(models.Room.state == schemas.RoomStateEnum.Wait).all()
    if len(db_room) > 0:
        return schemas.Room.from_orm(db_room[-1])
    else:
        return create_room(db)

def create_room(db: Session):
    # 새 대기 방 생성 (이거 대신 get_last_wait_room()을 사용할 것)
    db_room = models.Room(state=models.RoomStateEnum.Wait)
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return schemas.Room.from_orm(db_room)

def update_last_wait_room_to_enter(db: Session, person_id: int):
    # 마지막 대기 방에 사람 입장
    room_id = get_last_wait_room(db).id
    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    db_person = db.query(models.Person).filter(models.Person.id == person_id)
    if db_person.first() is None:
        return None
    db_game = models.Game(person=db_person.first(), room=db_room.first())
    db.add(db_game)
    db_room.first().persons.append(db_game)
    db_person.first().rooms.append(db_game)
    db_person.update({
        "is_active" : True
    })
    db.commit()
    db.refresh(db_game)
    db.refresh(db_person.first())
    db.refresh(db_room.first())
    return schemas.Room.from_orm(db_room.first())

"""
def update_room_to_enter(db: Session, room_id: int, person_id: int):
    # 해당 방에 사람 입장 (이거 대신 update_last_wait_room_to_enter()를 사용할 것)
    db_room = db.query(models.Room).filter(_and(models.Room.id == room_id, models.Room.state is schemas.RoomStateEnum.Wait))
    db_person = db.query(models.Person).filter(models.Person.id == person_id).first()
    if db_person is None:
        return None
    db_room.update({
        "persons" : db_room.first().persons.append(db_person)
    })
    db_person.update({
        "is_active" : True
    })
    db.commit()
    db.refresh(db_person)
    db.refresh(db_room)
    return db_room
"""

# https://stackoverflow.com/questions/9667138/how-to-update-sqlalchemy-row-entry

def update_room_to_quit(db: Session, room_id: int, person_id: int):
    # 해당 방에서 사람 퇴장(로그아웃)
    db_room = db.query(models.Room).filter(and_(models.Room.id == room_id, models.Room.state == schemas.RoomStateEnum.Wait))
    if db_room.first() is None:
        return None
    db_person = db.query(models.Person).filter(models.Person.id == person_id)
    if db_person.first() is None:
        return None
    db_game = db.query(models.Game).filter(and_(models.Game.room_id == room_id, models.Game.person_id == person_id))
    if db_game.first() is None:
        return None
    
    #db_room.first().persons.remove(db_game.first())
    #db_person.first().rooms.remove(db_game.first())
    db_person.update({
        "is_active" : False
    })
    db.delete(db_game.first())
    db.commit()
    db.refresh(db_person.first())
    db.refresh(db_room.first())
    return schemas.Room.from_orm(db_room.first())

def update_room_to_play(db: Session, room_id: int):
    # 게임 시작(사람 입장 불가, 시작 후 5초 이후부터 Hand 입력 가능)
    db_room = db.query(models.Room).filter(and_(models.Room.id == room_id, models.Room.state == schemas.RoomStateEnum.Wait))
    if db_room.first() is None:
        return None
    initial_hand = models.Hand(room_id=room_id, person_id=db_room.first().persons[0].person_id, hand=schemas.HandEnum(random.choice([0, 1, 2])), time=datetime.now(), score=0)
    db.add(initial_hand)
    db_room.update({
        "state" : schemas.RoomStateEnum.Play,
        "start_time" : datetime.now() + timedelta(seconds=5)
    })
    db.commit()
    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    db.refresh(db_room.first())
    return schemas.Room.from_orm(db_room.first())

def update_room_to_end(db: Session, room_id: int):
    # 게임 종료(Hand 입력 불가능)
    db_room = db.query(models.Room).filter(and_(models.Room.id == room_id, models.Room.state == schemas.RoomStateEnum.Play))
    db_room.update({
        "state" : schemas.RoomStateEnum.End
    })
    db.commit()
    db.refresh(db_room.first())
    return schemas.Room.from_orm(db_room.first())

def get_hands(db: Session, room_id: int):
    db_hands = db.query(models.Hand).filter(models.Hand.room_id == room_id).all()
    db_hands.sort(key=lambda e: e.time)
    return parse_obj_as(schemas.List[schemas.Hand], db_hands[::-1])
    # 가장 마지막의 손이 [0]번째 인덱스

def get_hands_from_last(db: Session, room_id: int, limit: int = 15):
    if limit <= 0:
        limit = 1
    db_hands = db.query(models.Hand).filter(models.Hand.room_id == room_id).all()
    print(len(db_hands))
    if len(db_hands) <= 0:
        return None
    db_hands.sort(key=lambda e: e.time)
    return parse_obj_as(schemas.List[schemas.Hand], db_hands[:-limit-1:-1])
    # 가장 마지막의 손이 [0]번째 인덱스

def get_hands_by_person(db: Session, room_id: int, person_id: int):
    db_hands = db.query(models.Hand).filter(and_(models.Hand.room_id == room_id, \
        models.Hand.person_id == person_id)).all()
    return parse_obj_as(schemas.List[schemas.Hand], db_hands)

def create_hand(db: Session, room_id: int, person_id: int, hand: schemas.HandEnum):
    # 시간 확인
    db_room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if db_room.state != schemas.RoomStateEnum.Play or db_room.start_time > datetime.now():
        # 오류
        return None
    db_last_hand = get_hands_from_last(db, room_id, limit=1)
    print(db_last_hand)
    if db_last_hand is None or len(db_last_hand) <= 0:
        return None
    score = hand_score(hand, db_last_hand[0].hand)
    db_hand = models.Hand(room_id=room_id, person_id=person_id, hand=hand, time=datetime.now(), score=score)
    db.add(db_hand)
    db.commit()
    db.refresh(db_hand)
    # 개인 점수 변경
    update_game(db, room_id=room_id, person_id=person_id, score=score)
    return schemas.Hand.from_orm(db_hand)

def get_game(db: Session, room_id: int, person_id: int):
    db_game = db.query(models.Game).filter(and_(models.Game.room_id == room_id, \
        models.Game.person_id == person_id)).first()
    return schemas.Game.from_orm(db_game)

def create_game(db: Session, room_id: int, person_id: int):
    db_game = models.Game(room_id=room_id, person_id=person_id, score=0, \
        win=0, draw=0, lose=0, hands=[])
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return schemas.Game.from_orm(db_game)

"""
def create_game_for_all(db: Session, room_id: int, person_ids: list):
    for p in person_ids:
        db_game = models.Game(room_id=room_id, person_id=p, score=0, \
            win=0, draw=0, lose=0, hands=[])
        db.add(db_game)
    db.commit()
    return
"""

def update_game(db: Session, room_id: int, person_id: int, score: int):
    db_room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if db_room.state != schemas.RoomStateEnum.Play or db_room.start_time > datetime.now():
        # 오류
        return None
    db_game = db.query(models.Game).filter(and_(models.Game.room_id == room_id, \
        models.Game.person_id == person_id))
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
    db.commit()
    db.refresh(db_game.first())
    return schemas.Game.from_orm(db_game.first())

def get_games(db: Session):
    db_game = db.query(models.Game).all()
    return db_game