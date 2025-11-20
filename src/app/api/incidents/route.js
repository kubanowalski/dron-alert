import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimitUser } from "@/lib/rateLimit";

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 60 incidents per hour per user
    const rateLimitResult = rateLimitUser(session.user.id);
    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                error: "Zbyt wiele zgłoszeń. Spróbuj ponownie później.",
                retryAfter: rateLimitResult.resetTime
            },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': '60',
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(rateLimitResult.resetTime),
                    'Retry-After': String(rateLimitResult.resetTime),
                }
            }
        );
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

        // Validate type enum
        const validTypes = ['RESTRICTED_ZONE', 'PRIVACY_VIOLATION', 'DANGEROUS_FLIGHT', 'OTHER'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: "Invalid incident type" },
                { status: 400 }
            );
        }

        // Validate description length (matches frontend maxLength)
        if (description.length > 500) {
            return NextResponse.json(
                { error: "Description too long (max 500 characters)" },
                { status: 400 }
            );
        }

        // Validate location format
        let parsedLocation;
        try {
            parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
            if (!parsedLocation.lat || !parsedLocation.lng) {
                throw new Error("Invalid location format");
            }
        } catch (e) {
            return NextResponse.json(
                { error: "Invalid location format" },
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
        console.error("Error creating incident:", error.message);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// GET all incidents (filtered by user or all for admins)
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting: 60 requests per hour per user
        const rateLimitResult = rateLimitUser(session.user.id);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: "Zbyt wiele żądań. Spróbuj ponownie później.",
                    retryAfter: rateLimitResult.resetTime
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': '60',
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(rateLimitResult.resetTime),
                    }
                }
            );
        }

        const isAdmin = session.user.role === "ADMIN";

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

        return NextResponse.json(incidents);
    } catch (error) {
        console.error("Error fetching incidents:", error.message);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
