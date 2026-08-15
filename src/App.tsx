import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import BookingCalculator from "./components/BookingCalculator";
import FleetCatalog from "./components/FleetCatalog";
import AirportsGrid from "./components/AirportsGrid";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";
import AdminDashboard from "./pages/AdminDashboard";
import BlogList from "./pages/BlogList";
import BlogPostDetail from "./pages/BlogPostDetail";
import DynamicPage from "./pages/DynamicPage";
import { trackVisit, trackClick } from "./utils/analytics";



// PUBLIC LANDING PAGE WRAPPER
function PublicLandingPage() {
  // Shared state to allow prefilling the booking calculator
  const [calculatorPickup, setCalculatorPickup] = useState("");
  const [calculatorDropoff, setCalculatorDropoff] = useState("");
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    trackVisit();
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Failed to load settings:", err));
  }, []);

  // Smooth scroll handler
  const handleScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Prefill handler triggered when booking short-cuts are selected
  const handleSelectTransferPreset = (pickup: string, dropoff: string) => {
    setCalculatorPickup(pickup);
    setCalculatorDropoff(dropoff);
    handleScrollTo("calculator");
  };

  // Prefill class handler
  const handleSelectClassPreset = (carClass: "Economy" | "Luxury" | "Family") => {
    setCalculatorPickup("Shirley, Solihull B90");
    setCalculatorDropoff("London Heathrow Airport (LHR)");
    handleScrollTo("calculator");
  };

  const handleUpdateSettings = (newSettings: any) => {
    setSettings(newSettings);
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#047857] text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Loading Travelluxx...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col selection:bg-emerald-600 selection:text-white font-sans">
      <Navbar
        onScrollTo={handleScrollTo}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <main className="flex-grow">
        <HeroSection 
          onScrollToCalculator={() => handleScrollTo("calculator")} 
          settings={settings}
        />

        <BookingCalculator
          initialPickup={calculatorPickup}
          initialDropoff={calculatorDropoff}
          settings={settings}
        />

        <FleetCatalog onSelectClass={handleSelectClassPreset} />

        <AirportsGrid onSelectTransfer={handleSelectTransferPreset} />

        <ContactForm settings={settings} />

        <Footer
          onScrollTo={handleScrollTo}
          settings={settings}
        />
      </main>

      {/* Floating WhatsApp Widget */}
      <a
        href="https://wa.me/441217140876?text=Hi,%20I'm%20on%20your%20website%20and%20would%20like%20to%20arrange%20a%20chauffeur."
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick("whatsapp_hotline")}
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group border border-emerald-500/20 flex items-center justify-center"
        title="Instant WhatsApp Hotline"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
        </svg>
        <span className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-white border border-slate-200 text-emerald-700 text-[10px] font-sans font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 shadow-md transition duration-300 pointer-events-none whitespace-nowrap">
          WhatsApp Hotline
        </span>
      </a>
    </div>
  );
}

// MAIN APP ROUTER ENTRY POINT
export default function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC HOMEPAGE */}
        <Route path="/" element={<PublicLandingPage />} />
        
        {/* ADMIN DASHBOARD */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* BLOG PAGES */}
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPostDetail />} />

        {/* DYNAMIC CMS PAGES */}
        <Route path="/page/:slug" element={<DynamicPage />} />

        {/* FALLBACK REDIRECTS TO PUBLIC WEBSITE */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

