import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft, ArrowRight, Loader2, User, School, Calendar, MapPin, Heart, Upload, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import LocationPicker from "@/components/registration/LocationPicker";
import InterestsPicker from "@/components/registration/InterestsPicker";

const steps = [
  { id: 1, title: "Basic Info", icon: User },
  { id: 2, title: "School Details", icon: School },
  { id: 3, title: "Location", icon: MapPin },
  { id: 4, title: "Interests", icon: Heart },
];

const kidSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(6, "Must be at least 6 years old").max(17, "Must be 17 or younger"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  schoolName: z.string().min(2, "Please enter your school name"),
});

const RegisterKid = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    email: "",
    password: "",
    schoolName: "",
    schoolIdFile: null as File | null,
    state: "",
    city: "",
    pincode: "",
    sector: "",
    colony: "",
    interests: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      const age = parseInt(formData.age);
      if (!formData.age || isNaN(age) || age < 6 || age > 17) {
        newErrors.age = "Age must be between 6 and 17";
      }
      if (!formData.email || !z.string().email().safeParse(formData.email).success) {
        newErrors.email = "Please enter a valid email";
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    if (currentStep === 2) {
      if (!formData.schoolName || formData.schoolName.length < 2) {
        newErrors.schoolName = "Please enter your school name";
      }
    }

    if (currentStep === 3) {
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
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

      // Upload school ID if provided
      let schoolIdUrl = null;
      if (formData.schoolIdFile) {
        const fileExt = formData.schoolIdFile.name.split('.').pop();
        const fileName = `${authData.user.id}/school_id.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, formData.schoolIdFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        schoolIdUrl = publicUrl;
      }

      // Create profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: authData.user.id,
          role: "kid",
          full_name: formData.fullName,
          email: formData.email,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create kid record
      const { error: kidError } = await supabase.from("kids").insert({
        profile_id: profileData.id,
        age: parseInt(formData.age),
        school_name: formData.schoolName,
        school_id_url: schoolIdUrl,
        interests: formData.interests,
      });

      if (kidError) throw kidError;

      // Create location
      if (formData.state && formData.city) {
        const { error: locationError } = await supabase.from("locations").insert({
          profile_id: profileData.id,
          state: formData.state,
          city: formData.city,
          pincode: formData.pincode || null,
          sector: formData.sector || null,
          colony: formData.colony || null,
        });

        if (locationError) throw locationError;
      }

      toast({
        title: "Welcome to SwapIt! 🎉",
        description: "Your account has been created. Ask your parent to verify your account!",
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-swap-teal/10 swap-blob swap-float" />
        <div className="absolute bottom-20 -left-20 w-60 h-60 bg-swap-coral/10 swap-blob swap-float" style={{ animationDelay: "-3s" }} />
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
          <div className="w-16 h-16 rounded-2xl swap-gradient-hero flex items-center justify-center mx-auto mb-4 swap-shadow-button">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Join SwapIt as a Kid!</h1>
          <p className="text-muted-foreground">
            Create your account and start trading toys with friends
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= step.id
                      ? "swap-gradient-hero text-primary-foreground"
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
                      currentStep > step.id ? "bg-primary" : "bg-muted"
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
          transition={{ delay: 0.2 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const StepIcon = steps[currentStep - 1].icon;
                  return StepIcon ? <StepIcon className="w-6 h-6 text-primary" /> : null;
                })()}
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                Step {currentStep} of {steps.length}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Basic Info */}
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
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min={6}
                      max={17}
                      placeholder="Your age (6-17)"
                      value={formData.age}
                      onChange={(e) => updateFormData("age", e.target.value)}
                    />
                    {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
                    <p className="text-xs text-muted-foreground">SwapIt is for kids aged 6-17 only</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                    />
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
                </motion.div>
              )}

              {/* Step 2: School Details */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      placeholder="Enter your school name"
                      value={formData.schoolName}
                      onChange={(e) => updateFormData("schoolName", e.target.value)}
                    />
                    {errors.schoolName && <p className="text-sm text-destructive">{errors.schoolName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>School ID Card (Optional)</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            updateFormData("schoolIdFile", file);
                          }
                        }}
                        className="hidden"
                        id="schoolIdUpload"
                      />
                      <label htmlFor="schoolIdUpload" className="cursor-pointer">
                        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm font-medium">
                          {formData.schoolIdFile ? formData.schoolIdFile.name : "Click to upload your school ID"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG or PDF (max 5MB)</p>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This helps verify your account faster
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Location */}
              {currentStep === 3 && (
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

              {/* Step 4: Interests */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <InterestsPicker
                    selectedInterests={formData.interests}
                    onChange={(interests) => updateFormData("interests", interests)}
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

                {currentStep < 4 ? (
                  <Button variant="hero" onClick={handleNext}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button variant="hero" onClick={handleSubmit} disabled={loading}>
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

export default RegisterKid;
