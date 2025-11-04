-- Create role enums
CREATE TYPE public.app_role AS ENUM ('super_admin', 'operations', 'customer_service', 'agent', 'user');
CREATE TYPE public.agent_status AS ENUM ('active', 'suspended', 'inactive');
CREATE TYPE public.quota_transaction_type AS ENUM ('purchase', 'allocation', 'refund', 'adjustment');
CREATE TYPE public.referral_status AS ENUM ('pending', 'completed', 'expired');

-- Create user_roles table for permission management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Create function to check if user is admin (any admin role)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('super_admin', 'operations', 'customer_service')
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Create agents table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  agent_code TEXT NOT NULL UNIQUE,
  agent_name TEXT NOT NULL,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  quota_balance INTEGER NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  status public.agent_status NOT NULL DEFAULT 'active',
  parent_agent_id UUID REFERENCES public.agents(id),
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- RLS policies for agents
CREATE POLICY "Admins can view all agents"
ON public.agents
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Agents can view their own info"
ON public.agents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage agents"
ON public.agents
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create agent_quota_transactions table
CREATE TABLE public.agent_quota_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type public.quota_transaction_type NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  description TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_quota_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_quota_transactions
CREATE POLICY "Admins can view all quota transactions"
ON public.agent_quota_transactions
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Agents can view their transactions"
ON public.agent_quota_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agents
    WHERE agents.id = agent_quota_transactions.agent_id
    AND agents.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can create quota transactions"
ON public.agent_quota_transactions
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Create referral_settings table
CREATE TABLE public.referral_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_reward INTEGER NOT NULL DEFAULT 50,
  referee_reward INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view referral settings"
ON public.referral_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage referral settings"
ON public.referral_settings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Insert default referral settings
INSERT INTO public.referral_settings (referrer_reward, referee_reward, is_active)
VALUES (50, 50, true);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status public.referral_status NOT NULL DEFAULT 'pending',
  reward_given BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referee_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals"
ON public.referrals
FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can create referrals"
ON public.referrals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referee_id);

CREATE POLICY "Admins can view all referrals"
ON public.referrals
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update referrals"
ON public.referrals
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Extend coin_transactions table
ALTER TABLE public.coin_transactions
ADD COLUMN agent_id UUID REFERENCES public.agents(id),
ADD COLUMN referral_id UUID REFERENCES public.referrals(id),
ADD COLUMN source_type TEXT,
ADD COLUMN source_description TEXT;

-- Create trigger for agents updated_at
CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for referral_settings updated_at
CREATE TRIGGER update_referral_settings_updated_at
BEFORE UPDATE ON public.referral_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_agent_code ON public.agents(agent_code);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agent_quota_transactions_agent_id ON public.agent_quota_transactions(agent_id);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON public.referrals(referee_id);
CREATE INDEX idx_coin_transactions_agent_id ON public.coin_transactions(agent_id);
CREATE INDEX idx_coin_transactions_referral_id ON public.coin_transactions(referral_id);