import type { EquipmentItem, EquipmentChoice, Armor } from '../types/equipment';

/**
 * Calculates Armor Class based on equipped items and DEX modifier.
 *
 * Rules:
 * - No armor: AC = 10 + dexModifier
 * - Light armor: AC = baseAC + dexModifier
 * - Medium armor: AC = baseAC + min(dexModifier, 2)
 * - Heavy armor: AC = baseAC (DEX not applied)
 * - Shield: +2 AC, stacks with any armor or unarmored AC
 *
 * Does not handle alternative AC formulas (e.g., Monk/Barbarian Unarmored Defense).
 */
export function calculateAC(
  equipment: EquipmentItem[],
  dexModifier: number
): number {
  const armorItems = equipment.filter(
    (item): item is Armor => item.kind === 'armor'
  );

  const bodyArmor = armorItems.find((a) => a.category !== 'shield');
  const hasShield = armorItems.some((a) => a.category === 'shield');

  let ac: number;

  if (!bodyArmor) {
    ac = 10 + dexModifier;
  } else if (bodyArmor.addDex) {
    const dexBonus =
      bodyArmor.maxDexBonus !== undefined
        ? Math.min(dexModifier, bodyArmor.maxDexBonus)
        : dexModifier;
    ac = bodyArmor.baseAC + dexBonus;
  } else {
    ac = bodyArmor.baseAC;
  }

  if (hasShield) {
    ac += 2;
  }

  return ac;
}

/**
 * Determines whether a character is proficient with a piece of equipment.
 *
 * - Armor: proficiencies must include the armor's category ('light', 'medium', 'heavy')
 *   or 'shields' for shields.
 * - Weapons: proficiencies must include the weapon's category ('simple', 'martial')
 *   or the specific weapon name.
 * - Gear: always returns true (no proficiency required).
 */
export function canUseEquipment(
  item: EquipmentItem,
  proficiencies: string[]
): boolean {
  switch (item.kind) {
    case 'armor':
      if (item.category === 'shield') {
        return proficiencies.includes('shields');
      }
      return proficiencies.includes(item.category);
    case 'weapon':
      return (
        proficiencies.includes(item.category) ||
        proficiencies.includes(item.name)
      );
    case 'gear':
      return true;
  }
}

/**
 * Converts equipment choices and player selections into a flat equipment list.
 *
 * Currently a stub — the EquipmentChoice type uses string descriptions
 * rather than actual EquipmentItem arrays, so full resolution requires
 * either restructuring the choice data or building a parser.
 * Returns an empty array until that data structure is in place.
 */
export function resolveStartingEquipment(
  _choices: EquipmentChoice[], // eslint-disable-line @typescript-eslint/no-unused-vars
  _selections: number[] // eslint-disable-line @typescript-eslint/no-unused-vars
): EquipmentItem[] {
  return [];
}

/**
 * Groups equipment items by their kind ('weapon', 'armor', 'gear')
 * for display in the UI.
 */
export function getEquipmentByCategory(
  equipment: EquipmentItem[]
): Record<string, EquipmentItem[]> {
  const result: Record<string, EquipmentItem[]> = {
    weapon: [],
    armor: [],
    gear: [],
  };

  for (const item of equipment) {
    result[item.kind].push(item);
  }

  return result;
}
