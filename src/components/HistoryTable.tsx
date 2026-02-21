import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { SnowEntry } from '../types';

export function AddEntryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { dispatch } = useApp();
  const [snowDepth, setSnowDepth] = useState('');
  const [comment, setComment] = useState('');
  const [contractor, setContractor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: SnowEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      snowDepth: snowDepth ? parseFloat(snowDepth) : undefined,
      comment: comment || undefined,
      contractor: contractor || undefined,
    };

    dispatch({ type: 'ADD_HISTORY', payload: entry });
    
    setSnowDepth('');
    setComment('');
    setContractor('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Logg brøyting</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Snødybde (cm) - valgfritt
              </label>
              <input
                type="number"
                step="0.1"
                value={snowDepth}
                onChange={(e) => setSnowDepth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="f.eks. Brøy'n AS"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
    <div className="bg-slate-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Brøytingshistorikk</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 font-medium text-slate-400">Dato</th>
                <th className="text-left py-2 font-medium text-slate-400">Snødybde</th>
                <th className="text-left py-2 font-medium text-slate-400">Entreprenør</th>
                <th className="text-left py-2 font-medium text-slate-400">Kommentar</th>
                <th className="text-right py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 text-slate-300">{formatDate(entry.timestamp)}</td>
                  <td className="py-3 text-slate-300">{entry.snowDepth ? `${entry.snowDepth} cm` : '-'}</td>
                  <td className="py-3 text-slate-300">{entry.contractor || '-'}</td>
                  <td className="py-3 text-slate-300 max-w-xs truncate">{entry.comment || '-'}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Slett
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
