# security-and-persistence.mdc 符合性檢查報告

對照專案從實作、一來一回修改、GitHub 發布到目前的狀態，與 `.cursor/rules/security-and-persistence.mdc` 的符合情形。

---

## 符合的項目

### §1 前端無密鑰 (No Secrets on Client)
- **狀態**：✅ 符合
- **說明**：前端未 hard-code 任何 API Key 或第三方私鑰；僅使用 `import.meta.env.BASE_URL`（Vite 建置用）。專案為 Vite + React，規則中的「Next.js API Route」在加後端時改為「後端 API / Proxy」即可。

### §3 前端路由權限 (Frontend Route Guards)
- **狀態**：✅ 符合
- **說明**：`App.jsx` 的 `PrivateRoute` 會檢查 `user` 存在且 `allowedRoles` 包含當前角色，否則 `<Navigate to="/" replace />`。直接輸入 `/admin`、`/coach`、`/student` 若未登入或角色不符會被導回登入頁。

### §9 敏感檔案不進 Git (Secrets Management)
- **狀態**：✅ 符合
- **說明**：`.gitignore` 已包含 `.env`、`.env.local`、`.env.*.local`，未將私鑰寫死在程式碼並上傳。

### §10 .gitignore 設定
- **狀態**：✅ 符合
- **說明**：已排除 `node_modules/`、`dist/`、`.env`、`.env.local`、`.DS_Store`、`*.log`、`*.local`。

---

## 不符合或尚未實作的項目（加後端時須補齊）

### §2 真實資料庫持久化 (Real Database for Persistence)
- **狀態**：✅ 已實作（接後端時）
- **規則**：禁止僅用 localStorage 或記憶體存核心業務資料；核心資料須存入 PostgreSQL/MySQL 等。
- **現況**：已提供 **server/** 後端（Express + SQLite），教練、學生、選課、點名、薪水等存於 `database.sqlite`。前端設定 `VITE_API_URL` 後改走 API，未設定時仍為 mock（localStorage）供本機 demo。

### §4 後端 RBAC (Backend API 權限驗證)
- **狀態**：✅ 已實作
- **規則**：所有會修改資料的 API 須在後端驗證權限（如 `request.user.role === 'admin'`），不能只信前端。
- **現況**：`server/auth.js` 的 `requireAuth`（JWT）、`requireRole`；各路由依角色限制（admin/coach/student），未授權回傳 403。

### §5 審計日誌 (Audit Logging)
- **狀態**：✅ 已實作
- **規則**：關鍵操作（刪除、改權限、金額變動）須寫入 AuditLog，含操作者、時間、類型、原值、新值。
- **現況**：`server/audit.js` 寫入 `audit_log` 表；登入、刪除教練/學生、重設密碼、確認發薪、點名確認、改帳號密碼等皆有紀錄。

### §6 API 速率限制 (Rate Limiting)
- **狀態**：✅ 已實作
- **規則**：登入與高成本 API 須限流（例如同 IP 1 分鐘內登入嘗試次數上限）。
- **現況**：`server/index.js` 對 `/api/auth` 使用 `express-rate-limit`，同一 IP 每分鐘最多 5 次登入。

### §7 密碼雜湊 (Password Hashing)
- **狀態**：✅ 已實作（接後端時）
- **規則**：密碼須用 bcrypt 或 Argon2 雜湊（加鹽），禁止明文儲存。
- **現況**：後端以 **bcrypt** 雜湊儲存（`server/auth.js`、`server/scripts/init-db.js`），資料庫僅存 `password_hash`；登入時以 `comparePassword` 比對。未接後端時 mock 仍為明文（僅供本機 demo）。

### §8 Redis 僅用於快取
- **狀態**：✅ 未違反（目前未用 Redis）
- **加後端時**：若用 Redis，僅用於 Session 或快取，主資料仍用關聯式/NoSQL 資料庫。

---

## 總結表

| 條文 | 標題           | 符合 | 備註 |
|------|----------------|------|------|
| 1    | 前端無密鑰     | ✅   | 無 API Key 於前端 |
| 2    | 真實資料庫     | ✅   | 接後端時用 SQLite，未接則 mock |
| 3    | 前端 Route Guard | ✅ | PrivateRoute 已做權限與導向 |
| 4    | 後端 RBAC      | ✅   | JWT + requireRole 已實作 |
| 5    | 審計日誌       | ✅   | audit_log 表與關鍵操作寫入 |
| 6    | 速率限制       | ✅   | 登入 API 每分鐘 5 次 |
| 7    | 密碼雜湊       | ✅   | 後端 bcrypt，未接後端則 mock 仍明文 |
| 8    | Redis 用途     | ✅   | 未誤用為主庫 |
| 9    | 敏感不進 Git   | ✅   | .env 等已忽略 |
| 10   | .gitignore     | ✅   | 已排除規定項目 |

**結論**：後端與資料庫已實作，**§2 持久化**、**§4 RBAC**、**§5 審計日誌**、**§6 速率限制**、**§7 密碼雜湊** 皆已符合。前端未設定 `VITE_API_URL` 時仍為 mock（localStorage），僅供本機 demo；設定後即走後端，資料與密碼依規則處理。
