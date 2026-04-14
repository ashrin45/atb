// ============================================================
// STATE
// ============================================================
let activeFamilies = new Set();
let selectedDisc = null;
let helpMode = false;

// ============================================================
// SVG HELPERS
// ============================================================
const NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ============================================================
// PLATE RENDERING
// ============================================================
function renderSquarePlate() {
  const svg = document.getElementById('square-plate');
  svg.appendChild(svgEl('rect', { x: 15, y: 15, width: 430, height: 430, rx: 28, ry: 28,
    fill: '#161625', stroke: '#2a2a45', 'stroke-width': 2 }));
  svg.appendChild(svgEl('rect', { x: 25, y: 25, width: 410, height: 410, rx: 22, ry: 22,
    fill: '#111120', stroke: 'none' }));

  const margin = 70, spacing = (460 - 2 * margin) / 3;
  SQUARE_GRID.forEach((row, ri) => {
    row.forEach((id, ci) => renderDisc(svg, id, margin + ci * spacing, margin + ri * spacing));
  });
}

function renderRoundPlate() {
  const svg = document.getElementById('round-plate');
  svg.appendChild(svgEl('circle', { cx: 190, cy: 190, r: 175, fill: '#161625', stroke: '#2a2a45', 'stroke-width': 2 }));
  svg.appendChild(svgEl('circle', { cx: 190, cy: 190, r: 165, fill: '#111120', stroke: 'none' }));
  ROUND_DISCS.forEach(d => renderDisc(svg, d.id, d.x, d.y));
}

function renderDisc(svg, id, cx, cy) {
  const atb = ANTIBIOTICS[id];
  const g = svgEl('g', { class: 'disc-group', 'data-id': id, 'data-family': atb.family,
    'data-blactam': atb.blactam ? '1' : '0' });

  g.appendChild(svgEl('circle', { cx, cy, r: 44, class: 'zone-circle',
    fill: 'var(--green-dim)', stroke: 'var(--green)', 'stroke-width': 1.5, 'stroke-dasharray': '4 2' }));
  g.appendChild(svgEl('circle', { cx, cy, r: 20, class: 'disc-circle' }));

  const label = svgEl('text', { x: cx, y: cy, class: 'disc-label' });
  label.textContent = id;
  g.appendChild(label);

  g.addEventListener('click', (e) => { e.stopPropagation(); showDiscInfo(id, cx, cy, svg); });
  svg.appendChild(g);
}

// ============================================================
// DISC INFO CARD
// ============================================================
function showDiscInfo(id, cx, cy, svg) {
  document.querySelectorAll('.disc-group.selected').forEach(g => g.classList.remove('selected'));
  const atb = ANTIBIOTICS[id];
  const card = document.getElementById('disc-info');
  svg.querySelector(`[data-id="${id}"]`).classList.add('selected');
  selectedDisc = id;

  card.innerHTML = `
    <div class="disc-info-header">
      <div class="disc-info-sigle">${id}</div>
      <div class="disc-info-name">${atb.name}</div>
      <button class="disc-info-close" onclick="hideDiscInfo()" aria-label="Fermer">&times;</button>
    </div>
    <div class="disc-info-row">
      <span class="disc-info-badge" style="border-left: 3px solid ${FAMILY_COLORS[atb.family] || '#888'}">${atb.classe}</span>
      <span class="disc-info-badge">${atb.charge}</span>
    </div>
    ${atb.note && helpMode ? `<div class="disc-info-note">${atb.note}</div>` : ''}
  `;

  const isMobile = window.innerWidth <= 900;
  if (isMobile) {
    // Mobile: card fixed at bottom via CSS, just reset inline positioning
    card.style.left = '';
    card.style.top = '';
  } else {
    const svgRect = svg.getBoundingClientRect();
    const svgVB = svg.viewBox.baseVal;
    const scaleX = svgRect.width / svgVB.width;
    const scaleY = svgRect.height / svgVB.height;
    let left = svgRect.left + cx * scaleX + 30;
    let top = svgRect.top + cy * scaleY - 40;
    if (left + 340 > window.innerWidth) left = svgRect.left + cx * scaleX - 340;
    if (top + 200 > window.innerHeight) top = window.innerHeight - 220;
    if (top < 10) top = 10;
    card.style.left = left + 'px';
    card.style.top = top + 'px';
  }
  card.classList.add('visible');
}

function hideDiscInfo() {
  document.getElementById('disc-info').classList.remove('visible');
  document.querySelectorAll('.disc-group.selected').forEach(g => g.classList.remove('selected'));
  selectedDisc = null;
}

// ============================================================
// FAMILY HIGHLIGHTING — STACKING
// ============================================================
function toggleFamilies(families) {
  const allActive = families.every(f => activeFamilies.has(f));
  if (allActive) {
    families.forEach(f => activeFamilies.delete(f));
  } else {
    families.forEach(f => activeFamilies.add(f));
  }
  applyHighlight();
}

function resetFamilies() {
  activeFamilies.clear();
  applyHighlight();
}

function applyHighlight() {
  const allGroups = document.querySelectorAll('.disc-group');
  hideDiscInfo();

  if (activeFamilies.size === 0) {
    allGroups.forEach(g => {
      g.classList.remove('dimmed', 'highlighted');
      g.style.removeProperty('--highlight-color');
    });
  } else {
    allGroups.forEach(g => {
      const fam = g.dataset.family;
      if (activeFamilies.has(fam)) {
        g.classList.remove('dimmed');
        g.classList.add('highlighted');
        g.style.setProperty('--highlight-color', FAMILY_COLORS[fam] || '#888');
      } else {
        g.classList.add('dimmed');
        g.classList.remove('highlighted');
        g.style.removeProperty('--highlight-color');
      }
    });
  }

  document.querySelectorAll('.family-btn').forEach(btn => {
    const btnFamilies = JSON.parse(btn.dataset.families);
    const allIn = btnFamilies.every(f => activeFamilies.has(f));
    btn.classList.toggle('active', allIn && activeFamilies.size > 0);
  });

  renderActiveFilters();
}

function renderActiveFilters() {
  const container = document.getElementById('active-filters');
  if (activeFamilies.size === 0) { container.innerHTML = ''; return; }
  container.innerHTML = [...activeFamilies].map(f =>
    `<span class="active-filter-tag">
      <span class="tag-dot" style="background:${FAMILY_COLORS[f] || '#888'}"></span>
      ${FAMILY_LABELS[f] || f}
    </span>`
  ).join('');
}

// ============================================================
// TAB NAVIGATION
// ============================================================
function switchTab(tabId) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  hideDiscInfo();
}

// ============================================================
// INIT
// ============================================================
function init() {
  renderSquarePlate();
  renderRoundPlate();

  document.querySelectorAll('.family-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleFamilies(JSON.parse(btn.dataset.families)));
  });

  document.getElementById('btn-reset').addEventListener('click', resetFamilies);

  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.disc-group') && !e.target.closest('.disc-info')) hideDiscInfo();
  });

  // Help mode toggle
  const helpTrack = document.getElementById('help-track');
  helpTrack.addEventListener('click', () => {
    helpMode = !helpMode;
    helpTrack.classList.toggle('on', helpMode);
    // Refresh tooltip if one is open
    if (selectedDisc) {
      const g = document.querySelector(`.disc-group[data-id="${selectedDisc}"]`);
      if (g) g.click();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { resetFamilies(); hideDiscInfo(); }
  });
}

document.addEventListener('DOMContentLoaded', init);
