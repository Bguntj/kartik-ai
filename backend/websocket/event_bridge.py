import asyncio

from events.event_bus import event_bus
from websocket.manager import manager


def _broadcast(data):

    try:

        loop = asyncio.get_running_loop()

        loop.create_task(
            manager.broadcast(data)
        )

    except RuntimeError:

        asyncio.run(
            manager.broadcast(data)
        )


event_bus.subscribe(
    "thinking",
    lambda data: _broadcast({
        "type": "thinking",
        "data": data
    })
)

event_bus.subscribe(
    "tool_start",
    lambda data: _broadcast({
        "type": "tool_start",
        "data": data
    })
)

event_bus.subscribe(
    "tool_end",
    lambda data: _broadcast({
        "type": "tool_end",
        "data": data
    })
)

event_bus.subscribe(
    "skill_start",
    lambda data: _broadcast({
        "type": "skill_start",
        "data": data
    })
)

event_bus.subscribe(
    "skill_end",
    lambda data: _broadcast({
        "type": "skill_end",
        "data": data
    })
)

event_bus.subscribe(
    "done",
    lambda data: _broadcast({
        "type": "done",
        "data": data
    })
)

event_bus.subscribe(
    "error",
    lambda data: _broadcast({
        "type": "error",
        "data": data
    })
)