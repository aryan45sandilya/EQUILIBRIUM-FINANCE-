'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

export default function NewGroupPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', description: '', currency: 'INR' });

  const mutation = useMutation({
    mutationFn: () => api.createGroup(form),
    onSuccess: (group) => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      router.push(`/groups/${group.id}`);
    },
  });

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/groups" className="brutalist-btn bg-white text-black hover:bg-black hover:text-[#E0FF00] p-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">New Group</h2>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="brutalist-card p-8">
        {mutation.error && (
          <div className="mb-6 flex items-center gap-2 bg-[#FF00F5] border-3 border-black p-3 text-white text-xs font-black uppercase">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {(mutation.error as Error).message}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
          className="space-y-6"
        >
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Group Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Europe Trip 2024"
              required
              className="brutalist-input"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="All expenses for our summer trip..."
              rows={3}
              className="brutalist-input resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Currency</label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm({ ...form, currency: c })}
                  className={`brutalist-btn py-2 px-4 ${
                    form.currency === c
                      ? 'bg-black text-[#E0FF00]'
                      : 'bg-white text-black hover:bg-black hover:text-[#E0FF00]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="brutalist-btn w-full bg-[#FF00F5] text-white hover:bg-black"
          >
            {mutation.isPending ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
