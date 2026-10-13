// Texte de présentation affiché dans l'info-bulle (desktop) et la carte "Profil" (mobile)
export const PROFILE_PITCH: string = "Bonjour ! Moi c'est Tristan, je suis en quête d'un poste de Développeur Full-Stack. J'ai déjà un solide bagage en informatique et en graphisme, avec plusieurs projets (perso & pro) déjà en ligne. Je ne cherche pas juste à coder, mais à concevoir des outils fonctionnels, modernes et innovants. Je serais ravi d'échanger avec vous.";

// Coordonnées affichées dans la carte USER-INFO (desktop) et le panneau USER-INFO (mobile)
export const PROFILE_CONTACT = {
  phone: '06.81.12.60.81',
  email: 'regniertristan@gmail.com',
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
