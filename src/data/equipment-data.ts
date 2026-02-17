import type { EquipmentItem } from '../types/equipment';
import jsonData from './equipment.json';

/**
 * Equipment data from the SRD, typed as EquipmentItem[].
 *
 * TypeScript's resolveJsonModule infers `kind: string` from JSON rather
 * than the `"weapon" | "armor" | "gear"` literals needed by the
 * EquipmentItem discriminated union. This wrapper validates each entry's
 * kind discriminant at the import boundary so consumers get a properly
 * typed array.
 *
 * Correctness of the JSON shape is validated by tests in equipment.test.ts.
 */

// Widen to unknown[] to decouple from resolveJsonModule's inferred types,
// then validate the discriminant with a type guard.
const raw: unknown[] = jsonData;

function isEquipmentItem(value: unknown): value is EquipmentItem {
  if (typeof value !== 'object' || value === null || !('kind' in value)) {
    return false;
  }
  const { kind } = value;
  return kind === 'weapon' || kind === 'armor' || kind === 'gear';
}

const equipmentData: EquipmentItem[] = raw.filter(isEquipmentItem);
export default equipmentData;
