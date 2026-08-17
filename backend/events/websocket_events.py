from events.event_bus import event_bus
from websocket.manager import manager
import asyncio


def websocket_listener(data):

    asyncio.create_task(
        manager.broadcast(
            data
        )
    )


event_bus.subscribe(
    "tool_start",
    websocket_listener
)

event_bus.subscribe(
    "tool_end",
    websocket_listener
)

event_bus.subscribe(
    "skill_start",
    websocket_listener
)

event_bus.subscribe(
    "skill_end",
    websocket_listener
)

event_bus.subscribe(
    "error",
    websocket_listener
)