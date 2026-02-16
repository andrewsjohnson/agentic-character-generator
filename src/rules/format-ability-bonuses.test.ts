import { describe, it, expect } from 'vitest';
import { formatAbilityBonuses } from './format-ability-bonuses';
import type { AbilityBonuses } from '../types/ability';

describe('formatAbilityBonuses', () => {
  it('returns empty string for undefined bonuses', () => {
    expect(formatAbilityBonuses(undefined)).toBe('');
  });

  it('returns empty string for empty bonuses object', () => {
    expect(formatAbilityBonuses({} as AbilityBonuses)).toBe('');
  });

  it('formats single ability bonus correctly', () => {
    const bonuses: AbilityBonuses = { CON: 2 };
    expect(formatAbilityBonuses(bonuses)).toBe('+2 CON');
  });

  it('formats multiple ability bonuses correctly', () => {
    const bonuses: AbilityBonuses = { CON: 2, WIS: 1 };
    expect(formatAbilityBonuses(bonuses)).toBe('+2 CON, +1 WIS');
  });

  it('formats all six ability bonuses in canonical order', () => {
    const bonuses: AbilityBonuses = {
      STR: 1,
      DEX: 1,
      CON: 1,
      INT: 1,
      WIS: 1,
      CHA: 1,
    };
    expect(formatAbilityBonuses(bonuses)).toBe(
      '+1 STR, +1 DEX, +1 CON, +1 INT, +1 WIS, +1 CHA'
    );
  });

  it('ignores zero bonuses', () => {
    const bonuses: AbilityBonuses = { CON: 2, WIS: 0 };
    expect(formatAbilityBonuses(bonuses)).toBe('+2 CON');
  });

  it('sorts abilities in canonical order (STR, DEX, CON, INT, WIS, CHA)', () => {
    const bonuses: AbilityBonuses = { CHA: 1, STR: 2, INT: 1 };
    expect(formatAbilityBonuses(bonuses)).toBe('+2 STR, +1 INT, +1 CHA');
  });
});
