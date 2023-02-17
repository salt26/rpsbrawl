from sqlalchemy import and_, or_
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from . import models, schemas

from pydantic import parse_obj_as
import random

# 팁:
# db.query().filter()는 lazy evaluation을 하기 때문에 이것을 변수로 선언해 두고
# 이것의 filter에 해당하는 조건 값을 다르게 업데이트한 후 이 변수를 다시 사용하면
# 이전의 데이터를 제대로 불러오지 못한다!
# 예:
# db_room = db.query(models.Room).filter(and_(models.Room.id == room_id, models.Room.state == schemas.RoomStateEnum.Wait))
# db_room.update({"state" : schemas.RoomStateEnum.Play})
# print(db_room.first())  # None 이 출력된다!

END_WAITING_TIME = 10

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

def get_person_by_name(db: Session, name: str):
    person = db.query(models.Person).filter(models.Person.name == name).first()
    if person is None:
        return None
    else:
        return schemas.Person.from_orm(person)

def create_person(db: Session, name: str):
    # 회원 가입
    person = models.Person(name=name, is_human=True)
    db.add(person)
    db.commit()
    db.refresh(person)
    return schemas.Person.from_orm(person)

def create_bot(db: Session, name_prefix: str):
    # 새로운 봇 생성
    # name_prefix는 대문자 한 글자 ("S": skilled, "D": dumb)
    bot = models.Person(name=name_prefix + "-" + str(datetime.now().timestamp()).replace('.', '-'), is_human=False)
    db.add(bot)
    db.commit()
    db.refresh(bot)
    return schemas.Person.from_orm(bot)

def check_person_playing(db: Session, person_id: int):
    update_expired_rooms_to_end(db)
    playing_rooms = db.query(models.Room).filter(models.Room.state == schemas.RoomStateEnum.Play).all()
    for room in playing_rooms:
        for game in room.persons:
            if game.person_id == person_id:
                return room.id
    return -1

def check_person_waiting_or_playing(db: Session, person_id: int):
    update_expired_rooms_to_end(db)
    waiting_or_playing_rooms = db.query(models.Room).filter(models.Room.state != schemas.RoomStateEnum.End).all()
    for room in waiting_or_playing_rooms:
        for game in room.persons:
            if game.person_id == person_id:
                return room.id
    return -1

"""
def delete_person(db: Session, person: schemas.PersonCreate):
    # 회원 탈퇴 (아마 안 쓸 것)
    person = db.query(models.Person).filter(and_(models.Person.affiliation == person.affiliation, \
        models.Person.name == person.name, models.Person.hashed_password == hash_password(person.password))).first()
    db.delete(person)
    db.commit()
    db.refresh(person)
    return person
"""

def get_rooms(db: Session):
    return parse_obj_as(schemas.List[schemas.Room], db.query(models.Room).all())

def get_room(db: Session, room_id: int):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        return None
    else:
        return schemas.Room.from_orm(room)

def get_non_end_rooms(db: Session):
    rooms = db.query(models.Room).filter(models.Room.state != schemas.RoomStateEnum.End).all()
    if rooms is None:
        return None
    else:
        return parse_obj_as(schemas.List[schemas.Room], rooms)

"""
def get_last_wait_room(db: Session):
    # 마지막 대기 방 반환 (없으면 생성해서 반환)
    rooms = db.query(models.Room).filter(models.Room.state == schemas.RoomStateEnum.Wait).all()
    if len(rooms) > 0:
        return schemas.Room.from_orm(rooms[-1])
    else:
        return create_room(db)
"""

def create_room_and_enter(db: Session, person_id: int, name: str, mode: schemas.RoomModeEnum, password: str or None = None):
    # 새 대기 방 생성 후 입장
    db_person = db.query(models.Person).filter(models.Person.id == person_id)
    if db_person.first() is None:
        return (None, 3)
        
    if check_person_waiting_or_playing(db, person_id) != -1:
        # 이 과정에서 게임 시간이 끝났지만 아직 Play 상태인 방들이 garbage collection된다.
        return (None, 5)

    if password is None or password == "":
        password = None
    if name is None or name == "" or len(name) > 32 or mode is None or (password is not None and len(password) > 20):
        return (None, 2)
    room = models.Room(state=models.RoomStateEnum.Wait, name=name, mode=mode, password=password)
    db.add(room)
    game = models.Game(person=db_person.first(), room=room, team=0, is_host=True)
    db.add(game)
    room.persons.append(game)
    db_person.first().rooms.append(game)
    db.commit()
    db.refresh(game)
    db.refresh(db_person.first())
    db.refresh(room)

    return (schemas.Room.from_orm(room), 0)

"""
def update_last_wait_room_to_enter(db: Session, person_id: int):
    # 마지막 대기 방에 사람 입장
    room_id = get_last_wait_room(db).id
    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    db_person = db.query(models.Person).filter(models.Person.id == person_id)
    if db_person.first() is None or db_person.first().is_active:
        return None
    game = models.Game(person=db_person.first(), room=db_room.first())
    db.add(game)
    db_room.first().persons.append(game)
    db_person.first().rooms.append(game)
    db_person.update({
        "is_active" : True
    })
    db.commit()
    db.refresh(game)
    db.refresh(db_person.first())
    db.refresh(db_room.first())
    return schemas.Room.from_orm(db_room.first())
"""

def update_room_to_enter(db: Session, room_id: int, person_id: int, password: str or None = None):
    # 해당 방에 사람 입장
    
    db_person = db.query(models.Person).filter(models.Person.id == person_id)
    if db_person.first() is None:
        return (None, 3)

    if check_person_waiting_or_playing(db, person_id) != -1:
        # 이 과정에서 게임 시간이 끝났지만 아직 Play 상태인 방들이 garbage collection된다.
        return (None, 5)

    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    if db_room.first() is None:
        return (None, 1)
    elif db_room.first().state != schemas.RoomStateEnum.Wait:
        return (None, 2)
    elif db_room.first().password is not None and db_room.first().password != password:
        return (None, 4)
    elif db_room.first().max_persons >= len(db_room.first().persons) + db_room.first().bot_skilled + db_room.first().bot_dumb:
        return (None, 6)
    
    # 팀 번호는 0 ~ 7 중 가장 인원이 적은 팀으로 배정
    games = get_games_in_room(db, room_id)
    teams = [0, 0, 0, 0, 0, 0, 0, 0]
    for g in games:
        if g.team >= 0 and g.team <= 7:
            teams[g.team] += 1
    f = lambda i: teams[i]
    game = models.Game(person=db_person.first(), room=db_room.first(), team=min(range(len(teams)), key=f), is_host=False)
    db.add(game)
    db_room.first().persons.append(game)
    db_person.first().rooms.append(game)
    db.commit()
    db.refresh(game)
    db.refresh(db_person.first())
    db.refresh(db_room.first())
    return (schemas.Room.from_orm(db_room.first()), 0)

def update_room_to_enter_bot(db: Session, room_id: int, bot_id: int):
    # 해당 방에 봇 입장
    
    db_person = db.query(models.Person).filter(models.Person.id == bot_id)
    if db_person.first() is None:
        return (None, 3)
    elif db_person.first().is_human:
        return (None, 2)

    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    if db_room.first() is None:
        return (None, 1)
    
    game = models.Game(person=db_person.first(), room=db_room.first(), team=-1, is_host=False)
    db.add(game)
    db_room.first().persons.append(game)
    db_person.first().rooms.append(game)
    db.commit()
    db.refresh(game)
    db.refresh(db_person.first())
    db.refresh(db_room.first())
    return (schemas.Room.from_orm(db_room.first()), 0)

# https://stackoverflow.com/questions/9667138/how-to-update-sqlalchemy-row-entry

def update_room_to_quit(db: Session, room_id: int, person_id: int):
    # 해당 방에서 사람 퇴장
    # 대기 방인 경우에만 퇴장 가능
    print("update room to quit (DEBUG)")
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

    games_human = get_games_in_room(db, room_id, only_human=True)
    was_host = False
    if len(games_human) <= 1:
        # 만약 퇴장 후 사람이 아무도 남지 않는 경우 방 제거
        print("delete room")
        db.delete(db_room.first())
        db.delete(db_game.first())
        db.commit()
        db.refresh(db_person.first())
        return (None, 0)
        
    elif db_game.first().is_host:
        # 만약 퇴장하는 사람이 방장일 경우, 해당 방에 남아있는 다른 사람 중 한 명을 방장으로 만듦
        was_host = True
        for next_host_id in [g.person_id for g in games_human if g.person_id != person_id][:1]:
            print("next_host_id: " + str(next_host_id))
            db_game2 = db.query(models.Game).filter(and_(models.Game.room_id == room_id, models.Game.person_id == next_host_id))
            db_game2.update({
                "is_host" : True
            })
    db.delete(db_game.first())
    db.commit()
    db.refresh(db_person.first())
    db.refresh(db_room.first())
    if was_host:
        db.refresh(db_game2.first())
        print("refresh next_host_id")
    return (schemas.Room.from_orm(db_room.first()), 0)

def update_room_setting(db: Session, room_id: int, name: str or None = None, mode: schemas.RoomModeEnum or None = None, \
    password: str or None = None, bot_skilled: int or None = None, bot_dumb: int or None = None, max_persons: int or None = None):
    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    if db_room.first() is None:
        return (None, 1)
    elif db_room.first().state != schemas.RoomStateEnum.Wait:
        return (None, 2)

    if name is not None:
        if name == "" or len(name) > 32:
            db.rollback()
            return (None, 3)
        else:
            db_room.update({
                "name": name
            })
    if mode is not None:
        db_room.update({
            "mode": mode
        })
    if password is not None:
        if len(password) > 20:
            db.rollback()
            return (None, 13)
        elif password == "":
            db_room.update({
                "password": None
            })
        else:
            db_room.update({
                "password": password
            })
    if max_persons is not None:
        if max_persons > 30:
            db.rollback()
            return (None, 23)
        else:
            db_room.update({
                "max_persons": max_persons
            })
    if bot_skilled is not None:
        if bot_skilled < 0 or bot_skilled > 10:
            db.rollback()
            return (None, 33)
        else:
            db_room.update({
                "bot_skilled": bot_skilled
            })
    if bot_dumb is not None:
        if bot_dumb < 0 or bot_dumb > 10:
            db.rollback()
            return (None, 43)
        else:
            db_room.update({
                "bot_dumb": bot_dumb
            })
            
    #print("db_room.first().bot_skilled + db_room.first().bot_dumb + len(db_room.first().persons) = " + str(db_room.first().bot_skilled + db_room.first().bot_dumb + len(db_room.first().persons)))
    #print("db_room.first().max_persons = " + str(db_room.first().max_persons))
    if db_room.first().bot_skilled + db_room.first().bot_dumb + len(db_room.first().persons) > db_room.first().max_persons:
        db.rollback()
        return (None, 53)

    db.commit()
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

def update_room_end_time(db: Session, room_id: int):
    # 게임 종료 (Hand 입력 불가능, 결과 창 표시)
    # 플레이 시간이 다 된 방에서 명시적으로 함수를 호출해 주어야 함
    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    if db_room.first() is None:
        #print("update_room_end_time failed: room not found")
        return None
    if not(db_room.first().end_time is None and db_room.first().state == schemas.RoomStateEnum.Play):
        #print("update_room_end_time failed: end_time is not None or not in play mode")
        return None
    db_room.update({
        "end_time" : datetime.now()
    })
    db.commit()
    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    db.refresh(db_room.first())
    return schemas.Room.from_orm(db_room.first())

def update_room_to_end(db: Session, room_id: int):
    # 게임 종료 (결과 창 표시 후 방 소멸)
    # 플레이 시간과 결과 창 표시 시간(END_WAITING_TIME)이 모두 다 된 방에서 명시적으로 함수를 호출해 주어야 함
    # 이 함수를 호출하기 전에 update_room_end_time()을 먼저 호출하고, 그로부터 END_WAITING_TIME이 지난 시각에 이 함수를 호출하기 바람
    db_room = db.query(models.Room).filter(and_(models.Room.id == room_id, models.Room.state == schemas.RoomStateEnum.Play))
    if db_room.first() is None:
        return None

    #db_persons = db.query(models.Person).filter(models.Person.id.in_(list(map(lambda p: p.person_id, db_room.first().persons))))

    db_room.update({
        "state" : schemas.RoomStateEnum.End,
    })
    db.commit()
    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    db.refresh(db_room.first())
    return schemas.Room.from_orm(db_room.first())

def update_expired_rooms_to_end(db: Session):
    playing_rooms = db.query(models.Room).filter(models.Room.state == schemas.RoomStateEnum.Play).all()
    for room in playing_rooms:
        #end_timedelta = END_WAITING_TIME + 5
        #start_timedelta = room.time_duration + END_WAITING_TIME + 5
        #init_timedelta = room.time_offset + room.time_duration + END_WAITING_TIME + 5
        if (room.end_time is not None and room.end_time + timedelta(seconds=END_WAITING_TIME + 5) < datetime.now()) or \
            (room.start_time is not None and room.time_duration is not None and room.start_time  + timedelta(seconds=room.time_duration + END_WAITING_TIME + 5) < datetime.now()) or \
            (room.init_time is not None and room.time_offset is not None and room.time_duration is not None and room.init_time + timedelta(seconds=room.time_offset + room.time_duration + END_WAITING_TIME + 5) < datetime.now()):
            update_room_to_end(db, room.id)  # 이렇게 garbage collection된 방은 모두 End 상태가 되지만 그 중 일부의 end_time이 None일 수 있음

def get_hands(db: Session, room_id: int):
    hands = db.query(models.Hand).filter(models.Hand.room_id == room_id).all()
    hands.sort(key=lambda e: e.time)
    return parse_obj_as(schemas.List[schemas.Hand], hands)
    # 가장 오래 전에 입력된 손이 [0]번째 인덱스

def get_hands_from_last(db: Session, room_id: int, limit: int = 6):
    if limit <= 0:
        limit = 1
    hands = db.query(models.Hand).filter(models.Hand.room_id == room_id).all()
    if len(hands) <= 0:
        return None
    hands.sort(key=lambda e: e.time)
    n = len(hands) - limit
    if n < 0:
        n = 0
    return parse_obj_as(schemas.List[schemas.Hand], hands[n:])

def get_hands_by_person(db: Session, room_id: int, person_id: int):
    hands = db.query(models.Hand).filter(and_(models.Hand.room_id == room_id, \
        models.Hand.person_id == person_id)).all()
    return parse_obj_as(schemas.List[schemas.Hand], hands)

def create_hand(db: Session, room_id: int, person_id: int, hand: schemas.HandEnum):
    # 시간 확인
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        # 오류
        return (None, 5)
    elif room.state != schemas.RoomStateEnum.Play:
        return (None, 1)
    elif room.start_time is None or room.start_time > datetime.now():
        return (None, 2)
    elif room.end_time is not None and room.end_time < datetime.now():
        return (None, 6)
    db_game = db.query(models.Game).filter(and_(models.Game.room_id == room_id, \
        models.Game.person_id == person_id))
    if db_game.first() is None:
        return (None, 3)

    hands = get_hands(db, room_id)
    if hands is None or len(hands) <= 0:
        return (None, 4)
    
    score = hand_score(hand, hands[-1].hand)
    hands = models.Hand(room_id=room_id, person_id=person_id, hand=hand, time=datetime.now(), score=score)
    db.add(hands)
    db.commit()
    db.refresh(hands)
    # 개인 점수 변경
    _, error_code = update_game(db, room_id=room_id, person_id=person_id, score=score)
    
    return (schemas.Hand.from_orm(hands), error_code)

def get_game(db: Session, room_id: int, person_id: int):
    game = db.query(models.Game).filter(and_(models.Game.room_id == room_id, \
        models.Game.person_id == person_id)).first()
    if game is None:
        return None
    else:
        return schemas.Game.from_orm(game)

"""
def create_game(db: Session, room_id: int, person_id: int):
    game = models.Game(room_id=room_id, person_id=person_id, score=0, \
        win=0, draw=0, lose=0, hands=[])
    db.add(game)
    db.commit()
    db.refresh(game)
    return schemas.Game.from_orm(game)
"""

"""
def create_game_for_all(db: Session, room_id: int, person_ids: list):
    for p in person_ids:
        game = models.Game(room_id=room_id, person_id=p, score=0, \
            win=0, draw=0, lose=0, hands=[])
        db.add(game)
    db.commit()
    return
"""

def update_game(db: Session, room_id: int, person_id: int, score: int):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if room is None:
        # 오류
        return (None, 15)
    elif room.state != schemas.RoomStateEnum.Play:
        # 오류
        return (None, 11)
    if room.start_time is None or room.start_time > datetime.now():
        return (None, 12)
    elif room.end_time is not None and room.end_time < datetime.now():
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

def update_game_for_team(db: Session, room_id: int, person_id: int, team: int):
    if team < 0 or team > 7:
        return (None, 4)

    db_room = db.query(models.Room).filter(models.Room.id == room_id)
    if db_room.first() is None:
        return (None, 1)
    elif db_room.first().state != schemas.RoomStateEnum.Wait:
        return (None, 2)
    db_game = db.query(models.Game).filter(and_(models.Game.room_id == room_id, \
        models.Game.person_id == person_id))
    if db_game.first() is None:
        return (None, 3)
        
    db_game.update({
        "team": team
    })
    db.commit()
    db.refresh(db_game.first())
    return (schemas.Game.from_orm(db_game.first()), 0)

def get_games(db: Session):
    games = db.query(models.Game).all()
    return parse_obj_as(schemas.List[schemas.Game], games)

def check_human_from_game(db: Session, game: models.Game):
    person = db.query(models.Person).filter(models.Person.id == game.person_id).first()
    if person is None:
        return False
    else:
        return person.is_human

def get_games_in_room(db: Session, room_id: int, only_human: bool):
    games = db.query(models.Game).filter(models.Game.room_id == room_id).all()
    if only_human:
        return parse_obj_as(schemas.List[schemas.Game], list(filter(lambda g: check_human_from_game(db, g), games)))
    else:
        return parse_obj_as(schemas.List[schemas.Game], games)

def get_expired_rooms(db: Session):
    room = db.query(models.Room).filter(and_(models.Room.state == schemas.RoomStateEnum.Play,
        models.Room.end_time < datetime.now())).all()
    return parse_obj_as(schemas.List[schemas.Room], room)

def get_bots(db: Session, name_prefix: str):
    bots = db.query(models.Person).filter(and_(not models.Person.is_human, models.Person.name.like(name_prefix + '-%'))).all()
    return parse_obj_as(schemas.List[schemas.Person], bots)