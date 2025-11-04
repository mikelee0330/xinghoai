import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMembers from "./pages/admin/Members";
import AdminContentMonitor from "./pages/admin/ContentMonitor";
import AISettings from "./pages/admin/AISettings";
import CoinsManagement from "./pages/admin/CoinsManagement";
import ReferralManagement from "./pages/admin/ReferralManagement";
import NotificationManagement from "./pages/admin/NotificationManagement";
import AgentDashboard from "./pages/agent/Dashboard";

const App = () => (
  <>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/members" element={<AdminMembers />} />
      <Route path="/admin/content-monitor" element={<AdminContentMonitor />} />
      <Route path="/admin/ai-settings" element={<AISettings />} />
      <Route path="/admin/coins" element={<CoinsManagement />} />
      <Route path="/admin/referrals" element={<ReferralManagement />} />
      <Route path="/admin/notifications" element={<NotificationManagement />} />
      <Route path="/agent" element={<AgentDashboard />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

export default App;
