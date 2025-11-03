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
  const [framework, setFramework] = useState("AIDA");
  const [contentType, setContentType] = useState("post");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
            <Label htmlFor="framework">文案框架</Label>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger id="framework" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AIDA">AIDA（注意→興趣→渴望→行動）</SelectItem>
                <SelectItem value="PAS">PAS（問題→放大→解決）</SelectItem>
                <SelectItem value="SCQA">SCQA（情境→衝突→問題→答案）</SelectItem>
                <SelectItem value="3C">3C（清晰→簡潔→吸引人）</SelectItem>
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
