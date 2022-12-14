# Rock-Scissor-Paper Brawl
* 네트워크 가위바위보 난투
* FastAPI로 구현

## Backend
### How to run

#### Install
* Python 3.8.4 사용
  * 3.6 이상의 버전이면 작동
* `pip install fastapi`
* `pip install "uvicorn[standard]"`
* `pip install sqlalchemy`

#### Run
* `cd {root_of_this_repository}`
* `uvicorn sql_app.main:app --port 8000 --reload`
  * 배포할 때에는 `--reload` 옵션 없이 실행
  * 브라우저에서 `http://127.0.0.1:8000/docs` 접속

### API
#### POST `/room` (`affiliation`(string), `name`(string))
* 소속(`affiliation`)과 이름(`name`)을 가진 사람을 마지막 대기 방에 입장시킴 (회원가입 겸 로그인)
* 특별히 `affiliation=Staff`이고 `name=관리자`인 사람은 admin으로 표시됨
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