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

interface UserProfileMenuProps {
  user: any;
  profile: any;
  onSignOut: () => void;
}

export const UserProfileMenu = ({ user, profile, onSignOut }: UserProfileMenuProps) => {
  const { language, setLanguage } = useLanguage();
  
  const handleComingSoon = (feature: string) => {
    toast({
      title: "尚未開放",
      description: `${feature}功能即將推出`,
    });
  };

  const languages = [
    { code: 'zh-TW', label: '繁體中文' },
    { code: 'zh-CN', label: '简体中文' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
  ];

  const currentLanguageLabel = languages.find(lang => lang.code === language)?.label || '繁體中文';

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
        
        <DropdownMenuItem onClick={() => handleComingSoon('個人資料')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>個人資料</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleComingSoon('訂閱')} className="cursor-pointer">
          <CreditCard className="mr-2 h-4 w-4" />
          <span>訂閱</span>
          <Badge variant="secondary" className="ml-auto text-xs">Pro Trial</Badge>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleComingSoon('邀請好友')} className="cursor-pointer">
          <Users className="mr-2 h-4 w-4" />
          <span>邀請好友</span>
        </DropdownMenuItem>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Languages className="mr-2 h-4 w-4" />
            <span>語言</span>
            <span className="ml-auto text-xs text-muted-foreground">{currentLanguageLabel}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-background/95 backdrop-blur-sm border-border">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code as any)}
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
          <span>登出</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
