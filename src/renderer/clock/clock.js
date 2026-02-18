// ---- DOM References ----
const btnNewTimer = document.getElementById('btnNewTimer');
const timerDisplay = document.getElementById('timerDisplay');
const timerForm = document.getElementById('timerForm');
const timerList = document.getElementById('timerList');
const timerEmptyState = document.getElementById('timerEmptyState');
const timerCountdown = document.getElementById('timerCountdown');
const timerLabelEl = document.getElementById('timerLabel');
const timerPhaseEl = document.getElementById('timerPhase');
const timerProgressFill = document.getElementById('timerProgressFill');
const timerRoundInfo = document.getElementById('timerRoundInfo');
const btnTimerPlayPause = document.getElementById('btnTimerPlayPause');
const btnTimerStop = document.getElementById('btnTimerStop');

let allTimers = [];
let activeTimerId = null;
let countdownInterval = null;

// ---- Format Time (ms → HH:MM:SS or MM:SS) ----
function formatTime(ms) {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ---- Format Duration for cards ----
function formatDuration(ms) {
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes >= 60) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
  return `${totalMinutes}min`;
}

// ---- Escape HTML ----
function escapeHtmlClock(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ---- Render Timer List ----
function renderTimers() {
  timerList.innerHTML = '';

  if (allTimers.length === 0) {
    timerEmptyState.style.display = 'flex';
    timerList.style.display = 'none';
    return;
  }

  timerEmptyState.style.display = 'none';
  timerList.style.display = 'block';

  allTimers.forEach(timer => {
    const card = document.createElement('div');
    card.className = 'timer-card' + (timer.id === activeTimerId ? ' selected' : '');
    card.dataset.id = timer.id;

    const typeLabel = timer.type === 'pomodoro'
      ? `Pomodoro ${formatDuration(timer.workMs)} / ${formatDuration(timer.breakMs)} \u00d7 ${timer.rounds}`
      : formatDuration(timer.durationMs);

    card.innerHTML = `
      <div class="timer-card-status ${timer.status}"></div>
      <div class="timer-card-info">
        <div class="timer-card-label">${escapeHtmlClock(timer.label || 'Untitled Timer')}</div>
        <div class="timer-card-detail">${typeLabel}</div>
      </div>
      <div class="timer-card-time">${formatTime(timer.remainingMs)}</div>
      <div class="timer-card-actions">
        <button class="btn-delete-timer" title="Delete" data-delete="${timer.id}">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 4h9M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5.5 6.5v4M8.5 6.5v4M3.5 4l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-delete]')) return;
      selectTimer(timer.id);
    });

    const deleteBtn = card.querySelector('[data-delete]');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDeleteTimer(timer.id);
    });

    timerList.appendChild(card);
  });
}

// ---- Select and display timer ----
function selectTimer(id) {
  activeTimerId = id;
  const timer = allTimers.find(t => t.id === id);
  if (!timer) return;
  updateTimerDisplay(timer);
  timerDisplay.style.display = 'flex';
  renderTimers(); // update selected highlight
}

// ---- Update active timer display ----
function updateTimerDisplay(timer) {
  timerLabelEl.textContent = timer.label || 'Untitled Timer';
  timerLabelEl.title = 'Double-click to rename';
  timerCountdown.textContent = formatTime(timer.remainingMs);

  if (timer.type === 'pomodoro') {
    timerPhaseEl.textContent = timer.phase === 'work' ? 'WORK' : 'BREAK';
    timerPhaseEl.className = 'timer-phase' + (timer.phase === 'break' ? ' break' : '');
    timerPhaseEl.style.display = 'block';
    timerRoundInfo.textContent = `Round ${timer.currentRound} of ${timer.rounds}`;
    timerRoundInfo.style.display = 'block';

    const totalMs = timer.phase === 'work' ? timer.workMs : timer.breakMs;
    const progress = totalMs > 0 ? ((totalMs - timer.remainingMs) / totalMs) * 100 : 0;
    timerProgressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  } else {
    timerPhaseEl.style.display = 'none';
    timerRoundInfo.style.display = 'none';

    const progress = timer.durationMs > 0 ? ((timer.durationMs - timer.remainingMs) / timer.durationMs) * 100 : 0;
    timerProgressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  updatePlayPauseIcon(timer.status);
}

function updatePlayPauseIcon(status) {
  const isRunning = status === 'running';
  btnTimerPlayPause.innerHTML = isRunning
    ? `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
         <rect x="4" y="3" width="3" height="10" rx="1" fill="currentColor"/>
         <rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor"/>
       </svg>`
    : `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
         <path d="M4 2.5L13 8L4 13.5V2.5Z" fill="currentColor"/>
       </svg>`;
  btnTimerPlayPause.className = isRunning ? 'timer-btn' : 'timer-btn primary';
  btnTimerPlayPause.title = isRunning ? 'Pause' : 'Start';
}

// ---- Countdown Logic ----
function startCountdown() {
  stopCountdown();
  countdownInterval = setInterval(() => {
    tickTimer();
  }, 250); // tick every 250ms for smooth updates
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

let lastPersistTime = 0;

function tickTimer() {
  if (!activeTimerId) { stopCountdown(); return; }
  const timer = allTimers.find(t => t.id === activeTimerId);
  if (!timer || timer.status !== 'running' || !timer.startedAt) {
    stopCountdown();
    return;
  }

  const elapsed = Date.now() - new Date(timer.startedAt).getTime();
  const newRemaining = Math.max(0, timer._resumeRemaining - elapsed);
  timer.remainingMs = newRemaining;

  updateTimerDisplay(timer);

  // Update card time in list
  const card = timerList.querySelector(`[data-id="${timer.id}"] .timer-card-time`);
  if (card) card.textContent = formatTime(newRemaining);

  // Persist every 5 seconds
  const now = Date.now();
  if (now - lastPersistTime > 5000) {
    lastPersistTime = now;
    window.api.updateTimer(timer.id, { remainingMs: newRemaining });
  }

  if (newRemaining <= 0) {
    handleTimerSegmentComplete(timer);
  }
}

async function handleTimerSegmentComplete(timer) {
  stopCountdown();

  if (timer.type === 'simple') {
    timer.status = 'completed';
    timer.remainingMs = 0;
    timer.completedAt = new Date().toISOString();
    await window.api.updateTimer(timer.id, {
      status: 'completed',
      remainingMs: 0,
      completedAt: timer.completedAt
    });

    if (timer.desktopNotification) {
      window.api.sendTimerNotification({
        title: 'Timer Complete!',
        body: `"${timer.label || 'Timer'}" has finished.`
      });
    }
    if (timer.audioAlert) playBeep();

  } else if (timer.type === 'pomodoro') {
    if (timer.phase === 'work') {
      // Work done → start break
      if (timer.desktopNotification) {
        window.api.sendTimerNotification({
          title: 'Break Time!',
          body: `Work round ${timer.currentRound} complete. Take a break!`
        });
      }
      if (timer.audioAlert) playBeep();

      timer.phase = 'break';
      timer.remainingMs = timer.breakMs;
      timer.startedAt = new Date().toISOString();
      timer._resumeRemaining = timer.breakMs;

      await window.api.updateTimer(timer.id, {
        phase: 'break',
        remainingMs: timer.breakMs,
        startedAt: timer.startedAt
      });

      startCountdown();
    } else {
      // Break done
      if (timer.currentRound >= timer.rounds) {
        // All rounds complete
        timer.status = 'completed';
        timer.remainingMs = 0;
        timer.completedAt = new Date().toISOString();
        await window.api.updateTimer(timer.id, {
          status: 'completed',
          remainingMs: 0,
          completedAt: timer.completedAt
        });

        if (timer.desktopNotification) {
          window.api.sendTimerNotification({
            title: 'Pomodoro Complete!',
            body: `All ${timer.rounds} rounds finished!`
          });
        }
        if (timer.audioAlert) playBeep();
      } else {
        // Next round
        timer.currentRound += 1;
        timer.phase = 'work';
        timer.remainingMs = timer.workMs;
        timer.startedAt = new Date().toISOString();
        timer._resumeRemaining = timer.workMs;

        await window.api.updateTimer(timer.id, {
          currentRound: timer.currentRound,
          phase: 'work',
          remainingMs: timer.workMs,
          startedAt: timer.startedAt
        });

        if (timer.desktopNotification) {
          window.api.sendTimerNotification({
            title: 'Back to Work!',
            body: `Starting round ${timer.currentRound} of ${timer.rounds}`
          });
        }
        if (timer.audioAlert) playBeep();

        startCountdown();
      }
    }
  }

  updateTimerDisplay(timer);
  renderTimers();
}

// ---- Audio Beep (Web Audio API) ----
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Silently fail
  }
}

// ---- Play/Pause Handler ----
btnTimerPlayPause.addEventListener('click', async () => {
  if (!activeTimerId) return;
  const timer = allTimers.find(t => t.id === activeTimerId);
  if (!timer || timer.status === 'completed') return;

  if (timer.status === 'running') {
    // Pause
    stopCountdown();
    timer.status = 'paused';
    await window.api.updateTimer(timer.id, {
      status: 'paused',
      remainingMs: timer.remainingMs,
      startedAt: null
    });
  } else {
    // Start or Resume
    timer.status = 'running';
    timer.startedAt = new Date().toISOString();
    timer._resumeRemaining = timer.remainingMs;
    await window.api.updateTimer(timer.id, {
      status: 'running',
      startedAt: timer.startedAt
    });
    startCountdown();
  }

  updateTimerDisplay(timer);
  renderTimers();
});

// ---- Stop (Reset) Handler ----
btnTimerStop.addEventListener('click', async () => {
  if (!activeTimerId) return;
  const timer = allTimers.find(t => t.id === activeTimerId);
  if (!timer) return;

  stopCountdown();
  timer.status = 'planned';
  timer.phase = 'work';
  timer.currentRound = 1;
  timer.remainingMs = timer.type === 'pomodoro' ? timer.workMs : timer.durationMs;
  timer.startedAt = null;

  await window.api.updateTimer(timer.id, {
    status: 'planned',
    phase: 'work',
    currentRound: 1,
    remainingMs: timer.remainingMs,
    startedAt: null,
    completedAt: null
  });

  updateTimerDisplay(timer);
  renderTimers();
});

// ---- New Timer Button ----
btnNewTimer.addEventListener('click', () => {
  showTimerForm();
});

function showTimerForm() {
  timerForm.style.display = 'flex';
  timerForm.innerHTML = buildTimerFormHTML();
  attachFormListeners();
}

function hideTimerForm() {
  timerForm.style.display = 'none';
  timerForm.innerHTML = '';
}

function buildTimerFormHTML() {
  return `
    <div class="timer-type-toggle">
      <button class="timer-type-btn active" data-type="simple">Simple Timer</button>
      <button class="timer-type-btn" data-type="pomodoro">Pomodoro</button>
    </div>
    <div class="timer-form-group">
      <label class="timer-form-label">Label</label>
      <input type="text" class="timer-form-input" id="formTimerLabel" placeholder="e.g., Study Session">
    </div>
    <div id="formSimpleFields">
      <div class="timer-form-group">
        <label class="timer-form-label">Duration</label>
        <div class="timer-form-row">
          <div class="timer-input-with-label">
            <input type="number" class="timer-form-input" id="formHours" min="0" value="0">
            <span class="timer-input-unit">hours</span>
          </div>
          <div class="timer-input-with-label">
            <input type="number" class="timer-form-input" id="formMinutes" min="0" max="59" value="25">
            <span class="timer-input-unit">min</span>
          </div>
        </div>
      </div>
    </div>
    <div id="formPomodoroFields" style="display: none;">
      <div class="timer-form-group">
        <label class="timer-form-label">Work</label>
        <div class="timer-input-with-label">
          <input type="number" class="timer-form-input" id="formWorkMin" value="25" min="1">
          <span class="timer-input-unit">min</span>
        </div>
      </div>
      <div class="timer-form-group">
        <label class="timer-form-label">Break</label>
        <div class="timer-input-with-label">
          <input type="number" class="timer-form-input" id="formBreakMin" value="5" min="1">
          <span class="timer-input-unit">min</span>
        </div>
      </div>
      <div class="timer-form-group">
        <label class="timer-form-label">Rounds</label>
        <input type="number" class="timer-form-input" id="formRounds" value="4" min="1" max="20">
      </div>
    </div>
    <div class="timer-form-actions">
      <button class="btn-timer-cancel" id="formCancel">Cancel</button>
      <button class="btn-timer-create" id="formCreate">Create</button>
    </div>
  `;
}

function attachFormListeners() {
  const typeButtons = timerForm.querySelectorAll('.timer-type-btn');
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.type;
      document.getElementById('formSimpleFields').style.display = type === 'simple' ? 'block' : 'none';
      document.getElementById('formPomodoroFields').style.display = type === 'pomodoro' ? 'block' : 'none';
    });
  });

  document.getElementById('formCancel').addEventListener('click', hideTimerForm);

  document.getElementById('formCreate').addEventListener('click', async () => {
    const activeType = timerForm.querySelector('.timer-type-btn.active').dataset.type;
    const label = document.getElementById('formTimerLabel').value.trim();

    let data;
    if (activeType === 'simple') {
      const hours = parseInt(document.getElementById('formHours').value) || 0;
      const minutes = parseInt(document.getElementById('formMinutes').value) || 0;
      const durationMs = (hours * 3600 + minutes * 60) * 1000;
      if (durationMs <= 0) return;
      data = { type: 'simple', label, durationMs };
    } else {
      const workMs = (parseInt(document.getElementById('formWorkMin').value) || 25) * 60000;
      const breakMs = (parseInt(document.getElementById('formBreakMin').value) || 5) * 60000;
      const rounds = parseInt(document.getElementById('formRounds').value) || 4;
      data = { type: 'pomodoro', label, workMs, breakMs, rounds };
    }

    await window.api.createTimer(data);
    hideTimerForm();
  });
}

// ---- Delete Timer ----
async function handleDeleteTimer(id) {
  if (activeTimerId === id) {
    stopCountdown();
    activeTimerId = null;
    timerDisplay.style.display = 'none';
  }
  await window.api.deleteTimer(id);
}

// ---- Listen for timer changes (from IPC) ----
window.api.onTimersChanged((data) => {
  if (data.action === 'create') {
    allTimers.unshift(data.timer);
  } else if (data.action === 'update') {
    const idx = allTimers.findIndex(t => t.id === data.timer.id);
    if (idx >= 0) {
      const resumeRem = allTimers[idx]._resumeRemaining;
      allTimers[idx] = { ...data.timer };
      if (resumeRem !== undefined) allTimers[idx]._resumeRemaining = resumeRem;
    }
  } else if (data.action === 'delete') {
    allTimers = allTimers.filter(t => t.id !== data.timerId);
  }
  renderTimers();
});

// ---- Editable Timer Label (double-click) ----
timerLabelEl.addEventListener('dblclick', () => {
  if (!activeTimerId) return;
  const timer = allTimers.find(t => t.id === activeTimerId);
  if (!timer) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'timer-label-edit';
  input.value = timer.label || '';
  input.placeholder = 'Timer name...';

  timerLabelEl.replaceWith(input);
  input.focus();
  input.select();

  let saved = false;

  const save = async () => {
    if (saved) return;
    saved = true;
    const newLabel = input.value.trim();
    timer.label = newLabel;
    await window.api.updateTimer(timer.id, { label: newLabel });

    input.replaceWith(timerLabelEl);
    timerLabelEl.textContent = newLabel || 'Untitled Timer';
    renderTimers();
  };

  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.replaceWith(timerLabelEl); saved = true; }
  });
});

// ---- Init Clock ----
async function initClock() {
  allTimers = await window.api.getAllTimers();

  // Restore any running timer
  const runningTimer = allTimers.find(t => t.status === 'running');
  if (runningTimer && runningTimer.startedAt) {
    const elapsed = Date.now() - new Date(runningTimer.startedAt).getTime();
    runningTimer.remainingMs = Math.max(0, runningTimer.remainingMs - elapsed);
    runningTimer._resumeRemaining = runningTimer.remainingMs;
    runningTimer.startedAt = new Date().toISOString();

    await window.api.updateTimer(runningTimer.id, {
      remainingMs: runningTimer.remainingMs,
      startedAt: runningTimer.startedAt
    });

    activeTimerId = runningTimer.id;
    updateTimerDisplay(runningTimer);
    timerDisplay.style.display = 'flex';

    if (runningTimer.remainingMs > 0) {
      startCountdown();
    } else {
      handleTimerSegmentComplete(runningTimer);
    }
  }

  renderTimers();
}

initClock();
