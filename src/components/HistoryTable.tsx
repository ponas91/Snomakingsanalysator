import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import type { SnowEntry } from '../types';

export function EditEntryModal({ 
  isOpen, 
  onClose, 
  entry 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  entry: SnowEntry | null;
}) {
  const { dispatch } = useApp();
  
  const getDateFromIso = (iso: string) => {
    const d = new Date(iso);
    return d.toISOString().split('T')[0];
  };
  
  const getTimeFromIso = (iso: string) => {
    const d = new Date(iso);
    return d.toTimeString().slice(0, 5);
  };

  const getInitialState = () => ({
    snowDepth: entry?.snowDepth?.toString() || '',
    comment: entry?.comment || '',
    contractor: entry?.contractor || '',
    date: entry ? getDateFromIso(entry.timestamp) : '',
    time: entry ? getTimeFromIso(entry.timestamp) : '',
  });

  const [snowDepth, setSnowDepth] = useState(getInitialState().snowDepth);
  const [comment, setComment] = useState(getInitialState().comment);
  const [contractor, setContractor] = useState(getInitialState().contractor);
  const [date, setDate] = useState(getInitialState().date);
  const [time, setTime] = useState(getInitialState().time);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;
    
    const timestamp = new Date(`${date}T${time}`).toISOString();
    
    const updatedEntry: SnowEntry = {
      ...entry,
      timestamp,
      snowDepth: snowDepth ? parseFloat(snowDepth) : undefined,
      comment: comment || undefined,
      contractor: contractor || undefined,
    };

    dispatch({ type: 'ADD_HISTORY', payload: updatedEntry });
    onClose();
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Rediger oppføring</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Dato
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Klokkeslett
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Snødybde (mm) - valgfritt
              </label>
              <input
                type="number"
                step="0.1"
                value={snowDepth}
                onChange={(e) => setSnowDepth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="f.eks. 15"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Kommentar - valgfritt
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                rows={2}
                placeholder="f.eks. Kraftig snøfall"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Entreprenør - valgfritt
              </label>
              <input
                type="text"
                value={contractor}
                onChange={(e) => setContractor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="f.eks. Brøy'n AS"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500"
            >
              Lagre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddEntryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state, dispatch } = useApp();
  
  const getInitialSnowDepth = () => {
    if (!state.weather) return '';
    const temp = state.weather.current.temperature;
    const precip = state.weather.current.precipitation;
    if (temp < 2 && precip > 0) {
      return precip.toString();
    }
    return '';
  };
  
  const [snowDepth, setSnowDepth] = useState(getInitialSnowDepth);
  const [comment, setComment] = useState('');
  const [contractor, setContractor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSnowDepth(getInitialSnowDepth());
    }
  }, [isOpen, state.weather]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let timestamp: string;
    if (date && time) {
      timestamp = new Date(`${date}T${time}`).toISOString();
    } else {
      timestamp = new Date().toISOString();
    }
    
    const entry: SnowEntry = {
      id: crypto.randomUUID(),
      timestamp,
      snowDepth: snowDepth ? parseFloat(snowDepth) : undefined,
      comment: comment || undefined,
      contractor: contractor || undefined,
    };

    dispatch({ type: 'ADD_HISTORY', payload: entry });
    
    setSnowDepth('');
    setComment('');
    setContractor('');
    setDate('');
    setTime('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Logg brøyting</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Dato
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Klokkeslett
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">La stå tomt for nåværende tidspunkt</p>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Snødybde (mm) - valgfritt
              </label>
              <input
                type="number"
                step="0.1"
                value={snowDepth}
                onChange={(e) => setSnowDepth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="f.eks. 15"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Kommentar - valgfritt
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                rows={2}
                placeholder="f.eks. Kraftig snøfall"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Entreprenør - valgfritt
              </label>
              <input
                type="text"
                value={contractor}
                onChange={(e) => setContractor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="f.eks. Brøy'n AS"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500"
            >
              Lagre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function HistoryTable() {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SnowEntry | null>(null);

  const sortedHistory = [...state.history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne posten?')) {
      dispatch({ type: 'DELETE_HISTORY', payload: id });
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
        <h2 className="text-lg font-semibold text-white">Brøytingshistorikk</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-500"
        >
          + Logg brøyting
        </button>
      </div>

      {sortedHistory.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p>Ingen brøytingslogg ennå.</p>
          <p className="text-sm mt-1">Trykk på "Logg brøyting" for å registrere.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 font-medium text-slate-400 w-40">Dato</th>
                <th className="text-left py-2 font-medium text-slate-400 w-24">Snødybde</th>
                <th className="text-left py-2 font-medium text-slate-400 w-32">Entreprenør</th>
                <th className="text-left py-2 font-medium text-slate-400">Kommentar</th>
                <th className="text-right py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                  <td className="py-3 text-slate-300 whitespace-nowrap">{formatDate(entry.timestamp)}</td>
                  <td className="py-3 text-slate-300 whitespace-nowrap">{entry.snowDepth ? `${entry.snowDepth * 10} mm` : '-'}</td>
                  <td className="py-3 text-slate-300 whitespace-nowrap">{entry.contractor || '-'}</td>
                  <td className="py-3 text-slate-300 truncate" title={entry.comment || ''}>{entry.comment || '-'}</td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setEditingEntry(entry)}
                      className="text-slate-400 hover:text-yellow-400 p-1"
                      title="Rediger"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-slate-400 hover:text-red-400 p-1 ml-2"
                      title="Slett"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditEntryModal 
        key={editingEntry?.id || 'new'}
        isOpen={!!editingEntry} 
        onClose={() => setEditingEntry(null)} 
        entry={editingEntry}
      />
    </div>
  );
}
