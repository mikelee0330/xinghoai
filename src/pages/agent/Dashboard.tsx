import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Coins, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import AgentLayout from "@/components/agent/AgentLayout";

interface AgentInfo {
  id: string;
  agent_name: string;
  agent_code: string;
  quota_balance: number;
  commission_rate: number;
  level: number;
  status: string;
}

interface DashboardStats {
  totalUsers: number;
  totalQuota: number;
  totalCommission: number;
  monthlyRevenue: number;
}

const AgentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalQuota: 0,
    totalCommission: 0,
    monthlyRevenue: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAgentStatus();
  }, []);

  const checkAgentStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: agent, error } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !agent) {
        toast.error("您不是代理商");
        navigate("/");
        return;
      }

      setAgentInfo(agent);
      await loadStats(agent.id);
      setLoading(false);
    } catch (error) {
      console.error("Error checking agent status:", error);
      navigate("/");
    }
  };

  const loadStats = async (agentId: string) => {
    try {
      // Load referral count
      const { count: userCount } = await supabase
        .from("referrals")
        .select("*", { count: 'exact', head: true })
        .eq("referrer_id", agentId);

      // Load quota transactions
      const { data: transactions } = await supabase
        .from("agent_quota_transactions")
        .select("amount, transaction_type")
        .eq("agent_id", agentId);

      let totalQuota = 0;
      let totalCommission = 0;

      transactions?.forEach(t => {
        totalQuota += t.amount;
        // Commission tracking would be separate
      });

      setStats({
        totalUsers: userCount || 0,
        totalQuota,
        totalCommission,
        monthlyRevenue: totalCommission // Simplified
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AgentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">代理商控制台</h1>
          <p className="text-muted-foreground mt-2">
            歡迎回來，{agentInfo?.agent_name}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">配額餘額</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentInfo?.quota_balance}</div>
              <p className="text-xs text-muted-foreground">可分配金幣</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">推薦用戶</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">總推薦人數</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總佣金</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCommission}</div>
              <p className="text-xs text-muted-foreground">累計收益</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">佣金比例</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentInfo?.commission_rate}%</div>
              <p className="text-xs text-muted-foreground">當前比例</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>代理商資訊</CardTitle>
            <CardDescription>您的代理商帳戶詳情</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">代理商代碼</p>
                <p className="text-2xl font-bold text-primary">{agentInfo?.agent_code}</p>
              </div>
              <div>
                <p className="text-sm font-medium">代理商等級</p>
                <p className="text-2xl font-bold">Level {agentInfo?.level}</p>
              </div>
            </div>
            <Button 
              onClick={() => navigator.clipboard.writeText(agentInfo?.agent_code || '')}
              variant="outline"
            >
              複製推薦代碼
            </Button>
          </CardContent>
        </Card>
      </div>
    </AgentLayout>
  );
};

export default AgentDashboard;
