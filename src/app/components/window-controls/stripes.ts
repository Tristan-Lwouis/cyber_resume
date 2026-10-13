// Identifiants uniques pour le <pattern> rayé des barres de déplacement :
// plusieurs fenêtres peuvent être ouvertes en même temps (expérience + formations).
let stripesCounter = 0;

export function nextStripesId(): string {
  return `cyber-stripes-${stripesCounter++}`;
}
