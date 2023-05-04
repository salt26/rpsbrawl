from typing import List, Union
from datetime import datetime
from enum import IntEnum

from pydantic import BaseModel

class HandEnum(IntEnum):
    Rock = 0
    Scissor = 1
    Paper = 2

class RoomStateEnum(IntEnum):
    Wait = 0
    Play = 1
    End = 2

class RoomModeEnum(IntEnum):
    Normal = 0
    Limited = 1

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
    team: int
    is_host: bool
    #hands: List[Hand] = []

    class Config:
        orm_mode = True

class PersonBase(BaseModel):
    #affiliation: str
    name: str
    #is_admin: bool
    is_human: bool

class PersonCreate(PersonBase):
    #password: str
    pass

class Person(PersonBase):
    id: int
    #is_active: bool
    last_activity: Union[datetime, None] = None
    rooms: List[Game] = []

    class Config:
        orm_mode = True

class RoomBase(BaseModel):
    state: RoomStateEnum = RoomStateEnum.Wait

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    id: int
    time_offset: Union[int, None] = None
    time_duration: Union[int, None] = None
    init_time: Union[datetime, None] = None
    start_time: Union[datetime, None] = None
    end_time: Union[datetime, None] = None
    name: str
    mode: RoomModeEnum = RoomModeEnum.Normal
    password: Union[str, None] = None
    bot_skilled: int = 0
    bot_dumb: int = 0
    max_persons: int = 30
    persons: List[Game] = []

    class Config:
        orm_mode = True
        use_enum_values = True

class TokenBase(BaseModel):
    access_token: str
    token_type: str

class TokenDataBase(BaseModel):
    username: str | None = None
    source_ip: str | None = None

class AuthBase(BaseModel):
    username: str

class AuthCreate(AuthBase):
    hashed_password: str