# Linebot-CloudTribe

### 簡要設定步驟

1.  git clone https://github.com/ChenTim1011/Linebot-CloudTribe.git

2.  **建立 LINE Bot 帳號**

    - 前往 [LINE Developer Console](https://developers.line.biz/console) 建立一個 Messaging API Channel
    - 在 **Basic Settings** 標籤中取得 `Channel secret`
    - 在 **Messaging API** 標籤中產生 `Channel access token`

3.  **取得 genmini API-Key**

    - 前往 [Genmini API](https://ai.google.dev/aistudio?authuser=1&hl=zh-tw)，建立新的帳號，取得 Genmini API Key.

4.  **部署到 Render**

    - 前往 [Render](https://render.com/)，建立新的 Web Service 並連接到你的 GitHub 儲存庫

5.  **設定 LINE Webhook URL**
    - 在 LINE Developer Console 中，將 Webhook URL 設置為 `https://your-render-url/callback`

### 修改後的程式碼

#### `requirements.txt`

```txt
fastapi
uvicorn
line-bot-sdk
requests
python-dotenv
google.generativeai
```

#### `.env`

```env
LINE_BOT_TOKEN=YOUR_LINE_CHANNEL_ACCESS_TOKEN
LINE_BOT_SECRET=YOUR_LINE_CHANNEL_SECRET
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 部署到 Render

1. 將以上檔案推送到你的 GitHub 儲存庫。
2. 前往 [Render](https://render.com/)，創建一個新的 Web Service，連接到你的 GitHub 儲存庫。Render 會自動偵測到 `.render.yaml` 檔案並根據其設定進行部署。
3. 在 Render 的環境變數設定頁面，手動添加以下環境變數：
   - `LINE_BOT_TOKEN`
   - `LINE_BOT_SECRET`
   - `GEMINI_API_KEY`

### 設置 LINE Webhook URL

在 Render 部署完成後，你會得到一個 URL。前往你的 LINE Developer Console，將 Webhook URL 設置為 `https://your-render-url/callback`。
