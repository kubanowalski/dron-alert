/**
 * Application-wide constants
 * Single source of truth for enums, mappings, and configuration
 */

// ============================================================================
// INCIDENT TYPES
// ============================================================================

export const INCIDENT_TYPES = {
    RESTRICTED_ZONE: 'RESTRICTED_ZONE',
    PRIVACY_VIOLATION: 'PRIVACY_VIOLATION',
    DANGEROUS_FLIGHT: 'DANGEROUS_FLIGHT',
    OTHER: 'OTHER',
};

export const INCIDENT_TYPE_LABELS = {
    [INCIDENT_TYPES.RESTRICTED_ZONE]: 'Strefa zakazana',
    [INCIDENT_TYPES.PRIVACY_VIOLATION]: 'Naruszenie prywatności',
    [INCIDENT_TYPES.DANGEROUS_FLIGHT]: 'Niebezpieczny lot',
    [INCIDENT_TYPES.OTHER]: 'Inne',
};

export const INCIDENT_TYPE_COLORS = {
    [INCIDENT_TYPES.RESTRICTED_ZONE]: '#dc2626',     // red-600
    [INCIDENT_TYPES.PRIVACY_VIOLATION]: '#ea580c',   // orange-600
    [INCIDENT_TYPES.DANGEROUS_FLIGHT]: '#ca8a04',    // yellow-600
    [INCIDENT_TYPES.OTHER]: '#64748b',               // slate-500
};

export const INCIDENT_TYPE_ICONS = {
    [INCIDENT_TYPES.RESTRICTED_ZONE]: '🚫',
    [INCIDENT_TYPES.PRIVACY_VIOLATION]: '👁️',
    [INCIDENT_TYPES.DANGEROUS_FLIGHT]: '⚠️',
    [INCIDENT_TYPES.OTHER]: '📋',
};

// ============================================================================
// INCIDENT STATUSES
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
    [INCIDENT_STATUSES.REPORTED]: '#3b82f6',    // blue-500
    [INCIDENT_STATUSES.ACCEPTED]: '#22c55e',    // green-500
    [INCIDENT_STATUSES.REJECTED]: '#ef4444',    // red-500
    [INCIDENT_STATUSES.CANCELLED]: '#64748b',   // slate-500
    [INCIDENT_STATUSES.ARCHIVED]: '#9ca3af',    // gray-400
};

export const INCIDENT_STATUS_BADGE_CLASSES = {
    [INCIDENT_STATUSES.REPORTED]: 'badge-reported',
    [INCIDENT_STATUSES.ACCEPTED]: 'badge-accepted',
    [INCIDENT_STATUSES.REJECTED]: 'badge-rejected',
    [INCIDENT_STATUSES.CANCELLED]: 'badge-cancelled',
    [INCIDENT_STATUSES.ARCHIVED]: 'badge-archived',
};

// ============================================================================
// USER ROLES
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
// VALIDATION LIMITS
// ============================================================================

export const VALIDATION_LIMITS = {
    DESCRIPTION_MAX_LENGTH: 500,
    NAME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 255,
    PASSWORD_MIN_LENGTH: 8,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get incident type label
 * @param {string} type - Incident type
 * @returns {string} Localized label
 */
export function getIncidentTypeLabel(type) {
    return INCIDENT_TYPE_LABELS[type] || type;
}

/**
 * Get incident status label
 * @param {string} status - Incident status
 * @returns {string} Localized label
 */
export function getIncidentStatusLabel(status) {
    return INCIDENT_STATUS_LABELS[status] || status;
}

/**
 * Get incident status badge class
 * @param {string} status - Incident status
 * @returns {string} CSS class name
 */
export function getIncidentStatusBadgeClass(status) {
    const baseClass = INCIDENT_STATUS_BADGE_CLASSES[status] || 'badge-reported';
    return `badge ${baseClass}`;
}

/**
 * Get location text from location JSON
 * @param {string|Object} locationStr - Location JSON string or object
 * @returns {string} Formatted location text
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
