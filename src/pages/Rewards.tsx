import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Trophy, Star, Coins, ShoppingBag, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  id: string;
  points: number;
  reason: string | null;
  created_at: string;
}

interface Redemption {
  id: string;
  points_used: number;
  reward_type: string;
  redeemed_at: string;
}

const Rewards = () => {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const fetchRewardsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // Fetch rewards
      const { data: rewardsData } = await supabase
        .from("rewards")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      // Fetch redemptions
      const { data: redemptionsData } = await supabase
        .from("reward_redemptions")
        .select("*")
        .eq("user_id", profile.id)
        .order("redeemed_at", { ascending: false });

      setRewards(rewardsData || []);
      setRedemptions(redemptionsData || []);

      // Calculate total points
      const earned = (rewardsData || []).reduce((sum, reward) => sum + reward.points, 0);
      const spent = (redemptionsData || []).reduce((sum, redemption) => sum + redemption.points_used, 0);
      setTotalPoints(earned - spent);
    } catch (error) {
      console.error("Error fetching rewards data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedemption = async (rewardType: string, pointsRequired: number) => {
    if (totalPoints < pointsRequired) {
      toast({
        title: "Not enough points",
        description: `You need ${pointsRequired} points, but you only have ${totalPoints}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // Create redemption record
      await supabase
        .from("reward_redemptions")
        .insert({
          user_id: profile.id,
          points_used: pointsRequired,
          reward_type: rewardType,
        });

      toast({
        title: "Reward redeemed! 🎉",
        description: `You've successfully redeemed your ${rewardType.replace('_', ' ')}.`,
      });

      fetchRewardsData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getReasonIcon = (reason: string | null) => {
    switch (reason) {
      case "first_listing": return <Trophy className="w-4 h-4" />;
      case "completed_trade": return <Star className="w-4 h-4" />;
      case "review": return <Gift className="w-4 h-4" />;
      default: return <Coins className="w-4 h-4" />;
    }
  };

  const getReasonText = (reason: string | null) => {
    switch (reason) {
      case "first_listing": return "First Listing Created";
      case "completed_trade": return "Trade Completed";
      case "review": return "Review Submitted";
      case "referral": return "Referral Bonus";
      default: return reason || "Points Earned";
    }
  };

  const rewardsCatalog = [
    {
      type: "ad_discount",
      title: "Ad Discount",
      description: "50% off on premium membership ads",
      points: 100,
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      type: "free_listing",
      title: "Free Premium Listing",
      description: "One free premium listing boost",
      points: 150,
      icon: <Trophy className="w-6 h-6" />,
    },
    {
      type: "bonus_points",
      title: "Bonus Points",
      description: "Extra 50 points for future use",
      points: 200,
      icon: <Gift className="w-6 h-6" />,
    },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Your Rewards 🏆</h1>
          <p className="text-muted-foreground text-lg">
            Earn points by trading and unlock amazing rewards!
          </p>
        </motion.div>

        {/* Points Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-8 text-center">
              <Coins className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">{totalPoints}</h2>
              <p className="text-purple-100">Available Points</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* How to Earn Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                How to Earn Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <h4 className="font-semibold">First Listing</h4>
                  <p className="text-2xl font-bold text-green-600">5 pts</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <ShoppingBag className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <h4 className="font-semibold">Completed Trade</h4>
                  <p className="text-2xl font-bold text-blue-600">5 pts</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Star className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                  <h4 className="font-semibold">Review Submitted</h4>
                  <p className="text-2xl font-bold text-purple-600">2 pts</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Gift className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                  <h4 className="font-semibold">Referral</h4>
                  <p className="text-2xl font-bold text-orange-600">2 pts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Points History */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Points History</CardTitle>
                <CardDescription>Your recent points activity</CardDescription>
              </CardHeader>
              <CardContent>
                {rewards.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No points earned yet. Start trading to earn your first points!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {rewards.map((reward) => (
                      <div key={reward.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          {getReasonIcon(reward.reason)}
                          <div>
                            <p className="font-medium">{getReasonText(reward.reason)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(reward.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          +{reward.points}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Redemptions History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Redemptions</CardTitle>
                <CardDescription>Rewards you've redeemed</CardDescription>
              </CardHeader>
              <CardContent>
                {redemptions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No redemptions yet. Redeem your points for amazing rewards!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {redemptions.map((redemption) => (
                      <div key={redemption.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium capitalize">
                            {redemption.reward_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(redemption.redeemed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="destructive">
                          -{redemption.points_used}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Rewards Catalog */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Rewards Catalog</CardTitle>
              <CardDescription>Redeem your points for these amazing rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rewardsCatalog.map((reward, index) => (
                  <motion.div
                    key={reward.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Card className="h-full">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          {reward.icon}
                        </div>
                        <h3 className="font-bold mb-2">{reward.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                        <div className="mb-4">
                          <p className="text-2xl font-bold text-primary">{reward.points} pts</p>
                        </div>
                        <Button
                          className="w-full"
                          variant={totalPoints >= reward.points ? "default" : "outline"}
                          disabled={totalPoints < reward.points}
                          onClick={() => handleRedemption(reward.type, reward.points)}
                        >
                          {totalPoints >= reward.points ? "Redeem" : "Not Enough Points"}
                        </Button>
                        {totalPoints < reward.points && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Need {reward.points - totalPoints} more points
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Rewards;