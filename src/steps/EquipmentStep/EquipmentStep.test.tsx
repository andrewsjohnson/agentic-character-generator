import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { EquipmentStep } from './EquipmentStep';
import type { CharacterDraft } from '../../types/character';
import type { CharacterClass, WeaponProficiency } from '../../types/class';
import type { Background } from '../../types/background';

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
          { label: 'Leather Armor and Longbow', items: [{ name: 'Leather Armor' }, { name: 'Longbow' }, { name: 'Arrows (20)' }] },
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
  weaponProficiencies: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'] as WeaponProficiency[],
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

function renderEquipmentStep(character: CharacterDraft = {}) {
  const mockUpdate = vi.fn();
  const result = render(
    <MemoryRouter>
      <EquipmentStep character={character} updateCharacter={mockUpdate} />
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

    it('shows incomplete choices message before all selections are made', () => {
      renderEquipmentStep({ class: mockFighter });
      expect(screen.getByTestId('incomplete-choices-message')).toBeInTheDocument();
    });

    it('shows equipment summary after all choices are made', async () => {
      const user = userEvent.setup();
      renderEquipmentStep({ class: mockFighter });

      // Select first option of each choice
      await user.click(screen.getByTestId('choice-0-option-0'));
      await user.click(screen.getByTestId('choice-1-option-0'));

      expect(screen.getByTestId('equipment-summary')).toBeInTheDocument();
    });

    it('updates character state when all choices are made', async () => {
      const user = userEvent.setup();
      const { mockUpdate } = renderEquipmentStep({ class: mockFighter });

      await user.click(screen.getByTestId('choice-0-option-0'));
      await user.click(screen.getByTestId('choice-1-option-0'));

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
    it('shows AC when ability scores are set and choices are made', async () => {
      const user = userEvent.setup();
      renderEquipmentStep({
        class: mockFighter,
        baseAbilityScores: { STR: 16, DEX: 14, CON: 14, INT: 10, WIS: 10, CHA: 10 },
      });

      // Select chain mail and longsword + shield
      await user.click(screen.getByTestId('choice-0-option-0'));
      await user.click(screen.getByTestId('choice-1-option-0'));

      const acDisplay = screen.getByTestId('ac-display');
      expect(acDisplay).toBeInTheDocument();
      // Chain Mail (AC 16) + Shield (+2) = AC 18
      expect(acDisplay).toHaveTextContent('18');
    });

    it('shows AC with leather armor option', async () => {
      const user = userEvent.setup();
      renderEquipmentStep({
        class: mockFighter,
        baseAbilityScores: { STR: 16, DEX: 14, CON: 14, INT: 10, WIS: 10, CHA: 10 },
      });

      // Select leather armor + longbow and two longswords
      await user.click(screen.getByTestId('choice-0-option-1'));
      await user.click(screen.getByTestId('choice-1-option-1'));

      const acDisplay = screen.getByTestId('ac-display');
      expect(acDisplay).toBeInTheDocument();
      // Leather Armor (AC 11) + DEX +2 = AC 13
      expect(acDisplay).toHaveTextContent('13');
    });

    it('does not show AC when ability scores are not set', async () => {
      const user = userEvent.setup();
      renderEquipmentStep({ class: mockFighter });

      await user.click(screen.getByTestId('choice-0-option-0'));
      await user.click(screen.getByTestId('choice-1-option-0'));

      expect(screen.queryByTestId('ac-display')).not.toBeInTheDocument();
    });
  });

  describe('proficiency flags', () => {
    it('does not show proficiency warnings for Fighter with martial weapons', async () => {
      const user = userEvent.setup();
      renderEquipmentStep({ class: mockFighter });

      await user.click(screen.getByTestId('choice-0-option-0'));
      await user.click(screen.getByTestId('choice-1-option-0'));

      // Fighter is proficient with all armor and weapons
      const warnings = screen.queryAllByText('Not proficient');
      expect(warnings).toHaveLength(0);
    });

    it('shows proficiency warnings for Wizard with non-proficient equipment', async () => {
      const user = userEvent.setup();
      // Give wizard a chain mail (not proficient)
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

      await user.click(screen.getByTestId('choice-0-option-0'));

      expect(screen.getByText('Not proficient')).toBeInTheDocument();
    });
  });

  describe('equipment categorization', () => {
    it('groups equipment by category in summary', async () => {
      const user = userEvent.setup();
      renderEquipmentStep({ class: mockFighter });

      // Select chain mail + longsword and shield
      await user.click(screen.getByTestId('choice-0-option-0'));
      await user.click(screen.getByTestId('choice-1-option-0'));

      expect(screen.getByTestId('category-armor')).toBeInTheDocument();
      expect(screen.getByTestId('category-weapon')).toBeInTheDocument();
    });
  });

  describe('selection interaction', () => {
    it('allows changing a selection', async () => {
      const user = userEvent.setup();
      const { mockUpdate } = renderEquipmentStep({ class: mockFighter });

      // Make initial selections
      await user.click(screen.getByTestId('choice-0-option-0'));
      await user.click(screen.getByTestId('choice-1-option-0'));

      // Change first selection
      await user.click(screen.getByTestId('choice-0-option-1'));

      // Should update with new equipment
      const lastCall = mockUpdate.mock.calls[mockUpdate.mock.calls.length - 1][0];
      expect(lastCall.equipment).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Leather Armor' }),
        ])
      );
    });
  });
});
