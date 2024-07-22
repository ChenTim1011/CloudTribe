# CloudTribe

## Project Description

During the winter break of 2024, we visited the Sbunaw tribe(雪霧鬧部落) in Taoyuan, a small community with around 200 residents. The local economy is primarily based on agriculture, guesthouses, and camping. The area is difficult to access due to steep, winding mountain roads, making external transportation challenging. Due to these transportation issues, no logistics companies are willing to make deliveries to the mountain. This has led to the development of a "convenience economy," where residents who go down to the town for supplies also bring back goods for other residents, reducing the need for multiple trips. This system is usually based on mutual help among familiar residents.

We aim to scale up this model, allowing residents to earn money by helping more people while improving the flow of goods in the mountainous area. The platform involves three roles: buyers, sellers, and drivers. The core functionality will enable these roles to express their needs and use a backend matching system to fulfill them. Detailed information can be found in proposal.pdf. We hope to create an information platform that supports remote communities and eventually expand its use to other indigenous tribes.

# Technology Stack

1. **Frontend: Typescript+ React**
2. **Backend:  Python + FastAPI**
3. **Database: PostgreSQL**
4. **Maps and Route Planning: Google Maps API**
5. **LineBOT**



# CloudTribe Setup Instructions

## Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ChenTim1011/CloudTribe.git
   ```

2. Navigate to the client directory:
   ```bash
   cd CloudTribe/client
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. If you encounter any warnings, install the necessary packages:
   ```bash
   npm install <package-name>
   ```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd CloudTribe/
   ```

2. Run the backend server:
   ```bash
   python -m backend.main
   ```

3. If you encounter any warnings, install the necessary packages:
   ```bash
   pip install <package-name>
   ```

## Database Setup

1. Download and install pgAdmin4 from [pgAdmin4 Download Page](https://www.pgadmin.org/download/).

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Edit the `DATABASE_URL` in `database.py`:
   ```python
   DATABASE_URL = "postgresql://postgres:password@localhost:5432/shopping"
   ```

   - `postgresql://`: Database type
   - `postgres`: Username
   - `password`: User password
   - `localhost`: Database host address
   - `5432`: Database port
   - `/shopping`: Database name

4. Open pgAdmin4, go to Servers, and register a new server with the general and connection information as provided.

![alt text](image-1.png)

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

2. **Deploy to Render**

   - Go to [Render](https://render.com/) and create a new Web Service connected to your GitHub repository.

3. **Set the LINE Webhook URL**
   - In the LINE Developer Console, set the Webhook URL to `https://your-render-url/callback`.

### Modified Code

#### `requirements.txt`

```txt
fastapi
uvicorn
line-bot-sdk
requests
python-dotenv
```

#### `.env`

```env
LINE_BOT_TOKEN=YOUR_LINE_CHANNEL_ACCESS_TOKEN
LINE_BOT_SECRET=YOUR_LINE_CHANNEL_SECRET
```

### Deploy to Render

1. Push the above files to your GitHub repository.
2. Go to [Render](https://render.com/), create a new Web Service, and connect it to your GitHub repository. Render will automatically detect the `.render.yaml` file and deploy according to its settings.
3. In Render's environment variables settings page, manually add the following environment variables:
   - `LINE_BOT_TOKEN`
   - `LINE_BOT_SECRET`

### Set the LINE Webhook URL

After the deployment on Render is complete, you will get a URL. Go to your LINE Developer Console and set the Webhook URL to `https://your-render-url/callback`.