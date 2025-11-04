# AI 服務配置說明

## 📋 概述

本專案使用 **Lovable AI** 作為主要的 AI 服務提供商，透過 Edge Functions 實現 AI 功能，包括：
- 品牌內容生成
- 品牌分析
- 多語言內容生成
- 多平台內容適配

---

## 🤖 使用的 AI 模型

### Lovable AI 支援模型

本專案可使用以下 AI 模型（無需額外 API Key）：

#### Google Gemini 系列

1. **google/gemini-2.5-pro**
   - **特點**：Gemini 家族中最強大的模型
   - **適用場景**：
     - 複雜的品牌分析
     - 需要深度理解的內容生成
     - 多模態輸入（圖文結合）
     - 大型上下文處理
   - **Token 限制**：最高
   - **成本**：較高
   - **速度**：較慢

2. **google/gemini-2.5-flash**（推薦用於本專案）
   - **特點**：平衡性能與成本
   - **適用場景**：
     - 一般內容生成
     - 品牌分析
     - 多語言翻譯
     - 日常 AI 任務
   - **Token 限制**：中等
   - **成本**：中等
   - **速度**：中等

3. **google/gemini-2.5-flash-lite**
   - **特點**：最快速且最經濟
   - **適用場景**：
     - 簡單的文本分類
     - 摘要生成
     - 關鍵字提取
     - 高頻率簡單任務
   - **Token 限制**：較低
   - **成本**：最低
   - **速度**：最快

#### OpenAI GPT 系列

4. **openai/gpt-5**
   - **特點**：強大的通用模型，推理能力優秀
   - **適用場景**：
     - 需要高精確度的內容生成
     - 複雜的創意寫作
     - 需要細膩語言處理
   - **Token 限制**：高
   - **成本**：高
   - **速度**：較慢

5. **openai/gpt-5-mini**
   - **特點**：性價比高，保留大部分 GPT-5 能力
   - **適用場景**：
     - 一般內容生成
     - 對話式 AI
     - 多輪對話
   - **Token 限制**：中等
   - **成本**：中等
   - **速度**：中等

6. **openai/gpt-5-nano**
   - **特點**：專為高速低成本設計
   - **適用場景**：
     - 高並發請求
     - 簡單文本處理
     - 實時互動場景
   - **Token 限制**：較低
   - **成本**：低
   - **速度**：快

---

## 📂 AI 相關程式檔案

### Edge Functions

位於 `supabase/functions/` 目錄：

#### 1. `generate-content/index.ts`
**功能**：AI 內容生成主要邏輯

**輸入參數**：
```typescript
{
  keywords: string;          // 關鍵字
  contentDirection: string;  // 內容方向
  platform: string;          // 平台（Facebook, Instagram 等）
  contentType: string;       // 內容類型（貼文、限時動態等）
  tone: string;              // 語調（專業、輕鬆等）
  brandId?: string;          // 品牌 ID（可選）
  framework?: string;        // 框架（可選）
}
```

**主要流程**：
1. 驗證用戶身份
2. 檢查用戶金幣餘額
3. 載入品牌資訊（如果提供）
4. 構建 AI Prompt
5. 呼叫 Lovable AI API
6. 扣除金幣
7. 儲存生成歷史
8. 返回生成內容

**使用的模型**：`google/gemini-2.5-flash`（可在程式碼中修改）

**金幣消耗**：每次生成 1P

#### 2. `analyze-brand/index.ts`
**功能**：分析品牌文件並生成品牌特徵摘要

**輸入參數**：
```typescript
{
  brandName: string;         // 品牌名稱
  targetAudience?: string;   // 目標受眾
  brandTone?: string;        // 品牌語調
  additionalNotes?: string;  // 額外說明
  brandFiles?: string[];     // 品牌文件 URLs
}
```

**主要流程**：
1. 驗證用戶身份
2. 下載並讀取品牌文件
3. 構建分析 Prompt
4. 呼叫 Lovable AI API
5. 返回分析結果

**使用的模型**：`google/gemini-2.5-pro`（因為需要處理多模態內容）

**金幣消耗**：不消耗金幣

#### 3. `reset-password/index.ts`
**功能**：密碼重置（不涉及 AI）

### 前端組件

#### 1. `src/components/ContentGenerator.tsx`
**功能**：內容生成介面

**主要功能**：
- 提供表單輸入（關鍵字、平台、內容類型等）
- 選擇品牌設定
- 呼叫 `generate-content` Edge Function
- 顯示生成結果
- 複製到剪貼簿功能
- 查看歷史紀錄

#### 2. `src/components/BrandSettings.tsx`
**功能**：品牌設定管理

**主要功能**：
- 上傳品牌文件
- 設定品牌基本資訊
- 呼叫 `analyze-brand` Edge Function
- 儲存品牌設定

---

## 🔧 設定與配置

### 環境變數

**在 Edge Functions 中需要的環境變數**：

```bash
# Lovable AI API Key
LOVABLE_API_KEY=your_lovable_api_key_here

# Supabase 連線資訊（自動提供）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**設定方式**：

使用 Lovable Cloud（自動設定）：
- 環境變數會自動配置，無需手動操作

使用自行架設的 Supabase：
```bash
# 設定 secret
supabase secrets set LOVABLE_API_KEY=your_key_here

# 查看所有 secrets
supabase secrets list

# 刪除 secret
supabase secrets unset LOVABLE_API_KEY
```

---

## 📝 Prompt 設計與參數

### 內容生成 Prompt 結構

```typescript
const basePrompt = `你是一位專業的社群媒體內容創作專家。請根據以下資訊生成內容：

關鍵字：${keywords}
內容方向：${contentDirection}
平台：${platform}
內容類型：${contentType}
語調：${tone}
語言：${language}

${brandInfo ? `品牌資訊：
品牌名稱：${brandInfo.brand_name}
目標受眾：${brandInfo.target_audience}
品牌語調：${brandInfo.brand_tone}
品牌分析：${brandInfo.ai_analysis}
` : ''}

${framework ? `請使用以下框架：${framework}` : ''}

請生成一段適合 ${platform} 的 ${contentType}，內容要：
1. 自然融入關鍵字
2. 符合平台特性
3. 符合指定語調
4. 吸引目標受眾
5. 包含適當的 hashtags（如適用）

直接輸出內容，不需要額外說明。`;
```

### 品牌分析 Prompt 結構

```typescript
const analysisPrompt = `請分析以下品牌資訊並生成詳細的品牌特徵摘要：

品牌名稱：${brandName}
${targetAudience ? `目標受眾：${targetAudience}` : ''}
${brandTone ? `品牌語調：${brandTone}` : ''}
${additionalNotes ? `額外說明：${additionalNotes}` : ''}

${filesContent ? `品牌相關文件內容：
${filesContent}
` : ''}

請提供以下分析：
1. 品牌核心價值與定位
2. 目標受眾特徵
3. 適合的內容風格與語調
4. 推薦的內容主題方向
5. 差異化競爭優勢

請以繁體中文輸出，條理清晰。`;
```

### AI 模型參數

**通用參數**：
```typescript
{
  model: "google/gemini-2.5-flash",  // 使用的模型
  temperature: 0.7,                   // 創意程度（0-1）
  max_tokens: 2000,                   // 最大輸出長度
  top_p: 0.9,                         // 採樣參數
  frequency_penalty: 0.0,             // 重複懲罰
  presence_penalty: 0.0               // 主題重複懲罰
}
```

**參數說明**：

- **temperature**（溫度）：
  - `0.0-0.3`：較保守，輸出更一致
  - `0.4-0.7`：平衡創意與一致性（推薦）
  - `0.8-1.0`：更有創意，但可能不穩定

- **max_tokens**（最大 Token 數）：
  - 短文案：500-1000
  - 一般內容：1000-2000（目前設定）
  - 長文章：2000-4000

- **top_p**（核採樣）：
  - 控制輸出的多樣性
  - `0.9`：平衡多樣性與質量（推薦）
  - `1.0`：最大多樣性

### 根據不同場景調整參數

**場景 1：品牌文案（需要穩定性）**
```typescript
{
  temperature: 0.5,
  max_tokens: 1500,
  top_p: 0.85
}
```

**場景 2：創意內容（需要創造力）**
```typescript
{
  temperature: 0.8,
  max_tokens: 2000,
  top_p: 0.95
}
```

**場景 3：品牌分析（需要準確性）**
```typescript
{
  temperature: 0.3,
  max_tokens: 3000,
  top_p: 0.8
}
```

---

## 🔄 切換到其他 AI 服務

### 使用 OpenAI API

1. **安裝套件**（在 Edge Function 中）：
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
});
```

2. **修改呼叫方式**：
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: "你是一位專業的內容創作者" },
    { role: "user", content: prompt }
  ],
  temperature: 0.7,
  max_tokens: 2000
});

const content = response.choices[0].message.content;
```

3. **設定環境變數**：
```bash
supabase secrets set OPENAI_API_KEY=sk-...
```

### 使用 Anthropic Claude API

1. **安裝套件**：
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')
});
```

2. **修改呼叫方式**：
```typescript
const response = await anthropic.messages.create({
  model: "claude-3-opus-20240229",
  max_tokens: 2000,
  messages: [
    { role: "user", content: prompt }
  ]
});

const content = response.content[0].text;
```

---

## 📊 使用量與成本追蹤

### Lovable AI 用量追蹤

Lovable AI 使用量會計入 Lovable Cloud 的用量限制，可在以下位置查看：
- Lovable Dashboard > Cloud > Usage

### 自行追蹤方式

在 Edge Function 中加入日誌：
```typescript
console.log({
  function: 'generate-content',
  user_id: userId,
  model: 'google/gemini-2.5-flash',
  tokens_used: response.usage?.total_tokens,
  cost: calculateCost(response.usage?.total_tokens),
  timestamp: new Date().toISOString()
});
```

---

## 🧪 測試 AI 功能

### 本地測試 Edge Function

```bash
# 啟動本地 Supabase
supabase start

# 測試 generate-content function
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/generate-content' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "keywords": "環保",
    "contentDirection": "推廣環保理念",
    "platform": "Facebook",
    "contentType": "貼文",
    "tone": "專業"
  }'
```

### 測試不同模型

在 `generate-content/index.ts` 中修改：
```typescript
// 測試不同模型
const models = [
  'google/gemini-2.5-flash',
  'google/gemini-2.5-pro',
  'openai/gpt-5-mini'
];

// 選擇要測試的模型
const selectedModel = models[0];
```

---

## 🛠️ 故障排除

### 問題 1：AI 回應過慢

**可能原因**：
- 使用了較慢的模型（如 gemini-2.5-pro）
- max_tokens 設定過高
- 網路延遲

**解決方案**：
```typescript
// 改用更快的模型
model: 'google/gemini-2.5-flash-lite'

// 降低 max_tokens
max_tokens: 1000

// 加入 timeout
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000); // 30秒

const response = await fetch(API_URL, {
  signal: controller.signal,
  ...
});
clearTimeout(timeout);
```

### 問題 2：AI 輸出不符合預期

**可能原因**：
- Prompt 設計不佳
- temperature 設定不當
- 缺少品牌上下文

**解決方案**：
```typescript
// 更明確的 Prompt
const improvedPrompt = `請嚴格遵守以下格式生成內容：

【標題】（不超過 20 字）
【內容】（150-200 字）
【Hashtags】（3-5 個）

內容要求：
- 必須包含關鍵字「${keywords}」
- 語調為「${tone}」
- 適合「${platform}」平台
- 不要使用太多表情符號
- 使用繁體中文

現在請開始生成：`;

// 降低 temperature 提高穩定性
temperature: 0.5
```

### 問題 3：API Key 無效

**檢查步驟**：
```bash
# 1. 確認 secret 已設定
supabase secrets list

# 2. 查看 function logs
supabase functions logs generate-content

# 3. 重新設定 secret
supabase secrets set LOVABLE_API_KEY=your_new_key
```

---

## 📈 優化建議

### 1. 實作快取機制

```typescript
// 相似的請求可以快取結果
const cacheKey = `${keywords}_${platform}_${contentType}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return cached;
}

// 生成新內容...
await redis.set(cacheKey, result, { ex: 3600 }); // 快取 1 小時
```

### 2. 批次處理

```typescript
// 一次生成多個變體
const prompts = [
  generatePrompt({ tone: '專業' }),
  generatePrompt({ tone: '輕鬆' }),
  generatePrompt({ tone: '幽默' })
];

const results = await Promise.all(
  prompts.map(prompt => callAI(prompt))
);
```

### 3. 串流回應

```typescript
// 使用 streaming 提升使用者體驗
const stream = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    // 即時傳送給前端
    sendToClient(content);
  }
}
```

---

**最後更新**：2025 年 11 月 5 日
