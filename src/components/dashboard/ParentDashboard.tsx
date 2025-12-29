import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Shield,
  MessageCircle,
  Star,
  Bell,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParentDashboardProps {
  profile: any;
  parentData: any;
}

const ParentDashboard = ({ profile, parentData }: ParentDashboardProps) => {
  const { toast } = useToast();
  const [children, setChildren] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [parentData.id]);

  const fetchDashboardData = async () => {
    try {
      // Fetch children
      const { data: childrenData } = await supabase
        .from("parent_child_links")
        .select(`
          *,
          kids: kid_id (
            id,
            age,
            school_name,
            membership,
            profiles: profile_id (
              full_name
            )
          )
        `)
        .eq("parent_id", parentData.id);

      // Fetch pending approvals (trades that need parent approval)
      const { data: approvalsData } = await supabase
        .from("trades")
        .select(`
          *,
          initiator_listing: listings!initiator_listing_id (
            title,
            kid_id,
            kids: kid_id (profiles: profile_id (full_name))
          ),
          responder_listing: listings!responder_listing_id (
            title,
            kid_id,
            kids: kid_id (profiles: profile_id (full_name))
          )
        `)
        .eq("parent_approval_status", "pending");

      // Filter approvals for this parent's children
      const relevantApprovals = approvalsData?.filter(trade =>
        childrenData?.some(child =>
          child.kids.id === trade.initiator_listing?.kid_id ||
          child.kids.id === trade.responder_listing?.kid_id
        )
      ) || [];

      // Fetch trade history
      const { data: historyData } = await supabase
        .from("trades")
        .select(`
          *,
          initiator_listing: listings!initiator_listing_id (title),
          responder_listing: listings!responder_listing_id (title)
        `)
        .neq("status", "proposed");

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setChildren(childrenData || []);
      setPendingApprovals(relevantApprovals);
      setTradeHistory(historyData || []);
      setNotifications(notificationsData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (tradeId: string, approved: boolean) => {
    try {
      await supabase
        .from("trades")
        .update({
          parent_approval_status: approved ? "approved" : "rejected",
          status: approved ? "approved" : "cancelled"
        })
        .eq("id", tradeId);

      toast({
        title: approved ? "Trade Approved" : "Trade Rejected",
        description: `The trade has been ${approved ? "approved" : "rejected"}.`,
      });

      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update trade status.",
        variant: "destructive",
      });
    }
  };

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
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile.full_name}! 👋</h1>
        <p className="text-muted-foreground">Keep your kids safe while they have fun trading</p>
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
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{children.length}</p>
                <p className="text-sm text-muted-foreground">Children</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingApprovals.length}</p>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{tradeHistory.length}</p>
                <p className="text-sm text-muted-foreground">Trade History</p>
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
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Button size="lg" className="h-20" onClick={() => window.location.href = '/children'}>
          <Eye className="w-6 h-6 mr-2" />
          Monitor Children
        </Button>
        <Button size="lg" variant="outline" className="h-20" onClick={() => window.location.href = '/approvals'}>
          <Shield className="w-6 h-6 mr-2" />
          Review Approvals
        </Button>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="children" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="children">My Children</TabsTrigger>
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="children" className="space-y-4">
            {children.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No children registered</h3>
                  <p className="text-muted-foreground mb-4">Register your child to start monitoring their activity.</p>
                  <Button onClick={() => window.location.href = '/register-child'}>
                    Register Child
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map((link) => (
                  <Card key={link.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{link.kids.profiles.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Age {link.kids.age} • {link.kids.school_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge variant={link.kids.membership === 'paid' ? 'default' : 'secondary'}>
                          {link.kids.membership === 'paid' ? 'Premium' : 'Free'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View Activity
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No pending approvals at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((trade) => (
                  <Card key={trade.id} className="border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">Trade Request</h3>
                          <div className="space-y-1 text-sm">
                            <p><strong>Item 1:</strong> {trade.initiator_listing?.title}</p>
                            <p><strong>Child:</strong> {trade.initiator_listing?.kids?.profiles?.full_name}</p>
                            <p><strong>Item 2:</strong> {trade.responder_listing?.title}</p>
                            <p><strong>Child:</strong> {trade.responder_listing?.kids?.profiles?.full_name}</p>
                            {trade.proposed_exchange && (
                              <p><strong>Exchange:</strong> {trade.proposed_exchange}</p>
                            )}
                          </div>
                        </div>
                        <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 ml-4" />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApproval(trade.id, true)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(trade.id, false)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {tradeHistory.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No trade history</h3>
                  <p className="text-muted-foreground">Trade history will appear here once your children start trading.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tradeHistory.map((trade) => (
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
                          View Details
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Completed: {new Date(trade.completed_at || trade.updated_at).toLocaleDateString()}
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
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ParentDashboard;