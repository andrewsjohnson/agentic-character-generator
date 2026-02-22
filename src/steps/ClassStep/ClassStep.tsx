import { useState, useEffect } from 'react';
import type { StepProps } from '../types';
import type { CharacterClass } from '../../types/class';
import { getClassSkillChoices } from '../../rules/classes';
import { capture } from '../../analytics/index';

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
      data-testid={`class-card-${charClass.name.toLowerCase()}`}
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

type ClassDetailProps = {
  charClass: CharacterClass;
};

function ClassDetail({ charClass }: ClassDetailProps) {
  const skillChoices = getClassSkillChoices(charClass);

  return (
    <div className="mt-8 pt-8 border-t border-gray-200" data-testid="class-detail-panel">
      <h3 className="text-2xl font-bold mb-4" data-testid="class-detail-heading">{charClass.name} Details</h3>

      {/* Proficiencies Section */}
      <div className="mb-6" data-testid="proficiencies-section">
        <h4 className="text-lg font-semibold mb-2">Proficiencies</h4>
        <div className="space-y-2 text-sm">
          <p data-testid="armor-proficiencies">
            <span className="font-medium">Armor:</span>{' '}
            {charClass.armorProficiencies.length > 0
              ? charClass.armorProficiencies.join(', ')
              : 'None'}
          </p>
          <p data-testid="weapon-proficiencies">
            <span className="font-medium">Weapons:</span>{' '}
            {charClass.weaponProficiencies.join(', ')}
          </p>
          <p data-testid="saving-throws">
            <span className="font-medium">Saving Throws:</span>{' '}
            {charClass.savingThrows.join(', ')}
          </p>
        </div>
      </div>

      {/* Skill Choices Section */}
      <div className="mb-6" data-testid="skill-choices-section">
        <h4 className="text-lg font-semibold mb-2">Skill Choices</h4>
        <p className="text-sm text-gray-700" data-testid="skill-choices-text">
          Choose {skillChoices.count} from: {skillChoices.options.join(', ')}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          You will choose your skills in a later step.
        </p>
      </div>

      {/* Features Section */}
      <div className="mb-6" data-testid="features-section">
        <h4 className="text-lg font-semibold mb-2">Level 1 Features</h4>
        <div className="space-y-3">
          {charClass.features.map((feature, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded" data-testid={`feature-${index}`}>
              <h5 className="font-semibold text-sm mb-1">{feature.name}</h5>
              <p className="text-xs text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Spellcasting Section */}
      {charClass.spellcasting && (
        <div className="mb-6" data-testid="spellcasting-section">
          <h4 className="text-lg font-semibold mb-2">Spellcasting</h4>
          <div className="bg-blue-50 p-3 rounded space-y-2 text-sm">
            <p data-testid="spellcasting-ability">
              <span className="font-medium">Spellcasting Ability:</span>{' '}
              {charClass.spellcasting.ability}
            </p>
            <p data-testid="cantrips-known">
              <span className="font-medium">Cantrips Known:</span>{' '}
              {charClass.spellcasting.cantripsKnown}
            </p>
            <p data-testid="spell-slots">
              <span className="font-medium">Spell Slots (Level 1):</span>{' '}
              {charClass.spellcasting.spellSlots}
            </p>
            {charClass.spellcasting.spellsPrepared !== undefined && (
              <p data-testid="spells-prepared">
                <span className="font-medium">Spells Prepared/Known:</span>{' '}
                {charClass.spellcasting.spellsPrepared}
              </p>
            )}
            {charClass.spellcasting.isPactMagic && (
              <p className="text-xs text-gray-600 italic" data-testid="pact-magic-note">
                This class uses Pact Magic instead of standard Spellcasting.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ClassStep({ character, updateCharacter, availableContent }: StepProps) {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | undefined>(
    character.class
  );

  // Initialize from character state
  useEffect(() => {
    setSelectedClass(character.class);
  }, [character.class]);

  const handleClassClick = (charClass: CharacterClass) => {
    setSelectedClass(charClass);
    const source =
      availableContent.classes.find(g => g.items.some(c => c.name === charClass.name))?.source ??
      'Base Content';
    capture('class_selected', { class: charClass.name, source });
    updateCharacter({ class: charClass });
  };

  const hasMultipleGroups = availableContent.classes.length > 1;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-2">Choose Your Class</h2>
      <p className="text-gray-600 mb-6">
        Select your character's class to determine their abilities and role in adventuring.
      </p>

      {/* Class Grid — grouped by source when expansion packs are active */}
      {hasMultipleGroups ? (
        <div className="mb-8 space-y-8">
          {availableContent.classes.map(group => (
            <div key={group.source}>
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">
                {group.source}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map(charClass => (
                  <ClassCard
                    key={charClass.name}
                    charClass={charClass}
                    selected={selectedClass?.name === charClass.name}
                    onClick={() => handleClassClick(charClass)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {availableContent.classes[0]?.items.map(charClass => (
            <ClassCard
              key={charClass.name}
              charClass={charClass}
              selected={selectedClass?.name === charClass.name}
              onClick={() => handleClassClick(charClass)}
            />
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selectedClass && (
        <ClassDetail charClass={selectedClass} />
      )}
    </div>
  );
}
