import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown, Check, Star, Zap, Shield, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Membership = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<"free" | "paid">("free");

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const { data: kid } = await supabase
        .from("kids")
        .select("id, membership")
        .eq("profile_id", profile.id)
        .single();

      if (kid) {
        setCurrentPlan(kid.membership);
      }
    } catch (error) {
      console.error("Error fetching current plan:", error);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // In a real app, this would integrate with a payment gateway
      // For now, we'll simulate the upgrade

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const { data: kid } = await supabase
        .from("kids")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

      // Update membership
      await supabase
        .from("kids")
        .update({ membership: "paid" })
        .eq("id", kid.id);

      // Create membership record
      await supabase
        .from("memberships")
        .insert({
          kid_id: kid.id,
          plan_type: "paid",
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          payment_id: `simulated_${Date.now()}`,
        });

      setCurrentPlan("paid");

      toast({
        title: "Welcome to Premium! 🎉",
        description: "Enjoy unlimited listings and ad-free browsing!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const freeFeatures = [
    "Up to 5 listings",
    "Basic search and discovery",
    "Community support",
    "Safe trading environment",
  ];

  const premiumFeatures = [
    "Unlimited listings",
    "Ad-free browsing experience",
    "Higher visibility for your items",
    "Priority customer support",
    "Early access to new features",
    "Advanced search filters",
    "Trade analytics",
    "Exclusive rewards",
  ];

  return (
    <div className="min-h-screen swap-gradient-bg p-4 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-swap-gold/10 swap-blob swap-float" />
        <div className="absolute bottom-20 -left-20 w-60 h-60 bg-swap-purple/10 swap-blob swap-float" style={{ animationDelay: "-3s" }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-3xl swap-gradient-secondary flex items-center justify-center mx-auto mb-6 swap-shadow-button">
            <Crown className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Unlock the full potential of SwapIt with our premium membership.
            Trade more, discover better, and enjoy an ad-free experience!
          </p>
        </motion.div>

        {/* Current Plan Indicator */}
        {currentPlan === "paid" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="border-swap-gold bg-gradient-to-r from-swap-gold/10 to-swap-gold/5">
              <CardContent className="p-6 text-center">
                <Crown className="w-8 h-8 mx-auto text-swap-gold mb-2" />
                <h3 className="text-xl font-bold text-swap-gold mb-1">Premium Member</h3>
                <p className="text-muted-foreground">You're enjoying all premium features!</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Plans Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {/* Free Plan */}
          <Card className={`relative ${currentPlan === "free" ? "ring-2 ring-primary" : ""}`}>
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">Free Plan</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-3xl font-bold mt-4">₹0</div>
              <p className="text-sm text-muted-foreground">Forever free</p>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {currentPlan === "free" && (
                <Badge variant="secondary" className="w-full justify-center py-2">
                  Current Plan
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={`relative ${currentPlan === "paid" ? "ring-2 ring-swap-gold" : ""}`}>
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 rounded-xl swap-gradient-secondary flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Premium Plan</CardTitle>
              <CardDescription>Unlock unlimited trading potential</CardDescription>
              <div className="text-3xl font-bold mt-4">₹500</div>
              <p className="text-sm text-muted-foreground">per year</p>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {currentPlan === "free" ? (
                <Button
                  className="w-full swap-gradient-secondary hover:opacity-90"
                  size="lg"
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  {loading ? "Upgrading..." : "Upgrade to Premium"}
                </Button>
              ) : (
                <Badge variant="default" className="w-full justify-center py-2 bg-swap-gold hover:bg-swap-gold">
                  Current Plan
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 mx-auto text-swap-teal mb-4" />
              <h3 className="font-bold mb-2">Unlimited Listings</h3>
              <p className="text-sm text-muted-foreground">
                Create as many listings as you want without any restrictions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 mx-auto text-swap-purple mb-4" />
              <h3 className="font-bold mb-2">Ad-Free Experience</h3>
              <p className="text-sm text-muted-foreground">
                Enjoy a clean, distraction-free trading environment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Gift className="w-12 h-12 mx-auto text-swap-coral mb-4" />
              <h3 className="font-bold mb-2">Exclusive Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Get access to special rewards and premium features
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Can I cancel my premium subscription anytime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue to have premium access until the end of your billing period.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, debit cards, UPI, and other popular payment methods in India.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Is there a free trial for premium?</h4>
                <p className="text-sm text-muted-foreground">
                  Currently, we offer premium features directly. However, you can try all features during the first 7 days of your subscription.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Can parents manage multiple children's accounts?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! Parent accounts can link and manage multiple children's profiles, with full control over approvals and settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Membership;