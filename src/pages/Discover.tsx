import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Package,
  ArrowLeft,
  Heart,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------------- MOCK DATA (UI ONLY) ---------------- */

const MOCK_LISTINGS = [
  {
    id: "1",
    title: "Remote Control Car",
    description: "Almost new RC car, works perfectly",
    category: "Toys",
    condition: "Like New",
    owner: "Aarav",
  },
  {
    id: "2",
    title: "Harry Potter Book Set",
    description: "Complete set, well maintained",
    category: "Books",
    condition: "Good",
    owner: "Isha",
  },
  {
    id: "3",
    title: "Kids Winter Jacket",
    description: "Warm and comfy jacket",
    category: "Clothes",
    condition: "Good",
    owner: "Vihaan",
  },
  {
    id: "4",
    title: "Kids Smart Watch",
    description: "Fun games and step tracker",
    category: "Electronics",
    condition: "New",
    owner: "Ananya",
  },
];

/* ---------------- COMPONENT ---------------- */

const Discover = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["ALL", "Clothes", "Electronics", "Books", "Toys"];

  const filteredListings = MOCK_LISTINGS.filter((item) => {
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">

        {/* ---------------- HEADER ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-2xl md:text-3xl font-bold">
            Discover Swaps 🔍
          </h1>

          <div />
        </motion.div>

        {/* ---------------- CATEGORY TABS ---------------- */}
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="mb-6"
        >
          <TabsList className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* ---------------- SEARCH ---------------- */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search toys, books, clothes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ---------------- LISTINGS GRID ---------------- */}
        {filteredListings.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <Package className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No items found</h3>
              <p className="text-muted-foreground">
                Try changing category or search
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredListings.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
                      <Package className="w-10 h-10 text-muted-foreground" />
                    </div>

                    <h3 className="font-semibold text-lg line-clamp-1">
                      {item.title}
                    </h3>

                    <Badge variant="outline" className="my-2">
                      {item.category}
                    </Badge>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {item.description}
                    </p>

                    <p className="text-xs text-muted-foreground mb-4">
                      By {item.owner}
                    </p>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Trade
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
