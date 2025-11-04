import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, Coins, History } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Member {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  balance: number;
  login_method: string;
  status: string;
  avatar_url: string | null;
  last_login_at: string | null;
}

interface TransactionHistory {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

interface GenerationHistory {
  id: string;
  content_type: string;
  platform: string;
  created_at: string;
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
  const [generationHistory, setGenerationHistory] = useState<GenerationHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get coin balances for all users
      const { data: coinsData } = await supabase
        .from("user_coins")
        .select("user_id, balance");

      const coinsMap = new Map(
        coinsData?.map((c) => [c.user_id, c.balance]) || []
      );

      const membersWithCoins = profilesData?.map((profile) => ({
        id: profile.user_id,
        email: profile.email || "",
        display_name: profile.display_name || "未設定",
        created_at: profile.created_at,
        balance: coinsMap.get(profile.user_id) || 0,
        login_method: profile.login_method || "未知",
        status: profile.status || "active",
        avatar_url: profile.avatar_url,
        last_login_at: profile.last_login_at,
      })) || [];

      setMembers(membersWithCoins);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewHistory = async (member: Member) => {
    setSelectedMember(member);
    setShowHistory(true);
    setHistoryLoading(true);

    try {
      // Fetch transaction history
      const { data: transactions } = await supabase
        .from("coin_transactions")
        .select("*")
        .eq("user_id", member.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setTransactionHistory(transactions || []);

      // Fetch generation history
      const { data: generations } = await supabase
        .from("generation_history")
        .select("*")
        .eq("user_id", member.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setGenerationHistory(generations || []);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleToggleStatus = async (member: Member) => {
    const newStatus = member.status === "active" ? "disabled" : "active";
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("user_id", member.id);

      if (error) throw error;

      // Reload members
      await loadMembers();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const getLoginMethodBadge = (method: string) => {
    switch (method) {
      case "google":
        return <Badge variant="secondary">Google</Badge>;
      case "email":
        return <Badge variant="outline">Email</Badge>;
      default:
        return <Badge>未知</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge variant="default" className="bg-green-600">啟用</Badge>
    ) : (
      <Badge variant="destructive">停用</Badge>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">會員管理</h1>
          <p className="text-muted-foreground">管理平台所有會員資料</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>會員列表</CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋會員（郵箱或暱稱）"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary">
                總計: {filteredMembers.length} 位會員
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>會員</TableHead>
                  <TableHead>登入方式</TableHead>
                  <TableHead>金幣餘額</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>註冊時間</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {member.avatar_url ? (
                          <img 
                            src={member.avatar_url} 
                            alt={member.display_name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {member.display_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{member.display_name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getLoginMethodBadge(member.login_method)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-yellow-600" />
                        <span>{member.balance}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell>
                      {format(new Date(member.created_at), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewHistory(member)}
                        >
                          <History className="h-4 w-4 mr-1" />
                          查看詳情
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(member)}
                        >
                          {member.status === "active" ? "停用" : "啟用"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              會員詳情 - {selectedMember?.display_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">基本信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">郵箱</p>
                    <p className="font-medium">{selectedMember?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">暱稱</p>
                    <p className="font-medium">{selectedMember?.display_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">登入方式</p>
                    <div className="mt-1">
                      {selectedMember && getLoginMethodBadge(selectedMember.login_method)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">狀態</p>
                    <div className="mt-1">
                      {selectedMember && getStatusBadge(selectedMember.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">金幣餘額</p>
                    <p className="font-medium flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-600" />
                      {selectedMember?.balance}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">註冊時間</p>
                    <p className="font-medium">
                      {selectedMember && format(new Date(selectedMember.created_at), "yyyy-MM-dd HH:mm")}
                    </p>
                  </div>
                  {selectedMember?.last_login_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">最後登入</p>
                      <p className="font-medium">
                        {format(new Date(selectedMember.last_login_at), "yyyy-MM-dd HH:mm")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 金幣交易記錄 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">金幣交易記錄</CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : transactionHistory.length > 0 ? (
                  <div className="space-y-2">
                    {transactionHistory.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.created_at), "yyyy-MM-dd HH:mm")}
                          </p>
                        </div>
                        <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    暫無交易記錄
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 生成記錄 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">生成記錄</CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : generationHistory.length > 0 ? (
                  <div className="space-y-2">
                    {generationHistory.map((generation) => (
                      <div
                        key={generation.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {generation.content_type} - {generation.platform}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(generation.created_at), "yyyy-MM-dd HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    暫無生成記錄
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
