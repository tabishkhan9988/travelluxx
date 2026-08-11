import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface GoogleBookingMapProps {
  pickupCoords: { lat: number; lng: number } | null;
  dropoffCoords: { lat: number; lng: number } | null;
  pickupInput: string;
  dropoffInput: string;
  onMapClick: (lat: number, lng: number) => void;
  onRouteCalculated: (result: {
    distanceMiles: number;
    timeMinutes: number;
    routePoints: { lat: number; lng: number }[];
    instructions: string[];
  }) => void;
}

export default function GoogleBookingMap({
  pickupCoords,
  dropoffCoords,
  pickupInput,
  dropoffInput,
  onMapClick,
  onRouteCalculated,
}: GoogleBookingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const distanceMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // already initialized

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([52.414, -1.815], 10);

    // Re-add zoom control at bottom-right corner
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Google Roadmap vector tile layer in English (&hl=en)
    L.tileLayer("https://mt1.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}", {
      maxZoom: 19,
      attribution: "© Google Maps",
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Automatically recalculate map dimensions when container resizes
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Update Markers and Route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers & route
    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }
    if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.remove();
      dropoffMarkerRef.current = null;
    }
    if (distanceMarkerRef.current) {
      distanceMarkerRef.current.remove();
      distanceMarkerRef.current = null;
    }
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    const bounds = L.latLngBounds([]);
    let hasBounds = false;

    if (pickupCoords) {
      const pickupIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="width: 28px; height: 28px; border-radius: 9999px; background-color: #059669; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #ffffff;"></div>
            </div>
            <div style="margin-top: 2px; background-color: #0f172a; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); text-transform: uppercase; white-space: nowrap;">PICKUP</div>
          </div>
        `,
        iconSize: [28, 48],
        iconAnchor: [14, 24],
      });

      const marker = L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon }).addTo(map);
      pickupMarkerRef.current = marker;
      bounds.extend([pickupCoords.lat, pickupCoords.lng]);
      hasBounds = true;
    }

    if (dropoffCoords) {
      const dropoffIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="width: 28px; height: 28px; border-radius: 9999px; background-color: #e11d48; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #ffffff;"></div>
            </div>
            <div style="margin-top: 2px; background-color: #0f172a; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); text-transform: uppercase; white-space: nowrap;">DROPOFF</div>
          </div>
        `,
        iconSize: [28, 48],
        iconAnchor: [14, 24],
      });

      const marker = L.marker([dropoffCoords.lat, dropoffCoords.lng], { icon: dropoffIcon }).addTo(map);
      dropoffMarkerRef.current = marker;
      bounds.extend([dropoffCoords.lat, dropoffCoords.lng]);
      hasBounds = true;
    }

    if (pickupCoords && dropoffCoords) {
      // Fetch OSRM Public Routing API
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${dropoffCoords.lng},${dropoffCoords.lat}?overview=full&geometries=geojson`;

      fetch(osrmUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates; // [lng, lat]
            const latLngs = coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
            
            const distanceMeters = route.distance; // meters
            const durationSeconds = route.duration; // seconds

            const distanceMiles = distanceMeters / 1609.34;
            const timeMinutes = durationSeconds / 60;

            const routePoints = coordinates.map((c: [number, number]) => ({
              lng: c[0],
              lat: c[1],
            }));

            const polyline = L.polyline(latLngs, {
              color: "#059669",
              weight: 5,
              opacity: 0.85,
            }).addTo(map);

            routePolylineRef.current = polyline;

            // Centered distance badge along route path
            const midIndex = Math.floor(latLngs.length / 2);
            const midPoint = latLngs[midIndex] || latLngs[0];
            const badgeIcon = L.divIcon({
              className: "custom-distance-badge",
              html: `
                <div style="background-color: #ffffff; color: #047857; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 9999px; border: 2px solid #059669; box-shadow: 0 2px 6px rgba(0,0,0,0.15); font-family: sans-serif; white-space: nowrap;">
                  ${distanceMiles.toFixed(1)} mi
                </div>
              `,
              iconSize: [60, 24],
              iconAnchor: [30, 12],
            });
            distanceMarkerRef.current = L.marker(midPoint, { icon: badgeIcon, interactive: false }).addTo(map);

            onRouteCalculated({
              distanceMiles,
              timeMinutes,
              routePoints,
              instructions: [
                `Route via OpenStreetMap (${distanceMiles.toFixed(1)} miles, ~${Math.round(timeMinutes)} mins)`
              ],
            });
          }
        })
        .catch((err) => {
          console.warn("OSRM Routing fetch error, using fallback Haversine:", err);
          // Fallback Haversine
          const R = 3958.8; // Radius of Earth in miles
          const dLat = ((dropoffCoords.lat - pickupCoords.lat) * Math.PI) / 180;
          const dLon = ((dropoffCoords.lng - pickupCoords.lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((pickupCoords.lat * Math.PI) / 180) *
              Math.cos((dropoffCoords.lat * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distanceMiles = R * c * 1.3; // 1.3 road factor
          const timeMinutes = (distanceMiles / 35) * 60; // assume 35mph avg

          const latLngs = [
            [pickupCoords.lat, pickupCoords.lng] as [number, number],
            [dropoffCoords.lat, dropoffCoords.lng] as [number, number],
          ];

          const polyline = L.polyline(latLngs, {
            color: "#059669",
            weight: 5,
            opacity: 0.85,
          }).addTo(map);

          routePolylineRef.current = polyline;

          const midLat = (pickupCoords.lat + dropoffCoords.lat) / 2;
          const midLng = (pickupCoords.lng + dropoffCoords.lng) / 2;
          const badgeIcon = L.divIcon({
            className: "custom-distance-badge",
            html: `
              <div style="background-color: #ffffff; color: #047857; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 9999px; border: 2px solid #059669; box-shadow: 0 2px 6px rgba(0,0,0,0.15); font-family: sans-serif; white-space: nowrap;">
                ${distanceMiles.toFixed(1)} mi
              </div>
            `,
            iconSize: [60, 24],
            iconAnchor: [30, 12],
          });
          distanceMarkerRef.current = L.marker([midLat, midLng], { icon: badgeIcon, interactive: false }).addTo(map);

          onRouteCalculated({
            distanceMiles,
            timeMinutes,
            routePoints: [
              { lat: pickupCoords.lat, lng: pickupCoords.lng },
              { lat: dropoffCoords.lat, lng: dropoffCoords.lng }
            ],
            instructions: [`Direct Route (~${distanceMiles.toFixed(1)} miles)`],
          });
        });

      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (hasBounds) {
      map.setView([pickupCoords ? pickupCoords.lat : dropoffCoords!.lat, pickupCoords ? pickupCoords.lng : dropoffCoords!.lng], 13);
    }
  }, [pickupCoords, dropoffCoords]);

  return (
    <div className="relative w-full h-full min-h-[250px]" style={{ filter: "none", backgroundColor: "#e5e3df" }}>
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[250px] rounded-2xl overflow-hidden border border-slate-200 z-0"
        style={{ filter: "none", backgroundColor: "#e5e3df" }}
      />
    </div>
  );
}
