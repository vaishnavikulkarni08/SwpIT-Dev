import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackFormProps {
  tradeId: string;
  revieweeId: string;
  revieweeName: string;
  onSubmitted: () => void;
}

const FeedbackForm = ({ tradeId, revieweeId, revieweeName, onSubmitted }: FeedbackFormProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // Submit feedback
      const { error } = await supabase
        .from("feedback")
        .insert({
          trade_id: tradeId,
          reviewer_id: profile.id,
          reviewee_id: revieweeId,
          rating,
          review: review.trim() || null,
        });

      if (error) throw error;

      // Award points for review
      await supabase
        .from("rewards")
        .insert({
          user_id: profile.id,
          points: 2,
          reason: "review_submitted",
        });

      toast({
        title: "Feedback submitted!",
        description: "Thanks for helping keep SwapIt safe and fun!",
      });

      onSubmitted();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate your experience with {revieweeName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="review">Review (Optional)</Label>
          <Textarea
            id="review"
            placeholder="Share your experience..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </Button>

        <p className="text-sm text-muted-foreground">
          Your feedback helps maintain a safe and positive community. You'll earn 2 reward points!
        </p>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;