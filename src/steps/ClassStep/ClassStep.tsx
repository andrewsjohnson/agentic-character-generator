import { useState, useEffect } from 'react';
import type { StepProps } from '../types';
import type { CharacterClass } from '../../types/class';
import { getClassProficiencies, getClassSkillChoices } from '../../rules/classes';
import classesData from '../../data/classes.json';

type ClassCardProps = {
  charClass: CharacterClass;
  selected: boolean;
  onClick: () => void;
};

function ClassCard({ charClass, selected, onClick }: ClassCardProps) {
  const primaryAbilityText = charClass.primaryAbility.join(', ');
  const savingThrowsText = charClass.savingThrows.join(', ');

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        selected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      <h3 className="text-xl font-bold mb-2">{charClass.name}</h3>
      <div className="space-y-1 text-sm text-gray-700">
        <p><span className="font-medium">Hit Die:</span> d{charClass.hitDie}</p>
        <p><span className="font-medium">Primary:</span> {primaryAbilityText}</p>
        <p><span className="font-medium">Saves:</span> {savingThrowsText}</p>
      </div>
    </button>
  );
}

export function ClassStep({ character, updateCharacter }: StepProps) {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | undefined>(
    character.class
  );

  // Initialize from character state
  useEffect(() => {
    setSelectedClass(character.class);
  }, [character.class]);

  const handleClassClick = (charClass: CharacterClass) => {
    setSelectedClass(charClass);
    updateCharacter({ class: charClass });
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-2">Choose Your Class</h2>
      <p className="text-gray-600 mb-6">
        Select your character's class to determine their abilities and role in adventuring.
      </p>

      {/* Class Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {(classesData as CharacterClass[]).map((charClass) => (
          <ClassCard
            key={charClass.name}
            charClass={charClass}
            selected={selectedClass?.name === charClass.name}
            onClick={() => handleClassClick(charClass)}
          />
        ))}
      </div>

      {/* Detail Panel */}
      {selectedClass && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-bold mb-4">{selectedClass.name} Details</h3>

          {/* Proficiencies Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Proficiencies</h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Armor:</span>{' '}
                {selectedClass.armorProficiencies.length > 0
                  ? selectedClass.armorProficiencies.join(', ')
                  : 'None'}
              </p>
              <p>
                <span className="font-medium">Weapons:</span>{' '}
                {selectedClass.weaponProficiencies.join(', ')}
              </p>
              <p>
                <span className="font-medium">Saving Throws:</span>{' '}
                {selectedClass.savingThrows.join(', ')}
              </p>
            </div>
          </div>

          {/* Skill Choices Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Skill Choices</h4>
            <p className="text-sm text-gray-700">
              Choose {getClassSkillChoices(selectedClass).count} from:{' '}
              {getClassSkillChoices(selectedClass).options.join(', ')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              You will choose your skills in a later step.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
