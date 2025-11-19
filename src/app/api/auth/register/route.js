import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
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
            return Response.json(
                { error: "Użytkownik z tym adresem email już istnieje" },
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
        console.error("Registration error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return Response.json(
            { error: "Wystąpił błąd podczas rejestracji: " + error.message },
            { status: 500 }
        );
    }
}
