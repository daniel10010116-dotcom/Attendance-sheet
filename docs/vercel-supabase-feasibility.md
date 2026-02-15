# 使用 Vercel + Supabase 的可行性說明

## 結論：可行

本專案可以改為 **Vercel（前端 + 選配 API）+ Supabase（資料庫）**，不需自架 24 小時開機的主機，且符合 security-and-persistence 規範。

---

## 目前架構的侷限

- **後端**：Express + **SQLite 檔案**（`server/database.sqlite`）
- **Vercel 的 Serverless**：每次請求都是短生命週期、**沒有持久化磁碟**，SQLite 檔案無法在請求之間保留
- 因此**不能**把現有的 `server/` 直接部署到 Vercel 就當成「一直開著的後端」

所以要上 Vercel，就要把「存資料」改到**雲端資料庫**，例如 **Supabase（PostgreSQL）**。

---

## 建議架構：Vercel + Supabase

| 項目 | 做法 |
|------|------|
| **前端** | 維持 Vite + React，部署到 **Vercel**（或繼續用 GitHub Pages） |
| **資料庫** | 改用 **Supabase** 的 PostgreSQL（免費方案即可起步） |
| **API** | 二選一：<br>**A)** 前端直連 Supabase（用 Supabase JS 客戶端 + RLS 做權限）<br>**B)** 在 Vercel 上寫 **Serverless API**，API 再去連 Supabase（較接近現在 Express 的寫法） |
| **登入／密碼** | 可用 **Supabase Auth**（密碼會雜湊儲存），或保留自建邏輯放在 Vercel Serverless 裡 |

這樣就不需要任何「一直開機的遠端主機」，全部在 Vercel + Supabase 的免費額度內即可運作。

---

## 與規範的對應（security-and-persistence.mdc）

- **§2 持久化**：Supabase PostgreSQL 為正式資料庫，資料存於雲端。
- **§7 密碼雜湊**：若用 Supabase Auth，由 Supabase 處理；若自建登入，可在 Vercel Serverless 內用 bcrypt。
- **§4 後端權限**：若選 B（Vercel API），在 API 內驗證 JWT／角色；若選 A（直連 Supabase），用 **Row Level Security (RLS)** 限制誰能讀寫哪些列。
- **§5 審計**：在 Supabase 建 `audit_log` 表，由 API 或 Supabase Trigger 寫入。
- **§6 速率限制**：Vercel 可搭配 middleware 或第三方服務做限流；Supabase 本身也有基本限流。

因此，**本專案在架構上可以符合規範**，只是實作會從「Express + SQLite」改成「Vercel（+ 選配 API）+ Supabase」。

---

## 實作上需要做的調整（概要）

1. **在 Supabase 建立專案**，建立對應的資料表（admin、coaches、students、enrollments、pending_attendances、attendance_records、completed_salary_details、coach_earned、audit_log 等），與現有 schema 對齊或簡化。
2. **資料層改寫**：  
   - 若選 **A（直連 Supabase）**：前端用 `@supabase/supabase-js`，透過 RLS 與角色欄位控制權限；登入改用 Supabase Auth 或自建 token 存於 Supabase。  
   - 若選 **B（Vercel API）**：把現在 `server/` 裡對 SQLite 的查詢改成對 **Supabase（PostgreSQL）** 的查詢（用 `@supabase/supabase-js` 的 server 用法或 SQL client），部署為 Vercel Serverless Functions。
3. **前端環境變數**：  
   - 若 A：設 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`（或僅在 serverless 內用 service key）。  
   - 若 B：設 `VITE_API_URL` 指向 Vercel 部署的 API 網址。
4. **部署**：前端與（若採用）API 都部署到 Vercel，資料庫與認證在 Supabase；不再需要自架主機。

---

## 下一步

若你決定採用 **Vercel + Supabase**，可以再指定偏好：

- **A）前端直連 Supabase**：改動較集中在前端與 Supabase 設定，無需維護 API 專案。  
- **B）Vercel Serverless API + Supabase**：較接近目前 Express 的邏輯，把 `server/` 改寫成 Vercel Functions，資料庫改連 Supabase。

我可以依你選的方案，幫你寫出具體的遷移步驟（含 Supabase 表結構、RLS 範例或 Vercel API 範例）。
