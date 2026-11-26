from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
#SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    # WAL 모드에서는 NORMAL이어도 DB가 깨지지 않으며, 커밋마다 디스크 동기화(fsync)를 하지 않아 빠르다.
    # 대신 서버 전원이 갑자기 꺼지면 마지막 몇 개의 커밋이 빠질 수 있다.
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
