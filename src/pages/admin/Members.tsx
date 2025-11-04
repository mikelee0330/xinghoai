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
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showHistory, setShowHistory] = useState(false);

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

  const handleViewHistory = (member: Member) => {
    setSelectedMember(member);
    setShowHistory(true);
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
                  <TableHead>郵箱</TableHead>
                  <TableHead>暱稱</TableHead>
                  <TableHead>金幣餘額</TableHead>
                  <TableHead>註冊時間</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.email}</TableCell>
                    <TableCell>{member.display_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-yellow-600" />
                        <span>{member.balance}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(member.created_at), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewHistory(member)}
                      >
                        <History className="h-4 w-4 mr-1" />
                        歷史記錄
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              會員詳情 - {selectedMember?.display_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">郵箱</p>
                <p className="font-medium">{selectedMember?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">金幣餘額</p>
                <p className="font-medium flex items-center gap-1">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  {selectedMember?.balance}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">生成歷史</p>
              <p className="text-sm">功能開發中...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
