import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Heart,
  Star,
  Sparkles,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
     <div className="min-h-screen swap-gradient-bg overflow-hidden">

      {/* ================= BACKGROUND OBJECTS ================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        {/* 👕 Clothes */}
        <div className="absolute top-20 left-24 opacity-25 animate-[float_12s_ease-in-out_infinite]">
          <div className="relative w-28 h-28 bg-emerald-300 rounded-xl">
            <div className="absolute -left-7 top-8 w-9 h-14 bg-emerald-300 rounded-md" />
            <div className="absolute -right-7 top-8 w-9 h-14 bg-emerald-300 rounded-md" />
          </div>
        </div>

        {/* ✈️ Aeroplane */}
        <div className="absolute top-28 right-32 opacity-20 rotate-12 animate-[float_16s_ease-in-out_infinite]">
          <div className="relative w-36 h-4 bg-sky-300 rounded-full">
            <div className="absolute left-12 -top-5 w-16 h-16 bg-sky-300 rotate-45 rounded-lg" />
            <div className="absolute left-12 -bottom-5 w-16 h-16 bg-sky-300 -rotate-45 rounded-lg" />
          </div>
        </div>

        {/* 🤖 Robot */}
        <div className="absolute bottom-40 right-1/4 opacity-25 animate-[float_14s_ease-in-out_infinite]">
          <div className="relative w-18 h-18 bg-purple-300 rounded-lg mx-auto">
            <div className="absolute left-5 top-7 w-2 h-2 bg-white rounded-full" />
            <div className="absolute right-5 top-7 w-2 h-2 bg-white rounded-full" />
          </div>
          <div className="w-22 h-22 bg-purple-300 rounded-xl mt-2 mx-auto" />
        </div>

        {/* 📚 Books */}
        <div className="absolute bottom-28 left-1/4 opacity-25 animate-[float_13s_ease-in-out_infinite]">
          <div className="w-32 h-6 bg-orange-300 rounded-sm mb-2" />
          <div className="w-28 h-6 bg-orange-400 rounded-sm mb-2" />
          <div className="w-30 h-6 bg-orange-300 rounded-sm" />
        </div>

        {/* ⚽ Toy Ball */}
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-rose-300 rounded-full opacity-20 animate-[float_18s_ease-in-out_infinite]" />

        {/* 🧸 Toy Block */}
        <div className="absolute bottom-16 right-20 w-24 h-24 bg-yellow-300 rounded-2xl opacity-20 animate-[float_20s_ease-in-out_infinite]" />

        {/* 🃏 Cards */}
        <div className="absolute top-1/3 right-10 opacity-20 animate-[float_15s_ease-in-out_infinite]">
          <div className="w-16 h-24 bg-indigo-300 rounded-lg rotate-6" />
          <div className="w-16 h-24 bg-indigo-400 rounded-lg -rotate-6 -mt-20 ml-6" />
        </div>

      </div>

      {/* ================= CONTENT ================= */}
      <section className="relative z-10 w-full">

        {/* Header */}
        <header className="w-full">
          <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl swap-gradient-hero flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-gradient-hero">
                SwapIt
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button variant="hero" onClick={() => navigate("/discover")}>
                Get Started
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <main className="w-full px-6 pt-16 pb-24">
          <div className="max-w-5xl mx-auto text-center">

            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-swap-teal-light text-swap-teal text-sm font-semibold mb-6">
              <Star className="w-4 h-4" />
              India's #1 Child-Safe Trading Platform
            </span>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Trade Toys,{" "}
              <span className="text-gradient-hero">Make Friends</span>
              <br />
              <span className="text-swap-coral">No Money Needed!</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              SwapIt lets kids aged 6–17 exchange toys, books, and games safely.
              Parents supervise every trade. Fun, sustainable & 100% money-free.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="hero" onClick={() => navigate("/register/kid")}>
                I'm a Kid <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="xl" variant="coral-outline" onClick={() => navigate("/register/parent")}>
                I'm a Parent <Shield className="w-5 h-5" />
              </Button>
            </div>
          </div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto"
        >
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-swap-teal" />}
            title="100% Safe"
            description="Parent approval required for every trade. Verified accounts only."
            color="teal"
          />
          <FeatureCard
            icon={<Heart className="w-8 h-8 text-swap-coral" />}
            title="Eco-Friendly"
            description="Give old items a new home. Teach kids sustainability through trading."
            color="coral"
          />
          <FeatureCard
            icon={<Gift className="w-8 h-8 text-swap-gold" />}
            title="Earn Rewards"
            description="Collect points for trades, unlock badges, and win exciting prizes!"
            color="gold"
          />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-20 bg-card rounded-3xl swap-shadow-card p-8 md:p-12 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem value="50K+" label="Happy Kids" />
            <StatItem value="100K+" label="Items Traded" />
            <StatItem value="25K+" label="Verified Parents" />
            <StatItem value="4.9★" label="App Rating" />
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How SwapIt Works</h2>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
            Simple, safe, and supervised trading in just 4 easy steps
          </p>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <StepCard number={1} title="Sign Up" description="Register with parent verification" />
            <StepCard number={2} title="List Items" description="Upload toys, books, or games" />
            <StepCard number={3} title="Find Swaps" description="Discover items near you" />
            <StepCard number={4} title="Trade Safely" description="Meet up with parent approval" />
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-20 swap-gradient-hero rounded-3xl p-8 md:p-16 text-center text-primary-foreground"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Swapping?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of families making sustainable choices while having fun!
          </p>
          <Button
            size="xl"
            className="bg-card text-foreground hover:bg-card/90"
            onClick={() => navigate("/discover")}
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 mt-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg swap-gradient-hero flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">SwapIt</span>
            </div>
            {/* <p className="text-sm text-muted-foreground">
              © 2024 SwapIt. Made with ❤️ for kids and parents.
            </p> */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Safety</a>
            </div>
          </div>
        </div>
      </footer>
      </section>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "teal" | "coral" | "gold";
}) => {
  const bgColors = {
    teal: "bg-swap-teal-light",
    coral: "bg-swap-coral-light",
    gold: "bg-swap-gold-light",
  };

  return (
    <div className="bg-card rounded-2xl p-6 swap-shadow-card hover:swap-shadow-soft transition-all duration-300 hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-xl ${bgColors[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div>
    <div className="text-3xl md:text-4xl font-black text-gradient-hero">{value}</div>
    <div className="text-sm text-muted-foreground font-medium">{label}</div>
  </div>
);

const StepCard = ({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) => (
  <div className="text-center">
    <div className="w-12 h-12 rounded-full swap-gradient-hero text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
      {number}
    </div>
    <h3 className="font-bold text-lg mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Index;
