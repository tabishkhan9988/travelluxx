import React, { useState, useEffect } from "react";
import { Plane } from "lucide-react";

import airportTransfersImg from "../assets/images/transfer_airport_1786403518712.jpg";
import portTransfersImg from "../assets/images/transfer_port_1786403532912.jpg";
import stationTransfersImg from "../assets/images/transfer_station_1786403548164.jpg";
import popularCitiesImg from "../assets/images/transfer_city_1786403562698.jpg";
import businessTravelImg from "../assets/images/transfer_business_1786403576291.jpg";
import { getCustomImage } from "../utils/customImages";

interface AirportsGridProps {
  onSelectTransfer: (pickup: string, dropoff: string) => void;
}

export default function AirportsGrid({ onSelectTransfer }: AirportsGridProps) {
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setRefreshKey(prev => prev + 1);
    window.addEventListener("custom_images_updated", handleUpdate);
    return () => window.removeEventListener("custom_images_updated", handleUpdate);
  }, []);

  const airports = [
    { name: "Heathrow", code: "LHR", fullName: "London Heathrow Airport (LHR)" },
    { name: "Gatwick", code: "LGW", fullName: "London Gatwick Airport (LGW)" },
    { name: "Luton", code: "LTN", fullName: "London Luton Airport (LTN)" },
    { name: "Stansted", code: "STN", fullName: "London Stansted Airport (STN)" },
    { name: "London City", code: "LCY", fullName: "London City Airport (LCY)" },
    { name: "Southend", code: "SEN", fullName: "Southend Airport" }
  ];

  const services = [
    {
      id: "airport",
      title: "Airport Transfers",
      description: "Reliable private transfers to Heathrow, Gatwick, and all major UK airports.",
      image: getCustomImage("transfer_airport", airportTransfersImg),
      pickup: "Shirley, Solihull B90",
      dropoff: "London Heathrow Airport (LHR)"
    },
    {
      id: "port",
      title: "Port Transfers",
      description: "Reliable transfers to and from all major UK ports and cruise terminals.",
      image: getCustomImage("transfer_port", portTransfersImg),
      pickup: "Shirley, Solihull B90",
      dropoff: "Southampton Cruise Port"
    },
    {
      id: "station",
      title: "Station Transfers",
      description: "Seamless transfers to and from rail stations across London and the UK.",
      image: getCustomImage("transfer_station", stationTransfersImg),
      pickup: "Shirley, Solihull B90",
      dropoff: "London Euston Station"
    },
    {
      id: "city",
      title: "Popular Cities",
      description: "Travel to all major cities across the UK in comfort and style.",
      image: getCustomImage("transfer_city", popularCitiesImg),
      pickup: "Shirley, Solihull B90",
      dropoff: "London Central, UK"
    },
    {
      id: "business",
      title: "Business Travel",
      description: "Executive travel solutions tailored for business and professionals.",
      image: getCustomImage("transfer_business", businessTravelImg),
      pickup: "Shirley, Solihull B90",
      dropoff: "Birmingham Airport (BHX)"
    }
  ];

  return (
    <section id="airports" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            We cover all major London airports
          </h2>
        </div>

        {/* Airport Taxi Row (6 columns) */}
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm mb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-slate-200">
            {airports.map((airport, idx) => (
              <div
                key={airport.code}
                className={`py-8 px-4 text-center ${
                  idx >= 3 ? "sm:border-t-0" : ""
                }`}
              >
                <div className="mb-3 flex justify-center">
                  <Plane className="w-6 h-6 text-slate-700" />
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {airport.name}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Airport Taxi
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Cards Grid (5 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              {/* Image box */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80";
                    if (target.src !== fallback) {
                      target.src = fallback;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent" />
              </div>

              {/* Text content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    {service.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
