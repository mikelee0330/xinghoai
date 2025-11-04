import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Search, Eye } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContentRecord {
  id: string;
  user_email: string;
  platform: string;
  content_type: string;
  keywords: string;
  generated_content: string;
  created_at: string;
}

export default function AdminContentMonitor() {
  const [records, setRecords] = useState<ContentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [selectedContent, setSelectedContent] = useState<ContentRecord | null>(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      // First get generation history
      const { data: historyData, error: historyError } = await supabase
        .from("generation_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (historyError) throw historyError;

      // Get unique user IDs
      const userIds = [...new Set(historyData?.map(r => r.user_id) || [])];

      // Get user profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, email")
        .in("user_id", userIds);

      const profilesMap = new Map(
        profilesData?.map((p) => [p.user_id, p.email]) || []
      );

      const formattedRecords = historyData?.map((record) => ({
        id: record.id,
        user_email: profilesMap.get(record.user_id) || "未知",
        platform: record.platform,
        content_type: record.content_type,
        keywords: record.keywords,
        generated_content: record.generated_content,
        created_at: record.created_at,
      })) || [];

      setRecords(formattedRecords);
    } catch (error) {
      console.error("Error loading records:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.keywords.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlatform =
      platformFilter === "all" || record.platform === platformFilter;

    return matchesSearch && matchesPlatform;
  });

  const handleViewContent = (record: ContentRecord) => {
    setSelectedContent(record);
    setShowContent(true);
  };

  const getPlatformBadge = (platform: string) => {
    const colors: Record<string, string> = {
      Facebook: "bg-blue-500",
      Instagram: "bg-pink-500",
      "小紅書": "bg-red-500",
      Threads: "bg-gray-800",
      LinkedIn: "bg-blue-700",
    };

    return (
      <Badge className={`${colors[platform] || "bg-gray-500"} text-white`}>
        {platform}
      </Badge>
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
          <h1 className="text-3xl font-bold mb-2">內容生成監控</h1>
          <p className="text-muted-foreground">查看所有用戶生成的內容記錄</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>生成記錄</CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋用戶或關鍵字"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="選擇平台" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部平台</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="小紅書">小紅書</SelectItem>
                  <SelectItem value="Threads">Threads</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary">
                總計: {filteredRecords.length} 條記錄
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用戶</TableHead>
                  <TableHead>平台</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>關鍵字</TableHead>
                  <TableHead>生成時間</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.user_email}</TableCell>
                    <TableCell>{getPlatformBadge(record.platform)}</TableCell>
                    <TableCell>{record.content_type}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.keywords}</TableCell>
                    <TableCell>
                      {format(new Date(record.created_at), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewContent(record)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showContent} onOpenChange={setShowContent}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>生成內容詳情</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">用戶</p>
                <p className="font-medium">{selectedContent?.user_email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">平台</p>
                <div className="mt-1">
                  {selectedContent && getPlatformBadge(selectedContent.platform)}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">類型</p>
                <p className="font-medium">{selectedContent?.content_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">生成時間</p>
                <p className="font-medium">
                  {selectedContent && format(new Date(selectedContent.created_at), "yyyy-MM-dd HH:mm:ss")}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">關鍵字</p>
              <p className="text-sm bg-secondary/50 p-3 rounded-lg">
                {selectedContent?.keywords}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">生成內容</p>
              <ScrollArea className="h-64 border rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap">
                  {selectedContent?.generated_content}
                </pre>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
