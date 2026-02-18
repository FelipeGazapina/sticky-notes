const notesList = document.getElementById('notesList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const btnNewNote = document.getElementById('btnNewNote');

let allNotes = [];

// ---- Color Map ----
const colorMap = {
  yellow: '#FFE78E',
  green: '#92D36E',
  pink: '#F5A3B7',
  purple: '#C2A3E0',
  blue: '#7BCCEC',
  charcoal: '#9E9E9E',
  white: '#E8E8E8',
};

// ---- Format Date ----
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins} min atr\u00e1s`;
  if (diffHours < 24) return `${diffHours}h atr\u00e1s`;
  if (diffDays < 7) return `${diffDays}d atr\u00e1s`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// ---- Render Notes ----
function renderNotes(notes) {
  notesList.innerHTML = '';

  if (allNotes.length === 0) {
    emptyState.style.display = 'flex';
    notesList.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  notesList.style.display = 'block';

  if (notes.length === 0) {
    notesList.innerHTML = '<div class="search-empty">Nenhuma nota encontrada</div>';
    return;
  }

  notes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.id = note.id;

    const title = note.title || 'Nota sem t\u00edtulo';
    const preview = note.plainText
      ? note.plainText.split('\n').filter(l => l.trim()).slice(1, 3).join(' ').substring(0, 80)
      : '';

    card.innerHTML = `
      <div class="note-color-strip" style="background: ${colorMap[note.color] || colorMap.yellow}"></div>
      <div class="note-card-content">
        <div class="note-card-title">${escapeHtml(title)}</div>
        ${preview ? `<div class="note-card-preview">${escapeHtml(preview)}</div>` : ''}
        <div class="note-card-date">${formatDate(note.updatedAt)}</div>
      </div>
      <div class="note-card-actions">
        <button class="btn-delete-note" title="Deletar nota" data-delete="${note.id}">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 4h9M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5.5 6.5v4M8.5 6.5v4M3.5 4l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-delete]')) return;
      window.api.openNote(note.id);
    });

    const deleteBtn = card.querySelector('[data-delete]');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.api.deleteNote(note.id);
    });

    notesList.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ---- Search ----
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      renderNotes(allNotes);
      return;
    }
    const filtered = allNotes.filter(n =>
      (n.plainText && n.plainText.toLowerCase().includes(query)) ||
      (n.title && n.title.toLowerCase().includes(query))
    );
    renderNotes(filtered);
  }, 200);
});

// ---- New Note ----
btnNewNote.addEventListener('click', async () => {
  const note = await window.api.createNote();
  window.api.openNote(note.id);
});

// ---- Listen for changes ----
window.api.onNotesChanged(async (data) => {
  if (data.action === 'create') {
    allNotes.unshift(data.note);
  } else if (data.action === 'update') {
    const idx = allNotes.findIndex(n => n.id === data.note.id);
    if (idx >= 0) {
      allNotes[idx] = data.note;
      allNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
  } else if (data.action === 'delete') {
    allNotes = allNotes.filter(n => n.id !== data.noteId);
  }

  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    const filtered = allNotes.filter(n =>
      (n.plainText && n.plainText.toLowerCase().includes(query)) ||
      (n.title && n.title.toLowerCase().includes(query))
    );
    renderNotes(filtered);
  } else {
    renderNotes(allNotes);
  }
});

// ---- Theme ----
async function applyTheme() {
  const theme = await window.api.getTheme();
  document.documentElement.setAttribute('data-theme', theme);
}

window.api.onThemeChanged((theme) => {
  document.documentElement.setAttribute('data-theme', theme);
});

// ---- Init ----
async function init() {
  await applyTheme();
  allNotes = await window.api.getAllNotes();
  renderNotes(allNotes);
}

init();

// ---- Tab Switching ----
const tabBar = document.getElementById('tabBar');
const tabContentNotes = document.getElementById('tabContentNotes');
const tabContentClock = document.getElementById('tabContentClock');

tabBar.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;

  const tab = btn.dataset.tab;

  tabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (tab === 'notes') {
    tabContentNotes.classList.add('active');
    tabContentClock.classList.remove('active');
  } else if (tab === 'clock') {
    tabContentClock.classList.add('active');
    tabContentNotes.classList.remove('active');
  }
});
