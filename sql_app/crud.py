from sqlalchemy import and_, or_
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from . import models, schemas

from pydantic import parse_obj_as
import random

# 알려진 문제 목록 TODO
# * (해결) 상태가 Wait이 아닌 Play인 방에서 사람이 퇴장할 수 있음
# * (해결) Hand를 추가하거나 읽을 때 항상 null이 반환되고 아무것도 추가되지 않는 것으로 보임
# * (해결) 사람의 is_active가 false인 상태에서 다시 로그인을 하면(방에 입장하면) 같은 사람으로 로그인되어야 하는데 새로 생긴다. true인 상태에서 새로 로그인하면(방에 입장하면) 막혀야 하는데 역시 새로 생긴다.
# * (해결) 한 사람이 동시에 여러 방에 입장할 수 있다. (이미 입장한 방이 Play 모드로 바뀌고 새 방에 입장하는 경우)
# * (무시) 게임 시작 시 추가되는 첫 번째 Hand의 person_id가 그 방에 입장한 가장 작은 person_id부터 시작한다
# * 시간 제한 넣기 -> 내부에서 Play 시간에만 손 입력을 받도록 했지만, 시간이 종료된 후에 직접 update_room_to_end()을 호출해 주어야 한다.
# * (해결) Add Hand에서 해당 방에 해당 사람이 없는 경우 오류 발생
# * (해결) 해당 방에 입장한 사람 수를 얻는 메서드 추가
# * (해결) 해당 방의 사람들의 순위를 반환하는 메서드 추가 -> 이건 key로 들고 있지 않도록 한다.
# * (무시) 해당 방의 특정 사람의 순위를 반환하는 메서드 추가?

# 로그인 상태의 사람은 Wait 또는 Play 방에 들어가 있는 사람을 말한다.
# 로그인과 회원가입을 하나로 통일해보자. 중복되는 계정이 있으면 로그인되고, 아니면 회원가입 후 로그인된다.

# 팁:
# db.query().filter()는 lazy evaluation을 하기 때문에 이것을 변수로 선언해 두고
# 이것의 filter에 해당하는 조건 값을 다르게 업데이트한 후 이 변수를 다시 사용하면
# 이전의 데이터를 제대로 불러오지 못한다!
# 예:
# db_room = db.query(models.Room).filter(and_(models.Room.id == room_id, models.Room.state == schemas.RoomStateEnum.Wait))
# db_room.update({"state" : schemas.RoomStateEnum.Play})
# print(db_room.first())  # None 이 출력된다!

def hash_password(password: str):
    return password + "PleaseHashIt" # TODO

def check_admin(affiliation: str, name: str = "관리자"):
    admin_list = [("STAFF", "관리자")]
    #filtered = [item for item in admin_list if item[0] == affiliation and item[1] == name]
    filtered = [item for item in admin_list if item[0] == affiliation]
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
    person = db.query(models.Person).filter(models.Person.id == person_id).first()
    if person is None:
        return None
    else:
        return schemas.Person.from_orm(person)

def get_person_by_affiliation_and_name(db: Session, affiliation: str, name: str):
    person = db.query(models.Person).filter(and_(models.Person.affiliation == affiliation, \
        models.Person.name == name)).first()
    if person is None:
        return None
    else:
        return schemas.Person.from_orm(person)

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
    else:
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
    if db_person.first() is None or db_person.first().is_active:
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
    # 대기 방인 경우에만 퇴장 가능
    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    if db_room.first() is None:
        return (None, 1)
    elif db_room.first().state != schemas.RoomStateEnum.Wait:
        return (None, 2)
    db_person = db.query(models.Person).filter(models.Person.id == person_id)
    if db_person.first() is None:
        return (None, 3)
    db_game = db.query(models.Game).filter(and_(models.Game.room_id == room_id, models.Game.person_id == person_id))
    if db_game.first() is None:
        return (None, 4)
    
    db_person.update({
        "is_active" : False
    })
    db.delete(db_game.first())
    db.commit()
    db.refresh(db_person.first())
    db.refresh(db_room.first())
    return (schemas.Room.from_orm(db_room.first()), 0)

def update_room_to_play(db: Session, room_id: int, time_offset: int = 5, time_duration: int = 60):
    # 게임 시작(사람 입장 불가, 시작 후 time_offset 초 이후부터 time_duration 초 동안 Hand 입력 가능)
    # 데이터베이스 상의 time_offset 및 time_duration은 정보를 저장하기 위한 용도이며, 실제 시간 관리에는 관여하지 않음
    # 즉, time_offset/time_duration으로 계산한 시간과 실제 게임 시작/종료 시간이 몇 초의 차이가 있을 수 있음
    if time_offset < 0:
        time_offset = 5
    if time_duration <= 0:
        time_duration = 60
    db_room = db.query(models.Room).filter(and_(models.Room.id == room_id, models.Room.state == schemas.RoomStateEnum.Wait))
    if db_room.first() is None:
        return None
    initial_hand = models.Hand(room_id=room_id, person_id=db_room.first().persons[0].person_id, hand=schemas.HandEnum(random.choice([0, 1, 2])), time=datetime.now(), score=0)
    db.add(initial_hand)
    db_room.update({
        "state" : schemas.RoomStateEnum.Play,
        "time_offset" : time_offset,
        "time_duration" : time_duration,
        "init_time" : datetime.now(),
    })
    db.commit()
    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    db.refresh(db_room.first())
    return schemas.Room.from_orm(db_room.first())

def update_room_to_start(db: Session, room_id: int):
    # 손 입력 받기 시작
    db_room = db.query(models.Room).filter(and_(models.Room.id == room_id, models.Room.state == schemas.RoomStateEnum.Play))
    if db_room.first() is None:
        return None
    db_room.update({
        "start_time" : datetime.now(),
    })
    db.commit()
    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    db.refresh(db_room.first())
    return schemas.Room.from_orm(db_room.first())

def update_room_to_end(db: Session, room_id: int):
    # 게임 종료 (Hand 입력 불가능)
    # 플레이 시간이 다 된 방에서 명시적으로 함수를 호출해 주어야 함
    db_room = db.query(models.Room).filter(and_(models.Room.id == room_id, models.Room.state == schemas.RoomStateEnum.Play))
    if db_room.first() is None:
        return None
    db_persons = db.query(models.Person).filter(models.Person.id.in_(list(map(lambda p: p.person_id, db_room.first().persons))))
    db_persons.update({
        "is_active" : False
    })
    db_room.update({
        "state" : schemas.RoomStateEnum.End,
        "end_time" : datetime.now()
    })
    db.commit()
    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    db.refresh(db_room.first())
    return schemas.Room.from_orm(db_room.first())

def get_hands(db: Session, room_id: int):
    db_hands = db.query(models.Hand).filter(models.Hand.room_id == room_id).all()
    db_hands.sort(key=lambda e: e.time)
    return parse_obj_as(schemas.List[schemas.Hand], db_hands)
    # 가장 오래 전에 입력된 손이 [0]번째 인덱스

def get_hands_by_person(db: Session, room_id: int, person_id: int):
    db_hands = db.query(models.Hand).filter(and_(models.Hand.room_id == room_id, \
        models.Hand.person_id == person_id)).all()
    return parse_obj_as(schemas.List[schemas.Hand], db_hands)

def create_hand(db: Session, room_id: int, person_id: int, hand: schemas.HandEnum):
    # 시간 확인
    db_room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if db_room is None:
        # 오류
        return (None, 5)
    elif db_room.state != schemas.RoomStateEnum.Play:
        return (None, 1)
    elif db_room.start_time is None or db_room.start_time > datetime.now():
        return (None, 2)
    elif db_room.end_time is not None and db_room.end_time < datetime.now():
        return (None, 6)
    db_game = db.query(models.Game).filter(and_(models.Game.room_id == room_id, \
        models.Game.person_id == person_id))
    if db_game.first() is None:
        return (None, 3)

    db_hand = get_hands(db, room_id)
    if db_hand is None or len(db_hand) <= 0:
        return (None, 4)
    
    score = hand_score(hand, db_hand[-1].hand)
    db_hand = models.Hand(room_id=room_id, person_id=person_id, hand=hand, time=datetime.now(), score=score)
    db.add(db_hand)
    db.commit()
    db.refresh(db_hand)
    # 개인 점수 변경
    _, error_code = update_game(db, room_id=room_id, person_id=person_id, score=score)
    
    return (schemas.Hand.from_orm(db_hand), error_code)

def get_game(db: Session, room_id: int, person_id: int):
    db_game = db.query(models.Game).filter(and_(models.Game.room_id == room_id, \
        models.Game.person_id == person_id)).first()
    if db_game is None:
        return None
    else:
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
    if db_room is None:
        # 오류
        return (None, 15)
    elif db_room.state != schemas.RoomStateEnum.Play:
        # 오류
        return (None, 11)
    if db_room.start_time is None or db_room.start_time > datetime.now():
        return (None, 12)
    elif db_room.end_time is not None and db_room.end_time < datetime.now():
        return (None, 16)
    db_game = db.query(models.Game).filter(and_(models.Game.room_id == room_id, \
        models.Game.person_id == person_id))
    if db_game.first() is None:
        return (None, 13)
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
    return (schemas.Game.from_orm(db_game.first()), 0)

def get_games(db: Session):
    db_game = db.query(models.Game).all()
    return parse_obj_as(schemas.List[schemas.Game], db_game)

def get_games_in_room(db: Session, room_id: int):
    db_game = db.query(models.Game).filter(models.Game.room_id == room_id).all()
    return parse_obj_as(schemas.List[schemas.Game], db_game)

def get_expired_rooms(db: Session):
    db_room = db.query(models.Room).filter(and_(models.Room.state == schemas.RoomStateEnum.Play,
        models.Room.end_time < datetime.now())).all()
    return parse_obj_as(schemas.List[schemas.Room], db_room)