import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { type, description, location, photoUrl } = body;

        // Basic validation
        if (!type || !description || !location) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const incident = await prisma.incident.create({
            data: {
                type,
                description,
                location: typeof location === 'string' ? location : JSON.stringify(location),
                photoUrl,
                userId: session.user.id,
            },
        });

        return NextResponse.json(incident, { status: 201 });
    } catch (error) {
        console.error("Error creating incident:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}

// GET all incidents (filtered by user or all for admins)
export async function GET(request) {
    console.log("GET /api/incidents called");
    try {
        const session = await getServerSession(authOptions);
        console.log("Session in API:", session ? "Found" : "Missing");

        if (!session) {
            console.log("Unauthorized access attempt");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const isAdmin = session.user.role === "ADMIN";
        console.log("User role:", session.user.role);

        const incidents = await prisma.incident.findMany({
            where: isAdmin ? {} : { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            ...(isAdmin && {
                include: {
                    User: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            }),
        });

        console.log(`Found ${incidents.length} incidents`);
        return NextResponse.json(incidents);
    } catch (error) {
        console.error("Error fetching incidents:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
