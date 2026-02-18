import Store from 'electron-store';
import crypto from 'crypto';

const schema = {
  notes: {
    type: 'object',
    default: {}
  },
  settings: {
    type: 'object',
    properties: {
      theme: { type: 'string', enum: ['light', 'dark', 'system'], default: 'system' },
      listWindowBounds: {
        type: 'object',
        properties: {
          x: { type: 'number' },
          y: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' }
        }
      }
    },
    default: {
      theme: 'system'
    }
  }
};

const store = new Store({ schema });

export function getAllNotes() {
  const notes = store.get('notes', {});
  return Object.values(notes).sort((a, b) =>
    new Date(b.updatedAt) - new Date(a.updatedAt)
  );
}

export function getNote(id) {
  return store.get(`notes.${id}`, null);
}

export function createNote() {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const note = {
    id,
    title: '',
    content: [],
    plainText: '',
    color: 'yellow',
    isPinned: false,
    createdAt: now,
    updatedAt: now,
    windowBounds: { width: 300, height: 350 }
  };
  store.set(`notes.${id}`, note);
  return note;
}

export function updateNote(id, data) {
  const note = store.get(`notes.${id}`);
  if (!note) return null;

  const updated = {
    ...note,
    ...data,
    id,
    updatedAt: new Date().toISOString()
  };

  if (data.content && Array.isArray(data.content)) {
    const text = data.plainText || '';
    const firstLine = text.split('\n').find(line => line.trim() !== '') || '';
    updated.title = firstLine.substring(0, 50);
    updated.plainText = text;
  }

  store.set(`notes.${id}`, updated);
  return updated;
}

export function deleteNote(id) {
  store.delete(`notes.${id}`);
}

export function getSettings() {
  return store.get('settings', { theme: 'system' });
}

export function updateSettings(data) {
  const settings = store.get('settings', {});
  store.set('settings', { ...settings, ...data });
}

export default store;
