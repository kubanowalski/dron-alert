import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { rateLimitRegister } from "@/lib/rateLimit";

export async function POST(request) {
    // Rate limiting: 3 registrations per hour per IP
    const rateLimitResult = rateLimitRegister(request);
    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                error: "Zbyt wiele prób rejestracji. Spróbuj ponownie później.",
                retryAfter: rateLimitResult.resetTime
            },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': '3',
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(rateLimitResult.resetTime),
                    'Retry-After': String(rateLimitResult.resetTime),
                }
            }
        );
    }

    try {
        const { email, password, name, firstName, lastName } = await request.json();

        // Walidacja email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Response.json(
                { error: "Nieprawidłowy format email" },
                { status: 400 }
            );
        }

        // Walidacja hasła
        if (password.length < 8) {
            return Response.json(
                { error: "Hasło musi mieć minimum 8 znaków" },
                { status: 400 }
            );
        }

        if (!/[A-Z]/.test(password)) {
            return Response.json(
                { error: "Hasło musi zawierać przynajmniej jedną wielką literę" },
                { status: 400 }
            );
        }

        if (!/[0-9]/.test(password)) {
            return Response.json(
                { error: "Hasło musi zawierać przynajmniej jedną cyfrę" },
                { status: 400 }
            );
        }

        // Sprawdź czy użytkownik już istnieje
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Generic message to prevent user enumeration
            return Response.json(
                { error: "Nie można zarejestrować konta. Sprawdź poprawność danych." },
                { status: 400 }
            );
        }

        // Hash hasła
        const hashedPassword = await bcrypt.hash(password, 10);

        // Utwórz użytkownika
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                firstName,
                lastName,
            },
        });

        return Response.json(
            {
                message: "Konto utworzone pomyślnie",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error.message);
        return Response.json(
            { error: "Wystąpił błąd podczas rejestracji" },
            { status: 500 }
        );
    }
}
