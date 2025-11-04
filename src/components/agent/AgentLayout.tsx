import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Coins, 
  LogOut,
  Menu
} from "lucide-react";
import { toast } from "sonner";

interface AgentLayoutProps {
  children: ReactNode;
}

const AgentLayout = ({ children }: AgentLayoutProps) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("已登出");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("登出失敗");
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: "控制台", path: "/agent" },
    { icon: Users, label: "推薦用戶", path: "/agent/referrals" },
    { icon: Coins, label: "配額管理", path: "/agent/quota" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-card border-r flex flex-col overflow-hidden`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold">代理商面板</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            登出
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AgentLayout;
