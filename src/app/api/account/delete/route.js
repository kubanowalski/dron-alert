import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * API: Usuwanie konta (DELETE)
 * Miękkie usuwanie — ustawia pole `deleted` na true.
 * Użytkownik może usunąć TYLKO swoje własne konto (ID pochodzi z sesji serwera).
 */
export async function DELETE() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { deleted: true },
        });

        return NextResponse.json({ message: "Konto zostało usunięte" });
    } catch (error) {
        console.error("Account deletion error:", error);
        return NextResponse.json(
            { error: "Wystąpił błąd podczas usuwania konta" },
            { status: 500 }
        );
    }
}
