"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Komponent AuthProvider (Dostawca Autoryzacji)
 * Otacza całą aplikację tym komponentem, dzięki czemu każda strona i przycisk
 * wiedzą, czy użytkownik jest zalogowany i kim jest.
 */
export default function AuthProvider({ children }) {
    return <SessionProvider>{children}</SessionProvider>;
}
