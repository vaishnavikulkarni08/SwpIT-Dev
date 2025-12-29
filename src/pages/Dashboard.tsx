import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import KidDashboard from "@/components/dashboard/KidDashboard";
import ParentDashboard from "@/components/dashboard/ParentDashboard";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Bell, LogOut } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [kidData, setKidData] = useState<any>(null);
  const [parentData, setParentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        } else {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch role-specific data
      if (profileData?.role === "kid") {
        const { data: kid } = await supabase
          .from("kids")
          .select("*")
          .eq("profile_id", profileData.id)
          .maybeSingle();
        setKidData(kid);
      } else if (profileData?.role === "parent") {
        const { data: parent } = await supabase
          .from("parents")
          .select("*")
          .eq("profile_id", profileData.id)
          .maybeSingle();
        setParentData(parent);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "See you soon! 👋",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen swap-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl swap-gradient-hero flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isParent = profile?.role === "parent";
  const isKid = profile?.role === "kid";

  return (
    <div className="min-h-screen swap-gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl swap-gradient-hero flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient-hero">SwapIt</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {profile?.full_name?.charAt(0) || "U"}
              </div>
              <span className="font-medium hidden sm:block">{profile?.full_name || "User"}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {profile?.role === "kid" && kidData && (
          <KidDashboard profile={profile} kidData={kidData} />
        )}
        {profile?.role === "parent" && parentData && (
          <ParentDashboard profile={profile} parentData={parentData} />
        )}
        {profile?.role === "admin" && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
            <p className="text-muted-foreground">Admin features coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
}) => (
  <Card variant="elevated" className="p-4">
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  </Card>
);

const ActionCard = ({
  icon,
  label,
  description,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: "teal" | "coral" | "gold" | "purple";
  onClick: () => void;
}) => {
  const colors = {
    teal: "text-swap-teal bg-swap-teal-light hover:bg-swap-teal/20",
    coral: "text-swap-coral bg-swap-coral-light hover:bg-swap-coral/20",
    gold: "text-swap-gold bg-swap-gold-light hover:bg-swap-gold/20",
    purple: "text-swap-purple bg-swap-purple-light hover:bg-swap-purple/20",
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 ${colors[color]}`}
    >
      <div className="mb-3">{icon}</div>
      <h3 className="font-bold">{label}</h3>
      <p className="text-xs opacity-70">{description}</p>
    </button>
  );
};

export default Dashboard;
