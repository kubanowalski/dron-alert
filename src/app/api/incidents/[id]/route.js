import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET single incident
export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const incident = await prisma.incident.findUnique({
            where: { id },
        });

        if (!incident) {
            return NextResponse.json({ error: "Incident not found" }, { status: 404 });
        }

        // Check if user is owner or admin
        if (incident.userId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden: You can only view your own incidents" },
                { status: 403 }
            );
        }

        return NextResponse.json(incident);
    } catch (error) {
        console.error("Error fetching incident:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH update incident
export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { description, type, status, location } = body;

        // Check if trying to update status - only admins can do this
        if (status && session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden: Only administrators can change incident status" },
                { status: 403 }
            );
        }

        // For non-status updates, verify ownership
        if (!status) {
            const incident = await prisma.incident.findUnique({
                where: { id },
                select: { userId: true },
            });

            if (!incident) {
                return NextResponse.json({ error: "Incident not found" }, { status: 404 });
            }

            if (incident.userId !== session.user.id && session.user.role !== "ADMIN") {
                return NextResponse.json(
                    { error: "Forbidden: You can only edit your own incidents" },
                    { status: 403 }
                );
            }
        }

        const updatedIncident = await prisma.incident.update({
            where: { id },
            data: {
                ...(description && { description }),
                ...(type && { type }),
                ...(status && { status }),
                ...(location && { location: typeof location === 'string' ? location : JSON.stringify(location) }),
            },
        });

        return NextResponse.json(updatedIncident);
    } catch (error) {
        console.error("Error updating incident:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE/CANCEL incident (soft delete by setting status to CANCELLED)
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;

        // Verify ownership before cancelling
        const incident = await prisma.incident.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!incident) {
            return NextResponse.json({ error: "Incident not found" }, { status: 404 });
        }

        if (incident.userId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden: You can only cancel your own incidents" },
                { status: 403 }
            );
        }

        const updatedIncident = await prisma.incident.update({
            where: { id },
            data: { status: "CANCELLED" },
        });

        return NextResponse.json(updatedIncident);
    } catch (error) {
        console.error("Error cancelling incident:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
