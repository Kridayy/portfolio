/**
 * Dark Mode Toggle — script.js
 *
 * HOW localStorage IS USED:
 * ─────────────────────────────────────────────────────────────
 * localStorage is a browser API that lets us store key/value
 * pairs that persist even after the browser tab is closed.
 *
 *   • localStorage.setItem(key, value)
 *       Saves a string value under the given key.
 *
 *   • localStorage.getItem(key)
 *       Reads the value back. Returns null if the key doesn't exist.
 *
 * Here we store the user's chosen theme under the key "theme"
 * with a value of either "dark" or "light".
 * ─────────────────────────────────────────────────────────────
 */

const toggle = document.getElementById('darkToggle');

// ── 1. Read saved preference on page load ───────────────────
//
// localStorage.getItem('theme') returns:
//   "dark"  — if the user previously chose dark mode
//   "light" — if the user previously chose light mode
//   null    — if the user has never toggled (first visit)
//
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
  // Apply dark mode immediately (before paint) to avoid a flash
  document.body.classList.add('dark');
  toggle.checked = true;           // keep the switch in sync
}

// ── 2. Listen for toggle changes ────────────────────────────
toggle.addEventListener('change', () => {
  if (toggle.checked) {
    // User switched ON  → activate dark mode
    document.body.classList.add('dark');

    // Save preference so it survives page refreshes & tab closes
    localStorage.setItem('theme', 'dark');
  } else {
    // User switched OFF → return to light mode
    document.body.classList.remove('dark');

    // Overwrite the stored value with 'light'
    localStorage.setItem('theme', 'light');
  }
});
