# 方案 2：GitHub + Vercel + Supabase 部署步驟

本專案後端已支援 **可切換 SQLite / Supabase**，並提供 **Vercel 用 `api/[[...path]].js`** 入口。以下用 **中英對照** 寫出 Supabase、Vercel 介面上要點哪裡、填什麼（介面是英文也能照著做）。

---

## 你接下來要做的事（一步一步）

---

### 步驟 1：Supabase 建立專案與資料表

#### 1-1 登入／建立專案

1. 打開 [https://supabase.com](https://supabase.com) → 點 **Sign in**（登入）或 **Start your project**。
2. 登入後在 **Dashboard** 左側或首頁點 **New project**（新專案）。
3. 填寫：
   - **Name**：專案名稱（例如 `attendance`）。
   - **Database Password**：設一組資料庫密碼，**請記下來**（之後連線會用到）。
   - **Region**：選離你較近的區域（例如 `Northeast Asia (Tokyo)`）。
4. 點 **Create new project**（建立新專案），等專案建立完成。

#### 1-2 執行 SQL 建立資料表

1. 左側選單點 **SQL Editor**（SQL 編輯器）。
2. 點 **New query**（新查詢）。
3. 打開本專案裡的 **`supabase/schema.sql`**，**全選複製**，貼到 SQL Editor 的編輯區。
4. 點右下角 **Run**（或按 Ctrl+Enter）執行。
5. 看到成功訊息即可；左側選 **Table Editor** 可確認是否出現 `admin`、`coaches`、`students` 等表。

#### 1-3 取得 API 網址與金鑰（給步驟 2、3 用）

1. 左側選單點 **Project Settings**（專案設定，齒輪圖示）。
2. 左邊子選單點 **API**。
3. 在頁面上找到並複製：
   - **Project URL**（專案網址）→ 這就是 **`SUPABASE_URL`**。
   - **Project API keys** 區塊裡的 **`service_role`** 右側的 **Reveal** 點開後複製 → 這就是 **`SUPABASE_SERVICE_ROLE_KEY`**（僅後端用，不要給前端或公開）。

把這兩個值先記在記事本，後面步驟會用到。

---

### 步驟 2：建立預設管理員與種子資料

在本機專案**根目錄**（有 `package.json` 的那一層）執行：

1. 若還沒裝過依賴，先執行：`npm install`
2. 執行種子（請把 `你的URL`、`你的key` 換成步驟 1-3 的 Project URL 和 service_role key）：

**PowerShell（Windows）：**

```powershell
$env:SUPABASE_URL="你的Project_URL"
$env:SUPABASE_SERVICE_ROLE_KEY="你的service_role_key"
node supabase/seed-admin.js
```

**CMD（Windows）：**

```cmd
set SUPABASE_URL=你的Project_URL
set SUPABASE_SERVICE_ROLE_KEY=你的service_role_key
node supabase/seed-admin.js
```

完成後，Supabase 的 `admin` 表會有一筆預設管理員（帳號 `admin`、密碼 `admin`），以及可選的教練、學生、選課種子。

---

### 步驟 3：Vercel 部署 API 與前端

#### 3-1 把專案推到 GitHub

1. 在 [GitHub](https://github.com) 建立一個 **New repository**（新倉庫）。
2. 在本機專案資料夾用 Git 連到該倉庫並 push（若尚未用 Git，可先 `git init`，再 `git remote add origin 你的倉庫網址`，然後 `git add .`、`git commit`、`git push`）。

#### 3-2 在 Vercel 匯入專案

1. 打開 [https://vercel.com](https://vercel.com) → **Log in**（登入，可用 GitHub 登入）。
2. 點 **Add New...** → **Project**（新增專案）。
3. 在 **Import Git Repository** 底下選你的 **GitHub** 帳號，找到剛 push 的倉庫，點 **Import**（匯入）。
4. **Configure Project** 頁面：
   - **Framework Preset**：可選 **Vite**（或留 Vercel 自動偵測）。
   - **Build Command**：預設 `npm run build` 即可（若文件裡有寫就用文件的）。
   - **Output Directory**：填 **`dist`**。
   - 先不要點 Deploy，先設環境變數（下一步）。

#### 3-3 設定環境變數（Environment Variables）

1. 在 **Configure Project** 頁面找到 **Environment Variables** 區塊。
2. 新增三筆（Name / Value 照下面填，**Production**、**Preview** 可都勾選）：
   - **Name**：`SUPABASE_URL` → **Value**：貼上步驟 1-3 的 **Project URL**。
   - **Name**：`SUPABASE_SERVICE_ROLE_KEY` → **Value**：貼上步驟 1-3 的 **service_role** key。
   - **Name**：`JWT_SECRET` → **Value**：一組隨機長字串（例如用密碼產生器產生 32 字元以上）。
3. 若同一頁沒有 **Environment Variables**，可先點 **Deploy** 部署，部署完成後再到專案裡設定（見 3-5）。

#### 3-4 部署

1. 點 **Deploy**（部署），等建置與部署跑完。
2. 完成後會顯示 **Congratulations** 和一個網址，例如 `https://你的專案.vercel.app`。這就是你的前端 + API 網址。
3. API 網址即：`https://你的專案.vercel.app/api/...`（例如 `/api/health`、`/api/auth/login`）。

#### 3-5 若部署時沒設環境變數，事後補設

1. 在 Vercel 首頁點進該 **Project**（專案）。
2. 上方選 **Settings**（設定）。
3. 左側點 **Environment Variables**（環境變數）。
4. 點 **Add** 或 **Add New**，依序新增：
   - **Key**：`SUPABASE_URL`，**Value**：你的 Supabase Project URL。
   - **Key**：`SUPABASE_SERVICE_ROLE_KEY`，**Value**：你的 service_role key。
   - **Key**：`JWT_SECRET`，**Value**：隨機長字串。
5. 存好後到 **Deployments** 頁，點最新一次部署右側 **⋯** → **Redeploy**（重新部署），讓新環境變數生效。

---

### 步驟 4：前端接上 Vercel API

1. 在 Vercel 同一個專案裡，**Settings** → **Environment Variables**。
2. 新增一筆：
   - **Key**：`VITE_API_URL`
   - **Value**：`https://你的專案.vercel.app`（不要加結尾的 `/api`，前端會自己接 `/api/...`）。
3. 存好後到 **Deployments** → 最新部署的 **⋯** → **Redeploy**，讓前端建置時帶入 `VITE_API_URL`。

完成後，前端會用這個網址打 API，資料會存在 Supabase。

---

## 介面對照速查

| 你要做的事 | Supabase 介面（英文） | Vercel 介面（英文） |
|------------|------------------------|----------------------|
| 建立專案 | **New project** | **Add New...** → **Project** |
| 執行 SQL | **SQL Editor** → **New query** → **Run** | — |
| 專案設定 | **Project Settings**（齒輪） | **Settings** |
| 拿 API URL / key | **Project Settings** → **API** → Project URL、**service_role** | — |
| 設環境變數 | — | **Settings** → **Environment Variables** → **Add** |
| 重新部署 | — | **Deployments** → **⋯** → **Redeploy** |

---

## 專案已具備的結構

| 項目 | 說明 |
|------|------|
| **資料層切換** | `server/data.js` 依 `SUPABASE_URL` 存在與否，動態載入 `data-supabase.js` 或 `data-sqlite.js`。 |
| **Express 分離** | `server/app.js` 只建立 app；`server/index.js` 負責 `app.listen()`。 |
| **Vercel 入口** | 根目錄 **`api/[[...path]].js`** 將請求轉給 `server/app.js`。 |
| **依賴** | 根目錄 `package.json` 已含 API 所需依賴；Vercel 上使用 Supabase，不裝 SQLite。 |

---

## 本機開發

- **不設** `SUPABASE_URL`：使用 SQLite（在 `server` 目錄 `npm install` 後執行 `node index.js`）。
- **設定** `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`：使用 Supabase，與 Vercel 行為一致。

---

## 注意事項

- **service_role** key 僅能在後端（Vercel serverless）使用，不要寫進前端或公開 repo。
- 若需 CORS 限定來源，可在 Vercel 的 **Environment Variables** 新增 **`CORS_ORIGIN`**（例如前端網址）。
