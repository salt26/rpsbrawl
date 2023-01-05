from fastapi.testclient import TestClient
import time
import datetime

def test_websocket_join_and_quit(app):
    client = TestClient(app)
    print("----------------- Test 1: join and quit -----------------")
    # 입장 요청
    print("@ send join")
    with client.websocket_connect("/join?affiliation=STAFF&name=test") as websocket:
        try:
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "success"
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "join" and data["response"] == "broadcast"

            # 퇴장 요청
            print("@@ send quit")
            websocket.send_json({
                'request': 'quit'
            })
            data = websocket.receive_json(mode='text')
            print(data)
            assert data["request"] == "quit" and data["response"] == "success"
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


# 프로젝트 루트 폴더(sql_app 폴더의 상위 폴더)에서 실행할 것!
if __name__ == '__main__':
    if __package__ is None:
        import sys
        from os import path
        sys.path.append(path.dirname(path.abspath(__file__)))

        from sql_app.main import app
    else:
        from .sql_app.main import app
    test_websocket_join_and_quit(app)
    print()
    test_websocket_join_and_start_and_hand(app)
    print()
    test_websocket_join_and_error_and_disconnect(app)
    print()
    test_websocket_forbidden_start(app)
    print()