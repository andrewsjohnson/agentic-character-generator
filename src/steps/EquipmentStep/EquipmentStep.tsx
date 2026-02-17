import { useState, useEffect, useMemo } from 'react';
import type { StepProps } from '../types';
import type { EquipmentItem, EquipmentChoice } from '../../types/equipment';
import { getStartingEquipmentOptions, getFixedEquipment, getClassProficiencies } from '../../rules/classes';
import { getBackgroundEquipment } from '../../rules/backgrounds';
import { calculateAC, canUseEquipment, resolveStartingEquipment, resolveEquipmentRefs, getEquipmentByCategory } from '../../rules/equipment';
import { calculateModifier } from '../../rules/ability-scores';

type EquipmentChoiceCardProps = {
  choice: EquipmentChoice;
  choiceIndex: number;
  selectedOption: number | undefined;
  onSelect: (choiceIndex: number, optionIndex: number) => void;
};

function EquipmentChoiceCard({ choice, choiceIndex, selectedOption, onSelect }: EquipmentChoiceCardProps) {
  return (
    <div className="mb-6" data-testid={`equipment-choice-${choiceIndex}`}>
      <h4 className="text-sm font-semibold mb-2 text-gray-700">{choice.description}</h4>
      <div className="space-y-2">
        {choice.options.map((option, optionIndex) => (
          <button
            key={optionIndex}
            onClick={() => onSelect(choiceIndex, optionIndex)}
            data-testid={`choice-${choiceIndex}-option-${optionIndex}`}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              selectedOption === optionIndex
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-400'
            }`}
          >
            <span className="text-sm font-medium">{option.label}</span>
            {option.items.length > 1 && (
              <span className="text-xs text-gray-500 ml-2">
                ({option.items.map((item) =>
                  item.quantity && item.quantity > 1
                    ? `${item.name} x${item.quantity}`
                    : item.name
                ).join(', ')})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

type EquipmentSummaryProps = {
  equipment: EquipmentItem[];
  proficiencies: string[];
  dexModifier: number | undefined;
};

function EquipmentSummary({ equipment, proficiencies, dexModifier }: EquipmentSummaryProps) {
  const categorized = getEquipmentByCategory(equipment);
  const ac = dexModifier !== undefined ? calculateAC(equipment, dexModifier) : undefined;

  const categoryLabels: Record<string, string> = {
    weapon: 'Weapons',
    armor: 'Armor & Shields',
    gear: 'Gear',
  };

  return (
    <div data-testid="equipment-summary">
      {/* AC Display */}
      {ac !== undefined && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg" data-testid="ac-display">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-800">{ac}</span>
            <span className="text-sm font-medium text-blue-700">Armor Class</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Based on equipped armor (DEX modifier: {dexModifier !== undefined && dexModifier >= 0 ? '+' : ''}{dexModifier})
          </p>
        </div>
      )}

      {/* Equipment by Category */}
      {Object.entries(categorized).map(([category, items]) => {
        if (items.length === 0) return null;
        return (
          <div key={category} className="mb-4" data-testid={`category-${category}`}>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">{categoryLabels[category]}</h4>
            <ul className="space-y-1">
              {items.map((item, index) => {
                const isProficient = canUseEquipment(item, proficiencies);
                return (
                  <li
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                    data-testid={`equipment-item-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.kind === 'gear' && item.quantity && item.quantity > 1 && (
                        <span className="text-xs text-gray-500">x{item.quantity}</span>
                      )}
                      {item.kind === 'weapon' && (
                        <span className="text-xs text-gray-400">{item.damage} {item.damageType}</span>
                      )}
                      {item.kind === 'armor' && item.category !== 'shield' && (
                        <span className="text-xs text-gray-400">AC {item.baseAC}</span>
                      )}
                    </span>
                    {!isProficient && (
                      <span
                        className="text-xs text-amber-600 font-medium"
                        data-testid={`not-proficient-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        Not proficient
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {equipment.length === 0 && (
        <p className="text-sm text-gray-500 italic">No equipment selected yet.</p>
      )}
    </div>
  );
}

export function EquipmentStep({ character, updateCharacter }: StepProps) {
  const hasClass = !!character.class;
  const hasBackground = !!character.background;

  // Equipment choices from class
  const equipmentChoices = useMemo(
    () => (character.class ? getStartingEquipmentOptions(character.class) : []),
    [character.class]
  );

  // Fixed equipment from class
  const fixedClassEquipment = useMemo(
    () => (character.class ? getFixedEquipment(character.class) : []),
    [character.class]
  );

  // Background equipment strings
  const backgroundEquipmentStrings = useMemo(
    () => (character.background ? getBackgroundEquipment(character.background) : []),
    [character.background]
  );

  // Proficiencies from class
  const proficiencies = useMemo(() => {
    if (!character.class) return [];
    const profs = getClassProficiencies(character.class);
    return [...profs.armor, ...profs.weapons];
  }, [character.class]);

  // DEX modifier for AC calculation
  const dexModifier = useMemo(() => {
    if (!character.baseAbilityScores) return undefined;
    return calculateModifier(character.baseAbilityScores.DEX);
  }, [character.baseAbilityScores]);

  // Track selections for each choice
  const [selections, setSelections] = useState<Record<number, number>>({});

  // Reset selections when class changes
  useEffect(() => {
    setSelections({});
  }, [character.class?.name]);

  const handleOptionSelect = (choiceIndex: number, optionIndex: number) => {
    setSelections((prev) => ({
      ...prev,
      [choiceIndex]: optionIndex,
    }));
  };

  // Check if all choices have been made
  const allChoicesMade = equipmentChoices.length === 0 ||
    equipmentChoices.every((_, index) => selections[index] !== undefined);

  // Build the resolved equipment list
  const resolvedEquipment = useMemo((): EquipmentItem[] => {
    if (!allChoicesMade) return [];

    const selectionArray = equipmentChoices.map((_, index) => selections[index] ?? 0);
    const choiceItems = resolveStartingEquipment(equipmentChoices, selectionArray);
    const fixedItems = resolveEquipmentRefs(fixedClassEquipment);

    return [...choiceItems, ...fixedItems];
  }, [allChoicesMade, equipmentChoices, selections, fixedClassEquipment]);

  // Update character state when equipment is resolved
  useEffect(() => {
    if (allChoicesMade && resolvedEquipment.length > 0) {
      updateCharacter({ equipment: resolvedEquipment });
    }
  }, [resolvedEquipment, allChoicesMade]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hasClass) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-4">Choose Equipment</h2>
        <p className="text-gray-600" data-testid="no-class-message">
          Please select a class first to see available starting equipment.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-2">Choose Equipment</h2>
      <p className="text-gray-600 mb-6">
        Select your starting equipment based on your class{hasBackground ? ' and background' : ''}.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Choices */}
        <div>
          {/* Class Equipment Choices */}
          {equipmentChoices.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">
                {character.class?.name} Starting Equipment
              </h3>
              {equipmentChoices.map((choice, index) => (
                <EquipmentChoiceCard
                  key={index}
                  choice={choice}
                  choiceIndex={index}
                  selectedOption={selections[index]}
                  onSelect={handleOptionSelect}
                />
              ))}

              {/* Fixed equipment display */}
              {fixedClassEquipment.length > 0 && (
                <div className="mt-4" data-testid="fixed-equipment">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Also included</h4>
                  <ul className="space-y-1">
                    {fixedClassEquipment.map((ref, index) => (
                      <li key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                        {ref.name}
                        {ref.quantity && ref.quantity > 1 && ` x${ref.quantity}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Background Equipment */}
          {hasBackground && backgroundEquipmentStrings.length > 0 && (
            <div className="mb-8" data-testid="background-equipment">
              <h3 className="text-xl font-bold mb-4">
                {character.background?.name} Equipment
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Granted by your background (read-only)
              </p>
              <ul className="space-y-1">
                {backgroundEquipmentStrings.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Summary */}
        <div>
          <h3 className="text-xl font-bold mb-4">Equipment Summary</h3>
          {!allChoicesMade ? (
            <p className="text-sm text-gray-500 italic" data-testid="incomplete-choices-message">
              Make all equipment choices to see your summary.
            </p>
          ) : (
            <EquipmentSummary
              equipment={resolvedEquipment}
              proficiencies={proficiencies}
              dexModifier={dexModifier}
            />
          )}
        </div>
      </div>
    </div>
  );
}
