import { PrismaClient } from "@prisma/client";
import IncidentList from "@/components/IncidentList";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic"; // Ensure fresh data

export default async function DashboardPage() {
    const incidents = await prisma.incident.findMany({
        where: { userId: "user-1" },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>Moje Zgłoszenia</h1>
            </div>
            <IncidentList incidents={incidents} />
        </div>
    );
}
