import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, AlertTriangle, ShieldCheck, Wrench, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (title = '') => {
    const lower = title.toLowerCase();
    if (lower.includes('assigned')) return <Wrench className="w-4 h-4 text-indigo-600" />;
    if (lower.includes('resolved') || lower.includes('verified')) return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    if (lower.includes('rejected')) return <XCircle className="w-4 h-4 text-rose-600" />;
    if (lower.includes('critical') || lower.includes('urgent')) return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    return <Clock className="w-4 h-4 text-sky-600" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-slate-500 mt-1">Updates on reported hazards will appear here.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`p-3.5 transition flex gap-3 items-start ${
                    item.isRead ? 'bg-white hover:bg-slate-50' : 'bg-sky-50/60 hover:bg-sky-50'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm flex-shrink-0">
                    {getNotificationIcon(item.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold ${item.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {item.incident && (
                        <Link
                          to={`/incidents/${item.incident.incidentId || item.incident}`}
                          onClick={() => {
                            if (!item.isRead) markAsRead(item._id);
                            setIsOpen(false);
                          }}
                          className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                        >
                          View Incident →
                        </Link>
                      )}
                      {!item.isRead && (
                        <button
                          onClick={() => markAsRead(item._id)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 ml-auto"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
