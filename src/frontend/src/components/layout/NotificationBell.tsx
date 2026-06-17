'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { formatDate } from '@/lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllMutation = useMutation({
    mutationFn: api.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Real-time notifications via Socket.IO
  useEffect(() => {
    const socket = getSocket();
    socket.on('notification:new', () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    });
    return () => { socket.off('notification:new'); };
  }, [qc]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 border-3 border-black bg-white hover:bg-black hover:text-[#E0FF00] shadow-brutalist-sm transition-all"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#FF00F5] border border-black text-white text-[9px] font-black flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 bg-white border-4 border-black shadow-[8px_8px_0_0_#000] max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b-3 border-black bg-black text-white">
              <span className="text-xs font-black uppercase tracking-widest">Notifications</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllMutation.mutate()}
                    className="text-[10px] font-black text-[#E0FF00] hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="h-3 w-3" /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs font-black uppercase text-black/40">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b-2 border-black/10 ${!n.read ? 'bg-[#E0FF00]/20' : ''}`}
                >
                  <p className="text-xs font-black text-black">{n.title}</p>
                  <p className="text-[11px] text-black/70 mt-0.5">{n.body}</p>
                  <p className="text-[9px] text-black/40 font-black mt-1 uppercase">{formatDate(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
