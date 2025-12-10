import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { rateLimitRegister } from "@/lib/rateLimit";

/**
 * API Rejestracji (POST)
 * Tutaj trafiają dane, gdy ktoś klika "Zarejestruj się".
 * Tworzymy nowe konto użytkownika w bazie danych.
 */
export async function POST(request) {
    // Rate limiting using in-memory store: 3 registrations per hour per IP
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

        // Email validation regex check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Nieprawidłowy format email" },
                { status: 400 }
            );
        }

        // Password complexity validation
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Hasło musi mieć minimum 8 znaków" },
                { status: 400 }
            );
        }

        if (!/[A-Z]/.test(password)) {
            return NextResponse.json(
                { error: "Hasło musi zawierać przynajmniej jedną wielką literę" },
                { status: 400 }
            );
        }

        if (!/[0-9]/.test(password)) {
            return NextResponse.json(
                { error: "Hasło musi zawierać przynajmniej jedną cyfrę" },
                { status: 400 }
            );
        }

        // Check for existing user to prevent duplicates
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Generic message to prevent user enumeration security risk
            return NextResponse.json(
                { error: "Nie można zarejestrować konta. Sprawdź poprawność danych." },
                { status: 400 }
            );
        }

        // Hash password securely
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in database
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                firstName,
                lastName,
            },
        });

        // Return success response (excluding password)
        return NextResponse.json(
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
        return NextResponse.json(
            { error: "Wystąpił błąd podczas rejestracji" },
            { status: 500 }
        );
    }
}
