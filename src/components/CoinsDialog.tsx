import { useState, useEffect } from "react";
import { Coins, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CoinsDialogProps {
  userId: string;
}

interface CheckInDay {
  day: number;
  points: number;
  checked: boolean;
  isToday: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  created_at: string;
}

export const CoinsDialog = ({ userId }: CoinsDialogProps) => {
  const [balance, setBalance] = useState(0);
  const [checkInDays, setCheckInDays] = useState<CheckInDay[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load balance on mount and when userId changes
  useEffect(() => {
    loadBalance();
  }, [userId]);

  // Load full data when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadCoinsData();
    }
  }, [isOpen]);

  const loadBalance = async () => {
    try {
      const { data: coinsData } = await supabase
        .from('user_coins')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (coinsData) {
        setBalance(coinsData.balance);
      }
    } catch (error: any) {
      console.error('Error loading balance:', error);
    }
  };

  const loadCoinsData = async () => {
    try {
      setLoading(true);
      
      // Reload balance
      await loadBalance();

      // Load check-in history
      const { data: checkInData } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false });

      // Calculate consecutive days and check-in status
      const today = new Date().toISOString().split('T')[0];
      const todayCheckIn = checkInData?.find(c => c.checkin_date === today);
      const consecutive = todayCheckIn?.consecutive_days || 0;
      
      setConsecutiveDays(consecutive);
      setCanCheckIn(!todayCheckIn);

      // Build 7-day check-in display
      const days: CheckInDay[] = [];
      for (let i = 1; i <= 7; i++) {
        const isChecked = i <= consecutive;
        days.push({
          day: i,
          points: i === 7 ? 12 : i === 4 ? 3 : 2,
          checked: isChecked,
          isToday: i === consecutive + 1 && canCheckIn
        });
      }
      setCheckInDays(days);

      // Load transactions
      const { data: transactionsData } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      setTransactions(transactionsData || []);
    } catch (error: any) {
      console.error('Error loading coins data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!canCheckIn) return;

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const nextDay = consecutiveDays + 1;
      const points = nextDay === 7 ? 12 : nextDay === 4 ? 3 : 2;

      // First, get current balance
      const { data: currentCoins, error: fetchError } = await supabase
        .from('user_coins')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      const newBalance = currentCoins.balance + points;

      // Insert check-in
      const { error: checkInError } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: userId,
          checkin_date: today,
          points_earned: points,
          consecutive_days: nextDay > 7 ? 1 : nextDay
        });

      if (checkInError) throw checkInError;

      // Update balance with new calculated value
      const { error: coinsError } = await supabase
        .from('user_coins')
        .update({ balance: newBalance })
        .eq('user_id', userId);

      if (coinsError) throw coinsError;

      // Add transaction
      await supabase
        .from('coin_transactions')
        .insert({
          user_id: userId,
          amount: points,
          transaction_type: 'daily_checkin',
          description: `每日登入獎勵 - 第${nextDay}天`
        });

      toast({
        title: "打卡成功！",
        description: `獲得 ${points}P`,
      });

      // Reload data to reflect changes
      await loadCoinsData();
    } catch (error: any) {
      toast({
        title: "打卡失敗",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Coins className="h-5 w-5 text-yellow-500" />
          <span className="font-semibold text-yellow-600">{balance}P</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-yellow-500" />
            積分錢包
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-80px)] pr-4">
          <div className="space-y-6">
            {/* Balance Display */}
            <div className="text-center p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="h-8 w-8 text-yellow-500" />
                <span className="text-4xl font-bold text-yellow-600">{balance}</span>
                <span className="text-2xl font-bold text-yellow-600">P</span>
              </div>
              <p className="text-sm text-muted-foreground">目前可用積分</p>
            </div>

            {/* Daily Check-in */}
            <div>
              <h3 className="font-semibold mb-3">每日登入獎勵</h3>
              <div className="grid grid-cols-7 gap-2 mb-3">
                {checkInDays.map((day) => (
                  <div key={day.day} className="text-center">
                    <div
                      className={`
                        h-12 w-12 rounded-full flex items-center justify-center mb-1 mx-auto
                        ${day.checked ? 'bg-yellow-500 text-white' : 'bg-muted'}
                        ${day.isToday ? 'ring-2 ring-yellow-500 ring-offset-2' : ''}
                      `}
                    >
                      {day.checked ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Coins className="h-5 w-5 opacity-30" />
                      )}
                    </div>
                    <div className="text-xs">第{day.day}天</div>
                    <div className={`text-xs font-semibold ${day.points > 2 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                      +{day.points}P
                    </div>
                  </div>
                ))}
              </div>
              
              {canCheckIn ? (
                <Button onClick={handleCheckIn} className="w-full" disabled={loading}>
                  <Check className="mr-2 h-4 w-4" />
                  完成打卡獎勵
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">明天再回來領取獎勵</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-3 p-3 bg-orange-500/10 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  別錯過 7 天獎勵，每日會自動歸零。
                </p>
              </div>
            </div>

            {/* Transaction History */}
            <div>
              <h3 className="font-semibold mb-3">積分紀錄</h3>
              <div className="border rounded-lg overflow-hidden">
                <ScrollArea className="h-[180px]">
                  {transactions.length > 0 ? (
                    <div className="divide-y divide-border">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="p-3 flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.created_at).toLocaleString('zh-TW')}
                            </p>
                          </div>
                          <span className={`text-sm font-semibold ml-2 ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}P
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <p className="text-sm">暫無積分紀錄</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
