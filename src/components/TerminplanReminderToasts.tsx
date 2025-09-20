import React, { useEffect, useState } from 'react';

type Reminder = {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
};

export default function TerminplanReminderToasts() {
  const [items, setItems] = useState<Reminder[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<any>;
      const id = `${ev.detail.sessionId}-${Date.now()}`;
      const item: Reminder = {
        id,
        title: `Erinnerung: ${ev.detail.title}`,
        priority: ev.detail.priority || 'low',
      };
      setItems(prev => [...prev, item]);
      // Auto-remove after 6s
      setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), 6000);
    };
    window.addEventListener('terminplanReminder', handler as EventListener);
    return () => window.removeEventListener('terminplanReminder', handler as EventListener);
  }, []);

  if (items.length === 0) return null;

  const bg = (p: Reminder['priority']) => p === 'high' ? 'bg-red-600' : p === 'medium' ? 'bg-amber-600' : 'bg-blue-600';

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {items.map(item => (
        <div key={item.id} className={`text-white px-4 py-3 rounded-lg shadow-lg ${bg(item.priority)}`}>
          <div className="text-sm font-semibold">{item.title}</div>
          <div className="text-xs opacity-90">Terminplan Hinweis · Priorität: {item.priority}</div>
        </div>
      ))}
    </div>
  );
}

