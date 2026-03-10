// ── DOM refs ──────────────────────────────────────────────
const grid       = document.getElementById('notesGrid');
const addBtn     = document.getElementById('addNoteBtn');
const emptyState = document.getElementById('emptyState');

// ── In-memory notes array ─────────────────────────────────
// Seeded from localStorage on page load (or empty array on first visit).
let notes = loadNotes();

// ── Initialise ────────────────────────────────────────────
renderAll();

// ── Event: Add Note button ────────────────────────────────
addBtn.addEventListener('click', () => {
  const note = {
    id:      `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text:    '',
    color:   Math.floor(Math.random() * 6),         // random palette colour
    tilt:    +(Math.random() * 6 - 3).toFixed(2),  // –3° … +3°
    created: new Date().toISOString(),
  };

  notes.unshift(note);   // prepend so newest appears first
  saveNotes();           // persist to localStorage
  renderAll();           // re-draw the grid

  // Auto-focus the new note's textarea
  const newCard = grid.querySelector('.note-card');
  if (newCard) newCard.querySelector('.note-text').focus();
});

// ── Render: all notes ─────────────────────────────────────
function renderAll() {
  grid.innerHTML = '';

  if (notes.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  notes.forEach(note => grid.appendChild(createCard(note)));
}

// ── Render: single card ───────────────────────────────────
function createCard(note) {
  const card = document.createElement('div');
  card.className = `note-card color-${note.color}`;
  card.dataset.id = note.id;

  // Apply the stored tilt as a CSS variable + inline transform
  card.style.setProperty('--tilt', `${note.tilt}deg`);
  card.style.transform = `rotate(${note.tilt}deg)`;

  // Timestamp
  const dateEl = document.createElement('span');
  dateEl.className = 'note-date';
  dateEl.textContent = formatDate(note.created);

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.className = 'note-delete';
  delBtn.setAttribute('aria-label', 'Delete note');
  delBtn.textContent = '✕';
  delBtn.addEventListener('click', () => deleteNote(note.id, card));

  // Editable textarea
  const textarea = document.createElement('textarea');
  textarea.className = 'note-text';
  textarea.value = note.text;
  textarea.placeholder = 'Write something…';
  textarea.setAttribute('aria-label', 'Note text');

  // Save on every keystroke
  // localStorage is updated after a 300ms debounce to avoid
  // excessive writes while the user is typing quickly.
  let debounceTimer;
  textarea.addEventListener('input', () => {
    note.text = textarea.value;          // update in-memory object
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(saveNotes, 300);  // debounced write
  });

  card.appendChild(dateEl);
  card.appendChild(delBtn);
  card.appendChild(textarea);

  return card;
}

// ── Delete a note ─────────────────────────────────────────
function deleteNote(id, cardEl) {
  // Animate out, then remove from array + storage
  cardEl.style.animation = 'noteOut 0.25s ease forwards';
  cardEl.addEventListener('animationend', () => {
    notes = notes.filter(n => n.id !== id);  // remove from array
    saveNotes();                              // update localStorage
    renderAll();                             // re-draw grid
  }, { once: true });
}

// ── localStorage helpers ──────────────────────────────────

/**
 * loadNotes()
 * Reads "stickyNotes" from localStorage and parses the JSON.
 * Returns an empty array if the key doesn't exist (first visit)
 * or if the stored value is corrupted/unparseable.
 */
function loadNotes() {
  try {
    const raw = localStorage.getItem('stickyNotes');
    return raw ? JSON.parse(raw) : [];
  } catch {
    // Corrupted data — start fresh rather than crashing
    return [];
  }
}

/**
 * saveNotes()
 * Serialises the current in-memory `notes` array to JSON
 * and writes it to localStorage under the key "stickyNotes".
 * Called after every create, edit (debounced), and delete.
 */
function saveNotes() {
  localStorage.setItem('stickyNotes', JSON.stringify(notes));
}

// ── Utility: human-readable date ─────────────────────────
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: '2-digit',
  });
}
