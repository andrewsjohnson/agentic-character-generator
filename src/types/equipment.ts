/**
 * Armor categories as defined in the 5e SRD.
 */
export type ArmorCategory = "Light" | "Medium" | "Heavy" | "Shield";

/**
 * Weapon damage types in the 5e SRD.
 */
export type DamageType =
  | "Bludgeoning"
  | "Piercing"
  | "Slashing";

/**
 * Standard weapon properties (e.g., Finesse, Light, Two-Handed).
 */
export type WeaponProperty =
  | "Ammunition"
  | "Finesse"
  | "Heavy"
  | "Light"
  | "Loading"
  | "Range"
  | "Reach"
  | "Special"
  | "Thrown"
  | "Two-Handed"
  | "Versatile";

/**
 * A weapon — melee or ranged.
 */
export type Weapon = {
  kind: "weapon";
  name: string;
  category: "Simple" | "Martial";
  damage: string;
  damageType: DamageType;
  weight: number;
  properties: WeaponProperty[];
  range?: { normal: number; long: number };
};

/**
 * A piece of armor or a shield.
 */
export type Armor = {
  kind: "armor";
  name: string;
  category: ArmorCategory;
  baseAC: number;
  /**
   * Whether the wearer may add their Dexterity modifier to AC,
   * and if so, whether it is capped (e.g., medium armor caps at +2).
   */
  dexBonus: boolean;
  maxDexBonus?: number;
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
  weight: number;
};

/**
 * General adventuring gear (rations, rope, torches, etc.).
 */
export type Gear = {
  kind: "gear";
  name: string;
  description?: string;
  weight: number;
  quantity: number;
};

/**
 * Discriminated union of all equipment a character can carry.
 * Use the `kind` field to narrow the type.
 */
export type EquipmentItem = Weapon | Armor | Gear;

/**
 * A character's full inventory.
 */
export type Inventory = {
  weapons: Weapon[];
  armor: Armor[];
  gear: Gear[];
  /**
   * Currency held, in the five standard denominations.
   */
  currency: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
};
