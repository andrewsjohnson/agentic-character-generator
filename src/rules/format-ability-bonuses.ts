import type { AbilityBonuses } from '../types/ability';
import { ABILITY_NAMES } from '../types/ability';

/**
 * Formats ability bonuses as a human-readable string.
 * Returns empty string if no bonuses or bonuses object is empty.
 * Example: { CON: 2, WIS: 1 } => "+2 CON, +1 WIS"
 */
export function formatAbilityBonuses(bonuses: AbilityBonuses | undefined): string {
  if (!bonuses) return '';

  const entries = ABILITY_NAMES
    .filter(ability => bonuses[ability] !== undefined && bonuses[ability] !== 0)
    .map(ability => `+${bonuses[ability]} ${ability}`);

  return entries.join(', ');
}
