import { describe, it, expect } from 'vitest';
import { computeAvailableContent } from './expansion-packs';
import type { Species } from '../types/species';
import type { CharacterClass } from '../types/class';
import type { Background } from '../types/background';
import type { ExpansionPack } from '../types/expansion-pack';

const baseHuman: Species = {
  name: 'Human',
  speed: 30,
  size: 'Medium',
  traits: [],
  languages: ['Common'],
  subspecies: [],
};

const baseFighter: CharacterClass = {
  name: 'Fighter',
  hitDie: 10,
  primaryAbility: ['STR', 'DEX'],
  savingThrows: ['STR', 'CON'],
  armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
  weaponProficiencies: ['simple', 'martial'],
  skillChoices: { options: ['Acrobatics', 'Athletics'], count: 2 },
  features: [],
  subclasses: [],
};

const baseAcolyte: Background = {
  name: 'Acolyte',
  abilityOptions: ['INT', 'WIS', 'CHA'],
  skillProficiencies: ['Insight', 'Religion'],
  toolProficiency: 'None',
  equipment: [],
  feature: { name: 'Shelter of the Faithful', description: 'Temples provide aid.' },
  originFeat: 'Magic Initiate',
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
};

const baseContent = {
  species: [baseHuman],
  classes: [baseFighter],
  backgrounds: [baseAcolyte],
};

const aasimar: Species = {
  name: 'Aasimar',
  speed: 30,
  size: 'Medium',
  traits: [{ name: 'Darkvision', description: 'See in the dark.' }],
  languages: ['Common', 'Celestial'],
  subspecies: [],
};

const artificer: CharacterClass = {
  name: 'Artificer',
  hitDie: 8,
  primaryAbility: ['INT'],
  savingThrows: ['CON', 'INT'],
  armorProficiencies: ['light', 'medium', 'shields'],
  weaponProficiencies: ['simple'],
  skillChoices: { options: ['Arcana', 'History'], count: 2 },
  features: [],
  subclasses: [],
};

const farTraveler: Background = {
  name: 'Far Traveler',
  abilityOptions: ['STR', 'DEX', 'INT'],
  skillProficiencies: ['Insight', 'Perception'],
  toolProficiency: 'Any musical instrument',
  equipment: [],
  feature: { name: 'All Eyes on You', description: 'Locals notice you.' },
  originFeat: 'Lucky',
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
};

const mythicRealms: ExpansionPack = {
  id: 'mythic-realms',
  name: 'Mythic Realms',
  description: 'Adds new options.',
  species: [aasimar],
  classes: [artificer],
  backgrounds: [farTraveler],
};

describe('computeAvailableContent', () => {
  it('returns only base content when no packs are enabled', () => {
    const result = computeAvailableContent([], [mythicRealms], baseContent);

    expect(result.species).toHaveLength(1);
    expect(result.species[0].source).toBe('Base Content');
    expect(result.species[0].items).toEqual([baseHuman]);

    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].source).toBe('Base Content');
    expect(result.classes[0].items).toEqual([baseFighter]);

    expect(result.backgrounds).toHaveLength(1);
    expect(result.backgrounds[0].source).toBe('Base Content');
    expect(result.backgrounds[0].items).toEqual([baseAcolyte]);
  });

  it('appends expansion content under the pack name when enabled', () => {
    const result = computeAvailableContent(['mythic-realms'], [mythicRealms], baseContent);

    expect(result.species).toHaveLength(2);
    expect(result.species[0].source).toBe('Base Content');
    expect(result.species[0].items).toEqual([baseHuman]);
    expect(result.species[1].source).toBe('Mythic Realms');
    expect(result.species[1].items).toEqual([aasimar]);

    expect(result.classes).toHaveLength(2);
    expect(result.classes[1].source).toBe('Mythic Realms');
    expect(result.classes[1].items).toEqual([artificer]);

    expect(result.backgrounds).toHaveLength(2);
    expect(result.backgrounds[1].source).toBe('Mythic Realms');
    expect(result.backgrounds[1].items).toEqual([farTraveler]);
  });

  it('ignores packs not in the enabled list', () => {
    const result = computeAvailableContent(['other-pack'], [mythicRealms], baseContent);

    expect(result.species).toHaveLength(1);
    expect(result.classes).toHaveLength(1);
    expect(result.backgrounds).toHaveLength(1);
  });

  it('handles a pack with no species content', () => {
    const packNoSpecies: ExpansionPack = {
      id: 'no-species',
      name: 'No Species Pack',
      description: 'Only adds classes.',
      classes: [artificer],
    };

    const result = computeAvailableContent(['no-species'], [packNoSpecies], baseContent);

    expect(result.species).toHaveLength(1);
    expect(result.classes).toHaveLength(2);
    expect(result.backgrounds).toHaveLength(1);
  });

  it('handles multiple packs enabled simultaneously', () => {
    const secondPack: ExpansionPack = {
      id: 'second-pack',
      name: 'Second Pack',
      description: 'Another pack.',
      species: [
        {
          name: 'Genasi',
          speed: 30,
          size: 'Medium',
          traits: [],
          languages: ['Common', 'Primordial'],
          subspecies: [],
        },
      ],
    };

    const result = computeAvailableContent(
      ['mythic-realms', 'second-pack'],
      [mythicRealms, secondPack],
      baseContent
    );

    expect(result.species).toHaveLength(3);
    expect(result.species[0].source).toBe('Base Content');
    expect(result.species[1].source).toBe('Mythic Realms');
    expect(result.species[2].source).toBe('Second Pack');
  });

  it('returns empty item arrays for base content when base has no data', () => {
    const emptyBase = { species: [], classes: [], backgrounds: [] };
    const result = computeAvailableContent([], [], emptyBase);

    expect(result.species[0].items).toEqual([]);
    expect(result.classes[0].items).toEqual([]);
    expect(result.backgrounds[0].items).toEqual([]);
  });
});
