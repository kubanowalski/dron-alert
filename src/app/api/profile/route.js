import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * API: Pobieranie profilu (GET)
 * Zwraca dane aktualnie zalogowanego użytkownika.
 */
export async function GET(request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Zwracamy dane (ale bez hasła!)
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
        },
    });

    return NextResponse.json(user);
}

/**
 * API: Aktualizacja profilu (PATCH)
 * Pozwala zmienić dane osobowe ORAZ hasło.
 */
export async function PATCH(request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await request.json();
        const { email, name, firstName, lastName, currentPassword, newPassword } = data;

        // Scenariusz: Zmiana hasła
        if (newPassword) {
            // Musimy sprawdzić stare hasło dla bezpieczeństwa
            if (!currentPassword) {
                return NextResponse.json(
                    { error: "Obecne hasło jest wymagane" },
                    { status: 400 }
                );
            }

            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
            });

            // Czy stare hasło się zgadza?
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: "Nieprawidłowe obecne hasło" },
                    { status: 400 }
                );
            }

            // Walidacja nowego hasła (długość, znaki)
            if (newPassword.length < 8) {
                return NextResponse.json(
                    { error: "Nowe hasło musi mieć minimum 8 znaków" },
                    { status: 400 }
                );
            }

            if (!/[A-Z]/.test(newPassword)) {
                return NextResponse.json(
                    { error: "Nowe hasło musi zawierać przynajmniej jedną wielką literę" },
                    { status: 400 }
                );
            }

            if (!/[0-9]/.test(newPassword)) {
                return NextResponse.json(
                    { error: "Nowe hasło musi zawierać przynajmniej jedną cyfrę" },
                    { status: 400 }
                );
            }

            // Szyfrowanie nowego hasła
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Aktualizacja w bazie (z hasłem)
            const updatedUser = await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    email,
                    name,
                    firstName,
                    lastName,
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    firstName: true,
                    lastName: true,
                },
            });

            return NextResponse.json(updatedUser);
        }

        // Scenariusz: Zwykła aktualizacja (bez zmiany hasła)
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                email,
                name,
                firstName,
                lastName,
            },
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                lastName: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { error: "Wystąpił błąd podczas aktualizacji profilu" },
            { status: 500 }
        );
    }
}
