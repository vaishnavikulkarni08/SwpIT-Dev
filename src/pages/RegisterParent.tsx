import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowLeft, ArrowRight, Loader2, User, Phone, Mail, Shield, Baby, MapPin, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import LocationPicker from "@/components/registration/LocationPicker";
import OTPVerification from "@/components/registration/OTPVerification";

const parentSteps = [
  { id: 1, title: "Your Details", icon: User },
  { id: 2, title: "Verification", icon: Shield },
  { id: 3, title: "Location", icon: MapPin },
];

const parentChildSteps = [
  { id: 1, title: "Parent Details", icon: User },
  { id: 2, title: "Verification", icon: Shield },
  { id: 3, title: "Child Details", icon: Baby },
  { id: 4, title: "Location", icon: MapPin },
];

const RegisterParent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [registrationType, setRegistrationType] = useState<"self" | "child">("self");
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [formData, setFormData] = useState({
    // Parent fields
    fullName: "",
    email: "",
    password: "",
    phone: "",
    // Child fields (for parent-led registration)
    childName: "",
    childAge: "",
    childAadhaar: "",
    schoolName: "",
    // Location
    state: "",
    city: "",
    pincode: "",
    sector: "",
    colony: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = registrationType === "child" ? parentChildSteps : parentSteps;

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.fullName || formData.fullName.length < 2) {
        newErrors.fullName = "Name must be at least 2 characters";
      }
      if (!formData.email || !z.string().email().safeParse(formData.email).success) {
        newErrors.email = "Please enter a valid email";
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (!formData.phone || formData.phone.length < 10) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    if (currentStep === 3 && registrationType === "child") {
      if (!formData.childName || formData.childName.length < 2) {
        newErrors.childName = "Name must be at least 2 characters";
      }
      const age = parseInt(formData.childAge);
      if (!formData.childAge || isNaN(age) || age < 6 || age > 17) {
        newErrors.childAge = "Age must be between 6 and 17";
      }
      if (!formData.schoolName || formData.schoolName.length < 2) {
        newErrors.schoolName = "Please enter school name";
      }
    }

    const locationStep = registrationType === "child" ? 4 : 3;
    if (currentStep === locationStep) {
      if (!formData.state) {
        newErrors.state = "Please select a state";
      }
      if (!formData.city) {
        newErrors.city = "Please select a city";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const maskAadhaar = (aadhaar: string) => {
    if (aadhaar.length >= 4) {
      return "XXXX-XXXX-" + aadhaar.slice(-4);
    }
    return aadhaar;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      // Create auth user
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Create parent profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: authData.user.id,
          role: "parent",
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create parent record
      const { data: parentData, error: parentError } = await supabase
        .from("parents")
        .insert({
          profile_id: profileData.id,
          phone_verified: phoneVerified,
          email_verified: emailVerified,
          aadhaar_last_four: formData.childAadhaar ? formData.childAadhaar.slice(-4) : null,
        })
        .select()
        .single();

      if (parentError) throw parentError;

      // Create location for parent
      if (formData.state && formData.city) {
        await supabase.from("locations").insert({
          profile_id: profileData.id,
          state: formData.state,
          city: formData.city,
          pincode: formData.pincode || null,
          sector: formData.sector || null,
          colony: formData.colony || null,
        });
      }

      // If registering child, create child account
      if (registrationType === "child" && formData.childName) {
        // Create a temporary auth entry for child (parent can set password later)
        const childEmail = `child_${Date.now()}@swapit.temp`;
        const { data: childAuthData, error: childAuthError } = await supabase.auth.signUp({
          email: childEmail,
          password: formData.password, // Use same password temporarily
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (!childAuthError && childAuthData.user) {
          // Create child profile
          const { data: childProfileData, error: childProfileError } = await supabase
            .from("profiles")
            .insert({
              user_id: childAuthData.user.id,
              role: "kid",
              full_name: formData.childName,
            })
            .select()
            .single();

          if (!childProfileError && childProfileData) {
            // Create kid record
            const { data: kidData } = await supabase
              .from("kids")
              .insert({
                profile_id: childProfileData.id,
                age: parseInt(formData.childAge),
                school_name: formData.schoolName,
                parent_verified: true,
              })
              .select()
              .single();

            // Create parent-child link
            if (kidData) {
              await supabase.from("parent_child_links").insert({
                parent_id: parentData.id,
                kid_id: kidData.id,
                is_primary: true,
                verified_at: new Date().toISOString(),
              });
            }

            // Create location for child
            if (formData.state && formData.city) {
              await supabase.from("locations").insert({
                profile_id: childProfileData.id,
                state: formData.state,
                city: formData.city,
                pincode: formData.pincode || null,
                sector: formData.sector || null,
                colony: formData.colony || null,
              });
            }
          }
        }
      }

      toast({
        title: "Welcome to SwapIt! 🎉",
        description: registrationType === "child" 
          ? "Your account and your child's account have been created!"
          : "Your parent account has been created!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      let message = error.message;
      if (error.message.includes("User already registered")) {
        message = "This email is already registered. Try signing in instead!";
      }
      toast({
        title: "Oops!",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen swap-gradient-bg p-4 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-swap-coral/10 swap-blob swap-float" />
        <div className="absolute bottom-20 -left-20 w-60 h-60 bg-swap-teal/10 swap-blob swap-float" style={{ animationDelay: "-3s" }} />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl swap-gradient-secondary flex items-center justify-center mx-auto mb-4 swap-shadow-button">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Parent Registration</h1>
          <p className="text-muted-foreground">
            Keep your kids safe while they trade and have fun
          </p>
        </motion.div>

        {/* Registration Type Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Tabs
            value={registrationType}
            onValueChange={(v) => {
              setRegistrationType(v as "self" | "child");
              setCurrentStep(1);
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-muted rounded-xl">
              <TabsTrigger
                value="self"
                className="py-3 rounded-lg data-[state=active]:bg-card data-[state=active]:swap-shadow-soft"
              >
                <User className="w-4 h-4 mr-2" />
                Just Me
              </TabsTrigger>
              <TabsTrigger
                value="child"
                className="py-3 rounded-lg data-[state=active]:bg-card data-[state=active]:swap-shadow-soft"
              >
                <Baby className="w-4 h-4 mr-2" />
                Me + My Child
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= step.id
                      ? "swap-gradient-secondary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-1 mx-1 rounded-full transition-all duration-300 ${
                      currentStep > step.id ? "bg-secondary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const StepIcon = steps[currentStep - 1].icon;
                  return StepIcon ? <StepIcon className="w-6 h-6 text-secondary" /> : null;
                })()}
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                Step {currentStep} of {steps.length}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Parent Details */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => updateFormData("fullName", e.target.value)}
                    />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Verification */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <OTPVerification
                    type="phone"
                    value={formData.phone}
                    verified={phoneVerified}
                    onVerified={() => setPhoneVerified(true)}
                  />
                  <OTPVerification
                    type="email"
                    value={formData.email}
                    verified={emailVerified}
                    onVerified={() => setEmailVerified(true)}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Verification helps keep your family safe on SwapIt
                  </p>
                </motion.div>
              )}

              {/* Step 3: Child Details (only for parent+child flow) */}
              {currentStep === 3 && registrationType === "child" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-swap-coral-light rounded-xl mb-4">
                    <p className="text-sm text-swap-coral font-medium">
                      🔒 Your child's information is protected and only visible to you
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="childName">Child's Full Name</Label>
                    <Input
                      id="childName"
                      placeholder="Enter your child's name"
                      value={formData.childName}
                      onChange={(e) => updateFormData("childName", e.target.value)}
                    />
                    {errors.childName && <p className="text-sm text-destructive">{errors.childName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="childAge">Child's Age</Label>
                    <Input
                      id="childAge"
                      type="number"
                      min={6}
                      max={17}
                      placeholder="Age (6-17)"
                      value={formData.childAge}
                      onChange={(e) => updateFormData("childAge", e.target.value)}
                    />
                    {errors.childAge && <p className="text-sm text-destructive">{errors.childAge}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      placeholder="Enter child's school name"
                      value={formData.schoolName}
                      onChange={(e) => updateFormData("schoolName", e.target.value)}
                    />
                    {errors.schoolName && <p className="text-sm text-destructive">{errors.schoolName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="childAadhaar">Child's Aadhaar Number (Optional)</Label>
                    <Input
                      id="childAadhaar"
                      placeholder="XXXX-XXXX-XXXX"
                      value={formData.childAadhaar}
                      onChange={(e) => updateFormData("childAadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
                      maxLength={12}
                    />
                    {formData.childAadhaar && (
                      <p className="text-xs text-muted-foreground">
                        Stored as: {maskAadhaar(formData.childAadhaar)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      🔐 Encrypted and stored securely. Only last 4 digits visible.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Location Step */}
              {((currentStep === 3 && registrationType === "self") ||
                (currentStep === 4 && registrationType === "child")) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <LocationPicker
                    state={formData.state}
                    city={formData.city}
                    pincode={formData.pincode}
                    sector={formData.sector}
                    colony={formData.colony}
                    onChange={updateFormData}
                    errors={errors}
                  />
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {currentStep < steps.length ? (
                  <Button variant="coral" onClick={handleNext}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button variant="coral" onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterParent;
