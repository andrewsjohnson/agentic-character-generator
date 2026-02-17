import { describe, it, expect } from 'vitest';
import {
  calculateAC,
  canUseEquipment,
  resolveStartingEquipment,
  getEquipmentByCategory,
} from './equipment';
import type { Armor, Weapon, Gear, EquipmentItem } from '../types/equipment';

// Concrete SRD armor items used across tests
const leatherArmor: Armor = {
  kind: 'armor',
  name: 'Leather Armor',
  category: 'light',
  baseAC: 11,
  addDex: true,
  stealthDisadvantage: false,
  weight: 10,
  cost: '10 gp',
};

const scaleMail: Armor = {
  kind: 'armor',
  name: 'Scale Mail',
  category: 'medium',
  baseAC: 14,
  addDex: true,
  maxDexBonus: 2,
  stealthDisadvantage: true,
  weight: 45,
  cost: '50 gp',
};

const chainMail: Armor = {
  kind: 'armor',
  name: 'Chain Mail',
  category: 'heavy',
  baseAC: 16,
  addDex: false,
  strengthRequirement: 13,
  stealthDisadvantage: true,
  weight: 55,
  cost: '75 gp',
};

const shield: Armor = {
  kind: 'armor',
  name: 'Shield',
  category: 'shield',
  baseAC: 2,
  addDex: false,
  stealthDisadvantage: false,
  weight: 6,
  cost: '10 gp',
};

const longsword: Weapon = {
  kind: 'weapon',
  name: 'Longsword',
  category: 'martial',
  damage: '1d8',
  damageType: 'slashing',
  properties: ['versatile'],
  weight: 3,
  cost: '15 gp',
};

const dagger: Weapon = {
  kind: 'weapon',
  name: 'Dagger',
  category: 'simple',
  damage: '1d4',
  damageType: 'piercing',
  properties: ['finesse', 'light', 'thrown'],
  range: { normal: 20, long: 60 },
  weight: 1,
  cost: '2 gp',
};

const backpack: Gear = {
  kind: 'gear',
  name: 'Backpack',
  weight: 5,
  cost: '2 gp',
};

const rope: Gear = {
  kind: 'gear',
  name: 'Rope, Hempen (50 feet)',
  weight: 10,
  cost: '1 gp',
};

describe('calculateAC', () => {
  it('No armor, DEX +3: AC = 13', () => {
    expect(calculateAC([], 3)).toBe(13);
  });

  it('Leather armor (base 11), DEX +3: AC = 14', () => {
    expect(calculateAC([leatherArmor], 3)).toBe(14);
  });

  it('Chain mail (base 16), DEX +3: AC = 16 (DEX does not apply to heavy armor)', () => {
    expect(calculateAC([chainMail], 3)).toBe(16);
  });

  it('Scale mail (base 14), DEX +3: AC = 16 (medium armor caps DEX at +2)', () => {
    expect(calculateAC([scaleMail], 3)).toBe(16);
  });

  it('Shield adds +2 to unarmored AC', () => {
    expect(calculateAC([shield], 3)).toBe(15);
  });

  it('Shield adds +2 to leather armor AC', () => {
    expect(calculateAC([leatherArmor, shield], 3)).toBe(16);
  });

  it('Shield adds +2 to chain mail AC', () => {
    expect(calculateAC([chainMail, shield], 3)).toBe(18);
  });

  it('Shield adds +2 to scale mail AC', () => {
    expect(calculateAC([scaleMail, shield], 3)).toBe(18);
  });

  it('No armor, negative DEX modifier reduces AC below 10', () => {
    expect(calculateAC([], -1)).toBe(9);
  });

  it('Medium armor with DEX +1 adds full DEX (under cap)', () => {
    expect(calculateAC([scaleMail], 1)).toBe(15);
  });

  it('Non-armor equipment is ignored for AC calculation', () => {
    expect(calculateAC([longsword, backpack], 2)).toBe(12);
  });
});

describe('canUseEquipment', () => {
  it('Fighter is proficient with chain mail (heavy armor)', () => {
    const fighterProficiencies = ['light', 'medium', 'heavy', 'shields', 'simple', 'martial'];
    expect(canUseEquipment(chainMail, fighterProficiencies)).toBe(true);
  });

  it('Wizard is not proficient with chain mail', () => {
    const wizardProficiencies = ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'];
    expect(canUseEquipment(chainMail, wizardProficiencies)).toBe(false);
  });

  it('Fighter is proficient with shields', () => {
    const fighterProficiencies = ['light', 'medium', 'heavy', 'shields', 'simple', 'martial'];
    expect(canUseEquipment(shield, fighterProficiencies)).toBe(true);
  });

  it('Wizard is not proficient with shields', () => {
    const wizardProficiencies = ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'];
    expect(canUseEquipment(shield, wizardProficiencies)).toBe(false);
  });

  it('Fighter is proficient with longsword (martial weapon)', () => {
    const fighterProficiencies = ['light', 'medium', 'heavy', 'shields', 'simple', 'martial'];
    expect(canUseEquipment(longsword, fighterProficiencies)).toBe(true);
  });

  it('Wizard is proficient with daggers (specific weapon name, plural match)', () => {
    const wizardProficiencies = ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'];
    expect(canUseEquipment(dagger, wizardProficiencies)).toBe(true);
  });

  it('Character with simple weapon proficiency can use a dagger', () => {
    expect(canUseEquipment(dagger, ['simple'])).toBe(true);
  });

  it('Gear items always return true (no proficiency needed)', () => {
    expect(canUseEquipment(backpack, [])).toBe(true);
  });

  it('Proficiency matching is case-insensitive', () => {
    expect(canUseEquipment(chainMail, ['Heavy'])).toBe(true);
  });

  it('Rogue is proficient with light armor', () => {
    const rogueProficiencies = ['light', 'simple', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'];
    expect(canUseEquipment(leatherArmor, rogueProficiencies)).toBe(true);
  });
});

describe('resolveStartingEquipment', () => {
  it('returns empty array when choices are empty', () => {
    expect(resolveStartingEquipment([], [])).toEqual([]);
  });

  it('returns empty array when selections are empty', () => {
    const choices = [
      { description: 'Choose one', options: ['(a) chain mail', '(b) leather armor'] },
    ];
    expect(resolveStartingEquipment(choices, [])).toEqual([]);
  });

  it('returns empty array (placeholder until structured item data is available)', () => {
    const choices = [
      { description: 'Choose one', options: ['(a) chain mail', '(b) leather armor'] },
    ];
    expect(resolveStartingEquipment(choices, [0])).toEqual([]);
  });
});

describe('getEquipmentByCategory', () => {
  it('groups equipment by kind', () => {
    const equipment: EquipmentItem[] = [longsword, dagger, chainMail, shield, backpack, rope];
    const grouped = getEquipmentByCategory(equipment);

    expect(grouped['weapon']).toHaveLength(2);
    expect(grouped['armor']).toHaveLength(2);
    expect(grouped['gear']).toHaveLength(2);
  });

  it('returns empty object for empty equipment list', () => {
    expect(getEquipmentByCategory([])).toEqual({});
  });

  it('weapons are grouped together', () => {
    const equipment: EquipmentItem[] = [longsword, dagger];
    const grouped = getEquipmentByCategory(equipment);

    expect(grouped['weapon']).toContain(longsword);
    expect(grouped['weapon']).toContain(dagger);
  });

  it('armor and shields are grouped under armor', () => {
    const equipment: EquipmentItem[] = [chainMail, shield];
    const grouped = getEquipmentByCategory(equipment);

    expect(grouped['armor']).toHaveLength(2);
    expect(grouped['armor']).toContain(chainMail);
    expect(grouped['armor']).toContain(shield);
  });

  it('does not create keys for missing categories', () => {
    const equipment: EquipmentItem[] = [longsword];
    const grouped = getEquipmentByCategory(equipment);

    expect(Object.keys(grouped)).toEqual(['weapon']);
    expect(grouped['armor']).toBeUndefined();
    expect(grouped['gear']).toBeUndefined();
  });
});
