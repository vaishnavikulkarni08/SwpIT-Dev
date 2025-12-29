import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Send, Loader2, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OTPVerificationProps {
  type: "phone" | "email";
  value: string;
  verified: boolean;
  onVerified: () => void;
}

const OTPVerification = ({ type, value, verified, onVerified }: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendOTP = async () => {
    if (!value) {
      toast({
        title: "Missing Information",
        description: `Please enter your ${type} first.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would call your backend to send OTP
      // For demo purposes, we'll simulate sending OTP
      await new Promise(resolve => setTimeout(resolve, 1000));

      setOtpSent(true);
      setCountdown(60); // 60 second countdown

      toast({
        title: "OTP Sent",
        description: `Verification code sent to your ${type}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to send OTP to your ${type}.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would verify the OTP with your backend
      // For demo purposes, we'll accept any 6-digit code
      await new Promise(resolve => setTimeout(resolve, 1000));

      onVerified();
      toast({
        title: "Verified!",
        description: `Your ${type} has been verified successfully.`,
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-3 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">
              {type === "phone" ? "Phone" : "Email"} Verified
            </p>
            <p className="text-sm text-green-600">{value}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          {type === "phone" ? (
            <Phone className="h-4 w-4" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          <Label className="font-medium">
            {type === "phone" ? "Phone" : "Email"} Verification
          </Label>
        </div>

        <div className="text-sm text-muted-foreground">
          {value ? (
            <p>We'll send a verification code to: <strong>{value}</strong></p>
          ) : (
            <p>Please enter your {type} above first.</p>
          )}
        </div>

        {!otpSent ? (
          <Button
            onClick={sendOTP}
            disabled={loading || !value || countdown > 0}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Verification Code
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`${type}-otp`}>Enter 6-digit code</Label>
              <Input
                id={`${type}-otp`}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={verifyOTP}
                disabled={loading || otp.length !== 6}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Verify
              </Button>

              <Button
                variant="outline"
                onClick={sendOTP}
                disabled={loading || countdown > 0}
                className="flex-1"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OTPVerification;