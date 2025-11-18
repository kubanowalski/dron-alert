import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const incident = await prisma.incident.findUnique({
            where: { id },
        });

        if (!incident) {
            return NextResponse.json({ error: "Incident not found" }, { status: 404 });
        }

        return NextResponse.json(incident);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();

        // Allow updating specific fields
        const { description, type, status, location } = body;

        const updatedIncident = await prisma.incident.update({
            where: { id },
            data: {
                ...(description && { description }),
                ...(type && { type }),
                ...(status && { status }),
                ...(location && { location: JSON.stringify(location) }),
            },
        });

        return NextResponse.json(updatedIncident);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        // In a real app, we might just mark as cancelled instead of deleting
        // But WF-05 says "Anulowanie", which could mean status change or delete.
        // Let's assume status change to "CANCELLED" for history preservation, 
        // or actual delete if it was a mistake. 
        // Let's implement status change to CANCELLED as it's safer.

        const updatedIncident = await prisma.incident.update({
            where: { id },
            data: { status: "CANCELLED" },
        });

        return NextResponse.json(updatedIncident);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
