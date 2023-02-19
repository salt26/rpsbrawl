import asyncio
import datetime
import threading

async def say(t, msg):
    await asyncio.sleep(t)
    print(msg, datetime.datetime.now())

async def main1():
    print(datetime.datetime.now())
    await asyncio.sleep(3)
    print('3sleep')
    task1 = asyncio.create_task(say(1, '4hello'))
    task2 = asyncio.create_task(say(2, '5world'))
    await task1
    await task2
    for i in range(3):
        print(5)
    await say(1, '6eholl')

async def main2():
    print(datetime.datetime.now())
    task1 = asyncio.create_task(say(1, '1hello'))
    task2 = asyncio.create_task(say(2, '2world'))
    await asyncio.sleep(3)
    print('3sleep')
    await task1
    await task2
    for i in range(3):
        print(3)
    await say(1, '4eholl')

async def main3():
    # Require Python version >= 3.11
    async with asyncio.TaskGroup() as tg:
        tg.create_task(say(1, '1hello'))
        tg.create_task(say(2, '2hello'))
        tg.create_task(asyncio.sleep(3))
    print('3sleep')
    await say(1, '4eholl')

async def main4():
    print(datetime.datetime.now())
    task1 = asyncio.create_task(say(1, '1hello'))
    task2 = asyncio.create_task(say(2, '2world'))
    task3 = asyncio.create_task(asyncio.sleep(3))
    await task1
    await task2
    await task3
    print('3sleep')
    task1 = asyncio.create_task(say(1, '4hello'))
    task2 = asyncio.create_task(say(2, '5world'))
    await task1
    await task2

async def main5():
    print(datetime.datetime.now())
    task1 = asyncio.create_task(say(1, '1I'))
    task2 = asyncio.create_task(say(2, '2love'))
    task3 = asyncio.create_task(asyncio.sleep(3))
    await task1
    await task2
    await task3
    print('3sleep')
    task1 = asyncio.create_task(say(1, '4you'))
    task2 = asyncio.create_task(say(2, '5!!!!'))
    await task1
    await task2

async def main5_helper():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.create_task(main5())
    loop.run_forever()

def main4_async():
    asyncio.run(main4())

#asyncio.run(main4())
#main4_async()

t = threading.Thread(target=main4_async)
t.start()
print("end")