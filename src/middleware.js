import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Middleware - to "strażnik" aplikacji.
// Sprawdza każde wejście na stronę i decyduje, czy użytkownik może ją zobaczyć.
export async function middleware(request) {
    // Pobieramy "przepustkę" (token) użytkownika
    // WAŻNE: W środowisku produkcyjnym (Vercel) musimy upewnić się, że secret jest dostępny
    const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
    });

    const { pathname } = request.nextUrl;

    console.log(`[Middleware] Path: ${pathname}, Token found: ${!!token}, Role: ${token?.role}`);

    // Ochrona panelu administratora (/admin)
    // Tylko użytkownicy z rolą ADMIN mogą tu wejść
    if (pathname.startsWith('/admin')) {
        // Jeśli nie jest zalogowany -> wyślij do logowania
        if (!token) {
            console.log("[Middleware] Redirecting to login (No token for /admin)");
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        // Jeśli jest zalogowany, ale nie jest adminem -> wyślij na stronę główną
        if (token.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Ochrona stron dla zalogowanych (dashboard, profil, zgłaszanie)
    // Lista stron, które wymagają logowania
    const protectedRoutes = ['/dashboard', '/profile', '/report'];
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        // Jeśli użytkownik nie ma "przepustki" (tokena), odsyłamy do logowania
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // Jeśli wszystko ok, przepuść użytkownika dalej
    return NextResponse.next();
}

// Konfiguracja "strażnika"
// Tutaj wpisujemy adresy stron, które mają być sprawdzane
export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*', '/profile/:path*', '/report/:path*'],
};
