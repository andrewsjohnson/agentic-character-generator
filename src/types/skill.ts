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

/** A record mapping every skill name to its computed modifier value. */
export type SkillModifiers = Record<SkillName, number>;
