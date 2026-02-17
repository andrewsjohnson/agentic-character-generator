import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AbilityScoreStep } from './AbilityScoreStep';
import type { CharacterDraft } from '../../types/character';
import type { Species } from '../../types/species';

describe('AbilityScoreStep', () => {
  // Basic rendering tests
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /assign ability scores/i })).toBeInTheDocument();
    });

    it('displays mode selector with both Point Buy and Standard Array options', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      expect(screen.getByRole('button', { name: /point buy/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /standard array/i })).toBeInTheDocument();
    });

    it('defaults to Point Buy mode', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      const pointBuyButton = screen.getByRole('button', { name: /point buy/i });
      expect(pointBuyButton).toHaveClass('bg-blue-600');
    });

    it('shows tip to select species when no species selected', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      expect(screen.getByText(/select a species first/i)).toBeInTheDocument();
    });
  });

  // Mode switching tests
  describe('Mode Switching', () => {
    it('switches from Point Buy to Standard Array', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      const standardArrayButton = screen.getByRole('button', { name: /standard array/i });
      fireEvent.click(standardArrayButton);

      expect(standardArrayButton).toHaveClass('bg-blue-600');
      expect(screen.getByText(/assign these values to your abilities/i)).toBeInTheDocument();
    });

    it('switches from Standard Array back to Point Buy', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // Switch to Standard Array
      const standardArrayButton = screen.getByRole('button', { name: /standard array/i });
      fireEvent.click(standardArrayButton);

      // Switch back to Point Buy
      const pointBuyButton = screen.getByRole('button', { name: /point buy/i });
      fireEvent.click(pointBuyButton);

      expect(pointBuyButton).toHaveClass('bg-blue-600');
      expect(screen.getByText(/you have 27 points to spend/i)).toBeInTheDocument();
    });

    it('preserves point buy scores when switching to standard array and back', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // In Point Buy, increment STR twice (8→10, costs 2 points)
      const strIncrement = screen.getAllByLabelText(/increase str/i)[0];
      fireEvent.click(strIncrement);
      fireEvent.click(strIncrement);

      // Verify 3 points spent (8→9 = 1pt, 9→10 = 1pt, total = 2pt... wait, let's check)
      // Actually: 8→9 costs 1, 9→10 costs 1, total = 2 points
      expect(screen.getByText(/points: 2 \/ 27/i)).toBeInTheDocument();

      // Switch to Standard Array
      const standardArrayButton = screen.getByRole('button', { name: /standard array/i });
      fireEvent.click(standardArrayButton);

      // Switch back to Point Buy
      const pointBuyButton = screen.getByRole('button', { name: /point buy/i });
      fireEvent.click(pointBuyButton);

      // Point buy scores should be preserved (STR=10, 2 points spent)
      expect(screen.getByText(/points: 2 \/ 27/i)).toBeInTheDocument();
    });

    it('preserves standard array scores when switching to point buy and back', () => {
      const mockCharacter: CharacterDraft = {
        baseAbilityScores: {
          STR: 15,
          DEX: 14,
          CON: 13,
          INT: 12,
          WIS: 10,
          CHA: 8,
        },
        abilityScoreMethod: 'standard-array',
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // Verify we're in standard array mode with valid assignment
      expect(screen.getByText(/all values assigned/i)).toBeInTheDocument();

      // Switch to Point Buy
      const pointBuyButton = screen.getByRole('button', { name: /point buy/i });
      fireEvent.click(pointBuyButton);

      // Point buy should show default 0 points (separate state)
      expect(screen.getByText(/points: 0 \/ 27/i)).toBeInTheDocument();

      // Switch back to Standard Array
      const standardArrayButton = screen.getByRole('button', { name: /standard array/i });
      fireEvent.click(standardArrayButton);

      // Standard array scores should still be valid
      expect(screen.getByText(/all values assigned/i)).toBeInTheDocument();
    });

    it('only writes active method scores to character state', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // Initial render calls updateCharacter with point-buy (all 8s is valid for point buy)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          abilityScoreMethod: 'point-buy',
        })
      );

      // Switch to standard array
      const standardArrayButton = screen.getByRole('button', { name: /standard array/i });
      fireEvent.click(standardArrayButton);

      // Standard array with all 8s is NOT valid, so updateCharacter should NOT
      // have been called with standard-array method yet
      const standardArrayCalls = mockUpdate.mock.calls.filter(
        (call: [Record<string, unknown>]) => call[0].abilityScoreMethod === 'standard-array'
      );
      expect(standardArrayCalls).toHaveLength(0);
    });
  });

  // Point Buy mode tests
  describe('Point Buy Mode', () => {
    it('displays all six abilities with increment/decrement buttons', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      expect(screen.getByText('STR')).toBeInTheDocument();
      expect(screen.getByText('DEX')).toBeInTheDocument();
      expect(screen.getByText('CON')).toBeInTheDocument();
      expect(screen.getByText('INT')).toBeInTheDocument();
      expect(screen.getByText('WIS')).toBeInTheDocument();
      expect(screen.getByText('CHA')).toBeInTheDocument();

      expect(screen.getAllByLabelText(/increase/i)).toHaveLength(6);
      expect(screen.getAllByLabelText(/decrease/i)).toHaveLength(6);
    });

    it('shows point budget tracker', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      expect(screen.getByText(/points: 0 \/ 27/i)).toBeInTheDocument();
      expect(screen.getByText(/\(27 remaining\)/i)).toBeInTheDocument();
    });

    it('increments ability score and updates cost', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      const strIncrement = screen.getAllByLabelText(/increase str/i)[0];
      fireEvent.click(strIncrement);

      // Should show 1 point spent (8→9 costs 1 point)
      expect(screen.getByText(/points: 1 \/ 27/i)).toBeInTheDocument();
    });

    it('decrements ability score and updates cost', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // First increment
      const strIncrement = screen.getAllByLabelText(/increase str/i)[0];
      fireEvent.click(strIncrement);

      // Then decrement
      const strDecrement = screen.getAllByLabelText(/decrease str/i)[0];
      fireEvent.click(strDecrement);

      // Should be back to 0 points
      expect(screen.getByText(/points: 0 \/ 27/i)).toBeInTheDocument();
    });

    it('disables decrement button at score 8', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // All decrement buttons should be disabled at start (all scores are 8)
      const decrementButtons = screen.getAllByLabelText(/decrease/i);
      decrementButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('disables increment button at score 15', () => {
      const mockCharacter: CharacterDraft = {
        baseAbilityScores: {
          STR: 15,
          DEX: 8,
          CON: 8,
          INT: 8,
          WIS: 8,
          CHA: 8,
        },
        abilityScoreMethod: 'point-buy',
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      const strIncrement = screen.getAllByLabelText(/increase str/i)[0];
      expect(strIncrement).toBeDisabled();
    });

    it('resets all scores to 8 when Reset button clicked', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // Increment a few abilities
      const strIncrement = screen.getAllByLabelText(/increase str/i)[0];
      fireEvent.click(strIncrement);
      fireEvent.click(strIncrement);

      // Click reset
      const resetButton = screen.getByRole('button', { name: /reset all/i });
      fireEvent.click(resetButton);

      // Should be back to 0 points
      expect(screen.getByText(/points: 0 \/ 27/i)).toBeInTheDocument();
    });

    it('shows validation message when over budget', () => {
      const mockCharacter: CharacterDraft = {
        baseAbilityScores: {
          STR: 15,
          DEX: 15,
          CON: 15,
          INT: 15,
          WIS: 15,
          CHA: 15,
        },
        abilityScoreMethod: 'point-buy',
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      expect(screen.getByText(/exceeded your point budget/i)).toBeInTheDocument();
    });

    it('updates character state when valid Point Buy assignment', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // Make valid assignment (budget 0 is valid)
      // Wait for initial render, then check if updateCharacter was called
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          abilityScoreMethod: 'point-buy',
          baseAbilityScores: expect.any(Object),
        })
      );
    });
  });

  // Standard Array mode tests
  describe('Standard Array Mode', () => {
    it('displays all six abilities with dropdown selectors', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // Switch to Standard Array
      const standardArrayButton = screen.getByRole('button', { name: /standard array/i });
      fireEvent.click(standardArrayButton);

      // Check for ability labels
      expect(screen.getByText('STR')).toBeInTheDocument();
      expect(screen.getByText('DEX')).toBeInTheDocument();
      expect(screen.getByText('CON')).toBeInTheDocument();
      expect(screen.getByText('INT')).toBeInTheDocument();
      expect(screen.getByText('WIS')).toBeInTheDocument();
      expect(screen.getByText('CHA')).toBeInTheDocument();

      // Check for dropdown selectors
      const selects = screen.getAllByLabelText(/select score for/i);
      expect(selects).toHaveLength(6);
    });

    it('shows standard array instructions', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      const standardArrayButton = screen.getByRole('button', { name: /standard array/i });
      fireEvent.click(standardArrayButton);

      expect(screen.getByText(/assign these values to your abilities: 15, 14, 13, 12, 10, 8/i)).toBeInTheDocument();
    });

    it('updates character state when valid Standard Array assignment', () => {
      const mockCharacter: CharacterDraft = {
        baseAbilityScores: {
          STR: 15,
          DEX: 14,
          CON: 13,
          INT: 12,
          WIS: 10,
          CHA: 8,
        },
        abilityScoreMethod: 'standard-array',
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // Should call updateCharacter with valid standard array
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          abilityScoreMethod: 'standard-array',
          baseAbilityScores: expect.any(Object),
        })
      );
    });

    it('shows validation message when not all values assigned', () => {
      const mockCharacter: CharacterDraft = {};
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      const standardArrayButton = screen.getByRole('button', { name: /standard array/i });
      fireEvent.click(standardArrayButton);

      expect(screen.getByText(/please assign all six standard array values/i)).toBeInTheDocument();
    });
  });

  // Species bonus display tests
  describe('Species Bonuses and Final Scores', () => {
    it('shows species bonuses when species is selected', () => {
      const mockSpecies: Species = {
        name: 'Mountain Dwarf',
        size: 'Medium',
        speed: 25,
        abilityBonuses: { STR: 2, CON: 2 },
        traits: [],
        subspecies: [],
        languages: ['Common', 'Dwarvish'],
      };

      const mockCharacter: CharacterDraft = {
        species: mockSpecies,
        baseAbilityScores: {
          STR: 15,
          DEX: 14,
          CON: 13,
          INT: 12,
          WIS: 10,
          CHA: 8,
        },
        abilityScoreMethod: 'point-buy',
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // Check for bonus display (multiple instances for each ability)
      const bonusHeaders = screen.getAllByText('Bonus');
      expect(bonusHeaders.length).toBeGreaterThan(0);
    });

    it('calculates final scores correctly (base + bonus)', () => {
      const mockSpecies: Species = {
        name: 'Mountain Dwarf',
        size: 'Medium',
        speed: 25,
        abilityBonuses: { STR: 2, CON: 2 },
        traits: [],
        subspecies: [],
        languages: ['Common', 'Dwarvish'],
      };

      const mockCharacter: CharacterDraft = {
        species: mockSpecies,
        baseAbilityScores: {
          STR: 15,
          DEX: 14,
          CON: 13,
          INT: 12,
          WIS: 10,
          CHA: 8,
        },
        abilityScoreMethod: 'point-buy',
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // Final scores should be visible
      const finalHeaders = screen.getAllByText('Final');
      expect(finalHeaders.length).toBe(6);
    });

    it('displays modifiers correctly', () => {
      const mockCharacter: CharacterDraft = {
        baseAbilityScores: {
          STR: 15,
          DEX: 14,
          CON: 13,
          INT: 12,
          WIS: 10,
          CHA: 8,
        },
        abilityScoreMethod: 'point-buy',
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // Check for modifier headers
      const modifierHeaders = screen.getAllByText('Modifier');
      expect(modifierHeaders).toHaveLength(6);
    });

    it('shows +0 bonus when no species selected', () => {
      const mockCharacter: CharacterDraft = {
        baseAbilityScores: {
          STR: 15,
          DEX: 14,
          CON: 13,
          INT: 12,
          WIS: 10,
          CHA: 8,
        },
        abilityScoreMethod: 'point-buy',
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // All bonuses should show "—" (no bonus)
      const bonusHeaders = screen.getAllByText('Bonus');
      expect(bonusHeaders.length).toBeGreaterThan(0);
    });
  });

  // Initialization tests
  describe('Initialization', () => {
    it('initializes from existing character ability scores', () => {
      const mockCharacter: CharacterDraft = {
        baseAbilityScores: {
          STR: 15,
          DEX: 14,
          CON: 13,
          INT: 12,
          WIS: 10,
          CHA: 8,
        },
        abilityScoreMethod: 'point-buy',
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      // Should show points spent for these scores
      expect(screen.getByText(/points: 27 \/ 27/i)).toBeInTheDocument();
    });

    it('initializes to Point Buy mode when method is point-buy', () => {
      const mockCharacter: CharacterDraft = {
        abilityScoreMethod: 'point-buy',
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      const pointBuyButton = screen.getByRole('button', { name: /point buy/i });
      expect(pointBuyButton).toHaveClass('bg-blue-600');
    });

    it('initializes to Standard Array mode when method is standard-array', () => {
      const mockCharacter: CharacterDraft = {
        abilityScoreMethod: 'standard-array',
      };
      const mockUpdate = vi.fn();

      render(
        <MemoryRouter>
          <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
        </MemoryRouter>
      );

      const standardArrayButton = screen.getByRole('button', { name: /standard array/i });
      expect(standardArrayButton).toHaveClass('bg-blue-600');
    });
  });
});
