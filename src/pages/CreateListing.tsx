import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft, Upload, X, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateListing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    condition: "",
    brand: "",
    age: "",
    color: "",
    size: "",
    wants_in_exchange: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from("categories").select("*");
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast({
        title: "Too many photos",
        description: "You can upload up to 5 photos.",
        variant: "destructive",
      });
      return;
    }
    setPhotos((prev) => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (listingId: string) => {
    const photoUrls: string[] = [];

    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${listingId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(fileName, photo);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('listings')
        .getPublicUrl(fileName);

      photoUrls.push(publicUrl);
    }

    return photoUrls;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.category_id || !formData.condition) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get current user's kid profile
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

      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          kid_id: kid.id,
          category_id: formData.category_id,
          title: formData.title,
          description: formData.description,
          condition: formData.condition,
          brand: formData.brand || null,
          age: formData.age || null,
          color: formData.color || null,
          size: formData.size || null,
          wants_in_exchange: formData.wants_in_exchange || null,
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Upload photos if any
      if (photos.length > 0) {
        const photoUrls = await uploadPhotos(listing.id);

        await supabase
          .from("listings")
          .update({ photos: photoUrls })
          .eq("id", listing.id);
      }

      // Award points for first listing
      const { data: existingListings } = await supabase
        .from("listings")
        .select("id")
        .eq("kid_id", kid.id);

      if (existingListings?.length === 1) { // This is the first listing
        await supabase.from("rewards").insert({
          user_id: profile.id,
          points: 5,
          reason: "first_listing",
        });
      }

      toast({
        title: "Listing created! 🎉",
        description: "Your item is now available for trading.",
      });

      navigate("/dashboard");
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

  const selectedCategory = categories.find(cat => cat.id === formData.category_id);

  return (
    <div className="min-h-screen swap-gradient-bg p-4 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-swap-teal/10 swap-blob swap-float" />
        <div className="absolute bottom-20 -left-20 w-60 h-60 bg-swap-coral/10 swap-blob swap-float" style={{ animationDelay: "-3s" }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl swap-gradient-hero flex items-center justify-center mx-auto mb-4 swap-shadow-button">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create a Listing</h1>
          <p className="text-muted-foreground">
            Share what you have and find something awesome to trade!
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>
                Tell us about your item and what you're looking for in exchange
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., LEGO Star Wars Set"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category_id} onValueChange={(value) => updateFormData("category_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item in detail..."
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => updateFormData("condition", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <Label>Photos (up to 5)</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <div className="border-2 border-dashed border-border rounded-lg h-24 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photoUpload"
                      />
                      <label htmlFor="photoUpload" className="cursor-pointer text-center">
                        <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Add Photo</p>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Category-specific fields */}
              {selectedCategory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 p-4 bg-muted/50 rounded-lg"
                >
                  <h3 className="font-semibold">Additional Details for {selectedCategory.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        placeholder="e.g., LEGO, Nike"
                        value={formData.brand}
                        onChange={(e) => updateFormData("brand", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Age Range</Label>
                      <Input
                        id="age"
                        placeholder="e.g., 8-12 years"
                        value={formData.age}
                        onChange={(e) => updateFormData("age", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        placeholder="e.g., Red, Blue"
                        value={formData.color}
                        onChange={(e) => updateFormData("color", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="size">Size</Label>
                      <Input
                        id="size"
                        placeholder="e.g., Medium, 10 inches"
                        value={formData.size}
                        onChange={(e) => updateFormData("size", e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* What they want in exchange */}
              <div className="space-y-2">
                <Label htmlFor="wants_in_exchange">What do you want in exchange?</Label>
                <Textarea
                  id="wants_in_exchange"
                  placeholder="Describe what you're looking for..."
                  value={formData.wants_in_exchange}
                  onChange={(e) => updateFormData("wants_in_exchange", e.target.value)}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about what you'd like to trade for!
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button variant="hero" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Listing...
                    </>
                  ) : (
                    <>
                      Create Listing
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateListing;