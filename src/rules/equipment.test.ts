import { describe, it, expect } from 'vitest';
import {
  calculateAC,
  canUseEquipment,
  resolveStartingEquipment,
  resolveEquipmentRefs,
  findEquipmentByName,
  getEquipmentByCategory,
} from './equipment';
import type { Armor, Weapon, Gear, EquipmentItem, EquipmentChoice } from '../types/equipment';

// -- Test fixtures using real SRD values from equipment.json --

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

const studdedLeather: Armor = {
  kind: 'armor',
  name: 'Studded Leather Armor',
  category: 'light',
  baseAC: 12,
  addDex: true,
  stealthDisadvantage: false,
  weight: 13,
  cost: '45 gp',
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

const plateArmor: Armor = {
  kind: 'armor',
  name: 'Plate Armor',
  category: 'heavy',
  baseAC: 18,
  addDex: false,
  strengthRequirement: 15,
  stealthDisadvantage: true,
  weight: 65,
  cost: '1500 gp',
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

const rapier: Weapon = {
  kind: 'weapon',
  name: 'Rapier',
  category: 'martial',
  damage: '1d8',
  damageType: 'piercing',
  properties: ['finesse'],
  weight: 2,
  cost: '25 gp',
};

const lightCrossbow: Weapon = {
  kind: 'weapon',
  name: 'Crossbow, Light',
  category: 'simple',
  damage: '1d8',
  damageType: 'piercing',
  properties: ['ammunition', 'loading', 'two-handed'],
  range: { normal: 80, long: 320 },
  weight: 5,
  cost: '25 gp',
};

const handCrossbow: Weapon = {
  kind: 'weapon',
  name: 'Crossbow, Hand',
  category: 'martial',
  damage: '1d6',
  damageType: 'piercing',
  properties: ['ammunition', 'light', 'loading'],
  range: { normal: 30, long: 120 },
  weight: 3,
  cost: '75 gp',
};

const backpack: Gear = {
  kind: 'gear',
  name: 'Backpack',
  weight: 5,
  cost: '2 gp',
};

const torch: Gear = {
  kind: 'gear',
  name: 'Torch',
  weight: 1,
  cost: '1 cp',
};

// -- Proficiency sets matching SRD class data --

const fighterProficiencies = [
  'light',
  'medium',
  'heavy',
  'shields',
  'simple',
  'martial',
];

const wizardProficiencies = [
  'daggers',
  'darts',
  'slings',
  'quarterstaffs',
  'light crossbows',
];

const rogueProficiencies = [
  'light',
  'simple',
  'hand crossbows',
  'longswords',
  'rapiers',
  'shortswords',
];

// -- Tests --

describe('calculateAC', () => {
  describe('unarmored', () => {
    it('returns 10 + dexModifier with no equipment', () => {
      expect(calculateAC([], 3)).toBe(13);
    });

    it('returns 10 with zero DEX modifier', () => {
      expect(calculateAC([], 0)).toBe(10);
    });

    it('handles negative DEX modifier', () => {
      expect(calculateAC([], -1)).toBe(9);
    });

    it('handles high DEX modifier', () => {
      expect(calculateAC([], 5)).toBe(15);
    });

    it('ignores non-armor equipment', () => {
      expect(calculateAC([dagger, backpack], 2)).toBe(12);
    });
  });

  describe('light armor', () => {
    it('leather armor (base 11) + DEX +3 = 14', () => {
      expect(calculateAC([leatherArmor], 3)).toBe(14);
    });

    it('studded leather (base 12) + DEX +2 = 14', () => {
      expect(calculateAC([studdedLeather], 2)).toBe(14);
    });

    it('light armor applies full negative DEX modifier', () => {
      expect(calculateAC([leatherArmor], -1)).toBe(10);
    });

    it('light armor applies zero DEX modifier', () => {
      expect(calculateAC([leatherArmor], 0)).toBe(11);
    });
  });

  describe('medium armor', () => {
    it('scale mail (base 14) + DEX +3 = 16 (capped at +2)', () => {
      expect(calculateAC([scaleMail], 3)).toBe(16);
    });

    it('scale mail (base 14) + DEX +2 = 16 (at cap)', () => {
      expect(calculateAC([scaleMail], 2)).toBe(16);
    });

    it('scale mail (base 14) + DEX +1 = 15 (below cap)', () => {
      expect(calculateAC([scaleMail], 1)).toBe(15);
    });

    it('medium armor applies full negative DEX modifier', () => {
      expect(calculateAC([scaleMail], -1)).toBe(13);
    });

    it('medium armor with DEX +5 still caps at +2', () => {
      expect(calculateAC([scaleMail], 5)).toBe(16);
    });
  });

  describe('heavy armor', () => {
    it('chain mail (base 16) ignores DEX +3', () => {
      expect(calculateAC([chainMail], 3)).toBe(16);
    });

    it('plate armor (base 18) ignores DEX +5', () => {
      expect(calculateAC([plateArmor], 5)).toBe(18);
    });

    it('chain mail ignores negative DEX', () => {
      expect(calculateAC([chainMail], -2)).toBe(16);
    });

    it('chain mail with zero DEX = base AC', () => {
      expect(calculateAC([chainMail], 0)).toBe(16);
    });
  });

  describe('shield', () => {
    it('shield alone adds +2 to unarmored AC', () => {
      expect(calculateAC([shield], 2)).toBe(14);
    });

    it('leather armor + shield + DEX +3 = 16', () => {
      expect(calculateAC([leatherArmor, shield], 3)).toBe(16);
    });

    it('chain mail + shield + DEX +3 = 18', () => {
      expect(calculateAC([chainMail, shield], 3)).toBe(18);
    });

    it('scale mail + shield + DEX +3 = 18 (DEX capped at +2)', () => {
      expect(calculateAC([scaleMail, shield], 3)).toBe(18);
    });

    it('shield with negative DEX', () => {
      expect(calculateAC([shield], -1)).toBe(11);
    });
  });

  describe('edge cases', () => {
    it('uses first non-shield armor when multiple body armors present', () => {
      expect(calculateAC([leatherArmor, chainMail], 3)).toBe(14);
    });

    it('handles equipment array with only gear items', () => {
      expect(calculateAC([backpack, torch], 2)).toBe(12);
    });

    it('handles mixed equipment correctly', () => {
      expect(calculateAC([dagger, leatherArmor, backpack, shield], 2)).toBe(
        15
      );
    });
  });

  describe('Monk unarmored defense', () => {
    it('computes 10 + DEX + WIS when no armor and no shield', () => {
      // DEX +3, WIS +2 → 10 + 3 + 2 = 15
      expect(calculateAC([], 3, 'Monk', 2)).toBe(15);
    });

    it('uses standard unarmored AC when WIS is 0', () => {
      // DEX +2, WIS +0 → 10 + 2 + 0 = 12 (same as standard)
      expect(calculateAC([], 2, 'Monk', 0)).toBe(12);
    });

    it('benefits from high WIS modifier', () => {
      // DEX +2, WIS +4 → 10 + 2 + 4 = 16
      expect(calculateAC([], 2, 'Monk', 4)).toBe(16);
    });

    it('uses standard armor AC when wearing armor', () => {
      // Leather (11 + DEX +3 = 14) vs Monk unarmored (10 + 3 + 2 = 15)
      // But Monk unarmored defense doesn't apply when wearing armor
      expect(calculateAC([leatherArmor], 3, 'Monk', 2)).toBe(14);
    });

    it('uses standard AC when using a shield', () => {
      // Shield: 10 + DEX +3 + 2 = 15 (standard with shield)
      // Monk unarmored defense doesn't apply with shield
      expect(calculateAC([shield], 3, 'Monk', 2)).toBe(15);
    });

    it('uses standard AC when wearing armor and shield', () => {
      // Leather + shield: 11 + 3 + 2 = 16
      expect(calculateAC([leatherArmor, shield], 3, 'Monk', 2)).toBe(16);
    });
  });

  describe('Barbarian unarmored defense', () => {
    it('computes 10 + DEX + CON when no armor', () => {
      // DEX +2, CON +3 → 10 + 2 + 3 = 15
      expect(calculateAC([], 2, 'Barbarian', undefined, 3)).toBe(15);
    });

    it('allows shield bonus with unarmored defense', () => {
      // DEX +2, CON +3 → 10 + 2 + 3 + 2(shield) = 17
      expect(calculateAC([shield], 2, 'Barbarian', undefined, 3)).toBe(17);
    });

    it('uses standard armor AC when wearing armor', () => {
      // Chain Mail (16) vs Barbarian unarmored (10 + 2 + 3 = 15)
      // Standard armor wins when wearing armor
      expect(calculateAC([chainMail], 2, 'Barbarian', undefined, 3)).toBe(16);
    });

    it('uses standard AC when armor is better', () => {
      // Plate (18) vs Barbarian unarmored (10 + 2 + 3 = 15)
      expect(calculateAC([plateArmor], 2, 'Barbarian', undefined, 3)).toBe(18);
    });

    it('uses standard unarmored AC when CON is 0', () => {
      // DEX +2, CON +0 → 10 + 2 + 0 = 12 (same as standard)
      expect(calculateAC([], 2, 'Barbarian', undefined, 0)).toBe(12);
    });

    it('benefits from high CON modifier', () => {
      // DEX +2, CON +5 → 10 + 2 + 5 = 17
      expect(calculateAC([], 2, 'Barbarian', undefined, 5)).toBe(17);
    });
  });

  describe('non-Monk/Barbarian classes', () => {
    it('Fighter uses standard AC only', () => {
      expect(calculateAC([], 3, 'Fighter', 2, 3)).toBe(13);
    });

    it('Wizard uses standard AC only', () => {
      expect(calculateAC([], 2, 'Wizard', 4, 1)).toBe(12);
    });

    it('undefined class uses standard AC', () => {
      expect(calculateAC([], 3, undefined, 2, 3)).toBe(13);
    });
  });
});

describe('canUseEquipment', () => {
  describe('armor proficiency', () => {
    it('fighter can use chain mail (has heavy proficiency)', () => {
      expect(canUseEquipment(chainMail, fighterProficiencies)).toBe(true);
    });

    it('fighter can use leather armor (has light proficiency)', () => {
      expect(canUseEquipment(leatherArmor, fighterProficiencies)).toBe(true);
    });

    it('fighter can use scale mail (has medium proficiency)', () => {
      expect(canUseEquipment(scaleMail, fighterProficiencies)).toBe(true);
    });

    it('fighter can use a shield (has shields proficiency)', () => {
      expect(canUseEquipment(shield, fighterProficiencies)).toBe(true);
    });

    it('wizard cannot use chain mail (no armor proficiencies)', () => {
      expect(canUseEquipment(chainMail, wizardProficiencies)).toBe(false);
    });

    it('wizard cannot use leather armor', () => {
      expect(canUseEquipment(leatherArmor, wizardProficiencies)).toBe(false);
    });

    it('wizard cannot use a shield', () => {
      expect(canUseEquipment(shield, wizardProficiencies)).toBe(false);
    });

    it('rogue can use leather armor (has light proficiency)', () => {
      expect(canUseEquipment(leatherArmor, rogueProficiencies)).toBe(true);
    });

    it('rogue cannot use chain mail (no heavy proficiency)', () => {
      expect(canUseEquipment(chainMail, rogueProficiencies)).toBe(false);
    });

    it('rogue cannot use a shield (no shields proficiency)', () => {
      expect(canUseEquipment(shield, rogueProficiencies)).toBe(false);
    });
  });

  describe('weapon proficiency', () => {
    it('fighter can use longsword (has martial proficiency)', () => {
      expect(canUseEquipment(longsword, fighterProficiencies)).toBe(true);
    });

    it('fighter can use dagger (has simple proficiency)', () => {
      expect(canUseEquipment(dagger, fighterProficiencies)).toBe(true);
    });

    it('wizard cannot use longsword (no martial or specific proficiency)', () => {
      expect(canUseEquipment(longsword, wizardProficiencies)).toBe(false);
    });

    it('wizard can use dagger via specific weapon proficiency', () => {
      // Wizard has 'daggers' proficiency which matches 'Dagger'
      expect(canUseEquipment(dagger, wizardProficiencies)).toBe(true);
    });

    it('rogue can use rapier via specific weapon proficiency', () => {
      // Rogue has 'rapiers' proficiency which matches 'Rapier'
      expect(canUseEquipment(rapier, rogueProficiencies)).toBe(true);
    });

    it('rogue can use dagger (has simple proficiency)', () => {
      expect(canUseEquipment(dagger, rogueProficiencies)).toBe(true);
    });

    it('character with specific weapon name proficiency can use it', () => {
      expect(canUseEquipment(longsword, ['longswords'])).toBe(true);
    });

    it('wizard can use light crossbow via specific proficiency', () => {
      // Wizard has 'light crossbows' which matches 'Crossbow, Light'
      expect(canUseEquipment(lightCrossbow, wizardProficiencies)).toBe(true);
    });

    it('rogue can use hand crossbow via specific proficiency', () => {
      // Rogue has 'hand crossbows' which matches 'Crossbow, Hand'
      expect(canUseEquipment(handCrossbow, rogueProficiencies)).toBe(true);
    });

    it('wizard cannot use hand crossbow (not in proficiency list)', () => {
      expect(canUseEquipment(handCrossbow, wizardProficiencies)).toBe(false);
    });

    it('empty proficiency list blocks weapon use', () => {
      expect(canUseEquipment(longsword, [])).toBe(false);
    });
  });

  describe('gear proficiency', () => {
    it('anyone can use a backpack (gear needs no proficiency)', () => {
      expect(canUseEquipment(backpack, [])).toBe(true);
    });

    it('anyone can use a torch', () => {
      expect(canUseEquipment(torch, wizardProficiencies)).toBe(true);
    });
  });
});

describe('findEquipmentByName', () => {
  it('finds Longsword in equipment data', () => {
    const item = findEquipmentByName('Longsword');
    expect(item).toBeDefined();
    expect(item?.name).toBe('Longsword');
    expect(item?.kind).toBe('weapon');
  });

  it('finds Chain Mail in equipment data', () => {
    const item = findEquipmentByName('Chain Mail');
    expect(item).toBeDefined();
    expect(item?.kind).toBe('armor');
  });

  it('finds Spellbook in equipment data', () => {
    const item = findEquipmentByName('Spellbook');
    expect(item).toBeDefined();
    expect(item?.kind).toBe('gear');
  });

  it('returns undefined for nonexistent item', () => {
    const item = findEquipmentByName('Nonexistent Item');
    expect(item).toBeUndefined();
  });
});

describe('resolveEquipmentRefs', () => {
  it('resolves a single weapon reference', () => {
    const result = resolveEquipmentRefs([{ name: 'Longsword' }]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Longsword');
    expect(result[0].kind).toBe('weapon');
  });

  it('resolves multiple references', () => {
    const result = resolveEquipmentRefs([
      { name: 'Chain Mail' },
      { name: 'Longsword' },
      { name: 'Shield' },
    ]);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Chain Mail');
    expect(result[1].name).toBe('Longsword');
    expect(result[2].name).toBe('Shield');
  });

  it('handles quantity > 1 for weapons by repeating items', () => {
    const result = resolveEquipmentRefs([{ name: 'Handaxe', quantity: 2 }]);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Handaxe');
    expect(result[1].name).toBe('Handaxe');
  });

  it('handles quantity > 1 for Dart (weapon) by repeating items', () => {
    const result = resolveEquipmentRefs([{ name: 'Dart', quantity: 10 }]);
    // Dart is a weapon, so each is a separate item
    expect(result).toHaveLength(10);
    expect(result[0].name).toBe('Dart');
    expect(result[0].kind).toBe('weapon');
  });

  it('creates generic gear for unknown items', () => {
    const result = resolveEquipmentRefs([{ name: 'Unknown Item' }]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Unknown Item');
    expect(result[0].kind).toBe('gear');
  });

  it('returns empty array for empty refs', () => {
    expect(resolveEquipmentRefs([])).toEqual([]);
  });
});

describe('resolveStartingEquipment', () => {
  const fighterArmorChoice: EquipmentChoice = {
    description: 'Choose armor',
    options: [
      { label: 'Chain Mail', items: [{ name: 'Chain Mail' }] },
      { label: 'Leather Armor and Longbow', items: [{ name: 'Leather Armor' }, { name: 'Longbow' }, { name: 'Arrows (20)' }] },
    ],
  };

  const fighterWeaponChoice: EquipmentChoice = {
    description: 'Choose weapons',
    options: [
      { label: 'Martial weapon and shield', items: [{ name: 'Longsword' }, { name: 'Shield' }] },
      { label: 'Two martial weapons', items: [{ name: 'Longsword' }, { name: 'Handaxe' }] },
    ],
  };

  it('returns an empty array for empty choices', () => {
    expect(resolveStartingEquipment([], [])).toEqual([]);
  });

  it('resolves first option of a single choice', () => {
    const result = resolveStartingEquipment([fighterArmorChoice], [0]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Chain Mail');
    expect(result[0].kind).toBe('armor');
  });

  it('resolves second option of a single choice', () => {
    const result = resolveStartingEquipment([fighterArmorChoice], [1]);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Leather Armor');
    expect(result[1].name).toBe('Longbow');
    expect(result[2].name).toBe('Arrows (20)');
  });

  it('resolves multiple choices with different selections', () => {
    const result = resolveStartingEquipment(
      [fighterArmorChoice, fighterWeaponChoice],
      [0, 1]
    );
    // Chain Mail + Longsword + Handaxe
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Chain Mail');
    expect(result[1].name).toBe('Longsword');
    expect(result[2].name).toBe('Handaxe');
  });

  it('resolves shield option correctly', () => {
    const result = resolveStartingEquipment(
      [fighterWeaponChoice],
      [0]
    );
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Longsword');
    expect(result[1].name).toBe('Shield');
    expect(result[1].kind).toBe('armor');
  });

  it('defaults to first option when selection index is missing', () => {
    const result = resolveStartingEquipment([fighterArmorChoice], []);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Chain Mail');
  });
});

describe('getEquipmentByCategory', () => {
  it('returns empty categories for empty array', () => {
    const result = getEquipmentByCategory([]);
    expect(result).toEqual({ weapon: [], armor: [], gear: [] });
  });

  it('categorizes weapons correctly', () => {
    const result = getEquipmentByCategory([longsword, dagger]);
    expect(result.weapon).toHaveLength(2);
    expect(result.armor).toHaveLength(0);
    expect(result.gear).toHaveLength(0);
  });

  it('categorizes armor correctly', () => {
    const result = getEquipmentByCategory([leatherArmor, shield]);
    expect(result.weapon).toHaveLength(0);
    expect(result.armor).toHaveLength(2);
    expect(result.gear).toHaveLength(0);
  });

  it('categorizes gear correctly', () => {
    const result = getEquipmentByCategory([backpack, torch]);
    expect(result.weapon).toHaveLength(0);
    expect(result.armor).toHaveLength(0);
    expect(result.gear).toHaveLength(2);
  });

  it('categorizes mixed equipment correctly', () => {
    const equipment: EquipmentItem[] = [
      longsword,
      leatherArmor,
      shield,
      dagger,
      backpack,
      torch,
    ];
    const result = getEquipmentByCategory(equipment);
    expect(result.weapon).toHaveLength(2);
    expect(result.armor).toHaveLength(2);
    expect(result.gear).toHaveLength(2);
  });

  it('preserves item references in categories', () => {
    const result = getEquipmentByCategory([longsword, leatherArmor, backpack]);
    expect(result.weapon[0]).toBe(longsword);
    expect(result.armor[0]).toBe(leatherArmor);
    expect(result.gear[0]).toBe(backpack);
  });
});
