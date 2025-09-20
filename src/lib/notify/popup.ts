// Minimal popup notification interfaces (actual UI handled elsewhere)

export type Channel = 'popup' | 'browser';

export interface PopupMessage {
  id: string;
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high';
  eventId?: string;
  actions?: { label: string; action: string }[];
}

export interface PopupTransport {
  show(msg: PopupMessage): Promise<void>;
}

export const noopTransport: PopupTransport = {
  async show() {
    // no-op for now; real transport wired in UI
  },
};

