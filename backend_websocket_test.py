from fastapi.testclient import TestClient
import time
import datetime

def test_websocket_signin_and_signout(app):
    client = TestClient(app)
    print("----------------- Test 1: signin and signout -----------------")
    # 로그인 요청
    print("01. send signin")
    with client.websocket_connect("/signin?name=test") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signin" and data["response"] == "success"

            # 로그아웃 요청
            print("\n02. send signout")
            websocket.send_json({
                'request': 'signout'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signout" and data["response"] == "success"
        except AssertionError:
            pass

def test_websocket_create_and_quit(app):
    client = TestClient(app)
    print("----------------- Test 2: create and quit -----------------")
    # 로그인 요청
    print("01. send signin")
    with client.websocket_connect("/signin?name=test") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signin" and data["response"] == "success"
            
            # 방 생성 요청
            print("\n02. send create")
            websocket.send_json({
                'request': 'create',
                'room_name': "Welcome!",
                'mode': 0,
                'password': ""
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "create" and data["response"] == "success"

            # 퇴장 요청 (방에 혼자 있었으므로 방이 제거됨)
            print("\n03. send quit -> room removed")
            websocket.send_json({
                'request': 'quit'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "quit" and data["response"] == "success"
            
            # 잘못된 방 생성 요청 1
            print("\n04. send create mode=2 -> bad request")
            websocket.send_json({
                'request': 'create',
                'room_name': "Welcome!",
                'mode': 2,
                'password': ""
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "create" and data["response"] == "error"
            
            # 잘못된 방 생성 요청 2
            print("\n05. send create name=\"123456789012345678901234567890123\" -> bad request")
            websocket.send_json({
                'request': 'create',
                'room_name': "123456789012345678901234567890123",
                'mode': 1,
                'password': ""
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "create" and data["response"] == "error"
            
            # 잘못된 방 생성 요청 3
            print("\n06. send create name=\"\" -> bad request")
            websocket.send_json({
                'request': 'create',
                'room_name': "",
                'mode': 1,
                'password': ""
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "create" and data["response"] == "error"
            
            # 잘못된 방 생성 요청 4
            print("\n07. send create password=\"123456789012345678901\" -> bad request")
            websocket.send_json({
                'request': 'create',
                'room_name': "Welcome!",
                'mode': 1,
                'password': "123456789012345678901"
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "create" and data["response"] == "error"
            
            # 모드와 비밀번호 없는 방 생성 요청
            print("\n08. send create without mode and password")
            websocket.send_json({
                'request': 'create',
                'room_name': "Welcome!"
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "create" and data["response"] == "success"

            # 퇴장 요청 (방에 혼자 있었으므로 방이 제거됨)
            print("\n09. send quit -> room removed")
            websocket.send_json({
                'request': 'quit'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "quit" and data["response"] == "success"

            # 로그아웃 요청
            print("\n10. send signout")
            websocket.send_json({
                'request': 'signout'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signout" and data["response"] == "success"
        except AssertionError:
            pass


def test_websocket_setting_and_team(app):
    client = TestClient(app)
    print("----------------- Test 3: setting and team -----------------")
    # 로그인 요청
    print("01. send signin")
    with client.websocket_connect("/signin?name=test") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signin" and data["response"] == "success"
            
            # 방 생성 요청
            print("\n02. send create")
            websocket.send_json({
                'request': 'create',
                'room_name': "Welcome!",
                'mode': 0,
                'password': ""
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "create" and data["response"] == "success"

            # 설정 변경 요청: 모든 설정 변경
            print("\n03. send setting name=\"Hello!\" mode=1 password=\"password\" bot_s=1 bot_d=1 max_p=25")
            websocket.send_json({
                'request': "setting",
                'name': "Hello!",
                'mode': 1,
                'password': "password",
                'bot_skilled': 1,
                'bot_dumb': 1,
                'max_persons': 25
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "broadcast"

            # 설정 변경 요청: 일부 설정 변경 1
            print("\n04. send setting password=\"\"")
            websocket.send_json({
                'request': "setting",
                'password': "",
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "broadcast"

            # 설정 변경 요청: 일부 설정 변경 2
            print("\n05. send setting password=\"password\" bot_s=9")
            websocket.send_json({
                'request': "setting",
                'password': "password",
                'bot_skilled': 9
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "broadcast"

            # 설정 변경 요청: 일부 설정 변경 3
            print("\n06. send setting bot_d=5")
            websocket.send_json({
                'request': "setting",
                'bot_dumb': 5
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "broadcast"

            # 잘못된 설정 변경 요청 1
            print("\n07. send setting name=\"\" -> bad request")
            websocket.send_json({
                'request': "setting",
                'name': "",
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "error"

            # 잘못된 설정 변경 요청 2
            print("\n08. send setting name=\"123456789012345678901234567890123\" -> bad request")
            websocket.send_json({
                'request': "setting",
                'name': "123456789012345678901234567890123",
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "error"

            # 잘못된 설정 변경 요청 3
            print("\n09. send setting mode=3 -> bad request")
            websocket.send_json({
                'request': "setting",
                'mode': 3,
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "error"

            # 잘못된 설정 변경 요청 4
            print("\n10. send setting password=\"123456789012345678901\" -> bad request")
            websocket.send_json({
                'request': "setting",
                'password': "123456789012345678901",
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "error"

            # 잘못된 설정 변경 요청 5
            print("\n11. send setting bot_skilled=-1 -> bad request")
            websocket.send_json({
                'request': "setting",
                'bot_skilled': -1,
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "error"

            # 잘못된 설정 변경 요청 6
            print("\n12. send setting bot_dumb=11 -> bad request")
            websocket.send_json({
                'request': "setting",
                'bot_dumb': 11,
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "error"

            # 잘못된 설정 변경 요청 7
            print("\n13. send setting max_persons=31 -> bad request")
            websocket.send_json({
                'request': "setting",
                'max_persons': 31,
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "error"

            # 잘못된 설정 변경 요청 8
            print("\n14. send setting max_persons=10 -> bad request (1 + 9 + 5 > 10)")
            websocket.send_json({
                'request': "setting",
                'max_persons': 10,
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "error"

            # 잘못된 설정 변경 요청 9
            print("\n15. send setting bot_d=10 max_p=15 -> bad request (1 + 9 + 10 > 15) -> rollback to bot_d=5")
            websocket.send_json({
                'request': "setting",
                'bot_dumb': 10,
                'max_persons': 15,
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "error"

            # 설정 변경 요청 4
            print("\n16. send setting max_persons=15 (1 + 9 + 5 <= 15)")
            websocket.send_json({
                'request': "setting",
                'max_persons': 15,
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "broadcast"

            # 잘못된 설정 변경 요청 10
            print("\n17. send setting bot_skilled=10 -> bad request (1 + 10 + 5 > 15)")
            websocket.send_json({
                'request': "setting",
                'bot_skilled': 10,
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "error"

            # 설정 변경 요청: 일부 설정 변경 5
            print("\n18. send setting bot_s=0 bot_d=0")
            websocket.send_json({
                'request': "setting",
                'bot_skilled': 0,
                'bot_dumb': 0,
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "broadcast"

            # 설정 변경 요청: 일부 설정 변경 6
            print("\n19. send setting max_persons=1")
            websocket.send_json({
                'request': "setting",
                'max_persons': 1
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "broadcast"

            # 잘못된 설정 변경 요청 11
            print("\n20. send setting max_persons=0 -> bad request (1 + 0 + 0 > 0)")
            websocket.send_json({
                'request': "setting",
                'max_persons': 0,
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "error"

            # 팀 변경 요청
            print("\n21. send team 7")
            websocket.send_json({
                'request': "team",
                'team': 7
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "team" and data["response"] == "broadcast"

            # 잘못된 팀 변경 요청 1
            print("\n22. send team -1 -> bad request")
            websocket.send_json({
                'request': "team",
                'team': -1
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "team" and data["response"] == "error"

            # 잘못된 팀 변경 요청 2
            print("\n23. send team None -> bad request")
            websocket.send_json({
                'request': "team"
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "team" and data["response"] == "error"

            # 퇴장하지 않고 로그아웃 요청
            print("\n24. send signout before quit")
            websocket.send_json({
                'request': 'signout'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signout" and data["response"] == "success"
        except AssertionError:
            pass


def test_websocket_join_and_start_and_hand(app):
    client = TestClient(app)
    print("------------ Test 2: join and start and hand ------------")
    # 입장 요청
    print("@ send join")
    with client.websocket_connect("/join?affiliation=STAFF&name=관리자") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "success"
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "broadcast"
            
            # 게임 시작 요청
            print("@@ send start 3 10")
            websocket.send_json({
                'request': 'start',
                'time_offset': 3,
                'time_duration': 10
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'init_data'

            # 게임 시작 후 손 입력을 받기 전에 손 입력 요청 -> 오류 응답
            print("@@@ send hand 0 -> error response")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "error"

            # 손 입력을 받기 시작한다는 응답
            data = websocket.receive_json(mode='text')
            print("@@@@ start response")
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'room_start'

            time.sleep(2)

            # 손 입력을 받기 시작한 후에 손 입력 요청
            print("@@@@@ send hand 0")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(3)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (지는 손)
            print("@@@@@@ send hand 1 -> lose")
            websocket.send_json({
                'request': 'hand',
                'hand': 1
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(2)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (이기는 손)
            print("@@@@@@@ send hand 0 -> win")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            # 게임이 종료되었다는 응답 -> 자동 퇴장
            data = websocket.receive_json(mode='text')
            print("@@@@@@@@ end response")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            print("@@@@@@@@@ send hand 0 -> not connected")
            try:
                websocket.send_json({
                    'request': 'hand',
                    'hand': 0
                })
            except Exception as e:
                assert e.__class__ == RuntimeError and str(e) == 'Cannot call "send" once a close message has been sent.'
        
        except AssertionError:
            pass

def test_websocket_join_and_error_and_disconnect(app):
    client = TestClient(app)
    print("--------- Test 3: join and error and disconnect ---------")
    # 입장 요청
    print("@ send join")
    with client.websocket_connect("/join?affiliation=STAFF&name=test_villain") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "success"
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "broadcast"

            print("@@ send plain text (not a JSON)")
            websocket.send_text("Hello world!")
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "" and data["response"] == "error"
            
            print("@@@ disconnected (without sending quit)")
        
        except AssertionError:
            pass

    
    print("@@@@ send join")
    with client.websocket_connect("/join?affiliation=STAFF&name=test_villain") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "success"
            room_id = data["data"]["room_id"]
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "broadcast"

            print("@@@@@ send start (without required keyword arguments) -> disconnect")
            websocket.send_json({
                'request': 'start'
            })
            data = client.get("/room/" + str(room_id))
            print(data.json())
            assert data.json()["state"] == 0
        
        except AssertionError:
            pass

    print("@@@@@@ send join")
    with client.websocket_connect("/join?affiliation=STAFF&name=test_villain") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "success"
            room_id = data["data"]["room_id"]
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "broadcast"
            
            print("@@@@@@@ disconnected (without sending quit)")
            
        except AssertionError:
            pass

def test_websocket_forbidden_start(app):
    client = TestClient(app)
    print("---------------- Test 4: forbidden start ----------------")
    # 입장 요청
    print("@ send join")
    with client.websocket_connect("/join?affiliation=UPnL&name=아무개") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "success"
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "broadcast"
            
            # 게임 시작 요청
            print("@@ send start 3 10")
            websocket.send_json({
                'request': 'start',
                'time_offset': 3,
                'time_duration': 10
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "start" and data["response"] == "error"

            # 퇴장 요청
            print("@@@ send quit")
            websocket.send_json({
                'request': 'quit'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "quit" and data["response"] == "success"
            
        except AssertionError:
            pass

def test_websocket_many_hands(app):
    client = TestClient(app)
    print("------------------- Test 5: many hands ------------------")
    # 입장 요청
    print("@ send join")
    with client.websocket_connect("/join?affiliation=STAFF&name=관리자") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "success"
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "broadcast"
            
            # 게임 시작 요청
            print("@@ send start 3 10")
            websocket.send_json({
                'request': 'start',
                'time_offset': 3,
                'time_duration': 10
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'init_data'

            # 손 입력을 받기 시작한다는 응답
            data = websocket.receive_json(mode='text')
            print("@@@ start response")
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'room_start'

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청
            print("@@@@ send hand 0")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (지는 손)
            print("@@@@@ send hand 1 -> lose")
            websocket.send_json({
                'request': 'hand',
                'hand': 1
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (이기는 손)
            print("@@@@@@ send hand 0 -> win")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'
            
            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (비기는 손)
            print("@@@@@@@ send hand 0 -> draw")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'
            
            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (비기는 손)
            print("@@@@@@@@ send hand 0 -> draw")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'
            
            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (비기는 손)
            print("@@@@@@@@@ send hand 0 -> draw")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'
            
            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (비기는 손, 7개 중 마지막 6개만 표시)
            print("@@@@@@@@@@ send hand 0 -> draw")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'
            
            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (비기는 손, 8개 중 마지막 6개만 표시)
            print("@@@@@@@@@@@ send hand 0 -> draw")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'
            
            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (이기는 손, 9개 중 마지막 6개만 표시)
            print("@@@@@@@@@@@@ send hand 2 -> win")
            websocket.send_json({
                'request': 'hand',
                'hand': 2
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            # 게임이 종료되었다는 응답 -> 자동 퇴장
            data = websocket.receive_json(mode='text')
            print("@@@@@@@@@@@@@ end response")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            # 9개 손 전부 표시
        
        except AssertionError:
            pass

# 프로젝트 루트 폴더(sql_app 폴더의 상위 폴더)에서 실행할 것!
if __name__ == '__main__':
    if __package__ is None:
        import sys
        from os import path
        sys.path.append(path.dirname(path.abspath(__file__)))

        from sql_app.main import app
    else:
        from .sql_app.main import app
    test_websocket_signin_and_signout(app)
    print()
    test_websocket_create_and_quit(app)
    print()
    test_websocket_setting_and_team(app)
    print()
    """
    test_websocket_join_and_start_and_hand(app)
    print()
    test_websocket_join_and_error_and_disconnect(app)
    print()
    test_websocket_forbidden_start(app)
    print()
    test_websocket_many_hands(app)
    print()
    """