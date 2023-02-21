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
            print("assertion failed")
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
            print("assertion failed")
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
            print("\n21. send team 6")
            websocket.send_json({
                'request': "team",
                'team': 6
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
            print("assertion failed")
            pass

def test_websocket_normal_start_and_hand(app):
    client = TestClient(app)
    print("----------------- Test 4: normal mode start and hand -----------------")
    # 로그인 요청
    print("01. send signin")
    with client.websocket_connect("/signin?name=test") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signin" and data["response"] == "success"
            
            # 방 목록 새로고침 요청
            print("\n02. refresh")
            websocket.send_json({
                'request': 'refresh'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "refresh" and data["response"] == "success"

            # 방 생성 요청
            print("\n03. send create")
            websocket.send_json({
                'request': 'create',
                'room_name': "Welcome!",
                'mode': 0,
                'password': ""
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "create" and data["response"] == "success"

            # 게임 시작 요청
            print("\n04. send start 3 10")
            websocket.send_json({
                'request': 'start',
                'time_offset': 3,
                'time_duration': 10
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'init_data'

            # 게임 시작 후 손 입력을 받기 전에 손 입력 요청 -> 오류 응답
            print("\n05. send hand 0 -> error response")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "error"

            # 손 입력을 받기 시작한다는 응답
            data = websocket.receive_json(mode='text')
            print("\n06. start response")
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'room_start'

            time.sleep(2)

            # 손 입력을 받기 시작한 후에 손 입력 요청
            print("\n07. send hand 0")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 잘못된 손 입력 요청
            print("\n08. send hand 3 -> bad request")
            websocket.send_json({
                'request': 'hand',
                'hand': 3
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "error"

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 잘못된 손 입력 요청
            print("\n09. send hand None -> bad request")
            websocket.send_json({
                'request': 'hand'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "error"

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (지는 손)
            print("\n10. send hand 1 -> lose")
            websocket.send_json({
                'request': 'hand',
                'hand': 1
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(2)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (이기는 손)
            print("\n11. send hand 0 -> win")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            # 시간이 끝나 게임이 종료되었다는 응답
            data = websocket.receive_json(mode='text')
            print("\n12. end response hand_data")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            # 손 입력이 종료된 후에 손 입력 요청
            print("\n13. send hand 0 -> game has ended")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "error"
            
            time.sleep(3)
            
            # 방 목록 새로고침 요청
            print("\n14. refresh")
            websocket.send_json({
                'request': 'refresh'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "refresh" and data["response"] == "success"

            # 게임이 종료되고 10초 후 새로운 방에 재입장되었다는 응답
            data = websocket.receive_json(mode='text')
            print("\n15. end response join_data")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'join_data'

            # 방 목록 새로고침 요청
            print("\n16. refresh")
            websocket.send_json({
                'request': 'refresh'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "refresh" and data["response"] == "success"

            # 퇴장 요청 (방에 혼자 있었으므로 방이 제거됨)
            print("\n17. send quit -> room removed")
            websocket.send_json({
                'request': 'quit'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "quit" and data["response"] == "success"

            # 방 목록 새로고침 요청
            print("\n18. refresh")
            websocket.send_json({
                'request': 'refresh'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "refresh" and data["response"] == "success"

            # 로그아웃 요청
            print("\n19. send signout")
            websocket.send_json({
                'request': 'signout'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signout" and data["response"] == "success"
        except AssertionError:
            print("assertion failed")
            pass


def test_websocket_setting_and_many_hand(app):
    client = TestClient(app)
    print("----------------- Test 5: setting and many hand -----------------")
    # 로그인 요청
    print("01. send signin")
    with client.websocket_connect("/signin?name=test") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signin" and data["response"] == "success"
            
            # 방 목록 새로고침 요청
            print("\n02. refresh")
            websocket.send_json({
                'request': 'refresh'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "refresh" and data["response"] == "success"

            # 방 생성 요청
            print("\n03. send create")
            websocket.send_json({
                'request': 'create',
                'room_name': "Welcome!",
                'mode': 1,
                'password': ""
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "create" and data["response"] == "success"

            # 설정 변경 요청: 봇 수를 제외한 모든 설정 변경
            print("\n04. send setting name=\"Hello!\" mode=0 password=\"password\" max_p=25")
            websocket.send_json({
                'request': "setting",
                'name': "Hello!",
                'mode': 0,
                'password': "password",
                'max_persons': 25
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "broadcast"

            # 팀 변경 요청
            print("\n05. send team 3")
            websocket.send_json({
                'request': "team",
                'team': 3
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "team" and data["response"] == "broadcast"

            # 게임 시작 요청
            print("\n06. send start 3 10")
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
            print("\n07. start response")
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'room_start'

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청
            print("\n08. send hand 0")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (지는 손)
            print("\n09. send hand 1 -> lose")
            websocket.send_json({
                'request': 'hand',
                'hand': 1
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (이기는 손)
            print("\n10. send hand 0 -> win")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'
            
            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (비기는 손)
            print("\n11. send hand 0 -> draw")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'
            
            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (비기는 손)
            print("\n12. send hand 0 -> draw")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'
            
            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (비기는 손)
            print("\n13. send hand 0 -> draw")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'
            
            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (비기는 손, 7개 중 마지막 6개만 표시)
            print("\n14. send hand 0 -> draw -> show last 6 hands")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'
            
            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (비기는 손, 8개 중 마지막 6개만 표시)
            print("\n15. send hand 0 -> draw -> show last 6 hands")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'
            
            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (이기는 손, 9개 중 마지막 6개만 표시)
            print("\n16. send hand 2 -> win -> show last 6 hands")
            websocket.send_json({
                'request': 'hand',
                'hand': 2
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            # 시간이 끝나 게임이 종료되었다는 응답
            data = websocket.receive_json(mode='text')
            print("\n17. end response hand_data")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            # 방 목록 새로고침 요청
            print("\n18. refresh")
            websocket.send_json({
                'request': 'refresh'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "refresh" and data["response"] == "success"

            # 게임이 종료되고 10초 후 새로운 방에 재입장되었다는 응답
            data = websocket.receive_json(mode='text')
            print("\n19. end response join_data")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'join_data'

            # 방 목록 새로고침 요청
            print("\n20. refresh")
            websocket.send_json({
                'request': 'refresh'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "refresh" and data["response"] == "success"

            # 팀 변경 요청
            print("\n21. send team 6")
            websocket.send_json({
                'request': "team",
                'team': 6
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "team" and data["response"] == "broadcast"

            # 설정 변경 요청: 일부 설정 변경
            print("\n22. send setting bot_s=5 bot_d=4")
            websocket.send_json({
                'request': "setting",
                'bot_skilled': 5,
                'bot_dumb': 4,
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "broadcast"

            # 방 목록 새로고침 요청
            print("\n23. refresh")
            websocket.send_json({
                'request': 'refresh'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "refresh" and data["response"] == "success"

            # 퇴장 요청 -> 방에 혼자 있었으므로 방이 제거됨
            print("\n24. send quit -> room removed")
            websocket.send_json({
                'request': 'quit'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "quit" and data["response"] == "success"

            # 방 목록 새로고침 요청
            print("\n25. refresh")
            websocket.send_json({
                'request': 'refresh'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "refresh" and data["response"] == "success"

            # 로그아웃 요청
            print("\n26. send signout")
            websocket.send_json({
                'request': 'signout'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signout" and data["response"] == "success"
        except AssertionError:
            print("assertion failed")
            pass

def test_websocket_error_and_disconnect(app):
    client = TestClient(app)
    print("----------------- Test 6: error and disconnect -----------------")
    # 로그인 요청
    print("\n01. send signin name=\"\"")
    with client.websocket_connect("/signin?name=") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signin" and data["response"] == "error"
        except AssertionError:
            print("assertion failed")
            pass

    print("\n02. send signin")
    with client.websocket_connect("/signin?name=test") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signin" and data["response"] == "success"

            # 설정 변경 요청 -> 방 밖에서 했으므로 오류
            print("\n03. send setting name=\"Hello!\" mode=1 -> you are not in any room")
            websocket.send_json({
                'request': "setting",
                'name': "Hello!",
                'mode': 1,
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "error"

            # 팀 변경 요청 -> 방 밖에서 했으므로 오류
            print("\n04. send team 3 -> you are not in any room")
            websocket.send_json({
                'request': "team",
                'team': 3
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "team" and data["response"] == "error"

            # 퇴장 요청 -> 방 밖에서 했으므로 오류
            print("\n05. send quit -> you are not in any room")
            websocket.send_json({
                'request': 'quit'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "quit" and data["response"] == "error"

            # 게임 시작 요청 -> 방 밖에서 했으므로 오류
            print("\n06. send start 3 10 -> you are not in any room")
            websocket.send_json({
                'request': 'start',
                'time_offset': 3,
                'time_duration': 10
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "start" and data["response"] == "error"

            # 손 입력 요청 -> 방 밖에서 했으므로 오류
            print("\n07. send hand 0 -> you are not in any room")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "error"

            # 방 생성 요청
            print("\n08. send create")
            websocket.send_json({
                'request': 'create',
                'room_name': "Hell!",
                'mode': 1,
                'password': "password"
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "create" and data["response"] == "success"
            room_id = data["data"]["room"]["id"]

            # 방 생성 요청 -> 방 안에서 했으므로 오류
            print("\n09. send create -> you are already in a room")
            websocket.send_json({
                'request': 'create',
                'room_name': "Hell!",
                'mode': 1,
                'password': "password"
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "create" and data["response"] == "error"

            # 방 입장 요청 -> 방 안에서 했으므로 오류
            print("\n10. send join -> you are already in a room")
            websocket.send_json({
                'request': 'join',
                'room_id': room_id,
                'password': "password"
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "error"

            # 게임 시작 요청
            print("\n11. send start 3 10")
            websocket.send_json({
                'request': 'start',
                'time_offset': 3,
                'time_duration': 10
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'init_data'
            
            time.sleep(1)

            print("\n12. disconnect")

        except AssertionError:
            print("assertion failed")
            pass
        
    time.sleep(1)

    # 재접속 -> 게임이 시작되었지만 아직 손 입력을 받기 전
    print("\n13. send signin -> reconnected")
    with client.websocket_connect("/signin?name=test") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signin" and data["response"] == "reconnected"

            # 손 입력을 받기 시작한다는 응답
            data = websocket.receive_json(mode='text')
            print("\n14. start response")
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'room_start'

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청
            print("\n15. send hand 0")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(1)

            # 로그아웃 요청
            print("\n16. send signout")
            websocket.send_json({
                'request': 'signout'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signout" and data["response"] == "success"

        except AssertionError:
            print("assertion failed")
            pass

    time.sleep(1)

    # 재접속 -> 아직 플레이 중
    print("\n17. send signin -> reconnected")
    with client.websocket_connect("/signin?name=test") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signin" and data["response"] == "reconnected"

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청
            print("\n18. send hand 2")
            websocket.send_json({
                'request': 'hand',
                'hand': 2
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(1)

            print("\n19. disconnect")
        
        except AssertionError:
            print("assertion failed")
            pass

    time.sleep(3)
    # 시간이 끝나 게임이 종료되었다는 응답은 접속이 끊어진 상태라서 받지 못함
    print("\n20. end response hand_data -> cannot receive")

    time.sleep(2)
    
    # 재접속 -> 손 입력은 종료되었지만 게임 방의 상태는 아직 플레이 상태
    print("\n21. send signin -> reconnected")
    with client.websocket_connect("/signin?name=test") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signin" and data["response"] == "reconnected"

            time.sleep(3)

            # 손 입력이 종료된 후에 손 입력 요청
            print("\n22. send hand 1 -> game has ended")
            websocket.send_json({
                'request': 'hand',
                'hand': 1
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "error"

            # 게임이 종료되고 10초 후(재접속 후 8초 후) 새로운 방에 재입장되었다는 응답
            data = websocket.receive_json(mode='text')
            print("\n23. end response join_data")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'join_data'

            # 웹소켓 연결 강제 종료
            print("\n24. websocket close")
            websocket.close()

        except AssertionError:
            print("assertion failed")
            pass

def test_websocket_reconnect(app):
    client = TestClient(app)
    print("----------------- Test 7: reconnect -----------------")

    print("\n01. send signin")
    with client.websocket_connect("/signin?name=test") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signin" and data["response"] == "success"

            # 방 생성 요청
            print("\n02. send create")
            websocket.send_json({
                'request': 'create',
                'room_name': "Hell!",
                'mode': 1,
                'password': "password"
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "create" and data["response"] == "success"

            # 게임 시작 요청
            print("\n03. send start 3 10")
            websocket.send_json({
                'request': 'start',
                'time_offset': 3,
                'time_duration': 10
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'init_data'
            
            time.sleep(1)

            print("\n04. disconnect")

        except AssertionError:
            print("assertion failed")
            pass
        
    time.sleep(2)
    # 손 입력을 받기 시작한다는 응답은 접속이 끊어진 상태라서 받지 못함
    print("\n05. start response -> cannot receive")

    time.sleep(3)

    # 재접속 -> 게임이 시작되었고 손 입력을 받는 중
    print("\n06. send signin -> reconnected")
    with client.websocket_connect("/signin?name=test") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signin" and data["response"] == "reconnected"

            time.sleep(3)

            # 손 입력을 받기 시작한 후에 손 입력 요청
            print("\n07. send hand 0")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            # 시간이 끝나 게임이 종료되었다는 응답
            data = websocket.receive_json(mode='text')
            print("\n08. end response hand_data")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(5)
            print("\n09. disconnect")

        except AssertionError:
            print("assertion failed")
            pass

    time.sleep(5)
    # 새 방으로 입장되었다는 응답은 접속이 끊어진 상태라서 받지 못함
    print("\n10. end response join_data -> cannot receive")

    time.sleep(1)
    
    # 접속 -> 기존 방의 게임이 끝났으므로 재접속으로 취급되지 않고 방 목록 화면으로 접속
    print("\n11. send signin -> not reconnected")
    with client.websocket_connect("/signin?name=test") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signin" and data["response"] == "success"
            
            # 방 목록 새로고침 요청
            print("\n12. refresh")
            websocket.send_json({
                'request': 'refresh'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "refresh" and data["response"] == "success"

            # 퇴장 요청 -> 방 목록 화면에 있으므로 실패
            print("\n13. send quit -> you are not in any room")
            websocket.send_json({
                'request': 'quit'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "quit" and data["response"] == "error"

            # 로그아웃 요청
            print("\n14. send signout")
            websocket.send_json({
                'request': 'signout'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signout" and data["response"] == "success"

        except AssertionError:
            print("assertion failed")
            pass


def test_websocket_play_with_a_skilled_bot(app):
    client = TestClient(app)
    print("----------------- Test 8: play with a skilled bot -----------------")
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

            # 설정 변경 요청: 봇 수 변경
            print("\n03. send setting bot_s=1")
            websocket.send_json({
                'request': "setting",
                'bot_skilled': 1
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "broadcast"

            # 게임 시작 요청
            print("\n04. send start 3 10")
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
            print("\n05. start response")
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'room_start'

            count = 0
            # 게임이 끝날 때까지 응답 받기 반복
            while True:
                count += 1
                data = websocket.receive_json(mode='text')
                if data["request"] == "hand" and data["response"] == "broadcast":
                    # 봇이 손을 입력했다는 응답
                    print("\n06-" + str(count) + ". hand response by bot")
                    print(data)
                elif data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'hand_data':
                    # 시간이 끝나 게임이 종료되었다는 응답
                    print("\n07. end response hand_data")
                    print(data)
                    break
                else:
                    print("\n06-" + str(count) + ". unknown response")
                    print(data)
                    assert False

            # 게임이 종료되고 10초 후 새로운 방에 재입장되었다는 응답
            data = websocket.receive_json(mode='text')
            print("\n08. end response join_data")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'join_data'

            time.sleep(1)

            # 퇴장 요청 -> 방에 혼자 있었으므로 방이 제거됨
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
            print("assertion failed")
            pass

# test_websocket_play_with_a_skilled_bot(app) 의 출력 결과 중 일부
"""
{
    'request': 'hand',
    'response': 'broadcast',
    'type': 'hand_data',
    'data': {
        'hand_list': [
            {'team': -1, 'name': 'S-1676618077-762663', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-17 16:14:51.974288 KST', 'room_id': 13},
            {'team': -1, 'name': 'S-1676618077-762663', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-17 16:14:53.754109 KST', 'room_id': 13},
            {'team': -1, 'name': 'S-1676618077-762663', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-17 16:14:55.619460 KST', 'room_id': 13},
            {'team': -1, 'name': 'S-1676618077-762663', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-17 16:14:57.486072 KST', 'room_id': 13},
            {'team': -1, 'name': 'S-1676618077-762663', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-17 16:14:59.080475 KST', 'room_id': 13},
            {'team': -1, 'name': 'S-1676618077-762663', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-17 16:15:00.961673 KST', 'room_id': 13}
        ],
        'game_list': [
            {'rank': 1, 'team': -1, 'name': 'S-1676618077-762663', 'is_host': False, 'is_human': False, 'score': 6, 'win': 6, 'draw': 0, 'lose': 0, 'room_id': 13},
            {'rank': 2, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 13}
        ]
    }
}
"""

def test_websocket_play_with_a_dumb_bot(app):
    client = TestClient(app)
    print("----------------- Test 9: play with a dumb bot -----------------")
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

            # 설정 변경 요청: 봇 수 변경
            print("\n03. send setting bot_d=1")
            websocket.send_json({
                'request': "setting",
                'bot_dumb': 1
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "broadcast"

            # 게임 시작 요청
            print("\n04. send start 3 10")
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
            print("\n05. start response")
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'room_start'

            count = 0
            # 게임이 끝날 때까지 응답 받기 반복
            while True:
                count += 1
                data = websocket.receive_json(mode='text')
                if data["request"] == "hand" and data["response"] == "broadcast":
                    # 봇이 손을 입력했다는 응답
                    print("\n06-" + str(count) + ". hand response by bot")
                    print(data)
                elif data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'hand_data':
                    # 시간이 끝나 게임이 종료되었다는 응답
                    print("\n07. end response hand_data")
                    print(data)
                    break
                else:
                    print("\n06-" + str(count) + ". unknown response")
                    print(data)
                    assert False

            # 게임이 종료되고 10초 후 새로운 방에 재입장되었다는 응답
            data = websocket.receive_json(mode='text')
            print("\n08. end response join_data")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'join_data'

            time.sleep(1)

            # 퇴장 요청 -> 방에 혼자 있었으므로 방이 제거됨
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
            print("assertion failed")
            pass


def test_websocket_play_with_many_bots(app):
    client = TestClient(app)
    print("----------------- Test 10: play with many bots -----------------")
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

            # 설정 변경 요청: 봇 수 변경
            print("\n03. send setting bot_s=3 bot_d=3")
            websocket.send_json({
                'request': "setting",
                'bot_skilled': 3,
                'bot_dumb': 3
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "broadcast"

            # 게임 시작 요청
            print("\n04. send start 3 10")
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
            print("\n05. start response")
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'room_start'

            count = 0
            # 게임이 끝날 때까지 응답 받기 반복
            while True:
                count += 1
                data = websocket.receive_json(mode='text')
                if data["request"] == "hand" and data["response"] == "broadcast":
                    # 봇이 손을 입력했다는 응답
                    print("\n06-" + str(count) + ". hand response by bot")
                    print(data)
                elif data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'hand_data':
                    # 시간이 끝나 게임이 종료되었다는 응답
                    print("\n07. end response hand_data")
                    print(data)
                    break
                else:
                    print("\n06-" + str(count) + ". unknown response")
                    print(data)
                    assert False

            # 게임이 종료되고 10초 후 새로운 방에 재입장되었다는 응답
            data = websocket.receive_json(mode='text')
            print("\n08. end response join_data")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'join_data'

            time.sleep(1)
            
            # 퇴장 요청 -> 방에 혼자 있었으므로 방이 제거됨
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
            print("assertion failed")
            pass

# test_websocket_play_with_many_bots(app) 의 출력 결과 중 일부
"""
{
    'request': 'end',
    'response': 'broadcast',
    'type': 'hand_data',
    'data': {
        'room': {'id': 15, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-17 16:25:27.031129 KST', 'start_time': '2023-02-17 16:25:43.074192 KST', 'end_time': '2023-02-17 16:25:54.406517 KST', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 3, 'bot_dumb': 3, 'max_persons': 30, 'num_persons': 13},
        'hand_list': [
            {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-17 16:25:27.031129 KST', 'room_id': 15},
            {'team': -1, 'name': 'D-1676618728-641138', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-17 16:25:43.507154 KST', 'room_id': 15},
            {'team': -1, 'name': 'S-1676618727-113644', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-17 16:25:43.905156 KST', 'room_id': 15},
            {'team': -1, 'name': 'S-1676618727-39072', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-17 16:25:44.370127 KST', 'room_id': 15},
            {'team': -1, 'name': 'S-1676618727-650588', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-17 16:25:44.825462 KST', 'room_id': 15},
            {'team': -1, 'name': 'D-1676618728-287653', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-17 16:25:45.357159 KST', 'room_id': 15},
            {'team': -1, 'name': 'D-1676618727-912025', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-17 16:25:45.908369 KST', 'room_id': 15},
            {'team': -1, 'name': 'S-1676618727-113644', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-17 16:25:46.757124 KST', 'room_id': 15},
            {'team': -1, 'name': 'S-1676618727-39072', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-17 16:25:47.230324 KST', 'room_id': 15},
            {'team': -1, 'name': 'D-1676618728-641138', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-17 16:25:47.706966 KST', 'room_id': 15},
            {'team': -1, 'name': 'S-1676618727-650588', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-17 16:25:48.479815 KST', 'room_id': 15},
            {'team': -1, 'name': 'D-1676618728-287653', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-17 16:25:48.936627 KST', 'room_id': 15},
            {'team': -1, 'name': 'D-1676618727-912025', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-17 16:25:49.374217 KST', 'room_id': 15},
            {'team': -1, 'name': 'S-1676618727-113644', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-17 16:25:50.192202 KST', 'room_id': 15},
            {'team': -1, 'name': 'S-1676618727-39072', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-17 16:25:50.783897 KST', 'room_id': 15},
            {'team': -1, 'name': 'D-1676618728-641138', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-17 16:25:51.308096 KST', 'room_id': 15},
            {'team': -1, 'name': 'S-1676618727-650588', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-17 16:25:52.050105 KST', 'room_id': 15},
            {'team': -1, 'name': 'S-1676618727-113644', 'is_human': False, 'hand': 2, 'score': 0, 'time': '2023-02-17 16:25:52.734318 KST', 'room_id': 15},
            {'team': -1, 'name': 'D-1676618728-287653', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-17 16:25:53.370584 KST', 'room_id': 15},
            {'team': -1, 'name': 'D-1676618727-912025', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-17 16:25:53.819636 KST', 'room_id': 15}
        ],
        'game_list': [
            {'rank': 1, 'team': -1, 'name': 'D-1676618728-287653', 'is_host': False, 'is_human': False, 'score': 3, 'win': 3, 'draw': 0, 'lose': 0, 'room_id': 15},
            {'rank': 2, 'team': -1, 'name': 'S-1676618727-650588', 'is_host': False, 'is_human': False, 'score': 2, 'win': 2, 'draw': 1, 'lose': 0, 'room_id': 15},
            {'rank': 3, 'team': -1, 'name': 'S-1676618727-113644', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 1, 'lose': 1, 'room_id': 15},
            {'rank': 4, 'team': -1, 'name': 'D-1676618728-641138', 'is_host': False, 'is_human': False, 'score': 1, 'win': 2, 'draw': 0, 'lose': 1, 'room_id': 15},
            {'rank': 5, 'team': -1, 'name': 'D-1676618727-912025', 'is_host': False, 'is_human': False, 'score': 1, 'win': 1, 'draw': 2, 'lose': 0, 'room_id': 15},
            {'rank': 6, 'team': -1, 'name': 'S-1676618727-39072', 'is_host': False, 'is_human': False, 'score': 0, 'win': 0, 'draw': 3, 'lose': 0, 'room_id': 15},
            {'rank': 7, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 15}
        ]
    }
}

{
    'request': 'end',
    'response': 'broadcast',
    'type': 'hand_data',
    'data': {
        'room': {'id': 16, 'state': 1, 'time_offset': 3, 'time_duration': 10, 'init_time': '2023-02-17 16:36:05.293573 KST', 'start_time': '2023-02-17 16:36:21.270804 KST', 'end_time': '2023-02-17 16:36:31.544894 KST', 'name': 'Welcome!', 'mode': 0, 'has_password': False, 'bot_skilled': 3, 'bot_dumb': 3, 'max_persons': 30, 'num_persons': 13},
        'hand_list': [
            {'team': 0, 'name': 'test', 'is_human': True, 'hand': 0, 'score': 0, 'time': '2023-02-17 16:36:05.293573 KST', 'room_id': 16},
            {'team': -1, 'name': 'S-1676619365-792594', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-17 16:36:21.892462 KST', 'room_id': 16},
            {'team': -1, 'name': 'D-1676619366-77963', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-17 16:36:22.379527 KST', 'room_id': 16},
            {'team': -1, 'name': 'S-1676619365-588509', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-17 16:36:22.749677 KST', 'room_id': 16},
            {'team': -1, 'name': 'D-1676619366-126782', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-17 16:36:23.278487 KST', 'room_id': 16},
            {'team': -1, 'name': 'S-1676619365-374043', 'is_human': False, 'hand': 1, 'score': 0, 'time': '2023-02-17 16:36:23.729354 KST', 'room_id': 16},
            {'team': -1, 'name': 'D-1676619366-44786', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-17 16:36:24.373309 KST', 'room_id': 16},
            {'team': -1, 'name': 'S-1676619365-792594', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-17 16:36:24.993880 KST', 'room_id': 16},
            {'team': -1, 'name': 'D-1676619366-126782', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-17 16:36:25.397045 KST', 'room_id': 16},
            {'team': -1, 'name': 'S-1676619365-588509', 'is_human': False, 'hand': 2, 'score': -1, 'time': '2023-02-17 16:36:25.894315 KST', 'room_id': 16},
            {'team': -1, 'name': 'D-1676619366-77963', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-17 16:36:26.354668 KST', 'room_id': 16},
            {'team': -1, 'name': 'S-1676619365-374043', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-17 16:36:27.107222 KST', 'room_id': 16},
            {'team': -1, 'name': 'S-1676619365-792594', 'is_human': False, 'hand': 0, 'score': 0, 'time': '2023-02-17 16:36:27.679716 KST', 'room_id': 16},
            {'team': -1, 'name': 'D-1676619366-44786', 'is_human': False, 'hand': 2, 'score': 1, 'time': '2023-02-17 16:36:28.063121 KST', 'room_id': 16},
            {'team': -1, 'name': 'S-1676619365-588509', 'is_human': False, 'hand': 1, 'score': 1, 'time': '2023-02-17 16:36:29.019412 KST', 'room_id': 16},
            {'team': -1, 'name': 'D-1676619366-126782', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-17 16:36:29.662637 KST', 'room_id': 16},
            {'team': -1, 'name': 'S-1676619365-374043', 'is_human': False, 'hand': 1, 'score': -1, 'time': '2023-02-17 16:36:30.336527 KST', 'room_id': 16},
            {'team': -1, 'name': 'D-1676619366-77963', 'is_human': False, 'hand': 0, 'score': 1, 'time': '2023-02-17 16:36:30.847537 KST', 'room_id': 16}
        ],
        'game_list': [
            {'rank': 1, 'team': -1, 'name': 'D-1676619366-126782', 'is_host': False, 'is_human': False, 'score': 3, 'win': 3, 'draw': 0, 'lose': 0, 'room_id': 16},
            {'rank': 2, 'team': -1, 'name': 'D-1676619366-77963', 'is_host': False, 'is_human': False, 'score': 3, 'win': 3, 'draw': 0, 'lose': 0, 'room_id': 16},
            {'rank': 3, 'team': -1, 'name': 'S-1676619365-792594', 'is_host': False, 'is_human': False, 'score': 2, 'win': 2, 'draw': 1, 'lose': 0, 'room_id': 16},
            {'rank': 4, 'team': -1, 'name': 'D-1676619366-44786', 'is_host': False, 'is_human': False, 'score': 2, 'win': 2, 'draw': 0, 'lose': 0, 'room_id': 16},
            {'rank': 5, 'team': -1, 'name': 'S-1676619365-374043', 'is_host': False, 'is_human': False, 'score': 0, 'win': 1, 'draw': 1, 'lose': 1, 'room_id': 16},
            {'rank': 6, 'team': 0, 'name': 'test', 'is_host': True, 'is_human': True, 'score': 0, 'win': 0, 'draw': 0, 'lose': 0, 'room_id': 16},
            {'rank': 7, 'team': -1, 'name': 'S-1676619365-588509', 'is_host': False, 'is_human': False, 'score': -1, 'win': 1, 'draw': 0, 'lose': 2, 'room_id': 16}
        ]
    }
}
"""

def test_websocket_play_with_so_many_bots(app):
    client = TestClient(app)
    print("----------------- Test 11: play with so many bots -----------------")
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

            # 설정 변경 요청: 봇 수 변경
            print("\n03. send setting bot_s=10 bot_d=10")
            websocket.send_json({
                'request': "setting",
                'bot_skilled': 10,
                'bot_dumb': 10
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "setting" and data["response"] == "broadcast"

            # 게임 시작 요청
            print("\n04. send start 3 30")
            websocket.send_json({
                'request': 'start',
                'time_offset': 3,
                'time_duration': 30
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'init_data'

            # 손 입력을 받기 시작한다는 응답
            data = websocket.receive_json(mode='text')
            print("\n05. start response")
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'room_start'

            count = 0
            # 게임이 끝날 때까지 응답 받기 반복
            while True:
                count += 1
                data = websocket.receive_json(mode='text')
                if data["request"] == "hand" and data["response"] == "broadcast":
                    # 봇이 손을 입력했다는 응답
                    print("\n06-" + str(count) + ". hand response by bot")
                    print(data)
                elif data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'hand_data':
                    # 시간이 끝나 게임이 종료되었다는 응답
                    print("\n07. end response hand_data")
                    print(data)
                    break
                else:
                    print("\n06-" + str(count) + ". unknown response")
                    print(data)
                    assert False

            # 게임이 종료되고 10초 후 새로운 방에 재입장되었다는 응답
            data = websocket.receive_json(mode='text')
            print("\n08. end response join_data")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'join_data'

            time.sleep(1)
            
            # 퇴장 요청 -> 방에 혼자 있었으므로 방이 제거됨
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
            print("assertion failed")
            pass


def test_websocket_limited_mode(app):
    client = TestClient(app)
    print("----------------- Test 12: limited mode -----------------")
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
                'room_name': "Limited",
                'mode': 1,
                'password': ""
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "create" and data["response"] == "success"

            # 게임 시작 요청
            print("\n03. send start 3 10")
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
            print("\n04. start response")
            print(data)
            assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'room_start'

            time.sleep(2)

            # 손 입력을 받기 시작한 후에 손 입력 요청
            print("\n05. send hand 0")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 같은 손 연속으로 입력 요청 -> 실패
            print("\n06. send hand 0 -> limited")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "error"

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (이기는 손)
            print("\n07. send hand 2")
            websocket.send_json({
                'request': 'hand',
                'hand': 2
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 같은 손 연속으로 입력 요청 -> 실패
            print("\n08. send hand 2 -> limited")
            websocket.send_json({
                'request': 'hand',
                'hand': 2
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "error"

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 손 입력 요청 (지는 손)
            print("\n09. send hand 0 -> lose")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_data'

            time.sleep(1)

            # 손 입력을 받기 시작한 후에 같은 손 연속으로 입력 요청 -> 실패
            print("\n10. send hand 0 -> limited")
            websocket.send_json({
                'request': 'hand',
                'hand': 0
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "hand" and data["response"] == "error"

            # 시간이 끝나 게임이 종료되었다는 응답
            data = websocket.receive_json(mode='text')
            print("\n11. end response hand_data")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'hand_data'
            
            time.sleep(3)

            # 게임이 종료되고 10초 후 새로운 방에 재입장되었다는 응답
            data = websocket.receive_json(mode='text')
            print("\n12. end response join_data")
            print(data)
            assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'join_data'

            # 퇴장 요청 (방에 혼자 있었으므로 방이 제거됨)
            print("\n13. send quit -> room removed")
            websocket.send_json({
                'request': 'quit'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "quit" and data["response"] == "success"

            # 로그아웃 요청
            print("\n14. send signout")
            websocket.send_json({
                'request': 'signout'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "signout" and data["response"] == "success"
        except AssertionError:
            print("assertion failed")
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

    #test_websocket_signin_and_signout(app)
    #print()
    #test_websocket_create_and_quit(app)
    #print()
    #test_websocket_setting_and_team(app)
    #print()
    #test_websocket_normal_start_and_hand(app)
    #print()
    #test_websocket_setting_and_many_hand(app)
    #print()
    #test_websocket_error_and_disconnect(app)
    #print()
    #test_websocket_reconnect(app)
    #print()

    #test_websocket_play_with_a_skilled_bot(app)
    #print()
    #test_websocket_play_with_a_dumb_bot(app)
    #print()
    
    #test_websocket_play_with_many_bots(app)
    #print()
    test_websocket_play_with_so_many_bots(app)
    print()
    #test_websocket_limited_mode(app)
    #print()
