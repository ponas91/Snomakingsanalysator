export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function showNotification(title: string, body: string): void {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/pwa-192x192.svg',
      badge: '/pwa-192x192.svg',
    });
  }
}

export function isDayTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 9 && hour < 18;
}

export function isNightTime(): boolean {
  return !isDayTime();
}
