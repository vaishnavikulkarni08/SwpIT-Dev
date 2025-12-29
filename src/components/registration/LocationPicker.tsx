import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LocationPickerProps {
  state: string;
  city: string;
  pincode: string;
  sector: string;
  colony: string;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

const LocationPicker = ({ state, city, pincode, sector, colony, onChange, errors }: LocationPickerProps) => {
  // Mock data for Indian states and cities
  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
  ];

  const citiesByState: Record<string, string[]> = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad"],
    "Delhi": ["New Delhi", "Delhi"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur"],
    // Add more cities as needed
  };

  const availableCities = state ? citiesByState[state] || [] : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Select value={state} onValueChange={(value) => onChange("state", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((stateName) => (
                <SelectItem key={stateName} value={stateName}>
                  {stateName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Select
            value={city}
            onValueChange={(value) => onChange("city", value)}
            disabled={!state}
          >
            <SelectTrigger>
              <SelectValue placeholder={state ? "Select your city" : "Select state first"} />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((cityName) => (
                <SelectItem key={cityName} value={cityName}>
                  {cityName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            placeholder="110001"
            value={pincode}
            onChange={(e) => onChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sector">Sector / Block</Label>
          <Input
            id="sector"
            placeholder="Sector 15"
            value={sector}
            onChange={(e) => onChange("sector", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="colony">Colony / Area</Label>
          <Input
            id="colony"
            placeholder="Green Valley"
            value={colony}
            onChange={(e) => onChange("colony", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;