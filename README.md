# CloudTribe

## Project Description

During the winter break of 2024, we visited the Sbunaw tribe(雪霧鬧部落**)** in Taoyuan, a small community with around 200 residents. The local economy is primarily based on agriculture, guesthouses, and camping. The area is difficult to access due to steep, winding mountain roads, making external transportation challenging. Due to these transportation issues, no logistics companies are willing to make deliveries to the mountain. This has led to the development of a "convenience economy," where residents who go down to the town for supplies also bring back goods for other residents, reducing the need for multiple trips. This system is usually based on mutual help among familiar residents.

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

![pgAdmin Setup](https://prod-files-secure.s3.us-west-2.amazonaws.com/0a34284e-c260-45f9-8797-9b6c5be931aa/a5132289-8b2f-4595-815d-465fd5bb9f5e/Untitled.png)

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

## Linebot設定步驟

1.  git clone https://github.com/ChenTim1011/CloudTribe.git

2.  **建立 LINE Bot 帳號**

    - 前往 [LINE Developer Console](https://developers.line.biz/console) 建立一個 Messaging API Channel
    - 在 **Basic Settings** 標籤中取得 `Channel secret`
    - 在 **Messaging API** 標籤中產生 `Channel access token`

3.  **部署到 Render**

    - 前往 [Render](https://render.com/)，建立新的 Web Service 並連接到你的 GitHub 儲存庫

4.  **設定 LINE Webhook URL**
    - 在 LINE Developer Console 中，將 Webhook URL 設置為 `https://your-render-url/callback`

### 修改後的程式碼

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

### 部署到 Render

1. 將以上檔案推送到你的 GitHub 儲存庫。
2. 前往 [Render](https://render.com/)，創建一個新的 Web Service，連接到你的 GitHub 儲存庫。Render 會自動偵測到 `.render.yaml` 檔案並根據其設定進行部署。
3. 在 Render 的環境變數設定頁面，手動添加以下環境變數：
   - `LINE_BOT_TOKEN`
   - `LINE_BOT_SECRET`

### 設置 LINE Webhook URL

在 Render 部署完成後，你會得到一個 URL。前往你的 LINE Developer Console，將 Webhook URL 設置為 `https://your-render-url/callback`。
