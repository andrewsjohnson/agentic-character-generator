/** Armor categories per 5e SRD. */
export type ArmorCategory = 'light' | 'medium' | 'heavy' | 'shield';

/** A piece of armor or a shield. */
export type Armor = {
  kind: 'armor';
  name: string;
  category: ArmorCategory;
  baseAC: number;
  /** Whether DEX modifier is added to AC, and any cap on that bonus. */
  addDex: boolean;
  maxDexBonus?: number;
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
  weight: number;
  cost: string;
};

/** Weapon damage die expression (e.g. "1d8", "2d6"). */
export type DamageDie = string;

/** Weapon property tags from the SRD. */
export type WeaponProperty =
  | 'ammunition'
  | 'finesse'
  | 'heavy'
  | 'light'
  | 'loading'
  | 'range'
  | 'reach'
  | 'special'
  | 'thrown'
  | 'two-handed'
  | 'versatile';

/** Damage types in the SRD. */
export type DamageType =
  | 'bludgeoning'
  | 'piercing'
  | 'slashing';

/** A weapon (melee or ranged). */
export type Weapon = {
  kind: 'weapon';
  name: string;
  category: 'simple' | 'martial';
  damage: DamageDie;
  damageType: DamageType;
  properties: WeaponProperty[];
  range?: { normal: number; long: number };
  weight: number;
  cost: string;
};

/** A piece of adventuring gear (rope, torch, pack, etc.). */
export type Gear = {
  kind: 'gear';
  name: string;
  description?: string;
  weight: number;
  cost: string;
};

/**
 * A discriminated union of all equipment types.
 * Use the `kind` field to narrow to the specific variant.
 */
export type EquipmentItem = Weapon | Armor | Gear;
