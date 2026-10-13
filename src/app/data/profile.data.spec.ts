import { PROFILE_CONTACT, computeLevel } from './profile.data';

describe('profile.data', () => {
  describe('computeLevel (âge à partir du 01/10/1999)', () => {
    it('vaut 26 la veille de l\'anniversaire 2026', () => {
      expect(computeLevel(new Date(2026, 8, 30))).toBe(26);
    });

    it('passe à 27 le jour de l\'anniversaire', () => {
      expect(computeLevel(new Date(2026, 9, 1))).toBe(27);
    });

    it('reste à 27 jusqu\'à l\'anniversaire suivant', () => {
      expect(computeLevel(new Date(2027, 8, 30))).toBe(27);
    });
  });

  describe('PROFILE_CONTACT (anti-scraping)', () => {
    it('reconstitue un e-mail et un numéro valides', () => {
      expect(PROFILE_CONTACT.email).toMatch(/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/);
      expect(PROFILE_CONTACT.phone).toMatch(/^0\d(\.\d{2}){4}$/);
    });
  });
});
