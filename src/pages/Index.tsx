import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentGenerator } from "@/components/ContentGenerator";
import { BrandSettings } from "@/components/BrandSettings";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Zap, Target, Instagram, Facebook, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { CoinsDialog } from "@/components/CoinsDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/i18n";
import mascotCat from "@/assets/mascot-cat-new.png";
import threadsLogo from "@/assets/threads-logo.png";
import xiaohongshuLogo from "@/assets/xiaohongshu-logo.png";

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
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20">
        {/* Animated AI Robots Background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-10 left-10 w-16 h-16 text-primary/40 animate-[spin_20s_linear_infinite]">
            <Sparkles className="w-full h-full" />
          </div>
          <div className="absolute top-32 right-20 w-12 h-12 text-secondary/40 animate-[spin_15s_linear_infinite_reverse]">
            <Zap className="w-full h-full" />
          </div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 text-primary/30 animate-[bounce_3s_ease-in-out_infinite]">
            <Target className="w-full h-full" />
          </div>
          <div className="absolute top-1/2 right-1/3 w-14 h-14 text-secondary/30 animate-[spin_25s_linear_infinite]">
            <Sparkles className="w-full h-full" />
          </div>
        </div>
        
        {/* Navigation */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                <Button variant="default" onClick={() => navigate("/auth")}>
                  {t('login')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-10">
          <div className="text-center mb-12">
            {/* Top Tag */}
            <div className="inline-block mb-6 animate-fade-in">
              <div className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-primary/20">
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {t('aiPlatformTag')}
                </span>
              </div>
            </div>
            
            {/* Main Title with Icon */}
            <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-6xl">⏱️</div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                  {t('heroMainTitle')}
                </h1>
              </div>
            </div>

            {/* Feature Tags */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform">
                {t('featureTag1')}
              </div>
              <div className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform">
                {t('featureTag2')}
              </div>
              <div className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform">
                {t('featureTag3')}
              </div>
            </div>
            
            {/* Subtitle */}
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-in leading-relaxed" style={{ animationDelay: '0.3s' }}>
              {t('heroSubtitle')}
            </p>

            {/* Social Platform Title */}
            <h3 className="text-2xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {t('keyFeatureTitle')}
            </h3>

            {/* Social Platform Icons */}
            <div className="flex justify-center items-center gap-6 mb-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                <Facebook className="w-10 h-10 text-white" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                <Instagram className="w-10 h-10 text-white" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg p-3">
                <img src={threadsLogo} alt="Threads" className="w-full h-full object-contain" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg p-3">
                <img src={xiaohongshuLogo} alt="小紅書" className="w-full h-full object-contain" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                <X className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Mascot positioned at bottom right */}
          <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none z-50 animate-bounce" style={{ animationDuration: '3s' }}>
            <img 
              src={mascotCat} 
              alt={t('mascotName')} 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
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
