-- Drop trigger first, then function, then recreate with 50 points
DROP TRIGGER IF EXISTS on_user_signup_initialize_coins ON auth.users;
DROP FUNCTION IF EXISTS public.initialize_user_coins();

CREATE OR REPLACE FUNCTION public.initialize_user_coins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_coins (user_id, balance)
  VALUES (NEW.id, 50);
  
  INSERT INTO public.coin_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 50, 'signup_bonus', '新用戶註冊獎勵');
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_user_signup_initialize_coins
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_coins();