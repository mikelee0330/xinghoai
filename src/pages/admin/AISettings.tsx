import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AISettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    defaultModel: "google/gemini-2.5-flash",
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompt: "",
    enableModeration: true,
    costPerGeneration: 10
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save settings to localStorage for now
      localStorage.setItem("aiSettings", JSON.stringify(settings));
      toast.success("AI設置已保存");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("保存失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("aiSettings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI設置</h1>
          <p className="text-muted-foreground mt-2">配置AI內容生成參數</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>模型設置</CardTitle>
            <CardDescription>選擇和配置AI模型</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">默認模型</Label>
              <Input
                id="model"
                value={settings.defaultModel}
                onChange={(e) => setSettings({...settings, defaultModel: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">最大Token數</Label>
              <Input
                id="maxTokens"
                type="number"
                value={settings.maxTokens}
                onChange={(e) => setSettings({...settings, maxTokens: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">溫度 (0-1)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={settings.temperature}
                onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系統提示詞</CardTitle>
            <CardDescription>設置AI的基礎行為</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="輸入系統提示詞..."
              value={settings.systemPrompt}
              onChange={(e) => setSettings({...settings, systemPrompt: e.target.value})}
              rows={6}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>金幣設置</CardTitle>
            <CardDescription>設置內容生成成本</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cost">每次生成消耗金幣</Label>
              <Input
                id="cost"
                type="number"
                value={settings.costPerGeneration}
                onChange={(e) => setSettings({...settings, costPerGeneration: parseInt(e.target.value)})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>啟用內容審核</Label>
                <p className="text-sm text-muted-foreground">過濾不適當的內容</p>
              </div>
              <Switch
                checked={settings.enableModeration}
                onCheckedChange={(checked) => setSettings({...settings, enableModeration: checked})}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          保存設置
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AISettings;
