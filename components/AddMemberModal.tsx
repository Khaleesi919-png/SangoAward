
import React, { useState, useEffect } from 'react';
import { Member, DominionStatus } from '../types';
import { SQUAD_GROUPS, INITIAL_SEASONS } from '../constants';

interface AddMemberModalProps {
  onClose: () => void;
  onSave: (m: Partial<Member>) => void;
  editMember?: Member | null;
}

/**
 * Modal component for adding or editing alliance members in the dominion tracker.
 */
const AddMemberModal: React.FC<AddMemberModalProps> = ({ onClose, onSave, editMember }) => {
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    group: 'A',
    lineName: '',
    seasonalHistory: INITIAL_SEASONS.map(s => ({ season: s, status: DominionStatus.EMPTY }))
  });

  useEffect(() => {
    if (editMember) setFormData(editMember);
  }, [editMember]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-xl p-8 border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <h2 className="text-2xl font-orbitron font-bold text-cyan-400 mb-8 flex items-center gap-3">
          <div className="w-2 h-8 bg-cyan-500 rounded"></div>
          {editMember ? '修正登錄資料' : '新進成員登錄'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">成員 ID / 名稱</label>
              <input 
                required 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full bg-slate-900 border border-slate-800 rounded p-3 text-white outline-none focus:border-cyan-500" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">初始分組</label>
              <select 
                value={formData.group} 
                onChange={e => setFormData({...formData, group: e.target.value})} 
                className="w-full bg-slate-900 border border-slate-800 rounded p-3 text-white outline-none focus:border-cyan-500"
              >
                {SQUAD_GROUPS.map(g => <option key={g} value={g}>{g} 組</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">LINE 顯示名稱</label>
            <input 
              type="text" 
              value={formData.lineName} 
              onChange={e => setFormData({...formData, lineName: e.target.value})} 
              className="w-full bg-slate-900 border border-slate-800 rounded p-3 text-white outline-none focus:border-cyan-500" 
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              取消通訊
            </button>
            <button 
              type="submit" 
              className="flex-[2] py-3 bg-cyan-600 text-white font-bold rounded shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-500 transition-all uppercase tracking-widest"
            >
              確認上傳
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
