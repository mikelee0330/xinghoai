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
  const [keywords, setKeywords] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("professional");
  const [framework, setFramework] = useState("問題共鳴法");
  const [contentType, setContentType] = useState("post");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const keywordSuggestions = [
    "產品賣點", "優惠活動", "適用人群", "用戶痛點", "適用場景",
    "產品功效", "我的行業", "我的店舖", "突出關鍵詞", "商品帶貨",
    "門店宣傳", "業務宣傳", "活動宣傳", "團購帶貨", "展示宣傳",
    "店名", "城市"
  ];

  const handleKeywordSuggestionClick = (suggestion: string) => {
    setKeywords((prev) => prev ? `${prev}、${suggestion}` : suggestion);
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
          keywords,
          platform,
          tone,
          framework,
          contentType: contentType === "post" ? "貼文腳本" : "影片腳本",
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
            <Label htmlFor="keywords">主題關鍵字</Label>
            <Input
              id="keywords"
              placeholder="例如：情緒智力、健身新手、時間管理"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="bg-background/50"
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
            <Label htmlFor="framework">文案框架（風格）</Label>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger id="framework" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="問題共鳴法">問題共鳴法</SelectItem>
                <SelectItem value="故事轉折法">故事轉折法</SelectItem>
                <SelectItem value="限時優惠法">限時優惠法</SelectItem>
                <SelectItem value="客戶見證法">客戶見證法</SelectItem>
                <SelectItem value="專家背書法">專家背書法</SelectItem>
                <SelectItem value="場景展示法">場景展示法</SelectItem>
                <SelectItem value="數據支撐法">數據支撐法</SelectItem>
                <SelectItem value="對比展示法">對比展示法</SelectItem>
                <SelectItem value="互動促銷法">互動促銷法</SelectItem>
                <SelectItem value="感情共鳴法">感情共鳴法</SelectItem>
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
                <SelectItem value="video">影片腳本</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
