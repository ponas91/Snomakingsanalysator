import { useState, useEffect } from 'react';

interface UpdateSWData {
  updateSW: (reloadPage?: boolean) => Promise<void>;
  offlineReady: { ready: Promise<void> };
}

declare global {
  interface Window {
    updateSW?: UpdateSWData['updateSW'];
    __SW_READY__?: Promise<boolean>;
  }
}

export function usePWAAutoUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          setUpdateAvailable(true);
        });
      });

      const handleControllerChange = () => {
        setUpdateAvailable(true);
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  const updateApp = async () => {
    if (window.updateSW) {
      await window.updateSW(true);
    } else {
      window.location.reload();
    }
  };

  return { updateAvailable, updateApp };
}

export function PWAUpdateNotification({ 
  updateAvailable, 
  onUpdate 
}: { 
  updateAvailable: boolean; 
  onUpdate: () => void;
}) {
  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📦</span>
          <div>
            <p className="font-medium">Ny versjon tilgjengelig</p>
            <p className="text-sm text-blue-200">Oppdater for å få de nyeste funksjonene</p>
          </div>
        </div>
        <button
          onClick={onUpdate}
          className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors shrink-0"
        >
          Oppdater
        </button>
      </div>
    </div>
  );
}
