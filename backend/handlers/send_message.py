# backend/handlers/send_message.py
from linebot.v3.messaging import (
    ApiClient,
    MessagingApi,
    Configuration,
    TextMessage,
    PushMessageRequest
)
from fastapi import HTTPException
import os
from backend.database import get_db_connection  # Adjust the import path as necessary

class LineMessageService:
    def __init__(self):
        self.configuration = Configuration(
            access_token=os.getenv('LINE_BOT_TOKEN')
        )
    
    async def send_message_to_user(self, user_id: int, message: str):
        """
        Send a message to a LINE user by user ID.
        
        Parameters:
        - user_id: 
        - message: 
        """
        try:
            # Get LINE user ID from database
            with get_db_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    "SELECT line_user_id FROM users WHERE id = %s",
                    (user_id,)
                )
                result = cur.fetchone()
                
                if not result or not result[0]:
                    raise HTTPException(status_code=404, detail="User LINE ID not found")
                
                line_user_id = result[0]
            
            # Send message to LINE user
            with ApiClient(self.configuration) as api_client:
                line_bot_api = MessagingApi(api_client)
                line_bot_api.push_message(
                    PushMessageRequest(
                        to=line_user_id,
                        messages=[TextMessage(text=message)]
                    )
                )
            return True
        except Exception as e:
            print(f"Error sending LINE message: {str(e)}")
            return False