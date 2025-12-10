/**
 * Stałe aplikacji
 * Tutaj trzymamy wszystkie ważne wartości, napisy i ustawienia w jednym miejscu.
 * Dzięki temu łatwo je zmienić i używać w całym kodzie, nie robiąc "literówek".
 */

// ============================================================================
// TYPY ZGŁOSZEŃ (INCYDENTÓW)
// ============================================================================

export const INCIDENT_TYPES = {
    RESTRICTED_ZONE: 'RESTRICTED_ZONE',
    PRIVACY_VIOLATION: 'PRIVACY_VIOLATION',
    DANGEROUS_FLIGHT: 'DANGEROUS_FLIGHT',
    OTHER: 'OTHER',
};

// Etykiety wyświetlane użytkownikowi (po polsku)
export const INCIDENT_TYPE_LABELS = {
    [INCIDENT_TYPES.RESTRICTED_ZONE]: 'Strefa zakazana',
    [INCIDENT_TYPES.PRIVACY_VIOLATION]: 'Naruszenie prywatności',
    [INCIDENT_TYPES.DANGEROUS_FLIGHT]: 'Niebezpieczny lot',
    [INCIDENT_TYPES.OTHER]: 'Inne',
};

export const INCIDENT_TYPE_COLORS = {
    [INCIDENT_TYPES.RESTRICTED_ZONE]: '#dc2626',     // czerwony
    [INCIDENT_TYPES.PRIVACY_VIOLATION]: '#ea580c',   // pomarańczowy
    [INCIDENT_TYPES.DANGEROUS_FLIGHT]: '#ca8a04',    // żółty
    [INCIDENT_TYPES.OTHER]: '#64748b',               // szary
};

export const INCIDENT_TYPE_ICONS = {
    [INCIDENT_TYPES.RESTRICTED_ZONE]: '🚫',
    [INCIDENT_TYPES.PRIVACY_VIOLATION]: '👁️',
    [INCIDENT_TYPES.DANGEROUS_FLIGHT]: '⚠️',
    [INCIDENT_TYPES.OTHER]: '📋',
};

// ============================================================================
// STATUSY ZGŁOSZEŃ
// ============================================================================

export const INCIDENT_STATUSES = {
    REPORTED: 'REPORTED',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
    ARCHIVED: 'ARCHIVED',
};

export const INCIDENT_STATUS_LABELS = {
    [INCIDENT_STATUSES.REPORTED]: 'Zgłoszono',
    [INCIDENT_STATUSES.ACCEPTED]: 'Zaakceptowano',
    [INCIDENT_STATUSES.REJECTED]: 'Odrzucono',
    [INCIDENT_STATUSES.CANCELLED]: 'Anulowano',
    [INCIDENT_STATUSES.ARCHIVED]: 'Zarchiwizowano',
};

export const INCIDENT_STATUS_COLORS = {
    [INCIDENT_STATUSES.REPORTED]: '#3b82f6',    // niebieski
    [INCIDENT_STATUSES.ACCEPTED]: '#22c55e',    // zielony
    [INCIDENT_STATUSES.REJECTED]: '#ef4444',    // czerwony
    [INCIDENT_STATUSES.CANCELLED]: '#64748b',   // szary
    [INCIDENT_STATUSES.ARCHIVED]: '#9ca3af',    // jasny szary
};

export const INCIDENT_STATUS_BADGE_CLASSES = {
    [INCIDENT_STATUSES.REPORTED]: 'badge-reported',
    [INCIDENT_STATUSES.ACCEPTED]: 'badge-accepted',
    [INCIDENT_STATUSES.REJECTED]: 'badge-rejected',
    [INCIDENT_STATUSES.CANCELLED]: 'badge-cancelled',
    [INCIDENT_STATUSES.ARCHIVED]: 'badge-archived',
};

// ============================================================================
// ROLE UŻYTKOWNIKÓW
// ============================================================================

export const USER_ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN',
};

export const USER_ROLE_LABELS = {
    [USER_ROLES.USER]: 'Użytkownik',
    [USER_ROLES.ADMIN]: 'Administrator',
};

// ============================================================================
// LIMITY WALIDACJI (Sprawdzania poprawności danych)
// ============================================================================

export const VALIDATION_LIMITS = {
    DESCRIPTION_MAX_LENGTH: 500, // Max znaków w opisie
    NAME_MAX_LENGTH: 100,        // Max znaków w nazwie
    EMAIL_MAX_LENGTH: 255,       // Max znaków w emailu
    PASSWORD_MIN_LENGTH: 8,      // Min znaków w haśle
};

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/**
 * Pobiera nazwę typu incydentu (po polsku)
 */
export function getIncidentTypeLabel(type) {
    return INCIDENT_TYPE_LABELS[type] || type;
}

/**
 * Pobiera nazwę statusu (po polsku)
 */
export function getIncidentStatusLabel(status) {
    return INCIDENT_STATUS_LABELS[status] || status;
}

/**
 * Pobiera klasę CSS dla odznaki statusu (kolorowe tło statusu)
 */
export function getIncidentStatusBadgeClass(status) {
    const baseClass = INCIDENT_STATUS_BADGE_CLASSES[status] || 'badge-reported';
    return `badge ${baseClass}`;
}

/**
 * Formatuje lokalizację do tekstu (adres lub współrzędne)
 */
export function getLocationText(locationStr) {
    try {
        const location = typeof locationStr === 'string' ? JSON.parse(locationStr) : locationStr;
        if (location.address) {
            return location.address;
        }
        return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    } catch {
        return "Nieznana lokalizacja";
    }
}

/**
 * Check if incident type is valid
 * @param {string} type - Incident type to validate
 * @returns {boolean} True if valid
 */
export function isValidIncidentType(type) {
    return Object.values(INCIDENT_TYPES).includes(type);
}

/**
 * Check if incident status is valid
 * @param {string} status - Incident status to validate
 * @returns {boolean} True if valid
 */
export function isValidIncidentStatus(status) {
    return Object.values(INCIDENT_STATUSES).includes(status);
}

/**
 * Get all valid incident types (for validation)
 * @returns {string[]} Array of valid incident types
 */
export function getValidIncidentTypes() {
    return Object.values(INCIDENT_TYPES);
}

/**
 * Get all valid incident statuses (for validation)
 * @returns {string[]} Array of valid incident statuses
 */
export function getValidIncidentStatuses() {
    return Object.values(INCIDENT_STATUSES);
}
