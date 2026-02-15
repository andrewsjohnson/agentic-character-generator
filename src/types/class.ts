import type { AbilityName } from './ability';

/** Hit die sizes used by the various classes. */
export type HitDie = 6 | 8 | 10 | 12;

/** Armor proficiency categories. */
export type ArmorProficiency = 'light' | 'medium' | 'heavy' | 'shields';

/** Weapon proficiency — either a category or a specific weapon name. */
export type WeaponProficiency =
  | 'simple'
  | 'martial'
  | (string & {});

/** A class feature gained at level 1 (e.g. Rage, Spellcasting). */
export type ClassFeature = {
  name: string;
  description: string;
};

/** Spellcasting details for classes that can cast at level 1. */
export type SpellcastingInfo = {
  ability: AbilityName;
  cantripsKnown: number;
  /** Level-1 spell slots. Not all casters have slots at level 1 (e.g. Warlock uses pact slots). */
  spellSlots: number;
};

/** A subclass option (e.g. Champion Fighter, Life Domain Cleric). */
export type Subclass = {
  name: string;
  features: ClassFeature[];
  spellcasting?: SpellcastingInfo;
};

/** A playable class from the SRD. */
export type CharacterClass = {
  name: string;
  hitDie: HitDie;
  primaryAbility: AbilityName[];
  savingThrows: [AbilityName, AbilityName];
  armorProficiencies: ArmorProficiency[];
  weaponProficiencies: WeaponProficiency[];
  skillChoices: {
    options: string[];
    count: number;
  };
  features: ClassFeature[];
  spellcasting?: SpellcastingInfo;
  subclasses: Subclass[];
};
