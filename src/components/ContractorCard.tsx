import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Contractor } from '../types';

export function ContractorCard() {
  const { state, dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(!state.contractor);
  const [formData, setFormData] = useState<Contractor>(
    state.contractor || { name: '', phone: '', email: '' }
  );

  const handleSave = () => {
    if (formData.name && formData.phone) {
      dispatch({ type: 'SET_CONTRACTOR', payload: formData });
      setIsEditing(false);
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${formData.phone}`;
  };

  const handleSms = () => {
    window.location.href = `sms:${formData.phone}`;
  };

  if (isEditing) {
    return (
      <div className="bg-slate-800 rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Entreprenør</h2>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Navn *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="f.eks. Brøy'n AS"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Telefon *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="f.eks. 12345678"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">E-post (valgfritt)</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="f.eks. post@broy.no"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!formData.name || !formData.phone}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lagre
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-white">Entreprenør</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Rediger
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <p className="font-medium text-white">{formData.name}</p>
          <p className="text-sm text-slate-400">{formData.phone}</p>
          {formData.email && (
            <p className="text-sm text-slate-500">{formData.email}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleCall}
            className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            📞 Ring
          </button>
          <button
            onClick={handleSms}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            💬 SMS
          </button>
        </div>
      </div>
    </div>
  );
}
