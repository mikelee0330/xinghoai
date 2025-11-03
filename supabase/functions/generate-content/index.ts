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
    const { 
      contentDirection,
      keywords, 
      textContent,
      platform, 
      tone, 
      framework,
      contentType,
      wordCount,
      videoLength,
      additionalRequirements,
      brandInfo
    } = await req.json();
    
    console.log("Generating content with params:", { 
      contentDirection, keywords, textContent, platform, tone, framework, 
      contentType, wordCount, videoLength, additionalRequirements, hasBrandInfo: !!brandInfo 
    });

    // Map user-friendly framework names to professional frameworks
    const frameworkMapping: Record<string, string> = {
      "問題共鳴法": "PAS (Problem → Agitate → Solve)",
      "故事轉折法": "SCQA (Situation → Complication → Question → Answer)",
      "限時優惠法": "AIDA (Attention → Interest → Desire → Action)",
      "客戶見證法": "BAB (Before → After → Bridge)",
      "專家背書法": "SRT (Situation → Resistance → Takeaway)",
      "場景展示法": "TDC (Teaser → Demonstration → Conclusion)",
      "數據支撐法": "3C (Context → Conflict → Conclusion)",
      "對比展示法": "FAB (Feature → Advantage → Benefit)",
      "互動促銷法": "Hooks (Hook → Hold → Payoff)",
      "感情共鳴法": "SCQA (Situation → Complication → Question → Answer)",
    };

    const professionalFramework = frameworkMapping[framework] || framework;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt for content generation
    let systemPrompt = `你是一位專業的社群內容創作專家，擅長根據品牌調性和目標客群創作吸引人的社群貼文和影片腳本。`;
    
    // Add brand information if provided
    if (brandInfo) {
      systemPrompt += `\n\n【品牌資訊】
品牌名稱：${brandInfo.name}
品牌語調：${brandInfo.tone || '未指定'}
目標受眾：${brandInfo.audience || '未指定'}`;
      
      if (brandInfo.analysis) {
        systemPrompt += `\n品牌特性分析：\n${brandInfo.analysis}`;
      }
      
      systemPrompt += `\n\n請確保生成的內容符合以上品牌特性，語調和風格與品牌一致。`;
    }
    
    systemPrompt += `\n請根據以下設定生成內容：

內容方向：${contentDirection}
平台：${platform}
語調風格：${tone}
文案框架：${professionalFramework}
內容類型：${contentType}
${contentType === "貼文腳本" && wordCount ? `字數要求：${wordCount}` : ""}
${contentType === "影片腳本" && videoLength ? `長度要求：${videoLength}` : ""}

輸出格式要求：
1. 第一行必須是吸引人的標題，標題要能準確反映內容方向和主題
2. 第二行空行
3. 從第三行開始是正文內容
4. 正文內容請使用純文字格式，不要使用任何 markdown 符號（如 **、##、- 等）
5. 使用空行來分段，讓內容更清晰易讀
6. 可以使用適當的表情符號增加吸引力

內容要求：
1. 符合所選的文案框架結構
2. 適合目標平台的特性
3. 語調一致且吸引目標受眾
${contentType === "影片腳本" ? "4. 適合口播，語句自然流暢" : ""}

請用繁體中文生成專業且吸引人的內容。`;

    const userPrompt = `
主題關鍵字：
${keywords}

${textContent ? `文本內容：\n${textContent}\n` : ""}

${additionalRequirements ? `補充要求：\n${additionalRequirements}` : ""}

請根據以上資訊，創作一篇${contentType}。`;

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
