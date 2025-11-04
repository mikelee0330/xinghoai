# 部署檢查清單

在將專案部署到生產環境之前，請確認以下所有項目都已完成。

---

## ✅ 程式碼準備

- [ ] 所有程式碼已提交到 Git
- [ ] 已測試所有核心功能
- [ ] 已修復所有已知 Bug
- [ ] 已移除所有 console.log 和 debug 程式碼
- [ ] 已更新版本號（package.json）
- [ ] 已更新 CHANGELOG（如有）

---

## ✅ 環境變數設定

- [ ] 已創建 `.env.production` 檔案
- [ ] 已填寫所有必要的環境變數
- [ ] Supabase URL 和 Key 已正確設定
- [ ] AI API Keys 已正確設定（如適用）
- [ ] 已確認 `.env` 不會被提交到 Git
- [ ] 已在部署平台設定環境變數

---

## ✅ 資料庫設定

- [ ] 已建立生產環境資料庫
- [ ] 已執行所有 migration
- [ ] 已設定所有 RLS policies
- [ ] 已建立必要的索引
- [ ] 已設定資料庫備份機制
- [ ] 已測試資料庫連線
- [ ] 已設定 Connection Pooling（如需要）

---

## ✅ 認證系統

- [ ] 已在 Supabase 設定正確的 Site URL
- [ ] 已設定 Redirect URLs
- [ ] 已啟用 Auto-confirm email（開發階段）
- [ ] 已設定郵件模板（如需自訂）
- [ ] 已測試註冊流程
- [ ] 已測試登入流程
- [ ] 已測試密碼重置流程
- [ ] 已設定 Session 過期時間

---

## ✅ Storage 設定

- [ ] 已建立 Storage Buckets
- [ ] 已設定 Bucket RLS policies
- [ ] 已測試文件上傳功能
- [ ] 已設定文件大小限制
- [ ] 已設定允許的文件類型
- [ ] 已測試文件刪除功能

---

## ✅ Edge Functions

- [ ] 已部署所有 Edge Functions
- [ ] 已設定所有必要的 Secrets
- [ ] 已測試所有 Edge Functions
- [ ] 已設定 CORS（如需要）
- [ ] 已檢查 function logs 無錯誤
- [ ] 已設定 function timeout

---

## ✅ AI 功能

- [ ] 已設定 AI API Keys
- [ ] 已測試 AI 內容生成
- [ ] 已測試品牌分析功能
- [ ] 已確認 AI 回應速度可接受
- [ ] 已設定錯誤處理機制
- [ ] 已測試金幣扣除邏輯

---

## ✅ 前端建構

- [ ] 已執行 `npm run build` 無錯誤
- [ ] 已檢查 build 輸出檔案大小
- [ ] 已測試 production build 本地運作
- [ ] 已檢查 TypeScript 編譯無錯誤
- [ ] 已檢查 ESLint 無錯誤（或已接受的警告）
- [ ] 已優化圖片資源
- [ ] 已設定 favicon

---

## ✅ 安全性檢查

- [ ] 所有敏感資訊都在環境變數中
- [ ] RLS policies 已正確設定且測試通過
- [ ] Storage policies 已正確設定
- [ ] API endpoints 有適當的驗證
- [ ] 已啟用 HTTPS
- [ ] 已設定 CORS 白名單
- [ ] 已檢查 SQL injection 風險
- [ ] 已檢查 XSS 風險
- [ ] 密碼已正確加密（Supabase 自動處理）

---

## ✅ 效能優化

- [ ] 已啟用程式碼分割（React.lazy）
- [ ] 已優化圖片（WebP, 壓縮）
- [ ] 已設定 CDN（如適用）
- [ ] 已設定快取 headers
- [ ] 已測試頁面載入速度（< 3 秒）
- [ ] 已測試 Lighthouse 分數（> 90）
- [ ] 已檢查資料庫查詢效能

---

## ✅ SEO 設定

- [ ] 已設定 meta tags（title, description）
- [ ] 已設定 og:image（Open Graph）
- [ ] 已設定 robots.txt
- [ ] 已設定 sitemap.xml（如適用）
- [ ] 已設定 canonical URLs
- [ ] 已測試社群媒體分享預覽

---

## ✅ 監控與日誌

- [ ] 已設定錯誤追蹤（如 Sentry）
- [ ] 已設定效能監控（如 Google Analytics）
- [ ] 已設定 uptime 監控
- [ ] 已設定警報通知
- [ ] 已測試日誌記錄功能
- [ ] 已設定日誌保留政策

---

## ✅ 部署設定

- [ ] 已選擇部署平台（Vercel/Netlify/自有伺服器）
- [ ] 已設定自動部署（CI/CD）
- [ ] 已設定部署環境變數
- [ ] 已設定自訂域名（如需要）
- [ ] 已設定 SSL 憑證
- [ ] 已測試部署流程
- [ ] 已設定 rollback 機制

---

## ✅ 測試檢查

- [ ] 已測試所有主要功能
- [ ] 已測試響應式設計（手機、平板、桌面）
- [ ] 已測試不同瀏覽器（Chrome, Firefox, Safari）
- [ ] 已測試錯誤處理流程
- [ ] 已測試邊界情況
- [ ] 已執行使用者驗收測試（UAT）

---

## ✅ 文件更新

- [ ] 已更新 README.md
- [ ] 已更新 MIGRATION.md（如有變更）
- [ ] 已更新 API 文檔（如有）
- [ ] 已記錄已知問題
- [ ] 已更新使用者手冊（如有）

---

## ✅ 備份與還原

- [ ] 已設定資料庫自動備份
- [ ] 已測試資料庫還原流程
- [ ] 已備份重要設定檔
- [ ] 已記錄還原步驟

---

## ✅ 法律與合規

- [ ] 已加入隱私政策頁面
- [ ] 已加入使用條款頁面
- [ ] 已加入 Cookie 政策（如適用）
- [ ] 已確認 GDPR 合規（如適用）
- [ ] 已加入免責聲明

---

## ✅ 最終檢查

- [ ] 已在 staging 環境完整測試
- [ ] 已通知相關人員部署時間
- [ ] 已準備 rollback 計畫
- [ ] 已準備監控儀表板
- [ ] 已準備客戶支援計畫
- [ ] 已安排部署後檢查時間

---

## 📝 部署後待辦事項

- [ ] 驗證所有功能正常運作
- [ ] 檢查錯誤日誌
- [ ] 監控系統效能
- [ ] 收集使用者反饋
- [ ] 記錄遇到的問題
- [ ] 更新部署文件

---

## 🚨 緊急聯絡資訊

**技術負責人**：
- 姓名：_______________
- 電話：_______________
- Email：_______________

**Supabase 支援**：
- 支援網站：https://supabase.com/support
- Discord：https://discord.supabase.com

**Lovable 支援**：
- 文檔：https://docs.lovable.dev/
- Discord：https://discord.gg/lovable

---

**檢查清單版本**：1.0.0  
**最後更新**：2025 年 11 月 5 日  
**檢查日期**：_______________  
**檢查人員**：_______________  
