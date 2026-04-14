// ============================================================
// GUIDE — β-LACTAMASES
// ============================================================

const CLASSES = {
  A: { name: 'Classe A', badge: 'A', color: '#f59e0b',
       key: 'Inhibée par <strong>acide clavulanique</strong> (AMC) et/ou <strong>avibactam</strong> (CTV)',
       detect: '<span class="spectre-atb s">AMC</span> restaure l\'activité ou synergie visible' },
  B: { name: 'Classe B', badge: 'B', color: '#8b5cf6',
       key: 'Métallo-β-lactamase — <strong>non inhibée</strong> par avibactam',
       detect: '<span class="spectre-atb r">CTV</span> R (avibactam inactif sur MBL)' },
  C: { name: 'Classe C', badge: 'C', color: '#3b82f6',
       key: 'Céphalosporinase (AmpC) — touche <strong>FOX</strong>',
       detect: '<span class="spectre-atb r">FOX</span> R + <span class="spectre-atb r">AMC</span> R (non inhibée par ac. clav.)' },
  D: { name: 'Classe D', badge: 'D', color: '#ef4444',
       key: 'OXA — touche la <strong>témocilline</strong>',
       detect: '<span class="spectre-atb r">TEM</span> R + <span class="spectre-atb s">CTV</span> S' },
};

const SPECTRES = {
  A: [
    { name: 'Pénicillinase', aka: 'Spectre étroit',
      pattern: '<span class="spectre-atb r">AX</span> R, <span class="spectre-atb s">AMC</span> S (restauration), <span class="spectre-atb s">CTX</span> S, <span class="spectre-atb s">CAZ</span> S',
      desc: 'Ne touche que les pénicillines. Les C3G restent actives.' },
    { name: 'BLSE', aka: 'Spectre étendu',
      pattern: '<span class="spectre-atb r">CTX</span> R, <span class="spectre-atb r">CAZ</span> R, <span class="spectre-atb r">FEP</span> R, <span class="spectre-atb s">FOX</span> S, synergie AMC',
      desc: 'Touche les C3G et C4G. FOX reste S (≠ case). Bouchon de champagne avec AMC.' },
    { name: 'KPC', aka: 'Carbapénémase classe A',
      pattern: '<span class="spectre-atb r">ETP</span> R, <span class="spectre-atb r">MEM</span> R, <span class="spectre-atb s">CTV</span> S (avibactam actif)',
      desc: 'Touche tout y compris les carbapénèmes. CTV S car avibactam inhibe KPC.' },
  ],
  B: [
    { name: 'NDM / VIM / IMP', aka: 'Métallo-β-lactamase',
      pattern: '<span class="spectre-atb r">ETP</span> R, <span class="spectre-atb r">MEM</span> R, <span class="spectre-atb r">CTV</span> R (avibactam inactif)',
      desc: 'Hydrolyse tout. CTV R car l\'avibactam n\'inhibe pas les MBL. BHRe.' },
  ],
  C: [
    { name: 'AmpC bas niveau', aka: 'Céphalosporinase sauvage',
      pattern: '<span class="spectre-atb r">CFR</span> R, <span class="spectre-atb r">FOX</span> R, <span class="spectre-atb s">CTX</span> S, <span class="spectre-atb s">FEP</span> S',
      desc: 'Touche C1G et C2G. Les C3G et C4G restent actives.' },
    { name: 'AmpC déréprimée', aka: 'Hyperproduction',
      pattern: '<span class="spectre-atb r">CTX</span> R, <span class="spectre-atb r">CAZ</span> R, <span class="spectre-atb s">FEP</span> S, <span class="spectre-atb r">FOX</span> R',
      desc: 'Touche aussi les C3G. FEP S distingue de la BLSE. FOX R confirme case (≠ BLSE).' },
  ],
  D: [
    { name: 'OXA-48', aka: 'Carbapénémase classe D',
      pattern: '<span class="spectre-atb r">ETP</span> R, <span class="spectre-atb r">TEM</span> R, <span class="spectre-atb s">CTV</span> S, C3G souvent S (sauf si BLSE associée)',
      desc: 'Piège : C3G parfois S ! TEM R est le marqueur clé. Souvent associée à une BLSE.' },
  ],
};

let guideStep = 0;
let selectedClass = null;

function initGuide() {
  renderGuideStep(0);

  document.querySelectorAll('.guide-step').forEach(el => {
    el.addEventListener('click', () => {
      const step = parseInt(el.dataset.step);
      if (step <= guideStep) {
        guideStep = step;
        if (step < 2) selectedClass = null;
        renderGuideStep(step);
      }
    });
  });
}

function renderGuideStep(step) {
  guideStep = step;
  const container = document.getElementById('guide-content');

  // Update step indicators
  document.querySelectorAll('.guide-step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.toggle('active', s === step);
    el.classList.toggle('done', s < step);
  });

  if (step === 0) renderStep0(container);
  else if (step === 1) renderStep1(container);
  else if (step === 2) renderStep2(container);
}

function renderStep0(container) {
  container.innerHTML = `
    <div class="guide-question">
      <h2>Y a-t-il une β-lactamase ?</h2>
      <p>Regardez le disque <span class="guide-disc-highlight"><span class="guide-disc-dot" style="background:var(--peni)"></span> AX</span> (Amoxicilline)</p>
      <div class="guide-choices">
        <div class="guide-choice green" onclick="renderGuideStep(0)">
          <h3>AX sensible</h3>
          <p>Pas de β-lactamase<br><strong>→ Phénotype sauvage</strong></p>
        </div>
        <div class="guide-choice red" onclick="renderGuideStep(1)">
          <h3>AX résistant</h3>
          <p>β-lactamase présente<br><strong>→ Quelle classe ?</strong></p>
        </div>
      </div>
    </div>
  `;
}

function renderStep1(container) {
  container.innerHTML = `
    <div class="guide-question" style="max-width:850px">
      <h2>Quelle classe de β-lactamase ?</h2>
      <p>4 classes (Ambler) — chacune a un marqueur clé sur notre panel</p>
      <div class="guide-classes">
        ${Object.entries(CLASSES).map(([id, c]) => `
          <div class="guide-class-card" style="border-color: color-mix(in srgb, ${c.color} 40%, transparent)"
               onclick="selectedClass='${id}'; renderGuideStep(2)"
               onmouseenter="this.style.borderColor='${c.color}'; this.style.boxShadow='0 0 20px color-mix(in srgb, ${c.color} 15%, transparent)'"
               onmouseleave="this.style.borderColor='color-mix(in srgb, ${c.color} 40%, transparent)'; this.style.boxShadow='none'">
            <div class="guide-class-header">
              <span class="guide-class-badge" style="background: color-mix(in srgb, ${c.color} 20%, transparent); color: ${c.color}">${c.badge}</span>
              <span class="guide-class-name">${c.name}</span>
            </div>
            <div class="guide-class-key">${c.key}</div>
            <div class="guide-class-key" style="margin-top:0.4rem">${c.detect}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderStep2(container) {
  const cls = CLASSES[selectedClass];
  const spectres = SPECTRES[selectedClass];

  container.innerHTML = `
    <div class="guide-spectre">
      <button class="guide-back" onclick="renderGuideStep(1)">← Changer de classe</button>
      <div class="guide-spectre-title">
        <h2>
          <span class="class-tag" style="background: color-mix(in srgb, ${cls.color} 20%, transparent); color: ${cls.color}">${cls.badge}</span>
          ${cls.name} — Quel spectre ?
        </h2>
      </div>
      <div class="guide-spectre-cards">
        ${spectres.map(s => `
          <div class="guide-spectre-card" style="border-left: 3px solid ${cls.color}">
            <div class="spectre-name">${s.name}<br><span style="font-size:0.75rem;color:var(--text-muted);font-weight:400">${s.aka}</span></div>
            <div class="spectre-pattern">
              <div>${s.pattern}</div>
              <div style="margin-top:0.4rem">${s.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
