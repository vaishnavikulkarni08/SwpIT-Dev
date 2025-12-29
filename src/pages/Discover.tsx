import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  MapPin,
  Heart,
  MessageCircle,
  Star,
  Package,
  SlidersHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  condition: string;
  photos: string[] | null;
  brand: string | null;
  age: string | null;
  color: string | null;
  size: string | null;
  wants_in_exchange: string | null;
  created_at: string;
  categories: {
    name: string;
  } | null;
  kids: {
    profiles: {
      full_name: string;
    };
  };
}

const Discover = () => {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchCategories();
    fetchListings();
  }, [searchQuery, selectedCategory, selectedCondition, sortBy]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from("categories").select("*");
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("listings")
        .select(`
          *,
          categories(name),
          kids!inner(profiles(full_name))
        `)
        .eq("is_active", true)
        .eq("is_moderated", true);

      // Apply filters
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      if (selectedCondition) {
        query = query.eq("condition", selectedCondition);
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "title":
          query = query.order("title", { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast({
        title: "Error",
        description: "Failed to load listings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTradeRequest = async (listingId: string) => {
    try {
      // Get current user's kid profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to make trade requests.",
          variant: "destructive",
        });
        return;
      }

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

      // Check if user already has a listing to trade with
      const { data: userListings } = await supabase
        .from("listings")
        .select("id")
        .eq("kid_id", kid.id)
        .eq("is_active", true);

      if (!userListings || userListings.length === 0) {
        toast({
          title: "No listings found",
          description: "You need to create a listing first before you can trade.",
          variant: "destructive",
        });
        return;
      }

      // For now, use the first listing. In a real app, you'd let them choose
      const userListingId = userListings[0].id;

      // Create trade request
      const { error } = await supabase
        .from("trades")
        .insert({
          initiator_listing_id: userListingId,
          responder_listing_id: listingId,
          proposed_exchange: "Let's trade!",
        });

      if (error) throw error;

      toast({
        title: "Trade request sent! 🎉",
        description: "The other user will be notified of your interest.",
      });

      // Create notification for the listing owner
      const listing = listings.find(l => l.id === listingId);
      if (listing) {
        await supabase.from("notifications").insert({
          user_id: profile.id, // This should be the listing owner's profile id
          type: "new_match",
          title: "New Trade Interest!",
          message: `Someone is interested in trading with you for "${listing.title}"`,
          related_id: listingId,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new": return "bg-green-100 text-green-800";
      case "like_new": return "bg-blue-100 text-blue-800";
      case "good": return "bg-yellow-100 text-yellow-800";
      case "fair": return "bg-orange-100 text-orange-800";
      case "poor": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Discover Amazing Trades! 🔍</h1>
          <p className="text-muted-foreground text-lg">
            Find the perfect item to trade with your friends
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Condition</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading amazing items...</p>
            </div>
          ) : listings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setSelectedCondition("");
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                        {listing.photos && listing.photos.length > 0 ? (
                          <img
                            src={listing.photos[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                          <Badge className={getConditionColor(listing.condition)}>
                            {listing.condition.replace('_', ' ')}
                          </Badge>
                        </div>

                        {listing.categories && (
                          <Badge variant="outline" className="mb-2">
                            {listing.categories.name}
                          </Badge>
                        )}

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {listing.description || "No description"}
                        </p>

                        {/* Details */}
                        <div className="space-y-1 mb-4">
                          {listing.brand && (
                            <p className="text-xs text-muted-foreground">
                              <strong>Brand:</strong> {listing.brand}
                            </p>
                          )}
                          {listing.age && (
                            <p className="text-xs text-muted-foreground">
                              <strong>Age:</strong> {listing.age}
                            </p>
                          )}
                          {listing.wants_in_exchange && (
                            <p className="text-xs text-muted-foreground">
                              <strong>Wants:</strong> {listing.wants_in_exchange}
                            </p>
                          )}
                        </div>

                        {/* Owner */}
                        <p className="text-xs text-muted-foreground mb-4">
                          By {listing.kids.profiles.full_name}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleTradeRequest(listing.id)}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Trade
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Discover;