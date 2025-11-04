# 專案遷移完整指南

## 📋 專案概述

本專案是一個基於 React + Vite + TypeScript 的全端應用程式，使用 Supabase 作為後端服務，包含以下核心功能：
- 用戶認證系統
- 金幣積分系統
- AI 內容生成
- 代理商管理
- 推薦系統
- 品牌設定與文件上傳

---

## 1️⃣ 程式碼打包與部署

### GitHub Repository 方式（推薦）

1. **連接 GitHub**：
   - 在 Lovable 編輯器中，點擊右上角的 **GitHub** 按鈕
   - 選擇 **Connect to GitHub**
   - 授權 Lovable GitHub App
   - 選擇帳號/組織並創建 Repository

2. **Clone Repository**：
   ```bash
   git clone [YOUR_REPO_URL]
   cd [PROJECT_NAME]
   ```

### ZIP 打包方式（備用）

如果尚未綁定 GitHub，請在 Lovable 中：
1. 啟用 **Dev Mode**（左上角切換按鈕）
2. 下載專案的完整程式碼

---

## 2️⃣ 系統需求與安裝

### 必要環境

- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本（或使用 yarn/pnpm）
- **PostgreSQL**: 15.x 或更高版本（如果自行架設資料庫）

### 安裝步驟

```bash
# 1. 安裝依賴
npm install

# 2. 複製環境變數範本
cp .env.example .env

# 3. 編輯 .env 檔案，填入正確的環境變數
nano .env  # 或使用其他編輯器
```

---

## 3️⃣ 資料庫遷移與設定

### 資料庫類型

本專案使用 **PostgreSQL**（透過 Supabase）

### 方案 A：繼續使用 Lovable Cloud 的 Supabase（推薦）

**優點**：
- 無需遷移資料庫
- 自動擴展與備份
- 免費額度可用
- Edge Functions 自動部署

**設定步驟**：
1. 保留現有的 `.env` 中的 Supabase 連線資訊
2. 確認以下環境變數已正確設定：
   ```
   VITE_SUPABASE_URL=https://rutmpghjoguwurbhgdrc.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=[YOUR_KEY]
   VITE_SUPABASE_PROJECT_ID=rutmpghjoguwurbhgdrc
   ```

### 方案 B：自行架設 Supabase

**步驟**：
1. **安裝 Supabase CLI**：
   ```bash
   npm install -g supabase
   ```

2. **初始化 Supabase 專案**：
   ```bash
   supabase init
   ```

3. **啟動本地 Supabase**：
   ```bash
   supabase start
   ```

4. **套用所有 Migration**：
   ```bash
   supabase db push
   ```
   
   所有 migration 檔案位於 `supabase/migrations/` 目錄

### 方案 C：連接到自有 PostgreSQL 資料庫

1. **建立資料庫**：
   ```sql
   CREATE DATABASE your_project_db;
   ```

2. **套用 Schema**：
   執行 `supabase/migrations/` 目錄中的所有 SQL 檔案，按照檔名順序執行

3. **更新連線資訊**：
   修改 `src/integrations/supabase/client.ts`，改用您的資料庫連線資訊

### 資料庫結構說明

主要資料表：
- `profiles` - 用戶資料
- `user_roles` - 用戶角色權限
- `user_coins` - 用戶金幣餘額
- `coin_transactions` - 金幣交易紀錄
- `daily_checkins` - 每日簽到紀錄
- `brand_settings` - 品牌設定
- `generation_history` - AI 生成歷史
- `agents` - 代理商資料
- `agent_quota_transactions` - 代理商配額交易
- `referrals` - 推薦關係
- `referral_settings` - 推薦獎勵設定
- `notifications` - 系統通知

### 資料匯出與匯入

**從現有 Supabase 匯出資料**：
```bash
# 使用 Supabase CLI
supabase db dump -f backup.sql

# 或使用 pg_dump
pg_dump "postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]" > backup.sql
```

**匯入到新環境**：
```bash
# 使用 Supabase CLI
supabase db reset

# 或使用 psql
psql "postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]" < backup.sql
```

---

## 4️⃣ AI 服務配置

### AI 服務說明

本專案使用 **Lovable AI**，無需額外的 API Key。

Lovable AI 支援的模型：
- `google/gemini-2.5-pro` - 頂級模型，適合複雜推理
- `google/gemini-2.5-flash` - 平衡型，性價比高
- `google/gemini-2.5-flash-lite` - 最快最便宜
- `openai/gpt-5` - 強大的通用模型
- `openai/gpt-5-mini` - 中等效能
- `openai/gpt-5-nano` - 高速低成本

### AI 相關檔案

1. **Edge Functions**（位於 `supabase/functions/`）：
   - `generate-content/index.ts` - AI 內容生成
   - `analyze-brand/index.ts` - 品牌分析
   - `reset-password/index.ts` - 密碼重置

2. **前端組件**：
   - `src/components/ContentGenerator.tsx` - 內容生成介面
   - `src/components/BrandSettings.tsx` - 品牌設定介面

### Edge Functions 部署

**使用 Lovable Cloud**（推薦）：
- Edge Functions 會自動部署，無需手動操作

**自行部署到 Supabase**：
```bash
# 部署單個 function
supabase functions deploy generate-content

# 部署所有 functions
supabase functions deploy
```

### 環境變數設定

在 Edge Functions 中需要的 Secrets：
```bash
# 設定 Lovable AI Key（如果使用 Lovable Cloud）
supabase secrets set LOVABLE_API_KEY=[YOUR_KEY]

# 如果改用其他 AI 服務
supabase secrets set OPENAI_API_KEY=[YOUR_KEY]
supabase secrets set ANTHROPIC_API_KEY=[YOUR_KEY]
```

---

## 5️⃣ 靜態資源與文件儲存

### 前端靜態資源

位於 `src/assets/` 目錄：
- `duck-mascot.png` - 鴨子吉祥物
- `mascot-cat.png` / `mascot-cat-new.png` - 貓咪吉祥物
- `threads-logo.png` - Threads 標誌
- `xiaohongshu-logo.png` - 小紅書標誌

這些資源會在建構時打包進應用程式。

### 用戶上傳文件

使用 Supabase Storage，存儲桶：
- **`brand-files`** - 品牌相關文件（私有）

**Storage 配置**：
```sql
-- 已在 migration 中設定 RLS policies
-- 用戶只能存取自己的文件
```

**如果需要遷移 Storage 文件**：
1. 從 Supabase Dashboard 下載現有文件
2. 在新環境重新上傳
3. 或使用 Supabase Storage API 進行批量遷移

---

## 6️⃣ 啟動專案

### 開發模式

```bash
# 啟動開發伺服器
npm run dev

# 預設運行在 http://localhost:8080
# 可在 vite.config.ts 修改 Port
```

### 生產模式

```bash
# 建構專案
npm run build

# 輸出目錄：dist/
# 可使用任何靜態網站託管服務部署

# 預覽建構結果
npm run preview
```

### 部署到生產環境

**選項 1：Vercel**
```bash
npm install -g vercel
vercel
```

**選項 2：Netlify**
```bash
npm install -g netlify-cli
netlify deploy
```

**選項 3：自有伺服器（使用 Nginx）**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/your-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 7️⃣ 驗證部署

### 檢查項目

1. **前端載入**：
   - 訪問首頁應能正常顯示
   - 檢查控制台無錯誤訊息

2. **資料庫連線**：
   - 嘗試註冊新用戶
   - 確認金幣系統正常運作（新用戶應獲得 50P）

3. **認證系統**：
   - 測試登入/登出功能
   - 確認 JWT Token 正常運作

4. **AI 功能**：
   - 進入內容生成頁面
   - 測試生成內容功能

5. **文件上傳**：
   - 測試品牌設定中的文件上傳
   - 確認文件能正常儲存與讀取

### 健康檢查 Endpoints

```bash
# 檢查 Supabase 連線
curl https://[YOUR_SUPABASE_URL]/rest/v1/

# 檢查 Edge Functions
curl https://[YOUR_SUPABASE_URL]/functions/v1/generate-content
```

---

## 8️⃣ 常見問題排解

### Q1: Port 衝突

**問題**：`Error: Port 8080 is already in use`

**解決**：
```bash
# 方法 1：修改 vite.config.ts
export default defineConfig({
  server: {
    port: 3000  // 改成其他 port
  }
})

# 方法 2：指定 port 啟動
npm run dev -- --port 3000
```

### Q2: 依賴安裝失敗

**問題**：`npm install` 出現錯誤

**解決**：
```bash
# 清除快取
npm cache clean --force
rm -rf node_modules package-lock.json

# 重新安裝
npm install

# 或使用其他套件管理工具
yarn install
# 或
pnpm install
```

### Q3: Supabase 連線失敗

**問題**：`Failed to fetch` 或 `Network error`

**解決**：
1. 檢查 `.env` 中的 `VITE_SUPABASE_URL` 是否正確
2. 確認 `VITE_SUPABASE_PUBLISHABLE_KEY` 沒有過期
3. 檢查網路防火牆設定
4. 確認 Supabase 專案狀態正常

### Q4: RLS Policy 錯誤

**問題**：`new row violates row-level security policy`

**解決**：
1. 確認用戶已登入（`auth.uid()` 有值）
2. 檢查該資料表的 RLS policies 設定
3. 確認 `user_id` 欄位有正確設定

### Q5: Edge Functions 部署失敗

**問題**：Function 無法正常運作

**解決**：
```bash
# 查看 function logs
supabase functions logs generate-content

# 重新部署
supabase functions deploy generate-content --no-verify-jwt

# 檢查環境變數
supabase secrets list
```

### Q6: 建構失敗

**問題**：`npm run build` 出現 TypeScript 錯誤

**解決**：
```bash
# 檢查 TypeScript 錯誤
npm run type-check

# 如果是型別問題，可暫時跳過（不推薦）
npm run build -- --no-typecheck
```

### Q7: 認證重定向問題

**問題**：登入後無法正確重定向

**解決**：
1. 檢查 Supabase Dashboard > Authentication > URL Configuration
2. 確認 Site URL 和 Redirect URLs 設定正確
3. 本地開發應設為 `http://localhost:8080`
4. 生產環境設為實際域名

---

## 9️⃣ 效能優化建議

### 前端優化

1. **啟用 CDN**：將靜態資源部署到 CDN
2. **圖片優化**：使用 WebP 格式
3. **程式碼分割**：確保使用 React.lazy 進行路由分割
4. **快取策略**：設定適當的 Cache-Control headers

### 後端優化

1. **資料庫索引**：檢查常用查詢是否有建立索引
2. **Connection Pooling**：使用 Supabase 的連線池功能
3. **Edge Functions 冷啟動**：考慮使用 warm-up 策略

---

## 🔟 安全性檢查清單

- [ ] 所有敏感資訊都放在環境變數中
- [ ] `.env` 檔案已加入 `.gitignore`
- [ ] RLS policies 已正確設定
- [ ] API Keys 使用 Supabase Secrets 管理
- [ ] Storage buckets 的存取權限已設定
- [ ] CORS 設定正確
- [ ] HTTPS 已啟用（生產環境）
- [ ] 定期更新依賴套件

---

## 📞 取得協助

如需進一步協助，請參考：
- [Lovable 官方文檔](https://docs.lovable.dev/)
- [Supabase 文檔](https://supabase.com/docs)
- [React 文檔](https://react.dev/)
- [Vite 文檔](https://vitejs.dev/)

---

**最後更新**：2025 年 11 月 5 日
**專案版本**：1.0.0
