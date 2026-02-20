"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import IncidentList from "@/components/IncidentList";

/**
 * Panel Administratora
 * Centrum zarządzania dla osób z uprawnieniami ADMIN.
 * Pozwala na:
 * - Przeglądanie statystyk (ile zgłoszeń, ile zaakceptowanych itd.)
 * - Filtrowanie zgłoszeń (np. pokaż tylko te "Odrzucone")
 * - Szukanie po lokalizacji
 */
export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        reported: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
    });

    // Filters and Sorting State
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [searchLocation, setSearchLocation] = useState("");
    const [sortOrder, setSortOrder] = useState("desc"); // desc = items newest first

    // Fetch all incidents
    const fetchIncidents = useCallback(async () => {
        try {
            const res = await fetch("/api/incidents");
            if (!res.ok) throw new Error("Failed to fetch incidents");

            const data = await res.json();

            if (!Array.isArray(data)) {
                console.error("Received invalid incidents data:", data);
                setIncidents([]);
                setLoading(false);
                return;
            }

            setIncidents(data);

            // Calculate stats
            setStats({
                total: data.length,
                reported: data.filter(i => i.status === "REPORTED").length,
                accepted: data.filter(i => i.status === "ACCEPTED").length,
                rejected: data.filter(i => i.status === "REJECTED").length,
                cancelled: data.filter(i => i.status === "CANCELLED").length,
            });

            setLoading(false);
        } catch (err) {
            console.error("Error fetching incidents:", err);
            setIncidents([]);
            setLoading(false);
        }
    }, []);

    // Check authentication and role
    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/auth/login");
            return;
        }

        if (session.user.role !== "ADMIN") {
            router.push("/");
            return;
        }

        fetchIncidents();
    }, [session, status, router, fetchIncidents]);



    // Filter and Sort Incidents
    const filteredAndSortedIncidents = useMemo(() => {
        let filtered = [...incidents];

        // Filter by Status
        if (selectedStatuses.length > 0) {
            filtered = filtered.filter(incident =>
                selectedStatuses.includes(incident.status)
            );
        }

        // Filter by Location
        if (searchLocation.trim()) {
            const searchLower = searchLocation.toLowerCase();
            filtered = filtered.filter(incident => {
                try {
                    const location = JSON.parse(incident.location);
                    return location.address && location.address.toLowerCase().includes(searchLower);
                } catch {
                    return false;
                }
            });
        }

        // Sort by Date
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, [incidents, selectedStatuses, searchLocation, sortOrder]);

    // Toggle status filter
    const toggleStatusFilter = (status) => {
        setSelectedStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedStatuses([]);
        setSearchLocation("");
        setSortOrder("desc");
    };

    // Check if there are active filters
    const hasActiveFilters = selectedStatuses.length > 0 || searchLocation.trim() !== "";

    if (status === "loading" || loading) {
        return <div className="loading">Ładowanie...</div>;
    }

    if (!session || session.user.role !== "ADMIN") {
        return null;
    }

    return (
        <div>
            <h1 className="mb-xl">Panel administratora</h1>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="card" style={{ textAlign: "center" }}>
                    <p className="text-xs text-muted mb-xs">Wszystkie zgłoszenia</p>
                    <h2 className="mb-0" style={{ fontSize: "2rem" }}>{stats.total}</h2>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                    <p className="text-xs text-muted mb-xs">Oczekujące</p>
                    <h2 className="mb-0" style={{ fontSize: "2rem", color: "#eab308" }}>{stats.reported}</h2>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                    <p className="text-xs text-muted mb-xs">Zaakceptowane</p>
                    <h2 className="mb-0" style={{ fontSize: "2rem", color: "#16a34a" }}>{stats.accepted}</h2>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                    <p className="text-xs text-muted mb-xs">Odrzucone</p>
                    <h2 className="mb-0" style={{ fontSize: "2rem", color: "#dc2626" }}>{stats.rejected}</h2>
                </div>
            </div>

            {/* Filters Section */}
            <div className="card" style={{ marginBottom: "var(--space-2xl)" }}>
                <h3 className="mb-lg">Filtry i sortowanie</h3>

                {/* Status Filters */}
                <div className="mb-lg">
                    <label className="form-label">Status zgłoszenia</label>
                    <div className="filter-chips">
                        <button
                            className={`filter-chip ${selectedStatuses.includes("REPORTED") ? "filter-chip-active" : ""}`}
                            onClick={() => toggleStatusFilter("REPORTED")}
                        >
                            Oczekujące ({stats.reported})
                        </button>
                        <button
                            className={`filter-chip ${selectedStatuses.includes("ACCEPTED") ? "filter-chip-active" : ""}`}
                            onClick={() => toggleStatusFilter("ACCEPTED")}
                        >
                            Zaakceptowane ({stats.accepted})
                        </button>
                        <button
                            className={`filter-chip ${selectedStatuses.includes("REJECTED") ? "filter-chip-active" : ""}`}
                            onClick={() => toggleStatusFilter("REJECTED")}
                        >
                            Odrzucone ({stats.rejected})
                        </button>
                        <button
                            className={`filter-chip ${selectedStatuses.includes("CANCELLED") ? "filter-chip-active" : ""}`}
                            onClick={() => toggleStatusFilter("CANCELLED")}
                        >
                            Anulowane ({stats.cancelled})
                        </button>
                    </div>
                </div>

                {/* Location Search */}
                <div className="mb-lg">
                    <label className="form-label" htmlFor="location-search">Miejscowość</label>
                    <input
                        id="location-search"
                        type="text"
                        className="input"
                        placeholder="Wpisz nazwę miejscowości..."
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                    />
                </div>

                {/* Sort Order */}
                <div className="mb-lg">
                    <label className="form-label">Sortowanie</label>
                    <div className="filter-chips">
                        <button
                            className={`filter-chip ${sortOrder === "desc" ? "filter-chip-active" : ""}`}
                            onClick={() => setSortOrder("desc")}
                        >
                            Najnowsze pierwsze ↓
                        </button>
                        <button
                            className={`filter-chip ${sortOrder === "asc" ? "filter-chip-active" : ""}`}
                            onClick={() => setSortOrder("asc")}
                        >
                            Najstarsze pierwsze ↑
                        </button>
                    </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                        Wyczyść wszystkie filtry
                    </button>
                )}
            </div>

            {/* Results Info */}
            <div className="flex-between mb-lg">
                <h2 className="mb-0">Zgłoszenia</h2>
                <p className="text-muted mb-0">
                    Wyświetlane: {filteredAndSortedIncidents.length} / {incidents.length}
                </p>
            </div>

            {incidents.length === 0 ? (
                <p className="text-muted">Brak zgłoszeń w systemie.</p>
            ) : filteredAndSortedIncidents.length === 0 ? (
                <div className="card text-center">
                    <p className="text-muted mb-0">Brak zgłoszeń spełniających kryteria filtrowania.</p>
                </div>
            ) : (
                <IncidentList incidents={filteredAndSortedIncidents} showUserInfo={true} isAdmin={true} />
            )}
        </div>
    );
}
