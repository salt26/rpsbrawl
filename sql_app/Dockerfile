FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11

WORKDIR /sql_app

COPY ./requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY ./sql_app /sql_app/