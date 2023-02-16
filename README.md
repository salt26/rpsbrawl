# Rock-Scissor-Paper Brawl
* 네트워크 가위바위보 난투
* 백엔드는 FastAPI로 구현
* 프론트엔드는 React로 구현

## Frontend
### How to run

#### Install
* React 사용
* `cd client`
* `npm install`
  * 잘 안 되면 `npm install --force`

#### Run
* `npm start`
  * 브라우저에서 `http://127.0.0.1:3000` 접속
* *유선 LAN을 사용하는 네트워크 환경에서는 다음 오류를 띄우며 실행이 되지 않을 수 있다.*
  * `Invalid options object. Dev Server has been initialized using an options object that does not match the API schema.`
  * ` - options.allowedHosts[0] should be a non-empty string.`
  * 이때는 Wi-Fi 또는 핫스팟을 사용하는 네트워크 환경에서 실행하면 잘 작동한다.

#### Game Start
* 대기 방에서 게임 시작 권한을 가지려면 아래 두 가지 과정을 거쳐야 한다.
  1. 입장 전 화면에서 개발자 도구(F12)를 열고 콘솔 탭에서 `localStorage.setItem('password', "unijam2023")` 명령을 실행한다.
  2. 소속을 "STAFF"로 설정하고 이름은 임의로 설정한 후 방에 입장한다.

## Backend
### How to run

#### Install
* Python 3.11.0 사용
  * 3.6 이상의 버전이면 작동
* Windows의 경우 터미널(PowerShell)을 관리자 권한으로 실행하고 아래 명령어 모두 입력
* `cd {root_of_this_repository}`
* `python -m venv sql_app`
* `./sql_app/Scripts/activate.ps1` (가상환경 실행)
* `pip install -r requirements.txt`

#### Run
* `cd {root_of_this_repository}`
* `./sql_app/Scripts/Activate.ps1` (가상환경 실행)
* `uvicorn sql_app.main:app --port 8000 --reload`
  * 배포할 때에는 `--reload` 옵션 없이 실행
  * 브라우저에서 `http://127.0.0.1:8000/docs` 접속

### API
* 목차
  * [signin](#로그인signin)
  * [refresh](#방-목록-새로고침refresh)
  * [join](#입장join)
  * [create](#생성create)
  * [setting](#방-설정-변경setting)
  * [team](#팀-변경team)
  * [quit](#퇴장quit)
  * [start](#게임-시작start)
  * [hand](#손-입력hand)
  * [end (응답만 존재)](#게임-종료end)
  * [signout](#로그아웃signout)
  * [disconnected (응답만 존재)](#연결-끊김disconnected)
  * [기타 오류 (응답만 존재)](#기타-오류)

#### 로그인(signin)

프론트엔드(JavaScript)의 로그인 전 화면에서 다음을 요청하여 로그인
```
let ws = new WebSocket("ws://localhost:8000/signin?name=" + "이름");  // 주소와 파라미터가 바뀌었음에 유의!!
```

signin error: `name`이 주어지지 않는 경우 다음 메시지 응답
```
{
  request: "signin",
  response: "error",
  type: "message",
  message: "Name is required"
}
```

signin error: 같은 이름의 사람이 이미 접속하여 어떤 대기 방 또는 플레이 중인 방에 입장해 있는 경우, 로그인이 제한되고 다음 메시지 응답
```
{
  request: "signin",
  response: "error",
  type: "message",
  message: "The same person has already entered in non-end room"
}
```

**signin success**: 로그인에 성공하였고 플레이 중인 방에 재접속하는 경우가 아닐 때 해당 개인에게 `data.person_id`와 방 목록이 포함된 다음 정보 응답
```
{
  request: "signin",
  response: "success",
  type: "profile_and_room_list",
  data: {
    name: "이름",
    person_id: 1,
    rooms: [
      {
        id: 1,
        state: 0,           // Wait
        time_offset: -1,
        time_duration: -1,
        init_time: "",
        start_time: "",
        end_time: "",
        name: "Welcome!",
        mode: 0,           // Normal
        has_password: True,
        bot_skilled: 2,
        bot_dumb: 3,
        max_persons: 30,
        num_persons: 9     // 봇 + 사람 인원
      },
      ...  // 대기 방 및 플레이 중인 방 개수만큼 존재. 항상 대기 방이 앞쪽 인덱스에 모여 있고 플레이 방이 뒤쪽 인덱스에 모여 있음.
    ]
  }
}
```

**signin reconnected**: 로그인에 성공하였고 해당 사람이 직전에 플레이 중인 방에서 연결이 끊겼다가 재접속하는 경우 해당 개인에게 다음의 정보 응답
```
{
  request: "signin",
  response: "reconnected",
  type: "recon_data",
  data: {
    name: "이름",
    person_id: 1,
    room: {
      id: 1,
      state: 1,                                     // Play
      time_offset : 5,                              // 이때는 항상 0 이상의 정수이지만 대기 방에서는 -1
      time_duration : 60,                           // 이때는 항상 1 이상의 정수이지만 대기 방에서는 -1
      init_time: "2022-12-25 03:24:00.388157 KST",  // 한국 시간 기준
      start_time: "2022-12-25 03:24:05.391465 KST", // 이 시간을 기준으로 남은 시간을 프론트엔드에서 표시하면 됨!
      end_time: "",                                 // 아직 빈 문자열로 반환
      name: "Welcome!",
      mode: 0,                                      // Normal
      has_password: True,                           // 비밀번호 유무에 관계 없이 바로 재접속 가능
      bot_skilled: 2,
      bot_dumb: 3,
      max_persons: 30,
      num_person: 9                                 // 봇 + 사람(접속 끊긴 사람 포함) 인원
    }, 
    hand_list: [
      ...,
      {
        name: "이름",
        hand: 0,    // 0(Rock) 또는 1(Scissor) 또는 2(Paper)
        score: -1,  // 1(이김) 또는 0(비김) 또는 -1(짐)
        time: "2022-12-25 03:24:42.610891 KST",
        room_id: 1
      }  // 해당 방에서 재접속하는 순간까지 입력된 손 개수만큼 존재, 가장 최근에 입력된 손이 마지막 인덱스
    ],
    game_list: [
      {
        rank: 1,  // 순위는 점수가 가장 높은 사람이 1, 목록은 순위 순으로 정렬
        team: 0,  // 0 이상 7 이하, 봇의 경우 -1
        name: "이름",
        is_admin: False,
        is_human: True,
        score: 13,
        win: 18,
        draw: 4,
        lose: 5,
        room_id: 1
      },
      ...  // 해당 방에서 플레이하는 사람 수만큼 존재
    ]
}
```

* 로그인 혹은 재접속에 성공하면 그 이후로 연결이 종료될 때까지 소켓 통신을 통해 실시간으로 다른 요청들을 보내고 응답을 받을 수 있다.
* 같은 이름의 사람이 대기 방 혹은 플레이 중인 방에 접속해 있으면 해당 이름으로는 로그인할 수 없다.
* 같은 이름의 사람이 방 목록 화면에 접속해 있으면 접속해 있던 사람의 접속을 끊고 같은 이름으로 새로 접속하게 된다.

---

#### 방 목록 새로고침(refresh)

프론트엔드에서 방 목록 화면에 있는 동안 다음을 요청하여 방 목록 정보를 새로 받음
```
let request = {
  request: "refresh"
};
ws.send(request);
```

**refresh success**: 새로고침 성공 시 대기 방 및 플레이 중인 방 목록이 포함된 다음 정보 응답
```
{
  request: "refresh",
  response: "success",
  type: "room_list",
  data: [
    {
      state: 0,                                     // Wait
      time_offset : -1,                             // 대기 방에서는 -1
      time_duration : -1,                           // 대기 방에서는 -1
      init_time: "",                                // 대기 방에서는 빈 문자열로 반환
      start_time: "",                               // 대기 방에서는 빈 문자열로 반환
      end_time: "",                                 // 대기 방에서는 빈 문자열로 반환
      name: "Welcome!",
      mode: 0,                                      // Normal
      has_password: True,
      bot_skilled: 2,
      bot_dumb: 3,
      max_persons: 30,
      num_person: 7                                 // 봇 + 사람(접속 끊긴 사람 포함) 인원
    },
    ...   // 대기 방과 플레이 중인 방 개수만큼 존재
  ]
}
```

---

#### 입장(join)

프론트엔드에서 방 목록 화면에 있는 동안 다음을 요청하여 선택한 방에 입장
```
let request = {
  request: "join",
  room_id: 1,       // 입장하려는 방의 번호
  password: null    // null 또는 문자열
};
ws.send(request);
```

* 방 비밀번호는 다음과 같이 처리한다.
  1. 사용자가 입장할 방 선택
  2. 프론트엔드에서 비밀번호가 포함되지 않은 정보로 방 입장 요청 (그 방이 비밀 방이더라도)
  3. 백엔드에서 해당 방의 최신 정보와 비교하여, 비밀번호가 필요 없는 방이면 입장 성공 응답, 비밀번호가 필요한 방이면 해당 방의 최신 정보와 함께 입장 실패 응답
  4. 프론트엔드에서 비밀번호 입력 창을 표시하고 사용자가 비밀번호 입력
  5. 프론트엔드에서 비밀번호가 포함된 정보로 방 입장 재요청
  6. 백엔드에서 해당 방의 최신 정보와 비교하여, 비밀번호가 필요 없는 방이거나 비밀번호가 필요한 방이지만 비밀번호가 같은 경우 입장 성공 응답, 비밀번호가 필요한 방이고 비밀번호가 틀린 경우 입장 실패 응답

join error: 입장하려는 대기 방이 대기 방이 아닌(아니게 된) 경우 다음 메시지 응답
```
{
  request: "join",
  response: "error",
  type: "message",
  message: "Cannot join in non-wait room"
}
```

join error: 해당 사람이 다른 대기 방 또는 플레이 방에 이미 입장해 있는 경우 다음 메시지 응답
```
{
  request: "join",
  response: "error",
  type: "message",
  message: "You are already in the other room"
}
```

join error: 다른 대기 방 또는 플레이 방에 같은 사람이 이미 입장해 있는 경우 다음 메시지 응답
```
{
  request: "join",
  response: "error",
  type: "message",
  message: "The same person has already entered in non-end room"
}
```

join error: 입장하려는 방의 인원(봇 포함)이 꽉 차 있는 경우 다음 메시지 응답
```
{
  request: "join",
  response: "error",
  type: "message",
  message: "Room is full"
}
```

join error: 해당 방에 비밀번호가 있고 이를 입력하지 않았거나 틀린 경우 해당 방의 최신 정보가 포함된 다음 메시지 응답
```
{
  request: "join",
  response: "error_refresh",
  type: "room",
  data: {
    state: 0,                                     // Wait
    time_offset : -1,                             // 대기 방에서는 -1
    time_duration : -1,                           // 대기 방에서는 -1
    init_time: "",                                // 대기 방에서는 빈 문자열로 반환
    start_time: "",                               // 대기 방에서는 빈 문자열로 반환
    end_time: "",                                 // 대기 방에서는 빈 문자열로 반환
    name: "Welcome!",
    mode: 0,                                      // Normal
    has_password: True,
    bot_skilled: 2,
    bot_dumb: 3,
    max_persons: 30,
    num_person: 7                                 // 봇 + 사람(접속 끊긴 사람 포함) 인원
  }
}
```

**join broadcast**: 누군가가 방에 입장 성공 시(본인 포함) 해당 방의 모든 사람들에게 방 정보 및 해당 방에 입장해 있는 사람들의 목록을 포함한 다음 정보 응답
```
{
  request: "join",
  response: "success",
  type: "join_data",
  data: {
    room: {
      id: 1,
      state: 0,                                     // Wait
      time_offset : -1,                             // 대기 방에서는 -1
      time_duration : -1,                           // 대기 방에서는 -1
      init_time: "",                                // 대기 방에서는 빈 문자열로 반환
      start_time: "",                               // 대기 방에서는 빈 문자열로 반환
      end_time: "",                                 // 대기 방에서는 빈 문자열로 반환
      name: "Welcome!",
      mode: 0,                                      // Normal
      has_password: True,
      bot_skilled: 2,
      bot_dumb: 3,
      max_persons: 30,
      num_person: 7                                 // 봇 + 사람(접속 끊긴 사람 포함) 인원
    },
    game_list: [
      {
        team: 1,        // 0 이상 7 이하, 해당 방에서 현재 가장 인원이 적은 팀 번호 부여
        name: "이름",
        is_host: False,
        is_human: True,
        ...             // 전적 정보가 담겨 있지만 게임 시작 전이라 무의미
      },
      ...
    ]
  }
}
```

* 사람들의 목록(game_list) 안에서 본인 정보는 name을 비교하여 직접 찾아야 함

---

#### 생성(create)

프론트엔드에서 방 목록 화면에 있는 동안 다음을 요청하여 새로운 방 생성
```
let request = {
  request: "create",
  room_name: "방 이름", // 이름은 다른 방과 겹쳐도 무관, 빈 문자열이 아니고 32글자 이내여야 함
  mode: 0,             // 0은 일반 모드, 1은 연속해서 같은 손을 입력할 수 없는 모드
  password: "비밀번호"  // 비밀번호가 없는 경우 ""(빈 문자열) 전송할 것, 20글자 이내여야 함
};
ws.send(request);
```

create error: 해당 사람이 다른 대기 방 또는 플레이 방에 이미 입장해 있는 경우 다음 메시지 응답
```
{
  request: "create",
  response: "error",
  type: "message",
  message: "You are already in the other room"
}
```

create error: 다른 대기 방 또는 플레이 방에 같은 사람이 이미 입장해 있는 경우 다음 메시지 응답
```
{
  request: "create",
  response: "error",
  type: "message",
  message: "The same person has already entered in non-end room"
}
```

create error: 일부 설정 값이 잘못된 경우 아래 메시지 응답
```
{
  request: "create",
  response: "error",
  type: "message",
  message: "Bad request"
}
```

* 잘못된 설정 변경 요청의 예
  * `name`이 `""`(빈 문자열)인 경우
  * `name`의 길이가 32를 초과하는 경우
  * `mode`가 0 또는 1이 아닌 경우
  * `password`의 길이가 20을 초과하는 경우

**create success**: 방 생성 시 개인에게 방 정보 및 해당 방에 입장해 있는 사람들의 목록(현재는 혼자)을 포함한 다음 정보 응답
```
{
  request: "create",
  response: "success",
  type: "join_data",
  data: {
    room: {
      id: 1,
      state: 0,                                     // Wait
      time_offset : -1,                             // 대기 방에서는 -1
      time_duration : -1,                           // 대기 방에서는 -1
      init_time: "",                                // 대기 방에서는 빈 문자열로 반환
      start_time: "",                               // 대기 방에서는 빈 문자열로 반환
      end_time: "",                                 // 대기 방에서는 빈 문자열로 반환
      name: "Welcome!",
      mode: 0,                                      // Normal
      has_password: True,
      bot_skilled: 0,
      bot_dumb: 0,
      max_persons: 30,
      num_person: 1                                 // 봇 + 사람(접속 끊긴 사람 포함) 인원
    },
    game_list: [
      {
        team: 0,        // 0 이상 7 이하, 해당 방에서 현재 가장 인원이 적은 팀 번호 부여
        name: "이름",
        is_host: True,
        is_human: True,
        ...             // 전적 정보가 담겨 있지만 게임 시작 전이라 무의미
      }
    ]
  }
}
```

---

#### 방 설정 변경(setting)

프론트엔드에서 대기 방 화면에 있는 동안 방장이 다음을 요청하여 방 설정 변경
```
let request = {
  request: "setting",
  name: "새 방 이름",        // 빈 문자열이 아니고 32글자 이내여야 함
  mode: 1,                  // 0은 일반 모드, 1은 연속해서 같은 손을 입력할 수 없는 모드
  password: "새 비밀번호",   // 비밀번호를 없애는 경우 ""(빈 문자열) 전송할 것, 20글자 이내여야 함
  bot_skilled: 1,           // 0 이상 10 이하
  bot_dumb: 1,              // 0 이상 10 이하
  max_persons: 25           // 30 이하, (모든 봇 수) + (현재 입장한 사람 수) <= max_persons
};
ws.send(request);
```

* 위의 예처럼 여러 설정을 동시에 변경할 수도 있고, 변경이 필요한 설정의 key-value만 넣어서 요청할 수도 있음
  * 위의 예는 변경 가능한 모든 설정을 보여줌
  * 다만 `request: "setting",`은 항상 필요함

설정의 일부만 변경하는 요청은 다음과 같다.
```
let request = {
  request: "setting",
  bot_skilled: 5,
  bot_dumb: 4,
};
ws.send(request);
```

setting error: 어떤 방에도 입장해 있지 않은 경우 다음 메시지 응답
```
{
  request: "setting",
  response: "error",
  type: "message",
  message: "You are not in any room"
}
```

setting error: 방장이 아닌 사람이 게임 시작 요청을 보낸 경우 아래 메시지 응답
```
{
  request: "setting",
  response: "error",
  type: "message",
  message: "Forbidden"
}
```

setting error: 이미 플레이 중인 방이거나 게임이 종료된 방에서 방 설정을 변경하려 하는 경우 아래 메시지 응답
```
{
  request: "setting",
  response: "error",
  type: "message",
  message: "Cannot change the settings of the non-wait room"
}
```

setting error: 일부 설정 값이 잘못된 경우 아래 메시지 응답
```
{
  request: "setting",
  response: "error",
  type: "message",
  message: "Bad request: name"  // ":" 뒤에 오는 문자열은 어떤 요청이 잘못되었는지 알려줌
}
```

* 잘못된 설정 변경 요청의 예
  * `name`이 `""`(빈 문자열)인 경우
  * `name`의 길이가 32를 초과하는 경우
  * `mode`가 0 또는 1이 아닌 경우
  * `password`의 길이가 20을 초과하는 경우
  * `bot_skilled` 또는 `bot_dumb` 각각이 음수이거나 10을 초과하는 경우
  * `max_persons`이 30을 초과하는 경우
  * `bot_skilled + bot_dumb + (현재 입장해 있는 사람 수) > max_persons`인 경우
* 한 번의 요청 안에 하나라도 잘못된 설정이 있으면 해당 요청 전체가 반영되지 않음

**setting broadcast**: 방 설정 변경 성공 시 해당 방에 입장해 있는 모든 사람들에게 방 정보가 담긴 아래의 정보 응답
```
{
  request: "setting",
  response: "broadcast",
  type: "room",
  data: {
    state: 0,                                     // Wait
    time_offset : -1,                             // 대기 방에서는 -1
    time_duration : -1,                           // 대기 방에서는 -1
    init_time: "",                                // 대기 방에서는 빈 문자열로 반환
    start_time: "",                               // 대기 방에서는 빈 문자열로 반환
    end_time: "",                                 // 대기 방에서는 빈 문자열로 반환
    name: "Welcome!",
    mode: 1,                                      // Limited
    has_password: True,
    bot_skilled: 5,
    bot_dumb: 4,
    max_persons: 30,
    num_person: 11                                // 봇 + 사람(접속 끊긴 사람 포함) 인원
  }
}
```

#### 팀 변경(team)

프론트엔드에서 대기 방 화면에 있는 동안 다음을 요청하여 자신의 팀 변경
```
let request = {
  request: "team",
  team: 7           // 0 이상 7 이하
};
ws.send(request);
```

team error: 어떤 방에도 입장해 있지 않은 경우 다음 메시지 응답
```
{
  request: "team",
  response: "error",
  type: "message",
  message: "You are not in any room"
}
```

team error: 이미 플레이 중인 방이거나 게임이 종료된 방에서 팀을 변경하려 하는 경우 아래 메시지 응답
```
{
  request: "team",
  response: "error",
  type: "message",
  message: "Cannot change the team in the non-wait room"
}
```

team error: `team` 값이 잘못된 경우 아래 메시지 응답
```
{
  request: "team",
  response: "error",
  type: "message",
  message: "Bad request"
}
```

**team broadcast**: 누군가가 팀 변경 성공 시(본인 포함) 해당 방의 모든 사람들에게 해당 방에 입장해 있는 사람들의 목록인 다음 정보 응답
```
{
  request: "team",
  response: "broadcast",
  type: "game_list",
  data: [
    {
      team: 7,        // 0 이상 7 이하, 봇의 경우 -1
      name: "이름",
      is_host: False,
      is_human: True,
      ...             // 전적 정보가 담겨 있지만 게임 시작 전이라 무의미
    },
    ...             // 해당 방에 입장해 있는 사람 수만큼 존재
  ]
}
```

* 목록 안에서 본인 정보는 name을 비교하여 직접 찾아야 함

---

#### 퇴장(quit)

프론트엔드에서 대기 방 화면에 있는 동안 다음을 요청하여 퇴장
```
let request = {
  request: "quit"
};
ws.send(request);
```

quit error: 어떤 방에도 입장해 있지 않은 경우 다음 메시지 응답
```
{
  request: "quit",
  response: "error",
  type: "message",
  message: "You are not in any room"
}
```

quit error: 이미 플레이 중이거나 게임이 종료된 방에서 나가려고 하는 경우 다음 메시지 응답
```
{
  request: "quit",
  response: "error",
  type: "message",
  message: "Cannot quit from non-wait Room"
}
```

**quit success**: 퇴장 성공 시 해당 개인에게 다음 메시지 응답
```
{
  request: "quit",
  response: "success",
  type: "message",
  message: "Successfully left the room"
}
```

**quit broadcast**: 퇴장 성공 시 해당 방에 남아있는 모든 사람들(퇴장한 본인 제외)에게 다음 정보 응답
```
{
  request: "quit",
  response: "broadcast",
  type: "game_list",
  data: [
    {
      team: 0,        // 0 이상 7 이하
      name: "이름",
      is_host: True,
      is_human: True,
      ...             // 전적 정보가 담겨 있지만 게임 시작 전이라 무의미
    },
    ...
  ]
}
```

* 만약 퇴장 후 해당 방에 사람이 아무도 남아있지 않게 되면 방이 제거됨
* 만약 퇴장하는 사람이 방장이었고 다른 사람이 해당 방에 남아있다면, 남은 사람 중 한 명이 방장이 됨

---

#### 게임 시작(start)

프론트엔드에서 방 화면에 있는 동안 방장이 다음을 요청하여 방 상태를 플레이 중인 방으로 변경
```
let request = {
  request: "start",
  time_offset: 5,  // seconds, 플레이 중인 방으로 전환 후 처음 손을 입력받기까지 기다리는 시간
  time_duration: 60  // seconds, 처음 손을 입력받기 시작한 후 손을 입력받는 시간대의 길이
};
ws.send(request);
```

start error: 어떤 방에도 입장해 있지 않은 경우 다음 메시지 응답
```
{
  request: "start",
  response: "error",
  type: "message",
  message: "You are not in any room"
}
```

start error: 방장이 아닌 사람이 게임 시작 요청을 보낸 경우 아래 메시지 응답
```
{
  request: "start",
  response: "error",
  type: "message",
  message: "Forbidden"
}
```

start error: 이미 플레이 중인 방이거나 게임이 종료된 방에서 게임을 시작하려 하는 경우 아래 메시지 응답
```
{
  request: "start",
  response: "error",
  type: "message",
  message: "Room is not in a wait mode"
}
```

**start broadcast**: 방이 성공적으로 플레이 중인 상태로 전환되면 해당 방에서 손 입력을 받기 시작하는 시간(`start_time`)과 손 입력이 종료되는 시간(`end_time`)이 포함된 `room`과, 첫 번째 랜덤 손이 포함된 손 목록(`hand_list`)과, 해당 방에서 플레이하게 되는 사람(전적) 목록(`game_list`)이 포함된 아래 정보 응답
```
{
  request: "start",
  response: "broadcast",
  type: "init_data",
  data: {
    room: {
      id: 1,
      state: 1,                                     // Play
      time_offset : 5,                              // 이때는 항상 0 이상의 정수이지만 대기 방에서는 -1
      time_duration : 60,                           // 이때는 항상 1 이상의 정수이지만 대기 방에서는 -1
      init_time: "2022-12-25 03:24:00.388157 KST",  // 한국 시간 기준
      start_time: "",                               // 아직 빈 문자열로 반환
      end_time: "",                                 // 아직 빈 문자열로 반환
      name: "Welcome!",
      mode: 0,                                      // Normal
      has_password: True,
      bot_skilled: 2,
      bot_dumb: 3,
      max_persons: 30,
      num_person: 9                                 // 봇 + 사람(접속 끊긴 사람 포함) 인원
    }, 
    hand_list: [
      {
        team: 0,
        name: "이름",         // 이 방에 입장한 첫 번째 사람 이름
        hand: 0,   // 0(Rock) 또는 1(Scissor) 또는 2(Paper) 중 랜덤으로 부여
        score: 0,  // 첫 번째 손이므로 항상 비긴(0) 것으로 취급
        time: "2022-12-25 03:24:00.388157 KST",
        room_id: 1
      }
    ],
    game_list: [
      {
        rank: 1,  // 초기 순위는 이 방에 입장한 첫 번째 사람이 1
        team: 0,
        name: "이름",
        is_host: False,
        is_human: True,
        score: 0,
        win: 0,
        draw: 0,
        lose: 0,
        room_id: 1
      },
      ...  // 해당 방에서 플레이하는 사람 수만큼 존재
    ]
}
```
* start_time: 실제로 손 입력을 받기 시작할 때(`message: "Game start"`라는 메시지를 서버가 응답할 때) 결정되므로 그 이후에 GET `/room/{room_id}` 하면 확인할 수 있음
* end_time: 실제로 게임이 종료될 때(`response: "end"`인 정보를 서버가 응답할 때) 결정되므로 그 이후에 GET `/room/{room_id}` 하면 확인할 수 있음
* 첫 번째 랜덤 손은 이 방에 입장한 첫 번째 사람 명의로 표시되지만, 이 사람의 전적(score, win, draw, lose)에는 영향을 주지 않는다.

**start broadcast**: 방이 성공적으로 플레이 중인 상태로 전환된 후에 `time_offset`초가 지나 손 입력을 받기 시작하는 순간이 되면 해당 방의 모든 사람들에게 백엔드 서버의 `start_time`이 포함된 아래 정보 응답
```
{
  request: "start",
  response: "broadcast",
  type: "room_start",
  data: {
    state: 1,                                     // Play
    time_offset : 5,
    time_duration : 60,
    init_time: "2022-12-25 03:24:00.388157 KST",  // 한국 시간 기준
    start_time: "2022-12-25 03:24:05.391465 KST", // 이 시간을 기준으로 남은 시간을 프론트엔드에서 표시하면 됨!
    end_time: "",                                 // 아직 빈 문자열로 반환
    name: "Welcome!",
    mode: 0,                                      // Normal
    has_password: True,
    bot_skilled: 2,
    bot_dumb: 3,
    max_persons: 30,
    num_person: 9                                 // 봇 + 사람(접속 끊긴 사람 포함) 인원
  }
}
```

---

#### 손 입력(hand)

프론트엔드에서 플레이 중인 방 화면에 있는 동안 다음을 요청하여 손 입력
```
let request = {
  request: "hand",
  hand: 0  // 0(Rock) 또는 1(Scissor) 또는 2(Paper)
};
ws.send(request);
```

hand error: 어떤 방에도 입장해 있지 않은 경우 다음 메시지 응답
```
{
  request: "hand",
  response: "error",
  type: "message",
  message: "You are not in any room"
}
```

hand error: 방이 플레이 중인 방이 아니라서 손 입력 실패 시 다음 메시지 응답
```
{
  request: "hand",
  response: "error",
  type: "message",
  message: "Room is not in a play mode"
}
```

hand error: 방이 플레이 중인 방이지만 손 입력을 받기 전의 시간이라서 손 입력 실패 시 다음 메시지 응답
```
{
  request: "hand",
  response: "error",
  type: "message",
  message: "Game not started yet"
}
```

hand error: 방이 플레이 중인 방이지만 손 입력 가능 시간이 초과되어 손 입력 실패 시 다음 메시지 응답
```
{
  request: "hand",
  response: "error",
  type: "message",
  message: "Game has ended"
}
```

hand error: 잘못된 손(0, 1, 2가 아닌 수)을 내거나 요청에 hand가 포함되어 있지 않은 경우 다음 메시지 응답
```
{
  request: "hand",
  response: "error",
  type: "message",
  message: "Bad request: hand"
}
```

**hand broadcast**: 손 입력 성공 시 해당 방의 모든 사람들에게 업데이트된 손 목록과 전적 정보 응답
```
{
  request: "hand",
  response: "broadcast",
  type: "hand_data",
  data: {
    hand_list: [
      ...,
      {
        team: 0,
        name: "이름",
        hand: 0,    // 0(Rock) 또는 1(Scissor) 또는 2(Paper)
        score: -1,  // 1(이김) 또는 0(비김) 또는 -1(짐)
        time: "2022-12-25 03:24:12.388157 KST",
        room_id: 1
      }  // 해당 방에서 입력된 손 개수만큼 존재
    ],
    game_list: [
      {
        rank: 1,  // 순위는 점수가 가장 높은 사람이 1, 목록은 순위 순으로 정렬
        team: 0,
        name: "이름",
        is_host: False,
        is_human: True,
        score: 13,
        win: 18,
        draw: 4,
        lose: 5,
        room_id: 1
      },
      ...  // 해당 방에서 플레이하는 사람 수만큼 존재
    ]
  }
}
```
* 가장 최근에 입력된 손이 목록의 마지막 인덱스에 위치한다.
* 점수(`score` = `win - lose`)가 같다면 `win` 수가 많을수록 순위가 높고, `win` 수도 같다면 `draw` 수가 많을수록 순위가 높다.
* 가장 순위가 높은 사람(1)이 목록의 인덱스 0번에 위치한다.
* 누군가가 손을 입력하면 모든 사람들에게 새로운 손 목록(hand_list)과 전적 목록(game_list)이 전송되므로 이를 바탕으로 화면을 표시하면 된다.

---

#### 게임 종료(end)

* **end broadcast**: 프론트엔드에서 요청하지 않아도, 플레이 중인 방에서 손 입력 시간이 종료되는 경우 서버에서 먼저 해당 방의 모든 사람들에게 다음의 손 목록 및 전적 정보 응답
```
{
  request: "end",
  response: "broadcast",
  type: "hand_data",
  data: {
    room: {
      state: 1,                                     // 아직 Play, 10초 뒤 End로 바뀔 예정
      time_offset : 5,
      time_duration : 60,
      init_time: "2022-12-25 03:24:00.388157 KST",
      start_time: "2022-12-25 03:24:05.391465 KST",
      end_time: "2022-12-25 03:25:05.400392 KST",   // 여기가 빈 문자열이 아니게 되면 더이상 손 입력을 받지 않음
      name: "Welcome!",
      mode: 0,                                      // Normal
      has_password: True,
      bot_skilled: 2,
      bot_dumb: 3,
      max_persons: 30,
      num_person: 9                                 // 봇 + 사람(접속 끊긴 사람 포함) 인원
    },
    hand_list: [
      ...,
      {
        team: 0,
        name: "이름",
        hand: 0,    // 0(Rock) 또는 1(Scissor) 또는 2(Paper)
        score: 1,   // 1(이김) 또는 0(비김) 또는 -1(짐)
        time: "2022-12-25 03:25:04.510891 KST",
        room_id: 1
      }  // 해당 방에서 입력된 손 개수만큼 존재
    ],
    game_list: [
      {
        rank: 1,  // 순위는 점수가 가장 높은 사람이 1, 목록은 순위 순으로 정렬
        team: 0,
        name: "이름",
        is_host: False,
        is_human: True,
        score: 17,
        win: 23,
        draw: 6,
        lose: 6,
        room_id: 1
      },
      ...  // 해당 방에서 플레이하는 사람 수만큼 존재
    ]
  }
}
```
* 가장 마지막에 입력된 손이 목록의 마지막 인덱스에 위치한다.
* 가장 순위가 높은 사람(1)이 목록의 인덱스 0번에 위치한다.
* 이 응답을 받은 이후에는 손 입력을 받지 않고, 해당 방에서의 게임이 종료된다.
* 프론트엔드에서는 이 응답을 받고 나서 결과 화면을 보여주고, 10초 카운트다운을 세면 된다. 나가기 기능은 여기서 제공하지 않는다.
* 결과 화면 표시 후 10초가 지나면 아래의 응답이 프론트엔드에 전송된다.

**end broadcast**: 기존 방에 있던 모든 사람들에게 새로운 방 정보 및 해당 방에 입장해 있는 사람들의 목록을 포함한 다음 정보 응답
```
{
  request: "end",
  response: "broadcast",
  type: "join_data",
  data: {
    room: {
      id: 4,
      state: 0,                                     // Wait
      time_offset : -1,                             // 대기 방에서는 -1
      time_duration : -1,                           // 대기 방에서는 -1
      init_time: "",                                // 대기 방에서는 빈 문자열로 반환
      start_time: "",                               // 대기 방에서는 빈 문자열로 반환
      end_time: "",                                 // 대기 방에서는 빈 문자열로 반환
      name: "Welcome!",
      mode: 0,                                      // Normal
      has_password: True,
      bot_skilled: 5,
      bot_dumb: 4,
      max_persons: 30,
      num_person: 13                                 // 봇 + 사람(접속 끊긴 사람 포함) 인원
    },
    game_list: [
      {
        team: 1,        // 0 이상 7 이하, 해당 방에서 현재 가장 인원이 적은 팀 번호 부여
        name: "이름",
        is_host: False,
        is_human: True,
        ...             // 전적 정보가 담겨 있지만 게임 시작 전이라 무의미
      },
      ...
    ]
  }
}
```

* 위 응답을 받으면 대기 방 화면으로 전환한다.
* 사람들의 목록(game_list) 안에서 본인 정보는 name을 비교하여 직접 찾아야 한다.

#### 로그아웃(signout)

프론트엔드에서 다음을 요청하여 접속 종료
```
let request = {
  request: "signout",
};
ws.send(request);
```

**signout success**: 성공적으로 로그아웃된 경우 다음 메시지 응답
```
{
  request: "signout",
  response: "success",
  type: "message",
  message: "Successfully signed out"
}
```

#### 연결 끊김(disconnected)
disconnected broadcast: 클라이언트에서 연결을 끊는 경우 해당 방에 남아있는 모든 사람들(연결이 끊긴 본인 제외)에게 다음 정보 응답
```
{
  request: "disconnected",
  response: "broadcast",
  type: "game_list",
  data: [
    {
      name: "이름",
      ...
    },
    ...
  ]
}
```
* 여기서 발생하는 응답의 `request`는 "disconnect`ed`"이다.

#### 기타 오류
error: JSON 형식이 아닌 데이터를 요청으로 주거나, 요청 데이터에 "request" 키가 없거나, "request" 키의 값이 `["hand", "quit", "start"]` 중에 없는 경우 다음 오류 메시지 응답
```
{
  request: "",
  response: "error",
  type: "message",
  message: "Bad request"
}
```
* 이 경우 연결은 유지되며 다시 새로운 요청을 보낼 수 있다.

error: 서버 DB의 스키마가 변경되었거나 요청을 받는 중 알 수 없는 원인으로 서버 오류가 발생하는 경우 다음 오류 메시지 응답
```
{
  request: "",
  response: "error",
  type: "message",
  message: "Internal server error"
}
```
* 이 경우 해당 개인의 연결이 즉시 끊어지며 바로 아래의 disconnect broadcast도 전송된다.

disconnect broadcast: 요청 데이터에 필요한 정보가 모두 들어있지 않거나(예: `request: "hand"`인데 "hand" 키의 값이 없는 경우) 요청을 처리하는 중 알 수 없는 원인으로 서버 오류가 발생하는 경우 서버에서 해당 개인과의 연결을 즉시 끊고 해당 방에 남아있는 모든 사람들(연결이 끊긴 본인 제외)에게 다음 정보 응답
```
{
  request: "disconnect",
  response: "broadcast",
  type: "game_list",
  data: [
    {
      team: 0,        // 0 이상 7 이하
      name: "이름",
      is_host: True,
      is_human: True,
      ...             // 전적 정보가 담겨 있지만 게임 시작 전이라 무의미
    },
    ...
  ]
}
```
* 여기서 발생하는 응답의 `request`는 "disconnect"이다.


### API test
* 백엔드 서버를 실행 중인 상황에서([Run](#run) 참조) 별도의 터미널을 켜고 아래 명령어 실행
* `cd {root_of_this_repository}`
* `./sql_app/Scripts/activate.ps1` (가상환경 실행)
* `python ./backend_websocket_test.py`

#### 현재 테스트한 항목
##### Test 1
* join을 통한 웹 소켓 연결: 성공
* quit 요청을 통해 대기 방에서 나가기: 성공
  
##### Test 2
* start 요청을 통해 대기 방에서 플레이 중인 방으로 전환하기: 성공
* start 직후에 hand 요청을 날리고 오류 메시지 받기: 성공
* start 후 3초 후에 손 입력을 받기 시작한다는 메시지 받기: 성공
* 손 입력을 받기 시작한 후 2초 후에 hand 요청을 날리고 반영된 결과 받기: 성공
* 손 입력을 받기 시작한 후 5초 후에 hand 요청을 날리고 반영된 결과 받기: 성공
* 손 입력을 받기 시작한 후 7초 후에 hand 요청을 날리고 반영된 결과 받기: 성공
* 손 입력을 받기 시작한 후 10초 후(게임이 종료될 시간)에 end 응답 받기: 성공
* 게임 종료 이후 손 입력을 요청하는 경우 이미 연결이 끊긴 상황이라 오류 발생: 확인
  
##### Test 3
* 요청 양식(JSON)에 맞지 않는 요청을 날리고 오류 메시지 받기: 성공
* 대기 방에서 quit 요청 없이 임의로 연결을 종료해도 이후에 같은 소속과 이름의 계정으로 새로운 방에 들어갈 수 있음: 확인
* 대기 방에서 start 요청을 `time_offset`과 `time_duration` 없이 날리고 서버에 의해 연결 끊기기: 성공
* 서버에 의해 연결이 끊겨도 이후에 같은 소속과 이름의 계정으로 새로운 방에 들어갈 수 있음: 확인

##### Test 4
* 관리자 권한이 없는 계정으로 입장한 후 start 요청을 날리고 "Forbidden" 오류 응답 받기: 성공

##### Test 5
* 손이 6번 이상 입력되었을 때, 게임 중에 손 입력 시 hand 응답으로 오는 hand_list에 마지막 6개의 손만 포함하기: 성공
* 게임 종료 시 end 응답으로 오는 hand_list에 모든 손 포함하기: 성공

#### 테스트하지 않은 항목
* 여러 명이 동시에 한 방에 들어가고 나가고 연결이 끊기는 상황
* 여러 방에서 동시에 게임이 돌아가는 상황 -> 당장은 고려하지 않을 것
* 플레이 중인 방에서 연결이 끊겼을 때 다시 입장하려는 상황 -> 아직 구현이 안 되어 있지만 기존의 방이 아직 플레이 중인 상태라면 그 방으로 재입장하도록 구현할 예정

#### 테스트 로그
* `cd {root_of_this_repository}`
* `./sql_app/Scripts/Activate.ps1` (가상환경 실행)
* `python ./backend_websocket_test.py`

```
----------------- Test 1: join and quit -----------------
@ send join
{'request': 'join', 'response': 'success', 'type': 'profile', 'data': {'affiliation': 'STAFF', 'name': 'test', 'is_admin': False, 'room_id': 25, 'person_id': 1}}
{'request': 'join', 'response': 'broadcast', 'type': 'game_list', 'data': [{'rank': 1, 'affiliation': 'STAFF', 'name': 'test', 'is_admin': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 25}]}
@@ send quit
{'request': 'quit', 'response': 'success', 'type': 'message', 'message': 'Successfully signed out'}

------------ Test 2: join and start and hand ------------
@ send join
{'request': 'join', 'response': 'success', 'type': 'profile', 'data': {'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'room_id': 25, 'person_id': 2}}
{'request': 'join', 'response': 'broadcast', 'type': 'game_list', 'data': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리 자', 'is_admin': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 25}]}
@@ send start 3 10
{'request': 'start', 'response': 'broadcast', 'type': 'init_data', 'data': {'room': {'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-01-05 17:50:10.599367 KST', 'start_time': '', 'end_time': ''}, 'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:10.599367 KST', 'room_id': 25}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 25}]}}
@@@ send hand 0 -> error response
{'request': 'hand', 'response': 'error', 'type': 'message', 'message': 'Game not started yet'}
@@@@ start response
{'request': 'start', 'response': 'broadcast', 'type': 'room_start', 'data': {'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-01-05 17:50:10.599367 KST', 'start_time': '2023-01-05 17:50:13.679368 KST', 'end_time': ''}}
@@@@@ send hand 0
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:10.599367 KST', 'room_id': 25}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:15.692800 KST', 'room_id': 25}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 25}]}}
@@@@@@ send hand 1 -> lose
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:10.599367 KST', 'room_id': 25}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:15.692800 KST', 'room_id': 25}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 1, 'score': -1, 'time': '2023-01-05 17:50:18.733531 KST', 'room_id': 25}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': -1, 'win': 0, 'draw': 1, 'lose': 1, 'room_id': 25}]}}
@@@@@@@ send hand 0 -> win
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:10.599367 KST', 'room_id': 25}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:15.692800 KST', 'room_id': 25}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 1, 'score': -1, 'time': '2023-01-05 17:50:18.733531 KST', 'room_id': 25}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 1, 'time': '2023-01-05 17:50:20.762751 KST', 'room_id': 25}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': 0, 'win': 1, 'draw': 1, 'lose': 1, 'room_id': 25}]}}
@@@@@@@@ end response
{'request': 'end', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:10.599367 KST', 'room_id': 25}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:15.692800 KST', 'room_id': 25}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 1, 'score': -1, 'time': '2023-01-05 17:50:18.733531 KST', 'room_id': 25}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 1, 'time': '2023-01-05 17:50:20.762751 KST', 'room_id': 25}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': 0, 'win': 1, 'draw': 1, 'lose': 1, 'room_id': 25}]}}
@@@@@@@@@ send hand 0 -> not connected

--------- Test 3: join and error and disconnect ---------
@ send join
{'request': 'join', 'response': 'success', 'type': 'profile', 'data': {'affiliation': 'STAFF', 'name': 'test_villain', 'is_admin': False, 'room_id': 26, 'person_id': 3}}
{'request': 'join', 'response': 'broadcast', 'type': 'game_list', 'data': [{'rank': 1, 'affiliation': 'STAFF', 'name': 'test_villain', 'is_admin': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 26}]}
@@ send plain text (not a JSON)
{'request': '', 'response': 'error', 'type': 'message', 'message': 'Bad request'}
@@@ disconnected (without sending quit)
@@@@ send join
{'request': 'join', 'response': 'success', 'type': 'profile', 'data': {'affiliation': 'STAFF', 'name': 'test_villain', 'is_admin': False, 'room_id': 26, 'person_id': 3}}
{'request': 'join', 'response': 'broadcast', 'type': 'game_list', 'data': [{'rank': 1, 'affiliation': 'STAFF', 'name': 'test_villain', 'is_admin': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 26}]}
@@@@@ send start (without required keyword arguments) -> disconnect
{'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': ''}
@@@@@@ send join
{'request': 'join', 'response': 'success', 'type': 'profile', 'data': {'affiliation': 'STAFF', 'name': 'test_villain', 'is_admin': False, 'room_id': 26, 'person_id': 3}}
{'request': 'join', 'response': 'broadcast', 'type': 'game_list', 'data': [{'rank': 1, 'affiliation': 'STAFF', 'name': 'test_villain', 'is_admin': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 26}]}
@@@@@@@ disconnected (without sending quit)

---------------- Test 4: forbidden start ----------------
@ send join
{'request': 'join', 'response': 'success', 'type': 'profile', 'data': {'affiliation': 'UPnL', 'name': '아무개', 'is_admin': False, 'room_id': 26, 'person_id': 4}}
{'request': 'join', 'response': 'broadcast', 'type': 'game_list', 'data': [{'rank': 1, 'affiliation': 'UPnL', 'name': '아무개', 'is_admin': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 26}]}
@@ send start 3 10
{'request': 'start', 'response': 'error', 'type': 'message', 'message': 'Forbidden'}
@@@ send quit
{'request': 'quit', 'response': 'success', 'type': 'message', 'message': 'Successfully signed out'}

------------------- Test 5: many hands ------------------
@ send join
{'request': 'join', 'response': 'success', 'type': 'profile', 'data': {'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'room_id': 26, 'person_id': 2}}
{'request': 'join', 'response': 'broadcast', 'type': 'game_list', 'data': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리 자', 'is_admin': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 26}]}
@@ send start 3 10
{'request': 'start', 'response': 'broadcast', 'type': 'init_data', 'data': {'room': {'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-01-05 17:50:23.974810 KST', 'start_time': '', 'end_time': ''}, 'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 2, 'score': 0, 'time': '2023-01-05 17:50:23.974810 KST', 'room_id': 26}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 26}]}}
@@@ start response
{'request': 'start', 'response': 'broadcast', 'type': 'room_start', 'data': {'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-01-05 17:50:23.974810 KST', 'start_time': '2023-01-05 17:50:26.975776 KST', 'end_time': ''}}
@@@@ send hand 0
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 2, 'score': 0, 'time': '2023-01-05 17:50:23.974810 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': -1, 'time': '2023-01-05 17:50:27.998423 KST', 'room_id': 26}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': -1, 'win': 0, 'draw': 0, 'lose': 1, 'room_id': 26}]}}
@@@@@ send hand 1 -> lose
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 2, 'score': 0, 'time': '2023-01-05 17:50:23.974810 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': -1, 'time': '2023-01-05 17:50:27.998423 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 1, 'score': -1, 'time': '2023-01-05 17:50:29.038681 KST', 'room_id': 26}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': -2, 'win': 0, 'draw': 0, 'lose': 2, 'room_id': 26}]}}
@@@@@@ send hand 0 -> win
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 2, 'score': 0, 'time': '2023-01-05 17:50:23.974810 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': -1, 'time': '2023-01-05 17:50:27.998423 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 1, 'score': -1, 'time': '2023-01-05 17:50:29.038681 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 1, 'time': '2023-01-05 17:50:30.071005 KST', 'room_id': 26}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': -1, 'win': 1, 'draw': 0, 'lose': 2, 'room_id': 26}]}}
@@@@@@@ send hand 0 -> draw
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 2, 'score': 0, 'time': '2023-01-05 17:50:23.974810 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': -1, 'time': '2023-01-05 17:50:27.998423 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 1, 'score': -1, 'time': '2023-01-05 17:50:29.038681 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 1, 'time': '2023-01-05 17:50:30.071005 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:31.114831 KST', 'room_id': 26}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': -1, 'win': 1, 'draw': 1, 'lose': 2, 'room_id': 26}]}}
@@@@@@@@ send hand 0 -> draw
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 2, 'score': 0, 'time': '2023-01-05 17:50:23.974810 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': -1, 'time': '2023-01-05 17:50:27.998423 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 1, 'score': -1, 'time': '2023-01-05 17:50:29.038681 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 1, 'time': '2023-01-05 17:50:30.071005 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:31.114831 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:32.155551 KST', 'room_id': 26}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': -1, 'win': 1, 'draw': 2, 'lose': 2, 'room_id': 26}]}}
@@@@@@@@@ send hand 0 -> draw
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': -1, 'time': '2023-01-05 17:50:27.998423 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 1, 'score': -1, 'time': '2023-01-05 17:50:29.038681 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 1, 'time': '2023-01-05 17:50:30.071005 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:31.114831 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:32.155551 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:33.191578 KST', 'room_id': 26}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': -1, 'win': 1, 'draw': 3, 'lose': 2, 'room_id': 26}]}}
@@@@@@@@@@ send hand 0 -> draw
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 1, 'score': -1, 'time': '2023-01-05 17:50:29.038681 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 1, 'time': '2023-01-05 17:50:30.071005 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:31.114831 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:32.155551 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:33.191578 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:34.223051 KST', 'room_id': 26}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': -1, 'win': 1, 'draw': 4, 'lose': 2, 'room_id': 26}]}}
@@@@@@@@@@@ send hand 0 -> draw
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 1, 'time': '2023-01-05 17:50:30.071005 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:31.114831 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:32.155551 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:33.191578 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:34.223051 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:35.298568 KST', 'room_id': 26}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': -1, 'win': 1, 'draw': 5, 'lose': 2, 'room_id': 26}]}}
@@@@@@@@@@@@ send hand 2 -> win
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:31.114831 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:32.155551 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:33.191578 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:34.223051 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:35.298568 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 2, 'score': 1, 'time': '2023-01-05 17:50:36.343538 KST', 'room_id': 26}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': 0, 'win': 2, 'draw': 5, 'lose': 2, 'room_id': 26}]}}
@@@@@@@@@@@@@ end response
{'request': 'end', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'affiliation': 'STAFF', 'name': '관 리자', 'hand': 2, 'score': 0, 'time': '2023-01-05 17:50:23.974810 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': -1, 'time': '2023-01-05 17:50:27.998423 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 1, 'score': -1, 'time': '2023-01-05 17:50:29.038681 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관리자', 'hand': 0, 'score': 1, 'time': '2023-01-05 17:50:30.071005 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:31.114831 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:32.155551 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:33.191578 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:34.223051 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 0, 'score': 0, 'time': '2023-01-05 17:50:35.298568 KST', 'room_id': 26}, {'affiliation': 'STAFF', 'name': '관 리자', 'hand': 2, 'score': 1, 'time': '2023-01-05 17:50:36.343538 KST', 'room_id': 26}], 'game_list': [{'rank': 1, 'affiliation': 'STAFF', 'name': '관리자', 'is_admin': True, 'score': 0, 'win': 2, 'draw': 5, 'lose': 2, 'room_id': 26}]}}
```