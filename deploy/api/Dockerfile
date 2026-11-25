FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY sql_app ./sql_app
# database.py가 ./sql_app.db를 쓰므로, 실제 파일은 볼륨(/data)에 두고 링크만 건다.
RUN useradd --system --uid 10777 --home /app rpsbrawl \
    && mkdir /data && chown rpsbrawl /data \
    && ln -s /data/sql_app.db /app/sql_app.db
USER rpsbrawl
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
# 토큰과 접속 상태가 프로세스 메모리에 있으므로 워커는 반드시 1개만 쓴다.
# 시작할 때 DB 파일을 WAL 모드로 둔다(커밋이 빨라짐). 한 번 설정하면 파일에 남는다.
CMD ["sh", "-c", "python -c \"import sqlite3; sqlite3.connect('/data/sql_app.db').execute('pragma journal_mode=wal')\" && exec uvicorn sql_app.main:app --host 0.0.0.0 --port 8000"]
