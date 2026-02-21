/**
 * Valideringsfunksjoner for input-data
 * 
 * Brukes for å sikre at data er gyldig før
 * det sendes til API-er eller lagres.
 */

// =============================================================================
// KOORDINAT-VALIDERING
// =============================================================================

/**
 * isValidLatitude: Sjekk om breddegrad er gyldig
 * 
 * @param lat - Breddegrad (-90 til 90)
 * @returns true hvis gyldig
 */
export function isValidLatitude(lat: number): boolean {
  return typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90;
}

/**
 * isValidLongitude: Sjekk om lengdegrad er gyldig
 * 
 * @param lon - Lengdegrad (-180 til 180)
 * @returns true hvis gyldig
 */
export function isValidLongitude(lon: number): boolean {
  return typeof lon === 'number' && !isNaN(lon) && lon >= -180 && lon <= 180;
}

/**
 * isValidCoordinate: Sjekk om koordinater er gyldige
 * 
 * @param lat - Breddegrad
 * @param lon - Lengdegrad
 * @returns true hvis begge er gyldige
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
  return isValidLatitude(lat) && isValidLongitude(lon);
}

// =============================================================================
// STRENG-VALIDERING
// =============================================================================

/**
 * isValidPhoneNumber: Sjekk om telefonnummer er gyldig
 * 
 * Godtar: +47xxxxxxxx eller 8 siffer
 * 
 * @param phone - Telefonnummer
 * @returns true hvis gyldig
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  // Norsk nummer: +47 eller 8 siffer
  const norwegianRegex = /^(\+47|47)?[0-9]{8}$/;
  return norwegianRegex.test(phone.replace(/\s/g, ''));
}

/**
 * isValidEmail: Sjekk om e-post er gyldig
 * 
 * @param email - E-postadresse
 * @returns true hvis gyldig
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * sanitizeInput: Fjern farlige tegn fra input
 * 
 * @param input - Input-streng
 * @returns Sanitert streng
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"'&]/g, '')  // Fjern HTML-tegn
    .replace(/javascript:/gi, '')  // Fjern javascript:-protocol
    .replace(/on\w+=/gi, '')  // Fjern event handlers
    .trim();
}
