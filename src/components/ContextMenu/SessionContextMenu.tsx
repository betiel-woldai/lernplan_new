import React from 'react';
import { FaEdit, FaTrash, FaCopy, FaCheck, FaClock, FaCalendarAlt } from 'react-icons/fa';
import ContextMenu, { ContextMenuItem, ContextMenuSeparator, ContextMenuPosition } from './ContextMenu';
import { CalendarSession } from '../../types/calendar';

export interface SessionContextMenuProps {
  isOpen: boolean;
  position: ContextMenuPosition | null;
  session: CalendarSession | null;
  onClose: () => void;
  onEdit: (session: CalendarSession) => void;
  onDelete: (session: CalendarSession) => void;
  onDuplicate: (session: CalendarSession) => void;
  onToggleComplete: (session: CalendarSession) => void;
  onReschedule?: (session: CalendarSession) => void;
}

export default function SessionContextMenu({
  isOpen,
  position,
  session,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleComplete,
  onReschedule
}: SessionContextMenuProps) {
  if (!session) {
    return null;
  }

  // Check if session is in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sessionDate = new Date(session.startTime);
  sessionDate.setHours(0, 0, 0, 0);
  const isFutureSession = sessionDate > today;

  // Determine current status
  const canToggleComplete = !isFutureSession && !session.isAllDay; // No completion toggle for all-day events
  const completionText = session.completed ? 'Als ausstehend markieren' : 'Als abgeschlossen markieren';
  const completionIcon = session.completed ? <FaClock /> : <FaCheck />;

  const isFixed = (session as any).isFixed;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <ContextMenu
      isOpen={isOpen}
      position={position}
      onClose={onClose}
      className="min-w-[200px]"
    >
      {/* Session Info Header */}
      <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
        <div className="font-medium truncate">{session.title}</div>
        <div className="truncate">{session.subjectName}</div>
        {!session.isAllDay && (
          <div className="truncate">
            {session.startTime.toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit'
            })} - {session.endTime.toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
        {session.isAllDay && (
          <div className="truncate text-gray-400">
            Ganztägiger Terminplan-Eintrag
          </div>
        )}
      </div>

      {/* Primary Actions */}
      <ContextMenuItem
        icon={<FaEdit />}
        onClick={() => handleAction(() => onEdit(session))}
        disabled={isFixed}
      >
        {isFixed ? 'Details anzeigen' : 'Bearbeiten'}
      </ContextMenuItem>

      {/* Only show completion toggle for non-all-day events */}
      {!session.isAllDay && (
        <ContextMenuItem
          icon={completionIcon}
          onClick={() => handleAction(() => onToggleComplete(session))}
          disabled={!canToggleComplete}
        >
          {completionText}
          {isFutureSession && (
            <span className="ml-2 text-xs text-gray-400">(Zukunft)</span>
          )}
        </ContextMenuItem>
      )}

      <ContextMenuSeparator />

      {/* Secondary Actions */}
      <ContextMenuItem
        icon={<FaCopy />}
        onClick={() => handleAction(() => onDuplicate(session))}
        disabled={isFixed}
      >
        {isFixed ? 'Duplizieren (gesperrt)' : 'Duplizieren'}
      </ContextMenuItem>

      {onReschedule && (
        <ContextMenuItem
          icon={<FaCalendarAlt />}
          onClick={() => handleAction(() => onReschedule(session))}
          disabled={isFixed}
        >
          {isFixed ? 'Verschieben (gesperrt)' : 'Verschieben'}
        </ContextMenuItem>
      )}

      <ContextMenuSeparator />

      {/* Destructive Actions */}
      <ContextMenuItem
        icon={<FaTrash />}
        onClick={() => handleAction(() => onDelete(session))}
        destructive
        disabled={isFixed}
      >
        {isFixed ? 'Löschen (gesperrt)' : 'Löschen'}
      </ContextMenuItem>
    </ContextMenu>
  );
}
