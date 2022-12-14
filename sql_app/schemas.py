from typing import List, Union
from datetime import datetime
from enum import IntEnum

from pydantic import BaseModel

class ItemBase(BaseModel):
    title: str
    description: Union[str, None] = None


class ItemCreate(ItemBase):
    pass


class Item(ItemBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    items: List[Item] = []

    class Config:
        orm_mode = True

"""
"""

class HandEnum(IntEnum):
    Rock = 0
    Scissor = 1
    Paper = 2

class RoomStateEnum(IntEnum):
    Wait = 0
    Play = 1
    End = 2

class HandBase(BaseModel):
    room_id: int
    person_id: int
    hand: HandEnum

class HandCreate(HandBase):
    pass

class Hand(HandBase):
    id: int
    time: datetime
    score: int

    class Config:
        orm_mode = True
        use_enum_values = True

class GameBase(BaseModel):
    person_id: int
    room_id: int

class GameCreate(GameBase):
    pass

class Game(GameBase):
    score: int
    win: int
    draw: int
    lose: int
    hands: List[Hand] = []

    class Config:
        orm_mode = True

class PersonBase(BaseModel):
    affiliation: str
    name: str
    is_admin: bool

class PersonCreate(PersonBase):
    #password: str
    pass

class Person(PersonBase):
    id: int
    is_active: bool
    rooms: List[Game] = []

    class Config:
        orm_mode = True

class RoomBase(BaseModel):
    state: RoomStateEnum = RoomStateEnum.Wait

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    id: int
    start_time: Union[datetime, None] = None
    persons: List[Game] = []
    #games: List[Game] = []

    class Config:
        orm_mode = True
        use_enum_values = True