import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Obsługa Auth (Logowanie/Wylogowanie)
 * Ten plik to "centrum sterowania" logowaniem.
 * NextAuth automatycznie obsługuje tutaj zapytania o logowanie (SignIn) i wylogowanie (SignOut).
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
