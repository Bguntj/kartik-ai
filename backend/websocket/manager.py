import asyncio

from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):

        self.connections = []

        self.loop = None

    # ==========================================
    # Connect
    # ==========================================

    async def connect(self, websocket: WebSocket):

        await websocket.accept()

        self.connections.append(websocket)

        # Save FastAPI's running event loop
        self.loop = asyncio.get_running_loop()

        print("WebSocket Connected")

    # ==========================================
    # Disconnect
    # ==========================================

    def disconnect(self, websocket: WebSocket):

        if websocket in self.connections:

            self.connections.remove(websocket)

        print("WebSocket Disconnected")

    # ==========================================
    # Broadcast
    # ==========================================

    async def broadcast(self, data):

        dead = []

        for connection in self.connections:

            try:

                await connection.send_json(data)

            except Exception as e:

                print(
                    f"WebSocket Send Error: {e}"
                )

                dead.append(connection)

        for connection in dead:

            self.disconnect(connection)


manager = ConnectionManager()