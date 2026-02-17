import type { EquipmentItem, EquipmentChoice, Armor, EquipmentRef } from '../types/equipment';
import equipmentData from '../data/equipment-data';

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
 * Converts an equipment item name to its lowercase plural proficiency form.
 *
 * Handles the "Crossbow, Light" → "light crossbows" format used in class data,
 * as well as standard names like "Dagger" → "daggers".
 */
function toWeaponProficiencyKey(name: string): string {
  const lower = name.toLowerCase();
  const commaIndex = lower.indexOf(', ');
  if (commaIndex !== -1) {
    const base = lower.slice(0, commaIndex);
    const qualifier = lower.slice(commaIndex + 2);
    return `${qualifier} ${base}s`;
  }
  return `${lower}s`;
}

/**
 * Determines whether a character is proficient with a piece of equipment.
 *
 * - Armor: proficiencies must include the armor's category ('light', 'medium', 'heavy')
 *   or 'shields' for shields.
 * - Weapons: proficiencies must include the weapon's category ('simple', 'martial')
 *   or a specific proficiency that matches the weapon name. Specific proficiencies
 *   use lowercase plural form (e.g., 'daggers' matches 'Dagger',
 *   'light crossbows' matches 'Crossbow, Light').
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
        proficiencies.includes(toWeaponProficiencyKey(item.name))
      );
    case 'gear':
      return true;
  }
}

/**
 * Looks up an equipment item by name from the equipment data.
 * Returns undefined if the item is not found.
 */
export function findEquipmentByName(name: string): EquipmentItem | undefined {
  return equipmentData.find(
    (item) => item.name === name
  );
}

/**
 * Resolves an array of equipment references into actual EquipmentItem objects.
 * Items not found in equipment.json are created as generic gear items.
 * Handles quantity by repeating weapon/armor items or setting gear quantity.
 */
export function resolveEquipmentRefs(refs: EquipmentRef[]): EquipmentItem[] {
  const result: EquipmentItem[] = [];

  for (const ref of refs) {
    const item = findEquipmentByName(ref.name);
    const quantity = ref.quantity ?? 1;

    if (item) {
      if (item.kind === 'gear' && quantity > 1) {
        result.push({ ...item, quantity });
      } else if (quantity > 1) {
        for (let i = 0; i < quantity; i++) {
          result.push({ ...item });
        }
      } else {
        result.push(item);
      }
    } else {
      // Create a generic gear entry for items not in equipment.json
      result.push({
        kind: 'gear',
        name: ref.name,
        quantity: quantity > 1 ? quantity : undefined,
        weight: 0,
        cost: '0 gp',
      });
    }
  }

  return result;
}

/**
 * Converts equipment choices and player selections into a flat equipment list.
 * Each selection index corresponds to the chosen option for each choice.
 */
export function resolveStartingEquipment(
  choices: EquipmentChoice[],
  selections: number[]
): EquipmentItem[] {
  const result: EquipmentItem[] = [];

  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i];
    const selectionIndex = selections[i] ?? 0;
    const option = choice.options[selectionIndex];

    if (option) {
      result.push(...resolveEquipmentRefs(option.items));
    }
  }

  return result;
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
