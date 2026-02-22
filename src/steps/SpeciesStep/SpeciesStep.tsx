import { useState, useEffect } from 'react';
import type { StepProps } from '../types';
import type { Species, Subspecies } from '../../types/species';
import { formatAbilityBonuses } from '../../rules/format-ability-bonuses';
import { capture } from '../../analytics/index';

type SpeciesCardProps = {
  species: Species;
  selected: boolean;
  onClick: () => void;
};

function SpeciesCard({ species, selected, onClick }: SpeciesCardProps) {
  const bonusText = formatAbilityBonuses(species.abilityBonuses);
  const traitsCount = species.traits.length;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        selected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      <h3 className="text-xl font-bold mb-2">{species.name}</h3>
      <div className="space-y-1 text-sm text-gray-700">
        <p><span className="font-medium">Size:</span> {species.size}</p>
        <p><span className="font-medium">Speed:</span> {species.speed} ft.</p>
        {bonusText && <p><span className="font-medium">Bonuses:</span> {bonusText}</p>}
        <p className="text-gray-500">{traitsCount} {traitsCount === 1 ? 'trait' : 'traits'}</p>
      </div>
    </button>
  );
}

type SubspeciesCardProps = {
  subspecies: Subspecies;
  selected: boolean;
  onClick: () => void;
};

function SubspeciesCard({ subspecies, selected, onClick }: SubspeciesCardProps) {
  const bonusText = formatAbilityBonuses(subspecies.abilityBonuses);
  const traitsCount = subspecies.traits.length;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        selected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      <h4 className="text-lg font-bold mb-2">{subspecies.name}</h4>
      <div className="space-y-1 text-sm text-gray-700">
        {bonusText && <p><span className="font-medium">Bonuses:</span> {bonusText}</p>}
        <p className="text-gray-500">{traitsCount} additional {traitsCount === 1 ? 'trait' : 'traits'}</p>
      </div>
    </button>
  );
}

export function SpeciesStep({ character, updateCharacter, availableContent }: StepProps) {
  const [selectedSpecies, setSelectedSpecies] = useState<Species | undefined>(
    character.species
  );
  const [selectedSubspecies, setSelectedSubspecies] = useState<Subspecies | undefined>(
    character.subspecies
  );

  // Initialize from character state
  useEffect(() => {
    setSelectedSpecies(character.species);
    setSelectedSubspecies(character.subspecies);
  }, [character.species, character.subspecies]);

  const handleSpeciesClick = (species: Species) => {
    setSelectedSpecies(species);

    const source =
      availableContent.species.find(g => g.items.some(s => s.name === species.name))?.source ??
      'Base Content';
    capture('species_selected', {
      species: species.name,
      source,
      has_subspecies: species.subspecies.length > 0,
    });

    // If species has no subspecies, update character immediately
    if (species.subspecies.length === 0) {
      updateCharacter({ species, subspecies: undefined });
      setSelectedSubspecies(undefined);
    } else {
      // Clear subspecies when changing species
      setSelectedSubspecies(undefined);
    }
  };

  const handleSubspeciesClick = (subspecies: Subspecies) => {
    setSelectedSubspecies(subspecies);

    if (selectedSpecies) {
      capture('subspecies_selected', { species: selectedSpecies.name, subspecies: subspecies.name });
      updateCharacter({ species: selectedSpecies, subspecies });
    }
  };

  const availableSubspecies = selectedSpecies ? selectedSpecies.subspecies : [];
  const hasMultipleGroups = availableContent.species.length > 1;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-2">Choose Your Species</h2>
      <p className="text-gray-600 mb-6">
        Select your character's species to determine their traits and abilities.
      </p>

      {/* Species Grid — grouped by source when expansion packs are active */}
      {hasMultipleGroups ? (
        <div className="mb-8 space-y-8">
          {availableContent.species.map(group => (
            <div key={group.source}>
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">
                {group.source}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map(species => (
                  <SpeciesCard
                    key={species.name}
                    species={species}
                    selected={selectedSpecies?.name === species.name}
                    onClick={() => handleSpeciesClick(species)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {availableContent.species[0]?.items.map(species => (
            <SpeciesCard
              key={species.name}
              species={species}
              selected={selectedSpecies?.name === species.name}
              onClick={() => handleSpeciesClick(species)}
            />
          ))}
        </div>
      )}

      {/* Subspecies Section */}
      {selectedSpecies && availableSubspecies.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-bold mb-2">Choose Your Subspecies</h3>
          <p className="text-gray-600 mb-4">
            Select a subspecies for your {selectedSpecies.name}.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSubspecies.map((subspecies) => (
              <SubspeciesCard
                key={subspecies.name}
                subspecies={subspecies}
                selected={selectedSubspecies?.name === subspecies.name}
                onClick={() => handleSubspeciesClick(subspecies)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
