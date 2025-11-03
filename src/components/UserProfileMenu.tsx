import { User, CreditCard, Users, Languages, LogOut, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/i18n";

interface UserProfileMenuProps {
  user: any;
  profile: any;
  onSignOut: () => void;
}

export const UserProfileMenu = ({ user, profile, onSignOut }: UserProfileMenuProps) => {
  const { language, setLanguage } = useLanguage();
  const t = useTranslation(language);
  
  const handleComingSoon = (feature: string) => {
    toast({
      title: language === '繁體中文' ? "尚未開放" : language === '简体中文' ? "尚未开放" : language === 'English' ? "Coming Soon" : "近日公開",
      description: `${feature}${language === 'English' ? ' feature coming soon' : language === '日本語' ? '機能は近日公開' : '功能即將推出'}`,
    });
  };

  const languages = [
    { code: '繁體中文' as const, label: '繁體中文' },
    { code: '简体中文' as const, label: '简体中文' },
    { code: 'English' as const, label: 'English' },
    { code: '日本語' as const, label: '日本語' },
  ];

  const menuLabels = {
    '繁體中文': {
      personalInfo: '個人資料',
      subscription: '訂閱',
      inviteFriends: '邀請好友',
      language: '語言',
      logout: '登出',
    },
    '简体中文': {
      personalInfo: '个人资料',
      subscription: '订阅',
      inviteFriends: '邀请好友',
      language: '语言',
      logout: '登出',
    },
    'English': {
      personalInfo: 'Personal Info',
      subscription: 'Subscription',
      inviteFriends: 'Invite Friends',
      language: 'Language',
      logout: 'Logout',
    },
    '日本語': {
      personalInfo: '個人情報',
      subscription: 'サブスクリプション',
      inviteFriends: '友達を招待',
      language: '言語',
      logout: 'ログアウト',
    },
  };

  const currentLanguageLabel = language;
  const labels = menuLabels[language];

  const displayName = profile?.display_name || user?.email?.split('@')[0] || '用戶';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
        <span className="text-sm font-medium hidden sm:block">{displayName}</span>
        <Avatar className="h-9 w-9">
          <AvatarImage src="" alt={displayName} />
          <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm border-border">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleComingSoon(labels.personalInfo)} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>{labels.personalInfo}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleComingSoon(labels.subscription)} className="cursor-pointer">
          <CreditCard className="mr-2 h-4 w-4" />
          <span>{labels.subscription}</span>
          <Badge variant="secondary" className="ml-auto text-xs">Pro Trial</Badge>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleComingSoon(labels.inviteFriends)} className="cursor-pointer">
          <Users className="mr-2 h-4 w-4" />
          <span>{labels.inviteFriends}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Languages className="mr-2 h-4 w-4" />
            <span>{labels.language}</span>
            <span className="ml-auto text-xs text-muted-foreground">{currentLanguageLabel}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-background/95 backdrop-blur-sm border-border" sideOffset={8}>
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Language selected:', lang.code);
                  setLanguage(lang.code);
                  toast({
                    title: language === 'English' ? 'Language Changed' : language === '日本語' ? '言語を変更しました' : language === '简体中文' ? '语言已更改' : '語言已更改',
                    description: lang.label,
                  });
                }}
                className="cursor-pointer"
              >
                <Check className={`mr-2 h-4 w-4 ${language === lang.code ? 'opacity-100' : 'opacity-0'}`} />
                <span>{lang.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{labels.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
