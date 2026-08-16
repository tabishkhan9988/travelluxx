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
    const customSetting = settings?.logo_url || settings?.logo_image || settings?.logoImage;
    const defaultImg = (customSetting && typeof customSetting === "string" && customSetting.trim() !== "") ? customSetting : travelluxxLogo;
    return getCustomImage("logo", defaultImg);
  };

  const [brandLogo, setBrandLogo] = useState<string>(getInitialLogo);

  useEffect(() => {
    const handleUpdate = () => {
      const customSetting = settings?.logo_url || settings?.logo_image || settings?.logoImage;
      const defaultImg = (customSetting && typeof customSetting === "string" && customSetting.trim() !== "") ? customSetting : travelluxxLogo;
      setBrandLogo(getCustomImage("logo", defaultImg));
    };

    handleUpdate();
    window.addEventListener("custom_images_updated", handleUpdate);
    return () => window.removeEventListener("custom_images_updated", handleUpdate);
  }, [settings]);

  const [menuItems, setMenuItems] = useState<any[]>([
    { id: "1", label: "Book Now", href: "/#calculator", target: "_self" },
    { id: "2", label: "Blog", href: "/blog", target: "_self" },
    { id: "3", label: "Contact", href: "/#contact", target: "_self" }
  ]);

  useEffect(() => {
    fetch("/api/menu")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMenuItems(data);
        }
      })
      .catch(err => console.error("Failed to load menu:", err));
  }, []);

  const isRenax = settings?.active_theme === "renax";

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md transition-all duration-300 ${
      isRenax 
        ? "bg-[#0c0d12]/95 border-b border-slate-800/80 shadow-md text-white font-['Outfit']" 
        : "bg-white/95 border-b border-slate-200/80 shadow-sm font-sans"
    }`}>
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
              <span className={`font-extrabold text-2xl sm:text-[28px] tracking-tight block leading-tight ${
                isRenax ? "text-white font-bold" : "text-slate-900 font-sans"
              }`}>
                {brandName}
              </span>
              <span className={`text-[11px] sm:text-[12px] tracking-[0.18em] block font-bold uppercase mt-0.5 leading-none ${
                isRenax ? "text-emerald-400" : "text-emerald-600 font-sans"
              }`}>
                - PRIVATE HIRE -
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-bold">
            {menuItems.map((item) => {
              const isAnchor = item.href.startsWith("/#") || item.href.startsWith("#");
              const sectionId = isAnchor ? item.href.split("#")[1] : "";
              
              if (isAnchor && sectionId) {
                return (
                  <button 
                    key={item.id}
                    onClick={() => onScrollTo(sectionId)} 
                    className={`transition cursor-pointer font-bold tracking-wide ${
                      isRenax ? "text-slate-200 hover:text-emerald-400" : "text-slate-700 hover:text-emerald-600"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <a 
                  key={item.id}
                  href={item.href} 
                  target={item.target || "_self"}
                  className={`transition cursor-pointer font-bold tracking-wide ${
                    isRenax ? "text-slate-200 hover:text-emerald-400" : "text-slate-700 hover:text-emerald-600"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 transition focus:outline-none ${
                isRenax ? "text-white hover:text-emerald-400" : "text-slate-800 hover:text-emerald-600"
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={`md:hidden border-t py-4 px-6 shadow-lg ${
          isRenax ? "bg-[#12141c] border-slate-800 text-white font-['Outfit']" : "bg-white border-slate-150 text-slate-800"
        }`}>
          <div className="flex flex-col space-y-3">
            {menuItems.map((item) => {
              const isAnchor = item.href.startsWith("/#") || item.href.startsWith("#");
              const sectionId = isAnchor ? item.href.split("#")[1] : "";
              
              if (isAnchor && sectionId) {
                return (
                  <button 
                    key={item.id}
                    onClick={() => {
                      onScrollTo(sectionId);
                      setIsOpen(false);
                    }}
                    className={`text-left font-bold py-2 transition cursor-pointer text-sm ${
                      isRenax ? "text-slate-200 hover:text-emerald-400" : "text-slate-800 hover:text-emerald-600"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <a 
                  key={item.id}
                  href={item.href}
                  target={item.target || "_self"}
                  className={`text-left font-bold py-2 transition cursor-pointer text-sm ${
                    isRenax ? "text-slate-200 hover:text-emerald-400" : "text-slate-800 hover:text-emerald-600"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
