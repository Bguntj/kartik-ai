from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from auth.security import decode_access_token
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from auth.router import router as auth_router
from database import engine
from models import Base

from websocket.manager import manager
from events.event_bus import event_bus

# ==========================================
# Routers
# ==========================================

from routes.sessions import router as session_router
from routes.chat import router as chat_router
from routes.upload import router as upload_router


# ==========================================
# Load Environment
# ==========================================

load_dotenv()


# ==========================================
# Create Database Tables
# ==========================================

Base.metadata.create_all(bind=engine)
Base.metadata.create_all(bind=engine)

# ==========================================
# FastAPI App
# ==========================================

app = FastAPI(
    title="Kartik AI",
    version="1.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Register Routes
# ==========================================

app.include_router(session_router)
app.include_router(chat_router)
app.include_router(upload_router)
app.include_router(auth_router)

# ==========================================
# Home
# ==========================================

@app.get("/")
def home():

    return {
        "status": "running",
        "message": "Kartik AI Backend is Live"
    }


# ==========================================
# Health Check
# ==========================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ==========================================
# WebSocket
# ==========================================

# ==========================================
# WebSocket
# ==========================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    token = websocket.query_params.get("token")

    # --------------------------------------
    # Validate JWT
    # --------------------------------------

    if not token:

        await websocket.close(code=1008)
        return

    user_id = decode_access_token(token)

    if user_id is None:

        await websocket.close(code=1008)
        return

    # --------------------------------------
    # Accept connection
    # --------------------------------------

    await manager.connect(websocket)

    # --------------------------------------
    # Give EventBus the current FastAPI
    # event loop
    # --------------------------------------

    if manager.loop:

        event_bus.set_loop(
            manager.loop
        )

    try:

        while True:

            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(websocket)

    except Exception as e:

        print(
            f"WebSocket Error: {e}"
        )

        manager.disconnect(websocket)