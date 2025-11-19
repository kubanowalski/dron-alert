"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import IncidentList from "@/components/IncidentList";

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
    }, [session, status, router]);

    const fetchIncidents = async () => {
        try {
            const res = await fetch("/api/incidents");
            const data = await res.json();

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
            setLoading(false);
        }
    };

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
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--space-lg)",
                marginBottom: "var(--space-2xl)"
            }}>
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

            <h2 className="mb-lg">Wszystkie zgłoszenia</h2>

            {incidents.length === 0 ? (
                <p className="text-muted">Brak zgłoszeń w systemie.</p>
            ) : (
                <IncidentList incidents={incidents} showUserInfo={true} isAdmin={true} />
            )}
        </div>
    );
}
