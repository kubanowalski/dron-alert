import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getValidIncidentTypes, getValidIncidentStatuses, VALIDATION_LIMITS } from "@/lib/constants";

/**
 * API: Pobieranie szczegółów incydentu (GET)
 * Dostęp: Właściciel zgłoszenia LUB Admin.
 */
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

        // Sprawdzamy uprawnienia: Właściciel lub Admin
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

/**
 * API: Aktualizacja incydentu (PATCH)
 * - Właściciel: Może edytować opis, typ, lokalizację.
 * - Admin: Może zmieniać STATUS (np. na ACCEPTED).
 */
export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { description, type, status, location } = body;

        // Walidacja danych
        if (type && !getValidIncidentTypes().includes(type)) {
            return NextResponse.json(
                { error: "Invalid incident type" },
                { status: 400 }
            );
        }

        if (status && !getValidIncidentStatuses().includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        if (description && description.length > VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH) {
            return NextResponse.json(
                { error: `Description too long (max ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters)` },
                { status: 400 }
            );
        }

        if (location) {
            try {
                const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
                if (!parsedLocation.lat || !parsedLocation.lng) {
                    throw new Error("Invalid location format");
                }
            } catch (e) {
                return NextResponse.json(
                    { error: "Invalid location format" },
                    { status: 400 }
                );
            }
        }

        // Sprawdzamy uprawnienia do zmiany statusu (TYLKO ADMIN)
        if (status && session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden: Only administrators can change incident status" },
                { status: 403 }
            );
        }

        // Jeśli to nie zmiana statusu, sprawdzamy czy user jest właścicielem
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

/**
 * API: Anulowanie incydentu (DELETE)
 * Nie usuwamy go fizycznie z bazy, tylko ustawiamy status na CANCELLED.
 * Robić to może tylko właściciel lub Admin.
 */
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;

        // Sprawdzamy czy zgłoszenie istnieje i do kogo należy
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

        // Soft delete (miękkie usuwanie) - zmiana statusu
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
