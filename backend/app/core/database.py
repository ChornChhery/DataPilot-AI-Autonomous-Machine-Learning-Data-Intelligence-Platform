import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger(__name__)
client = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB]
    await db.analyses.create_index("session_id", unique=True)
    await db.analyses.create_index("created_at")
    logger.info(f"Connected to MongoDB: {settings.MONGODB_DB}")

async def disconnect_db():
    global client
    if client:
        client.close()

def get_db():
    return db