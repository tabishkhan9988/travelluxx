import React from "react";
import HeroSection from "./HeroSection";
import BookingCalculator from "./BookingCalculator";
import FleetCatalog from "./FleetCatalog";
import AirportsGrid from "./AirportsGrid";
import ContactForm from "./ContactForm";
import Footer from "./Footer";

interface RenaxLayoutProps {
  settings: any;
  calculatorPickup: string;
  calculatorDropoff: string;
  setCalculatorPickup: (v: string) => void;
  setCalculatorDropoff: (v: string) => void;
  handleScrollTo: (elementId: string) => void;
  handleSelectTransferPreset: (pickup: string, dropoff: string) => void;
  handleSelectClassPreset: (carClass: "Economy" | "Luxury" | "Family") => void;
}

export default function RenaxLayout({
  settings,
  calculatorPickup,
  calculatorDropoff,
  setCalculatorPickup,
  setCalculatorDropoff,
  handleScrollTo,
  handleSelectTransferPreset,
  handleSelectClassPreset
}: RenaxLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0c0d12] text-slate-100 flex flex-col selection:bg-emerald-600 selection:text-white font-sans antialiased">
      <main className="flex-grow">
        {/* Renax Inspired Dark Luxury Hero */}
        <HeroSection 
          onScrollToCalculator={() => handleScrollTo("calculator")} 
          settings={settings}
        />

        {/* Renax Booking Calculator Segment Wrapper */}
        <div id="calculator-section" className="relative z-20 -mt-16 max-w-6xl mx-auto px-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10">
            <div className="text-center mb-8">
              <span className="text-emerald-400 font-sans text-xs tracking-widest uppercase font-bold">Luxury Ride</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight mt-1">Book Your Chauffeur Transfer</h2>
            </div>
            <BookingCalculator
              initialPickup={calculatorPickup}
              initialDropoff={calculatorDropoff}
              settings={settings}
            />
          </div>
        </div>

        {/* Luxury fleet details inside dark layout */}
        <div className="bg-[#0c0d12] pt-20">
          <FleetCatalog onSelectClass={handleSelectClassPreset} />
        </div>

        {/* Airport Grid Transfer Options */}
        <div className="bg-[#0a0b0e] py-20 border-t border-slate-900">
          <AirportsGrid onSelectTransfer={handleSelectTransferPreset} />
        </div>

        {/* Renax styled Dark Contact Form container */}
        <div className="bg-[#12141c] py-20 border-t border-slate-900">
          <div className="max-w-4xl mx-auto px-4">
            <ContactForm settings={settings} />
          </div>
        </div>

        {/* Main site Footer */}
        <Footer
          onScrollTo={handleScrollTo}
          settings={settings}
        />
      </main>
    </div>
  );
}
