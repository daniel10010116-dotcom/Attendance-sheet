# 游泳課點名系統

依據 `plan/swimming-attendance-mvp-spec.md` 與 `idea/ui-ux-design-spec.md` 實作的 MVP 網頁應用，提供學生點名、教練確認扣堂、管理員帳號與發薪管理。

## 功能列表

- **登入**：單一入口，依帳號類型自動導向學生／教練／管理員首頁
- **學生端**：我的課程、剩餘堂數、點名（待教練確認後扣堂）
- **教練端**：待確認點名、我的學生與課餘堂數、累計薪水、扣堂紀錄查詢
- **管理員**：新增教練／學生、分配學生給教練、學生管理（重設密碼、刪除）、教練管理（確認發薪、帳號設定）

## 需求

- **Node.js**：建議 18 或 20（專案根目錄有 `.nvmrc`，可使用 `nvm use` 切換版本）
- 現代瀏覽器

## 安裝與啟動

```bash
npm install
npm run dev
```

開發伺服器啟動後，於瀏覽器開啟終端顯示的網址（通常為 http://localhost:5173）。

### 測試帳號（Mock 資料）

| 角色   | 帳號     | 密碼  |
|--------|----------|-------|
| 管理員 | admin    | admin |
| 教練   | coach1   | 123   |
| 學生   | student1 | 123   |

## 後端與資料庫（§2 持久化、§7 密碼雜湊）

專案提供 **Node.js + Express + SQLite** 後端，密碼以 **bcrypt** 雜湊儲存，核心資料存於資料庫，符合 `.cursor/rules/security-and-persistence.mdc`。

### 啟動後端（本機）

```bash
cd server
npm install
node scripts/init-db.js   # 建立 database.sqlite 與預設 admin（帳號 admin / 密碼 admin）、種子教練/學生
npm run dev               # 或 npm start，預設 http://localhost:3001
```

### 前端接後端

在專案根目錄建立 `.env`（可複製 `.env.example`），設定：

```
VITE_API_URL=http://localhost:3001
```

然後 `npm run dev` 啟動前端，登入與所有資料會走 API，多人共用同一份資料。

未設定 `VITE_API_URL` 時，前端仍使用 mock 資料（localStorage），僅本機單機有效。

### 後端環境變數（選填）

- `PORT`：預設 3001  
- `JWT_SECRET`：正式環境請改為隨機長字串  
- `SQLITE_PATH`：未設則使用 `server/database.sqlite`  
- `CORS_ORIGIN`：未設則接受所有 origin  

## 建置

```bash
npm run build
```

產出在 `dist/`。

## 用 GitHub Pages 免費發布網頁

1. **在 GitHub 建立一個 repo**（若尚未建立）
   - 到 [GitHub](https://github.com/new) 建立新 repository，名稱自訂（例如 `swimming-attendance` 或 `點名系統`）。

2. **把專案推上去**
   ```bash
   git remote add origin https://github.com/<你的帳號>/<repo 名稱>.git
   git branch -M master
   git push -u origin master
   ```

3. **開啟 GitHub Pages 並用 Actions 部署**
   - 進入該 repo → **Settings** → 左側 **Pages**。
   - 在 **Build and deployment** 的 **Source** 選擇 **GitHub Actions**（不要選 Branch）。

4. **之後每次推送到 master**
   - 本專案的 workflow（`.github/workflows/deploy.yml`）會自動建置並部署。
   - 完成後網址為：`https://<你的帳號>.github.io/<repo 名稱>/`。

**說明**：建置與部署流程寫在 `.github/workflows/deploy.yml`，僅在 **master** 分支有 push 時觸發。

## 實作清單

專案根目錄的 **Attendance-sheet.md** 為依規格整理的實作勾選表，可作為開發與驗收對照。

## 授權

專案僅供學習與內部使用。
