# CloudTribe  USR計畫之部落團購與順路經濟平台實做

## Project Description

During the winter break of 2024, we visited the Sbunaw tribe(雪霧鬧部落) in Taoyuan, a small community with around 200 residents. The local economy is primarily based on agriculture, guesthouses, and camping. The area is difficult to access due to steep, winding mountain roads, making external transportation challenging. Due to these transportation issues, no logistics companies are willing to make deliveries to the mountain. This has led to the development of a "convenience economy," where residents who go down to the town for supplies also bring back goods for other residents, reducing the need for multiple trips. This system is usually based on mutual help among familiar residents.

We aim to scale up this model, allowing residents to earn money by helping more people while improving the flow of goods in the mountainous area. The platform involves three roles: buyers, sellers, and drivers. The core functionality will enable these roles to express their needs and use a backend matching system to fulfill them. We hope to create an information platform that supports remote communities and eventually expand its use to other indigenous tribes.


# Core Functions:

1. Role Selection and Matching: Enables users to choose roles and match orders based on their needs.
2. Order Management: Facilitates order creation, modification, and deletion with a dynamic form interface.
3. Route Planning: Integrates Google Maps API for route display and time estimation.
4. Order Query: Allows users to track their order history and current order status.

### TBD

5. User Authentication: Implements login and registration with JWT-based authentication.
6. Real-Time Notifications: Uses WebSocket for instant notifications and updates.
7. Messaging: Provides a message center for real-time communication.





# Technology Stack

1. **Frontend: Typescript+ React**
2. **Backend:  Python + FastAPI**
3. **Database: PostgreSQL**
4. **Maps and Route Planning: Google Maps API**
5. **LineBOT**



# CloudTribe Setup Instructions

## Database Setup

1. Download and install pgAdmin4 from [pgAdmin4 Download Page](https://www.pgadmin.org/download/).

2. Navigate to the backend directory:

   
         cd backend
  
   
3. Edit the `DATABASE_URL` in `backend/.env_template`:
   For example:  If you want to run in the localhost
   ```python
   DATABASE_URL = "postgresql://postgres:password@localhost:5432/shopping"
   ```

   - `postgresql://`: Database type
   - `postgres`: Username
   - `password`: User password
   - `localhost`: Database host address
   - `5432`: Database port
   - `/shopping`: Database name

5. Change the file name .env_template to .env

6. Open pgAdmin4, go to Servers, and register a new server with the general and connection information as provided.

7. go to backend\database\createtable.sql and  paste the sql query to pgAdmin4 sql query page.

![alt text](img/setting.png)

## Google Maps API Setup

1. Create a `.env.local` file in the `client` directory and add the following code:
   ```plaintext
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
   NEXT_PUBLIC_MAP_ID=
   ```

2. Get the API key from [Google Maps Developers](https://developers.google.com/maps?hl=zh-tw).

3. Create a new project and enable the Maps JavaScript API.

4. Go to the Credentials page and create a new API key.

5. Copy the API key and paste it into the `.env.local` file.

6. Go to the APIs & Services > Library page and enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API

---

## LINE Bot Setup Steps

1. **Create a LINE Bot Account**

   - Go to the [LINE Developer Console](https://developers.line.biz/console) and create a Messaging API Channel.
   - In the **Basic Settings** tab, obtain the `Channel secret`.
   - In the **Messaging API** tab, generate the `Channel access token`.

2. Edit a file in backend\.env , and fill in the content.
   If you don't have the .env file please create it.

   LINE_BOT_TOKEN=
   LINE_BOT_SECRET=
   DATABASE_URL=

## How to start

     
         cd backend
         pip install -r requirements.txt
      

 
   Go to the root directory.
   If you in the backend directory.
   
         cd ..
         npm run dev
   

## deploy TBD 

Now we use AWS EC2 to deploy our project.


### Set the LINE Webhook URL

After the deployment on Render is complete, you will get a URL. Go to your LINE Developer Console and set the Webhook URL to 

      https://your-render-url/callback
