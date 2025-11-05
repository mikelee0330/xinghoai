-- ===================================
-- 完整數據庫遷移 SQL 腳本
-- 從項目: rutmpghjoguwurbhgdrc
-- 到項目: ligilgvqyixhfykdzfnl
-- ===================================

-- ===================================
-- 1. 創建枚舉類型
-- ===================================

CREATE TYPE public.app_role AS ENUM ('super_admin', 'operations', 'customer_service', 'agent', 'user');
CREATE TYPE public.agent_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE public.quota_transaction_type AS ENUM ('purchase', 'grant', 'consume', 'refund', 'transfer');
CREATE TYPE public.referral_status AS ENUM ('pending', 'completed', 'expired');

-- ===================================
-- 2. 創建表結構
-- ===================================

-- profiles 表
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  email text,
  display_name text,
  avatar_url text,
  preferred_language text DEFAULT '繁體中文',
  login_method text,
  status text DEFAULT 'active',
  last_login_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- user_roles 表
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- user_coins 表
CREATE TABLE public.user_coins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 100,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- coin_transactions 表
CREATE TABLE public.coin_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  transaction_type text NOT NULL,
  description text NOT NULL,
  source_type text,
  source_description text,
  referral_id uuid,
  agent_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- daily_checkins 表
CREATE TABLE public.daily_checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  checkin_date date NOT NULL DEFAULT CURRENT_DATE,
  points_earned integer NOT NULL DEFAULT 10,
  consecutive_days integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

-- brand_settings 表
CREATE TABLE public.brand_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  brand_name text NOT NULL,
  brand_tone text,
  target_audience text,
  language text DEFAULT '繁體中文',
  additional_notes text,
  brand_files text[],
  ai_analysis text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- generation_history 表
CREATE TABLE public.generation_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  brand_id uuid,
  platform text NOT NULL,
  content_type text NOT NULL,
  tone text NOT NULL,
  keywords text NOT NULL,
  content_direction text NOT NULL,
  framework text,
  generated_content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- notifications 表
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- referral_settings 表
CREATE TABLE public.referral_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_reward integer NOT NULL DEFAULT 50,
  referee_reward integer NOT NULL DEFAULT 50,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- referrals 表
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL,
  referee_id uuid NOT NULL,
  referral_code text NOT NULL,
  status public.referral_status NOT NULL DEFAULT 'pending',
  reward_given boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- agents 表
CREATE TABLE public.agents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  agent_code text NOT NULL UNIQUE,
  agent_name text NOT NULL,
  contact_person text,
  contact_email text,
  contact_phone text,
  level integer NOT NULL DEFAULT 1,
  parent_agent_id uuid,
  commission_rate numeric NOT NULL DEFAULT 0.00,
  quota_balance integer NOT NULL DEFAULT 0,
  status public.agent_status NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- agent_quota_transactions 表
CREATE TABLE public.agent_quota_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL,
  amount integer NOT NULL,
  transaction_type public.quota_transaction_type NOT NULL,
  description text NOT NULL,
  target_user_id uuid,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ===================================
-- 3. 創建函數
-- ===================================

-- 更新 updated_at 欄位的函數
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 檢查用戶角色的函數
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- 檢查是否為管理員的函數
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('super_admin', 'operations', 'customer_service')
  )
$$;

-- 處理新用戶註冊的函數
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

-- 初始化用戶金幣的函數
CREATE OR REPLACE FUNCTION public.initialize_user_coins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_coins (user_id, balance)
  VALUES (NEW.id, 50);
  
  INSERT INTO public.coin_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 50, 'signup_bonus', '新用戶註冊獎勵');
  
  RETURN NEW;
END;
$$;

-- ===================================
-- 4. 創建觸發器
-- ===================================

-- profiles 表的 updated_at 觸發器
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- user_coins 表的 updated_at 觸發器
CREATE TRIGGER update_user_coins_updated_at
  BEFORE UPDATE ON public.user_coins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- brand_settings 表的 updated_at 觸發器
CREATE TRIGGER update_brand_settings_updated_at
  BEFORE UPDATE ON public.brand_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- notifications 表的 updated_at 觸發器
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- referral_settings 表的 updated_at 觸發器
CREATE TRIGGER update_referral_settings_updated_at
  BEFORE UPDATE ON public.referral_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- agents 表的 updated_at 觸發器
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- auth.users 表的新用戶觸發器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- profiles 表的初始化金幣觸發器
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_coins();

-- ===================================
-- 5. 啟用 RLS
-- ===================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_quota_transactions ENABLE ROW LEVEL SECURITY;

-- ===================================
-- 6. 創建 RLS 政策
-- ===================================

-- profiles 表的 RLS 政策
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- user_roles 表的 RLS 政策
CREATE POLICY "Super admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- user_coins 表的 RLS 政策
CREATE POLICY "Users can view their own coins" ON public.user_coins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coins" ON public.user_coins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coins" ON public.user_coins
  FOR UPDATE USING (auth.uid() = user_id);

-- coin_transactions 表的 RLS 政策
CREATE POLICY "Users can view their own transactions" ON public.coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.coin_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- daily_checkins 表的 RLS 政策
CREATE POLICY "Users can view their own checkins" ON public.daily_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checkins" ON public.daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- brand_settings 表的 RLS 政策
CREATE POLICY "Users can view their own brand settings" ON public.brand_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own brand settings" ON public.brand_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand settings" ON public.brand_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand settings" ON public.brand_settings
  FOR DELETE USING (auth.uid() = user_id);

-- generation_history 表的 RLS 政策
CREATE POLICY "Users can view their own history" ON public.generation_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own history" ON public.generation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history" ON public.generation_history
  FOR DELETE USING (auth.uid() = user_id);

-- notifications 表的 RLS 政策
CREATE POLICY "Anyone can view active notifications" ON public.notifications
  FOR SELECT USING (is_active = true);

-- referral_settings 表的 RLS 政策
CREATE POLICY "Anyone can view referral settings" ON public.referral_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage referral settings" ON public.referral_settings
  FOR ALL USING (public.is_admin(auth.uid()));

-- referrals 表的 RLS 政策
CREATE POLICY "Users can view their referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referee_id);

CREATE POLICY "Admins can view all referrals" ON public.referrals
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update referrals" ON public.referrals
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- agents 表的 RLS 政策
CREATE POLICY "Agents can view their own info" ON public.agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all agents" ON public.agents
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage agents" ON public.agents
  FOR ALL USING (public.is_admin(auth.uid()));

-- agent_quota_transactions 表的 RLS 政策
CREATE POLICY "Agents can view their transactions" ON public.agent_quota_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_quota_transactions.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all quota transactions" ON public.agent_quota_transactions
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create quota transactions" ON public.agent_quota_transactions
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- ===================================
-- 7. 創建存儲桶
-- ===================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-files', 'brand-files', false);

-- brand-files 存儲桶的 RLS 政策
CREATE POLICY "Users can view their own brand files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'brand-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own brand files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'brand-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own brand files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'brand-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own brand files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'brand-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ===================================
-- 注意事項
-- ===================================
-- 1. 此腳本不包含實際的數據遷移（INSERT 語句）
--    需要使用下面的命令從舊項目導出數據
-- 2. 執行此腳本前，請確保新項目數據庫是空的
-- 3. 某些觸發器（如 on_auth_user_created）需要在 auth schema 上執行
--    可能需要通過 Supabase Dashboard 手動設置
