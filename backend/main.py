"""
This module is responsible for importing FastAPI and its dependencies.
"""

import logging
from fastapi import Depends, FastAPI, Request, HTTPException
from dotenv import load_dotenv
from sqlalchemy.orm import Session



# Import Line Bot API
from linebot.v3 import (
    WebhookHandler
)
from linebot.v3.exceptions import (
    InvalidSignatureError
)
from linebot.v3.messaging import (
    ApiClient,
    MessagingApi,
    Configuration,
    TextMessage,
    ReplyMessageRequest
)
from linebot.v3.webhooks import (
    MessageEvent,
    TextMessageContent,
)

# Import database and models => relative path method
from backend import crud
from backend import models
from backend import schemas
from backend import database

# Import handlers
from backend.handlers.order_query import handle_order_query
from backend.handlers.platform_info import handle_platform_info
from backend.handlers.customer_service import handle_customer_service
from backend.handlers.seller import handle_seller
from backend.handlers.buyer import handle_buyer
from backend.handlers.driver import handle_driver

# environment variables
load_dotenv()

# databasse
models.Base.metadata.create_all(bind=database.engine)
# FastAPI app
app = FastAPI()


def get_db():
    """
    Returns a database session.

    Returns:
        database session: The database session object.
    """
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/items/", response_model=schemas.Item)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    """
    Create a new item.

    Parameters:
    - item: The item data to be created.
    - db: The database session.

    Returns:
    - The created item.

    """
    return crud.create_item(db=db, item=item)

@app.get("/items/", response_model=list[schemas.Item])
def read_items(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    Retrieve a list of items from the database.

    Parameters:
    - skip (int): Number of items to skip (default: 0)
    - limit (int): Maximum number of items to retrieve (default: 10)
    - db (Session): Database session dependency

    Returns:
    - List[schemas.Item]: List of items retrieved from the database
    """
    items = crud.get_items(db, skip=skip, limit=limit)
    return items

@app.get("/items/{item_id}", response_model=schemas.Item)
def read_item(item_id: int, db: Session = Depends(get_db)):
    """
    Retrieve an item by its ID.

    Parameters:
    - item_id (int): The ID of the item to retrieve.
    - db (Session): The database session.

    Returns:
    - schemas.Item: The retrieved item.

    Raises:
    - HTTPException: If the item is not found.
    """
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item


# setup Line Bot API
configuration = Configuration(
    access_token='LINE_BOT_TOKEN'
)
handler = WebhookHandler('LINE_BOT_SECRET')


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/callback")
async def callback(request: Request):
    """
    Handle the Line Bot callback request.

    Parameters:
    - request (Request): The HTTP request object.

    Returns:
    - str: The response message.
    """
    signature = request.headers['X-Line-Signature']
    body = await request.body()
    body = body.decode('utf-8')
    logger.info("Request body: %s", body)
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        logger.error("Invalid signature")
        handle_invalid_signature_error()

    return 'OK'

def handle_invalid_signature_error():
    """
    Handles the case when an invalid signature is encountered.

    Raises:
        HTTPException: An exception indicating that the signature is invalid.
    """
    raise HTTPException(status_code=400, detail="Invalid signature")


@handler.add(MessageEvent, message=TextMessageContent)
def handle_message(event):
    """
    Handles incoming messages from users and routes them 
    to the appropriate handlers based on the user's message.

    Parameters:
    - event: The event object containing information about the incoming message.

    Returns:
    - None
    """
    user_message = event.message.text
    logger.info("Message from user: %s", user_message)

    with ApiClient(configuration) as api_client:
        line_bot_api = MessagingApi(api_client)
        if user_message in ["客服", "詢問客服", "詢問"]:
            handle_customer_service(event, line_bot_api)
        elif user_message == "司機":
            handle_driver(event, line_bot_api)
        elif user_message == "賣家":
            handle_seller(event, line_bot_api)
        elif user_message in ["買家", "買東西", "買", "團購"]:
            handle_buyer(event, line_bot_api)
        elif user_message in ["訂單資訊", "訂單查詢", "訂單", "查詢", "處理中的訂單", "進行中的訂單", "已完成的訂單"]:
            handle_order_query(event, line_bot_api)
        elif user_message in ["平台介紹", "介紹"]:
            handle_platform_info(event, line_bot_api)
        else:
            reply_message = TextMessage(text="未知的選擇。")
            line_bot_api.reply_message(
                    ReplyMessageRequest(
                        reply_token=event.reply_token,
                        reply_message=reply_message
                    )
                )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
