// ============================================================
// SIMULATEUR β-LACTAMASES — Classe A
// 2 axes : Spectre (discret) × Intensité (continu)
// ============================================================

// Zone diameters: [at intensity=0%, at intensity=100%]
// Interpolated linearly based on intensity slider
const PHENOTYPES = {
  pase: {
    label: 'Pénicillinase',
    zones: {
      AX: [18, 6], TIC: [20, 6], AMC: [25, 10], TPZ: [24, 13],
      CFR: [19, 13], FEP: [35, 30], CTX: [32, 25], CAZ: [27, 22],
      CFM: [30, 21], FOX: [28, 18], ETP: [34, 31], MEM: [36, 32],
      CTV: [29, 26], MEC: [28, 6], TEM: [24, 21],
      CN: [23, 22], TOB: [24, 21], AK: [21, 19],
      OFX: [37, 31], SXT: [29, 30], FF: [29, 25], F: [21, 20],
    }
  },
  blse: {
    label: 'BLSE',
    zones: {
      AX: [12, 6], TIC: [14, 6], AMC: [20, 14], TPZ: [20, 14],
      CFR: [14, 7], FEP: [28, 20], CTX: [20, 6], CAZ: [20, 14],
      CFM: [22, 6], FOX: [28, 26], ETP: [34, 30], MEM: [36, 32],
      CTV: [29, 30], MEC: [26, 23], TEM: [24, 21],
      CN: [23, 22], TOB: [24, 21], AK: [21, 19],
      OFX: [37, 31], SXT: [29, 30], FF: [29, 28], F: [21, 20],
    }
  },
  kpc: {
    label: 'KPC',
    zones: {
      AX: [8, 6], TIC: [8, 6], AMC: [10, 6], TPZ: [10, 6],
      CFR: [8, 6], FEP: [14, 6], CTX: [10, 6], CAZ: [10, 6],
      CFM: [10, 6], FOX: [16, 6], ETP: [20, 6], MEM: [24, 6],
      CTV: [29, 28], MEC: [14, 6], TEM: [14, 6],
      CN: [23, 22], TOB: [24, 21], AK: [21, 19],
      OFX: [37, 31], SXT: [29, 30], FF: [29, 25], F: [21, 20],
    }
  }
};

const SPECTRE_ORDER = ['pase', 'blse', 'kpc'];

let currentSpectre = 'pase';
let currentIntensity = 0;

// ============================================================
// ZONE MATH
// ============================================================
function getZoneDiameter(atbId, spectre, intensity) {
  const range = PHENOTYPES[spectre].zones[atbId];
  if (!range) return 30;
  const t = intensity / 100;
  return range[0] + (range[1] - range[0]) * t;
}

function zoneToSvgRadius(diameter) {
  // Map zone diameter [6, 36] → SVG radius [22, 48]
  return Math.max(22, 22 + (diameter - 6) * 0.87);
}

function zoneToStatus(diameter) {
  if (diameter >= 20) return 'S';
  if (diameter >= 14) return 'I';
  return 'R';
}

function statusColor(status) {
  return { S: 'var(--green)', I: 'var(--orange)', R: 'var(--red)' }[status];
}

function statusFill(status) {
  return { S: 'var(--green-dim)', I: 'rgba(245,158,11,0.12)', R: 'rgba(239,68,68,0.12)' }[status];
}

// ============================================================
// RENDER GUIDE PANELS
// ============================================================
function renderGuidePanel(svgId, viewBox, bgFn, discList) {
  const svg = document.getElementById(svgId);
  svg.innerHTML = '';
  bgFn(svg);
  discList.forEach(d => renderGuideDisc(svg, d.id, d.x, d.y));
}

function renderGuideSquarePlate() {
  const margin = 70, spacing = (460 - 2 * margin) / 3;
  const discs = [];
  SQUARE_GRID.forEach((row, ri) => {
    row.forEach((id, ci) => {
      discs.push({ id, x: margin + ci * spacing, y: margin + ri * spacing });
    });
  });
  renderGuidePanel('guide-square', '0 0 460 460', (svg) => {
    svg.appendChild(svgEl('rect', { x: 15, y: 15, width: 430, height: 430, rx: 28, ry: 28, fill: '#161625', stroke: '#2a2a45', 'stroke-width': 2 }));
    svg.appendChild(svgEl('rect', { x: 25, y: 25, width: 410, height: 410, rx: 22, ry: 22, fill: '#111120' }));
  }, discs);
}

function renderGuideRoundPlate() {
  renderGuidePanel('guide-round', '0 0 380 380', (svg) => {
    svg.appendChild(svgEl('circle', { cx: 190, cy: 190, r: 175, fill: '#161625', stroke: '#2a2a45', 'stroke-width': 2 }));
    svg.appendChild(svgEl('circle', { cx: 190, cy: 190, r: 165, fill: '#111120' }));
  }, ROUND_DISCS);
}

function renderGuideDisc(svg, id, cx, cy) {
  const g = svgEl('g', { class: 'disc-group guide-disc', 'data-id': id });

  const zone = svgEl('circle', {
    cx, cy, r: 44, class: 'zone-circle guide-zone',
    fill: 'var(--green-dim)', stroke: 'var(--green)',
    'stroke-width': 1.5, 'stroke-dasharray': '4 2',
    'data-atb': id
  });
  g.appendChild(zone);

  g.appendChild(svgEl('circle', { cx, cy, r: 20, class: 'disc-circle' }));

  const label = svgEl('text', { x: cx, y: cy, class: 'disc-label' });
  label.textContent = id;
  g.appendChild(label);

  g.addEventListener('click', (e) => { e.stopPropagation(); showDiscInfo(id, cx, cy, svg); });
  svg.appendChild(g);
}

// ============================================================
// UPDATE ZONES
// ============================================================
function updateGuideZones() {
  document.querySelectorAll('.guide-zone').forEach(el => {
    const atbId = el.dataset.atb;
    const diameter = getZoneDiameter(atbId, currentSpectre, currentIntensity);
    const status = zoneToStatus(diameter);
    const r = zoneToSvgRadius(diameter);

    el.setAttribute('r', r);
    el.setAttribute('stroke', statusColor(status));
    el.setAttribute('fill', statusFill(status));
  });

  // Update title
  const label = PHENOTYPES[currentSpectre].label;
  const intensityLabel = currentIntensity < 30 ? 'bas niveau' : currentIntensity < 70 ? 'niveau intermédiaire' : 'haut niveau';
  document.getElementById('guide-title').textContent = `${label} — ${intensityLabel}`;

  // Update spectre buttons
  document.querySelectorAll('.spectre-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.spectre === currentSpectre);
  });

  // Update intensity display
  document.getElementById('intensity-value').textContent = `${Math.round(currentIntensity)}%`;
}

// ============================================================
// INIT
// ============================================================
function initGuide() {
  renderGuideSquarePlate();
  renderGuideRoundPlate();

  // Spectre buttons
  document.querySelectorAll('.spectre-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSpectre = btn.dataset.spectre;
      updateGuideZones();
    });
  });

  // Intensity slider
  const slider = document.getElementById('intensity-slider');
  slider.addEventListener('input', () => {
    currentIntensity = parseFloat(slider.value);
    updateGuideZones();
  });

  updateGuideZones();
}
