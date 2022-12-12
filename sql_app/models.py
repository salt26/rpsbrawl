from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Enum
from sqlalchemy.orm import relationship

from .database import Base
from enum import IntEnum

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

class HandEnum(IntEnum):
    Rock: 0
    Scissor: 1
    Paper: 2

class RoomStateEnum(IntEnum):
    Wait: 0
    Play: 1
    End: 2

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(Enum(RoomStateEnum), index=True)
    #num_of_persons = Column(Integer, ForeignKey("len(persons)"))
    start_time = Column(DateTime(timezone=True))

    persons = relationship("Game", back_populates="room")
    hands = relationship("Hand", back_populates="room")

class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, index=True)
    affiliation = Column(String, index=True)
    name = Column(String, index=True)
    is_admin = Column(Boolean, default=False)
    #hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    rooms = relationship("Game", back_populates="person")
    hands = relationship("Hand", back_populates="person")

class Game(Base):
    __tablename__ = "games"

    room_id = Column(Integer, ForeignKey("rooms.id"), primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("persons.id"), primary_key=True, index=True)
    id = Column(Integer, unique=True)
    win = Column(Integer, index=True)
    draw = Column(Integer, index=True)
    lose = Column(Integer, index=True)
    score = Column(Integer, index=True)
    rank = Column(Integer, index=True)

    room = relationship("Room")
    person = relationship("Person")
    hands = relationship("Hand", back_populates="game")
    
class Hand(Base):
    __tablename__ = "hands"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("persons.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    game_id = Column(Integer, ForeignKey("games.id"))
    time = Column(DateTime(timezone=True), index=True)
    hand: Column(Enum(HandEnum))
    score: Column(Integer, index=True)

    person = relationship("Person", back_populates="hands")
    room = relationship("Room", back_populates="hands")
    game = relationship("Game", back_populates="hands")