// ============================================================
// SIMULATEUR β-LACTAMASES — Classe A
// Keyframe system: each ATB has [[intensity%, zone_mm], ...]
// ============================================================

const PHENOTYPES = {
  pase: {
    label: 'Pénicillinase',
    zones: {
      AX:  [[0,22],[3,13],[20,6],[100,6]],
      TIC: [[0,22],[10,13],[25,6],[100,6]],
      AMC: [[0,25],[40,25],[70,14],[100,10]],
      TPZ: [[0,25],[60,25],[85,16],[100,13]],
      CFR: [[0,22],[60,22],[85,14],[100,13]],
      MEC: [[0,28],[80,28],[100,6]],
      FEP: [[0,35],[100,30]],
      CTX: [[0,32],[100,25]],
      CAZ: [[0,27],[100,22]],
      CFM: [[0,30],[100,21]],
      FOX: [[0,28],[100,28]],
      ETP: [[0,34],[100,31]],
      MEM: [[0,36],[100,32]],
      CTV: [[0,29],[100,26]],
      TEM: [[0,24],[100,21]],
      AK:  [[0,21],[100,21]],
      CN:  [[0,23],[100,22]],
      TOB: [[0,24],[100,21]],
      OFX: [[0,37],[100,31]],
      SXT: [[0,29],[100,30]],
      FF:  [[0,29],[100,25]],
      F:   [[0,21],[100,20]],
    }
  },
  blse: {
    label: 'BLSE',
    zones: {
      AX:  [[0,10],[100,6]],
      TIC: [[0,10],[100,6]],
      CFR: [[0,12],[100,7]],
      FEP: [[0,14],[100,6]],
      CTX: [[0,16],[10,13],[100,6]],
      CAZ: [[0,16],[10,13],[100,6]],
      CFM: [[0,16],[10,13],[100,6]],
      AMC: [[0,22],[30,22],[70,14],[100,14]],
      TPZ: [[0,24],[80,24],[100,18]],
      MEC: [[0,26],[100,23]],
      FOX: [[0,28],[100,26]],
      ETP: [[0,34],[100,30]],
      MEM: [[0,36],[100,32]],
      CTV: [[0,29],[100,30]],
      TEM: [[0,24],[100,21]],
      AK:  [[0,21],[100,21]],
      CN:  [[0,23],[100,22]],
      TOB: [[0,24],[100,21]],
      OFX: [[0,37],[100,31]],
      SXT: [[0,29],[100,30]],
      FF:  [[0,29],[100,28]],
      F:   [[0,21],[100,20]],
    }
  },
  kpc: {
    label: 'KPC',
    zones: {
      AX:  [[0,8],[100,6]],
      TIC: [[0,8],[100,6]],
      AMC: [[0,10],[100,6]],
      TPZ: [[0,10],[100,6]],
      CFR: [[0,8],[100,6]],
      FEP: [[0,12],[100,6]],
      CTX: [[0,10],[100,6]],
      CAZ: [[0,10],[100,6]],
      CFM: [[0,10],[100,6]],
      FOX: [[0,16],[30,13],[100,6]],
      ETP: [[0,12],[100,6]],
      MEM: [[0,24],[30,20],[60,13],[100,6]],
      CTV: [[0,29],[100,28]],
      MEC: [[0,14],[100,6]],
      TEM: [[0,14],[100,6]],
      AK:  [[0,21],[100,21]],
      CN:  [[0,23],[100,22]],
      TOB: [[0,24],[100,21]],
      OFX: [[0,37],[100,31]],
      SXT: [[0,29],[100,30]],
      FF:  [[0,29],[100,25]],
      F:   [[0,21],[100,20]],
    }
  }
};

const SPECTRE_ORDER = ['pase', 'blse', 'kpc'];

let currentSpectre = 'pase';
let currentIntensity = 0;

// ============================================================
// KEYFRAME INTERPOLATION
// ============================================================
function getZoneDiameter(atbId, spectre, intensity) {
  const keyframes = PHENOTYPES[spectre].zones[atbId];
  if (!keyframes) return 30;

  // Find surrounding keyframes
  if (intensity <= keyframes[0][0]) return keyframes[0][1];
  if (intensity >= keyframes[keyframes.length - 1][0]) return keyframes[keyframes.length - 1][1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    const [t0, v0] = keyframes[i];
    const [t1, v1] = keyframes[i + 1];
    if (intensity >= t0 && intensity <= t1) {
      if (t1 === t0) return v0;
      const t = (intensity - t0) / (t1 - t0);
      return v0 + (v1 - v0) * t;
    }
  }
  return keyframes[keyframes.length - 1][1];
}

function zoneToSvgRadius(diameter) {
  return Math.max(22, 22 + (diameter - 6) * 0.87);
}

function zoneToStatus(diameter, atbId) {
  const bp = BREAKPOINTS[atbId];
  if (!bp) return diameter >= 20 ? 'S' : diameter >= 14 ? 'I' : 'R';
  if (diameter >= bp.s) return 'S';
  if (diameter >= bp.r) return 'I';
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
    const status = zoneToStatus(diameter, atbId);
    const r = zoneToSvgRadius(diameter);

    el.setAttribute('r', r);
    el.setAttribute('stroke', statusColor(status));
    el.setAttribute('fill', statusFill(status));
  });

  const label = PHENOTYPES[currentSpectre].label;
  const intensityLabel = currentIntensity < 30 ? 'bas niveau' : currentIntensity < 70 ? 'niveau intermédiaire' : 'haut niveau';
  document.getElementById('guide-title').textContent = `${label} — ${intensityLabel}`;

  document.querySelectorAll('.spectre-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.spectre === currentSpectre);
  });

  document.getElementById('intensity-value').textContent = `${Math.round(currentIntensity)}%`;
}

// ============================================================
// INIT
// ============================================================
function initGuide() {
  renderGuideSquarePlate();
  renderGuideRoundPlate();

  document.querySelectorAll('.spectre-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSpectre = btn.dataset.spectre;
      updateGuideZones();
    });
  });

  const slider = document.getElementById('intensity-slider');
  slider.addEventListener('input', () => {
    currentIntensity = parseFloat(slider.value);
    updateGuideZones();
  });

  updateGuideZones();
}
