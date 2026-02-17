import { useState, useEffect, useMemo } from 'react';
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

// Helper function to get default ability scores (all 8s)
function getDefaultAbilityScores(): AbilityScores {
  return {
    STR: 8,
    DEX: 8,
    CON: 8,
    INT: 8,
    WIS: 8,
    CHA: 8,
  };
}

export function AbilityScoreStep({ character, updateCharacter }: StepProps) {
  // Initialize mode from character or default to point-buy
  const [mode, setMode] = useState<Mode>(
    character.abilityScoreMethod === 'standard-array' ? 'standard-array' : 'point-buy'
  );

  // Maintain separate state for each method so selections persist across mode switches
  const [pointBuyScores, setPointBuyScores] = useState<AbilityScores>(() => {
    if (character.abilityScoreMethod === 'point-buy' && character.baseAbilityScores) {
      return character.baseAbilityScores;
    }
    return getDefaultAbilityScores();
  });

  const [standardArrayScores, setStandardArrayScores] = useState<AbilityScores>(() => {
    if (character.abilityScoreMethod === 'standard-array' && character.baseAbilityScores) {
      return character.baseAbilityScores;
    }
    return getDefaultAbilityScores();
  });

  // Derive active scores from the current mode
  const baseScores = mode === 'point-buy' ? pointBuyScores : standardArrayScores;

  // Sync with character state when navigating back to this step
  useEffect(() => {
    if (character.baseAbilityScores && character.abilityScoreMethod) {
      const newMode = character.abilityScoreMethod === 'standard-array' ? 'standard-array' : 'point-buy';
      setMode(newMode);
      if (character.abilityScoreMethod === 'point-buy') {
        setPointBuyScores(character.baseAbilityScores);
      } else {
        setStandardArrayScores(character.baseAbilityScores);
      }
    }
  }, [character.baseAbilityScores, character.abilityScoreMethod]);

  // Get species bonuses
  const speciesBonuses = character.species
    ? getSpeciesBonuses(character.species, character.subspecies)
    : {};

  // Calculate final scores and modifiers
  const finalScores = applyAbilityBonuses(baseScores, speciesBonuses);
  const modifiers = calculateAllModifiers(finalScores);

  // Handle mode switching — preserve scores for each method independently
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  // Point Buy handlers
  const handleIncrement = (ability: AbilityName) => {
    const currentScore = pointBuyScores[ability];
    if (currentScore >= 15) return; // Max score is 15

    const newScore = currentScore + 1;
    const currentTotal = getTotalPointsSpent(pointBuyScores);
    const newCost = getPointBuyCost(newScore) - getPointBuyCost(currentScore);

    if (currentTotal + newCost > 27) return; // Over budget

    setPointBuyScores({ ...pointBuyScores, [ability]: newScore });
  };

  const handleDecrement = (ability: AbilityName) => {
    const currentScore = pointBuyScores[ability];
    if (currentScore <= 8) return; // Min score is 8

    setPointBuyScores({ ...pointBuyScores, [ability]: currentScore - 1 });
  };

  const handleReset = () => {
    setPointBuyScores(getDefaultAbilityScores());
  };

  // Calculate Point Buy stats
  const totalPointsSpent = getTotalPointsSpent(baseScores);
  const pointsRemaining = 27 - totalPointsSpent;
  const isValidPointBuyAssignment = isValidPointBuy(baseScores);

  // Format modifier for display
  const formatModifier = (mod: number): string => {
    if (mod >= 0) return `+${mod}`;
    return `${mod}`;
  };

  // Standard Array handlers
  const handleStandardArrayChange = (ability: AbilityName, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    setStandardArrayScores({ ...standardArrayScores, [ability]: numValue });
  };

  // Memoize available values for standard array dropdowns to avoid recalculating on each render
  const availableValuesByAbility = useMemo(() => {
    const standardArray = Array.from(getStandardArray());
    return ABILITY_NAMES.reduce((acc, ability) => {
      const usedValues = ABILITY_NAMES.filter((a) => a !== ability).map((a) => baseScores[a]);
      acc[ability] = standardArray.filter(
        (value) => !usedValues.includes(value) || value === baseScores[ability]
      );
      return acc;
    }, {} as Record<AbilityName, number[]>);
  }, [baseScores]);

  // Calculate Standard Array stats
  const isValidStandardArrayAssignment = isValidStandardArray(baseScores);
  const assignedStandardValues = ABILITY_NAMES.map((ability) => baseScores[ability]);
  const remainingStandardValues = Array.from(getStandardArray()).filter(
    (value) => !assignedStandardValues.includes(value)
  );

  // Update character state when valid ability scores are assigned
  useEffect(() => {
    const isValid =
      mode === 'point-buy' ? isValidPointBuyAssignment : isValidStandardArrayAssignment;

    if (isValid) {
      updateCharacter({
        abilityScoreMethod: mode,
        baseAbilityScores: baseScores,
      });
    }
  }, [baseScores, mode, isValidPointBuyAssignment, isValidStandardArrayAssignment, updateCharacter]);

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
          {/* Point Buy Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Point Buy:</strong> You have 27 points to spend. Scores range from 8 to 15.
              Higher scores cost more points.
            </p>
            <div className="mt-2 flex items-center gap-4">
              <span className="text-lg font-bold text-blue-600">
                Points: {totalPointsSpent} / 27
              </span>
              <span className="text-sm text-gray-600">
                ({pointsRemaining} remaining)
              </span>
              <button
                onClick={handleReset}
                className="ml-auto px-4 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              >
                Reset All
              </button>
            </div>
          </div>

          {/* Ability Score Grid */}
          <div className="space-y-3">
            {ABILITY_NAMES.map((ability) => {
              const baseScore = baseScores[ability];
              const cost = getPointBuyCost(baseScore);
              const bonus = speciesBonuses[ability] ?? 0;
              const finalScore = finalScores[ability];
              const modifier = modifiers[ability];
              // Calculate if we can increment: check score limit and if we have enough budget for next increment
              const nextCost = baseScore < 15 ? getPointBuyCost(baseScore + 1) : 0;
              const incrementCost = nextCost - cost;
              const canIncrement = baseScore < 15 && totalPointsSpent + incrementCost <= 27;
              const canDecrement = baseScore > 8;

              return (
                <div
                  key={ability}
                  className="grid grid-cols-[120px_1fr_100px_100px_120px] gap-4 items-center bg-white p-4 rounded-lg border border-gray-200"
                >
                  {/* Ability Name */}
                  <div>
                    <div className="font-bold text-gray-900">{ability}</div>
                    <div className="text-xs text-gray-500">{ABILITY_LABELS[ability]}</div>
                  </div>

                  {/* Increment/Decrement Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecrement(ability)}
                      disabled={!canDecrement}
                      className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Decrease ${ability}`}
                    >
                      −
                    </button>
                    <div className="w-12 text-center">
                      <div className="text-2xl font-bold text-gray-900">{baseScore}</div>
                      <div className="text-xs text-gray-500">cost: {cost}</div>
                    </div>
                    <button
                      onClick={() => handleIncrement(ability)}
                      disabled={!canIncrement}
                      className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Increase ${ability}`}
                    >
                      +
                    </button>
                  </div>

                  {/* Species Bonus */}
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Bonus</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {bonus > 0 ? `+${bonus}` : bonus < 0 ? `${bonus}` : '—'}
                    </div>
                  </div>

                  {/* Final Score */}
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Final</div>
                    <div className="text-2xl font-bold text-gray-900">{finalScore}</div>
                  </div>

                  {/* Modifier */}
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Modifier</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatModifier(modifier)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Validation Message */}
          {!isValidPointBuyAssignment && totalPointsSpent > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
              {totalPointsSpent > 27
                ? 'You have exceeded your point budget of 27.'
                : 'Continue adjusting your ability scores.'}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Standard Array Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Standard Array:</strong> Assign these values to your abilities: 15, 14, 13, 12, 10, 8.
              Each value can only be used once.
            </p>
            {remainingStandardValues.length > 0 && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">Remaining values: </span>
                <span className="text-sm text-blue-600">
                  {remainingStandardValues.join(', ')}
                </span>
              </div>
            )}
            {isValidStandardArrayAssignment && (
              <div className="mt-2 text-sm font-medium text-green-600">
                ✓ All values assigned!
              </div>
            )}
          </div>

          {/* Ability Score Grid */}
          <div className="space-y-3">
            {ABILITY_NAMES.map((ability) => {
              const baseScore = baseScores[ability];
              const bonus = speciesBonuses[ability] ?? 0;
              const finalScore = finalScores[ability];
              const modifier = modifiers[ability];
              const availableValues = availableValuesByAbility[ability];

              return (
                <div
                  key={ability}
                  className="grid grid-cols-[120px_1fr_100px_100px_120px] gap-4 items-center bg-white p-4 rounded-lg border border-gray-200"
                >
                  {/* Ability Name */}
                  <div>
                    <div className="font-bold text-gray-900">{ability}</div>
                    <div className="text-xs text-gray-500">{ABILITY_LABELS[ability]}</div>
                  </div>

                  {/* Dropdown Selector */}
                  <div className="flex items-center">
                    <select
                      value={baseScore}
                      onChange={(e) => handleStandardArrayChange(ability, e.target.value)}
                      className="w-24 px-3 py-2 text-xl font-bold border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      aria-label={`Select score for ${ability}`}
                    >
                      {availableValues.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Species Bonus */}
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Bonus</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {bonus > 0 ? `+${bonus}` : bonus < 0 ? `${bonus}` : '—'}
                    </div>
                  </div>

                  {/* Final Score */}
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Final</div>
                    <div className="text-2xl font-bold text-gray-900">{finalScore}</div>
                  </div>

                  {/* Modifier */}
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Modifier</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatModifier(modifier)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Validation Message */}
          {!isValidStandardArrayAssignment && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
              Please assign all six standard array values (15, 14, 13, 12, 10, 8) to your abilities.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
