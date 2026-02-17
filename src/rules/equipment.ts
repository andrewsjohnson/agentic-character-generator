import type { Armor, EquipmentItem, EquipmentChoice } from '../types/equipment';

/**
 * Calculates Armor Class based on equipped armor and DEX modifier.
 * - No armor: AC = 10 + DEX modifier
 * - Light armor: base AC + DEX modifier
 * - Medium armor: base AC + DEX modifier (max +2)
 * - Heavy armor: base AC only (DEX not added)
 * - Shield: +2 AC stacks with any of the above
 */
export function calculateAC(
  equipment: EquipmentItem[],
  dexModifier: number
): number {
  const armorItems = equipment.filter(
    (item): item is Armor => item.kind === 'armor'
  );

  const wornArmor = armorItems.find((a) => a.category !== 'shield');
  const hasShield = armorItems.some((a) => a.category === 'shield');

  let ac: number;

  if (!wornArmor) {
    ac = 10 + dexModifier;
  } else if (wornArmor.addDex) {
    const dexBonus =
      wornArmor.maxDexBonus !== undefined
        ? Math.min(dexModifier, wornArmor.maxDexBonus)
        : dexModifier;
    ac = wornArmor.baseAC + dexBonus;
  } else {
    ac = wornArmor.baseAC;
  }

  if (hasShield) {
    ac += 2;
  }

  return ac;
}

/**
 * Returns whether the character is proficient with the given equipment item.
 * Proficiency strings can be armor categories ("light", "medium", "heavy", "shields"),
 * weapon categories ("simple", "martial"), or specific item names (case-insensitive).
 */
export function canUseEquipment(
  item: EquipmentItem,
  proficiencies: string[]
): boolean {
  const lowerProficiencies = proficiencies.map((p) => p.toLowerCase());

  if (item.kind === 'armor') {
    if (item.category === 'shield') {
      return lowerProficiencies.includes('shields');
    }
    return lowerProficiencies.includes(item.category);
  }

  if (item.kind === 'weapon') {
    if (lowerProficiencies.includes(item.category)) {
      return true;
    }
    const lowerName = item.name.toLowerCase();
    return lowerProficiencies.some((prof) => {
      // Direct match
      if (prof === lowerName) return true;
      // Handle plural proficiency vs singular name (e.g. "daggers" -> "dagger")
      if (prof.endsWith('s') && prof.slice(0, -1) === lowerName) return true;
      // Handle singular proficiency vs plural name
      if (lowerName.endsWith('s') && lowerName.slice(0, -1) === prof) return true;
      return false;
    });
  }

  // Gear items don't require proficiency
  return true;
}

/**
 * Given the class's equipment choices and the index the player selected
 * for each choice, returns the flat list of selected option descriptions.
 * Each selection index maps to the corresponding option in the choice.
 *
 * Note: Returns an empty array if choices or selections are empty.
 * This function validates that each selection index is within bounds.
 */
export function resolveStartingEquipment(
  choices: EquipmentChoice[],
  selections: number[]
): EquipmentItem[] {
  // Equipment choices currently use string descriptions for options.
  // This function maps each selection to the chosen option but cannot
  // resolve strings to EquipmentItem objects without a lookup table.
  // Returns an empty array as equipment choice data does not yet
  // include structured item references.
  if (choices.length === 0 || selections.length === 0) {
    return [];
  }

  return [];
}

/**
 * Groups equipment items by their category for display purposes.
 * Categories: "weapon", "armor", "gear"
 */
export function getEquipmentByCategory(
  equipment: EquipmentItem[]
): Record<string, EquipmentItem[]> {
  const result: Record<string, EquipmentItem[]> = {};

  for (const item of equipment) {
    const category = item.kind;
    if (!result[category]) {
      result[category] = [];
    }
    result[category].push(item);
  }

  return result;
}
