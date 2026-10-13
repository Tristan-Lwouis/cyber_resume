// Texte de présentation affiché dans l'info-bulle (desktop) et la carte "Profil" (mobile)
export const PROFILE_PITCH: string = "Bonjour ! Moi c'est Tristan, je suis en quête d'un poste de Développeur Full-Stack. J'ai déjà un solide bagage en informatique et en graphisme, avec plusieurs projets (perso & pro) déjà en ligne. Je ne cherche pas juste à coder, mais à concevoir des outils fonctionnels, modernes et innovants. Je serais ravi d'échanger avec vous.";

// Anti-scraping : le téléphone et l'e-mail ne figurent jamais en clair dans le code livré
// (les robots cherchent des motifs d'e-mail / de téléphone dans le HTML et le JS téléchargés).
// Ils sont stockés inversés puis encodés en base64, et reconstitués seulement à l'affichage.
// Pour encoder une nouvelle valeur : btoa([...valeur].reverse().join(''))
const ENCODED_PHONE = 'MTguMDYuMjEuMTguNjA=';
const ENCODED_EMAIL = 'bW9jLmxpYW1nQG5hdHNpcnRyZWluZ2Vy';

function decode(encoded: string): string {
  return [...atob(encoded)].reverse().join('');
}

// Coordonnées affichées dans la carte USER-INFO (desktop) et le panneau USER-INFO (mobile)
export const PROFILE_CONTACT = {
  get phone(): string {
    return decode(ENCODED_PHONE);
  },
  get email(): string {
    return decode(ENCODED_EMAIL);
  },
  links: 'https://linktr.ee/tristan.regnier',
};

// Date de naissance : sert à calculer le "lvl" (âge), mis à jour automatiquement
const BIRTH_DATE = new Date(1999, 9, 1); // 01/10/1999

export function computeLevel(today: Date = new Date()): number {
  let age = today.getFullYear() - BIRTH_DATE.getFullYear();
  const birthdayNotReached =
    today.getMonth() < BIRTH_DATE.getMonth() ||
    (today.getMonth() === BIRTH_DATE.getMonth() && today.getDate() < BIRTH_DATE.getDate());
  if (birthdayNotReached) {
    age--;
  }
  return age;
}
