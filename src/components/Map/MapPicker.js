"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Naprawiamy domyślne ikony pinezek Leaflet, które nie ładują się poprawnie w Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/images/marker-icon-2x.png",
    iconUrl: "/images/marker-icon.png",
    shadowUrl: "/images/marker-shadow.png",
});

/**
 * Komponent LocationMarker (Pinezka)
 * Obsługuje kliknięcie na mapę:
 * 1. Stawia pinezkę w klikniętym miejscu.
 * 2. Przesuwa mapę do pinezki.
 * 3. Zamienia współrzędne na adres (tzw. Reverse Geocoding).
 */
function LocationMarker({ position, setPosition, setAddress }) {
    const map = useMapEvents({
        click(e) {
            const newPos = e.latlng;
            setPosition(newPos);
            map.flyTo(newPos, map.getZoom());

            // Pytamy OpenStreetMap jaki to adres
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}`, {
                headers: {
                    'User-Agent': 'DronAlert/1.0'
                }
            })
                .then((res) => {
                    if (!res.ok) throw new Error('Geocoding failed');
                    return res.json();
                })
                .then((data) => {
                    if (data.display_name) {
                        setAddress(data.display_name);
                    }
                })
                .catch((err) => {
                    console.warn("Reverse geocoding error:", err);
                    // Nawet jak nie znajdziemy adresu, to współrzędne są ok
                });
        },
    });

    // Jeśli pozycja zmieni się "z zewnątrz" (np. przez wyszukiwarkę), przesuń mapę
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : <Marker position={position} />;
}

/**
 * Komponent MapPicker (Wybieracz Lokalizacji)
 * To główne narzędzie do mapy. Pozwala wybrać lokalizację na 3 sposoby:
 * 1. Kliknięcie na mapie
 * 2. Wpisanie adresu w wyszukiwarkę
 * 3. Użycie przycisku "Moja lokalizacja" (GPS)
 */
export default function MapPicker({ onLocationSelect, initialLocation }) {
    // Domyślnie Warszawa centrum jeśli brak innej lokalizacji
    const [position, setPosition] = useState(initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : { lat: 52.2297, lng: 21.0122 });
    const [address, setAddress] = useState(initialLocation?.address || "");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Automatyczne podpowiadanie adresu po 500ms od przestania pisania (debounce)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length < 3) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            try {
                // Search for addresses in Poland
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=pl&limit=5&addressdetails=1`
                );
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Autocomplete error:", error);
            }
        }, 500); // 500ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Notify parent component when location changes
    const handleLocationSelect = useCallback((location) => {
        if (onLocationSelect) {
            onLocationSelect(location);
        }
    }, [onLocationSelect]);

    // Sync state with parent callback
    useEffect(() => {
        if (position && address) {
            handleLocationSelect({
                lat: position.lat,
                lng: position.lng,
                address: address,
            });
        }
    }, [position, address, handleLocationSelect]);

    // Handle direct search submission
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

    // Use browser geolocation API
    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            alert("Twoja przeglądarka nie obsługuje geolokalizacji.");
            return;
        }

        setIsSearching(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setPosition(newPos);

                // Reverse geocoding for the new position
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}`)
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.display_name) {
                            setAddress(data.display_name);
                        }
                    })
                    .catch((err) => console.error("Reverse geocoding error:", err))
                    .finally(() => setIsSearching(false));
            },
            (error) => {
                console.error("Geolocation error:", error);
                let errorMsg = "Nie udało się pobrać lokalizacji.";
                if (error.code === 1) errorMsg = "Brak zgody na udostępnienie lokalizacji.";
                else if (error.code === 2) errorMsg = "Lokalizacja niedostępna.";
                else if (error.code === 3) errorMsg = "Upłynął limit czasu żądania lokalizacji.";

                alert(errorMsg);
                setIsSearching(false);
            }
        );
    };

    // Handle clicking on an autocomplete suggestion
    const handleSuggestionClick = (suggestion) => {
        const newPos = {
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon),
        };
        setPosition(newPos);
        setAddress(suggestion.display_name);
        setSearchQuery(suggestion.display_name);
        setShowSuggestions(false);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchQuery);
    };

    return (
        <div>
            {/* Search Input and Geolocation Button */}
            <div style={{ marginBottom: "var(--space-md)", position: "relative" }}>
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
                        title="Szukaj adresu"
                    >
                        {isSearching ? "..." : "🔍"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleGeolocation}
                        disabled={isSearching}
                        title="Pobierz moją lokalizację"
                    >
                        📍
                    </button>
                </div>
                {/* Autocomplete Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <ul style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        position: "absolute",
                        zIndex: 1000,
                        backgroundColor: "var(--color-surface)",
                        border: "var(--border-width) solid var(--color-border)",
                        borderRadius: "var(--border-radius)",
                        width: "100%",
                        maxHeight: "200px",
                        overflowY: "auto",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                    }}>
                        {suggestions.map((suggestion) => (
                            <li
                                key={suggestion.place_id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                style={{
                                    padding: "var(--space-sm) var(--space-md)",
                                    cursor: "pointer",
                                    borderBottom: "1px solid var(--color-border)",
                                    fontSize: "var(--font-size-sm)"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-background)"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                {suggestion.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Address Display */}
            <p className="text-xs text-muted" style={{ marginTop: 0, marginBottom: "var(--space-sm)" }}>
                {address ? `📍 ${address}` : "Kliknij na mapie lub wyszukaj adres"}
            </p>

            {/* Map Container */}
            <MapContainer
                center={[position.lat, position.lng]}
                zoom={13}
                style={{ height: "400px", width: "100%", borderRadius: "var(--border-radius)" }}
                zoomControl={false}
            >
                <ZoomControl position="bottomleft" />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
            </MapContainer>
        </div>
    );
}
