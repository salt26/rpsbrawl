from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship

from .database import Base


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

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(Integer, index=True)
    num_of_persons = Column(Integer, ForeignKey("len(persons)"))
    start_time = Column(DateTime(timezone=True))

    persons = relationship("Person", back_populates="persons")
    games = relationship("Game", back_populates="games")

class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, index=True)
    affiliation = Column(String, index=True)
    name = Column(String, index=True)
    is_admin = Column(Boolean, default=False)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class Hand(Base):
    __tablename__ = "hands"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("persons.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    time = Column(DateTime(timezone=True), index=True)
    hand: Column(Integer)
    score: Column(Integer, index=True)

    person = relationship("Person", back_populates="persons")
    room = relationship("Room", back_populates="rooms")

class Game(Base):
    __tablename__ = "games"

    person_id = Column(Integer, ForeignKey("persons.id"), primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), primary_key=True, index=True)
    win = Column(Integer, index=True)
    draw = Column(Integer, index=True)
    lose = Column(Integer, index=True)
    score = Column(Integer, index=True)
    rank = Column(Integer, index=True)

    person = relationship("Person", back_populates="persons")
    room = relationship("Room", back_populates="rooms")
    hand = relationship("Hand", back_populates="hands")