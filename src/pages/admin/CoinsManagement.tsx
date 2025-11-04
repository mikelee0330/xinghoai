import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserCoins {
  user_id: string;
  balance: number;
  email?: string;
}

const CoinsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserCoins[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState<"add" | "deduct">("add");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: coinsData, error: coinsError } = await supabase
        .from("user_coins")
        .select("user_id, balance");

      if (coinsError) throw coinsError;

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, email");

      const usersWithEmails = coinsData?.map(coin => ({
        ...coin,
        email: profilesData?.find(p => p.user_id === coin.user_id)?.email
      })) || [];

      setUsers(usersWithEmails);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("加載用戶失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async () => {
    if (!selectedUser || amount <= 0) {
      toast.error("請填寫完整信息");
      return;
    }

    try {
      setLoading(true);
      const finalAmount = actionType === "add" ? amount : -amount;

      // Update balance
      const currentUser = users.find(u => u.user_id === selectedUser);
      const newBalance = (currentUser?.balance || 0) + finalAmount;

      if (newBalance < 0) {
        toast.error("金幣餘額不足");
        return;
      }

      const { error: updateError } = await supabase
        .from("user_coins")
        .update({ balance: newBalance })
        .eq("user_id", selectedUser);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from("coin_transactions")
        .insert({
          user_id: selectedUser,
          amount: finalAmount,
          transaction_type: actionType === "add" ? "admin_grant" : "admin_deduct",
          description: description || (actionType === "add" ? "管理員發放" : "管理員扣除")
        });

      if (transactionError) throw transactionError;

      toast.success("操作成功");
      setIsOpen(false);
      setAmount(0);
      setDescription("");
      loadUsers();
    } catch (error) {
      console.error("Error processing transaction:", error);
      toast.error("操作失敗");
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">金幣管理</h1>
            <p className="text-muted-foreground mt-2">管理用戶金幣餘額</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>用戶金幣列表</CardTitle>
            <CardDescription>查看所有用戶的金幣餘額</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用戶郵箱</TableHead>
                  <TableHead>金幣餘額</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.email || user.user_id}</TableCell>
                    <TableCell className="font-bold">{user.balance}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={isOpen && selectedUser === user.user_id} onOpenChange={(open) => {
                          setIsOpen(open);
                          if (open) setSelectedUser(user.user_id);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setActionType("add");
                                setSelectedUser(user.user_id);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              發放
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{actionType === "add" ? "發放金幣" : "扣除金幣"}</DialogTitle>
                              <DialogDescription>
                                為用戶 {user.email} {actionType === "add" ? "發放" : "扣除"}金幣
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>金幣數量</Label>
                                <Input
                                  type="number"
                                  value={amount}
                                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                                  placeholder="輸入金幣數量"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>說明</Label>
                                <Input
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  placeholder="輸入說明（可選）"
                                />
                              </div>
                              <Button onClick={handleTransaction} className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                確認
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActionType("deduct");
                            setSelectedUser(user.user_id);
                            setIsOpen(true);
                          }}
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          扣除
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
    </AdminLayout>
  );
};

export default CoinsManagement;
