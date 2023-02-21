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
        team: 0,
        name: "이름",
        is_human: True,
        hand: 0,    // 0(Rock) 또는 1(Scissor) 또는 2(Paper)
        score: -1,  // 1(이김) 또는 0(비김) 또는 -1(짐)
        time: "2022-12-25 03:24:42.610891 KST",
        room_id: 1
      }  // 해당 방에서 재접속하는 순간까지 입력된 손 개수만큼 존재, 가장 최근에 입력된 손이 마지막 인덱스
    ],
    game_list: [
      {
        rank: 1,  // 순위는 점수가 가장 높은 사람이 1, 목록은 순위 순으로 정렬
        team: 0,  // 0 이상 6 이하, 봇의 경우 -1
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
  password: ""      // 문자열 (빈 문자열을 보내면 비밀번호가 없는 방에 입장 가능)
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
  message: "You are already in a room"
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
        team: 1,        // 0 이상 6 이하, 해당 방에서 현재 가장 인원이 적은 팀 번호 부여
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
  message: "You are already in a room"
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
        team: 0,        // 0 이상 6 이하, 해당 방에서 현재 가장 인원이 적은 팀 번호 부여
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
  team: 6           // 0 이상 6 이하
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
      team: 6,        // 0 이상 6 이하, 봇의 경우 -1
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
      team: 0,        // 0 이상 6 이하
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
        is_human: True,
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

hand error: limited 모드에서 같은 손을 두 번 이상 연달아 내려는 경우 다음 메시지 응답
```
{
  request: "hand",
  response: "error",
  type: "message",
  message: "Cannot play the same hand in a row (limited mode)"
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
        is_human: True,
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
    ],
    last_hand: {
      1: [0, -1],   // person_id: [hand, score_gain]
      2: [1, 1],    // hand는 마지막에 낸 손 번호(-1, 0, 1, 2 중 하나)
      3: [0, 0],    // score_gain은 마지막에 낸 손으로 인해 변화한 점수(-1, 0, 1 중 하나)
      4: [-1, 0],   // 이번 게임에서 손을 낸 적이 없으면 hand가 -1, score_gain이 0
      6: [-1, 0],
      ...     // 해당 방에서 플레이하는 사람 수만큼 존재, 봇도 포함
    }
  }
}
```
* 가장 최근에 입력된 손이 목록의 마지막 인덱스에 위치한다.
* 점수(`score` = `win - lose`)가 같다면 `win` 수가 많을수록 순위가 높고, `win` 수도 같다면 `draw` 수가 많을수록 순위가 높다.
* 가장 순위가 높은 사람(1)이 목록의 인덱스 0번에 위치한다.
* 누군가가 손을 입력하면 모든 사람들에게 새로운 손 목록(hand_list)과 전적 목록(game_list)과 각 사람의 마지막 손(last_hand)이 전송되므로 이를 바탕으로 화면을 표시하면 된다.

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
        is_human: True,
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
        team: 1,        // 0 이상 6 이하, 해당 방에서 현재 가장 인원이 적은 팀 번호 부여
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
      team: 0,        // 0 이상 6 이하
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
* 터미널을 켜고 아래 명령어 실행
  * 백엔드 서버를 따로 실행하지 않아도 동작함
* `cd {root_of_this_repository}`
* `./sql_app/Scripts/activate.ps1` (가상환경 실행)
* `python ./backend_websocket_test.py`

#### 현재 테스트한 항목
##### Test 1: 로그인, 로그아웃
* signin을 통한 웹 소켓 연결: 성공
* signout 요청을 통해 연결 끊기: 성공
  
##### Test 2: 방 생성, 퇴장
* create로 새 방 만들기: 성공
* quit으로 방에서 나오기: 성공
  * 방에서 마지막 사람이 나오면 방이 제거됨: 확인
* 잘못된 create 요청 날리고 오류 메시지 받기: 성공
* mode와 password 없이 create 요청 날려서 새 방 만들기: 성공
  
##### Test 3: 방 설정 변경, 팀 변경
* 방장이 되어 setting으로 모든 설정을 한 번에 변경하기: 성공
* setting으로 일부 설정만 변경하기: 성공
* 잘못된 setting 요청 날리고 오류 메시지 받기: 성공
  * 봇을 포함한 현재 입장 인원에 따라, 봇 수 또는 최대 인원 수를 잘못 변경할 때 오류 메시지 받기: 확인
  * 둘 이상의 설정을 변경하려다가 그 중 하나에서 잘못된 값이 확인되는 경우 하나도 변경하지 않고(롤백하고) 오류 메시지 받기: 확인
* team으로 팀 변경하기: 성공
* 방에서 퇴장하지 않고 바로 signout하기: 성공
  * 이때 quit 절차가 실행되면서 사람 없는 방이 제거됨: 확인

##### Test 4: 일반 모드로 게임 시작, 손 입력, 게임 종료
* refresh로 방 목록 새로고침: 성공
* 방장이 되어 start로 게임 시작: 성공
* 손 입력 받기 전에 hand 요청 날리고 오류 메시지 받기: 성공
* 손 입력 받기 시작한다는 응답 받기: 성공
* 손 입력을 받는 동안 hand 요청: 성공
* 잘못된 hand 요청 날리고 오류 메시지 받기: 성공
* 손 입력 종료될 때 end 응답 받기: 성공
* 손 입력 종료 후 hand 요청 날리고 오류 메시지 받기: 성공
* 손 입력 종료되고 10초 후에 새로운 방에 재입장된 다음 end 응답 받기: 성공
  * 기존의 방 설정이 그대로 유지됨: 확인

##### Test 5: 방 설정 변경, 많은 손 입력
* 손이 6번 이상 입력되었을 때, 게임 중에 손 입력 시 hand 응답으로 오는 hand_list에 마지막 6개의 손만 포함하기: 성공
* 게임 종료 시 end 응답으로 오는 hand_list에 모든 손 포함하기: 성공
  * 점수도 잘 반영되어 있음: 확인
* 두 번째 end 응답 받고 재입장 후에 team으로 팀 변경: 성공
* 두 번째 end 응답 받고 재입장 후에 setting으로 방 설정 변경: 성공

##### Test 6: 오류, 접속 끊김, 재접속
* name을 빈 문자열로 해서 signin 요청 날리고 오류 메시지 받기: 성공
* 방 목록 화면(방에 입장하지 않은 상태)에서 setting, team, quit, start, hand 요청 날리고 오류 메시지 받기: 성공
* 대기 방에 입장한 상태에서 create, join 요청 날리고 오류 메시지 받기: 성공
* start로 게임 시작 후 손 입력을 받기 전에 접속을 끊었다가 signin으로 재접속: 성공
  * 재접속 시 이전에는 게임이 진행되지 않고 멈추는 버그가 있었는데, 이는 방장(start 요청을 날린 사람)이 게임 시작 후 접속이 끊기면 게임 시간을 흐르게 하는 함수가 같이 죽어서 생기는 버그였음
  * 이제는 멀티스레딩을 사용하여, 방장이 나가더라도 한 번 시작한 게임은 끝까지 잘 진행되며, 따라서 재접속이 가능해짐: 확인
* 손 입력을 받는 중에 signout으로 연결 끊기: 성공
  * 여전히 게임이 진행 중이므로 퇴장 처리가 되지 않고, 따라서 재접속 가능
* signin으로 재접속해서 hand 요청: 성공
* 접속을 끊은 동안 시간 종료에 따른 end 응답을 못 받고 새 방으로 이동하기 전 재접속: 성공
* 대기 방에서 퇴장하거나 signout하지 않고 접속 끊기: 성공
  * 이때 quit 절차가 실행되면서 사람 없는 방이 제거됨: 확인

##### Test 7: 접속 끊김, 재접속 2
* start로 게임 시작 후 손 입력을 받기 전에 접속을 끊어서 손 입력을 받기 시작한다는 start 응답을 못 받고 손 입력을 받는 중에 재접속: 성공
* 이후 hand 요청: 성공
* 시간 종료에 따른 end 응답을 받고 새 방으로 이동되기 전에 접속을 끊어서 새 방으로 이동된 end 응답을 받지 못한 후 signin으로 접속: 성공
  * 이때 기존 방의 게임이 끝났으므로 재접속으로 취급되지 않고 방 목록 화면으로 접속: 확인
* quit 요청을 날렸지만 방 목록 화면에 있으므로 오류 메시지 받기: 성공
* refresh 요청으로 새 방이 생성되지 않았음을 확인: 성공

##### Test 8: 숙련봇 한 명과 플레이
* start 요청 전에는 해당 방의 game_list에 봇이 포함되어 있지 않음: 확인
* setting 요청으로 숙련봇 한 명을 넣고 start 요청 시, start 응답의 init_data의 game_list에 숙련봇 정보 포함: 확인
* 숙련봇이 알아서 10초 동안 hand를 내서 +6점의 기록을 냄: 성공
* 시간 종료에 따른 end 응답(hand_data)을 받는 순간 봇 종료: 성공
* 방 재입장 후 refresh 요청 없이 바로 quit 요청을 해도 오류 없이 퇴장: 성공

##### Test 9: 트롤봇 한 명과 플레이
* start 요청 전에는 해당 방의 game_list에 봇이 포함되어 있지 않음: 확인
* setting 요청으로 트롤봇 한 명을 넣고 start 요청 시, start 응답의 init_data의 game_list에 트롤봇 정보 포함: 확인
* 트롤봇이 알아서 10초 동안 hand를 내서 -5점의 기록을 냄: 성공
* 시간 종료에 따른 end 응답(hand_data)을 받는 순간 봇 종료: 성공

##### Test 8: 숙련봇 셋, 트롤봇 셋과 플레이
* start 요청 전에는 해당 방의 game_list에 봇이 포함되어 있지 않음: 확인
* setting 요청으로 숙련봇 세 명과 트롤봇 세 명을 넣고 start 요청 시, start 응답의 init_data의 game_list에 숙련봇 정보 포함: 확인
* 봇들이 알아서 10초 동안 concurrent하게 hand를 냄: 성공
* 시간 종료에 따른 end 응답(hand_data)을 받는 순간 봇 종료: 성공
  * 결과에서 점수 계산 잘 됨: 확인

#### 테스트하지 않은 항목
* join
* 꽉 찬 방에 join
* 비밀번호가 있는 방에 비밀번호를 입력하지 않거나 틀리게 해서 join
* join 시 부여되는 팀 번호 확인
* 사람이 두 명 이상 입장한 방에서 방장 quit -> 방장 이양되는지 확인
* 방장이 아닌 사람이 setting
* 방장이 아닌 사람이 start
* 두 명 이상이 있는 방에서 게임 종료 후 새 방으로 이동되기 전에 방장이 접속을 종료했을 때 다른 사람이 방장을 이양받고 새 방으로 이동되는지 확인

#### 테스트 로그
* `cd {root_of_this_repository}`
* `./sql_app/Scripts/Activate.ps1` (가상환경 실행)
* `python ./backend_websocket_test.py`

```
----------------- Test 1: signin and signout -----------------
01. send signin
{'request': 'signin', 'response': 'success', 'type': 'profile_and_room_list', 'data': {'name': 'test', 'person_id': 1, 'rooms': []}}

02. send signout
{'request': 'signout', 'response': 'success', 'type': 'message', 'message': 'Successfully signed out'}

----------------- Test 2: create and quit -----------------
01. send signin
{'request': 'signin', 'response': 'success', 'type': 'profile_and_room_list', 'data': {'name': 'test', 'person_id': 1, 'rooms': []}}

02. send create
{'request': 'create', 'response': 'success', 'type': 'join_data', 'data': {'room': {'id': 1, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 1}]}}

03. send quit -> room removed
update room to quit (DEBUG)
delete room
{'request': 'quit', 'response': 'success', 'type': 'message', 'message': 'Successfully left the room'}

04. send create mode=2 -> bad request
{'request': 'create', 'response': 'error', 'type': 'message', 'message': 'Bad request: mode'}

05. send create name="123456789012345678901234567890123" -> bad request
{'request': 'create', 'response': 'error', 'type': 'message', 'message': 'Bad request'}

06. send create name="" -> bad request
{'request': 'create', 'response': 'error', 'type': 'message', 'message': 'Bad request'}

07. send create password="123456789012345678901" -> bad request
{'request': 'create', 'response': 'error', 'type': 'message', 'message': 'Bad request'}

08. send create without mode and password
{'request': 'create', 'response': 'success', 'type': 'join_data', 'data': {'room': {'id': 1, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 1}]}}

09. send quit -> room removed
update room to quit (DEBUG)
delete room
{'request': 'quit', 'response': 'success', 'type': 'message', 'message': 'Successfully left the room'}

10. send signout
{'request': 'signout', 'response': 'success', 'type': 'message', 'message': 'Successfully signed out'}

----------------- Test 3: setting and team -----------------
01. send signin
{'request': 'signin', 'response': 'success', 'type': 'profile_and_room_list', 'data': {'name': 'test', 'person_id': 1, 'rooms': []}}

02. send create
{'request': 'create', 'response': 'success', 'type': 'join_data', 'data': {'room': {'id': 1, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 1}]}}

03. send setting name="Hello!" mode=1 password="password" bot_s=1 bot_d=1 max_p=25
{'request': 'setting', 'response': 'broadcast', 'type': 'room', 'data': {'id': 1, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 1, 'bot_dumb': 1, 'max_persons': 25, 'num_persons': 3}}

04. send setting password=""
{'request': 'setting', 'response': 'broadcast', 'type': 'room', 'data': {'id': 1, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': False, 'bot_skilled': 1, 'bot_dumb': 1, 'max_persons': 25, 'num_persons': 3}}

05. send setting password="password" bot_s=9
{'request': 'setting', 'response': 'broadcast', 'type': 'room', 'data': {'id': 1, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 9, 'bot_dumb': 1, 'max_persons': 25, 'num_persons': 11}}

06. send setting bot_d=5
{'request': 'setting', 'response': 'broadcast', 'type': 'room', 'data': {'id': 1, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 9, 'bot_dumb': 5, 'max_persons': 25, 'num_persons': 15}}

07. send setting name="" -> bad request
{'request': 'setting', 'response': 'error', 'type': 'message', 'message': 'Bad request: name'}

08. send setting name="123456789012345678901234567890123" -> bad request
{'request': 'setting', 'response': 'error', 'type': 'message', 'message': 'Bad request: name'}

09. send setting mode=3 -> bad request
{'request': 'setting', 'response': 'error', 'type': 'message', 'message': 'Bad request: mode'}

10. send setting password="123456789012345678901" -> bad request
{'request': 'setting', 'response': 'error', 'type': 'message', 'message': 'Bad request: password'}

11. send setting bot_skilled=-1 -> bad request
{'request': 'setting', 'response': 'error', 'type': 'message', 'message': 'Bad request: bot_skilled'}

12. send setting bot_dumb=11 -> bad request
{'request': 'setting', 'response': 'error', 'type': 'message', 'message': 'Bad request: bot_dumb'}

13. send setting max_persons=31 -> bad request
{'request': 'setting', 'response': 'error', 'type': 'message', 'message': 'Bad request: max_persons'}

14. send setting max_persons=10 -> bad request (1 + 9 + 5 > 10)
{'request': 'setting', 'response': 'error', 'type': 'message', 'message': 'Bad request: exceed max_persons'}

15. send setting bot_d=10 max_p=15 -> bad request (1 + 9 + 10 > 15) -> rollback to bot_d=5
{'request': 'setting', 'response': 'error', 'type': 'message', 'message': 'Bad request: exceed max_persons'}

16. send setting max_persons=15 (1 + 9 + 5 <= 15)
{'request': 'setting', 'response': 'broadcast', 'type': 'room', 'data': {'id': 1, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 9, 'bot_dumb': 5, 'max_persons': 15, 'num_persons': 15}}

17. send setting bot_skilled=10 -> bad request (1 + 10 + 5 > 15)
{'request': 'setting', 'response': 'error', 'type': 'message', 'message': 'Bad request: exceed max_persons'}

18. send setting bot_s=0 bot_d=0
{'request': 'setting', 'response': 'broadcast', 'type': 'room', 'data': {'id': 1, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 15, 'num_persons': 1}}

19. send setting max_persons=1
{'request': 'setting', 'response': 'broadcast', 'type': 'room', 'data': {'id': 1, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 1, 'num_persons': 1}}

20. send setting max_persons=0 -> bad request (1 + 0 + 0 > 0)
{'request': 'setting', 'response': 'error', 'type': 'message', 'message': 'Bad request: exceed max_persons'}

21. send team 6
{'request': 'team', 'response': 'broadcast', 'type': 'game_list', 'data': [{'rank': 1, 'team': 6, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 1}]}

22. send team -1 -> bad request
{'request': 'team', 'response': 'error', 'type': 'message', 'message': 'Bad request'}

23. send team None -> bad request
{'request': 'team', 'response': 'error', 'type': 'message', 'message': 'Bad request'}

24. send signout before quit
update room to quit (DEBUG)
delete room
{'request': 'signout', 'response': 'success', 'type': 'message', 'message': 'Successfully signed out'}

----------------- Test 4: normal mode start and hand -----------------
01. send signin
{'request': 'signin', 'response': 'success', 'type': 'profile_and_room_list', 'data': {'name': 'test', 'person_id': 1, 'rooms': []}}

02. refresh
{'request': 'refresh', 'response': 'success', 'type': 'room_list', 'data': []}

03. send create
{'request': 'create', 'response': 'success', 'type': 'join_data', 'data': {'room': {'id': 1, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 1}]}}

04. send start 3 10
{'request': 'start', 'response': 'broadcast', 'type': 'init_data', 'data': {'room': {'id': 1, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:14:57.463544 KST', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:14:57.462508 KST', 'room_id': 1}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 1}]}}

05. send hand 0 -> error response
{'request': 'hand', 'response': 'error', 'type': 'message', 'message': 'Game not started yet'}

06. start response
{'request': 'start', 'response': 'broadcast', 'type': 'room_start', 'data': {'id': 1, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:14:57.463544 KST', 'start_time': '2023-02-19 17:15:02.940086 KST', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}}

07. send hand 0
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:14:57.462508 KST', 'room_id': 1}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:04.969875 KST', 'room_id': 1}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 1}]}}

08. send hand 3 -> bad request
{'request': 'hand', 'response': 'error', 'type': 'message', 'message': 'Bad request: hand'}

09. send hand None -> bad request
{'request': 'hand', 'response': 'error', 'type': 'message', 'message': 'Bad request: hand'}

10. send hand 1 -> lose
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:14:57.462508 KST', 'room_id': 1}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:04.969875 KST', 'room_id': 1}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:15:08.019740 KST', 'room_id': 1}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': -1, 'win': 0, 'draw': 1, 'lose': 1, 'room_id': 1}]}}

11. send hand 0 -> win
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:14:57.462508 KST', 'room_id': 1}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:04.969875 KST', 'room_id': 1}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:15:08.019740 KST', 'room_id': 1}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:15:10.076543 KST', 'room_id': 1}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 1, 'draw': 1, 'lose': 1, 'room_id': 1}]}}

12. end response hand_data
{'request': 'end', 'response': 'broadcast', 'type': 'hand_data', 'data': {'room': {'id': 1, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:14:57.463544 KST', 'start_time': '2023-02-19 17:15:02.940086 KST', 'end_time': '2023-02-19 17:15:12.972174 KST', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:14:57.462508 KST', 'room_id': 1}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:04.969875 KST', 'room_id': 1}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:15:08.019740 KST', 'room_id': 1}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:15:10.076543 KST', 'room_id': 1}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 1, 'draw': 1, 'lose': 1, 'room_id': 1}]}}

13. send hand 0 -> game has ended
{'request': 'hand', 'response': 'error', 'type': 'message', 'message': 'Game has ended'}

14. refresh
{'request': 'refresh', 'response': 'success', 'type': 'room_list', 'data': [{'id': 1, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:14:57.463544 KST', 'start_time': '2023-02-19 17:15:02.940086 KST', 'end_time': '2023-02-19 17:15:12.972174 KST', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}]}

15. end response join_data
{'request': 'end', 'response': 'broadcast', 'type': 'join_data', 'data': {'room': {'id': 2, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 2}]}}

16. refresh
{'request': 'refresh', 'response': 'success', 'type': 'room_list', 'data': [{'id': 2, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}]}

17. send quit -> room removed
update room to quit (DEBUG)
delete room
{'request': 'quit', 'response': 'success', 'type': 'message', 'message': 'Successfully left the room'}

18. refresh
{'request': 'refresh', 'response': 'success', 'type': 'room_list', 'data': []}

19. send signout
{'request': 'signout', 'response': 'success', 'type': 'message', 'message': 'Successfully signed out'}

----------------- Test 5: setting and many hand -----------------
01. send signin
{'request': 'signin', 'response': 'success', 'type': 'profile_and_room_list', 'data': {'name': 'test', 'person_id': 1, 'rooms': []}}

02. refresh
{'request': 'refresh', 'response': 'success', 'type': 'room_list', 'data': []}

03. send create
{'request': 'create', 'response': 'success', 'type': 'join_data', 'data': {'room': {'id': 2, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 2}]}}

04. send setting name="Hello!" mode=1 password="password" max_p=25
{'request': 'setting', 'response': 'broadcast', 'type': 'room', 'data': {'id': 2, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 25, 'num_persons': 1}}

05. send team 3
{'request': 'team', 'response': 'broadcast', 'type': 'game_list', 'data': [{'rank': 1, 'team': 3, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 2}]}

06. send start 3 10
{'request': 'start', 'response': 'broadcast', 'type': 'init_data', 'data': {'room': {'id': 2, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:15:23.197303 KST', 'start_time': '', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 25, 'num_persons': 1}, 'hand_list': [{'team': 3, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:15:23.197303 KST', 'room_id': 2}], 'game_list': [{'rank': 1, 'team': 3, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 2}]}}

07. start response
{'request': 'start', 'response': 'broadcast', 'type': 'room_start', 'data': {'id': 2, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:15:23.197303 KST', 'start_time': '2023-02-19 17:15:26.238870 KST', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 25, 'num_persons': 1}}

08. send hand 0
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 3, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:15:23.197303 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:15:27.265938 KST', 'room_id': 2}], 'game_list': [{'rank': 1, 'team': 3, 'name': 'test', 'is_host': True, 'is_human': True, 'score': -1, 'win': 0, 'draw': 0, 'lose': 1, 'room_id': 2}]}}

09. send hand 1 -> lose
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 3, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:15:23.197303 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:15:27.265938 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:15:28.315394 KST', 'room_id': 2}], 'game_list': [{'rank': 1, 'team': 3, 'name': 'test', 'is_host': True, 'is_human': True, 'score': -2, 'win': 0, 'draw': 0, 'lose': 2, 'room_id': 2}]}}

10. send hand 0 -> win
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 3, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:15:23.197303 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:15:27.265938 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:15:28.315394 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:15:29.361886 KST', 'room_id': 2}], 'game_list': [{'rank': 1, 'team': 3, 'name': 'test', 'is_host': True, 'is_human': True, 'score': -1, 'win': 1, 'draw': 0, 'lose': 2, 'room_id': 2}]}}

11. send hand 0 -> draw
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 3, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:15:23.197303 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:15:27.265938 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:15:28.315394 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:15:29.361886 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:30.415178 KST', 'room_id': 2}], 'game_list': [{'rank': 1, 'team': 3, 'name': 'test', 'is_host': True, 'is_human': True, 'score': -1, 'win': 1, 'draw': 1, 'lose': 2, 'room_id': 2}]}}

12. send hand 0 -> draw
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 3, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:15:23.197303 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:15:27.265938 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:15:28.315394 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:15:29.361886 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:30.415178 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:31.465697 KST', 'room_id': 2}], 'game_list': [{'rank': 1, 'team': 3, 'name': 'test', 'is_host': True, 'is_human': True, 'score': -1, 'win': 1, 'draw': 2, 'lose': 2, 'room_id': 2}]}}

13. send hand 0 -> draw
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:15:27.265938 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:15:28.315394 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:15:29.361886 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:30.415178 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:31.465697 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:32.505985 KST', 'room_id': 2}], 'game_list': [{'rank': 1, 'team': 3, 'name': 'test', 'is_host': True, 'is_human': True, 'score': -1, 'win': 1, 'draw': 3, 'lose': 2, 'room_id': 2}]}}

14. send hand 0 -> draw -> show last 6 hands
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 3, 'name': 'test', 'is_human': True, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:15:28.315394 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:15:29.361886 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:30.415178 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:31.465697 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:32.505985 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:33.560275 KST', 'room_id': 2}], 'game_list': [{'rank': 1, 'team': 3, 'name': 'test', 'is_host': True, 'is_human': True, 'score': -1, 'win': 1, 'draw': 4, 'lose': 2, 'room_id': 2}]}}

15. send hand 0 -> draw -> show last 6 hands
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:15:29.361886 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:30.415178 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:31.465697 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:32.505985 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:33.560275 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:34.612579 KST', 'room_id': 2}], 'game_list': [{'rank': 1, 'team': 3, 'name': 'test', 'is_host': True, 'is_human': True, 'score': -1, 'win': 1, 'draw': 5, 'lose': 2, 'room_id': 2}]}}

16. send hand 2 -> win -> show last 6 hands
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:30.415178 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:31.465697 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:32.505985 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:33.560275 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:34.612579 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:15:35.664971 KST', 'room_id': 2}], 'game_list': [{'rank': 1, 'team': 3, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 2, 'draw': 5, 'lose': 2, 'room_id': 2}]}}

17. end response hand_data
{'request': 'end', 'response': 'broadcast', 'type': 'hand_data', 'data': {'room': {'id': 2, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:15:23.197303 KST', 'start_time': '2023-02-19 17:15:26.238870 KST', 'end_time': '2023-02-19 17:15:36.267932 KST', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 25, 'num_persons': 1}, 'hand_list': [{'team': 3, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:15:23.197303 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:15:27.265938 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:15:28.315394 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:15:29.361886 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:30.415178 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:31.465697 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:32.505985 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:33.560275 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:34.612579 KST', 'room_id': 2}, {'team': 3, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:15:35.664971 KST', 'room_id': 2}], 'game_list': [{'rank': 1, 'team': 3, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 2, 'draw': 5, 'lose': 2, 'room_id': 2}]}}

18. refresh
{'request': 'refresh', 'response': 'success', 'type': 'room_list', 'data': [{'id': 2, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:15:23.197303 KST', 'start_time': '2023-02-19 17:15:26.238870 KST', 'end_time': '2023-02-19 17:15:36.267932 KST', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 25, 'num_persons': 1}]}

19. end response join_data
{'request': 'end', 'response': 'broadcast', 'type': 'join_data', 'data': {'room': {'id': 3, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 25, 'num_persons': 1}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 3}]}}

20. refresh
{'request': 'refresh', 'response': 'success', 'type': 'room_list', 'data': [{'id': 3, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 25, 'num_persons': 1}]}

21. send team 6
{'request': 'team', 'response': 'broadcast', 'type': 'game_list', 'data': [{'rank': 1, 'team': 6, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 3}]}

22. send setting bot_s=5 bot_d=4
{'request': 'setting', 'response': 'broadcast', 'type': 'room', 'data': {'id': 3, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 5, 'bot_dumb': 4, 'max_persons': 25, 'num_persons': 10}}

23. refresh
{'request': 'refresh', 'response': 'success', 'type': 'room_list', 'data': [{'id': 3, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hello!', 'mode': 1, 'has_password': True, 'bot_skilled': 5, 'bot_dumb': 4, 'max_persons': 25, 'num_persons': 10}]}

24. send quit -> room removed
update room to quit (DEBUG)
delete room
{'request': 'quit', 'response': 'success', 'type': 'message', 'message': 'Successfully left the room'}

25. refresh
{'request': 'refresh', 'response': 'success', 'type': 'room_list', 'data': []}

26. send signout
{'request': 'signout', 'response': 'success', 'type': 'message', 'message': 'Successfully signed out'}

----------------- Test 6: error and disconnect -----------------

01. send signin name=""
{'request': 'signin', 'response': 'error', 'type': 'message', 'message': 'Name is required'}

02. send signin
{'request': 'signin', 'response': 'success', 'type': 'profile_and_room_list', 'data': {'name': 'test', 'person_id': 1, 'rooms': []}}

03. send setting name="Hello!" mode=1 -> you are not in any room
{'request': 'setting', 'response': 'error', 'type': 'message', 'message': 'You are not in any room'}

04. send team 3 -> you are not in any room
{'request': 'team', 'response': 'error', 'type': 'message', 'message': 'You are not in any room'}

05. send quit -> you are not in any room
{'request': 'quit', 'response': 'error', 'type': 'message', 'message': 'You are not in any room'}

06. send start 3 10 -> you are not in any room
{'request': 'start', 'response': 'error', 'type': 'message', 'message': 'You are not in any room'}

07. send hand 0 -> you are not in any room
{'request': 'hand', 'response': 'error', 'type': 'message', 'message': 'You are not in any room'}

08. send create
{'request': 'create', 'response': 'success', 'type': 'join_data', 'data': {'room': {'id': 3, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hell!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 3}]}}

09. send create -> you are already in a room
{'request': 'create', 'response': 'error', 'type': 'message', 'message': 'You are already in a room'}

10. send join -> you are already in a room
{'request': 'join', 'response': 'error', 'type': 'message', 'message': 'You are already in a room'}

11. send start 3 10
{'request': 'start', 'response': 'broadcast', 'type': 'init_data', 'data': {'room': {'id': 3, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:15:46.536333 KST', 'start_time': '', 'end_time': '', 'name': 'Hell!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:46.536333 KST', 'room_id': 3}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 3}]}}

12. disconnect
update room to quit (DEBUG)

13. send signin -> reconnected
{'request': 'signin', 'response': 'reconnected', 'type': 'recon_data', 'data': {'name': 'test', 'person_id': 1, 'room': {'id': 3, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:15:46.536333 KST', 'start_time': '', 'end_time': '', 'name': 'Hell!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:46.536333 KST', 'room_id': 3}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 3}]}}

14. start response
{'request': 'start', 'response': 'broadcast', 'type': 'room_start', 'data': {'id': 3, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:15:46.536333 KST', 'start_time': '2023-02-19 17:15:49.579351 KST', 'end_time': '', 'name': 'Hell!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}}

15. send hand 0
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:46.536333 KST', 'room_id': 3}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:50.609343 KST', 'room_id': 3}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 3}]}}

16. send signout
update room to quit (DEBUG)
{'request': 'signout', 'response': 'success', 'type': 'message', 'message': 'Successfully signed out'}

17. send signin -> reconnected
{'request': 'signin', 'response': 'reconnected', 'type': 'recon_data', 'data': {'name': 'test', 'person_id': 1, 'room': {'id': 3, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:15:46.536333 KST', 'start_time': '2023-02-19 17:15:49.579351 KST', 'end_time': '', 'name': 'Hell!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:46.536333 KST', 'room_id': 3}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:50.609343 KST', 'room_id': 3}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 3}]}}

18. send hand 2
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:46.536333 KST', 'room_id': 3}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:50.609343 KST', 'room_id': 3}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:15:53.664728 KST', 'room_id': 3}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 3}]}}

19. disconnect
update room to quit (DEBUG)

20. end response hand_data -> cannot receive

21. send signin -> reconnected
{'request': 'signin', 'response': 'reconnected', 'type': 'recon_data', 'data': {'name': 'test', 'person_id': 1, 'room': {'id': 3, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:15:46.536333 KST', 'start_time': '2023-02-19 17:15:49.579351 KST', 'end_time': '2023-02-19 17:15:59.609501 KST', 'name': 'Hell!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:46.536333 KST', 'room_id': 3}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:15:50.609343 KST', 'room_id': 3}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:15:53.664728 KST', 'room_id': 3}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 3}]}}

22. send hand 1 -> game has ended
{'request': 'hand', 'response': 'error', 'type': 'message', 'message': 'Game has ended'}

23. end response join_data
{'request': 'end', 'response': 'broadcast', 'type': 'join_data', 'data': {'room': {'id': 4, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hell!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 4}]}}

24. websocket close
update room to quit (DEBUG)
delete room

----------------- Test 7: reconnect -----------------

01. send signin
{'request': 'signin', 'response': 'success', 'type': 'profile_and_room_list', 'data': {'name': 'test', 'person_id': 1, 'rooms': []}}

02. send create
{'request': 'create', 'response': 'success', 'type': 'join_data', 'data': {'room': {'id': 4, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Hell!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 4}]}}

03. send start 3 10
{'request': 'start', 'response': 'broadcast', 'type': 'init_data', 'data': {'room': {'id': 4, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:16:09.792028 KST', 'start_time': '', 'end_time': '', 'name': 'Hell!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:16:09.792028 KST', 'room_id': 4}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 4}]}}

04. disconnect
update room to quit (DEBUG)

05. start response -> cannot receive

06. send signin -> reconnected
{'request': 'signin', 'response': 'reconnected', 'type': 'recon_data', 'data': {'name': 'test', 'person_id': 1, 'room': {'id': 4, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:16:09.792028 KST', 'start_time': '2023-02-19 17:16:12.847231 KST', 'end_time': '', 'name': 'Hell!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:16:09.792028 KST', 'room_id': 4}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 4}]}}

07. send hand 0
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:16:09.792028 KST', 'room_id': 4}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:16:18.861010 KST', 'room_id': 4}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 4}]}}

08. end response hand_data
{'request': 'end', 'response': 'broadcast', 'type': 'hand_data', 'data': {'room': {'id': 4, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:16:09.792028 KST', 'start_time': '2023-02-19 17:16:12.847231 KST', 'end_time': '2023-02-19 17:16:22.890202 KST', 'name': 'Hell!', 'mode': 1, 'has_password': True, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:16:09.792028 KST', 'room_id': 4}, {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:16:18.861010 KST', 'room_id': 4}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 4}]}}

09. disconnect
update room to quit (DEBUG)

10. end response join_data -> cannot receive

11. send signin -> not reconnected
{'request': 'signin', 'response': 'success', 'type': 'profile_and_room_list', 'data': {'name': 'test', 'person_id': 1, 'rooms': []}}

12. refresh
{'request': 'refresh', 'response': 'success', 'type': 'room_list', 'data': []}

13. send quit -> you are not in any room
{'request': 'quit', 'response': 'error', 'type': 'message', 'message': 'You are not in any room'}

14. send signout
{'request': 'signout', 'response': 'success', 'type': 'message', 'message': 'Successfully signed out'}

----------------- Test 8: play with a skilled bot -----------------
01. send signin
{'request': 'signin', 'response': 'success', 'type': 'profile_and_room_list', 'data': {'name': 'test', 'person_id': 1, 'rooms': []}}

02. send create
{'request': 'create', 'response': 'success', 'type': 'join_data', 'data': {'room': {'id': 5, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 5}]}}

03. send setting bot_s=1
{'request': 'setting', 'response': 'broadcast', 'type': 'room', 'data': {'id': 5, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 1, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 2}}

04. send start 3 10
{'request': 'start', 'response': 'broadcast', 'type': 'init_data', 'data': {'room': {'id': 5, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:16:34.042040 KST', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 1, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 3}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:34.042040 KST', 'room_id': 5}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 5}, {'rank': 2, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 5}]}}

05. start response
{'request': 'start', 'response': 'broadcast', 'type': 'room_start', 'data': {'id': 5, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:16:34.042040 KST', 'start_time': '2023-02-19 17:16:37.137215 KST', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 1, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 3}}
skilled bot has observed hand 2

06-1. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:34.042040 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:37.657492 KST', 'room_id': 5}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 5}, {'rank': 2, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 5}]}}
skilled bot has observed hand 1

06-2. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:34.042040 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:37.657492 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:16:39.176662 KST', 'room_id': 5}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 2, 'win': 2, 'draw': 0, 'lose': 0, 'room_id': 5}, {'rank': 2, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 5}]}}
skilled bot has observed hand 0

06-3. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:34.042040 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:37.657492 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:16:39.176662 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:16:40.761356 KST', 'room_id': 5}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 3, 'win': 3, 'draw': 0, 'lose': 0, 'room_id': 5}, {'rank': 2, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 5}]}}
skilled bot has observed hand 2

06-4. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:34.042040 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:37.657492 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:16:39.176662 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:16:40.761356 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:42.335430 KST', 'room_id': 5}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 4, 'win': 4, 'draw': 0, 'lose': 0, 'room_id': 5}, {'rank': 2, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 5}]}}
skilled bot has observed hand 1

06-5. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:34.042040 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:37.657492 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:16:39.176662 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:16:40.761356 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:42.335430 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:16:43.778382 KST', 'room_id': 5}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 5, 'win': 5, 'draw': 0, 'lose': 0, 'room_id': 5}, {'rank': 2, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 5}]}}
skilled bot has observed hand 0

06-6. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:37.657492 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:16:39.176662 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:16:40.761356 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:42.335430 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:16:43.778382 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:16:45.146525 KST', 'room_id': 5}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 6, 'win': 6, 'draw': 0, 'lose': 0, 'room_id': 5}, {'rank': 2, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 5}]}}
skilled bot has observed hand 2

06-7. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:16:39.176662 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:16:40.761356 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:42.335430 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:16:43.778382 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:16:45.146525 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:46.562125 KST', 'room_id': 5}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 7, 'win': 7, 'draw': 0, 'lose': 0, 'room_id': 5}, {'rank': 2, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 5}]}}

07. end response hand_data
{'request': 'end', 'response': 'broadcast', 'type': 'hand_data', 'data': {'room': {'id': 5, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:16:34.042040 KST', 'start_time': '2023-02-19 17:16:37.137215 KST', 'end_time': '2023-02-19 17:16:47.170809 KST', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 1, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 3}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:34.042040 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:37.657492 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:16:39.176662 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:16:40.761356 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:42.335430 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:16:43.778382 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:16:45.146525 KST', 'room_id': 5}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:16:46.562125 KST', 'room_id': 5}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 7, 'win': 7, 'draw': 0, 'lose': 0, 'room_id': 5}, {'rank': 2, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 5}]}}
skilled_bot 2 in room 5 has terminated

08. end response join_data
{'request': 'end', 'response': 'broadcast', 'type': 'join_data', 'data': {'room': {'id': 6, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 1, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 2}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 6}]}}

09. send quit -> room removed
update room to quit (DEBUG)
delete room
{'request': 'quit', 'response': 'success', 'type': 'message', 'message': 'Successfully left the room'}

10. send signout
{'request': 'signout', 'response': 'success', 'type': 'message', 'message': 'Successfully signed out'}

----------------- Test 9: play with a dumb bot -----------------
01. send signin
{'request': 'signin', 'response': 'success', 'type': 'profile_and_room_list', 'data': {'name': 'test', 'person_id': 1, 'rooms': []}}

02. send create
{'request': 'create', 'response': 'success', 'type': 'join_data', 'data': {'room': {'id': 6, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 6}]}}

03. send setting bot_d=1
{'request': 'setting', 'response': 'broadcast', 'type': 'room', 'data': {'id': 6, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 1, 'max_persons': 30, 'num_persons': 2}}

04. send start 3 10
{'request': 'start', 'response': 'broadcast', 'type': 'init_data', 'data': {'room': {'id': 6, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:16:58.401205 KST', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 1, 'max_persons': 30, 'num_persons': 3}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:58.401205 KST', 'room_id': 6}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 6}, {'rank': 2, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 6}]}}

05. start response
{'request': 'start', 'response': 'broadcast', 'type': 'room_start', 'data': {'id': 6, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:16:58.401205 KST', 'start_time': '2023-02-19 17:17:01.554091 KST', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 1, 'max_persons': 30, 'num_persons': 3}}
dumb bot has observed hand 2

06-1. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:58.401205 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:02.055017 KST', 'room_id': 6}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 6}, {'rank': 2, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -1, 'win': 0, 'draw': 0, 'lose': 1, 'room_id': 6}]}}
dumb bot has observed hand 0

06-2. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:58.401205 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:02.055017 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:03.729273 KST', 'room_id': 6}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 6}, {'rank': 2, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -2, 'win': 0, 'draw': 0, 'lose': 2, 'room_id': 6}]}}
dumb bot has observed hand 1

06-3. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:58.401205 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:02.055017 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:03.729273 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:05.480265 KST', 'room_id': 6}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 6}, {'rank': 2, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 0, 'lose': 3, 'room_id': 6}]}}
dumb bot has observed hand 2

06-4. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:58.401205 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:02.055017 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:03.729273 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:05.480265 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:07.102133 KST', 'room_id': 6}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 6}, {'rank': 2, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -4, 'win': 0, 'draw': 0, 'lose': 4, 'room_id': 6}]}}
dumb bot has observed hand 0

06-5. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:58.401205 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:02.055017 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:03.729273 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:05.480265 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:07.102133 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:09.020612 KST', 'room_id': 6}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 6}, {'rank': 2, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -5, 'win': 0, 'draw': 0, 'lose': 5, 'room_id': 6}]}}
dumb bot has observed hand 1

06-6. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:02.055017 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:03.729273 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:05.480265 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:07.102133 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:09.020612 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:10.812414 KST', 'room_id': 6}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 6}, {'rank': 2, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -6, 'win': 0, 'draw': 0, 'lose': 6, 'room_id': 6}]}}

07. end response hand_data
{'request': 'end', 'response': 'broadcast', 'type': 'hand_data', 'data': {'room': {'id': 6, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:16:58.401205 KST', 'start_time': '2023-02-19 17:17:01.554091 KST', 'end_time': '2023-02-19 17:17:11.609315 KST', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 1, 'max_persons': 30, 'num_persons': 3}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:16:58.401205 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:02.055017 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:03.729273 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:05.480265 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:07.102133 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:09.020612 KST', 'room_id': 6}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:10.812414 KST', 'room_id': 6}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 6}, {'rank': 2, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -6, 'win': 0, 'draw': 0, 'lose': 6, 'room_id': 6}]}}
dumb_bot 3 in room 6 has terminated

08. end response join_data
{'request': 'end', 'response': 'broadcast', 'type': 'join_data', 'data': {'room': {'id': 7, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 1, 'max_persons': 30, 'num_persons': 2}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}]}}

09. send quit -> room removed
update room to quit (DEBUG)
delete room
{'request': 'quit', 'response': 'success', 'type': 'message', 'message': 'Successfully left the room'}

10. send signout
{'request': 'signout', 'response': 'success', 'type': 'message', 'message': 'Successfully signed out'}

----------------- Test 10: play with many bots -----------------
01. send signin
{'request': 'signin', 'response': 'success', 'type': 'profile_and_room_list', 'data': {'name': 'test', 'person_id': 1, 'rooms': []}}

02. send create
{'request': 'create', 'response': 'success', 'type': 'join_data', 'data': {'room': {'id': 7, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 0, 'bot_dumb': 0, 'max_persons': 30, 'num_persons': 1}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}]}}

03. send setting bot_s=3 bot_d=3
{'request': 'setting', 'response': 'broadcast', 'type': 'room', 'data': {'id': 7, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 3, 'bot_dumb': 3, 'max_persons': 30, 'num_persons': 7}}

04. send start 3 10
{'request': 'start', 'response': 'broadcast', 'type': 'init_data', 'data': {'room': {'id': 7, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:17:22.899707 KST', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 3, 'bot_dumb': 3, 'max_persons': 30, 'num_persons': 13}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:22.899707 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}]}}

05. start response
{'request': 'start', 'response': 'broadcast', 'type': 'room_start', 'data': {'id': 7, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:17:22.899707 KST', 'start_time': '2023-02-19 17:17:26.180968 KST', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 3, 'bot_dumb': 3, 'max_persons': 30, 'num_persons': 13}}
dumb bot has observed hand 0

06-1. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:22.899707 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:26.509198 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -1, 'win': 0, 'draw': 0, 'lose': 1, 'room_id': 7}]}}
skilled bot has observed hand 1
skilled bot has observed hand 1
dumb bot has observed hand 1
dumb bot has observed hand 0

06-2. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:22.899707 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:26.509198 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:17:26.901521 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -1, 'win': 0, 'draw': 0, 'lose': 1, 'room_id': 7}]}}
skilled bot has observed hand 0

06-3. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:22.899707 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:26.509198 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:17:26.901521 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:27.023658 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -1, 'win': 0, 'draw': 0, 'lose': 1, 'room_id': 7}]}}

06-4. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:22.899707 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:26.509198 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:17:26.901521 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:27.023658 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:27.195247 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -1, 'win': 0, 'draw': 0, 'lose': 1, 'room_id': 7}]}}

06-5. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:22.899707 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:26.509198 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:17:26.901521 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:27.023658 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:27.195247 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:27.269046 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -1, 'win': 0, 'draw': 0, 'lose': 1, 'room_id': 7}]}}

06-6. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:26.509198 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:17:26.901521 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:27.023658 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:27.195247 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:27.269046 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:27.552741 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -1, 'win': 0, 'draw': 0, 'lose': 1, 'room_id': 7}]}}
dumb bot has observed hand 1

06-7. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:17:26.901521 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:27.023658 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:27.195247 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:27.269046 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:27.552741 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.125173 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -2, 'win': 0, 'draw': 0, 'lose': 2, 'room_id': 7}]}}
skilled bot has observed hand 2
skilled bot has observed hand 2
skilled bot has observed hand 2

06-8. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:27.023658 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:27.195247 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:27.269046 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:27.552741 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.125173 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:28.436198 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -2, 'win': 0, 'draw': 0, 'lose': 2, 'room_id': 7}]}}
dumb bot has observed hand 1

06-9. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:27.195247 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:27.269046 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:27.552741 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.125173 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:28.436198 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.507477 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -2, 'win': 0, 'draw': 0, 'lose': 2, 'room_id': 7}]}}

06-10. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:27.269046 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:27.552741 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.125173 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:28.436198 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.507477 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.665153 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -2, 'win': 0, 'draw': 0, 'lose': 2, 'room_id': 7}]}}
dumb bot has observed hand 1

06-11. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:27.552741 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.125173 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:28.436198 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.507477 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.665153 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.824776 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -1, 'win': 0, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -2, 'win': 0, 'draw': 0, 'lose': 2, 'room_id': 7}]}}

06-12. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.125173 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:28.436198 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.507477 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.665153 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.824776 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:29.070034 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -1, 'win': 0, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -2, 'win': 0, 'draw': 0, 'lose': 2, 'room_id': 7}]}}
dumb bot has observed hand 2

06-13. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:28.436198 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.507477 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.665153 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.824776 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:29.070034 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:29.521373 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -1, 'win': 0, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 0, 'lose': 3, 'room_id': 7}]}}
skilled bot has observed hand 0
skilled bot has observed hand 0
skilled bot has observed hand 0

06-14. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.507477 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.665153 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.824776 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:29.070034 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:29.521373 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:29.847167 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 2, 'win': 2, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -1, 'win': 0, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 0, 'lose': 3, 'room_id': 7}]}}
dumb bot has observed hand 2

06-15. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.665153 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.824776 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:29.070034 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:29.521373 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:29.847167 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.066308 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 2, 'win': 2, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -1, 'win': 0, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 0, 'lose': 3, 'room_id': 7}]}}

06-16. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.824776 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:29.070034 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:29.521373 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:29.847167 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.066308 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.129103 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 2, 'win': 2, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -1, 'win': 0, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 0, 'lose': 3, 'room_id': 7}]}}
dumb bot has observed hand 2

06-17. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:29.070034 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:29.521373 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:29.847167 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.066308 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.129103 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:30.317852 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 2, 'win': 2, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -2, 'win': 0, 'draw': 1, 'lose': 2, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 0, 'lose': 3, 'room_id': 7}]}}
dumb bot has observed hand 0

06-18. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:29.521373 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:29.847167 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.066308 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.129103 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:30.317852 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:30.799167 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 2, 'win': 2, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -2, 'win': 0, 'draw': 1, 'lose': 2, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 0, 'lose': 3, 'room_id': 7}]}}
skilled bot has observed hand 0
skilled bot has observed hand 0
skilled bot has observed hand 0

06-19. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:29.847167 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.066308 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.129103 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:30.317852 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:30.799167 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:31.362685 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 2, 'win': 2, 'draw': 1, 'lose': 0, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -2, 'win': 0, 'draw': 1, 'lose': 2, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -4, 'win': 0, 'draw': 0, 'lose': 4, 'room_id': 7}]}}

06-20. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.066308 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.129103 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:30.317852 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:30.799167 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:31.362685 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:31.441185 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -2, 'win': 0, 'draw': 1, 'lose': 2, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -4, 'win': 0, 'draw': 0, 'lose': 4, 'room_id': 7}]}}

06-21. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.129103 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:30.317852 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:30.799167 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:31.362685 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:31.441185 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.503627 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -2, 'win': 0, 'draw': 1, 'lose': 2, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -4, 'win': 0, 'draw': 0, 'lose': 4, 'room_id': 7}]}}

06-22. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:30.317852 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:30.799167 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:31.362685 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:31.441185 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.503627 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.564247 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -2, 'win': 0, 'draw': 1, 'lose': 2, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -4, 'win': 0, 'draw': 0, 'lose': 4, 'room_id': 7}]}}
dumb bot has observed hand 2
dumb bot has observed hand 2

06-23. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:30.799167 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:31.362685 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:31.441185 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.503627 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.564247 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:32.283197 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 1, 'lose': 3, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -4, 'win': 0, 'draw': 0, 'lose': 4, 'room_id': 7}]}}

06-24. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:31.362685 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:31.441185 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.503627 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.564247 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:32.283197 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:32.408312 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 1, 'lose': 3, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -4, 'win': 0, 'draw': 0, 'lose': 4, 'room_id': 7}]}}
dumb bot has observed hand 0
skilled bot has observed hand 0
skilled bot has observed hand 0
skilled bot has observed hand 0

06-25. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:31.441185 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.503627 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.564247 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:32.283197 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:32.408312 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:32.969896 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 2, 'win': 3, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 1, 'lose': 3, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -4, 'win': 0, 'draw': 0, 'lose': 4, 'room_id': 7}]}}

06-26. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.503627 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.564247 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:32.283197 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:32.408312 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:32.969896 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:33.044918 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 2, 'win': 3, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 0, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 1, 'lose': 3, 'room_id': 7}]}}

06-27. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.564247 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:32.283197 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:32.408312 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:32.969896 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:33.044918 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:33.106786 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 2, 'win': 3, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 0, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 1, 'lose': 3, 'room_id': 7}]}}

06-28. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:32.283197 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:32.408312 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:32.969896 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:33.044918 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:33.106786 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:33.172993 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 2, 'win': 3, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 4, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 3, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 0, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 1, 'lose': 3, 'room_id': 7}]}}
dumb bot has observed hand 2
dumb bot has observed hand 2

06-29. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:32.408312 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:32.969896 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:33.044918 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:33.106786 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:33.172993 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:34.032370 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 2, 'win': 3, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 4, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 0, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 1, 'lose': 3, 'room_id': 7}]}}

06-30. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:32.969896 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:33.044918 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:33.106786 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:33.172993 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:34.032370 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:34.179180 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 2, 'win': 3, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 4, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 0, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 2, 'lose': 3, 'room_id': 7}]}}
skilled bot has observed hand 0
dumb bot has observed hand 0
skilled bot has observed hand 0
skilled bot has observed hand 2

06-31. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:33.044918 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:33.106786 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:33.172993 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:34.032370 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:34.179180 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:34.529040 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 3, 'win': 4, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 4, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 0, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 2, 'lose': 3, 'room_id': 7}]}}

06-32. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:33.106786 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:33.172993 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:34.032370 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:34.179180 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:34.529040 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:34.700153 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 3, 'win': 4, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 5, 'lose': 0, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 0, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 2, 'lose': 3, 'room_id': 7}]}}

06-33. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:33.172993 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:34.032370 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:34.179180 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:34.529040 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:34.700153 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:34.870177 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 3, 'win': 4, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 5, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 0, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 2, 'lose': 3, 'room_id': 7}]}}

06-34. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:34.032370 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:34.179180 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:34.529040 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:34.700153 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:34.870177 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:34.943631 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 3, 'win': 4, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 5, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 1, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -3, 'win': 0, 'draw': 2, 'lose': 3, 'room_id': 7}]}}
dumb bot has observed hand 1
dumb bot has observed hand 1

06-35. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:34.179180 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:34.529040 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:34.700153 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:34.870177 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:34.943631 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:35.760829 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 3, 'win': 4, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 5, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 1, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -4, 'win': 0, 'draw': 2, 'lose': 4, 'room_id': 7}]}}
skilled bot has observed hand 2

06-36. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:34.529040 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:34.700153 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:34.870177 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:34.943631 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:35.760829 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:35.840713 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 3, 'win': 4, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 5, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 4, 'lose': 1, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 1, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -4, 'win': 0, 'draw': 2, 'lose': 4, 'room_id': 7}]}}
skilled bot has observed hand 2
skilled bot has observed hand 2

06-37. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:34.700153 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:34.870177 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:34.943631 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:35.760829 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:35.840713 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:36.102478 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 4, 'win': 5, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 5, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 4, 'lose': 1, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 1, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -4, 'win': 0, 'draw': 2, 'lose': 4, 'room_id': 7}]}}

06-38. hand response by bot
{'request': 'hand', 'response': 'broadcast', 'type': 'hand_data', 'data': {'hand_list': [{'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:34.870177 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:34.943631 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:35.760829 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:35.840713 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:36.102478 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:36.175264 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 4, 'win': 5, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 6, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 4, 'lose': 1, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 1, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -4, 'win': 0, 'draw': 2, 'lose': 4, 'room_id': 7}]}}

07. end response hand_data
skilled bot hand failed: error_code 6
{'request': 'end', 'response': 'broadcast', 'type': 'hand_data', 'data': {'room': {'id': 7, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-19 17:17:22.899707 KST', 'start_time': '2023-02-19 17:17:26.180968 KST', 'end_time': '2023-02-19 17:17:36.249021 KST', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 3, 'bot_dumb': 3, 'max_persons': 30, 'num_persons': 13}, 'hand_list': [{'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:22.899707 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:26.509198 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-19 17:17:26.901521 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:27.023658 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:27.195247 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:27.269046 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:27.552741 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.125173 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:28.436198 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.507477 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:28.665153 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:28.824776 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:29.070034 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:29.521373 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:29.847167 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.066308 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:30.129103 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:30.317852 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:30.799167 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-19 17:17:31.362685 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:31.441185 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.503627 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:31.564247 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:32.283197 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:32.408312 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:32.969896 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:33.044918 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:33.106786 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:33.172993 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 0, 'score': -1, 'time': '2023-02-19 17:17:34.032370 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-19 17:17:34.179180 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-19 17:17:34.529040 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:34.700153 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-993473', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:34.870177 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794618-443487', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:34.943631 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-066175', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-19 17:17:35.760829 KST', 'room_id': 7}, {'team': -1, 'name': 'D-1676794643-107485', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-19 17:17:35.840713 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794594-065722', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-19 17:17:36.102478 KST', 'room_id': 7}, {'team': -1, 'name': 'S-1676794642-952457', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-19 17:17:36.175264 KST', 'room_id': 7}], 'game_list': [{'rank': 1, 'team': -1, 'name': 'S-1676794594-065722', 'is_host': False, 'is_human': False, 'score': 4, 'win': 5, 'draw': 1, 'lose': 1, 'room_id': 7}, {'rank': 2, 'team': -1, 'name': 'S-1676794642-993473', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 3, 'lose': 1, 'room_id': 7}, {'rank': 3, 'team': -1, 'name': 'S-1676794642-952457', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 6, 'lose': 0, 'room_id': 7}, {'rank': 4, 'team': -1, 'name': 'D-1676794643-107485', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 4, 'lose': 1, 'room_id': 7}, {'rank': 5, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 7}, {'rank': 6, 'team': -1, 'name': 'D-1676794618-443487', 'is_host': False, 'is_human': False, 'score': -3, 'win': 1, 'draw': 1, 'lose': 4, 'room_id': 7}, {'rank': 7, 'team': -1, 'name': 'D-1676794643-066175', 'is_host': False, 'is_human': False, 'score': -4, 'win': 0, 'draw': 2, 'lose': 4, 'room_id': 7}]}}
skilled_bot 5 in room 7 has terminated
dumb_bot 3 in room 7 has terminated
dumb_bot 6 in room 7 has terminated
dumb_bot 7 in room 7 has terminated
skilled_bot 4 in room 7 has terminated
skilled_bot 2 in room 7 has terminated

08. end response join_data
{'request': 'end', 'response': 'broadcast', 'type': 'join_data', 'data': {'room': {'id': 8, 'state': 0, 'time_offset': -1, 'time_duration': -1, 'init_time': '', 'start_time': '', 'end_time': '', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 3, 'bot_dumb': 3, 'max_persons': 30, 'num_persons': 7}, 'game_list': [{'rank': 1, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 8}]}}

09. send quit -> room removed
update room to quit (DEBUG)
delete room
{'request': 'quit', 'response': 'success', 'type': 'message', 'message': 'Successfully left the room'}

10. send signout
{'request': 'signout', 'response': 'success', 'type': 'message', 'message': 'Successfully signed out'}
```