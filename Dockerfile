FROM python:3.11

WORKDIR /rpsbrawl

COPY ./requirements.txt /rpsbrawl/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /rpsbrawl/requirements.txt

COPY ./sql_app /rpsbrawl/sql_app

CMD ["python", "-m", "uvicorn", "sql_app.main:app", "--proxy-headers", "--host", "0.0.0.0", "--port", "80"]
