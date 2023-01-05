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
* `pip install fastapi`
* `pip install "uvicorn[standard]"`
* `pip install sqlalchemy`
* `pip install websockets`
* `pip install pytz`
* `pip install httpx` (테스트 코드에서만 사용)

#### Run
* `cd {root_of_this_repository}`
* `./sql_app/Scripts/Activate.ps1` (가상환경 실행)
* `uvicorn sql_app.main:app --port 8000 --reload`
  * 배포할 때에는 `--reload` 옵션 없이 실행
  * 브라우저에서 `http://127.0.0.1:8000/docs` 접속

### API
#### 입장(join)

프론트엔드(JavaScript)의 입장 전 화면에서 다음을 요청하여 입장
```
let ws = new WebSocket("ws://localhost:8000/join?affiliation=" + "소속" + "&name=" + "이름");
```

* 소속(`affiliation`)과 이름(`name`)을 가진 사람을 마지막 대기 방에 입장시킴 (회원가입 겸 로그인)
* 특별히 `affiliation=STAFF`인 사람은 admin으로 취급됨 (이름은 무관)
  * 다만, 게임 시작 권한을 가지려면 프론트엔드에서 수행해야 하는 별도의 과정이 있음

join error: `affiliation` 또는 `name`이 주어지지 않는 경우 다음 메시지 응답
```
{
  request: "join",
  response: "error",
  type: "message",
  message: "Both affiliation and name are required"
}
```

join error: 입장하려는 대기 방에 같은 사람이 이미 입장해 있는 경우 다음 메시지 응답
```
{
  request: "join",
  response: "error",
  type: "message",
  message: "Person already exists in the Room"
}
```

join error: 다른 대기 방 또는 플레이 방에 같은 사람이 이미 입장해 있는 경우 다음 메시지 응답
```
{
  request: "join",
  response: "error",
  type: "message",
  message: "Person has already entered in non-end Room"
}
```

**join success**: 입장 성공 시 해당 개인에게 `data.room_id`, `data.person_id` 등이 포함된 다음 정보 응답 > 이때 받은 `data.person_id`를 클라이언트에서 꼭 기억하고 있을 것!
```
{
  request: "join",
  response: "success",
  type: "profile",
  data: {
    affiliation: "소속",
    name: "이름",
    is_admin: False,
    room_id: 1,
    person_id: 1
  }
}
```

**join broadcast**: 누군가가 방에 입장 성공 시(본인 포함) 해당 방의 모든 사람들에게 다음 정보 응답
```
{
  request: "join",
  response: "broadcast",
  type: "game_list",
  data: [
    {
      affiliation: "소속",
      name: "이름",
      is_admin: False,
      ...
    },
    ...
  ]
}
```

* 입장에 성공하면 그 이후로 연결이 종료될 때까지 소켓 통신을 통해 실시간으로 다른 요청들을 보내고 응답을 받을 수 있다.

---

#### 퇴장(quit)

프론트엔드에서 대기 방 화면에 있는 동안 다음을 요청하여 퇴장
```
let request = {
  request: "quit"
};
ws.send(request);
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
  message: "Successfully signed out"
}
```
* 퇴장하면 소켓 통신이 종료되어 재입장할 때까지 다른 요청을 보낼 수 없다.

**quit broadcast**: 퇴장 성공 시 해당 방에 남아있는 모든 사람들(퇴장한 본인 제외)에게 다음 정보 응답
```
{
  request: "quit",
  response: "broadcast",
  type: "game_list",
  data: [
    {
      affiliation: "소속",
      name: "이름",
      ...
    },
    ...
  ]
}
```

---

#### 게임 시작(start)

프론트엔드에서 대기 방 화면에 있는 동안 admin 권한을 가진 사람이 다음을 요청하여 방 상태를 플레이 중인 방으로 변경
```
let request = {
  request: "start",
  time_offset: 5,  // seconds, 플레이 중인 방으로 전환 후 처음 손을 입력받기까지 기다리는 시간
  time_duration: 60  // seconds, 처음 손을 입력받기 시작한 후 손을 입력받는 시간대의 길이
};
ws.send(request);
```

start error: admin 권한이 없는 사람이 게임 시작 요청을 보낸 경우 아래 메시지 응답
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
      state: 1,                                     // Play
      time_offset : 5,                              // 이때는 항상 0 이상의 정수이지만 대기 방에서는 -1
      time_duration : 60,                           // 이때는 항상 1 이상의 정수이지만 대기 방에서는 -1
      init_time: "2022-12-25 03:24:00.388157 KST",  // 한국 시간 기준
      start_time: "",                               // 아직 빈 문자열로 반환
      end_time: ""                                  // 아직 빈 문자열로 반환
    }, 
    hand_list: [
      {
        affiliation: "소속",  // 이 방에 입장한 첫 번째 사람 소속
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
        affiliation: "소속",
        name: "이름",
        is_admin: False,
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
    end_time: ""                                  // 아직 빈 문자열로 반환
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
        affiliation: "소속",
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
        affiliation: "소속",
        name: "이름",
        is_admin: False,
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
    hand_list: [
      ...,
      {
        affiliation: "소속",
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
        affiliation: "소속",
        name: "이름",
        is_admin: False,
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
* 프론트엔드에서는 이 응답을 받고 나서 결과 화면을 보여주고, 결과 화면에서 "나가기" 버튼을 눌러 입장 전 화면으로 이동하면 된다.

#### 연결 끊김(disconnected)
disconnected broadcast: 클라이언트에서 연결을 끊는 경우 해당 방에 남아있는 모든 사람들(연결이 끊긴 본인 제외)에게 다음 정보 응답
```
{
  request: "disconnected",
  response: "broadcast",
  type: "game_list",
  data: [
    {
      affiliation: "소속",
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
      affiliation: "소속",
      name: "이름",
      ...
    },
    ...
  ]
}
```
* 여기서 발생하는 응답의 `request`는 "disconnect"이다.

<!--
---

#### POST `/room` (`affiliation`(string), `name`(string))
* 소속(`affiliation`)과 이름(`name`)을 가진 사람을 마지막 대기 방에 입장시킴 (회원가입 겸 로그인)
* 특별히 `affiliation=STAFF`이고 `name=관리자`인 사람은 admin으로 표시됨
* 같은 사람이 이미 다른 대기 방 또는 플레이 방에 들어가 있는 경우 새로 입장할 수 없음
* `person_id`(사람 번호), `room_id`(입장한 방 번호) 등이 포함된 오브젝트(`{}`)를 반환
* **계정 접속 창에서 입장 버튼을 누를 때 호출할 것!**

#### GET `/room`
* 마지막 대기 방의 정보를 오브젝트로 반환
  * `state`: 0이면 대기 방, 1이면 플레이 방, 2이면 플레이가 종료된 방
  * `id`: 방 번호
  * `start_time`: 손 입력을 받기 시작하는 시각, 플레이가 시작되면 null이 아니게 됨
  * `end_time`: 손 입력을 더이상 받지 않게 되는 시각, 플레이가 시작되면 null이 아니게 됨
  * `persons`: 사람 목록(`[]`), 각 사람의 소속과 이름은 보여주지 않으므로 이것이 필요한 경우 GET `/room/{room_id}/game` 사용, 방에 있는 사람 수가 필요한 경우 GET `/room/{room_id}/persons` 사용

#### GET `/room/{room_id}` (`room_id`(int))
* `room_id`번째 방의 정보를 오브젝트로 반환

#### DELETE `/room/{room_id}` (`room_id`(int), `person_id`(int))
* `room_id`번째 방에 입장해 있는 `person_id`번 사람을 퇴장시킴 (로그아웃)
* `room_id`번째 방이 대기 방이 아닌 경우 퇴장할 수 없음
* **대기 창 또는 관리 창에서 퇴장 버튼을 누를 때 호출할 것!**

#### GET `/room/{room_id}/persons` (`room_id`(int))
* `room_id`번째 방에 입장해 있는 사람 수(int)를 반환
* **방의 인원 수를 표시할 때 호출할 것!**

#### PUT `/room/{room_id}/play` (`room_id`(int), `time_offset`(int), `time_duration`(int))
* `room_id`번째 방이 대기 방인 경우 플레이 방으로 변경
* 이것을 호출한 후 `time_offset`초가 지나고 나서부터 `time_duration`초 동안 방 안의 사람들이 손을 입력할 수 있음
  * 게임이 시작되면 처음에 무작위 손이 생성되므로, GET `/room/{room_id}/hand`를 이용하여 손을 확인하고 **게임 창에서 이 손을 표시해 주어야 함**
* 이것이 호출되면 게임이 끝날 때까지 사람들이 방에서 나갈 수 없음
* **관리 창에서 게임을 시작할 때 호출할 것!**

#### PUT `/room/{room_id}/end` (`room_id`(int))
* `room_id`번째 방이 플레이 방이고 손을 입력할 수 있는 시간이 모두 경과된 경우 플레이가 종료된 방으로 변경
* 이것이 호출되면 이 방의 사람들이 모두 로그아웃되기 때문에 다른 방에 새로 입장할 수 있게 됨
* 프론트엔드에서 이것을 직접 호출해 주어야 게임이 끝난 것으로 판정됨
* **게임 창에서 프론트엔드가 제한 시간을 재다가 시간이 끝날 때 2초 정도 여유를 가지고 호출할 것!**

#### GET `/room/{room_id}/hand` (`room_id`(int), `limit`(int))
* `room_id`번째 방에서 가장 마지막으로 입력된 `limit`개의 손 목록을 반환
  * 목록의 0번째 인덱스가 가장 최근에 입력된 손
  * `limit`의 기본값은 15
* **게임 창에서 타임라인을 표시할 때 호출할 것!**

#### GET `/room/{room_id}/hand/list` (`room_id`(int))
* `room_id`번째 방에서 입력된 모든 손 목록을 반환
  * 목록의 0번째 인덱스가 가장 최근에 입력된 손
* **게임 창에서 타임라인을 표시할 때 호출할 것!**

#### POST `/room/{room_id}/hand` (`room_id`(int), `person_id`(int), `hand`(int))
* `room_id`번째 방에서 `person_id`번 사람이 손을 입력
  * `hand`: 0이면 Rock, 1이면 Scissor, 2이면 Paper
* `room_id`번째 방이 플레이 방이고 현재 손을 입력할 수 있는 시간대일 때에만 입력 가능
* 입력에 성공하면 `score`(점수 득실), `time`(입력 시각) 등이 포함된 오브젝트를 반환
  * `score`: -1이면 진 것, 0이면 비긴 것, +1이면 이긴 것
* **게임 창에서 사용자가 손을 입력할 때 호출할 것!**

#### GET `/room/{room_id}/game` (`room_id`(int))
* `room_id`번째 방의 사람들의 전적 목록을 반환
  * 목록의 length는 해당 방에 입장한 사람 수에 해당
  * 대기 방, 플레이 방, 플레이가 종료된 방 상관없이 정보 확인 가능
* 목록 안의 각 오브젝트는 한 사람의 전적 정보를 담고 있음
  * `rank`(순위)
    * 점수(`score`)가 높을수록 상위권
    * 점수가 같다면 `win`(이긴 횟수)이 많을수록 상위권
    * 이긴 횟수도 같다면 `draw`(비긴 횟수)가 많을수록 상위권
    * 비긴 횟수도 같다면(대기 방에서도 해당) 동률 없이 무작위 순서로 순위가 매겨짐
  * `affiliation`(소속)과 `name`(이름)
  * `score`(총 점수)
    * 처음에는 0점
    * 손을 낼 때마다 자동으로 계산됨
  * `win`(이긴 횟수), `draw`(비긴 횟수), `lose`(진 횟수)
* **대기 창 또는 관리 창에서 방에 입장한 사람들의 목록을 표시할 때 호출할 것!**
* **게임 창에서 사람들의 순위를 포함한 정보를 표시할 때 호출할 것!**
* **결과 창에서 사람들의 순위를 포함한 정보를 표시할 때 호출할 것!**
-->

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