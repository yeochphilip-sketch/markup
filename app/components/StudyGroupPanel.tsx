'use client';

import { useState, useCallback } from 'react';

interface StudyGroup {
  id: string;
  name: string;
  joinCode?: string;
  memberCount?: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  xp: number;
  streak: number;
  level: string;
  isMe: boolean;
}

interface StudyGroupPanelProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudyGroupPanel({ userId, isOpen, onClose }: StudyGroupPanelProps) {
  const [tab, setTab] = useState<'create' | 'join' | 'leaderboard'>('leaderboard');
  const [groupName, setGroupName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Fetch user's groups on open
  const fetchMyGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'info', userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMyGroups(data.groups ?? []);
        if (data.groups?.length > 0) {
          setSelectedGroup(data.groups[0]);
          fetchLeaderboard(data.groups[0].id);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchLeaderboard = async (groupId: string) => {
    try {
      const res = await fetch(`/api/study-groups?groupId=${groupId}&userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard ?? []);
        setSelectedGroup(data.group);
      }
    } catch {
      // silent
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', userId, groupName: groupName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Group created! Share code: ${data.group.joinCode}` });
        setGroupName('');
        setTab('leaderboard');
        fetchMyGroups();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create group' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCodeInput.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', userId, joinCode: joinCodeInput.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: data.alreadyMember
            ? `You're already in "${data.group.name}"`
            : `Joined "${data.group.name}"!`,
        });
        setJoinCodeInput('');
        setTab('leaderboard');
        fetchMyGroups();
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid code' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-950 border border-slate-800 rounded-3xl p-5 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-black tracking-widest text-slate-300 uppercase">👥 Study Groups</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-sm">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mb-4">
          {(['leaderboard', 'create', 'join'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setMessage(null); if (t === 'leaderboard') fetchMyGroups(); }}
              className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'leaderboard' ? '🏆 Leaderboard' : t === 'create' ? '✨ Create' : '🔗 Join'}
            </button>
          ))}
        </div>

        {message && (
          <div
            className={`px-3 py-2 rounded-xl text-[10px] font-medium mb-3 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : message.type === 'error'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tab Content */}
        {tab === 'create' && (
          <div className="space-y-3">
            <p className="text-[10px] text-slate-500 font-mono">
              Create a study group and share the code with your classmates!
            </p>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Sec 3 SS Study Group"
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              maxLength={50}
            />
            <button
              onClick={handleCreate}
              disabled={loading || !groupName.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : '✨ Create Group'}
            </button>
          </div>
        )}

        {tab === 'join' && (
          <div className="space-y-3">
            <p className="text-[10px] text-slate-500 font-mono">
              Ask your friend for their group code and enter it below.
            </p>
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 text-center font-mono font-bold tracking-widest focus:outline-none focus:border-indigo-500 uppercase"
              maxLength={6}
            />
            <button
              onClick={handleJoin}
              disabled={loading || joinCodeInput.trim().length < 4}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Joining...' : '🔗 Join Group'}
            </button>
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="space-y-3">
            {/* Group selector */}
            {myGroups.length > 1 && (
              <select
                value={selectedGroup?.id ?? ''}
                onChange={(e) => {
                  const g = myGroups.find((mg) => mg.id === e.target.value);
                  if (g) {
                    setSelectedGroup(g);
                    fetchLeaderboard(g.id);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                {myGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            )}

            {loading ? (
              <div className="text-center py-8">
                <p className="text-xs text-slate-500 font-mono animate-pulse">Loading...</p>
              </div>
            ) : myGroups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[11px] text-slate-600 font-mono mb-2">You're not in any study groups yet.</p>
                <p className="text-[10px] text-slate-500">
                  Create one or join with a code from your classmates!
                </p>
              </div>
            ) : selectedGroup ? (
              <>
                {/* Group info */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-200">{selectedGroup.name}</p>
                    <p className="text-[9px] text-slate-600 font-mono mt-0.5">
                      Code: {selectedGroup.joinCode} · {selectedGroup.memberCount} members
                    </p>
                  </div>
                  {selectedGroup.joinCode && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedGroup.joinCode || '');
                        setMessage({ type: 'info', text: 'Code copied!' });
                      }}
                      className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 bg-slate-800 px-2 py-1 rounded-lg transition"
                    >
                      📋 Copy Code
                    </button>
                  )}
                </div>

                {/* Leaderboard */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
                  {leaderboard.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-[10px] text-slate-600 font-mono">No members yet</p>
                    </div>
                  ) : (
                    leaderboard.map((entry) => (
                      <div
                        key={entry.rank}
                        className={`flex items-center justify-between px-4 py-2.5 border-b border-slate-800/50 last:border-0 ${
                          entry.isMe ? 'bg-indigo-500/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 text-center text-xs font-mono font-bold ${
                              entry.rank === 1
                                ? 'text-amber-400'
                                : entry.rank === 2
                                ? 'text-slate-300'
                                : entry.rank === 3
                                ? 'text-amber-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                          </span>
                          <span className={`text-xs font-medium ${entry.isMe ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}>
                            {entry.isMe ? 'You' : entry.level}
                          </span>
                          {entry.streak >= 3 && (
                            <span className="text-[9px]">🔥</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-slate-500">{entry.xp} pts</span>
                          <span className="text-[8px] text-slate-600">{entry.streak}d</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
