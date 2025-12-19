
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, remove } from "firebase/database";
import { Member, DominionStatus } from './types';
import { INITIAL_SEASONS, SQUAD_GROUPS, PRESET_MEMBER_NAMES } from './constants';
import MemberCard from './components/MemberCard';
import AddMemberModal from './components/AddMemberModal';
import LoginScreen from './components/LoginScreen';
import { analyzeSquadDistribution } from './services/geminiService';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzbKWTZJy0pyQgUkYwUJIrYVXKQL2zdvI",
  authDomain: "sangoaward.firebaseapp.com",
  databaseURL: "https://sangoaward-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sangoaward",
  storageBucket: "sangoaward.firebasestorage.app",
  messagingSenderId: "1051318463158",
  appId: "1:1051318463158:web:85a1d5dfaf8aa29dec1417"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

type SortKey = 'group' | 'name' | 'lineName' | string;
type SortDirection = 'asc' | 'desc';
type UserRole = 'visitor' | 'admin' | null;

const App: React.FC = () => {
  const [authRole, setAuthRole] = useState<UserRole>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [seasons] = useState<string[]>(INITIAL_SEASONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'group',
    direction: 'asc',
  });

  // Fetch data from Firebase Realtime Database
  useEffect(() => {
    const membersRef = ref(db, 'members');
    const unsubscribe = onValue(membersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object of objects to array
        const memberList: Member[] = Object.keys(data).map(key => {
          const m = data[key];
          // Ensure seasonal history is consistent with INITIAL_SEASONS
          const history = m.seasonalHistory || [];
          const updatedHistory = INITIAL_SEASONS.map(s => {
            const existing = history.find((h: any) => h.season === s);
            return existing || { season: s, status: DominionStatus.EMPTY };
          });
          return { ...m, id: key, seasonalHistory: updatedHistory };
        });
        setMembers(memberList);
      } else {
        // Only seed if database is truly empty
        seedInitialData();
      }
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, []);

  const seedInitialData = () => {
    // Check local storage first to prevent overwriting cloud if it was meant to be populated
    const saved = localStorage.getItem('dominion_members');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        parsed.forEach((m: Member) => {
          set(ref(db, `members/${m.id}`), m);
        });
        return;
      }
    }

    // Default presets
    PRESET_MEMBER_NAMES.forEach(name => {
      const id = crypto.randomUUID();
      const newMember = {
        id,
        name,
        group: 'A',
        lineName: '',
        seasonalHistory: INITIAL_SEASONS.map(s => ({ season: s, status: DominionStatus.EMPTY }))
      };
      set(ref(db, `members/${id}`), newMember);
    });
  };

  // Sync back to local storage as a secondary cache
  useEffect(() => {
    if (members.length > 0) {
      localStorage.setItem('dominion_members', JSON.stringify(members));
    }
  }, [members]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredMembers = useMemo(() => {
    let result = members.filter(m => {
      const nameMatch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      const lineMatch = m.lineName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = nameMatch || lineMatch;
      const matchesGroup = filterGroup === 'ALL' || m.group === filterGroup;
      return matchesSearch && matchesGroup;
    });

    result.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortConfig.key === 'group') {
        valA = a.group;
        valB = b.group;
      } else if (sortConfig.key === 'name') {
        valA = a.name;
        valB = b.name;
      } else if (sortConfig.key === 'lineName') {
        valA = a.lineName;
        valB = b.lineName;
      } else {
        valA = a.seasonalHistory.find(s => s.season === sortConfig.key)?.status || '';
        valB = b.seasonalHistory.find(s => s.season === sortConfig.key)?.status || '';
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [members, searchQuery, filterGroup, sortConfig]);

  const handleAddMember = (memberData: Partial<Member>) => {
    if (authRole !== 'admin') return;
    if (editingMember) {
      update(ref(db, `members/${editingMember.id}`), memberData);
    } else {
      const id = crypto.randomUUID();
      const newMember: Member = {
        id,
        name: memberData.name || 'Unknown',
        group: memberData.group || SQUAD_GROUPS[0],
        lineName: memberData.lineName || '',
        seasonalHistory: memberData.seasonalHistory || seasons.map(s => ({ season: s, status: DominionStatus.EMPTY }))
      };
      set(ref(db, `members/${id}`), newMember);
    }
    setEditingMember(null);
  };

  const handleUpdateStatus = (memberId: string, season: string, status: DominionStatus) => {
    if (authRole !== 'admin') return;
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const history = [...member.seasonalHistory];
    const idx = history.findIndex(s => s.season === season);
    if (idx > -1) {
      history[idx] = { ...history[idx], status };
    } else {
      history.push({ season, status });
    }
    update(ref(db, `members/${memberId}`), { seasonalHistory: history });
  };

  const handleUpdateGroup = (memberId: string, group: string) => {
    if (authRole !== 'admin') return;
    update(ref(db, `members/${memberId}`), { group });
  };

  const handleUpdateLineName = (memberId: string, lineName: string) => {
    if (authRole !== 'admin') return;
    update(ref(db, `members/${memberId}`), { lineName });
  };

  const handleDelete = (id: string) => {
    if (authRole !== 'admin') return;
    if (confirm('確定要移除此成員的登錄資訊嗎？')) {
      remove(ref(db, `members/${id}`));
    }
  };

  const handleAnalyze = async () => {
    if (members.length === 0) return;
    setIsAnalyzing(true);
    const result = await analyzeSquadDistribution(members);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <svg className="w-3 h-3 opacity-30" fill="currentColor" viewBox="0 0 20 20"><path d="M5 10l5-5 5 5H5zM5 12l5 5 5-5H5z"/></svg>;
    return sortConfig.direction === 'asc' 
      ? <svg className="w-3 h-3 text-cyan-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 10l5-5 5 5H5z"/></svg>
      : <svg className="w-3 h-3 text-cyan-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 12l5 5 5-5H5z"/></svg>;
  };

  if (!authRole) {
    return <LoginScreen onLogin={(role) => setAuthRole(role)} />;
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/20 px-4 py-3">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-cyan-600 flex items-center justify-center neon-border shadow-cyan-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-orbitron font-bold tracking-tighter text-white glow-text uppercase">DOMINION CMDR</h1>
              <div className="flex items-center gap-2">
                <p className="text-[9px] text-cyan-400 uppercase tracking-[0.2em] font-bold">霸業管理終端</p>
                <span className={`text-[8px] px-1.5 py-0.5 rounded border ${authRole === 'admin' ? 'border-amber-500/50 text-amber-500' : 'border-slate-500/50 text-slate-500'} font-bold uppercase`}>
                  {authRole}
                </span>
                {isSyncing && <span className="text-[7px] text-cyan-500 animate-pulse font-bold tracking-widest ml-2">SYNCING...</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="text-[10px] bg-slate-900/50 hover:bg-cyan-900/30 text-cyan-400 px-4 py-2 rounded-full border border-cyan-900/50 transition-all font-bold uppercase tracking-widest"
            >
              {isAnalyzing ? '分析中...' : '戰略建議'}
            </button>
            <div className="relative">
              <input 
                type="text"
                placeholder="搜索成員..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900/80 border border-slate-700 rounded-full px-4 py-1.5 text-xs w-40 focus:w-56 focus:border-cyan-500 outline-none transition-all text-white"
              />
            </div>
            <select 
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 rounded-full px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-500"
            >
              <option value="ALL">全部組別</option>
              {SQUAD_GROUPS.map(g => <option key={g} value={g}>{g} 組</option>)}
            </select>
            {authRole === 'admin' && (
              <button 
                onClick={() => { setEditingMember(null); setShowModal(true); }}
                className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full px-4 py-1.5 text-xs font-bold neon-border transition-all flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                新增成員
              </button>
            )}
            <button
              onClick={() => setAuthRole(null)}
              className="text-slate-500 hover:text-white transition-colors p-1"
              title="退出系統"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 mt-6">
        <div className="flex flex-col gap-6">
           {analysis && (
             <div className="glass-panel rounded-lg p-4 mb-2 border-l-4 border-amber-500 relative animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="flex justify-between items-start mb-2">
                 <h4 className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-2 tracking-widest">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   AI 指揮官戰略建議
                 </h4>
                 <button onClick={() => setAnalysis(null)} className="text-slate-500 hover:text-white">&times;</button>
               </div>
               <div className="text-xs text-slate-300 leading-relaxed italic">
                 {analysis}
               </div>
             </div>
           )}

           <div className="overflow-x-auto custom-scrollbar">
             <div className="flex flex-col gap-1 min-w-[1350px]">
                <div className="px-4 py-4 flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
                   <div className="w-10 shrink-0 text-center">#</div>
                   <div 
                      className="w-72 shrink-0 flex items-center gap-2 cursor-pointer hover:text-cyan-400 transition-colors"
                      onClick={() => handleSort('group')}
                    >
                     <span>組別 / 成員</span>
                     <SortIcon column="group" />
                   </div>
                   <div 
                      className="w-40 shrink-0 px-3 flex items-center gap-2 cursor-pointer hover:text-cyan-400 transition-colors"
                      onClick={() => handleSort('lineName')}
                    >
                     <span>LINE 名稱</span>
                     <SortIcon column="lineName" />
                   </div>
                   <div className="flex-1 flex gap-2 ml-4">
                      {seasons.map(s => {
                        const totalDominion = members.filter(m => 
                          m.seasonalHistory?.find(h => h.season === s)?.status === DominionStatus.CURRENT_DOMINION
                        ).length;

                        return (
                          <div key={s} className="flex-1 flex flex-col items-center gap-1 group/season">
                            <div 
                              className="w-full text-center text-cyan-500 group-hover/season:text-cyan-300 text-xl font-orbitron flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              onClick={() => handleSort(s)}
                            >
                              {s}
                              <SortIcon column={s} />
                            </div>
                            <div className="text-[10px] text-yellow-500/80 font-bold bg-yellow-900/20 px-2 py-0.5 rounded-full border border-yellow-700/30">
                              霸業: {totalDominion}
                            </div>
                          </div>
                        );
                      })}
                   </div>
                   <div className={`w-20 shrink-0 ml-4 ${authRole !== 'admin' ? 'hidden' : ''}`}></div>
                </div>

                <div className="space-y-1 mt-1 pr-2 custom-scrollbar pb-10">
                  {filteredMembers.map((member, idx) => (
                    <MemberCard 
                      key={member.id}
                      index={idx}
                      member={member}
                      seasons={seasons}
                      isEditable={authRole === 'admin'}
                      onUpdateStatus={handleUpdateStatus}
                      onUpdateGroup={handleUpdateGroup}
                      onUpdateLineName={handleUpdateLineName}
                      onDelete={handleDelete}
                      onEdit={(m) => { setEditingMember(m); setShowModal(true); }}
                    />
                  ))}
                  {filteredMembers.length === 0 && !isSyncing && (
                     <div className="py-20 text-center glass-panel rounded-xl">
                      <p className="text-slate-500 font-orbitron text-xs tracking-[0.3em] uppercase">No Signals Detected in Current Sector</p>
                    </div>
                  )}
                  {isSyncing && (
                    <div className="py-20 text-center glass-panel rounded-xl animate-pulse">
                      <p className="text-cyan-500 font-orbitron text-xs tracking-[0.3em] uppercase">Establishing Secure Link...</p>
                    </div>
                  )}
                </div>
             </div>
           </div>
        </div>
      </main>

      {showModal && (
        <AddMemberModal 
          onClose={() => { setShowModal(false); setEditingMember(null); }}
          onSave={handleAddMember}
          editMember={editingMember}
        />
      )}

      <footer className="fixed bottom-0 w-full bg-slate-950/90 border-t border-slate-900 py-2 text-center px-4 backdrop-blur-md z-50">
        <p className="text-[9px] text-slate-600 uppercase tracking-widest font-orbitron flex items-center justify-center gap-4">
          <span>System V3.0-ONLINE</span>
          <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
          <span>Role: {authRole === 'admin' ? 'Authorized' : 'Viewer'}</span>
          <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
          <span>Database: {members.length} Units Synchronized</span>
        </p>
      </footer>
    </div>
  );
};

export default App;
