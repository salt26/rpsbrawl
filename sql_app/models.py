from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Enum, ForeignKeyConstraint
from sqlalchemy.orm import relationship

from .database import Base
#from enum import IntEnum
from .schemas import HandEnum, RoomStateEnum

import sys

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    items = relationship("Item", back_populates="owner")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="items")

"""
"""

# https://docs.sqlalchemy.org/en/20/orm/basic_relationships.html
# https://docs.sqlalchemy.org/en/20/core/type_basics.html#sqlalchemy.types.Enum
# https://stackoverflow.com/questions/70944716/pydantic-sqlalchemy-how-to-work-with-enums

"""
class HandEnum(IntEnum):
    rock = 0
    scissor = 1
    paper = 2

class RoomStateEnum(IntEnum):
    wait = 0
    play = 1
    end = 2
"""

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    state = Column(Enum(RoomStateEnum), default=RoomStateEnum.Wait)
    start_time = Column(DateTime(timezone=True), nullable=True)

    persons = relationship("Game", back_populates="room", cascade="all, delete-orphan")
    #hands = relationship("Hand", primaryjoin="Room.id == foreign(Hand.room_id)")

class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    affiliation = Column(String, index=True)
    name = Column(String, index=True)
    is_admin = Column(Boolean, default=False)
    #hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    rooms = relationship("Game", back_populates="person", cascade="all, delete-orphan")
    #hands = relationship("Hand", back_populates="person")

class Game(Base):
    # Room과 Person의 association object (https://docs.sqlalchemy.org/en/20/orm/basic_relationships.html#association-object)
    __tablename__ = "games"

    room_id = Column(Integer, ForeignKey("rooms.id"), primary_key=True)
    person_id = Column(Integer, ForeignKey("persons.id"), primary_key=True)
    win = Column(Integer, default=0)
    draw = Column(Integer, default=0)
    lose = Column(Integer, default=0)
    score = Column(Integer, default=0)
    rank = Column(Integer, default=sys.maxsize)

    room = relationship("Room", back_populates="persons")
    person = relationship("Person", back_populates="rooms")
    hands = relationship("Hand")
    
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
        #primaryjoin="and_(Game.room_id == foreign(Hand.room_id), Game.person_id == foreign(Hand.person_id))",
        foreign_keys=[room_id, person_id],
        viewonly=True
    )

    __table_args__ = (ForeignKeyConstraint([room_id, person_id], [Game.room_id, Game.person_id]),)