import { toContentHtml } from './timeline.model';

describe('toContentHtml', () => {
  it('génère un bloc par entrée avec période · titre · structure', () => {
    const html = toContentHtml([
      { period: '2026', title: 'Fondateur', organization: 'Nocte Syndikate', description: 'Agence <strong>web</strong>' },
      { period: '2018', title: 'Bac', description: 'STI2D' },
    ]);

    expect(html.match(/class="content-block"/g)?.length).toBe(2);
    expect(html).toContain('<h2>2026 · Fondateur · Nocte Syndikate</h2>');
    expect(html).toContain('<p>Agence <strong>web</strong></p>');
  });

  it('omet la structure quand elle est absente', () => {
    expect(toContentHtml([{ period: '2018', title: 'Bac', description: '' }])).toContain('<h2>2018 · Bac</h2>');
  });
});
