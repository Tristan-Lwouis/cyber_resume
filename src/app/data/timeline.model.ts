// Une entrée de parcours (expérience ou formation)
export interface TimelineEntry {
  period: string;
  title: string;
  organization?: string;
  description: string; // HTML simple : <strong> pour les mots-clés surlignés
}

/**
 * Génère le HTML des blocs de contenu (fenêtre du bureau virtuel, version mobile).
 */
export function toContentHtml(entries: TimelineEntry[]): string {
  return entries
    .map(entry => {
      const heading = [entry.period, entry.title, entry.organization].filter(Boolean).join(' · ');
      return `<div class="content-block"><h2>${heading}</h2><p>${entry.description}</p></div>`;
    })
    .join('');
}
