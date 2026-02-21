import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BackgroundStep } from './BackgroundStep';
import type { CharacterDraft } from '../../types/character';
import backgroundsData from '../../data/backgrounds.json';
import type { Background } from '../../types/background';
import type { AvailableContent } from '../../types/expansion-pack';

const backgrounds = backgroundsData as unknown as Background[];

// Base available content (no expansion packs enabled)
const baseAvailableContent: AvailableContent = {
  species: [{ source: 'Base Content', items: [] }],
  classes: [{ source: 'Base Content', items: [] }],
  backgrounds: [{ source: 'Base Content', items: backgrounds }],
};

describe('BackgroundStep', () => {
  it('renders without crashing', () => {
    const mockCharacter: CharacterDraft = {};
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
      </MemoryRouter>
    );

    expect(screen.getByText(/choose your background/i)).toBeInTheDocument();
  });

  describe('Rendering', () => {
    it('renders all four backgrounds from data', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Check all four backgrounds are rendered
      expect(screen.getByText('Acolyte')).toBeInTheDocument();
      expect(screen.getByText('Criminal')).toBeInTheDocument();
      expect(screen.getByText('Sage')).toBeInTheDocument();
      expect(screen.getByText('Soldier')).toBeInTheDocument();
    });

    it('displays background names and skill proficiencies on cards', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Check Acolyte card shows skills
      expect(screen.getByText(/Insight, Religion/)).toBeInTheDocument();

      // Check Criminal card shows skills
      expect(screen.getByText(/Sleight of Hand, Stealth/)).toBeInTheDocument();
    });

    it('shows detail panel when background selected', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Detail panel should not be visible initially
      expect(screen.queryByTestId('background-detail-panel')).not.toBeInTheDocument();

      // Click Acolyte card
      const acolyteCard = screen.getByTestId('background-card-acolyte');
      fireEvent.click(acolyteCard);

      // Detail panel should now be visible
      expect(screen.getByTestId('background-detail-panel')).toBeInTheDocument();
      expect(screen.getByText(/Shelter of the Faithful/)).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('clicking a background card selects it', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      const acolyteCard = screen.getByTestId('background-card-acolyte');

      // Check card is not selected initially
      expect(acolyteCard).toHaveClass('border-gray-300');

      fireEvent.click(acolyteCard);

      // Check card is now selected
      expect(acolyteCard).toHaveClass('border-blue-600');
    });

    it('updateCharacter called with selected background when no conflicts', () => {
      const mockCharacter: CharacterDraft = {
        skillProficiencies: [] // No class skills, so no conflicts
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      const acolyteCard = screen.getByTestId('background-card-acolyte');
      fireEvent.click(acolyteCard);

      expect(mockUpdate).toHaveBeenCalledWith({
        background: expect.objectContaining({
          name: 'Acolyte',
          skillProficiencies: ['Insight', 'Religion']
        }),
        skillProficiencies: ['Insight', 'Religion'],
        backgroundSkillReplacements: undefined
      });
    });

    it('selected card gets highlighted styling', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      const acolyteCard = screen.getByTestId('background-card-acolyte');
      const criminalCard = screen.getByTestId('background-card-criminal');

      // Click Acolyte
      fireEvent.click(acolyteCard);
      expect(acolyteCard).toHaveClass('border-blue-600', 'bg-blue-50');
      expect(criminalCard).toHaveClass('border-gray-300', 'bg-white');

      // Click Criminal
      fireEvent.click(criminalCard);
      expect(criminalCard).toHaveClass('border-blue-600', 'bg-blue-50');
    });
  });

  describe('Skill Conflicts', () => {
    it('detects single skill conflict', () => {
      // Rogue has Stealth, Criminal also has Stealth
      const mockCharacter: CharacterDraft = {
        skillProficiencies: ['Stealth', 'Acrobatics']
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click Criminal (has Stealth)
      const criminalCard = screen.getByTestId('background-card-criminal');
      fireEvent.click(criminalCard);

      // Should show conflict notice
      expect(screen.getByTestId('skill-conflict-notice')).toBeInTheDocument();
      expect(screen.getByText(/skill conflicts detected/i)).toBeInTheDocument();

      // Should call updateCharacter with background but without resolved replacements
      expect(mockUpdate).toHaveBeenCalledWith({
        background: expect.objectContaining({ name: 'Criminal' }),
        backgroundSkillReplacements: undefined
      });
    });

    it('detects multiple skill conflicts', () => {
      // Character has Athletics and Intimidation, Soldier also has both
      const mockCharacter: CharacterDraft = {
        skillProficiencies: ['Athletics', 'Intimidation']
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click Soldier (has Athletics and Intimidation)
      const soldierCard = screen.getByTestId('background-card-soldier');
      fireEvent.click(soldierCard);

      // Should show conflict notice
      expect(screen.getByTestId('skill-conflict-notice')).toBeInTheDocument();

      // Should show two replacement selects
      expect(screen.getByTestId('replacement-select-0')).toBeInTheDocument();
      expect(screen.getByTestId('replacement-select-1')).toBeInTheDocument();
    });

    it('shows conflict resolution UI when conflicts exist', () => {
      const mockCharacter: CharacterDraft = {
        skillProficiencies: ['Stealth']
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click Criminal (has Stealth)
      const criminalCard = screen.getByTestId('background-card-criminal');
      fireEvent.click(criminalCard);

      // Should show conflict resolution UI
      expect(screen.getByTestId('skill-conflict-notice')).toBeInTheDocument();
      expect(screen.getByTestId('replacement-select-0')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-replacements-button')).toBeInTheDocument();
    });

    it('does NOT show conflict UI when no conflicts', () => {
      const mockCharacter: CharacterDraft = {
        skillProficiencies: ['Perception', 'Investigation']
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click Acolyte (has Insight and Religion, no conflict)
      const acolyteCard = screen.getByTestId('background-card-acolyte');
      fireEvent.click(acolyteCard);

      // Should NOT show conflict notice
      expect(screen.queryByTestId('skill-conflict-notice')).not.toBeInTheDocument();
    });
  });

  describe('Skill Replacement', () => {
    it('replacement skill selector shows available skills only', () => {
      const mockCharacter: CharacterDraft = {
        skillProficiencies: ['Stealth']
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click Criminal (has Stealth and Sleight of Hand)
      const criminalCard = screen.getByTestId('background-card-criminal');
      fireEvent.click(criminalCard);

      // Get the replacement select
      const select = screen.getByTestId('replacement-select-0') as HTMLSelectElement;

      // Should have options (need to check that unavailable skills are excluded)
      const options = Array.from(select.options).map(opt => opt.value).filter(v => v !== '');

      // Should NOT include Stealth (conflicting skill)
      expect(options).not.toContain('Stealth');

      // Should NOT include Sleight of Hand (non-conflicting background skill)
      expect(options).not.toContain('Sleight of Hand');

      // Should include other skills like Athletics
      expect(options).toContain('Athletics');
    });

    it('confirm button disabled until all conflicts resolved', () => {
      const mockCharacter: CharacterDraft = {
        skillProficiencies: ['Athletics', 'Intimidation']
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click Soldier (conflicts with both skills)
      const soldierCard = screen.getByTestId('background-card-soldier');
      fireEvent.click(soldierCard);

      // Confirm button should be disabled
      const confirmButton = screen.getByTestId('confirm-replacements-button');
      expect(confirmButton).toBeDisabled();

      // Select first replacement
      const select0 = screen.getByTestId('replacement-select-0') as HTMLSelectElement;
      fireEvent.change(select0, { target: { value: 'Perception' } });

      // Still disabled (need to select second replacement)
      expect(confirmButton).toBeDisabled();

      // Select second replacement
      const select1 = screen.getByTestId('replacement-select-1') as HTMLSelectElement;
      fireEvent.change(select1, { target: { value: 'Survival' } });

      // Now should be enabled
      expect(confirmButton).not.toBeDisabled();
    });

    it('updateCharacter called with background, merged skills, and replacements after resolution', () => {
      const mockCharacter: CharacterDraft = {
        skillProficiencies: ['Stealth']
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click Criminal (has Stealth and Sleight of Hand)
      const criminalCard = screen.getByTestId('background-card-criminal');
      fireEvent.click(criminalCard);

      // First call sets background with unresolved conflicts
      expect(mockUpdate).toHaveBeenCalledWith({
        background: expect.objectContaining({ name: 'Criminal' }),
        backgroundSkillReplacements: undefined
      });

      // Select replacement skill
      const select = screen.getByTestId('replacement-select-0') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'Athletics' } });

      // Click confirm
      const confirmButton = screen.getByTestId('confirm-replacements-button');
      fireEvent.click(confirmButton);

      // Second call resolves conflicts with:
      // - class skills: ['Stealth']
      // - non-conflicting background skills: ['Sleight of Hand']
      // - replacement skills: ['Athletics']
      // - backgroundSkillReplacements mapping
      expect(mockUpdate).toHaveBeenLastCalledWith({
        background: expect.objectContaining({
          name: 'Criminal'
        }),
        skillProficiencies: ['Stealth', 'Sleight of Hand', 'Athletics'],
        backgroundSkillReplacements: { 'Stealth': 'Athletics' }
      });
    });
  });

  describe('Edge Cases', () => {
    it('no class selected: background selectable, no conflicts shown', () => {
      const mockCharacter: CharacterDraft = {
        // No class, no skillProficiencies
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click any background
      const acolyteCard = screen.getByTestId('background-card-acolyte');
      fireEvent.click(acolyteCard);

      // Should NOT show conflict notice (no class skills to conflict with)
      expect(screen.queryByTestId('skill-conflict-notice')).not.toBeInTheDocument();

      // Should call updateCharacter
      expect(mockUpdate).toHaveBeenCalledWith({
        background: expect.objectContaining({ name: 'Acolyte' }),
        skillProficiencies: ['Insight', 'Religion'],
        backgroundSkillReplacements: undefined
      });
    });

    it('no class skills chosen yet: background selectable, no conflicts', () => {
      const mockCharacter: CharacterDraft = {
        skillProficiencies: [] // Empty array
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click any background
      const criminalCard = screen.getByTestId('background-card-criminal');
      fireEvent.click(criminalCard);

      // Should NOT show conflict notice
      expect(screen.queryByTestId('skill-conflict-notice')).not.toBeInTheDocument();

      // Should call updateCharacter
      expect(mockUpdate).toHaveBeenCalledWith({
        background: expect.objectContaining({ name: 'Criminal' }),
        skillProficiencies: ['Sleight of Hand', 'Stealth'],
        backgroundSkillReplacements: undefined
      });
    });

    it('re-selecting different background clears conflict state', async () => {
      const mockCharacter: CharacterDraft = {
        skillProficiencies: ['Stealth']
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click Criminal (has conflict with Stealth)
      const criminalCard = screen.getByTestId('background-card-criminal');
      fireEvent.click(criminalCard);

      // Should show conflict UI
      expect(screen.getByTestId('skill-conflict-notice')).toBeInTheDocument();

      // Select a replacement
      const select = screen.getByTestId('replacement-select-0') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'Athletics' } });

      // Now click Acolyte (no conflicts)
      const acolyteCard = screen.getByTestId('background-card-acolyte');
      fireEvent.click(acolyteCard);

      // Conflict UI should be gone
      await waitFor(() => {
        expect(screen.queryByTestId('skill-conflict-notice')).not.toBeInTheDocument();
      });

      // Click Criminal again
      fireEvent.click(criminalCard);

      // Conflict UI should be back, but replacement should be reset (empty)
      expect(screen.getByTestId('skill-conflict-notice')).toBeInTheDocument();
      const newSelect = screen.getByTestId('replacement-select-0') as HTMLSelectElement;
      expect(newSelect.value).toBe('');
    });
  });

  describe('Integration with Character State', () => {
    it('component initializes from character.background if set', () => {
      const mockCharacter: CharacterDraft = {
        background: backgrounds[0] // Acolyte
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Acolyte card should be selected
      const acolyteCard = screen.getByTestId('background-card-acolyte');
      expect(acolyteCard).toHaveClass('border-blue-600', 'bg-blue-50');

      // Detail panel should be showing
      expect(screen.getByTestId('background-detail-panel')).toBeInTheDocument();
    });

    it('equipment list formatted correctly with quantities', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click Acolyte
      const acolyteCard = screen.getByTestId('background-card-acolyte');
      fireEvent.click(acolyteCard);

      // Check equipment formatting
      // Acolyte has "Parchment" with quantity 10
      expect(screen.getByText('Parchment (x10)')).toBeInTheDocument();

      // Check single quantity items don't show (x1)
      expect(screen.getByText('Holy Symbol (Amulet)')).toBeInTheDocument();
      expect(screen.queryByText('Holy Symbol (Amulet) (x1)')).not.toBeInTheDocument();
    });
  });

  describe('Skill Conflict Persistence', () => {
    it('conflict resolution persists after clicking Confirm Selection', () => {
      const mockCharacter: CharacterDraft = {
        skillProficiencies: ['Stealth']
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click Criminal (has Stealth conflict)
      fireEvent.click(screen.getByTestId('background-card-criminal'));

      // Select replacement
      const select = screen.getByTestId('replacement-select-0') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'Athletics' } });

      // Confirm
      fireEvent.click(screen.getByTestId('confirm-replacements-button'));

      // Should persist backgroundSkillReplacements in the updateCharacter call
      expect(mockUpdate).toHaveBeenLastCalledWith(
        expect.objectContaining({
          backgroundSkillReplacements: { 'Stealth': 'Athletics' },
          skillProficiencies: ['Stealth', 'Sleight of Hand', 'Athletics']
        })
      );
    });

    it('switching backgrounds clears previous conflict resolutions', () => {
      const mockCharacter: CharacterDraft = {
        skillProficiencies: ['Stealth']
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click Criminal (has Stealth conflict)
      fireEvent.click(screen.getByTestId('background-card-criminal'));

      // Resolve the conflict
      const select = screen.getByTestId('replacement-select-0') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'Athletics' } });
      fireEvent.click(screen.getByTestId('confirm-replacements-button'));

      // Switch to Acolyte (no conflicts)
      fireEvent.click(screen.getByTestId('background-card-acolyte'));

      // Should clear backgroundSkillReplacements
      expect(mockUpdate).toHaveBeenLastCalledWith(
        expect.objectContaining({
          background: expect.objectContaining({ name: 'Acolyte' }),
          backgroundSkillReplacements: undefined
        })
      );
    });

    it('conflict resolution restored when component re-mounts with character state', () => {
      // Simulate returning to the BackgroundStep with previously resolved conflicts
      const criminal = backgrounds.find(b => b.name === 'Criminal')!;
      const mockCharacter: CharacterDraft = {
        background: criminal,
        skillProficiencies: ['Stealth', 'Sleight of Hand', 'Athletics'],
        backgroundSkillReplacements: { 'Stealth': 'Athletics' }
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Criminal should be selected
      expect(screen.getByTestId('background-card-criminal')).toHaveClass('border-blue-600');

      // Conflict notice should show since Stealth is in both class and background skills
      // The replacement select should show the previously selected replacement
      expect(screen.getByTestId('skill-conflict-notice')).toBeInTheDocument();
      const select = screen.getByTestId('replacement-select-0') as HTMLSelectElement;
      expect(select.value).toBe('Athletics');
    });
  });

  describe('Confirmed State UI Feedback', () => {
    it('conflict panel transitions from yellow to green after confirmation', () => {
      const criminal = backgrounds.find(b => b.name === 'Criminal')!;
      const initialCharacter: CharacterDraft = {
        background: criminal,
        skillProficiencies: ['Stealth'],
        backgroundSkillReplacements: undefined
      };
      const mockUpdate = vi.fn();

      const { rerender } = render(
        <MemoryRouter>
          <BackgroundStep character={initialCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Panel should initially be yellow
      const notice = screen.getByTestId('skill-conflict-notice');
      expect(notice).toHaveClass('bg-yellow-50');

      // Select a replacement and click confirm
      const select = screen.getByTestId('replacement-select-0') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'Athletics' } });
      expect(screen.getByTestId('confirm-replacements-button')).toHaveTextContent('Confirm Selection');
      fireEvent.click(screen.getByTestId('confirm-replacements-button'));

      // Simulate the parent updating character state after confirmation
      const confirmedCharacter: CharacterDraft = {
        background: criminal,
        skillProficiencies: ['Stealth', 'Sleight of Hand', 'Athletics'],
        backgroundSkillReplacements: { 'Stealth': 'Athletics' }
      };

      rerender(
        <MemoryRouter>
          <BackgroundStep character={confirmedCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Panel should now be green
      expect(notice).toHaveClass('bg-green-50', 'border-green-200');
      expect(notice).not.toHaveClass('bg-yellow-50');

      // Button should show confirmed text and be disabled
      expect(screen.getByTestId('confirm-replacements-button')).toHaveTextContent('Selection Confirmed');
      expect(screen.getByTestId('confirm-replacements-button')).toBeDisabled();
    });

    it('panel reverts to yellow and button re-enables when a dropdown changes after confirmation', () => {
      const criminal = backgrounds.find(b => b.name === 'Criminal')!;
      const mockCharacter: CharacterDraft = {
        background: criminal,
        skillProficiencies: ['Stealth', 'Sleight of Hand', 'Athletics'],
        backgroundSkillReplacements: { 'Stealth': 'Athletics' }
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Panel should initially be green (confirmed state)
      const notice = screen.getByTestId('skill-conflict-notice');
      expect(notice).toHaveClass('bg-green-50');
      expect(screen.getByTestId('confirm-replacements-button')).toBeDisabled();

      // Change the dropdown to a different skill
      const select = screen.getByTestId('replacement-select-0') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'Perception' } });

      // Panel should revert to yellow (unconfirmed change)
      expect(notice).toHaveClass('bg-yellow-50');
      expect(notice).not.toHaveClass('bg-green-50');

      // Button should be re-enabled
      const confirmButton = screen.getByTestId('confirm-replacements-button');
      expect(confirmButton).toHaveTextContent('Confirm Selection');
      expect(confirmButton).not.toBeDisabled();
    });

    it('confirm button is disabled when initialized with already-confirmed replacements', () => {
      const criminal = backgrounds.find(b => b.name === 'Criminal')!;
      const mockCharacter: CharacterDraft = {
        background: criminal,
        skillProficiencies: ['Stealth', 'Sleight of Hand', 'Athletics'],
        backgroundSkillReplacements: { 'Stealth': 'Athletics' }
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      const confirmButton = screen.getByTestId('confirm-replacements-button');
      expect(confirmButton).toBeDisabled();
      expect(confirmButton).toHaveTextContent('Selection Confirmed');
    });
  });

  describe('Detail Panel Content', () => {
    it('displays all background information in detail panel', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // Click Acolyte
      const acolyteCard = screen.getByTestId('background-card-acolyte');
      fireEvent.click(acolyteCard);

      const detailPanel = screen.getByTestId('background-detail-panel');

      // Check feature
      expect(detailPanel).toHaveTextContent('Shelter of the Faithful');
      expect(screen.getByText(/command the respect of those who share your faith/i)).toBeInTheDocument();

      // Check origin feat section
      expect(detailPanel).toHaveTextContent('Origin Feat');

      // Check tool proficiency section
      expect(detailPanel).toHaveTextContent('Tool Proficiency');

      // Check ability options
      expect(detailPanel).toHaveTextContent('INT, WIS, CHA');

      // Check skills
      expect(detailPanel).toHaveTextContent('Insight, Religion');

      // Check equipment section exists
      expect(detailPanel).toHaveTextContent('Starting Equipment');
      expect(detailPanel).toHaveTextContent('Parchment (x10)');
    });
  });

  describe('Expansion Pack Grouping', () => {
    it('renders section headers when multiple content groups are present', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      const expansionBackground: Background = {
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

      const contentWithExpansion: AvailableContent = {
        species: [{ source: 'Base Content', items: [] }],
        classes: [{ source: 'Base Content', items: [] }],
        backgrounds: [
          { source: 'Base Content', items: backgrounds },
          { source: 'Mythic Realms', items: [expansionBackground] },
        ],
      };

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={contentWithExpansion} />
        </MemoryRouter>
      );

      // Section headers should appear
      expect(screen.getByText('Base Content')).toBeInTheDocument();
      expect(screen.getByText('Mythic Realms')).toBeInTheDocument();

      // Expansion background card should be present
      expect(screen.getByTestId('background-card-far traveler')).toBeInTheDocument();
    });

    it('does not render section headers with only base content', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} availableContent={baseAvailableContent} />
        </MemoryRouter>
      );

      // No section headers with a single group
      expect(screen.queryByText('Base Content')).not.toBeInTheDocument();
    });
  });
});
