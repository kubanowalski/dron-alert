"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import IncidentList from "@/components/IncidentList";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = session?.user?.role === "ADMIN";

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/auth/login");
            return;
        }

        fetch("/api/incidents")
            .then((res) => res.json())
            .then((data) => {
                setIncidents(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching incidents:", err);
                setLoading(false);
            });
    }, [session, status, router]);

    if (status === "loading" || loading) {
        return <div className="loading">Ładowanie...</div>;
    }

    return (
        <div>
            <h1 className="mb-xl">
                {isAdmin ? "Wszystkie zgłoszenia" : "Moje zgłoszenia"}
            </h1>
            {incidents.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "var(--space-3xl)" }}>
                    <p className="text-muted mb-lg">
                        {isAdmin ? "Brak zgłoszeń w systemie." : "Nie masz jeszcze żadnych zgłoszeń."}
                    </p>
                    <a href="/report" className="btn btn-primary">
                        Zgłoś incydent
                    </a>
                </div>
            ) : (
                <IncidentList incidents={incidents} showUserInfo={isAdmin} />
            )}
        </div>
    );
}
