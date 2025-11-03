import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, Copy, Check, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface GenerationHistory {
  id: string;
  date: string;
  content: string;
  platform: string;
  contentDirection: string;
  keywords: string;
  textContent: string;
  tone: string;
  framework: string;
  contentType: string;
  wordCount?: string;
  videoLength?: string;
  additionalRequirements: string;
}

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
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from("generation_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error loading history:", error);
    } else if (data) {
      const formattedHistory: GenerationHistory[] = data.map(item => ({
        id: item.id,
        date: item.created_at,
        content: item.generated_content,
        platform: item.platform,
        contentDirection: item.content_direction,
        keywords: item.keywords,
        textContent: "",
        tone: item.tone,
        framework: item.framework || "問題共鳴法",
        contentType: item.content_type,
        additionalRequirements: "",
      }));
      setHistory(formattedHistory);
    }
  };

  const frameworkInfo: Record<string, { framework: string; structure: string; description: string }> = {
    "問題共鳴法": {
      framework: "PAS（Problem → Agitate → Solve）",
      structure: "Problem → Agitate → Solve",
      description: "開場抓痛點、放大情緒、給出解方"
    },
    "故事轉折法": {
      framework: "SCQA（Situation → Complication → Question → Answer）",
      structure: "Situation → Complication → Question → Answer",
      description: "用故事鋪陳、反轉、最後揭示解答"
    },
    "限時優惠法": {
      framework: "AIDA（Attention → Interest → Desire → Action）",
      structure: "Attention → Interest → Desire → Action",
      description: "抓眼球、挑慾望、促行動"
    },
    "客戶見證法": {
      framework: "BAB（Before → After → Bridge）",
      structure: "Before → After → Bridge",
      description: "前後對比展現改變，引起模仿與渴望"
    },
    "專家背書法": {
      framework: "SRT（Situation → Resistance → Takeaway）",
      structure: "Situation → Resistance → Takeaway",
      description: "專業角度破除迷思、建立權威感"
    },
    "場景展示法": {
      framework: "TDC（Teaser → Demonstration → Conclusion）",
      structure: "Teaser → Demonstration → Conclusion",
      description: "展示產品場景，快速呈現賣點與轉化"
    },
    "數據支撐法": {
      framework: "3C（Context → Conflict → Conclusion）",
      structure: "Context → Conflict → Conclusion",
      description: "以數據對比、結論支持觀點，提升公信力"
    },
    "對比展示法": {
      framework: "FAB（Feature → Advantage → Benefit）",
      structure: "Feature → Advantage → Benefit",
      description: "清楚展示差異、優勢與利益點"
    },
    "互動促銷法": {
      framework: "Hooks（Hook → Hold → Payoff）",
      structure: "Hook → Hold → Payoff",
      description: "強開場、快節奏、立即行動回饋"
    },
    "感情共鳴法": {
      framework: "SCQA（Situation → Complication → Question → Answer）",
      structure: "Situation → Complication → Question → Answer",
      description: "感性鋪陳、共鳴情緒、故事帶入收尾"
    }
  };

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

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setIsCopied(true);
      toast({
        title: "複製成功！",
        description: "內容已複製到剪貼板",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "複製失敗",
        description: "無法複製內容，請手動選取複製",
        variant: "destructive",
      });
    }
  };

  const saveToHistory = async (content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from("generation_history")
      .insert({
        user_id: user.id,
        platform,
        content_direction: contentDirection,
        keywords,
        content_type: contentType === "post" ? "貼文腳本" : "影片腳本",
        tone,
        framework,
        generated_content: content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving to history:", error);
    } else if (data) {
      await loadHistory();
    }
  };

  const deleteFromHistory = async (id: string) => {
    const { error } = await supabase
      .from("generation_history")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "刪除失敗",
        description: error.message,
        variant: "destructive",
      });
    } else {
      await loadHistory();
      toast({
        title: "已刪除",
        description: "歷史記錄已刪除",
      });
    }
  };

  const copyHistoryContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "複製成功！",
        description: "內容已複製到剪貼板",
      });
    } catch (error) {
      toast({
        title: "複製失敗",
        description: "無法複製內容，請手動選取複製",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "請先登入",
        description: "您需要登入才能使用內容生成功能",
        variant: "destructive",
      });
      return;
    }

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
      saveToHistory(data.content);
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
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            內容生成設定
          </h2>
          
          <div className="space-y-4">
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
              <Label htmlFor="framework">文案輸出架構</Label>
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
              {frameworkInfo[framework] && (
                <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-1.5">
                  <div className="text-sm">
                    <span className="font-semibold text-primary">框架對應：</span>
                    <span className="text-foreground">{frameworkInfo[framework].framework}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-primary">案例說明：</span>
                    <span className="text-foreground">{frameworkInfo[framework].description}</span>
                  </div>
                </div>
              )}
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              生成結果
            </h2>
            {generatedContent && (
              <Button
                onClick={handleCopyContent}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    已複製
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    複製內容
                  </>
                )}
              </Button>
            )}
          </div>
          
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

      {/* History Section */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          生成歷史記錄
        </h2>
        
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item) => {
              // Extract title from content (first line or keywords)
              const contentLines = item.content.split('\n').filter(line => line.trim());
              const title = contentLines[0] || item.keywords.split('\n')[0] || "未命名內容";
              const summaryLength = 50;
              const summary = item.content.substring(0, summaryLength) + (item.content.length > summaryLength ? "..." : "");
              
              return (
                <div key={item.id} className="p-4 bg-background/50 rounded-lg border border-border flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-muted-foreground mb-1">
                      {new Date(item.date).toLocaleString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="font-semibold text-sm mb-1">
                      [{item.contentType}] {title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {summary}
                    </div>
                  </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={() => copyHistoryContent(item.content)}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    複製
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="h-4 w-4" />
                        詳細
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>生成詳細資訊</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-muted-foreground">生成日期</Label>
                          <p className="mt-1">{new Date(item.date).toLocaleString('zh-TW')}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">發布平台</Label>
                          <p className="mt-1">{item.platform}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">內容方向</Label>
                          <p className="mt-1">{item.contentDirection}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">文案輸出架構</Label>
                          <p className="mt-1">{item.framework}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">主題關鍵字</Label>
                          <p className="mt-1 whitespace-pre-wrap">{item.keywords}</p>
                        </div>
                        {item.textContent && (
                          <div>
                            <Label className="text-muted-foreground">文本內容</Label>
                            <p className="mt-1 whitespace-pre-wrap">{item.textContent}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-muted-foreground">語調風格</Label>
                          <p className="mt-1">{item.tone}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">內容類型</Label>
                          <p className="mt-1">{item.contentType}</p>
                        </div>
                        {item.wordCount && (
                          <div>
                            <Label className="text-muted-foreground">字數</Label>
                            <p className="mt-1">{item.wordCount}</p>
                          </div>
                        )}
                        {item.videoLength && (
                          <div>
                            <Label className="text-muted-foreground">影片長度</Label>
                            <p className="mt-1">{item.videoLength}</p>
                          </div>
                        )}
                        {item.additionalRequirements && (
                          <div>
                            <Label className="text-muted-foreground">補充要求</Label>
                            <p className="mt-1 whitespace-pre-wrap">{item.additionalRequirements}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-muted-foreground">生成內容</Label>
                          <Textarea
                            value={item.content}
                            readOnly
                            className="mt-1 min-h-[200px] bg-background/50 font-mono text-sm"
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    onClick={() => deleteFromHistory(item.id)}
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    刪除
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>尚無生成記錄</p>
          </div>
        )}
      </Card>
    </div>
  );
};
