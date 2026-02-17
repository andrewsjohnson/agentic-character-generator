/**
 * The 18 official SRD skill names for D&D 5e.
 * Each skill maps to a governing ability score via SKILL_TO_ABILITY in rules/derived-stats.ts.
 */
export type SkillName =
  | 'Acrobatics'
  | 'Animal Handling'
  | 'Arcana'
  | 'Athletics'
  | 'Deception'
  | 'History'
  | 'Insight'
  | 'Intimidation'
  | 'Investigation'
  | 'Medicine'
  | 'Nature'
  | 'Perception'
  | 'Performance'
  | 'Persuasion'
  | 'Religion'
  | 'Sleight of Hand'
  | 'Stealth'
  | 'Survival';

/** All 18 skill names as a runtime array, matching the SkillName union. */
export const SKILL_NAMES: readonly SkillName[] = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight of Hand',
  'Stealth',
  'Survival',
] as const;

/** Runtime type guard that checks whether a string is a valid SkillName. */
export function isSkillName(value: string): value is SkillName {
  return (SKILL_NAMES as readonly string[]).includes(value);
}

/** A record mapping every skill name to its computed modifier value. */
export type SkillModifiers = Record<SkillName, number>;
