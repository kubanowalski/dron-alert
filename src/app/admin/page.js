import { PrismaClient } from "@prisma/client";
import IncidentList from "@/components/IncidentList";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const incidents = await prisma.incident.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div>
            <h1 style={{ marginBottom: "2rem" }}>Panel Administratora</h1>
            <IncidentList incidents={incidents} isAdmin={true} />
        </div>
    );
}
