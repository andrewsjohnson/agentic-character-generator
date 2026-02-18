import { describe, it, expect } from 'vitest';
import { computeAvailableContent, findStaleSelections } from './expansion-packs';
import type { Species } from '../types/species';
import type { CharacterClass } from '../types/class';
import type { Background } from '../types/background';
import type { CharacterDraft } from '../types/character';
import type { AvailableContent } from '../types/expansion-pack';
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

describe('findStaleSelections', () => {
  const baseOnly: AvailableContent = {
    species: [{ source: 'Base Content', items: [baseHuman] }],
    classes: [{ source: 'Base Content', items: [baseFighter] }],
    backgrounds: [{ source: 'Base Content', items: [baseAcolyte] }],
  };

  const withExpansion: AvailableContent = {
    species: [
      { source: 'Base Content', items: [baseHuman] },
      { source: 'Mythic Realms', items: [aasimar] },
    ],
    classes: [
      { source: 'Base Content', items: [baseFighter] },
      { source: 'Mythic Realms', items: [artificer] },
    ],
    backgrounds: [
      { source: 'Base Content', items: [baseAcolyte] },
      { source: 'Mythic Realms', items: [farTraveler] },
    ],
  };

  it('returns empty object when no selections exist', () => {
    const character: CharacterDraft = {};
    const stale = findStaleSelections(character, baseOnly);
    expect(Object.keys(stale)).toHaveLength(0);
  });

  it('returns empty object when all selections are still available', () => {
    const character: CharacterDraft = {
      species: baseHuman,
      class: baseFighter,
      background: baseAcolyte,
    };
    const stale = findStaleSelections(character, baseOnly);
    expect(Object.keys(stale)).toHaveLength(0);
  });

  it('returns empty object when expansion pack selections are available', () => {
    const character: CharacterDraft = {
      species: aasimar,
      class: artificer,
      background: farTraveler,
    };
    const stale = findStaleSelections(character, withExpansion);
    expect(Object.keys(stale)).toHaveLength(0);
  });

  it('clears species and subspecies when species is no longer available', () => {
    const character: CharacterDraft = {
      species: aasimar,
      subspecies: { name: 'Protector Aasimar', traits: [] },
    };
    const stale = findStaleSelections(character, baseOnly);
    expect(stale.species).toBeUndefined();
    expect(stale.subspecies).toBeUndefined();
    expect('species' in stale).toBe(true);
    expect('subspecies' in stale).toBe(true);
  });

  it('clears class and related fields when class is no longer available', () => {
    const character: CharacterDraft = {
      class: artificer,
      skillProficiencies: ['Arcana', 'History'],
      cantripsKnown: ['Mending'],
      spellsKnown: ['Cure Wounds'],
    };
    const stale = findStaleSelections(character, baseOnly);
    expect('class' in stale).toBe(true);
    expect('subclass' in stale).toBe(true);
    expect('skillProficiencies' in stale).toBe(true);
    expect('cantripsKnown' in stale).toBe(true);
    expect('spellsKnown' in stale).toBe(true);
  });

  it('clears background and related fields when background is no longer available', () => {
    const character: CharacterDraft = {
      background: farTraveler,
      originFeat: 'Lucky',
      backgroundSkillReplacements: { Insight: 'Stealth' },
    };
    const stale = findStaleSelections(character, baseOnly);
    expect('background' in stale).toBe(true);
    expect('backgroundSkillReplacements' in stale).toBe(true);
    expect('originFeat' in stale).toBe(true);
    expect('skillProficiencies' in stale).toBe(true);
  });

  it('only clears the stale selection, not other valid selections', () => {
    const character: CharacterDraft = {
      species: aasimar,
      class: baseFighter,
      background: baseAcolyte,
    };
    const stale = findStaleSelections(character, baseOnly);
    expect('species' in stale).toBe(true);
    expect('class' in stale).toBe(false);
    expect('background' in stale).toBe(false);
  });

  it('clears all three when all selections are from a disabled pack', () => {
    const character: CharacterDraft = {
      species: aasimar,
      class: artificer,
      background: farTraveler,
    };
    const stale = findStaleSelections(character, baseOnly);
    expect('species' in stale).toBe(true);
    expect('class' in stale).toBe(true);
    expect('background' in stale).toBe(true);
  });
});
