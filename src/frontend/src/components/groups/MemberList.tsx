'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { api, Group } from '@/lib/api';

interface Props { group: Group }

export function MemberList({ group }: Props) {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => api.addMember(group.id, email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group', group.id] });
      setEmail('');
      setError('');
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="brutalist-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-black/60">Members</h3>
        <span className="text-[9px] font-black text-[#FF00F5] bg-black border border-black px-2 py-0.5">
          {group.members.length} ACTIVE
        </span>
      </div>

      <div className="space-y-3">
        {group.members.map((m) => (
          <div key={m.id} className="flex items-center justify-between p-3 border-3 border-black shadow-brutalist-sm">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-black text-[#E0FF00] border-2 border-black flex items-center justify-center text-xs font-black">
                {m.user.name[0]}
              </div>
              <div>
                <p className="text-xs font-black">{m.user.name}</p>
                <p className="text-[10px] text-black/60 font-bold">{m.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add member */}
      <div className="pt-3 border-t-2 border-black space-y-2">
        {error && <p className="text-xs text-[#FF00F5] font-black">{error}</p>}
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Invite by email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="brutalist-input text-xs py-2 flex-1"
          />
          <button
            onClick={() => mutation.mutate()}
            disabled={!email || mutation.isPending}
            className="brutalist-btn bg-black text-[#E0FF00] hover:bg-[#FF00F5] hover:text-white p-2.5"
          >
            <UserPlus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
