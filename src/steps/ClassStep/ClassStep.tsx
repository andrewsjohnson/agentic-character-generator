import { useState, useEffect } from 'react';
import type { StepProps } from '../types';
import type { CharacterClass } from '../../types/class';
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
    </div>
  );
}
