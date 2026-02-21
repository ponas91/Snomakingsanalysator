import { useState } from 'react';
import { useApp } from '../hooks/useApp';
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
  const countryCodes = [
    { code: '+47', name: 'Norge (+47)' },
    { code: '+46', name: 'Sverige (+46)' },
    { code: '+45', name: 'Danmark (+45)' },
    { code: '+358', name: 'Finland (+358)' },
    { code: '+44', name: 'Storbritannia (+44)' },
    { code: '+49', name: 'Tyskland (+49)' },
    { code: '+31', name: 'Nederland (+31)' },
    { code: '+32', name: 'Belgia (+32)' },
    { code: '+33', name: 'Frankrike (+33)' },
    { code: '+1', name: 'USA/Canada (+1)' },
    { code: '+61', name: 'Australia (+61)' },
  ];

  const getCountryCode = (phone: string) => {
    if (phone.startsWith('+')) {
      const match = countryCodes.find(c => phone.startsWith(c.code));
      if (match) return match.code;
    }
    return '+47';
  };

  const [countryCode, setCountryCode] = useState(getCountryCode(contractor?.phone || ''));
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (!contractor?.phone) return '';
    const code = getCountryCode(contractor.phone);
    return contractor.phone.replace(code, '');
  });

  const [formData, setFormData] = useState<Contractor>(
    contractor || { id: '', name: '', phone: '', email: '', isPrimary: false }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !phoneNumber) return;
    
    const fullPhone = countryCode + phoneNumber.replace(/\s/g, '');
    
    onSave({
      ...formData,
      id: formData.id || generateId(),
      phone: fullPhone,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm text-[#D8DEE9] mb-1">Navn *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 bg-[#434C5E] border border-[#4C566A] rounded-lg text-white focus:ring-2 focus:ring-[#88C0D0] focus:border-[#88C0D0]"
          placeholder="f.eks. Brøy'n AS"
        />
      </div>
      
      <div>
        <label className="block text-sm text-[#D8DEE9] mb-1">Telefon *</label>
        <div className="flex gap-2 w-full">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="px-2 py-2 bg-[#434C5E] border border-[#4C566A] rounded-lg text-white focus:ring-2 focus:ring-[#88C0D0] focus:border-[#88C0D0] shrink-0"
          >
            {countryCodes.map((cc) => (
              <option key={cc.code} value={cc.code}>{cc.code}</option>
            ))}
          </select>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
            className="flex-1 min-w-0 px-3 py-2 bg-[#434C5E] border border-[#4C566A] rounded-lg text-white focus:ring-2 focus:ring-[#88C0D0] focus:border-[#88C0D0]"
            placeholder="12345678"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-[#D8DEE9] mb-1">E-post (valgfritt)</label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 bg-[#434C5E] border border-[#4C566A] rounded-lg text-white focus:ring-2 focus:ring-[#88C0D0] focus:border-[#88C0D0]"
          placeholder="f.eks. post@broy.no"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!formData.name || !phoneNumber}
          className="flex-1 px-4 py-2 bg-[#5E81AC] text-white rounded-lg hover:bg-[#81A1C1] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {contractor ? 'Oppdater' : 'Legg til'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-[#4C566A] text-white rounded-lg hover:bg-[#5E81AC]"
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

  const handleEmail = () => {
    window.location.href = `mailto:${contractor.email}`;
  };

  return (
    <div className={`bg-[#434C5E] rounded-lg p-4 ${contractor.isPrimary ? 'ring-2 ring-[#88C0D0]' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-[#ECEFF4]">{contractor.name}</p>
            {contractor.isPrimary && (
              <span className="text-xs bg-[#5E81AC] text-white px-2 py-0.5 rounded-full">Favoritt</span>
            )}
          </div>
          <p className="text-sm text-[#D8DEE9]">{contractor.phone}</p>
          {contractor.email && (
            <p className="text-sm text-[#4C566A]">{contractor.email}</p>
          )}
        </div>
        <div className="flex gap-1">
          {!contractor.isPrimary && (
            <button
              onClick={onSetPrimary}
              className="p-1.5 text-[#D8DEE9] hover:text-[#EBCB8B] hover:bg-[#4C566A] rounded"
              title="Sett som favoritt"
            >
              ★
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 text-[#D8DEE9] hover:text-[#EBCB8B] hover:bg-[#4C566A] rounded"
            title="Rediger"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-[#D8DEE9] hover:text-[#BF616A] hover:bg-[#4C566A] rounded"
            title="Slett"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleCall}
          className="flex-1 px-3 py-1.5 bg-[#A3BE8C] text-white text-sm rounded-lg hover:bg-[#81A1C1]"
        >
          📞 Ring
        </button>
        <button
          onClick={handleSms}
          className="flex-1 px-3 py-1.5 bg-[#5E81AC] text-white text-sm rounded-lg hover:bg-[#81A1C1]"
        >
          💬 SMS
        </button>
        {contractor.email && (
          <button
            onClick={handleEmail}
            className="flex-1 px-3 py-1.5 bg-[#4C566A] text-white text-sm rounded-lg hover:bg-[#5E81AC]"
          >
            ✉️ E-post
          </button>
        )}
      </div>
    </div>
  );
}

export function ContractorCard() {
  const { state, dispatch } = useApp();
  const { contractors } = state;
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    if (confirm('Er du sikker på at du vil slette denne kontakten?')) {
      const contractor = contractors.find(c => c.id === id);
      if (contractor?.isPrimary && contractors.length > 1) {
        const remaining = contractors.filter(c => c.id !== id);
        remaining[0].isPrimary = true;
        dispatch({ type: 'SET_CONTRACTOR_PRIMARY', payload: remaining[0].id });
      }
      dispatch({ type: 'DELETE_CONTRACTOR', payload: id });
    }
  };

  const handleSetPrimary = (id: string) => {
    dispatch({ type: 'SET_CONTRACTOR_PRIMARY', payload: id });
  };

  const editingContractor = editingId 
    ? contractors.find(c => c.id === editingId) 
    : undefined;

  return (
    <div className="bg-[#3B4252] rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center border-b border-[#4C566A] pb-3 mb-4">
        <h2 className="text-lg font-semibold text-[#ECEFF4]">Kontakter</h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-[#5E81AC] text-white text-sm rounded-lg hover:bg-[#81A1C1]"
          >
            + Legg til
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-[#434C5E] rounded-lg">
          <h3 className="text-sm font-medium text-[#D8DEE9] mb-3">Ny kontakt</h3>
          <ContractorForm
            onSave={handleAdd}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      {editingId && editingContractor && (
        <div className="mb-4 p-4 bg-[#434C5E] rounded-lg">
          <h3 className="text-sm font-medium text-[#D8DEE9] mb-3">Rediger kontakt</h3>
          <ContractorForm
            contractor={editingContractor}
            onSave={handleUpdate}
            onCancel={() => setEditingId(null)}
          />
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
        <p className="text-center text-[#4C566A] py-4">
          Ingen kontakter lagt til ennå.
          <br />
          <button
            onClick={() => setIsAdding(true)}
            className="text-[#88C0D0] hover:text-[#81A1C1]"
          >
            Legg til din første kontakt
          </button>
        </p>
      )}
    </div>
  );
}
