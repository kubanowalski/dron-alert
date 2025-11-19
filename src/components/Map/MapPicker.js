"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition, setAddress }) {
    const map = useMapEvents({
        click(e) {
            const newPos = e.latlng;
            setPosition(newPos);
            map.flyTo(newPos, map.getZoom());

            // Reverse geocoding
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.display_name) {
                        setAddress(data.display_name);
                    }
                })
                .catch((err) => console.error("Reverse geocoding error:", err));
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : <Marker position={position} />;
}

export default function MapPicker({ onLocationSelect }) {
    const [position, setPosition] = useState({ lat: 52.2297, lng: 21.0122 });
    const [address, setAddress] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const handleLocationSelect = useCallback((location) => {
        if (onLocationSelect) {
            onLocationSelect(location);
        }
    }, [onLocationSelect]);

    useEffect(() => {
        if (position && address) {
            handleLocationSelect({
                lat: position.lat,
                lng: position.lng,
                address: address,
            });
        }
    }, [position, address, handleLocationSelect]);

    const handleSearch = async (query) => {
        if (!query || query.length < 3) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=pl&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const result = data[0];
                const newPos = {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon),
                };
                setPosition(newPos);
                setAddress(result.display_name);
            }
        } catch (error) {
            console.error("Forward geocoding error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchQuery);
    };

    return (
        <div>
            {/* Search Input */}
            <div style={{ marginBottom: "var(--space-md)" }}>
                <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Wyszukaj adres lub kliknij na mapie"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearch(searchQuery);
                            }
                        }}
                        style={{ flex: 1 }}
                    />
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleSearch(searchQuery)}
                        disabled={isSearching || searchQuery.length < 3}
                    >
                        {isSearching ? "..." : "🔍"}
                    </button>
                </div>
            </div>

            {/* Map */}
            <MapContainer
                center={[position.lat, position.lng]}
                zoom={13}
                style={{ height: "400px", width: "100%", borderRadius: "var(--border-radius)" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
            </MapContainer>

            <p className="text-xs text-muted" style={{ marginTop: "var(--space-sm)", marginBottom: 0 }}>
                {address ? `📍 ${address}` : "Kliknij na mapie lub wyszukaj adres"}
            </p>
        </div>
    );
}
