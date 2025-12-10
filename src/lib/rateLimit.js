/**
 * Prosty system limitowania zapytań (Rate Limit)
 * Zapobiega spamowaniu serwera przez automaty lub złośliwych użytkowników.
 * Przechowuje dane w pamięci RAM (w produkcji lepiej użyć np. Redis).
 */

class RateLimiter {
    constructor() {
        this.requests = new Map();
        // Czyść stare wpisy co 15 minut
        setInterval(() => this.cleanup(), 15 * 60 * 1000);
    }

    /**
     * Sprawdza czy użytkownik przekroczył limit
     * @param {string} identifier - Kto pyta? (np. IP lub ID użytkownika)
     * @param {number} limit - Ile razy może zapytać?
     * @param {number} windowMs - W jakim czasie? (np. w ciągu godziny)
     */
    check(identifier, limit, windowMs) {
        const now = Date.now();
        const key = `${identifier}`;

        if (!this.requests.has(key)) {
            this.requests.set(key, []);
        }

        const requestLog = this.requests.get(key);

        // Usuń stare zapytania, które już "wygasły" (są poza oknem czasowym)
        const validRequests = requestLog.filter(timestamp => now - timestamp < windowMs);
        this.requests.set(key, validRequests);

        // Jeśli jest za dużo zapytań -> blokuj
        if (validRequests.length >= limit) {
            const oldestRequest = validRequests[0];
            const resetTime = oldestRequest + windowMs;

            return {
                success: false,
                remaining: 0,
                resetTime: Math.ceil((resetTime - now) / 1000), // ile sekund do odblokowania
            };
        }

        // Dodaj nowe zapytanie do listy
        validRequests.push(now);
        this.requests.set(key, validRequests);

        return {
            success: true,
            remaining: limit - validRequests.length,
            resetTime: Math.ceil(windowMs / 1000),
        };
    }

    cleanup() {
        const now = Date.now();
        const maxAge = 60 * 60 * 1000; // 1 godzina

        for (const [key, timestamps] of this.requests.entries()) {
            const validTimestamps = timestamps.filter(t => now - t < maxAge);
            if (validTimestamps.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, validTimestamps);
            }
        }
    }
}

// Tworzymy jedną instancję limitera dla całej aplikacji
const rateLimiter = new RateLimiter();

/**
 * Pobiera identyfikator klienta (zazwyczaj adres IP)
 */
export function getClientIdentifier(request) {
    // Próbujemy odczytać prawdziwe IP (nawet jeśli aplikacja jest za proxy)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    // Jeśli się nie uda, zwracamy 'unknown'
    return 'unknown-ip';
}

/**
 * Limitowanie dla logowania
 * Max 5 prób na 15 minut z jednego IP
 */
export function rateLimitAuth(request) {
    const identifier = getClientIdentifier(request);
    return rateLimiter.check(identifier, 5, 15 * 60 * 1000);
}

/**
 * Limitowanie dla rejestracji
 * Max 3 konta na godzinę z jednego IP
 */
export function rateLimitRegister(request) {
    const identifier = getClientIdentifier(request);
    return rateLimiter.check(identifier, 3, 60 * 60 * 1000);
}

/**
 * Limitowanie dla API (ogólne)
 * Max 100 zapytań na godzinę z jednego IP
 */
export function rateLimitAPI(request) {
    const identifier = getClientIdentifier(request);
    return rateLimiter.check(identifier, 100, 60 * 60 * 1000);
}

/**
 * Limitowanie dla konkretnego użytkownika (po zalogowaniu)
 * Max 60 zapytań na godzinę na użytkownika
 */
export function rateLimitUser(userId) {
    const identifier = `user:${userId}`;
    return rateLimiter.check(identifier, 60, 60 * 60 * 1000);
}
