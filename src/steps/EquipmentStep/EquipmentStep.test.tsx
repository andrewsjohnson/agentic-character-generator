import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EquipmentStep } from './EquipmentStep';
import type { CharacterDraft } from '../../types/character';
import type { CharacterClass } from '../../types/class';
import type { Background } from '../../types/background';
import type { Species, Subspecies } from '../../types/species';
import type { AvailableContent } from '../../types/expansion-pack';

const stubContent: AvailableContent = {
  species: [{ source: 'Base Content', items: [] }],
  classes: [{ source: 'Base Content', items: [] }],
  backgrounds: [{ source: 'Base Content', items: [] }],
};

// -- Test fixtures --

const mockFighter: CharacterClass = {
  name: 'Fighter',
  hitDie: 10,
  primaryAbility: ['STR', 'DEX'],
  savingThrows: ['STR', 'CON'],
  armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
  weaponProficiencies: ['simple', 'martial'],
  skillChoices: {
    options: ['Acrobatics', 'Athletics'],
    count: 2,
  },
  startingEquipment: {
    choices: [
      {
        description: 'Choose armor',
        options: [
          { label: 'Chain Mail', items: [{ name: 'Chain Mail' }] },
          { label: 'Leather Armor and Longbow', items: [{ name: 'Leather Armor' }, { name: 'Longbow' }, { name: 'Arrows', quantity: 20 }] },
        ],
      },
      {
        description: 'Choose weapons',
        options: [
          { label: 'Longsword and shield', items: [{ name: 'Longsword' }, { name: 'Shield' }] },
          { label: 'Two longswords', items: [{ name: 'Longsword' }, { name: 'Longsword' }] },
        ],
      },
    ],
    fixed: [],
  },
  features: [],
  subclasses: [],
};

const mockWizard: CharacterClass = {
  name: 'Wizard',
  hitDie: 6,
  primaryAbility: ['INT'],
  savingThrows: ['INT', 'WIS'],
  armorProficiencies: [],
  weaponProficiencies: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
  skillChoices: {
    options: ['Arcana', 'History'],
    count: 2,
  },
  startingEquipment: {
    choices: [
      {
        description: 'Choose a weapon',
        options: [
          { label: 'Quarterstaff', items: [{ name: 'Quarterstaff' }] },
          { label: 'Dagger', items: [{ name: 'Dagger' }] },
        ],
      },
    ],
    fixed: [
      { name: 'Spellbook' },
    ],
  },
  features: [],
  subclasses: [],
};

const mockAcolyte: Background = {
  name: 'Acolyte',
  abilityOptions: ['INT', 'WIS', 'CHA'],
  skillProficiencies: ['Insight', 'Religion'],
  toolProficiency: "Calligrapher's Supplies",
  equipment: [
    { name: "Calligrapher's Supplies", quantity: 1 },
    { name: 'Holy Symbol', quantity: 1 },
    { name: 'Parchment', quantity: 10 },
  ],
  feature: {
    name: 'Shelter of the Faithful',
    description: 'You can receive free healing at a temple.',
  },
  originFeat: 'Magic Initiate (Cleric)',
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
};

const mockBarbarian: CharacterClass = {
  name: 'Barbarian',
  hitDie: 12,
  primaryAbility: ['STR'],
  savingThrows: ['STR', 'CON'],
  armorProficiencies: ['light', 'medium', 'shields'],
  weaponProficiencies: ['simple', 'martial'],
  skillChoices: {
    options: ['Animal Handling', 'Athletics'],
    count: 2,
  },
  startingEquipment: {
    choices: [
      {
        description: 'Choose a martial weapon',
        options: [
          { label: 'Greataxe', items: [{ name: 'Greataxe' }] },
          { label: 'Two handaxes', items: [{ name: 'Handaxe', quantity: 2 }] },
        ],
      },
      {
        description: 'Choose a secondary weapon',
        options: [
          { label: 'Two handaxes', items: [{ name: 'Handaxe', quantity: 2 }] },
          { label: 'Javelin', items: [{ name: 'Javelin' }] },
        ],
      },
    ],
    fixed: [
      { name: 'Javelin', quantity: 4 },
    ],
  },
  features: [
    {
      name: 'Unarmored Defense',
      description: 'AC equals 10 + DEX modifier + CON modifier when not wearing armor.',
    },
  ],
  subclasses: [],
};

const mockMonk: CharacterClass = {
  name: 'Monk',
  hitDie: 8,
  primaryAbility: ['DEX', 'WIS'],
  savingThrows: ['STR', 'DEX'],
  armorProficiencies: [],
  weaponProficiencies: ['simple', 'shortswords'],
  skillChoices: {
    options: ['Acrobatics', 'Athletics'],
    count: 2,
  },
  startingEquipment: {
    choices: [
      {
        description: 'Choose a starting weapon',
        options: [
          { label: 'Shortsword', items: [{ name: 'Shortsword' }] },
          { label: 'Handaxe', items: [{ name: 'Handaxe' }] },
        ],
      },
    ],
    fixed: [
      { name: 'Dart', quantity: 10 },
    ],
  },
  features: [
    {
      name: 'Unarmored Defense',
      description: 'AC equals 10 + DEX modifier + WIS modifier when not wearing armor or shield.',
    },
  ],
  subclasses: [],
};

const mockSpeciesWithConBonus: Species = {
  name: 'Dwarf',
  speed: 25,
  size: 'Medium',
  traits: [],
  languages: ['Common', 'Dwarvish'],
  subspecies: [],
  abilityBonuses: { CON: 2 },
};

const mockSpeciesWithWisBonus: Species = {
  name: 'WisdomSpecies',
  speed: 30,
  size: 'Medium',
  traits: [],
  languages: ['Common'],
  subspecies: [],
  abilityBonuses: { WIS: 2 },
};

const mockSpeciesWithDexBonus: Species = {
  name: 'Elf',
  speed: 30,
  size: 'Medium',
  traits: [],
  languages: ['Common', 'Elvish'],
  subspecies: [],
  abilityBonuses: { DEX: 2 },
};

const mockHillDwarfSubspecies: Subspecies = {
  name: 'Hill Dwarf',
  traits: [
    { name: 'Dwarven Toughness', description: 'HP max increases by 1 per level' },
  ],
  abilityBonuses: { WIS: 1 },
};

const mockDwarfWithSubspecies: Species = {
  name: 'Dwarf',
  speed: 25,
  size: 'Medium',
  traits: [],
  languages: ['Common', 'Dwarvish'],
  subspecies: [mockHillDwarfSubspecies],
  abilityBonuses: { CON: 2 },
};

function renderEquipmentStep(character: CharacterDraft = {}) {
  const mockUpdate = vi.fn();
  const result = render(
    <MemoryRouter>
      <EquipmentStep character={character} updateCharacter={mockUpdate} availableContent={stubContent} />
    </MemoryRouter>
  );
  return { ...result, mockUpdate };
}

// -- Tests --

describe('EquipmentStep', () => {
  describe('empty state', () => {
    it('shows message when no class is selected', () => {
      renderEquipmentStep({});
      expect(screen.getByTestId('no-class-message')).toBeInTheDocument();
      expect(screen.getByText(/please select a class first/i)).toBeInTheDocument();
    });

    it('renders heading', () => {
      renderEquipmentStep({});
      expect(screen.getByText(/choose equipment/i)).toBeInTheDocument();
    });
  });

  describe('with class selected', () => {
    it('renders equipment choices from class', () => {
      renderEquipmentStep({ class: mockFighter });
      expect(screen.getByText('Fighter Starting Equipment')).toBeInTheDocument();
      expect(screen.getByText('Choose armor')).toBeInTheDocument();
      expect(screen.getByText('Choose weapons')).toBeInTheDocument();
    });

    it('renders all options for each choice', () => {
      renderEquipmentStep({ class: mockFighter });
      expect(screen.getByText('Chain Mail')).toBeInTheDocument();
      expect(screen.getByText('Leather Armor and Longbow')).toBeInTheDocument();
      expect(screen.getByText('Longsword and shield')).toBeInTheDocument();
      expect(screen.getByText('Two longswords')).toBeInTheDocument();
    });

    it('shows quantity in choice card inline detail for items with quantity > 1', () => {
      renderEquipmentStep({ class: mockFighter });
      // The second option "Leather Armor and Longbow" has items including Arrows with quantity 20
      // The inline detail should show "Arrows x20"
      expect(screen.getByText(/Arrows x20/)).toBeInTheDocument();
    });

    it('shows incomplete choices message before all selections are made', () => {
      renderEquipmentStep({ class: mockFighter });
      expect(screen.getByTestId('incomplete-choices-message')).toBeInTheDocument();
    });

    it('shows equipment summary after all choices are made', () => {
      renderEquipmentStep({ class: mockFighter });

      fireEvent.click(screen.getByTestId('choice-0-option-0'));
      fireEvent.click(screen.getByTestId('choice-1-option-0'));

      expect(screen.getByTestId('equipment-summary')).toBeInTheDocument();
    });

    it('shows quantity in equipment summary for resolved gear items', () => {
      renderEquipmentStep({ class: mockFighter });

      // Select leather armor + longbow option (includes Arrows x20)
      fireEvent.click(screen.getByTestId('choice-0-option-1'));
      fireEvent.click(screen.getByTestId('choice-1-option-0'));

      const summary = screen.getByTestId('equipment-summary');
      expect(summary).toBeInTheDocument();
      // Arrows are gear with quantity 20 — the summary should show "x20"
      expect(screen.getByText('x20')).toBeInTheDocument();
    });

    it('updates character state when all choices are made', () => {
      const { mockUpdate } = renderEquipmentStep({ class: mockFighter });

      fireEvent.click(screen.getByTestId('choice-0-option-0'));
      fireEvent.click(screen.getByTestId('choice-1-option-0'));

      expect(mockUpdate).toHaveBeenCalledWith({
        equipment: expect.arrayContaining([
          expect.objectContaining({ name: 'Chain Mail' }),
          expect.objectContaining({ name: 'Longsword' }),
          expect.objectContaining({ name: 'Shield' }),
        ]),
      });
    });
  });

  describe('fixed equipment', () => {
    it('displays fixed equipment for Wizard', () => {
      renderEquipmentStep({ class: mockWizard });
      expect(screen.getByTestId('fixed-equipment')).toBeInTheDocument();
      expect(screen.getByText('Spellbook')).toBeInTheDocument();
    });

    it('displays quantity for fixed equipment with quantity > 1', () => {
      renderEquipmentStep({ class: mockBarbarian });
      expect(screen.getByTestId('fixed-equipment')).toBeInTheDocument();
      expect(screen.getByText('Javelin x4')).toBeInTheDocument();
    });

    it('displays quantity for Monk darts in fixed equipment', () => {
      renderEquipmentStep({ class: mockMonk });
      expect(screen.getByTestId('fixed-equipment')).toBeInTheDocument();
      expect(screen.getByText('Dart x10')).toBeInTheDocument();
    });
  });

  describe('background equipment', () => {
    it('displays background equipment as read-only', () => {
      renderEquipmentStep({
        class: mockFighter,
        background: mockAcolyte,
      });
      expect(screen.getByTestId('background-equipment')).toBeInTheDocument();
      expect(screen.getByText('Acolyte Equipment')).toBeInTheDocument();
      expect(screen.getByText("Calligrapher's Supplies")).toBeInTheDocument();
      expect(screen.getByText('Parchment (x10)')).toBeInTheDocument();
    });

    it('shows read-only label for background equipment', () => {
      renderEquipmentStep({
        class: mockFighter,
        background: mockAcolyte,
      });
      expect(screen.getByText(/granted by your background/i)).toBeInTheDocument();
    });
  });

  describe('AC display', () => {
    it('shows AC when ability scores are set and choices are made', () => {
      renderEquipmentStep({
        class: mockFighter,
        baseAbilityScores: { STR: 16, DEX: 14, CON: 14, INT: 10, WIS: 10, CHA: 10 },
      });

      // Select chain mail and longsword + shield
      fireEvent.click(screen.getByTestId('choice-0-option-0'));
      fireEvent.click(screen.getByTestId('choice-1-option-0'));

      const acDisplay = screen.getByTestId('ac-display');
      expect(acDisplay).toBeInTheDocument();
      // Chain Mail (AC 16) + Shield (+2) = AC 18
      expect(acDisplay).toHaveTextContent('18');
    });

    it('shows AC with leather armor option', () => {
      renderEquipmentStep({
        class: mockFighter,
        baseAbilityScores: { STR: 16, DEX: 14, CON: 14, INT: 10, WIS: 10, CHA: 10 },
      });

      // Select leather armor + longbow and two longswords
      fireEvent.click(screen.getByTestId('choice-0-option-1'));
      fireEvent.click(screen.getByTestId('choice-1-option-1'));

      const acDisplay = screen.getByTestId('ac-display');
      expect(acDisplay).toBeInTheDocument();
      // Leather Armor (AC 11) + DEX +2 = AC 13
      expect(acDisplay).toHaveTextContent('13');
    });

    it('does not show AC when ability scores are not set', () => {
      renderEquipmentStep({ class: mockFighter });

      fireEvent.click(screen.getByTestId('choice-0-option-0'));
      fireEvent.click(screen.getByTestId('choice-1-option-0'));

      expect(screen.queryByTestId('ac-display')).not.toBeInTheDocument();
    });
  });

  describe('proficiency flags', () => {
    it('does not show proficiency warnings for Fighter with martial weapons', () => {
      renderEquipmentStep({ class: mockFighter });

      fireEvent.click(screen.getByTestId('choice-0-option-0'));
      fireEvent.click(screen.getByTestId('choice-1-option-0'));

      // Fighter is proficient with all armor and weapons
      const warnings = screen.queryAllByText('Not proficient');
      expect(warnings).toHaveLength(0);
    });

    it('shows proficiency warnings for Wizard with non-proficient equipment', () => {
      const wizardWithChainMail: CharacterClass = {
        ...mockWizard,
        startingEquipment: {
          choices: [
            {
              description: 'Choose armor',
              options: [
                { label: 'Chain Mail', items: [{ name: 'Chain Mail' }] },
              ],
            },
          ],
          fixed: [],
        },
      };

      renderEquipmentStep({ class: wizardWithChainMail });

      fireEvent.click(screen.getByTestId('choice-0-option-0'));

      expect(screen.getByText('Not proficient')).toBeInTheDocument();
    });
  });

  describe('equipment categorization', () => {
    it('groups equipment by category in summary', () => {
      renderEquipmentStep({ class: mockFighter });

      // Select chain mail + longsword and shield
      fireEvent.click(screen.getByTestId('choice-0-option-0'));
      fireEvent.click(screen.getByTestId('choice-1-option-0'));

      expect(screen.getByTestId('category-armor')).toBeInTheDocument();
      expect(screen.getByTestId('category-weapon')).toBeInTheDocument();
    });
  });

  describe('selection interaction', () => {
    it('allows changing a selection', () => {
      const { mockUpdate } = renderEquipmentStep({ class: mockFighter });

      // Make initial selections
      fireEvent.click(screen.getByTestId('choice-0-option-0'));
      fireEvent.click(screen.getByTestId('choice-1-option-0'));

      // Change first selection
      fireEvent.click(screen.getByTestId('choice-0-option-1'));

      // Should update with new equipment
      const lastCall = mockUpdate.mock.calls[mockUpdate.mock.calls.length - 1][0];
      expect(lastCall.equipment).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Leather Armor' }),
        ])
      );
    });
  });

  describe('species bonus AC calculations', () => {
    it('applies species CON bonus to Barbarian unarmored defense AC', () => {
      // Base CON 14 (+2 mod), species +2 CON → CON 16 (+3 mod)
      // Base DEX 14 (+2 mod), no species DEX bonus
      // Barbarian unarmored defense: 10 + DEX mod + CON mod = 10 + 2 + 3 = 15
      renderEquipmentStep({
        class: mockBarbarian,
        species: mockSpeciesWithConBonus,
        baseAbilityScores: { STR: 15, DEX: 14, CON: 14, INT: 10, WIS: 12, CHA: 8 },
      });

      // Select both equipment choices to trigger summary display
      fireEvent.click(screen.getByTestId('choice-0-option-0'));
      fireEvent.click(screen.getByTestId('choice-1-option-0'));

      const acDisplay = screen.getByTestId('ac-display');
      expect(acDisplay).toBeInTheDocument();
      // AC = 10 + 2 (DEX) + 3 (CON with species bonus) = 15
      expect(acDisplay).toHaveTextContent('15');
    });

    it('applies species WIS bonus to Monk unarmored defense AC', () => {
      // Base WIS 14 (+2 mod), species +2 WIS → WIS 16 (+3 mod)
      // Base DEX 14 (+2 mod), no species DEX bonus
      // Monk unarmored defense: 10 + DEX mod + WIS mod = 10 + 2 + 3 = 15
      renderEquipmentStep({
        class: mockMonk,
        species: mockSpeciesWithWisBonus,
        baseAbilityScores: { STR: 12, DEX: 14, CON: 13, INT: 10, WIS: 14, CHA: 8 },
      });

      // Select equipment choice to trigger summary display
      fireEvent.click(screen.getByTestId('choice-0-option-0'));

      const acDisplay = screen.getByTestId('ac-display');
      expect(acDisplay).toBeInTheDocument();
      // AC = 10 + 2 (DEX) + 3 (WIS with species bonus) = 15
      expect(acDisplay).toHaveTextContent('15');
    });

    it('applies species DEX bonus to armor AC calculation', () => {
      // Base DEX 14 (+2 mod), species +2 DEX → DEX 16 (+3 mod)
      // Fighter in leather armor: AC = 11 + DEX mod = 11 + 3 = 14
      renderEquipmentStep({
        class: mockFighter,
        species: mockSpeciesWithDexBonus,
        baseAbilityScores: { STR: 15, DEX: 14, CON: 13, INT: 8, WIS: 10, CHA: 12 },
      });

      // Select leather armor + longbow (option 1) and two longswords (option 1)
      fireEvent.click(screen.getByTestId('choice-0-option-1'));
      fireEvent.click(screen.getByTestId('choice-1-option-1'));

      const acDisplay = screen.getByTestId('ac-display');
      expect(acDisplay).toBeInTheDocument();
      // AC = 11 (leather) + 3 (DEX with species bonus) = 14
      expect(acDisplay).toHaveTextContent('14');
    });

    it('applies stacked species and subspecies bonuses to Monk AC', () => {
      // Hill Dwarf Monk: Dwarf CON +2, Hill Dwarf WIS +1
      // Base DEX 14 (+2 mod), no DEX bonus
      // Base WIS 14 (+2 mod), subspecies +1 WIS → WIS 15 (+2 mod, no change)
      // Use Base WIS 15 (+2 mod), subspecies +1 WIS → WIS 16 (+3 mod)
      // Monk unarmored defense: 10 + DEX mod + WIS mod = 10 + 2 + 3 = 15
      renderEquipmentStep({
        class: mockMonk,
        species: mockDwarfWithSubspecies,
        subspecies: mockHillDwarfSubspecies,
        baseAbilityScores: { STR: 10, DEX: 14, CON: 13, INT: 8, WIS: 15, CHA: 10 },
      });

      // Select equipment choice to trigger summary display
      fireEvent.click(screen.getByTestId('choice-0-option-0'));

      const acDisplay = screen.getByTestId('ac-display');
      expect(acDisplay).toBeInTheDocument();
      // AC = 10 + 2 (DEX) + 3 (WIS 15 + Hill Dwarf +1 = 16, mod +3) = 15
      expect(acDisplay).toHaveTextContent('15');
    });

    it('applies base species CON bonus to Barbarian AC when subspecies is present', () => {
      // Hill Dwarf Barbarian: Dwarf CON +2, Hill Dwarf WIS +1
      // Note: Hill Dwarf WIS +1 does not affect Barbarian AC (uses CON, not WIS)
      // Base CON 13 (+1 mod), base species +2 CON → CON 15 (+2 mod)
      // Base DEX 14 (+2 mod), no DEX bonus
      // Barbarian unarmored defense: 10 + DEX mod + CON mod = 10 + 2 + 2 = 14
      renderEquipmentStep({
        class: mockBarbarian,
        species: mockDwarfWithSubspecies,
        subspecies: mockHillDwarfSubspecies,
        baseAbilityScores: { STR: 15, DEX: 14, CON: 13, INT: 8, WIS: 10, CHA: 10 },
      });

      // Select both equipment choices to trigger summary display
      fireEvent.click(screen.getByTestId('choice-0-option-0'));
      fireEvent.click(screen.getByTestId('choice-1-option-0'));

      const acDisplay = screen.getByTestId('ac-display');
      expect(acDisplay).toBeInTheDocument();
      // AC = 10 + 2 (DEX) + 2 (CON 13 + Dwarf +2 = 15, mod +2) = 14
      expect(acDisplay).toHaveTextContent('14');
    });
  });
});
