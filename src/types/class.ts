import type { AbilityName } from "./ability";

/**
 * Standard hit-die sizes used by 5e classes.
 */
export type HitDie = 6 | 8 | 10 | 12;

/**
 * Armor proficiency categories a class may grant.
 */
export type ArmorProficiency =
  | "Light"
  | "Medium"
  | "Heavy"
  | "Shields";

/**
 * Weapon proficiency categories a class may grant.
 */
export type WeaponProficiency =
  | "Simple"
  | "Martial"
  | string; // specific weapon names (e.g., "Hand Crossbow")

/**
 * The set of proficiencies granted by a class at 1st level.
 */
export type ClassProficiencies = {
  armor: ArmorProficiency[];
  weapons: WeaponProficiency[];
  savingThrows: [AbilityName, AbilityName];
  skills: {
    choices: string[];
    count: number;
  };
};

/**
 * A class feature gained at a particular level.
 */
export type ClassFeature = {
  name: string;
  description: string;
  level: number;
};

/**
 * A subclass (archetype, domain, school, etc.) chosen at the level
 * specified by the parent class.
 */
export type Subclass = {
  name: string;
  description: string;
  features: ClassFeature[];
};

/**
 * A character class as defined in the 5e SRD.
 */
export type CharacterClass = {
  name: string;
  hitDie: HitDie;
  proficiencies: ClassProficiencies;
  features: ClassFeature[];
  subclassLevel: number;
  subclasses: Subclass[];
};

/**
 * The class-related choices a player has made during character creation.
 */
export type ClassSelection = {
  class: CharacterClass;
  subclass?: Subclass;
  level: number;
  /**
   * @derived Compute as `hitDie value + Constitution modifier` at 1st level,
   * then rolled or averaged for subsequent levels. Do not store; derive from
   * class hit die, level, and Constitution modifier.
   */
  hitPoints?: number;
  selectedSkills: string[];
};
