import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";

export const ContentGenerator = () => {
  const [contentDirection, setContentDirection] = useState("知識分享型");
  const [keywords, setKeywords] = useState("");
  const [textContent, setTextContent] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("professional");
  const [framework, setFramework] = useState("問題共鳴法");
  const [contentType, setContentType] = useState("post");
  const [wordCount, setWordCount] = useState("300字內");
  const [videoLength, setVideoLength] = useState("50~75字(10~15s)");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const contentDirections = [
    { value: "知識分享型", label: "知識分享型", emoji: "📚", desc: "教學干貨帖，輕鬆愛分享" },
    { value: "情感共鳴型", label: "情感共鳴型", emoji: "🖤", desc: "分享感受，建立情感連接" },
    { value: "消除疑慮型", label: "消除疑慮型", emoji: "🧠", desc: "破除迷思，讓人放心買" },
    { value: "種草推薦型", label: "種草推薦型", emoji: "🎁", desc: "好物分享，激發購買欲" },
    { value: "引發討論型", label: "引發討論型", emoji: "💬", desc: "激發不同觀點，引起討論" },
    { value: "品牌故事型", label: "品牌故事型", emoji: "🍱", desc: "說品牌故事，留下印象" },
    { value: "促進銷售型", label: "促進銷售型", emoji: "👗", desc: "放大賣點，激發客戶需求" },
    { value: "痛點營銷型", label: "痛點營銷型", emoji: "🛒", desc: "放大痛點，喚醒購買動力" },
    { value: "深度見解型", label: "深度見解型", emoji: "🔍", desc: "深度見解，打造專家形象" },
    { value: "贊美好物型", label: "贊美好物型", emoji: "☀️", desc: "細膩贊美，建立好感形象" },
  ];

  const keywordSuggestions = [
    "產品賣點", "優惠活動", "適用人群", "用戶痛點", "適用場景",
    "產品功效", "我的行業", "我的店舖", "突出關鍵詞", "商品帶貨",
    "門店宣傳", "業務宣傳", "活動宣傳", "團購帶貨", "展示宣傳",
    "店名", "城市"
  ];

  const handleKeywordSuggestionClick = (suggestion: string) => {
    setKeywords((prev) => prev ? `${prev}\n${suggestion}:` : `${suggestion}:`);
  };

  const handleGenerate = async () => {
    if (!keywords.trim()) {
      toast({
        title: "請輸入關鍵字",
        description: "請先輸入您想要創作的主題關鍵字",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedContent("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          contentDirection,
          keywords,
          textContent,
          platform,
          tone,
          framework,
          contentType: contentType === "post" ? "貼文腳本" : "影片腳本",
          wordCount: contentType === "post" ? wordCount : undefined,
          videoLength: contentType === "video" ? videoLength : undefined,
          additionalRequirements,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setGeneratedContent(data.content);
      toast({
        title: "內容生成成功！",
        description: "AI 已為您生成專業的社群內容",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "生成失敗",
        description: error instanceof Error ? error.message : "生成內容時發生錯誤，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-7xl mx-auto">
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          內容生成設定
        </h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>內容方向</Label>
            <div className="grid grid-cols-2 gap-3">
              {contentDirections.map((direction) => (
                <button
                  key={direction.value}
                  type="button"
                  onClick={() => setContentDirection(direction.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    contentDirection === direction.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{direction.emoji}</div>
                  <div className="font-semibold text-sm mb-1">{direction.label}</div>
                  <div className="text-xs text-muted-foreground">{direction.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">主題關鍵字</Label>
            <Textarea
              id="keywords"
              placeholder="例如：產品賣點: 高效保濕&#10;適用人群: 25-35歲女性"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="bg-background/50 min-h-[80px]"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {keywordSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleKeywordSuggestionClick(suggestion)}
                  className="text-xs"
                >
                  #{suggestion}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textContent">文本內容</Label>
            <Textarea
              id="textContent"
              placeholder="貼貼內容文本"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="bg-background/50 min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              提示：直接貼上你寫好的內容或小紅書從中分析亮點，變出吸睛標題！
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">發布平台</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="platform" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Threads">Threads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">語調風格</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">專業正式</SelectItem>
                <SelectItem value="humorous">幽默風趣</SelectItem>
                <SelectItem value="casual">輕鬆隨性</SelectItem>
                <SelectItem value="friendly">親切友善</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="framework">文案風格</Label>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger id="framework" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="問題共鳴法">💬 問題共鳴法 | 以觀眾痛點開場，引起共鳴</SelectItem>
                <SelectItem value="故事轉折法">🎬 故事轉折法 | 用故事設局與反轉，引發好奇</SelectItem>
                <SelectItem value="限時優惠法">🔥 限時優惠法 | 製造稀缺感與緊迫感，引導行動</SelectItem>
                <SelectItem value="客戶見證法">🗣 客戶見證法 | 以真實案例建立信任與口碑效應</SelectItem>
                <SelectItem value="專家背書法">🧠 專家背書法 | 引用專業觀點或權威意見提升信任度</SelectItem>
                <SelectItem value="場景展示法">🏙 場景展示法 | 帶入真實使用場景，增強沉浸感</SelectItem>
                <SelectItem value="數據支撐法">📊 數據支撐法 | 用具體數據或事實證明說服力</SelectItem>
                <SelectItem value="對比展示法">⚖️ 對比展示法 | 透過差異強化產品亮點與優勢</SelectItem>
                <SelectItem value="互動促銷法">🎯 互動促銷法 | 以提問或互動引導參與與行動</SelectItem>
                <SelectItem value="感情共鳴法">❤️ 感情共鳴法 | 以情感故事建立連結，引發共鳴</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentType">內容類型</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger id="contentType" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">貼文腳本</SelectItem>
                <SelectItem value="video">影片口播</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {contentType === "post" && (
            <div className="space-y-2">
              <Label htmlFor="wordCount">字數</Label>
              <Select value={wordCount} onValueChange={setWordCount}>
                <SelectTrigger id="wordCount" className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300字內">300字內</SelectItem>
                  <SelectItem value="500-1500字">500-1500字</SelectItem>
                  <SelectItem value="1500-2000字">1500-2000字</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {contentType === "video" && (
            <div className="space-y-2">
              <Label htmlFor="videoLength">字數</Label>
              <Select value={videoLength} onValueChange={setVideoLength}>
                <SelectTrigger id="videoLength" className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50~75字(10~15s)">50~75字(10~15s正常口播時長)</SelectItem>
                  <SelectItem value="75~150字(15~30s)">75~150字(15~30s正常口播時長)</SelectItem>
                  <SelectItem value="150~300字(30~60s)">150~300字(30~60s正常口播時長)</SelectItem>
                  <SelectItem value="300~450字(≥60s)">300~450字(≥60s正常口播時長)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="additionalRequirements">補充要求</Label>
            <Textarea
              id="additionalRequirements"
              placeholder="請簡述您的補充要求"
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              className="bg-background/50 min-h-[100px]"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AI 創作中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                開始生成內容
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          生成結果
        </h2>
        
        {generatedContent ? (
          <Textarea
            value={generatedContent}
            onChange={(e) => setGeneratedContent(e.target.value)}
            className="min-h-[500px] bg-background/50 font-mono text-sm"
            placeholder="生成的內容將顯示在這裡..."
          />
        ) : (
          <div className="min-h-[500px] bg-background/50 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <Sparkles className="h-12 w-12 mx-auto opacity-50" />
              <p>填寫左側設定，開始生成專業內容</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
