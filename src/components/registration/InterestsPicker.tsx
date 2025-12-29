import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface InterestsPickerProps {
  selectedInterests: string[];
  onChange: (interests: string[]) => void;
  errors: Record<string, string>;
}

const InterestsPicker = ({ selectedInterests, onChange, errors }: InterestsPickerProps) => {
  const interestCategories = [
    {
      category: "Sports & Games",
      interests: ["Football", "Basketball", "Cricket", "Tennis", "Swimming", "Cycling", "Board Games", "Video Games"]
    },
    {
      category: "Arts & Creativity",
      interests: ["Drawing", "Painting", "Music", "Dance", "Crafting", "Photography", "Writing", "Acting"]
    },
    {
      category: "Science & Technology",
      interests: ["Robotics", "Coding", "Astronomy", "Biology", "Chemistry", "Physics", "Inventions", "Space"]
    },
    {
      category: "Books & Learning",
      interests: ["Comics", "Adventure Books", "Science Fiction", "Fantasy", "Mystery", "History", "Geography", "Math"]
    },
    {
      category: "Nature & Outdoors",
      interests: ["Gardening", "Bird Watching", "Camping", "Hiking", "Animals", "Plants", "Weather", "Environment"]
    },
    {
      category: "Other Hobbies",
      interests: ["Cooking", "Baking", "Collecting", "Puzzles", "Magic", "Martial Arts", "Yoga", "Meditation"]
    }
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      onChange(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length < 5) { // Limit to 5 interests
        onChange([...selectedInterests, interest]);
      }
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          Interests (Select up to 5) *
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearAll}
          disabled={selectedInterests.length === 0}
        >
          Clear All
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedInterests.map((interest) => (
          <Badge
            key={interest}
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80"
            onClick={() => toggleInterest(interest)}
          >
            {interest} ×
          </Badge>
        ))}
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {interestCategories.map((category) => (
          <div key={category.category} className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              {category.category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {category.interests.map((interest) => (
                <Button
                  key={interest}
                  type="button"
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleInterest(interest)}
                  disabled={!selectedInterests.includes(interest) && selectedInterests.length >= 5}
                  className="text-xs"
                >
                  {interest}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedInterests.length >= 5 && (
        <p className="text-sm text-muted-foreground">
          You've selected the maximum of 5 interests. Deselect some to choose others.
        </p>
      )}

      {errors.interests && <p className="text-sm text-destructive">{errors.interests}</p>}
    </div>
  );
};

export default InterestsPicker;