import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Package,
  MessageCircle,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminDashboardProps {
  profile: any;
}

const AdminDashboard = ({ profile }: AdminDashboardProps) => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    pendingVerifications: 0,
    activeTrades: 0,
  });
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [reportedListings, setReportedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const [usersResult, listingsResult, verificationsResult, tradesResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("listings").select("id", { count: "exact" }),
        supabase.from("verification_requests").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("trades").select("id", { count: "exact" }).neq("status", "completed"),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalListings: listingsResult.count || 0,
        pendingVerifications: verificationsResult.count || 0,
        activeTrades: tradesResult.count || 0,
      });

      // Fetch pending verifications
      const { data: verifications } = await supabase
        .from("verification_requests")
        .select(`
          *,
          kids: kid_id (
            age,
            school_name,
            profiles: profile_id (
              full_name,
              email
            )
          )
        `)
        .eq("status", "pending")
        .limit(10);

      setPendingVerifications(verifications || []);

      // Fetch reported listings (mock for now)
      setReportedListings([]);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (requestId: string, kidId: string, approved: boolean) => {
    try {
      await supabase
        .from("verification_requests")
        .update({
          status: approved ? "verified" : "rejected",
          reviewed_by: profile.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (approved) {
        await supabase
          .from("kids")
          .update({ parent_verified: true })
          .eq("id", kidId);
      }

      toast({
        title: approved ? "Child Verified" : "Verification Rejected",
        description: `The verification request has been ${approved ? "approved" : "rejected"}.`,
      });

      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update verification status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, listings, and keep SwapIt safe</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalListings}</p>
                <p className="text-sm text-muted-foreground">Active Listings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
                <p className="text-sm text-muted-foreground">Pending Verifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeTrades}</p>
                <p className="text-sm text-muted-foreground">Active Trades</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="verifications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="verifications" className="space-y-4">
          {pendingVerifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending verifications at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingVerifications.map((request) => (
                <Card key={request.id} className="border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Child Verification Request</h3>
                        <div className="space-y-1 text-sm">
                          <p><strong>Name:</strong> {request.kids?.profiles?.full_name}</p>
                          <p><strong>Age:</strong> {request.kids?.age}</p>
                          <p><strong>School:</strong> {request.kids?.school_name}</p>
                          <p><strong>Email:</strong> {request.kids?.profiles?.email}</p>
                        </div>
                      </div>
                      <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 ml-4" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleVerificationAction(request.id, request.kid_id, true)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerificationAction(request.id, request.kid_id, false)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Listing Management</h3>
              <p className="text-muted-foreground">Moderate listings and handle reports.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Reports & Disputes</h3>
              <p className="text-muted-foreground">Handle user reports and resolve disputes.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-muted-foreground">View platform statistics and trends.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;