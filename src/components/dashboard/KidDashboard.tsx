import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  MessageCircle,
  Star,
  Bell,
  Plus,
  Search,
  Trophy,
  Gift,
  MapPin,
  Calendar,
  Users,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KidDashboardProps {
  profile: any;
  kidData: any;
}

const KidDashboard = ({ profile, kidData }: KidDashboardProps) => {
  const { toast } = useToast();
  const [listings, setListings] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [kidData.id]);

  const fetchDashboardData = async () => {
    try {
      // Fetch listings
      const { data: listingsData } = await supabase
        .from("listings")
        .select(`
          *,
          categories(name)
        `)
        .eq("kid_id", kidData.id);

      // Fetch trades
      const { data: tradesData } = await supabase
        .from("trades")
        .select(`
          *,
          initiator_listing:listings!initiator_listing_id(title),
          responder_listing:listings!responder_listing_id(title)
        `)
        .or(`initiator_listing_id.in.(select id from listings where kid_id = ${kidData.id}),responder_listing_id.in.(select id from listings where kid_id = ${kidData.id})`);

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch rewards
      const { data: rewardsData } = await supabase
        .from("rewards")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      setListings(listingsData || []);
      setTrades(tradesData || []);
      setNotifications(notificationsData || []);
      setRewards(rewardsData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRewards = rewards.reduce((sum, reward) => sum + reward.points, 0);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile.full_name}! 🎉</h1>
        <p className="text-muted-foreground">Ready to trade some awesome stuff?</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{listings.length}</p>
                <p className="text-sm text-muted-foreground">My Listings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{trades.length}</p>
                <p className="text-sm text-muted-foreground">Active Trades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{totalRewards}</p>
                <p className="text-sm text-muted-foreground">Reward Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{notifications.filter(n => !n.is_read).length}</p>
                <p className="text-sm text-muted-foreground">New Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Button size="lg" className="h-20" onClick={() => window.location.href = '/create-listing'}>
          <Plus className="w-6 h-6 mr-2" />
          Create Listing
        </Button>
        <Button size="lg" variant="outline" className="h-20" onClick={() => window.location.href = '/discover'}>
          <Search className="w-6 h-6 mr-2" />
          Discover Items
        </Button>
        <Button size="lg" variant="outline" className="h-20" onClick={() => window.location.href = '/rewards'}>
          <Gift className="w-6 h-6 mr-2" />
          My Rewards
        </Button>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="chat">Messages</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            {listings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first listing to start trading!</p>
                  <Button onClick={() => window.location.href = '/create-listing'}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Listing
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                        {listing.photos?.[0] ? (
                          <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-semibold mb-1">{listing.title}</h3>
                      <Badge variant="secondary" className="mb-2">{listing.categories?.name}</Badge>
                      <p className="text-sm text-muted-foreground">{listing.condition}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trades" className="space-y-4">
            {trades.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No trades yet</h3>
                  <p className="text-muted-foreground">Start trading by responding to listings!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {trades.map((trade) => (
                  <Card key={trade.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">
                            {trade.initiator_listing?.title} ↔ {trade.responder_listing?.title}
                          </h3>
                          <Badge variant={trade.status === 'completed' ? 'default' : 'secondary'}>
                            {trade.status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          View Chat
                        </Button>
                      </div>
                      {trade.scheduled_at && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          Scheduled: {new Date(trade.scheduled_at).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            {trades.filter(t => t.status !== 'proposed').length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active chats</h3>
                  <p className="text-muted-foreground">Start trading to chat with other kids!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {trades.filter(t => t.status !== 'proposed').map((trade) => (
                  <Card key={trade.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">
                            Chat: {trade.initiator_listing?.title} ↔ {trade.responder_listing?.title}
                          </h3>
                          <Badge variant="outline">
                            {trade.status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          Open Chat
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Chat with the other trader about your exchange
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={notification.is_read ? '' : 'border-primary'}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <Badge variant="destructive" className="ml-2">New</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-lg">{profile.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Age</label>
                    <p className="text-lg">{kidData.age} years old</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">School</label>
                    <p className="text-lg">{kidData.school_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Membership</label>
                    <Badge variant={kidData.membership === 'paid' ? 'default' : 'secondary'}>
                      {kidData.membership === 'paid' ? 'Premium' : 'Free'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Interests</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {kidData.interests?.map((interest: string) => (
                      <Badge key={interest} variant="outline">{interest}</Badge>
                    )) || <p className="text-muted-foreground">No interests set</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default KidDashboard;