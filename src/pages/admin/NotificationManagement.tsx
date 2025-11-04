import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
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

interface Notification {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const NotificationManagement = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_active: true
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("加載通知失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.error("請填寫完整信息");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Update existing notification
        const { error } = await supabase
          .from("notifications")
          .update({
            title: formData.title,
            content: formData.content,
            is_active: formData.is_active
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("通知已更新");
      } else {
        // Create new notification
        const { error } = await supabase
          .from("notifications")
          .insert({
            title: formData.title,
            content: formData.content,
            is_active: formData.is_active
          });

        if (error) throw error;
        toast.success("通知已創建");
      }

      setIsOpen(false);
      setFormData({ title: "", content: "", is_active: true });
      setEditingId(null);
      loadNotifications();
    } catch (error) {
      console.error("Error saving notification:", error);
      toast.error("操作失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此通知嗎？")) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("通知已刪除");
      loadNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("刪除失敗");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;

      toast.success(isActive ? "通知已啟用" : "通知已停用");
      loadNotifications();
    } catch (error) {
      console.error("Error toggling notification:", error);
      toast.error("操作失敗");
    }
  };

  const handleEdit = (notification: Notification) => {
    setEditingId(notification.id);
    setFormData({
      title: notification.title,
      content: notification.content,
      is_active: notification.is_active
    });
    setIsOpen(true);
  };

  if (loading && notifications.length === 0) {
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
            <h1 className="text-3xl font-bold">通知管理</h1>
            <p className="text-muted-foreground mt-2">管理系統通知</p>
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingId(null);
              setFormData({ title: "", content: "", is_active: true });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新增通知
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "編輯通知" : "新增通知"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "修改通知內容" : "創建新的系統通知"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>標題</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="輸入通知標題"
                  />
                </div>
                <div className="space-y-2">
                  <Label>內容</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="輸入通知內容"
                    rows={4}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>啟用通知</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "更新" : "創建"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>通知列表</CardTitle>
            <CardDescription>管理所有系統通知</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>標題</TableHead>
                  <TableHead>內容</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>創建時間</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell className="max-w-md truncate">{notification.content}</TableCell>
                    <TableCell>
                      <Switch
                        checked={notification.is_active}
                        onCheckedChange={(checked) => handleToggleActive(notification.id, checked)}
                      />
                    </TableCell>
                    <TableCell>{new Date(notification.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(notification)}
                        >
                          編輯
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

export default NotificationManagement;
