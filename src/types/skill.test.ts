import { describe, it, expect } from 'vitest';
import { SKILL_NAMES, isSkillName } from './skill';

describe('SKILL_NAMES', () => {
  it('contains all 18 standard D&D skills', () => {
    expect(SKILL_NAMES).toHaveLength(18);
  });

  it('includes known skill names', () => {
    expect(SKILL_NAMES).toContain('Acrobatics');
    expect(SKILL_NAMES).toContain('Animal Handling');
    expect(SKILL_NAMES).toContain('Stealth');
    expect(SKILL_NAMES).toContain('Sleight of Hand');
    expect(SKILL_NAMES).toContain('Survival');
  });
});

describe('isSkillName', () => {
  it('returns true for valid skill names', () => {
    expect(isSkillName('Acrobatics')).toBe(true);
    expect(isSkillName('Animal Handling')).toBe(true);
    expect(isSkillName('Stealth')).toBe(true);
    expect(isSkillName('Sleight of Hand')).toBe(true);
  });

  it('returns false for invalid strings', () => {
    expect(isSkillName('InvalidSkill')).toBe(false);
    expect(isSkillName('')).toBe(false);
    expect(isSkillName('acrobatics')).toBe(false);
    expect(isSkillName('STEALTH')).toBe(false);
  });

  it('returns true for every entry in SKILL_NAMES', () => {
    for (const skill of SKILL_NAMES) {
      expect(isSkillName(skill)).toBe(true);
    }
  });
});
