import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";

interface FooterProps {
  onScrollTo: (elementId: string) => void;
  onAdminClick?: () => void;
  settings?: any;
}

export default function Footer({ onScrollTo, onAdminClick, settings }: FooterProps) {
  const brandName = settings?.business_name || settings?.businessName || "Travelluxx";
  const whatsappNum = settings?.whatsapp_number || "441217140876";
  const emailAddr = settings?.business_email || "info@travelluxx.co.uk";
  const officeAddr = settings?.office_address || "Shirley B90 Shirley, Solihull, West Midlands, UK";
  const footerText = settings?.footer_info || settings?.footerInfo || `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`;

  const isRenax = settings?.active_theme === "renax";

  const formattedPhone = whatsappNum.startsWith("44") 
    ? `+44 ${whatsappNum.substring(2, 6)} ${whatsappNum.substring(6)}` 
    : whatsappNum;

  return (
    <footer className={`pt-16 pb-8 text-slate-400 ${
      isRenax ? "bg-[#08080a] border-t border-slate-900 font-['Outfit']" : "bg-slate-950 border-t border-slate-900 font-sans"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Highlights Box for Renax */}
        {isRenax && (
          <div className="bg-[#0e1017] border border-slate-800/60 rounded-2xl p-6 mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center space-x-4 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Call Us</p>
                <p className="text-sm font-bold text-white mt-0.5">{formattedPhone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 justify-center md:justify-start border-t border-b md:border-t-0 md:border-b-0 border-slate-800/60 py-4 md:py-0 md:px-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="truncate">
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Write to Us</p>
                <p className="text-sm font-bold text-white mt-0.5 truncate">{emailAddr}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 justify-center md:justify-start md:pl-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Address</p>
                <p className="text-sm font-bold text-white mt-0.5 line-clamp-1">{officeAddr}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Elite Driver Recruitment Banner */}
        <div className={`rounded-3xl p-6 sm:p-8 mb-12 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden group ${
          isRenax ? "bg-[#0e0f16] border border-slate-800/60" : "bg-slate-900/60 border border-slate-800/80"
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
          <div className="space-y-2 text-center md:text-left relative z-10">
            <h3 className="font-display font-bold text-lg md:text-xl text-white tracking-tight">
              Are You a Professional Driver?
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              Join our elite team of licensed professional chauffeurs. We are always looking for reliable, well-presented drivers with modern executive vehicles to partner with us for premium nationwide transfers.
            </p>
          </div>
          <a
            href={`https://wa.me/${whatsappNum}?text=Hi,%20I'm%20a%20licensed%20private%20hire%20driver%20and%20would%20like%20to%20apply%20to%20partner%20with%20${encodeURIComponent(brandName)}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/25 hover:-translate-y-0.5 shrink-0 text-center cursor-pointer w-full md:w-auto relative z-10"
          >
            Contact Us to Join
          </a>
        </div>

        {/* Footnote */}
        <div className={`pt-8 border-t flex justify-center items-center text-xs font-medium text-center ${
          isRenax ? "border-slate-900 text-slate-500" : "border-slate-900 text-slate-500"
        }`}>
          <p>
            © 2026 Travelluxx. All rights reserved - Develop & Managed By{" "}
            <a
              href="https://techfnm.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline font-semibold"
            >
              Tech FNM
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
