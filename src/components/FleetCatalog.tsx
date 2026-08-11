import React, { useState, useEffect } from "react";
import { 
  Users, 
  Briefcase, 
  Compass, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Car, 
  Wifi, 
  Wind, 
  BatteryCharging, 
  Droplet, 
  Tv, 
  Volume2, 
  Shield, 
  Layers, 
  Sparkles,
  Smartphone,
  BookOpen,
  ArrowRight
} from "lucide-react";

import mercedesEconomyImg from "../assets/images/fleet_economy_1786403470397.jpg";
import mercedesLuxuryImg from "../assets/images/fleet_luxury_1786403483244.jpg";
import mercedesFamilyImg from "../assets/images/fleet_family_1786403496325.jpg";
import { getCustomImage } from "../utils/customImages";

interface FleetCatalogProps {
  onSelectClass: (carClass: "Economy" | "Luxury" | "Family") => void;
}

export default function FleetCatalog({ onSelectClass }: FleetCatalogProps) {
  const [activeTab, setActiveTab] = React.useState<"Economy" | "Luxury" | "Family">("Luxury");
  const [pricing, setPricing] = React.useState<any>(null);
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setRefreshKey(prev => prev + 1);
    window.addEventListener("custom_images_updated", handleUpdate);
    return () => window.removeEventListener("custom_images_updated", handleUpdate);
  }, []);

  React.useEffect(() => {
    fetch("/api/pricing")
      .then(res => res.json())
      .then(data => setPricing(data))
      .catch(err => console.error("Failed to fetch fleet pricing:", err));
  }, []);

  const fleet = {
    Economy: {
      name: "Business Economy Class",
      tagline: "Elegant, clean, and highly efficient travel.",
      image: getCustomImage("fleet_Economy", mercedesEconomyImg),
      rate: pricing?.Economy?.perMile !== undefined ? `£${Number(pricing.Economy.perMile).toFixed(2)}` : "£1.50",
      description: "Perfect for business commuters, solo travellers, or quick transfers. Featuring modern executive comfort with absolute fuel efficiency.",
      cars: ["Tesla Model 3", "Audi A4 Executive", "Mercedes C-Class"],
      features: ["Complimentary 4G Wi-Fi", "Dual-zone Climate Control", "USB Charging Ports", "Bottle Holders & Newspapers"]
    },
    Luxury: {
      name: "First Class Luxury Chauffeur",
      tagline: "The pinnacle of executive comfort and style.",
      image: getCustomImage("fleet_Luxury", mercedesLuxuryImg),
      rate: pricing?.Luxury?.perMile !== undefined ? `£${Number(pricing.Luxury.perMile).toFixed(2)}` : "£2.00",
      description: "Experience VIP travel. Whether it's high-profile business meetings, weddings, or an ultra-comfort ride to Heathrow. Settle into reclining leather chairs.",
      cars: ["Mercedes-Benz S-Class", "Audi A8 L", "Jaguar XJ Luxury"],
      features: ["Premium Leather Reclining Seats", "Complimentary Bottled Water", "Ambient Lighting Controls", "Rear Seat Entertainment Systems", "Quiet Acoustic Cabins"]
    },
    Family: {
      name: "Family & Executive MPV",
      tagline: "Generous space for luggage and loved ones.",
      image: getCustomImage("fleet_Family", mercedesFamilyImg),
      rate: pricing?.Family?.perMile !== undefined ? `£${Number(pricing.Family.perMile).toFixed(2)}` : "£2.50",
      description: "Ideal for family vacations, groups, or high-volume luggage transfers. Spacious seating configuration ensures passengers can converse in absolute comfort.",
      cars: ["Mercedes-Benz V-Class", "Audi Q7 S-Line", "Volkswagen Caravelle Executive"],
      features: ["Conference Seating Options", "Massive Boot Capacity", "Automatic Sliding Doors", "Privacy Glass", "Individual Air-Con Units", "Child Seats Available (On Request)"]
    }
  };

  const selectedClass = fleet[activeTab];

  // Map amenity text to relevant premium icons
  const getAmenityIcon = (feature: string) => {
    const f = feature.toLowerCase();
    if (f.includes("wi-fi") || f.includes("wifi")) return <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (f.includes("climate") || f.includes("air-con") || f.includes("air conditioning")) return <Wind className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (f.includes("charging") || f.includes("usb")) return <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (f.includes("water") || f.includes("bottle")) return <Droplet className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (f.includes("entertainment") || f.includes("tv")) return <Tv className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (f.includes("quiet") || f.includes("acoustic")) return <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (f.includes("leather") || f.includes("seat") || f.includes("reclining")) return <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (f.includes("newspaper") || f.includes("book")) return <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (f.includes("privacy") || f.includes("glass")) return <Shield className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (f.includes("boot") || f.includes("capacity")) return <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (f.includes("door")) return <Layers className="w-4 h-4 text-emerald-600 shrink-0" />;
    return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
  };

  return (
    <section id="fleet" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-700 font-sans text-xs tracking-widest uppercase block mb-3 font-bold">Our Premium Fleet</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight mb-4">
            Travel in Premium Comfort
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Our curated fleet features state-of-the-art Mercedes-Benz and Audi luxury models, rigorously maintained to the highest safety and cosmetic standards for nationwide transfers.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex space-x-1 sm:space-x-2 shadow-sm">
            {(Object.keys(fleet) as Array<"Economy" | "Luxury" | "Family">).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab === "Family" ? "Family / MPV" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white border border-slate-200/80 p-8 sm:p-12 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">
          
          {/* Left Block - Image */}
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden aspect-video lg:aspect-[4/3] group border border-slate-200/60 shadow-sm bg-slate-100">
            <img
              src={selectedClass.image}
              alt={selectedClass.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                const fallbacks: Record<string, string> = {
                  Economy: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
                  Luxury: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
                  Family: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80"
                };
                const fb = fallbacks[activeTab] || fallbacks.Luxury;
                if (target.src !== fb) {
                  target.src = fb;
                }
              }}
            />
            {/* Ambient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
          </div>

          {/* Right Block - Features & Specifications */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
                {selectedClass.name}
              </h3>
              <p className="text-emerald-700 font-semibold text-xs sm:text-sm">{selectedClass.tagline}</p>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {selectedClass.description}
            </p>

            {/* Key Luxury Amenities Grid */}
            <div className="space-y-3.5 border-t border-slate-100 pt-5">
              <h4 className="text-xs font-sans text-slate-400 uppercase tracking-widest font-bold">Included On-Board Amenities:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedClass.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2.5 text-sm text-slate-600 font-medium">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100/50 flex items-center justify-center shrink-0">
                      {getAmenityIcon(feat)}
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Select class and scroll to calculator button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => onSelectClass(activeTab)}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-bold px-6 py-4 rounded-xl text-sm transition-all shadow-md shadow-emerald-700/10 cursor-pointer flex justify-center items-center space-x-2"
              >
                <span>Book This Class Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
