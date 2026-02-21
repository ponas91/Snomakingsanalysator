import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Contractor } from '../types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function ContractorForm({
  contractor,
  onSave,
  onCancel,
}: {
  contractor?: Contractor;
  onSave: (c: Contractor) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Contractor>(
    contractor || { id: '', name: '', phone: '', email: '', isPrimary: false }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    
    onSave({
      ...formData,
      id: formData.id || generateId(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!formData.name || !formData.phone}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {contractor ? 'Oppdater' : 'Legg til'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}

function ContractorItem({
  contractor,
  onEdit,
  onDelete,
  onSetPrimary,
}: {
  contractor: Contractor;
  onEdit: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
}) {
  const handleCall = () => {
    window.location.href = `tel:${contractor.phone}`;
  };

  const handleSms = () => {
    window.location.href = `sms:${contractor.phone}`;
  };

  return (
    <div className={`bg-slate-700 rounded-lg p-4 ${contractor.isPrimary ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-white">{contractor.name}</p>
            {contractor.isPrimary && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Favoritt</span>
            )}
          </div>
          <p className="text-sm text-slate-400">{contractor.phone}</p>
          {contractor.email && (
            <p className="text-sm text-slate-500">{contractor.email}</p>
          )}
        </div>
        <div className="flex gap-1">
          {!contractor.isPrimary && (
            <button
              onClick={onSetPrimary}
              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-600 rounded"
              title="Sett som favoritt"
            >
              ★
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-yellow-400 hover:bg-slate-600 rounded"
            title="Rediger"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded"
            title="Slett"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleCall}
          className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
        >
          📞 Ring
        </button>
        <button
          onClick={handleSms}
          className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          💬 SMS
        </button>
      </div>
    </div>
  );
}

export function ContractorCard() {
  const { state, dispatch } = useApp();
  const { contractors } = state;
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedContractors = [...contractors].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });

  const handleAdd = (contractor: Contractor) => {
    if (contractors.length === 0) {
      contractor.isPrimary = true;
    }
    dispatch({ type: 'ADD_CONTRACTOR', payload: contractor });
    setIsAdding(false);
  };

  const handleUpdate = (contractor: Contractor) => {
    dispatch({ type: 'UPDATE_CONTRACTOR', payload: contractor });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    const contractor = contractors.find(c => c.id === deletingId);
    if (contractor?.isPrimary && contractors.length > 1) {
      const remaining = contractors.filter(c => c.id !== deletingId);
      remaining[0].isPrimary = true;
      dispatch({ type: 'SET_CONTRACTOR_PRIMARY', payload: remaining[0].id });
    }
    dispatch({ type: 'DELETE_CONTRACTOR', payload: deletingId });
    setDeletingId(null);
  };

  const handleSetPrimary = (id: string) => {
    dispatch({ type: 'SET_CONTRACTOR_PRIMARY', payload: id });
  };

  const editingContractor = editingId 
    ? contractors.find(c => c.id === editingId) 
    : undefined;

  return (
    <div className="bg-slate-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Kontakter</h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            + Legg til
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-slate-700 rounded-lg">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Ny kontakt</h3>
          <ContractorForm
            onSave={handleAdd}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      {editingId && editingContractor && (
        <div className="mb-4 p-4 bg-slate-700 rounded-lg">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Rediger kontakt</h3>
          <ContractorForm
            contractor={editingContractor}
            onSave={handleUpdate}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      {deletingId && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-white mb-3">
            Er du sikker på at du vil slette denne kontakten?
          </p>
          <div className="flex gap-2">
            <button
              onClick={confirmDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Ja, slett
            </button>
            <button
              onClick={() => setDeletingId(null)}
              className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sortedContractors.map((contractor) => (
          <ContractorItem
            key={contractor.id}
            contractor={contractor}
            onEdit={() => setEditingId(contractor.id)}
            onDelete={() => handleDelete(contractor.id)}
            onSetPrimary={() => handleSetPrimary(contractor.id)}
          />
        ))}
      </div>

      {contractors.length === 0 && !isAdding && (
        <p className="text-center text-slate-500 py-4">
          Ingen kontakter lagt til ennå.
          <br />
          <button
            onClick={() => setIsAdding(true)}
            className="text-blue-400 hover:text-blue-300"
          >
            Legg til din første kontakt
          </button>
        </p>
      )}
    </div>
  );
}
