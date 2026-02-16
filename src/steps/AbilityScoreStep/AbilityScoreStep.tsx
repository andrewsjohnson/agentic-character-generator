import { useState, useEffect } from 'react';
import type { StepProps } from '../types';
import type { AbilityScores, AbilityName } from '../../types/ability';
import { ABILITY_NAMES } from '../../types/ability';
import {
  getPointBuyCost,
  getTotalPointsSpent,
  isValidPointBuy,
  getStandardArray,
  isValidStandardArray,
  applyAbilityBonuses,
  calculateAllModifiers,
} from '../../rules/ability-scores';
import { getSpeciesBonuses } from '../../rules/species';

type Mode = 'point-buy' | 'standard-array';

const ABILITY_LABELS: Record<AbilityName, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
};

// Default base scores (all 8s for point buy start)
const DEFAULT_POINT_BUY_SCORES: AbilityScores = {
  STR: 8,
  DEX: 8,
  CON: 8,
  INT: 8,
  WIS: 8,
  CHA: 8,
};

// Default empty scores for standard array (undefined values)
const DEFAULT_STANDARD_ARRAY_SCORES: AbilityScores = {
  STR: 8,
  DEX: 8,
  CON: 8,
  INT: 8,
  WIS: 8,
  CHA: 8,
};

export function AbilityScoreStep({ character, updateCharacter }: StepProps) {
  // Initialize mode from character or default to point-buy
  const [mode, setMode] = useState<Mode>(
    character.abilityScoreMethod === 'standard-array' ? 'standard-array' : 'point-buy'
  );

  // Initialize base scores from character or defaults
  const [baseScores, setBaseScores] = useState<AbilityScores>(() => {
    if (character.baseAbilityScores) {
      return character.baseAbilityScores;
    }
    return mode === 'point-buy' ? DEFAULT_POINT_BUY_SCORES : DEFAULT_STANDARD_ARRAY_SCORES;
  });

  // Sync with character state when navigating back to this step
  useEffect(() => {
    if (character.baseAbilityScores) {
      setBaseScores(character.baseAbilityScores);
    }
    if (character.abilityScoreMethod) {
      const newMode = character.abilityScoreMethod === 'standard-array' ? 'standard-array' : 'point-buy';
      setMode(newMode);
    }
  }, [character.baseAbilityScores, character.abilityScoreMethod]);

  // Get species bonuses
  const speciesBonuses = character.species
    ? getSpeciesBonuses(character.species, character.subspecies)
    : {};

  // Calculate final scores and modifiers
  const finalScores = applyAbilityBonuses(baseScores, speciesBonuses);
  const modifiers = calculateAllModifiers(finalScores);

  // Handle mode switching
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    // Reset scores to appropriate defaults when switching modes
    if (newMode === 'point-buy') {
      setBaseScores(DEFAULT_POINT_BUY_SCORES);
    } else {
      setBaseScores(DEFAULT_STANDARD_ARRAY_SCORES);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Assign Ability Scores</h2>
      <p className="text-gray-600 mb-6">
        Choose your method and assign ability scores to each ability.
        {!character.species && (
          <span className="block mt-2 text-amber-600">
            Tip: Select a species first to see your ability bonuses!
          </span>
        )}
      </p>

      {/* Mode selector tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleModeChange('point-buy')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'point-buy'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Point Buy
        </button>
        <button
          onClick={() => handleModeChange('standard-array')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'standard-array'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Standard Array
        </button>
      </div>

      {/* Mode-specific content */}
      {mode === 'point-buy' ? (
        <div>
          <p className="text-gray-700 mb-4">Point Buy mode - coming soon</p>
        </div>
      ) : (
        <div>
          <p className="text-gray-700 mb-4">Standard Array mode - coming soon</p>
        </div>
      )}
    </div>
  );
}
