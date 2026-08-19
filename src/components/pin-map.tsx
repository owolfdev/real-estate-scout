"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BANGKOK } from "@/lib/geo";

type Point = { lat: number; lng: number };

function markerIcon(fill: string) {
  return L.divIcon({
    className: "scout-marker",
    iconSize: [22, 30],
    iconAnchor: [11, 30],
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 24 32" aria-hidden="true"><path fill="${fill}" stroke="#fff" stroke-width="1.5" d="M12 1.2C6.7 1.2 2.4 5.5 2.4 10.8c0 7.2 9.6 19 9.6 19s9.6-11.8 9.6-19C21.6 5.5 17.3 1.2 12 1.2z"/><circle cx="12" cy="11" r="3.4" fill="#fff"/></svg>`,
  });
}

const propertyIcon = markerIcon("#23272e");
const originIcon = markerIcon("#4ec9b0");

export function PinMap({
  pin,
  radiusM,
  markers,
  onPin,
}: {
  pin: Point | null;
  radiusM: number;
  markers: Point[];
  onPin: (point: Point) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const onPinRef = useRef(onPin);
  onPinRef.current = onPin;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || mapRef.current) return;

    const map = L.map(host, {
      zoomControl: true,
      attributionControl: true,
    }).setView([BANGKOK.lat, BANGKOK.lng], 12);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      },
    ).addTo(map);

    map.on("click", (event: L.LeafletMouseEvent) => {
      onPinRef.current({ lat: event.latlng.lat, lng: event.latlng.lng });
    });

    mapRef.current = map;
    layersRef.current = L.layerGroup().addTo(map);

    const frame = window.requestAnimationFrame(() => map.invalidateSize());
    return () => {
      window.cancelAnimationFrame(frame);
      map.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    if (pin) {
      const circle = L.circle([pin.lat, pin.lng], {
        radius: radiusM,
        color: "#4ec9b0",
        weight: 2,
        opacity: 0.55,
        fillColor: "#4ec9b0",
        fillOpacity: 0.14,
        interactive: false,
      }).addTo(layers);

      for (const marker of markers) {
        L.marker([marker.lat, marker.lng], {
          icon: propertyIcon,
          keyboard: false,
        })
          .on("click", (event) => L.DomEvent.stopPropagation(event))
          .addTo(layers);
      }

      L.marker([pin.lat, pin.lng], { icon: originIcon, keyboard: false })
        .on("click", (event) => L.DomEvent.stopPropagation(event))
        .addTo(layers);
      map.fitBounds(circle.getBounds(), { padding: [28, 28], maxZoom: 15 });
    }
  }, [pin, radiusM, markers]);

  return <div ref={hostRef} className="scout-pin-map h-64 w-full md:h-80" />;
}
