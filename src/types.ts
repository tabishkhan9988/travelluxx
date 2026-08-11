export interface Booking {
  id: string;
  pickup: string;
  dropoff: string;
  pickupCoords?: { lat: number; lng: number };
  dropoffCoords?: { lat: number; lng: number };
  distance: number;
  duration: number;
  date: string;
  time: string;
  vehicle: "Economy" | "Luxury" | "Family";
  price: number;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  flightNumber: string;
  passengers: number;
  luggage: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  paymentMethod: string;
  paymentStatus: "Paid" | "Unpaid";
  createdAt: string;
  transactionId?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  type: string;
  status: "Unread" | "Read";
  createdAt: string;
}

export interface DistanceResult {
  distanceMiles: number;
  timeMinutes: number;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  routePoints: { lat: number; lng: number }[];
  instructions: (string | { text: string; distance: number; duration: number; type?: string; modifier?: string; name?: string })[];
  pickupDisplay: string;
  dropoffDisplay: string;
  prices: {
    Economy: number;
    Luxury: number;
    Family: number;
  };
  source?: string;
}
