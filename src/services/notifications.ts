/**
 * notifications.ts: Browser Notifications API
 * 
 * Denne filen håndterer:
 * - Be om tillatelse for varslinger
 * - Sende push-varslinger til brukeren
 * - Sjekke om det er dagtid eller natt
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
 */

// =============================================================================
// FUNKSJONER
// =============================================================================

/**
 * requestNotificationPermission: Be om tillatelse for varslinger
 * 
 * Viser en dialog der brukeren kan godta eller nekte varslinger.
 * 
 * @returns true hvis tillatelse er gitt, false ellers
 * 
 * @example
 * const granted = await requestNotificationPermission();
 * if (granted) { ... }
 */
export async function requestNotificationPermission(): Promise<boolean> {
  // Sjekk om nettleseren støtter Notifications API
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  // Hvis allerede gitt, returner true
  if (Notification.permission === 'granted') {
    return true;
  }

  // Hvis ikke nektet, be om tillatelse
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Tillatelse ble nektet
  return false;
}

/**
 * showNotification: Send en varsling til brukeren
 * 
 * Viser en system-varsling med tittel og melding.
 * 
 * @param title - Overskrift på varslingen
 * @param body - Meldingstekst
 * 
 * @example
 * showNotification('Det snør!', 'Vurder å bestille brøyting.');
 */
export function showNotification(title: string, body: string): void {
  // Sjekk støtte
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }

  // Send kun hvis tillatelse er gitt
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.svg',
        badge: '/pwa-192x192.svg',
      });
    } catch (error) {
      console.log('Failed to show notification:', error);
    }
  }
}

/**
 * isDayTime: Sjekk om det er dagtid
 * 
 * Dagtid er definert som kl. 09:00 - 17:59 (09:00 til 18:00).
 * 
 * @returns true hvis det er dagtid
 * 
 * @example
 * if (isDayTime()) {
 *   // Vis sol-ikon
 * }
 */
export function isDayTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 9 && hour < 18;
}

/**
 * isNightTime: Sjekk om det er natt
 * 
 * Natt er alt som ikke er dagtid (18:00 - 08:59).
 * 
 * @returns true hvis det er natt
 */
export function isNightTime(): boolean {
  return !isDayTime();
}
