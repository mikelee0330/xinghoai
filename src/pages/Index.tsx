import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentGenerator } from "@/components/ContentGenerator";
import { BrandSettings } from "@/components/BrandSettings";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Zap, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { CoinsDialog } from "@/components/CoinsDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/i18n";

const Index = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useTranslation(language);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: t('logout'),
      description: "期待下次見到您！",
    });
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(280, 80%, 92%), hsl(320, 70%, 94%), hsl(240, 90%, 94%), hsl(200, 85%, 95%))' }}>
        {/* Floating decoration elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Subtle animated particles */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute top-32 left-1/4 w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
          <div className="absolute top-48 right-1/3 w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-32 left-1/2 w-2 h-2 bg-pink-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Navigation */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {t('platformName')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <NotificationBell />
                  <CoinsDialog userId={user.id} />
                  <UserProfileMenu user={user} profile={profile} onSignOut={handleSignOut} />
                </>
              ) : (
                <Button variant="default" onClick={() => navigate("/auth")} className="shadow-lg">
                  {t('login')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-10">
          <div className="text-center mb-16">
            {/* Top Tag */}
            <div className="inline-block mb-8 animate-fade-in">
              <div className="px-6 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/30 shadow-lg">
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {t('aiPlatformTag')}
                </span>
              </div>
            </div>
            
            {/* Main Title */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 animate-fade-in tracking-tight" style={{ animationDelay: '0.1s' }}>
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('heroMainTitle')}
              </span>
            </h1>
            
            {/* Subtitle with glass effect */}
            <div className="max-w-3xl mx-auto mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <p className="text-xl sm:text-2xl text-gray-700 mb-2">
                {t('heroSubtitle')}
              </p>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                30 分鐘 搞定30天內容引流
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center mb-20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                onClick={() => user ? null : navigate("/auth")}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                開始創作
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 bg-white/40 backdrop-blur-md border-white/30 hover:bg-white/60 shadow-xl transition-all hover:scale-105"
              >
                了解更多
              </Button>
            </div>

            {/* Feature Cards with glass morphism */}
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {/* Smart Generation */}
              <div className="group relative bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">{t('smartGeneration')}</h3>
                  <p className="text-gray-600 leading-relaxed">{t('smartGenerationDesc')}</p>
                </div>
              </div>

              {/* Multi-Platform */}
              <div className="group relative bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">{t('multiPlatform')}</h3>
                  <p className="text-gray-600 leading-relaxed">{t('multiPlatformDesc')}</p>
                </div>
              </div>

              {/* Precise Framework */}
              <div className="group relative bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">{t('preciseFramework')}</h3>
                  <p className="text-gray-600 leading-relaxed">{t('preciseFrameworkDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="generator">{t('contentGeneratorTab')}</TabsTrigger>
            <TabsTrigger value="brand">{t('brandSettingsTab')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator">
            <ContentGenerator />
          </TabsContent>
          
          <TabsContent value="brand">
            <BrandSettings />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
