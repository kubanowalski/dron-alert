import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Konfiguracja NextAuth (Logowanie)
 * Tutaj ustalamy zasady logowania do aplikacji.
 * Używamy metody "Credentials", czyli logowania emailem i hasłem.
 */
export const authOptions = {
    providers: [
        // Dostawca logowania: Email i Hasło
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            // Funkcja sprawdzająca czy dane logowania są poprawne
            async authorize(credentials) {
                // Czy wpisano email i hasło?
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email i hasło są wymagane");
                }

                // Szukamy użytkownika w bazie danych po emailu
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error("Nieprawidłowy email lub hasło");
                }

                // Porównujemy wpisane hasło z tym w bazie (które jest zaszyfrowane)
                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Nieprawidłowy email lub hasło");
                }

                // Jeśli wszystko ok, zwracamy dane użytkownika
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        // Funkcja uruchamiana przy tworzeniu tokena (cyfrowej przepustki)
        // Dodajemy do tokena informacje o użytkowniku, np. jego rolę
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role;
            }
            return token;
        },
        // Funkcja uruchamiana przy odczycie sesji (w przeglądarce)
        // Przekazujemy dane z tokena do sesji, żeby aplikacja widziała kto jest zalogowany
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.name = token.name;
                session.user.role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
