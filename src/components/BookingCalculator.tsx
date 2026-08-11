import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, Plane, ArrowRight, Calendar, Clock, Users, Briefcase, 
  CreditCard, ShieldCheck, Compass, Check, AlertCircle, Phone, 
  HelpCircle, Sparkles, Receipt, Landmark, Activity, Car, AlertTriangle,
  Trash2, ArrowLeft, ArrowUp, ArrowDown, Plus, Navigation, Coins
} from "lucide-react";
import { DistanceResult } from "../types";
import { trackClick } from "../utils/analytics";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import GoogleBookingMap from "./GoogleBookingMap";

interface BookingCalculatorProps {
  initialPickup?: string;
  initialDropoff?: string;
  settings?: any;
}

interface RouteStreet {
  name: string;
  condition: "flowing" | "moderate" | "congested";
  speed: string;
  delay: string;
  remark: string;
  length: string;
}

const UK_LOCATIONS: { [key: string]: { lat: number; lng: number; name: string } } = {
  "shirley": { lat: 52.4140, lng: -1.8150, name: "Shirley, Solihull B90" },
  "solihull": { lat: 52.4135, lng: -1.7780, name: "Solihull, West Midlands" },
  "birmingham": { lat: 52.4862, lng: -1.8904, name: "Birmingham, West Midlands" },
  "bhx": { lat: 52.4539, lng: -1.7481, name: "Birmingham Airport (BHX)" },
  "lhr": { lat: 51.4700, lng: -0.4543, name: "London Heathrow Airport (LHR)" },
  "heathrow": { lat: 51.4700, lng: -0.4543, name: "London Heathrow Airport (LHR)" },
  "lgw": { lat: 51.1537, lng: -0.1821, name: "London Gatwick Airport (LGW)" },
  "gatwick": { lat: 51.1537, lng: -0.1821, name: "London Gatwick Airport (LGW)" },
  "man": { lat: 53.3588, lng: -2.2727, name: "Manchester Airport (MAN)" },
  "manchester": { lat: 53.3588, lng: -2.2727, name: "Manchester Airport (MAN)" },
  "ema": { lat: 52.8311, lng: -1.3280, name: "East Midlands Airport (EMA)" },
  "stn": { lat: 51.8860, lng: 0.2389, name: "London Stansted Airport (STN)" },
  "stansted": { lat: 51.8860, lng: 0.2389, name: "London Stansted Airport (STN)" },
  "ltn": { lat: 51.8763, lng: -0.3717, name: "London Luton Airport (LTN)" },
  "luton": { lat: 51.8763, lng: -0.3717, name: "London Luton Airport (LTN)" },
  "lcy": { lat: 51.5048, lng: 0.0495, name: "London City Airport (LCY)" },
  "london": { lat: 51.5074, lng: -0.1278, name: "London Central, UK" }
};

  const getRouteTrafficBreakdown = (pickup: string, dropoff: string, distance: number): RouteStreet[] => {
  const pLower = (pickup || "").toLowerCase();
  const dLower = (dropoff || "").toLowerCase();
  
  const streets: RouteStreet[] = [];
  
  // 1. Initial departure road
  if (pLower.includes("shirley")) {
    streets.push({
      name: "A34 Stratford Road (Shirley)",
      condition: "moderate",
      speed: "22 mph",
      delay: "2 mins",
      remark: "Slight local retail queue",
      length: "1.8 miles"
    });
  } else if (pLower.includes("solihull")) {
    streets.push({
      name: "B4102 Solihull Bypass / High Street",
      condition: "flowing",
      speed: "35 mph",
      delay: "0 mins",
      remark: "Clear, normal moving",
      length: "1.5 miles"
    });
  } else if (pLower.includes("birmingham")) {
    streets.push({
      name: "A38(M) Aston Expressway",
      condition: "flowing",
      speed: "45 mph",
      delay: "0 mins",
      remark: "Optimal road flow",
      length: "2.4 miles"
    });
  } else {
    streets.push({
      name: "Local Departure Streets",
      condition: "flowing",
      speed: "25 mph",
      delay: "0 mins",
      remark: "Optimal low-speed flow",
      length: "1.2 miles"
    });
  }
  
  // 2. High-speed highway or major road
  if (distance > 15) {
    if (dLower.includes("lhr") || dLower.includes("heathrow") || dLower.includes("london") || dLower.includes("lgw") || dLower.includes("gatwick")) {
      streets.push({
        name: "M42 Southbound (J3 to J3A)",
        condition: "flowing",
        speed: "68 mph",
        delay: "0 mins",
        remark: "Clear high-speed cruising",
        length: "11.2 miles"
      });
      streets.push({
        name: "M40 Motorway Eastbound",
        condition: "moderate",
        speed: "52 mph",
        delay: "2 mins",
        remark: "Slight queue near roadworks zone",
        length: "42.5 miles"
      });
      if (dLower.includes("lhr") || dLower.includes("heathrow")) {
        streets.push({
          name: "M25 London Orbital (J15 Terminal approach)",
          condition: "congested",
          speed: "18 mph",
          delay: "4 mins",
          remark: "Heavy peak traffic near terminal junction",
          length: "4.8 miles"
        });
      } else if (dLower.includes("lgw") || dLower.includes("gatwick")) {
        streets.push({
          name: "M25 Orbital & M23 Spur Link",
          condition: "moderate",
          speed: "42 mph",
          delay: "3 mins",
          remark: "Slow traffic near junction exit",
          length: "14.8 miles"
        });
      } else {
        streets.push({
          name: "M25 Orbital & Greater London highways",
          condition: "congested",
          speed: "22 mph",
          delay: "8 mins",
          remark: "High traffic density on approach",
          length: "12.0 miles"
        });
      }
    } else if (dLower.includes("bhx") || dLower.includes("birmingham") || dLower.includes("airport")) {
      streets.push({
        name: "M42 Motorway Northbound (J4 to J6)",
        condition: "flowing",
        speed: "65 mph",
        delay: "0 mins",
        remark: "Perfect optimal speed limit cruising",
        length: "4.2 miles"
      });
      streets.push({
        name: "A45 Coventry Road (Airport flyover)",
        condition: "moderate",
        speed: "28 mph",
        delay: "2 mins",
        remark: "Brief delays near active airport approach",
        length: "1.4 miles"
      });
    } else {
      streets.push({
        name: "M42 / Regional Motorway Link",
        condition: "flowing",
        speed: "64 mph",
        delay: "0 mins",
        remark: "Optimal high-speed flow",
        length: `${(distance * 0.7).toFixed(1)} miles`
      });
    }
  } else {
    // Shorter distance local roads
    streets.push({
      name: "Solihull Ring Road & A41",
      condition: "flowing",
      speed: "35 mph",
      delay: "0 mins",
      remark: "Normal suburban street traffic",
      length: `${(distance * 0.6).toFixed(1)} miles`
    });
  }
  
  // 3. Final approach road
  if (dLower.includes("bhx") || dLower.includes("birmingham airport")) {
    streets.push({
      name: "Airport Terminal Way",
      condition: "moderate",
      speed: "15 mph",
      delay: "1 min",
      remark: "Drop-off bay lane queuing",
      length: "0.5 miles"
    });
  } else if (dLower.includes("lhr") || dLower.includes("heathrow")) {
    streets.push({
      name: "Heathrow Airport Terminal Link Tunnel",
      condition: "congested",
      speed: "12 mph",
      delay: "3 mins",
      remark: "Dense stop-go traffic near security terminal",
      length: "0.7 miles"
    });
  } else {
    streets.push({
      name: "Destination Terminal Access Roads",
      condition: "flowing",
      speed: "20 mph",
      delay: "0 mins",
      remark: "Direct drop-off access clear",
      length: "0.6 miles"
    });
  }
  
  return streets;
};

export default function BookingCalculator({ initialPickup = "", initialDropoff = "", settings }: BookingCalculatorProps) {
  const brandName = settings?.business_name || settings?.businessName || "Travelluxx";
  const whatsappNum = settings?.whatsapp_number || "441217140876";

  // Google Places search handled via Google AutocompleteService with OSM fallback
  const placesLibrary = useMapsLibrary("places");
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    if (placesLibrary) {
      try {
        setAutocompleteService(new google.maps.places.AutocompleteService());
      } catch (err) {
        // ignore
      }
    }
  }, [placesLibrary]);

  // Input states
  const [pickupInput, setPickupInput] = useState(initialPickup);
  const [dropoffInput, setDropoffInput] = useState(initialDropoff);
  const [pickupSuggestions, setPickupSuggestions] = useState<{ lat: number, lng: number, name: string }[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<{ lat: number, lng: number, name: string }[]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [distanceResult, setDistanceResult] = useState<DistanceResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Booking Flow Steps
  // Step 1: Input route and view pricing side-by-side
  // Step 2: Enter date, time and customer info
  // Step 3: Secure checkout (Stripe or PayPal)
  // Step 4: Finished/Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected vehicle option
  const [selectedVehicle, setSelectedVehicle] = useState<"Economy" | "Luxury" | "Family" | null>(null);

  // Passenger & Ride Detail states
  const [rideDate, setRideDate] = useState("");
  const [rideTime, setRideTime] = useState("");
  const [passengerName, setPassengerName] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [passengerAlternatePhone, setPassengerAlternatePhone] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [luggageCount, setLuggageCount] = useState(1);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"Mollie" | "Pay Later">("Mollie");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paypalSimulating, setPaypalSimulating] = useState(false);

  // Completed reservation details
  const [completedBookingId, setCompletedBookingId] = useState("");
  const [completedBookingPrice, setCompletedBookingPrice] = useState(0);
  const [trafficToggle, setTrafficToggle] = useState(true);

  // Map references and interactive click states
  const mapRef = useRef<any>(null);
  const marker1Ref = useRef<any>(null);
  const marker2Ref = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  const [mapClickMode, setMapClickMode] = useState<"pickup" | "dropoff">("pickup");
  const [customPickupCoords, setCustomPickupCoords] = useState<{lat: number, lng: number} | null>(null);
  const [customDropoffCoords, setCustomDropoffCoords] = useState<{lat: number, lng: number} | null>(null);

  const leftFormRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!leftFormRef.current) return;
    const updateHeight = () => {
      if (leftFormRef.current) {
        const h = leftFormRef.current.offsetHeight;
        if (h > 0) setFormHeight(h);
      }
    };
    updateHeight();
    const rafId = requestAnimationFrame(() => {
      updateHeight();
    });
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    resizeObserver.observe(leftFormRef.current);
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [currentStep, selectedVehicle, distanceResult, customPickupCoords, customDropoffCoords, paymentMethod]);

  const [stops, setStops] = useState<{ id: string; address: string; duration: number; waiting: number; lat?: number; lng?: number }[]>([]);
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);
  const [stopSuggestions, setStopSuggestions] = useState<{ lat: number, lng: number, name: string }[]>([]);

  const mapClickModeRef = useRef(mapClickMode);
  useEffect(() => {
    mapClickModeRef.current = mapClickMode;
  }, [mapClickMode]);

  const clearRoute = () => {
    setPickupInput("");
    setDropoffInput("");
    setCustomPickupCoords(null);
    setCustomDropoffCoords(null);
    setStops([]);
    setDistanceResult(null);
    setMapClickMode("pickup");
  };

  const handleAddStop = () => {
    setStops(prev => [
      ...prev,
      { id: Math.random().toString(), address: "", duration: 10, waiting: 5 }
    ]);
  };

  const handleRemoveStop = (index: number) => {
    setStops(prev => prev.filter((_, idx) => idx !== index));
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    setStops(prev => {
      const nextStops = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < nextStops.length) {
        const temp = nextStops[index];
        nextStops[index] = nextStops[targetIndex];
        nextStops[targetIndex] = temp;
      }
      return nextStops;
    });
  };

  const handleStopInputChange = async (index: number, value: string) => {
    setStops(prev => {
      const updated = [...prev];
      updated[index].address = value;
      return updated;
    });
    setActiveStopIndex(index);
    if (value.length > 2) {
      const suggs = await fetchSuggestions(value);
      setStopSuggestions(suggs);
    } else {
      setStopSuggestions([]);
    }
  };

  const handleSelectStopSuggestion = (index: number, sugg: { lat: number; lng: number; name: string }) => {
    setStops(prev => {
      const updated = [...prev];
      updated[index].address = sugg.name;
      updated[index].lat = sugg.lat;
      updated[index].lng = sugg.lng;
      return updated;
    });
    setStopSuggestions([]);
    setActiveStopIndex(null);
  };

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setPickupInput("Detecting location...");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setCustomPickupCoords({ lat, lng });
        
        let resolvedName = `Point on map (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'en' }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(',');
              resolvedName = parts.slice(0, 3).map((p: any) => p.trim()).join(', ');
            }
          }
        } catch (err) {
          console.warn("Geocoding failed for current location:", err);
        }
        
        setPickupInput(resolvedName);
        setMapClickMode("dropoff");
      },
      (error) => {
        console.error("Geolocation error:", error);
        setPickupInput("Location access denied or unavailable.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const useMyDropoffLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setDropoffInput("Detecting location...");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setCustomDropoffCoords({ lat, lng });
        
        let resolvedName = `Point on map (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'en' }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(',');
              resolvedName = parts.slice(0, 3).map((p: any) => p.trim()).join(', ');
            }
          }
        } catch (err) {
          console.warn("Geocoding failed for current location:", err);
        }
        
        setDropoffInput(resolvedName);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setDropoffInput("Location access denied or unavailable.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (typeof google !== "undefined" && google.maps && google.maps.Geocoder) {
      try {
        const geocoder = new google.maps.Geocoder();
        return new Promise((resolve) => {
          geocoder.geocode({ address }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
              const location = results[0].geometry.location;
              resolve({ lat: location.lat(), lng: location.lng() });
            } else {
              console.warn("Google Geocoder failed with status:", status);
              resolve(null);
            }
          });
        });
      } catch (err) {
        console.warn("Google Geocoder threw error:", err);
      }
    }

    // Fallback to OSM Search Geocoder
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
      }
    } catch (err) {
      console.error("OSM geocode fallback failed:", err);
    }
    return null;
  };

  const fetchSuggestions = async (query: string): Promise<{ lat: number, lng: number, name: string }[]> => {
    if (!query || query.length < 2) return [];

    const queryLower = query.toLowerCase();
    const defaultMatches = Object.values(UK_LOCATIONS).filter(loc => 
      loc.name.toLowerCase().includes(queryLower)
    );

    if (autocompleteService) {
      try {
        const googlePredictions = await new Promise<{ lat: number, lng: number, name: string }[]>((resolve) => {
          autocompleteService.getPlacePredictions(
            {
              input: query,
              componentRestrictions: { country: ["gb", "pk"] },
            },
            (predictions, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                resolve(predictions.map(p => ({ lat: 0, lng: 0, name: p.description })));
              } else {
                resolve([]);
              }
            }
          );
        });
        if (googlePredictions.length > 0) {
          const combined = [...defaultMatches, ...googlePredictions];
          return Array.from(new Map(combined.map(item => [item.name, item])).values());
        }
      } catch (err) {
        // fallback
      }
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (res.ok) {
        const data = await res.json();
        const osmResults = data.map((item: any) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          name: item.display_name
        }));
        const combined = [...defaultMatches, ...osmResults];
        if (combined.length > 0) {
          return Array.from(new Map(combined.map(item => [item.name, item])).values());
        }
      }
    } catch (err) {
      // ignore
    }

    // Smart fallback if API returns nothing so users always see suggestions
    return [
      ...defaultMatches,
      { lat: 51.5074, lng: -0.1278, name: `${query}, UK` },
      { lat: 52.4862, lng: -1.8904, name: `${query}, Birmingham, UK` },
      { lat: 24.8607, lng: 67.0011, name: `${query}, Karachi, Pakistan` }
    ];
  };

  const handleSelectSuggestion = async (loc: { lat: number; lng: number; name: string }, type: 'pickup' | 'dropoff') => {
    if (type === 'pickup') {
      setPickupInput(loc.name);
      setPickupSuggestions([]);
    } else {
      setDropoffInput(loc.name);
      setDropoffSuggestions([]);
    }

    let coords = { lat: loc.lat, lng: loc.lng };
    if (coords.lat === 0 && coords.lng === 0) {
      const resolved = await geocodeAddress(loc.name);
      if (resolved) {
        coords = resolved;
      }
    }

    if (type === 'pickup') {
      setCustomPickupCoords(coords);
    } else {
      setCustomDropoffCoords(coords);
    }
  };

  const handleInput = async (val: string, type: 'pickup' | 'dropoff', resetCoords = true) => {
    if (type === 'pickup') {
      setPickupInput(val);
      if (resetCoords) setCustomPickupCoords(null);
    } else {
      setDropoffInput(val);
      if (resetCoords) setCustomDropoffCoords(null);
    }

    if (val.length < 2) {
      const defaults = Object.values(UK_LOCATIONS);
      if (type === 'pickup') setPickupSuggestions(defaults);
      else setDropoffSuggestions(defaults);
      return;
    }

    // Instantly show local matches while fetching async suggestions
    const queryLower = val.toLowerCase();
    const immediateMatches = Object.values(UK_LOCATIONS).filter(loc => 
      loc.name.toLowerCase().includes(queryLower)
    );
    if (type === 'pickup') setPickupSuggestions(immediateMatches);
    else setDropoffSuggestions(immediateMatches);

    const suggestions = await fetchSuggestions(val);
    if (type === 'pickup') setPickupSuggestions(suggestions);
    else setDropoffSuggestions(suggestions);
  };
  const pickupRef = useRef<HTMLDivElement>(null);
  const dropoffRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickupRef.current && !pickupRef.current.contains(event.target as Node)) {
        setPickupSuggestions([]);
      }
      if (dropoffRef.current && !dropoffRef.current.contains(event.target as Node)) {
        setDropoffSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync initial inputs when passed down as props (e.g. from airports list)
  useEffect(() => {
    if (initialPickup) setPickupInput(initialPickup);
    if (initialDropoff) setDropoffInput(initialDropoff);
    if (initialPickup && initialDropoff) {
      calculateDistance(initialPickup, initialDropoff);
    }
  }, [initialPickup, initialDropoff]);
  useEffect(() => {
    if (customPickupCoords && customDropoffCoords && pickupInput && dropoffInput && pickupInput !== "Resolving address..." && dropoffInput !== "Resolving address...") {
      calculateDistance(pickupInput, dropoffInput);
    }
  }, [customPickupCoords, customDropoffCoords]);

  const handleMapClick = async (lat: number, lng: number) => {
    const currentMode = mapClickMode;
    
    if (currentMode === "pickup") {
      setPickupInput("Resolving address...");
    } else {
      setDropoffInput("Resolving address...");
    }
    
    let resolvedName = `Point on map (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    let resolvedWithGoogle = false;

    // Try Google Geocoding first
    if (typeof google !== "undefined" && google.maps && google.maps.Geocoder) {
      try {
        const geocoder = new google.maps.Geocoder();
        const latlng = { lat, lng };
        await new Promise<void>((resolve) => {
          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
              resolvedName = results[0].formatted_address;
              resolvedWithGoogle = true;
            }
            resolve();
          });
        });
      } catch (err) {
        console.warn("Google reverse geocoding failed, trying OSM Nominatim:", err);
      }
    }

    if (!resolvedWithGoogle) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
          headers: { 'Accept-Language': 'en' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            resolvedName = parts.slice(0, 3).map((p: any) => p.trim()).join(', ');
          }
        }
      } catch (err) {
        console.warn("Geocoding failed, using coordinates fallback.", err);
      }
    }
    
    if (currentMode === "pickup") {
      setPickupInput(resolvedName);
      setCustomPickupCoords({ lat, lng });
      setMapClickMode("dropoff");
    } else {
      setDropoffInput(resolvedName);
      setCustomDropoffCoords({ lat, lng });
      setMapClickMode("pickup");
    }
  };

  const handleRouteCalculated = async (result: {
    distanceMiles: number;
    timeMinutes: number;
    routePoints: { lat: number; lng: number }[];
    instructions: string[];
  }) => {
    setLoadingRoute(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup: pickupInput,
          dropoff: dropoffInput,
          pickupCoords: customPickupCoords,
          dropoffCoords: customDropoffCoords,
          precalculated: result,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDistanceResult(data);
      } else {
        console.error("Failed to fetch price details for Google route");
      }
    } catch (err) {
      console.error("Failed contacting pricing server:", err);
    } finally {
      setLoadingRoute(false);
    }
  };

  const getClientSideFallbackRoute = (pickup: string, dropoff: string, precalc?: any) => {
    const UK_LOCATIONS: { [key: string]: { lat: number; lng: number; name: string } } = {
      "shirley": { lat: 52.4140, lng: -1.8150, name: "Shirley, Solihull B90" },
      "solihull": { lat: 52.4135, lng: -1.7780, name: "Solihull, West Midlands" },
      "birmingham": { lat: 52.4862, lng: -1.8904, name: "Birmingham, West Midlands" },
      "bhx": { lat: 52.4539, lng: -1.7481, name: "Birmingham Airport (BHX)" },
      "lhr": { lat: 51.4700, lng: -0.4543, name: "London Heathrow Airport (LHR)" },
      "heathrow": { lat: 51.4700, lng: -0.4543, name: "London Heathrow Airport (LHR)" },
      "lgw": { lat: 51.1537, lng: -0.1821, name: "London Gatwick Airport (LGW)" },
      "gatwick": { lat: 51.1537, lng: -0.1821, name: "London Gatwick Airport (LGW)" },
      "man": { lat: 53.3588, lng: -2.2727, name: "Manchester Airport (MAN)" },
      "manchester": { lat: 53.3588, lng: -2.2727, name: "Manchester Airport (MAN)" },
      "ema": { lat: 52.8311, lng: -1.3280, name: "East Midlands Airport (EMA)" },
      "stn": { lat: 51.8860, lng: 0.2389, name: "London Stansted Airport (STN)" },
      "stansted": { lat: 51.8860, lng: 0.2389, name: "London Stansted Airport (STN)" },
      "ltn": { lat: 51.8763, lng: -0.3717, name: "London Luton Airport (LTN)" },
      "luton": { lat: 51.8763, lng: -0.3717, name: "London Luton Airport (LTN)" },
      "lcy": { lat: 51.5048, lng: 0.0495, name: "London City Airport (LCY)" },
      "london": { lat: 51.5074, lng: -0.1278, name: "London Central, UK" }
    };

    const pNorm = pickup.toLowerCase();
    const dNorm = dropoff.toLowerCase();

    const hashStringToCoords = (str: string, defaultLat: number, defaultLng: number) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const latOffset = (Math.abs(hash % 1000) / 1000) * 0.4 - 0.2;
      const lngOffset = (Math.abs((hash >> 3) % 1000) / 1000) * 0.4 - 0.2;
      return { lat: defaultLat + latOffset, lng: defaultLng + lngOffset };
    };

    let pCoords = UK_LOCATIONS.shirley;
    if (customPickupCoords) {
      pCoords = { lat: customPickupCoords.lat, lng: customPickupCoords.lng, name: pickup };
    } else {
      let pMatched = false;
      for (const [key, loc] of Object.entries(UK_LOCATIONS)) {
        if (pNorm.includes(key)) {
          pCoords = loc;
          pMatched = true;
          break;
        }
      }
      if (!pMatched) {
        const coords = hashStringToCoords(pNorm, 52.4140, -1.8150);
        pCoords = { lat: coords.lat, lng: coords.lng, name: pickup };
      }
    }

    let dCoords = UK_LOCATIONS.bhx;
    if (customDropoffCoords) {
      dCoords = { lat: customDropoffCoords.lat, lng: customDropoffCoords.lng, name: dropoff };
    } else {
      let dMatched = false;
      for (const [key, loc] of Object.entries(UK_LOCATIONS)) {
        if (dNorm.includes(key)) {
          dCoords = loc;
          dMatched = true;
          break;
        }
      }
      if (!dMatched) {
        const coords = hashStringToCoords(dNorm, 51.4700, -0.4543);
        dCoords = { lat: coords.lat, lng: coords.lng, name: dropoff };
      }
    }

    const R = 3958.8; // Radius of Earth in miles
    const dLat = (dCoords.lat - pCoords.lat) * Math.PI / 180;
    const dLon = (dCoords.lng - pCoords.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pCoords.lat * Math.PI / 180) * Math.cos(dCoords.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightLineDist = R * c;

    let distanceMiles = Number((straightLineDist === 0 ? 5.5 : straightLineDist * 1.3).toFixed(1));
    if (distanceMiles < 2) distanceMiles = 3.5;

    let timeMinutes = Math.max(8, Math.round((distanceMiles / 45) * 60));

    let points = [];
    let instructions = [
      `Start journey at ${pCoords.name}`,
      distanceMiles > 15 ? "Join major motorway (M42 / M40 / M6)" : "Proceed along local A-roads",
      distanceMiles > 40 ? "Follow regional highway signs" : "Navigate towards local signs",
      `Arrive at your destination: ${dCoords.name}`
    ];

    if (precalc && precalc.distanceMiles && Array.isArray(precalc.routePoints)) {
      distanceMiles = precalc.distanceMiles;
      timeMinutes = precalc.timeMinutes || timeMinutes;
      points = precalc.routePoints;
      instructions = precalc.instructions || instructions;
    } else {
      const steps = 15;
      const pLat = -(dCoords.lng - pCoords.lng);
      const pLng = (dCoords.lat - pCoords.lat);
      const len = Math.sqrt(pLat * pLat + pLng * pLng);

      for (let i = 0; i <= steps; i++) {
        const fraction = i / steps;
        const midLat = pCoords.lat + (dCoords.lat - pCoords.lat) * fraction;
        const midLng = pCoords.lng + (dCoords.lng - pCoords.lng) * fraction;

        if (len > 0) {
          const uLat = pLat / len;
          const uLng = pLng / len;
          // Beautiful smooth arc peak in the middle, scaled to ~12% of straight-line distance
          const wiggle = Math.sin(fraction * Math.PI) * len * 0.12;
          points.push({
            lat: midLat + uLat * wiggle,
            lng: midLng + uLng * wiggle
          });
        } else {
          points.push({ lat: midLat, lng: midLng });
        }
      }
    }

    const totalWaitMins = stops.reduce((acc, s) => acc + (Number(s.waiting) || 0), 0);
    const waitingChargeAmt = totalWaitMins * 0.50;

    const effectiveDistance = distanceMiles <= 10 ? 10 : distanceMiles;
    const prices = {
      Economy: Number((effectiveDistance * 1.50 + waitingChargeAmt).toFixed(2)),
      Luxury: Number((effectiveDistance * 2.00 + waitingChargeAmt).toFixed(2)),
      Family: Number((effectiveDistance * 2.50 + waitingChargeAmt).toFixed(2))
    };

    return {
      distanceMiles,
      timeMinutes,
      pickupLat: pCoords.lat,
      pickupLng: pCoords.lng,
      dropoffLat: dCoords.lat,
      dropoffLng: dCoords.lng,
      routePoints: points,
      instructions,
      pickupDisplay: pCoords.name,
      dropoffDisplay: dCoords.name,
      prices,
      waitingTime: totalWaitMins,
      waitingChargeAmount: Number(waitingChargeAmt.toFixed(2)),
      source: "client-fallback"
    };
  };

  // Execute calculation
  const calculateDistance = async (pick = pickupInput, drop = dropoffInput, currentStops = stops) => {
    if (!pick || !drop) {
      setErrorMsg("Please provide both Pickup and Dropoff locations.");
      return;
    }
    setErrorMsg("");
    setLoadingRoute(true);
    setDistanceResult(null);
    trackClick("get_quote");

    let precalculated: any = null;

    try {
      // 1. Resolve coordinates on client-side if missing
      let pCoords = customPickupCoords;
      if (!pCoords) {
        const resolved = await fetchSuggestions(pick);
        if (resolved && resolved.length > 0) {
          pCoords = { lat: resolved[0].lat, lng: resolved[0].lng };
          setCustomPickupCoords(pCoords);
        }
      }

      let dCoords = customDropoffCoords;
      if (!dCoords) {
        const resolved = await fetchSuggestions(drop);
        if (resolved && resolved.length > 0) {
          dCoords = { lat: resolved[0].lat, lng: resolved[0].lng };
          setCustomDropoffCoords(dCoords);
        }
      }

      // Geocode intermediate stops if missing coordinates
      const stopsWithCoords = await Promise.all(currentStops.map(async (stop) => {
        if (stop.lat !== undefined && stop.lng !== undefined) {
          return stop;
        }
        const resolved = await fetchSuggestions(stop.address);
        if (resolved && resolved.length > 0) {
          return { ...stop, lat: resolved[0].lat, lng: resolved[0].lng };
        }
        return stop;
      }));

      // Update stops with geocoded coordinates if updated
      let updatedStops = false;
      const finalStops = stopsWithCoords.map((stop, index) => {
        const original = currentStops[index];
        if (stop.lat !== original?.lat || stop.lng !== original?.lng) {
          updatedStops = true;
        }
        return stop;
      });
      if (updatedStops) {
        setStops(finalStops);
      }

      // 2. Fetch OSRM route directly from client (bypasses Server rate limits completely)
      if (pCoords && dCoords) {
        try {
          const validStops = finalStops.filter(s => s.lat !== undefined && s.lng !== undefined);
          const stopCoordsStr = validStops.map(s => `${s.lng},${s.lat}`).join(";");
          const coordsChain = [
            `${pCoords.lng},${pCoords.lat}`,
            ...(stopCoordsStr ? [stopCoordsStr] : []),
            `${dCoords.lng},${dCoords.lat}`
          ].join(";");

          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsChain}?overview=full&geometries=geojson&steps=true`;
          const osrmRes = await fetch(osrmUrl);
          if (osrmRes.ok) {
            const osrmData = await osrmRes.json();
            if (osrmData.routes && osrmData.routes.length > 0) {
              const route = osrmData.routes[0];
              const distMiles = route.distance / 1609.34;
              const timeMinutes = route.duration / 60;
              const routePoints = route.geometry.coordinates.map((coord: [number, number]) => ({
                lat: coord[1],
                lng: coord[0]
              }));

              // Parse turn-by-turn steps
              let instructions: string[] = [];
              if (route.legs) {
                route.legs.forEach((leg: any, legIdx: number) => {
                  if (leg.steps) {
                    const legSteps = leg.steps.map((step: any) => {
                      const maneuver = step.maneuver || {};
                      const type = maneuver.type || "";
                      const modifier = maneuver.modifier || "";
                      const name = step.name || "";
                      let actionText = "";
                      switch (type) {
                        case "depart":
                          actionText = name ? `Depart heading near ${name}` : "Depart starting point";
                          break;
                        case "arrive":
                          actionText = name ? `Arrive at waypoint/destination on ${name}` : "Arrive at stop/destination";
                          break;
                        case "turn":
                          actionText = `Turn ${modifier} ${name ? `onto ${name}` : ""}`;
                          break;
                        case "new name":
                          actionText = `Continue onto ${name}`;
                          break;
                        case "merge":
                          actionText = `Merge ${modifier} ${name ? `onto ${name}` : ""}`;
                          break;
                        case "on ramp":
                          actionText = `Take the ramp ${modifier} ${name ? `onto ${name}` : ""}`;
                          break;
                        case "off ramp":
                          actionText = `Take exit ${modifier} ${name ? `onto ${name}` : ""}`;
                          break;
                        case "fork":
                          actionText = `Take the fork ${modifier} ${name ? `onto ${name}` : ""}`;
                          break;
                        case "roundabout":
                          actionText = `At the roundabout, take exit ${modifier} ${name ? `onto ${name}` : ""}`;
                          break;
                        case "rotary":
                          actionText = `Enter the rotary and exit ${modifier} ${name ? `onto ${name}` : ""}`;
                          break;
                        default:
                          actionText = `${type} ${modifier} ${name ? `onto ${name}` : ""}`;
                      }
                      actionText = actionText.replace(/\s+/g, " ").trim();
                      return actionText.charAt(0).toUpperCase() + actionText.slice(1);
                    });
                    instructions = [...instructions, `[Leg ${legIdx + 1}]`, ...legSteps];
                  }
                });
              }

              if (instructions.length === 0) {
                instructions = ["Follow driving route calculated via OSRM"];
              }

              precalculated = {
                distanceMiles: distMiles,
                timeMinutes: timeMinutes,
                routePoints: routePoints,
                instructions: instructions
              };
            }
          }
        } catch (err) {
          console.warn("Client-side OSRM routing failed, falling back to server-side estimation:", err);
        }
      }

      // 3. Request pricing/route details from backend (passing precalculated route data if available)
      const res = await fetch("/api/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          pickup: pick, 
          dropoff: drop,
          pickupCoords: pCoords,
          dropoffCoords: dCoords,
          precalculated: precalculated,
          stops: finalStops
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDistanceResult(data);
        setSelectedVehicle("Luxury");
      } else {
        console.warn("Server distance check failed. Proceeding with client-side estimation fallback.");
        const fallbackData = getClientSideFallbackRoute(pick, drop, precalculated);
        setDistanceResult(fallbackData);
        setSelectedVehicle("Luxury");
      }
    } catch (err) {
      console.warn("Error calculating route. Proceeding with client-side estimation fallback.", err);
      const fallbackData = getClientSideFallbackRoute(pick, drop, precalculated);
      setDistanceResult(fallbackData);
      setSelectedVehicle("Luxury");
    } finally {
      setLoadingRoute(false);
    }
  };

  // Stripe card fields helper formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(" "));
    } else {
      setCardNumber(v);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      setCardExpiry(`${v.substring(0, 2)}/${v.substring(2, 4)}`);
    } else {
      setCardExpiry(v);
    }
  };

  // Bookings submission trigger
  const handleReserveDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rideDate || !rideTime || !passengerName || !passengerEmail || !passengerPhone || !selectedVehicle || !distanceResult) {
      alert("Please fill in all requested fields.");
      return;
    }
    // Transition to payment checkout
    setCurrentStep(3);
  };

  // Payment finalizer
  const processCheckoutPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!distanceResult || !selectedVehicle) return;

    setProcessingPayment(true);

    const price = distanceResult.prices[selectedVehicle];

    const payload = {
      pickup: distanceResult.pickupDisplay || pickupInput,
      dropoff: distanceResult.dropoffDisplay || dropoffInput,
      pickupCoords: { lat: distanceResult.pickupLat, lng: distanceResult.pickupLng },
      dropoffCoords: { lat: distanceResult.dropoffLat, lng: distanceResult.dropoffLng },
      distance: distanceResult.distanceMiles ?? (distanceResult as any).distance,
      duration: distanceResult.timeMinutes ?? (distanceResult as any).duration,
      stops: stops.map(s => ({ address: s.address, duration: s.duration, waiting: s.waiting, lat: s.lat, lng: s.lng })),
      waitingTime: stops.reduce((acc, s) => acc + (Number(s.waiting) || 0), 0),
      date: rideDate,
      time: rideTime,
      vehicle: selectedVehicle,
      price: price,
      passengerName,
      passengerEmail,
      passengerPhone,
      passengerAlternatePhone,
      flightNumber,
      passengers: passengerCount,
      luggage: luggageCount,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === "Pay Later" ? "Unpaid" : "Paid",
      status: "Confirmed"
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        trackClick("book_now");
        const data = await res.json();
        setCompletedBookingId(data.booking.id);
        setCompletedBookingPrice(price);
        
        // Dispatch simulation payment server update
        await fetch("/api/bookings/payment-simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: data.booking.id,
            paymentMethod: paymentMethod,
            transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
          })
        });

        setCurrentStep(4);
      } else {
        alert("Server failed to register the booking. Please check logs.");
      }
    } catch (err) {
      alert("Payment processor connection failed.");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Check for Mollie redirect success params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingStatus = params.get("bookingStatus");
    const bookingId = params.get("bookingId");
    if (bookingStatus === "success" && bookingId) {
      setCompletedBookingId(bookingId);
      setPaymentMethod("Mollie");
      setCurrentStep(4);
      // Clean query params
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Mollie Payment Handler
  const handleMollieCheckout = async () => {
    if (!distanceResult || !selectedVehicle) return;
    setProcessingPayment(true);
    const price = distanceResult.prices[selectedVehicle];

    const payload = {
      pickup: distanceResult.pickupDisplay || pickupInput,
      dropoff: distanceResult.dropoffDisplay || dropoffInput,
      pickupCoords: { lat: distanceResult.pickupLat, lng: distanceResult.pickupLng },
      dropoffCoords: { lat: distanceResult.dropoffLat, lng: distanceResult.dropoffLng },
      distance: distanceResult.distanceMiles ?? (distanceResult as any).distance,
      duration: distanceResult.timeMinutes ?? (distanceResult as any).duration,
      stops: stops.map(s => ({ address: s.address, duration: s.duration, waiting: s.waiting, lat: s.lat, lng: s.lng })),
      waitingTime: stops.reduce((acc, s) => acc + (Number(s.waiting) || 0), 0),
      date: rideDate,
      time: rideTime,
      vehicle: selectedVehicle,
      price: price,
      passengerName,
      passengerEmail,
      passengerPhone,
      passengerAlternatePhone,
      flightNumber,
      passengers: passengerCount,
      luggage: luggageCount,
      paymentMethod: "Mollie"
    };

    try {
      const res = await fetch("/api/mollie/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Failed to initialize Mollie payment gateway.");
      }
    } catch (err: any) {
      console.error("Mollie payment error:", err);
      alert("Could not connect to Mollie payment gateway.");
    } finally {
      setProcessingPayment(false);
    }
  };

  // PayPal checkout mock popup
  const handlePayPalCheckout = () => {
    setPaypalSimulating(true);
    setTimeout(() => {
      // Simulate successful confirmation inside popup callback
      setPaypalSimulating(false);
      setPaymentMethod("PayPal");
      processCheckoutPayment();
    }, 2500);
  };

  // Distance parameters
  const selectedPrice = distanceResult && selectedVehicle ? distanceResult.prices[selectedVehicle] : 0;

  return (
    <section id="calculator" className="py-20 bg-white text-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-emerald-700 font-sans text-xs tracking-widest uppercase block mb-3 font-semibold">Instant Booking System</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Calculate & Book Chauffeur
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Get instant guaranteed prices side-by-side. Book with seamless secure checkout under 60 seconds.
          </p>
        </div>

        {/* Outer Split Panel Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden items-stretch">
          
          {/* STEPPER METADATA SUBBAR */}
          <div className="lg:col-span-12 flex justify-between items-center border-b border-slate-200 pb-4 mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-sans tracking-wider uppercase text-slate-400">Booking progress:</span>
              <div className="flex space-x-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentStep === step
                        ? "w-8 bg-emerald-600"
                        : currentStep > step
                        ? "w-4 bg-emerald-600/50"
                        : "w-3 bg-slate-200"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            <div className="text-[10px] font-sans text-emerald-700 uppercase tracking-widest font-semibold">
              {currentStep === 1 && "1. Instant Pricing Options"}
              {currentStep === 2 && "2. Passenger Schedule Details"}
              {currentStep === 3 && "3. Secure Checkout Gateway"}
              {currentStep === 4 && "4. Reservation Confirmed"}
            </div>
          </div>

          {/* LEFT BLOCK: INPUTS & VEHICLES & FORMS (Colspan 7) */}
          <div ref={leftFormRef} className="lg:col-span-7 flex flex-col space-y-6 self-start w-full">
            
            {/* STEP 1: CALCULATOR / VEHICLE SELECT */}
            {currentStep === 1 && (
              <div className="space-y-4">
                
                {/* Inputs card */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 font-display">Where would you like to travel?</h3>
                    
                    <div className="space-y-3">
                      <div className="relative" ref={pickupRef}>
                        <div className="absolute left-4 top-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-sans text-[9px] font-bold">P</div>
                        <input
                          type="text"
                          placeholder="Enter Pick-up Location or Postal Code..."
                          value={pickupInput}
                          onChange={(e) => {
                            handleInput(e.target.value, 'pickup');
                          }}
                          onFocus={() => handleInput(pickupInput, 'pickup', false)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:outline-none rounded-xl py-3 pl-11 pr-12 text-sm text-slate-800 transition placeholder:text-slate-400"
                        />
                        <button type="button" onClick={useMyLocation} className="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-600"><Compass className="w-5 h-5"/></button>
                        {pickupSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full bg-white border border-slate-200 mt-1 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {pickupSuggestions.map((loc, idx) => (
                              <div key={idx} className="p-3 text-sm hover:bg-slate-50 cursor-pointer" onClick={() => {
                                handleSelectSuggestion(loc, 'pickup');
                              }}>{loc.name}</div>
                            ))}
                          </div>
                        )}

                      </div>



                      <div className="relative" ref={dropoffRef}>
                        <div className="absolute left-4 top-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-rose-600 font-sans text-[9px] font-bold">D</div>
                        <input
                          type="text"
                          placeholder="Enter Drop-off Destination or Airport..."
                          value={dropoffInput}
                          onChange={(e) => {
                            handleInput(e.target.value, 'dropoff');
                          }}
                          onFocus={() => handleInput(dropoffInput, 'dropoff', false)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:outline-none rounded-xl py-3 pl-11 pr-12 text-sm text-slate-800 transition placeholder:text-slate-400"
                        />
                        <button type="button" onClick={useMyDropoffLocation} className="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-600"><Compass className="w-5 h-5"/></button>
                        {dropoffSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full bg-white border border-slate-200 mt-1 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {dropoffSuggestions.map((loc, idx) => (
                              <div key={idx} className="p-3 text-sm hover:bg-slate-50 cursor-pointer" onClick={() => {
                                handleSelectSuggestion(loc, 'dropoff');
                              }}>{loc.name}</div>
                            ))}
                          </div>
                        )}

                      </div>
                    </div>

                    {errorMsg && (
                      <div className="flex items-center space-x-2 text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200/50">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <div className="absolute left-4 top-3.5 text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          type="date"
                          value={rideDate}
                          onChange={(e) => setRideDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:outline-none rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 transition"
                        />
                      </div>
                      <div className="relative flex-1">
                        <div className="absolute left-4 top-3.5 text-slate-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <input
                          type="time"
                          value={rideTime}
                          onChange={(e) => setRideTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:outline-none rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {["Economy", "Luxury", "Family"].map((vehicle) => {
                        const rates: Record<string, string> = {
                          Economy: "£1.50/mi",
                          Luxury: "£2.00/mi",
                          Family: "£2.50/mi"
                        };
                        return (
                          <button
                            key={vehicle}
                            type="button"
                            onClick={() => setSelectedVehicle(vehicle as any)}
                            className={`border rounded-xl p-3 text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                              selectedVehicle === vehicle
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-600"
                            }`}
                          >
                            <span className="font-display font-medium">
                              {vehicle === "Family" ? "Family / MPV" : vehicle}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                      onClick={() => calculateDistance()}
                      disabled={loadingRoute}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/10 flex justify-center items-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {loadingRoute ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Calculating Route...</span>
                        </>
                      ) : (
                        <>
                          <span>Calculate Quote</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <button
                      onClick={clearRoute}
                      className="text-slate-500 hover:text-rose-600 font-medium py-3 px-4 rounded-xl transition text-sm flex items-center justify-center border border-slate-200"
                      title="Clear Route"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Pricing display panels shown first */}
                {distanceResult && (
                  <div className="space-y-4 animate-fade-in mt-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-semibold uppercase font-sans tracking-wider text-slate-400">Route & Pricing Summary</h4>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs font-sans text-slate-500">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="block text-slate-400 text-[9px] uppercase tracking-wider">Total Distance</span>
                        <strong className="text-slate-800 text-sm">{Math.round(distanceResult.distanceMiles ?? distanceResult.distance ?? 0)} miles</strong>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="block text-slate-400 text-[9px] uppercase tracking-wider">Est. Driving Time</span>
                        <strong className="text-slate-800 text-sm">~{Math.round(distanceResult.timeMinutes ?? distanceResult.duration ?? 0)} mins</strong>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="block text-slate-400 text-[9px] uppercase tracking-wider">Selected Plan</span>
                        <strong className="text-slate-800 text-sm">{selectedVehicle === "Family" ? "Family / MPV" : selectedVehicle}</strong>
                      </div>
                      <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                        <span className="block text-emerald-600/80 text-[9px] uppercase tracking-wider">Estimated Fare</span>
                        <strong className="text-emerald-700 text-base font-bold">£{selectedPrice.toFixed(2)}</strong>
                      </div>
                      {distanceResult.waitingTime > 0 && (
                        <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 col-span-2 flex justify-between items-center">
                          <div>
                            <span className="block text-amber-700 text-[9px] uppercase tracking-wider font-semibold">Stay / Waiting Charges</span>
                            <strong className="text-slate-800 text-xs">{stops.length} Stop(s) • Total Wait: {distanceResult.waitingTime} Mins</strong>
                          </div>
                          <strong className="text-amber-800 text-sm font-bold">£{Number(distanceResult.waitingChargeAmount || 0).toFixed(2)}</strong>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => { setCurrentStep(2); }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/10 cursor-pointer"
                    >
                      <span>Continue Booking Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: RIDE SCHEDULE & CONTACTS */}
            {currentStep === 2 && (
              <form onSubmit={handleReserveDetailsSubmit} className="space-y-4">
                {/* removed date and time fields */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 font-display">Contact Information</h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-500 font-sans uppercase tracking-wider mb-1.5">Passenger Full Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={passengerName}
                          onChange={(e) => setPassengerName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 font-sans uppercase tracking-wider mb-1.5">Passenger Email</label>
                          <input
                            type="email"
                            placeholder="johndoe@example.com"
                            value={passengerEmail}
                            onChange={(e) => setPassengerEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-500 font-sans uppercase tracking-wider mb-1.5">Mobile Phone (WhatsApp ready)</label>
                          <input
                            type="tel"
                            placeholder="e.g. 0121 714 0876"
                            value={passengerPhone}
                            onChange={(e) => setPassengerPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-500 font-sans uppercase tracking-wider mb-1.5">Alternate Phone (Optional)</label>
                          <input
                            type="tel"
                            placeholder="e.g. 0121 714 0876"
                            value={passengerAlternatePhone}
                            onChange={(e) => setPassengerAlternatePhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1.5">Passengers</label>
                          <select
                            value={passengerCount}
                            onChange={(e) => setPassengerCount(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-none"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1.5">Bags / Luggage</label>
                          <select
                            value={luggageCount}
                            onChange={(e) => setLuggageCount(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-none"
                          >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1.5">Flight No (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. EK37"
                            value={flightNumber}
                            onChange={(e) => setFlightNumber(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-white hover:bg-slate-50 text-slate-700 py-4 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-200 cursor-pointer"
                  >
                    Back to Rates
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: INTEGRATED STRIPE / PAYPAL GATEWAY */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <h3 className="text-sm font-semibold text-slate-900 font-display">Secure Transaction Checkout</h3>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-sans">Amount Payable:</span>
                        <span className="text-lg font-bold font-display text-emerald-700">£{selectedPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Payment Tab selectors */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("Mollie")}
                        className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          paymentMethod === "Mollie"
                            ? "bg-emerald-50 border-emerald-600 text-emerald-700 shadow-sm ring-1 ring-emerald-600/30"
                            : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold">Mollie Online</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("Pay Later")}
                        className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          paymentMethod === "Pay Later"
                            ? "bg-emerald-50 border-emerald-600 text-emerald-700 shadow-sm ring-1 ring-emerald-600/30"
                            : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Coins className="w-4 h-4" />
                        <span>Pay Later / Cash</span>
                      </button>
                    </div>

                    {/* MOLLIE PAYMENT METHOD UI */}
                    {paymentMethod === "Mollie" ? (
                      <div className="space-y-4 py-2">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="font-display font-extrabold text-slate-800 tracking-wider text-lg">
                              mollie
                            </span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                              Official Gateway
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Pay safely via <strong>Mollie</strong> supporting <strong>iDEAL, Visa, Mastercard, Bancontact, Klarna, Apple Pay &amp; PayPal</strong>.
                          </p>

                          {/* Supported payment badges */}
                          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px] font-medium text-slate-500">
                            <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-semibold text-slate-700">iDEAL</span>
                            <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-semibold text-slate-700">Visa / MC</span>
                            <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-semibold text-slate-700">Bancontact</span>
                            <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-semibold text-slate-700">Apple Pay</span>
                            <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-semibold text-slate-700">Klarna</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Protected by Mollie 256-Bit SSL Bank Grade Encryption.</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleMollieCheckout}
                          disabled={processingPayment}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-emerald-600/10 disabled:opacity-55"
                        >
                          {processingPayment ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Redirecting to Mollie Checkout...</span>
                            </>
                          ) : (
                            <span>Pay £{selectedPrice.toFixed(2)} with Mollie</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 py-6 text-center">
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                          <Coins className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                          <p className="text-xs text-emerald-800 font-semibold">
                            Secure your booking now and pay the driver directly in cash upon arrival.
                          </p>
                        </div>
                        <button
                          onClick={processCheckoutPayment}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
                        >
                          Confirm Booking (Pay Later)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 py-3.5 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Back to schedule
                </button>
              </div>
            )}

            {/* STEP 4: RESERVATION SUCCESS */}
            {currentStep === 4 && (
              <div className="space-y-6 text-center py-6 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mb-2">
                  <Check className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-2xl text-slate-900">Chauffeur Reserved Successfully!</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Your luxury airport transfer is secured. A transaction receipt and chauffeur schedule has been dispatched.
                  </p>
                </div>

                {/* Booking receipt details summary */}
                <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 p-6 rounded-2xl text-left space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-xs font-sans text-slate-400 uppercase">Reservation ID:</span>
                    <span className="text-sm font-sans font-bold text-emerald-700">{completedBookingId}</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 font-medium">
                    <p><strong>Passenger:</strong> {passengerName}</p>
                    <p><strong>Route:</strong> {distanceResult?.pickupDisplay} → {distanceResult?.dropoffDisplay}</p>
                    <p><strong>Date & Time:</strong> {rideDate} at {rideTime}</p>
                    <p><strong>Vehicle:</strong> {selectedVehicle} Class</p>
                    <p><strong>Paid amount:</strong> <span className="font-sans text-emerald-700 font-semibold">£{completedBookingPrice.toFixed(2)}</span> ({paymentMethod})</p>
                  </div>
                </div>

                {/* Immediate WhatsApp link */}
                <div className="space-y-3 max-w-md mx-auto pt-4">
                  <a
                    href={`https://wa.me/441217140876?text=Hi%20Travelluxx!%20My%20booking%20is%20submitted.%20ID:%20${completedBookingId}%20from%20${encodeURIComponent(distanceResult?.pickupDisplay || "")}%20to%2520${encodeURIComponent(distanceResult?.dropoffDisplay || "")}.%20Total%20Price:%20£${completedBookingPrice}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                  >
                    <Phone className="w-5 h-5 fill-current" />
                    <span>Open dispatch in WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      // Reset State completely
                      setPickupInput("");
                      setDropoffInput("");
                      setDistanceResult(null);
                      setCurrentStep(1);
                      setSelectedVehicle(null);
                    }}
                    className="w-full bg-white hover:bg-slate-50 text-slate-600 py-3.5 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
                  >
                    Calculate another route
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT BLOCK: INTERACTIVE LEAFLET VECTOR MAP (Colspan 5) */}
          <div className="lg:col-span-5 w-full flex flex-col self-start h-full">
            
            {/* Map wrapper container */}
            <div
              className="w-full h-[360px] sm:h-[420px] lg:h-[var(--map-height)] min-h-[350px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative flex flex-col transition-[height] duration-300"
              style={
                {
                  "--map-height": formHeight ? `${formHeight}px` : "100%",
                } as React.CSSProperties
              }
            >
              <GoogleBookingMap
                pickupCoords={customPickupCoords}
                dropoffCoords={customDropoffCoords}
                pickupInput={pickupInput}
                dropoffInput={dropoffInput}
                onMapClick={handleMapClick}
                onRouteCalculated={handleRouteCalculated}
              />
              
              {/* Overlay guides: Left */}
              <div className="absolute top-4 left-4 z-10 bg-white/95 border border-slate-200 px-3 py-2 rounded-xl backdrop-blur flex items-center space-x-2 text-[10px] text-slate-500 shadow-sm">
                <Compass className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
                <span className="font-semibold">Interactive Route Mapping</span>
              </div>

              {/* Bottom-Left Map Legend Card matching the user's screenshot exactly */}
              <div className="absolute bottom-4 left-4 z-10 bg-white border border-slate-200/80 px-3 py-2 rounded-xl shadow-md flex items-center space-x-4 text-[11px] font-bold text-slate-800">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block border border-white shadow-sm"></span>
                  <span>Pickup</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block border border-white shadow-sm"></span>
                  <span>Dropoff</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
