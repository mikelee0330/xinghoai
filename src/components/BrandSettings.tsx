import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/i18n";
import { z } from "zod";

interface BrandSetting {
  id: string;
  brand_name: string;
  brand_tone: string;
  target_audience: string;
  language: string;
  additional_notes: string;
}

export const BrandSettings = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  
  const [brands, setBrands] = useState<BrandSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandSetting | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    brand_name: "",
    brand_tone: "",
    target_audience: "",
    language: "繁體中文",
    additional_notes: "",
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("brand_settings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "載入失敗",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setBrands(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    const brandSchema = z.object({
      brand_name: z.string().trim().min(1, "請輸入品牌名稱").max(100, "品牌名稱不能超過 100 字元"),
      brand_tone: z.string().trim().min(1, "請輸入品牌語調").max(500, "品牌語調不能超過 500 字元"),
      target_audience: z.string().trim().min(1, "請輸入目標客群").max(500, "目標客群不能超過 500 字元"),
      additional_notes: z.string().max(2000, "補充說明不能超過 2000 字元").optional(),
    });

    try {
      brandSchema.parse({
        brand_name: formData.brand_name,
        brand_tone: formData.brand_tone,
        target_audience: formData.target_audience,
        additional_notes: formData.additional_notes || undefined,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "輸入驗證失敗",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "錯誤",
        description: "請先登入",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    if (editingBrand) {
      // Update existing brand
      const { error } = await supabase
        .from("brand_settings")
        .update({
          brand_name: formData.brand_name,
          brand_tone: formData.brand_tone,
          target_audience: formData.target_audience,
          language: formData.language,
          additional_notes: formData.additional_notes,
        })
        .eq("id", editingBrand.id);

      if (error) {
        toast({
          title: "更新失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "更新成功",
          description: "品牌設定已更新",
        });
        resetForm();
        loadBrands();
      }
    } else {
      // Create new brand
      const { error } = await supabase.from("brand_settings").insert({
        user_id: user.id,
        brand_name: formData.brand_name,
        brand_tone: formData.brand_tone,
        target_audience: formData.target_audience,
        language: formData.language,
        additional_notes: formData.additional_notes,
      });

      if (error) {
        toast({
          title: "儲存失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "儲存成功",
          description: "品牌設定已建立",
        });
        resetForm();
        loadBrands();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("brand_settings").delete().eq("id", id);

    if (error) {
      toast({
        title: "刪除失敗",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "刪除成功",
        description: "品牌設定已刪除",
      });
      loadBrands();
    }
  };

  const handleEdit = (brand: BrandSetting) => {
    setEditingBrand(brand);
    setFormData({
      brand_name: brand.brand_name,
      brand_tone: brand.brand_tone,
      target_audience: brand.target_audience,
      language: brand.language,
      additional_notes: brand.additional_notes,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      brand_name: "",
      brand_tone: "",
      target_audience: "",
      language: "繁體中文",
      additional_notes: "",
    });
    setEditingBrand(null);
    setShowForm(false);
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  };

  const handleNewBrand = async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      toast({
        title: "請先登入",
        description: "您需要登入才能建立品牌設定",
        variant: "destructive",
      });
      return;
    }
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">品牌設定</h2>
          <p className="text-muted-foreground">管理您的品牌語調、受眾屬性和語系設定</p>
        </div>
        {!showForm && (
          <Button onClick={handleNewBrand}>
            <Plus className="mr-2 h-4 w-4" />
            新增品牌
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBrand ? "編輯品牌設定" : "新增品牌設定"}</CardTitle>
            <CardDescription>設定您的品牌語調和目標受眾</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand_name">品牌名稱 *</Label>
                <Input
                  id="brand_name"
                  value={formData.brand_name}
                  onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  placeholder="例：時尚品牌 X"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand_tone">品牌語調 *</Label>
                <Input
                  id="brand_tone"
                  value={formData.brand_tone}
                  onChange={(e) => setFormData({ ...formData, brand_tone: e.target.value })}
                  placeholder="例：年輕活潑、專業可靠、溫暖親切"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience">目標受眾 *</Label>
                <Input
                  id="target_audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  placeholder="例：25-35歲職場女性"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">語系</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                  disabled={saving}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="繁體中文">繁體中文</SelectItem>
                    <SelectItem value="简体中文">简体中文</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="日本語">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_notes">其他說明</Label>
                <Textarea
                  id="additional_notes"
                  value={formData.additional_notes}
                  onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                  placeholder="任何其他關於品牌的特殊要求或說明..."
                  disabled={saving}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingBrand ? "更新" : "儲存"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : brands.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            尚未建立任何品牌設定，點擊「新增品牌」開始
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {brands.map((brand) => (
            <Card key={brand.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {brand.brand_name}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(brand)}
                    >
                      編輯
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(brand.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">語調：</span>
                  <span className="text-muted-foreground">{brand.brand_tone}</span>
                </div>
                <div>
                  <span className="font-semibold">受眾：</span>
                  <span className="text-muted-foreground">{brand.target_audience}</span>
                </div>
                <div>
                  <span className="font-semibold">語系：</span>
                  <span className="text-muted-foreground">{brand.language}</span>
                </div>
                {brand.additional_notes && (
                  <div>
                    <span className="font-semibold">說明：</span>
                    <p className="text-muted-foreground mt-1">{brand.additional_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
