from fastapi import FastAPI
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocket
import time

def test_websocket_join_and_quit(app):
    client = TestClient(app)
    with client.websocket_connect("/join?affiliation=Staff&name=test3") as websocket:
        data = websocket.receive_json(mode='text')
        print(data)
        assert data["request"] == "join" and data["response"] == "success"
        data = websocket.receive_json(mode='text')
        print(data)
        assert data["request"] == "join" and data["response"] == "broadcast"
        websocket.send_json({
            'request': 'quit'
        })
        data = websocket.receive_json(mode='text')
        print(data)
        assert data["request"] == "quit" and data["response"] == "success"


def test_websocket_join_and_start_and_hand(app):
    client = TestClient(app)
    print("send join")
    with client.websocket_connect("/join?affiliation=Staff&name=test12") as websocket:
        data = websocket.receive_json(mode='text')
        print(data)
        assert data["request"] == "join" and data["response"] == "success"
        data = websocket.receive_json(mode='text')
        print(data)
        assert data["request"] == "join" and data["response"] == "broadcast"
        print("send start 5 60")
        websocket.send_json({
            'request': 'start',
            'time_offset': 5,
            'time_duration': 10
        })
        data = websocket.receive_json(mode='text')
        print(data)
        assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'room'
        data = websocket.receive_json(mode='text')
        print(data)
        assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'hand_list'
        data = websocket.receive_json(mode='text')
        print(data)
        assert data["request"] == "start" and data["response"] == "broadcast" and data["type"] == 'game_list'
        print("send hand 0")
        websocket.send_json({
            'request': 'hand',
            'hand': 0
        })
        data = websocket.receive_json(mode='text')
        print(data)
        assert data["request"] == "hand" and data["response"] == "error"
        time.sleep(6)
        print("send hand 0")
        websocket.send_json({
            'request': 'hand',
            'hand': 0
        })
        data = websocket.receive_json(mode='text')
        print(data)
        assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'hand_list'
        data = websocket.receive_json(mode='text')
        print(data)
        assert data["request"] == "hand" and data["response"] == "broadcast" and data["type"] == 'game_list'
        time.sleep(10)
        # TODO 현재 여기서 자동으로 메시지가 오지 않는(게임 방이 종료 상태로 전환되지 않는) 문제가 있음
        data = websocket.receive_json(mode='text')
        print(data)
        assert data["request"] == "end" and data["response"] == "broadcast" and data["type"] == 'game_list'


# 프로젝트 루트 폴더(sql_app 폴더의 상위 폴더)에서 실행할 것!
if __name__ == '__main__':
    if __package__ is None:
        import sys
        from os import path
        print(path.dirname(path.abspath(__file__)))
        sys.path.append(path.dirname(path.abspath(__file__)))

        from sql_app.main import app
    else:
        from .sql_app.main import app
    test_websocket_join_and_quit(app)
    #test_websocket_join_and_start_and_hand(app) # TODO 아직 테스트가 끝까지 진행되지 않음