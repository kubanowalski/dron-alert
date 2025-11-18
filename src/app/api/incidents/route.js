import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request) {
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
                location: JSON.stringify(location), // Store as JSON string
                photoUrl,
                userId: "user-1", // Mock user ID
            },
        });

        return NextResponse.json(incident, { status: 201 });
    } catch (error) {
        console.error("Error creating incident:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const incidents = await prisma.incident.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(incidents);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
