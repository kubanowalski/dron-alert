import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimitUser } from "@/lib/rateLimit";
import { getValidIncidentTypes, VALIDATION_LIMITS } from "@/lib/constants";

/**
 * API: Tworzenie nowego incydentu (POST)
 * Dostęp: Tylko zalogowani użytkownicy.
 * Dodatkowo: Zabezpieczenie przedspamowaniem (Rate Limiting).
 */
export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Limitujemy: 60 zgłoszeń na godzinę na użytkownika
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

        // Podstawowa walidacja - czy wszystkie pola są wypełnione
        if (!type || !description || !location) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Sprawdzamy czy typ incydentu jest na naszej liście dozwolonych
        if (!getValidIncidentTypes().includes(type)) {
            return NextResponse.json(
                { error: "Invalid incident type" },
                { status: 400 }
            );
        }

        // Sprawdzamy długość opisu
        if (description.length > VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH) {
            return NextResponse.json(
                { error: `Description too long (max ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters)` },
                { status: 400 }
            );
        }

        // Sprawdzamy poprawność lokalizacji (czy ma lat i lng)
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

        // Zapisujemy incydent w bazie danych, przypisany do aktualnego użytkownika
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

/**
 * API: Pobieranie listy incydentów (GET)
 * - Zwykły Użytkownik: dostaje tylko SWOJE zgłoszenia.
 * - Admin: dostaje WSZYSTKIE zgłoszenia.
 * Wyniki są sortowane od najnowszych.
 */
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Limitujemy zapytania: 60 na godzinę
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

        // Pobieramy z bazy (z filtrem lub bez, zależnie od roli)
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
