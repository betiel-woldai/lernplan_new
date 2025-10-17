import Calendar from '@/components/Calendar/Calendar';
import { CalendarSession } from '@/types/calendar';

interface CalendarSectionProps {
  subjects: any[];
  selectedSession: CalendarSession | null;
  onSessionClick: (session: CalendarSession) => void;
  onDateClick: (date: Date) => void;
  onCreateSession: (date: Date) => void;
}

// Encapsulates the calendar instructions and calendar component.
export function CalendarSection({
  subjects,
  selectedSession,
  onSessionClick,
  onDateClick,
  onCreateSession,
}: CalendarSectionProps) {
  return (
    <div className="lg:col-span-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-blue-800 text-sm">
          <strong>Kalender-Funktionen:</strong> Klicken Sie auf "+ Session", um neue Sessions zu erstellen. Rechtsklick auf
          Sessions für Bearbeiten, Duplizieren oder Löschen. Sessions per Drag-and-Drop verschieben. Doppelklick für
          Schnellbearbeitung.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Lernkalender</h2>
          <div className="text-sm text-gray-500">Klicke auf Termine für Details</div>
        </div>
        <Calendar
          onSessionClick={onSessionClick}
          onDateClick={onDateClick}
          onCreateSession={onCreateSession}
          selectedSession={selectedSession}
          subjects={subjects}
        />
      </div>
    </div>
  );
}

export default CalendarSection;
