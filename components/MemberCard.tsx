
import React from 'react';
import { Member, DominionStatus } from '../types';
import { SQUAD_GROUPS, STATUS_COLORS } from '../constants';

interface MemberCardProps {
  index: number;
  member: Member;
  seasons: string[];
  isEditable?: boolean;
  onUpdateStatus: (id: string, season: string, status: DominionStatus) => void;
  onUpdateGroup: (id: string, group: string) => void;
  onUpdateLineName: (id: string, line: string) => void;
  onDelete: (id: string) => void;
  onEdit: (m: Member) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ 
  index,
  member, 
  seasons, 
  isEditable = true,
  onUpdateStatus, 
  onUpdateGroup, 
  onUpdateLineName, 
  onDelete, 
  onEdit 
}) => {
  return (
    <div className={`glass-panel px-4 py-2 rounded border-l-2 transition-all flex items-center group min-w-[1350px] ${isEditable ? 'border-cyan-500/50 hover:border-cyan-400 hover:bg-slate-800/40' : 'border-slate-800/50 bg-slate-900/20'}`}>
      {/* Serial Number */}
      <div className="w-10 shrink-0 text-[10px] font-mono text-slate-500 text-center">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Group / Name Section */}
      <div className="w-72 shrink-0 flex items-center gap-3">
        <select
          disabled={!isEditable}
          value={member.group}
          onChange={(e) => onUpdateGroup(member.id, e.target.value)}
          className={`text-sm w-9 h-9 flex items-center justify-center rounded bg-slate-900 text-cyan-400 border border-slate-700 font-bold appearance-none text-center transition-colors focus:outline-none ${isEditable ? 'cursor-pointer hover:border-cyan-500' : 'cursor-default opacity-60'}`}
        >
          {SQUAD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <h3 className="text-sm font-bold text-white truncate transition-colors flex-1" title={member.name}>
          {member.name}
        </h3>
      </div>

      {/* LINE Name */}
      <div className="w-40 shrink-0 px-3 border-x border-slate-800/30">
        <input 
          readOnly={!isEditable}
          type="text"
          value={member.lineName}
          onChange={(e) => onUpdateLineName(member.id, e.target.value)}
          placeholder={isEditable ? "點擊輸入 Line..." : "-"}
          className={`bg-transparent border-none text-[11px] text-slate-400 w-full focus:outline-none focus:text-white transition-colors py-1 px-1 rounded hover:bg-slate-900/50 ${isEditable ? 'cursor-text' : 'cursor-default'}`}
        />
      </div>

      {/* Seasons Section */}
      <div className="flex-1 flex gap-2 ml-4">
        {seasons.map(season => {
          const currentStatus = member.seasonalHistory.find(s => s.season === season)?.status || DominionStatus.EMPTY;
          return (
            <div key={season} className="flex-1 min-w-[110px]">
              <select 
                disabled={!isEditable}
                value={currentStatus}
                onChange={(e) => onUpdateStatus(member.id, season, e.target.value as DominionStatus)}
                className={`w-full text-[10px] p-1.5 rounded border transition-all appearance-none text-center focus:outline-none ${STATUS_COLORS[currentStatus]} ${isEditable ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
              >
                {Object.values(DominionStatus).map(status => (
                  <option key={status} value={status} className="bg-slate-950 text-slate-200">{status}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {isEditable && (
        <div className="w-20 shrink-0 flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity ml-4">
          <button onClick={() => onEdit(member)} className="p-1.5 rounded hover:bg-cyan-900/40 text-cyan-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button onClick={() => onDelete(member.id)} className="p-1.5 rounded hover:bg-rose-900/40 text-rose-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberCard;
