import { describe, it, expect } from 'vitest';
import {
  calculateModifier,
  calculateAllModifiers,
  getPointBuyCost,
  getTotalPointsSpent,
  isValidPointBuy,
  applyAbilityBonuses,
  getStandardArray,
  isValidStandardArray,
} from './ability-scores';
import type { AbilityScores } from '../types/ability';

describe('calculateModifier', () => {
  it('calculates correct modifiers for standard scores', () => {
    expect(calculateModifier(8)).toBe(-1);
    expect(calculateModifier(10)).toBe(0);
    expect(calculateModifier(12)).toBe(1);
    expect(calculateModifier(14)).toBe(2);
    expect(calculateModifier(15)).toBe(2);
    expect(calculateModifier(18)).toBe(4);
    expect(calculateModifier(20)).toBe(5);
  });

  it('calculates correct modifiers for edge case scores', () => {
    expect(calculateModifier(1)).toBe(-5);
    expect(calculateModifier(3)).toBe(-4);
    expect(calculateModifier(30)).toBe(10);
  });

  it('handles odd scores correctly', () => {
    expect(calculateModifier(9)).toBe(-1);
    expect(calculateModifier(11)).toBe(0);
    expect(calculateModifier(13)).toBe(1);
    expect(calculateModifier(17)).toBe(3);
    expect(calculateModifier(19)).toBe(4);
  });
});

describe('calculateAllModifiers', () => {
  it('calculates modifiers for all six abilities', () => {
    const scores: AbilityScores = {
      STR: 15,
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    };

    const modifiers = calculateAllModifiers(scores);

    expect(modifiers).toEqual({
      STR: 2,
      DEX: 2,
      CON: 1,
      INT: 1,
      WIS: 0,
      CHA: -1,
    });
  });

  it('handles all 10s (zero modifiers)', () => {
    const scores: AbilityScores = {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
    };

    const modifiers = calculateAllModifiers(scores);

    expect(modifiers).toEqual({
      STR: 0,
      DEX: 0,
      CON: 0,
      INT: 0,
      WIS: 0,
      CHA: 0,
    });
  });
});

describe('getPointBuyCost', () => {
  it('returns correct costs for valid scores', () => {
    expect(getPointBuyCost(8)).toBe(0);
    expect(getPointBuyCost(9)).toBe(1);
    expect(getPointBuyCost(10)).toBe(2);
    expect(getPointBuyCost(11)).toBe(3);
    expect(getPointBuyCost(12)).toBe(4);
    expect(getPointBuyCost(13)).toBe(5);
    expect(getPointBuyCost(14)).toBe(7);
    expect(getPointBuyCost(15)).toBe(9);
  });

  it('returns -1 for scores below valid range', () => {
    expect(getPointBuyCost(7)).toBe(-1);
    expect(getPointBuyCost(0)).toBe(-1);
    expect(getPointBuyCost(-5)).toBe(-1);
  });

  it('returns -1 for scores above valid range', () => {
    expect(getPointBuyCost(16)).toBe(-1);
    expect(getPointBuyCost(20)).toBe(-1);
    expect(getPointBuyCost(100)).toBe(-1);
  });
});

describe('getTotalPointsSpent', () => {
  it('returns 0 for all 8s', () => {
    const scores: AbilityScores = {
      STR: 8,
      DEX: 8,
      CON: 8,
      INT: 8,
      WIS: 8,
      CHA: 8,
    };

    expect(getTotalPointsSpent(scores)).toBe(0);
  });

  it('returns correct total for mixed scores', () => {
    const scores: AbilityScores = {
      STR: 15, // 9
      DEX: 14, // 7
      CON: 13, // 5
      INT: 12, // 4
      WIS: 10, // 2
      CHA: 8,  // 0
    };

    expect(getTotalPointsSpent(scores)).toBe(27);
  });

  it('returns 54 for all 15s', () => {
    const scores: AbilityScores = {
      STR: 15,
      DEX: 15,
      CON: 15,
      INT: 15,
      WIS: 15,
      CHA: 15,
    };

    expect(getTotalPointsSpent(scores)).toBe(54);
  });

  it('includes -1 cost for invalid scores in total', () => {
    const scores: AbilityScores = {
      STR: 16, // -1 (invalid)
      DEX: 14, // 7
      CON: 13, // 5
      INT: 12, // 4
      WIS: 10, // 2
      CHA: 8,  // 0
    };

    // Total: -1 + 7 + 5 + 4 + 2 + 0 = 17
    expect(getTotalPointsSpent(scores)).toBe(17);
  });
});

describe('isValidPointBuy', () => {
  it('returns true for valid point buy within budget', () => {
    const scores: AbilityScores = {
      STR: 15,
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    };

    expect(isValidPointBuy(scores)).toBe(true);
  });

  it('returns true for all 8s (0 points)', () => {
    const scores: AbilityScores = {
      STR: 8,
      DEX: 8,
      CON: 8,
      INT: 8,
      WIS: 8,
      CHA: 8,
    };

    expect(isValidPointBuy(scores)).toBe(true);
  });

  it('returns false for scores over budget', () => {
    const scores: AbilityScores = {
      STR: 15,
      DEX: 15,
      CON: 15,
      INT: 15,
      WIS: 15,
      CHA: 15,
    };

    expect(isValidPointBuy(scores)).toBe(false);
  });

  it('returns false for score below valid range', () => {
    const scores: AbilityScores = {
      STR: 7, // Invalid
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    };

    expect(isValidPointBuy(scores)).toBe(false);
  });

  it('returns false for score above valid range', () => {
    const scores: AbilityScores = {
      STR: 16, // Invalid
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    };

    expect(isValidPointBuy(scores)).toBe(false);
  });

  it('respects custom budget parameter', () => {
    const scores: AbilityScores = {
      STR: 13,
      DEX: 13,
      CON: 13,
      INT: 13,
      WIS: 13,
      CHA: 13,
    };

    // 6 * 5 = 30 points
    expect(isValidPointBuy(scores, 27)).toBe(false);
    expect(isValidPointBuy(scores, 30)).toBe(true);
  });
});

describe('applyAbilityBonuses', () => {
  it('applies bonuses correctly to base scores', () => {
    const baseScores: AbilityScores = {
      STR: 15,
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    };

    const bonuses = { STR: 2, CON: 1 };

    const result = applyAbilityBonuses(baseScores, bonuses);

    expect(result).toEqual({
      STR: 17,
      DEX: 14,
      CON: 14,
      INT: 12,
      WIS: 10,
      CHA: 8,
    });
  });

  it('caps scores at 20', () => {
    const baseScores: AbilityScores = {
      STR: 19,
      DEX: 18,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    };

    const bonuses = { STR: 2, DEX: 3 };

    const result = applyAbilityBonuses(baseScores, bonuses);

    expect(result).toEqual({
      STR: 20, // Capped from 21
      DEX: 20, // Capped from 21
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    });
  });

  it('handles empty bonuses object', () => {
    const baseScores: AbilityScores = {
      STR: 15,
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    };

    const bonuses = {};

    const result = applyAbilityBonuses(baseScores, bonuses);

    expect(result).toEqual(baseScores);
  });

  it('handles partial bonuses', () => {
    const baseScores: AbilityScores = {
      STR: 15,
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    };

    const bonuses = { CHA: 2 };

    const result = applyAbilityBonuses(baseScores, bonuses);

    expect(result).toEqual({
      STR: 15,
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 10,
    });
  });

  it('applies multiple bonuses correctly', () => {
    const baseScores: AbilityScores = {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
    };

    const bonuses = { STR: 2, CON: 2, WIS: 1 };

    const result = applyAbilityBonuses(baseScores, bonuses);

    expect(result).toEqual({
      STR: 12,
      DEX: 10,
      CON: 12,
      INT: 10,
      WIS: 11,
      CHA: 10,
    });
  });

  it('prevents scores from going below 1 with negative bonuses', () => {
    const baseScores: AbilityScores = {
      STR: 3,
      DEX: 8,
      CON: 5,
      INT: 10,
      WIS: 10,
      CHA: 10,
    };

    const bonuses = { STR: -5, CON: -10 };

    const result = applyAbilityBonuses(baseScores, bonuses);

    expect(result).toEqual({
      STR: 1, // Capped from -2
      DEX: 8,
      CON: 1, // Capped from -5
      INT: 10,
      WIS: 10,
      CHA: 10,
    });
  });
});

describe('getStandardArray', () => {
  it('returns the correct standard array', () => {
    const standardArray = getStandardArray();

    expect(standardArray).toEqual([15, 14, 13, 12, 10, 8]);
  });

  it('returns a readonly array', () => {
    const standardArray = getStandardArray();

    expect(standardArray).toEqual([15, 14, 13, 12, 10, 8]);
    // Verify it's the same type on each call
    expect(getStandardArray()).toEqual(standardArray);
  });
});

describe('isValidStandardArray', () => {
  it('returns true for standard array in order', () => {
    const scores: AbilityScores = {
      STR: 15,
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    };

    expect(isValidStandardArray(scores)).toBe(true);
  });

  it('returns true for standard array in different order', () => {
    const scores: AbilityScores = {
      STR: 8,
      DEX: 10,
      CON: 12,
      INT: 13,
      WIS: 14,
      CHA: 15,
    };

    expect(isValidStandardArray(scores)).toBe(true);
  });

  it('returns true for standard array in mixed order', () => {
    const scores: AbilityScores = {
      STR: 12,
      DEX: 8,
      CON: 15,
      INT: 10,
      WIS: 13,
      CHA: 14,
    };

    expect(isValidStandardArray(scores)).toBe(true);
  });

  it('returns false for duplicate value', () => {
    const scores: AbilityScores = {
      STR: 15,
      DEX: 15, // Duplicate
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    };

    expect(isValidStandardArray(scores)).toBe(false);
  });

  it('returns false for wrong value', () => {
    const scores: AbilityScores = {
      STR: 16, // Should be 15
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8,
    };

    expect(isValidStandardArray(scores)).toBe(false);
  });

  it('returns false for all same values', () => {
    const scores: AbilityScores = {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
    };

    expect(isValidStandardArray(scores)).toBe(false);
  });

  it('returns false for values too low', () => {
    const scores: AbilityScores = {
      STR: 15,
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 7, // Should be 8
    };

    expect(isValidStandardArray(scores)).toBe(false);
  });
});
