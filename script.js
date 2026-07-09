/* ---------------------------------------------------------
   KaalisBank — logique du convertisseur
   Les taux sont statiques (pas d'appel a une API en direct).
   XOF/EUR est un vrai taux fixe (le franc CFA est arrime a
   l'euro) ; USD et GBP sont des taux indicatifs a mettre a
   jour toi-meme de temps en temps.
--------------------------------------------------------- */

// Combien vaut 1 unite de chaque devise, exprimee en XOF.
// C'est notre "devise pivot" : on passe toujours par XOF
// pour convertir d'une devise a l'autre.
const RATES_PER_XOF = {
  XOF: 1,
  EUR: 1 / 655.957,   // taux fixe reel
  USD: 1 / 610,       // indicatif
  GBP: 1 / 770        // indicatif
};

// Nombre de decimales a afficher selon la devise
const CURRENCY_DECIMALS = {
  XOF: 0,
  EUR: 2,
  USD: 2,
  GBP: 2
};

// La fonction de calcul pure : montant + devise de depart + devise cible -> resultat
function convert(amount, from, to) {
  if (isNaN(amount)) return 0;

  // Etape 1 : on convertit le montant vers XOF (la devise pivot)
  const amountInXOF = amount / RATES_PER_XOF[from];

  // Etape 2 : on convertit ce montant en XOF vers la devise cible
  const result = amountInXOF * RATES_PER_XOF[to];

  return result;
}

// Formatage propre du nombre (espaces pour les milliers, virgule decimale francaise)
function formatAmount(value, currency) {
  const decimals = CURRENCY_DECIMALS[currency];
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

// Branche les evenements sur un convertisseur donne (input, selects, bouton d'inversion)
function initConverter(root) {
  if (!root) return;

  const amountInput = root.querySelector('[data-role="amount-input"]');
  const fromSelect = root.querySelector('[data-role="from-select"]');
  const toSelect = root.querySelector('[data-role="to-select"]');
  const resultOutput = root.querySelector('[data-role="result-output"]');
  const swapBtn = root.querySelector('[data-role="swap-btn"]');

  function recalculate() {
    // On nettoie l'entree utilisateur : enleve les espaces, remplace la virgule par un point
    const amount = parseFloat(amountInput.value.replace(/\s/g, '').replace(',', '.'));
    const from = fromSelect.value;
    const to = toSelect.value;

    const result = convert(amount, from, to);
    resultOutput.value = formatAmount(result, to) + ' ' + to;
  }

  // Recalcule a chaque frappe ou changement de devise
  amountInput.addEventListener('input', recalculate);
  fromSelect.addEventListener('change', recalculate);
  toSelect.addEventListener('change', recalculate);

  // Le bouton d'inversion echange simplement les deux devises selectionnees
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const tmp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = tmp;
      recalculate();
    });
  }

  recalculate(); // calcul initial au chargement de la page
}

// Au chargement de la page, on active tous les convertisseurs presents
// (utile si tu en mets un deuxieme plus tard, par exemple dans un dashboard)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-widget="converter"]').forEach(initConverter);
});

// Redirige vers le dashboard quand le formulaire de connexion est soumis
// (pas de vraie authentification, juste une simulation)
function initLoginForm(form) {
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.href = 'dashboard.html';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-widget="converter"]').forEach(initConverter);
  initLoginForm(document.querySelector('[data-form="login"]'));
});