const noteWindow = document.getElementById('noteWindow');
const btnMenu = document.getElementById('btnMenu');
const btnNewNote = document.getElementById('btnNewNote');
const btnPin = document.getElementById('btnPin');
const btnMinimize = document.getElementById('btnMinimize');
const btnClose = document.getElementById('btnClose');
const colorPicker = document.getElementById('colorPicker');
const btnDeleteNote = document.getElementById('btnDeleteNote');
const formattingToolbar = document.getElementById('formattingToolbar');

let noteId = null;
let currentNote = null;
let quill = null;
let saveTimeout = null;

// ---- Initialize Quill ----
function initQuill() {
  quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Escreva sua nota...',
    modules: {
      toolbar: false
    }
  });

  quill.on('text-change', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveNote, 400);
    updateFormattingButtons();
  });

  quill.on('selection-change', () => {
    updateFormattingButtons();
  });

  // ---- Image Paste (Ctrl+V) ----
  // Use capture phase to intercept before Quill's clipboard module
  quill.root.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.stopImmediatePropagation();
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', reader.result);
          quill.setSelection(range.index + 1);
        };
        reader.readAsDataURL(file);
        return;
      }
    }
  }, true);

  // ---- Image Drop ----
  quill.root.addEventListener('drop', (e) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    e.preventDefault();
    e.stopPropagation();

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'image', reader.result);
        quill.setSelection(range.index + 1);
      };
      reader.readAsDataURL(file);
    });
  });

  quill.root.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
}

// ---- Save Note ----
async function saveNote() {
  if (!noteId || !quill) return;
  const content = quill.getContents().ops;
  const plainText = quill.getText();
  await window.api.updateNote(noteId, { content, plainText });
}

// ---- Load Note ----
async function loadNote() {
  noteId = window.api.getNoteId();
  if (!noteId) return;

  currentNote = await window.api.getNote(noteId);
  if (!currentNote) return;

  // Apply color
  setColor(currentNote.color || 'yellow');

  // Apply pin state
  if (currentNote.isPinned) {
    btnPin.classList.add('active');
  }

  // Load content into Quill
  if (currentNote.content && currentNote.content.length > 0) {
    quill.setContents(currentNote.content);
  }

  // Focus editor
  quill.focus();
}

// ---- Color ----
function setColor(color) {
  noteWindow.setAttribute('data-color', color);
  document.documentElement.setAttribute('data-color', color);

  // Update active swatch
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === color);
  });
}

// Color picker toggle
btnMenu.addEventListener('click', () => {
  const isVisible = colorPicker.style.display !== 'none';
  colorPicker.style.display = isVisible ? 'none' : 'flex';
});

// Color selection
colorPicker.addEventListener('click', async (e) => {
  const swatch = e.target.closest('.color-swatch');
  if (swatch) {
    const color = swatch.dataset.color;
    setColor(color);
    await window.api.setColor(noteId, color);
    colorPicker.style.display = 'none';
  }
});

// ---- Formatting Toolbar ----
formattingToolbar.addEventListener('click', (e) => {
  const btn = e.target.closest('.fmt-btn');
  if (!btn || !quill) return;

  const format = btn.dataset.format;
  if (format === 'list') {
    const current = quill.getFormat();
    quill.format('list', current.list === 'bullet' ? false : 'bullet');
  } else {
    const current = quill.getFormat();
    quill.format(format, !current[format]);
  }
  updateFormattingButtons();
});

function updateFormattingButtons() {
  if (!quill) return;
  const format = quill.getFormat();
  formattingToolbar.querySelectorAll('.fmt-btn').forEach(btn => {
    const f = btn.dataset.format;
    if (f === 'list') {
      btn.classList.toggle('active', format.list === 'bullet');
    } else {
      btn.classList.toggle('active', !!format[f]);
    }
  });
}

// ---- Pin ----
btnPin.addEventListener('click', async () => {
  if (!currentNote) return;
  currentNote.isPinned = !currentNote.isPinned;
  btnPin.classList.toggle('active', currentNote.isPinned);
  await window.api.setPin(noteId, currentNote.isPinned);
});

// ---- New Note ----
btnNewNote.addEventListener('click', async () => {
  const note = await window.api.createNote();
  window.api.openNote(note.id);
});

// ---- Delete ----
btnDeleteNote.addEventListener('click', async () => {
  if (!noteId) return;
  await window.api.deleteNote(noteId);
});

// ---- Window Controls ----
btnMinimize.addEventListener('click', () => window.api.minimizeWindow());
btnClose.addEventListener('click', () => window.api.closeWindow());

// ---- Close color picker on click outside ----
document.addEventListener('click', (e) => {
  if (!e.target.closest('.color-picker') && !e.target.closest('#btnMenu')) {
    colorPicker.style.display = 'none';
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
  initQuill();
  await loadNote();
}

init();
