import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ReferralSettings {
  referrer_reward: number;
  referee_reward: number;
  is_active: boolean;
}

interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  status: string;
  reward_given: boolean;
  created_at: string;
  referrer_email?: string;
  referee_email?: string;
}

const ReferralManagement = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ReferralSettings>({
    referrer_reward: 50,
    referee_reward: 50,
    is_active: true
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("referral_settings")
        .select("*")
        .single();

      if (settingsError && settingsError.code !== "PGRST116") {
        throw settingsError;
      }

      if (settingsData) {
        setSettings(settingsData);
      }

      // Load referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from("referrals")
        .select("*")
        .order("created_at", { ascending: false });

      if (referralsError) throw referralsError;

      // Get emails
      const userIds = new Set<string>();
      referralsData?.forEach(r => {
        userIds.add(r.referrer_id);
        userIds.add(r.referee_id);
      });

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, email")
        .in("user_id", Array.from(userIds));

      const referralsWithEmails = referralsData?.map(ref => ({
        ...ref,
        referrer_email: profilesData?.find(p => p.user_id === ref.referrer_id)?.email,
        referee_email: profilesData?.find(p => p.user_id === ref.referee_id)?.email
      })) || [];

      setReferrals(referralsWithEmails);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("加載數據失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("referral_settings")
        .upsert({
          referrer_reward: settings.referrer_reward,
          referee_reward: settings.referee_reward,
          is_active: settings.is_active
        });

      if (error) throw error;

      toast.success("設置已保存");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("保存失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReward = async (referralId: string) => {
    try {
      setLoading(true);
      const referral = referrals.find(r => r.id === referralId);
      if (!referral) return;

      // Mark as completed and reward given
      const { error: updateError } = await supabase
        .from("referrals")
        .update({ 
          status: "completed",
          reward_given: true 
        })
        .eq("id", referralId);

      if (updateError) throw updateError;

      // Give rewards to both users
      // Referrer reward
      const { data: referrerCoins } = await supabase
        .from("user_coins")
        .select("balance")
        .eq("user_id", referral.referrer_id)
        .single();

      await supabase
        .from("user_coins")
        .update({ balance: (referrerCoins?.balance || 0) + settings.referrer_reward })
        .eq("user_id", referral.referrer_id);

      await supabase
        .from("coin_transactions")
        .insert({
          user_id: referral.referrer_id,
          amount: settings.referrer_reward,
          transaction_type: "referral_reward",
          description: "推薦獎勵",
          referral_id: referralId
        });

      // Referee reward
      const { data: refereeCoins } = await supabase
        .from("user_coins")
        .select("balance")
        .eq("user_id", referral.referee_id)
        .single();

      await supabase
        .from("user_coins")
        .update({ balance: (refereeCoins?.balance || 0) + settings.referee_reward })
        .eq("user_id", referral.referee_id);

      await supabase
        .from("coin_transactions")
        .insert({
          user_id: referral.referee_id,
          amount: settings.referee_reward,
          transaction_type: "referral_reward",
          description: "被推薦獎勵",
          referral_id: referralId
        });

      toast.success("獎勵已發放");
      loadData();
    } catch (error) {
      console.error("Error processing reward:", error);
      toast.error("發放失敗");
    } finally {
      setLoading(false);
    }
  };

  if (loading && referrals.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">推薦系統管理</h1>
          <p className="text-muted-foreground mt-2">管理推薦獎勵和記錄</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>推薦獎勵設置</CardTitle>
            <CardDescription>設置推薦人和被推薦人的獎勵</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>推薦人獎勵（金幣）</Label>
                <Input
                  type="number"
                  value={settings.referrer_reward}
                  onChange={(e) => setSettings({...settings, referrer_reward: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label>被推薦人獎勵（金幣）</Label>
                <Input
                  type="number"
                  value={settings.referee_reward}
                  onChange={(e) => setSettings({...settings, referee_reward: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <Button onClick={handleSaveSettings} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存設置
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>推薦記錄</CardTitle>
            <CardDescription>查看所有推薦記錄</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>推薦人</TableHead>
                  <TableHead>被推薦人</TableHead>
                  <TableHead>推薦碼</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>獎勵</TableHead>
                  <TableHead>時間</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>{referral.referrer_email}</TableCell>
                    <TableCell>{referral.referee_email}</TableCell>
                    <TableCell className="font-mono">{referral.referral_code}</TableCell>
                    <TableCell>
                      <Badge variant={referral.status === "completed" ? "default" : "secondary"}>
                        {referral.status === "completed" ? "已完成" : "待處理"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {referral.reward_given ? "已發放" : "未發放"}
                    </TableCell>
                    <TableCell>{new Date(referral.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {!referral.reward_given && (
                        <Button
                          size="sm"
                          onClick={() => handleProcessReward(referral.id)}
                          disabled={loading}
                        >
                          發放獎勵
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ReferralManagement;
