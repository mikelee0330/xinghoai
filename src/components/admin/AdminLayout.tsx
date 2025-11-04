import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  LogOut,
  Sparkles,
  Settings,
  Coins,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, adminRole, loading } = useAdminAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "儀表板" },
    { path: "/admin/members", icon: Users, label: "會員管理" },
    { path: "/admin/content-monitor", icon: FileText, label: "內容監控" },
    { path: "/admin/ai-settings", icon: Settings, label: "AI設置" },
    { path: "/admin/coins", icon: Coins, label: "金幣管理" },
    { path: "/admin/referrals", icon: Users, label: "推薦系統" },
    { path: "/admin/notifications", icon: Bell, label: "通知管理" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card/50 backdrop-blur-sm">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">後台管理</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {adminRole === "super_admin" && "超級管理員"}
            {adminRole === "operations" && "運營"}
            {adminRole === "customer_service" && "客服"}
          </p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">登入帳號</p>
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            登出
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
