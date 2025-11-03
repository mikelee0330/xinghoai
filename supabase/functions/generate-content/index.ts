import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords, platform, tone, framework, contentType } = await req.json();
    
    console.log("Generating content with params:", { keywords, platform, tone, framework, contentType });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt for content generation
    const systemPrompt = `你是一位專業的社群媒體內容創作專家，擅長為不同平台創作吸引人的內容。

請根據以下要求生成內容：
- 平台：${platform}
- 語調：${tone}
- 文案框架：${framework}
- 內容類型：${contentType}

請用繁體中文生成專業且吸引人的內容。`;

    const userPrompt = `關鍵字：${keywords}

請根據上述關鍵字和要求，創作一篇完整的${contentType}。

如果是貼文腳本，請包含：
1. 吸睛的開頭
2. 有價值的內容主體
3. 明確的行動呼籲（CTA）
4. 相關的標籤建議

如果是影片腳本，請包含：
1. 開場白（前3秒吸引注意力）
2. 主要內容（清楚的重點段落）
3. 結尾呼籲行動
4. 口播時間建議

請確保內容符合${platform}平台的特性和${tone}的語調。`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "請求次數過多，請稍後再試" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "需要充值，請至工作區設定新增額度" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No content generated");
    }

    console.log("Content generated successfully");

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-content function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "生成內容時發生錯誤" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
