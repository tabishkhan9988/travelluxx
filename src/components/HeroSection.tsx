import React, { useState, useEffect } from "react";
import { Compass, Phone, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import heroImg from "../assets/images/hero_background_1786403449488.jpg";
import { getCustomImage } from "../utils/customImages";

interface HeroSectionProps {
  onScrollToCalculator: () => void;
  settings?: any;
}

const FALLBACK_HERO_URL = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1920&q=80";

export default function HeroSection({ onScrollToCalculator, settings }: HeroSectionProps) {
  const brandName = settings?.business_name || settings?.businessName || "Travelluxx";
  const whatsappNum = settings?.whatsapp_number || "441217140876";

  const getInitialBg = () => {
    const customSetting = settings?.hero_image || settings?.heroImage;
    const defaultImg = (customSetting && typeof customSetting === "string" && customSetting.trim() !== "") ? customSetting : heroImg;
    return getCustomImage("hero_bg", defaultImg);
  };

  const [bgImage, setBgImage] = useState<string>(getInitialBg);

  useEffect(() => {
    const handleUpdate = () => {
      const customSetting = settings?.hero_image || settings?.heroImage;
      const defaultImg = (customSetting && typeof customSetting === "string" && customSetting.trim() !== "") ? customSetting : heroImg;
      setBgImage(getCustomImage("hero_bg", defaultImg));
    };

    handleUpdate();
    window.addEventListener("custom_images_updated", handleUpdate);
    return () => window.removeEventListener("custom_images_updated", handleUpdate);
  }, [settings]);

  // Format WhatsApp / Phone number for presentation
  const formattedPhone = whatsappNum.startsWith("44") 
    ? `+44 ${whatsappNum.substring(2, 6)} ${whatsappNum.substring(6)}` 
    : whatsappNum;

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-24 overflow-hidden bg-slate-950">
      
      {/* Background image of luxury car cruising along scenic route */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <img
          src={bgImage}
          alt={`${brandName} Luxury Banner`}
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onError={() => {
            if (bgImage !== heroImg) {
              setBgImage(heroImg);
            } else if (bgImage !== FALLBACK_HERO_URL) {
              setBgImage(FALLBACK_HERO_URL);
            }
          }}
          className="w-full h-full object-cover opacity-50 scale-105"
        />
        {/* Deep, premium dark radial overlay for premium branding & maximum text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/30 to-slate-950/90"></div>
        <div className="absolute inset-0 bg-slate-950/15"></div>
      </div>

      {/* Main Content (Centered & Single Column) */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center space-y-10">
        
        {/* Premium Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 px-5 py-2.5 rounded-full text-xs font-sans text-emerald-300 font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{brandName.toUpperCase()} PRIVATE HIRE</span>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-6">
          <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-tight">
            Nationwide Airport <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 drop-shadow-sm">
              Transfers & Private Hire
            </span>
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-sm sm:text-base lg:text-xl leading-relaxed max-w-2xl mx-auto">
            Experience premium private hire. Beautifully styled Mercedes-Benz and Audi luxury fleets for your ultimate comfort. Secure fixed rates with absolutely no surge pricing.
          </p>
        </div>

        {/* Micro value tags */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-300 border-t border-slate-800 pt-8 max-w-xl mx-auto">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">Licensed Professional Operators</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <Compass className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">Guaranteed Nationwide Coverage</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <button
            onClick={onScrollToCalculator}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 cursor-pointer border border-emerald-500/20 group transform active:scale-95"
          >
            <span>Calculate & Get Quote</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href={`tel:${whatsappNum}`}
            className="flex items-center justify-center space-x-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white px-8 py-4 rounded-xl text-sm font-semibold transition shadow-sm font-sans backdrop-blur-sm transform active:scale-95"
          >
            <Phone className="w-4 h-4 fill-white text-emerald-400" />
            <span>{formattedPhone}</span>
          </a>
        </div>

      </div>

    </section>
  );
}
