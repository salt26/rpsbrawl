from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Enum, ForeignKeyConstraint
from sqlalchemy.orm import relationship

from .database import Base
#from enum import IntEnum
from .schemas import HandEnum, RoomStateEnum


# https://docs.sqlalchemy.org/en/20/orm/basic_relationships.html
# https://docs.sqlalchemy.org/en/20/core/type_basics.html#sqlalchemy.types.Enum
# https://stackoverflow.com/questions/70944716/pydantic-sqlalchemy-how-to-work-with-enums

"""
class HandEnum(IntEnum):
    Rock = 0
    Scissor = 1
    Paper = 2

class RoomStateEnum(IntEnum):
    Wait = 0
    Play = 1
    End = 2
"""

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    state = Column(Enum(RoomStateEnum), default=RoomStateEnum.Wait)
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)

    persons = relationship("Game", back_populates="room", cascade="all, delete-orphan")

class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    affiliation = Column(String, index=True)
    name = Column(String, index=True)
    is_admin = Column(Boolean, default=False)
    #hashed_password = Column(String)
    is_active = Column(Boolean, default=False)

    rooms = relationship("Game", back_populates="person", cascade="all, delete-orphan")

class Game(Base):
    # Room과 Person의 association object (https://docs.sqlalchemy.org/en/20/orm/basic_relationships.html#association-object)
    # 각 방마다 입장한 사람 수에 맞추어 생성
    # 전적, 점수 등을 기록
    __tablename__ = "games"

    room_id = Column(Integer, ForeignKey("rooms.id"), primary_key=True)
    person_id = Column(Integer, ForeignKey("persons.id"), primary_key=True)
    win = Column(Integer, default=0)
    draw = Column(Integer, default=0)
    lose = Column(Integer, default=0)
    score = Column(Integer, default=0)

    room = relationship("Room", back_populates="persons")
    person = relationship("Person", back_populates="rooms")
    #hands = relationship("Hand")
    
# https://docs.sqlalchemy.org/en/20/orm/join_conditions.html#overlapping-foreign-keys

class Hand(Base):
    __tablename__ = "hands"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    room_id = Column(Integer, index=True)
    person_id = Column(Integer, index=True)
    time = Column(DateTime(timezone=True), index=True)
    hand = Column(Enum(HandEnum))
    score = Column(Integer)

    game = relationship("Game",
        foreign_keys=[room_id, person_id],
        viewonly=True
    )

    __table_args__ = (ForeignKeyConstraint([room_id, person_id], [Game.room_id, Game.person_id]),)