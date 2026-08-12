import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Compass, Shield, Menu, X } from "lucide-react";
import travelluxxLogo from "../assets/images/travelluxx_logo_1786403432815.jpg";
import { trackClick } from "../utils/analytics";
import { getCustomImage } from "../utils/customImages";

interface NavbarProps {
  onScrollTo: (elementId: string) => void;
  onAdminClick?: () => void;
  settings?: any;
  onUpdateSettings?: (newSettings: any) => void;
}

export default function Navbar({ onScrollTo, onAdminClick, settings }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const brandName = settings?.business_name || settings?.businessName || "Travelluxx";

  const getInitialLogo = () => {
    const customSetting = settings?.logo_image || settings?.logoImage;
    const defaultImg = (customSetting && typeof customSetting === "string" && customSetting.trim() !== "") ? customSetting : travelluxxLogo;
    return getCustomImage("logo", defaultImg);
  };

  const [brandLogo, setBrandLogo] = useState<string>(getInitialLogo);

  useEffect(() => {
    const handleUpdate = () => {
      const customSetting = settings?.logo_image || settings?.logoImage;
      const defaultImg = (customSetting && typeof customSetting === "string" && customSetting.trim() !== "") ? customSetting : travelluxxLogo;
      setBrandLogo(getCustomImage("logo", defaultImg));
    };

    handleUpdate();
    window.addEventListener("custom_images_updated", handleUpdate);
    return () => window.removeEventListener("custom_images_updated", handleUpdate);
  }, [settings]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 group/logo relative">
            <div className="relative flex items-center justify-center shrink-0 cursor-pointer" onClick={() => onScrollTo("hero")}>
              <img
                src={brandLogo}
                alt={`${brandName} Logo`}
                width={72}
                height={72}
                decoding="async"
                className="w-16 h-16 sm:w-[72px] sm:h-[72px] object-contain transition-transform duration-300 group-hover/logo:scale-105"
                referrerPolicy="no-referrer"
                onError={() => {
                  if (brandLogo !== travelluxxLogo) {
                    setBrandLogo(travelluxxLogo);
                  }
                }}
              />
            </div>
            
            <div className="flex flex-col justify-center select-none cursor-pointer" onClick={() => onScrollTo("hero")}>
              <span className="font-sans font-extrabold text-2xl sm:text-[28px] tracking-tight text-slate-900 block leading-tight">
                {brandName}
              </span>
              <span className="font-sans text-[11px] sm:text-[12px] tracking-[0.18em] text-emerald-600 block font-bold uppercase mt-0.5 leading-none">
                - PRIVATE HIRE -
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-bold">
            <button 
              onClick={() => onScrollTo("calculator")} 
              className="text-slate-700 hover:text-emerald-600 transition cursor-pointer font-bold tracking-wide"
            >
              Book Now
            </button>
            <a 
              href="/blog" 
              className="text-slate-700 hover:text-emerald-600 transition cursor-pointer font-bold tracking-wide"
            >
              Blog
            </a>
            <button 
              onClick={() => onScrollTo("contact")} 
              className="text-slate-700 hover:text-emerald-600 transition cursor-pointer font-bold tracking-wide"
            >
              Contact
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-800 hover:text-emerald-600 transition focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-150 py-4 px-6 space-y-4 shadow-lg">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                onScrollTo("calculator");
                setIsOpen(false);
              }}
              className="text-left text-slate-800 hover:text-emerald-600 font-bold py-2 transition cursor-pointer text-sm"
            >
              Book Now
            </button>
            <button
              onClick={() => {
                onScrollTo("contact");
                setIsOpen(false);
              }}
              className="text-left text-slate-800 hover:text-emerald-600 font-bold py-2 transition cursor-pointer text-sm"
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
