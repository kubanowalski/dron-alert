"use client";

import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

/**
 * Komponent MapView (Podgląd Mapy)
 * Wyświetla mapę tylko do odczytu (bez możliwości edycji) z zaznaczoną pinezką.
 */
export default function MapView({ location }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Fix for Leaflet icons in Next.js
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/images/marker-icon-2x.png',
            iconUrl: '/images/marker-icon.png',
            shadowUrl: '/images/marker-shadow.png',
        });
    }, []);

    // Prevent server-side rendering issues
    if (!isMounted || !location) return <p>Loading map...</p>;

    const position = [location.lat, location.lng];

    return (
        <MapContainer
            center={position}
            zoom={13}
            style={{ height: "300px", width: "100%" }}
            dragging={false}
            scrollWheelZoom={false}
            zoomControl={false}
        >
            <ZoomControl position="bottomleft" />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} />
        </MapContainer>
    );
}
