// ============================================================
// ANTIBIOTICS DATA
// ============================================================
const ANTIBIOTICS = {
  // --- Square plate ---
  TPZ: { name: 'Pipéracilline + Tazobactam', charge: '36 µg', family: 'peni_inhib', classe: 'Uréidopénicilline + Inhibiteur', blactam: true,
         note: 'Association la plus large des pénicillines. Le tazobactam inhibe de nombreuses β-lactamases.' },
  CAZ: { name: 'Ceftazidime', charge: '10 µg', family: 'c3g', classe: 'Céphalosporine de 3ème génération', blactam: true,
         note: 'C3G anti-Pseudomonas. Sert au test de synergie BLSE (bouchon de champagne avec AMC).' },
  TIC: { name: 'Ticarcilline', charge: '75 µg', family: 'peni', classe: 'Carboxypénicilline', blactam: true,
         note: 'Marqueur de pénicillinase et TRI. Spectre anti-Gram négatif.' },
  AX:  { name: 'Amoxicilline', charge: '20 µg', family: 'peni', classe: 'Aminopénicilline', blactam: true,
         note: 'Pénicilline A de référence. Premier antibiotique à regarder.' },
  CFR: { name: 'Céfadroxil', charge: '30 µg', family: 'c1g', classe: 'Céphalosporine de 1ère génération', blactam: true,
         note: 'C1G orale. Marqueur de résistance de base aux céphalosporines.' },
  AMC: { name: 'Amoxicilline + Ac. clavulanique', charge: '30 µg', family: 'peni_inhib', classe: 'Aminopénicilline + Inhibiteur', blactam: true,
         note: 'Disque clé : restauration si pénicillinase, synergie si BLSE (bouchon de champagne).' },
  FEP: { name: 'Céfépime', charge: '30 µg', family: 'c4g', classe: 'Céphalosporine de 4ème génération', blactam: true,
         note: 'Stable face aux céphalosporinases AmpC. FEP S + C3G R = Case. FEP R + C3G R = BLSE.' },
  CN:  { name: 'Gentamicine', charge: '10 µg', family: 'aminoside', classe: 'Aminoside', blactam: false,
         note: 'Aminoside de référence, synergique avec les β-lactamines.' },
  OFX: { name: 'Ofloxacine', charge: '5 µg', family: 'fq', classe: 'Fluoroquinolone', blactam: false,
         note: 'Marqueur de résistance aux fluoroquinolones.' },
  CTX: { name: 'Céfotaxime', charge: '5 µg', family: 'c3g', classe: 'Céphalosporine de 3ème génération', blactam: true,
         note: 'C3G de référence. Sert au test de synergie BLSE avec AMC.' },
  ETP: { name: 'Ertapénème', charge: '10 µg', family: 'carba', classe: 'Carbapénème', blactam: true,
         note: 'Screening de carbapénémase. Le plus sensible des carbapénèmes pour la détection.' },
  TOB: { name: 'Tobramycine', charge: '10 µg', family: 'aminoside', classe: 'Aminoside', blactam: false,
         note: 'Aminoside, bon spectre anti-Pseudomonas.' },
  CTV: { name: 'Ceftazidime + Avibactam', charge: '14 µg', family: 'c3g_avi', classe: 'C3G + Avibactam', blactam: true,
         note: 'Actif sur KPC et OXA-48. Inactif sur métallo-β-lactamases (NDM, VIM). CTV R → suspecter MBL.' },
  SXT: { name: 'Triméthoprime + Sulfaméthoxazole', charge: '25 µg', family: 'autre', classe: 'Sulfamide (Bactrim)', blactam: false,
         note: 'Association synergique, large spectre. Utile dans les infections urinaires.' },
  MEM: { name: 'Méropénème', charge: '10 µg', family: 'carba', classe: 'Carbapénème', blactam: true,
         note: 'Carbapénème de référence. Spectre le plus large des β-lactamines.' },
  AK:  { name: 'Amikacine', charge: '30 µg', family: 'aminoside', classe: 'Aminoside', blactam: false,
         note: 'Aminoside le plus résistant aux enzymes d\'inactivation. Dernier recours aminoside.' },

  // --- Round plate ---
  FF:  { name: 'Fosfomycine', charge: '200 µg', family: 'autre', classe: 'Fosfomycine', blactam: false,
         note: 'Mécanisme unique (inhibe MurA). Alternative urinaire, peu de résistance croisée.' },
  TEM: { name: 'Témocilline', charge: '30 µg', family: 'peni', classe: 'Pénicilline (6-α-méthoxy)', blactam: true,
         note: 'Marqueur OXA-48 : TEM R → suspecter carbapénémase de classe D. Stable face aux BLSE et AmpC.' },
  CFM: { name: 'Céfixime', charge: '5 µg', family: 'c3g', classe: 'C3G orale', blactam: true,
         note: 'C3G orale. Marqueur de sensibilité C3G pour les infections urinaires.' },
  F:   { name: 'Nitrofurantoïne', charge: '100 µg', family: 'autre', classe: 'Nitrofurane', blactam: false,
         note: 'Uniquement infections urinaires basses. Contre-indiquée si insuffisance rénale.' },
  MEC: { name: 'Mécillinam (Pivmécillinam)', charge: '10 µg', family: 'peni', classe: 'Amidinopénicilline', blactam: true,
         note: 'Cible spécifique (PLP2). Uniquement urinaire. Souvent actif même sur BLSE.' },
  FOX: { name: 'Céfoxitine', charge: '30 µg', family: 'c2g', classe: 'Céphamycine (C2G-like)', blactam: true,
         note: 'Clé diagnostique : FOX R → Case (céphalosporinase). FOX S + C3G R → BLSE.' },
};

// ============================================================
// PLATE LAYOUTS
// ============================================================
const SQUARE_GRID = [
  ['TPZ', 'CAZ', 'TIC', 'AX'],
  ['CFR', 'AMC', 'FEP', 'CN'],
  ['OFX', 'CTX', 'ETP', 'TOB'],
  ['CTV', 'SXT', 'MEM', 'AK'],
];

const ROUND_DISCS = [
  { id: 'FF',  x: 120, y: 100 },
  { id: 'TEM', x: 260, y: 100 },
  { id: 'CFM', x: 95,  y: 200 },
  { id: 'F',   x: 285, y: 200 },
  { id: 'MEC', x: 130, y: 295 },
  { id: 'FOX', x: 250, y: 295 },
];

// ============================================================
// FAMILY META
// ============================================================
const FAMILY_COLORS = {
  peni: '#f87171', peni_inhib: '#fb923c', c1g: '#60a5fa', c2g: '#818cf8',
  c3g: '#a78bfa', c3g_avi: '#c084fc', c4g: '#e879f9', carba: '#f472b6',
  aminoside: '#4ade80', fq: '#2dd4bf', autre: '#94a3b8'
};

const FAMILY_LABELS = {
  peni: 'Pénicillines', peni_inhib: 'Péni + Inhib', c1g: 'C1G', c2g: 'C2G',
  c3g: 'C3G', c3g_avi: 'C3G + Avibactam', c4g: 'C4G', carba: 'Carbapénèmes',
  aminoside: 'Aminosides', fq: 'Fluoroquinolone', autre: 'Autres'
};
