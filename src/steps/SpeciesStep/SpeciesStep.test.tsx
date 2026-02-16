import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { SpeciesStep, formatAbilityBonuses } from './SpeciesStep';
import speciesData from '../../data/races.json';
import type { Species } from '../../types/species';
import type { AbilityBonuses } from '../../types/ability';

describe('SpeciesStep', () => {
  it('renders all species from data file', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Check header
    expect(screen.getByText('Choose Your Species')).toBeInTheDocument();

    // Check that all 9 species are rendered
    (speciesData as Species[]).forEach((species) => {
      const buttons = screen.getAllByRole('button', { name: new RegExp(species.name, 'i') });
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('displays species details correctly', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Get the species grid
    const speciesGrid = container.querySelector('.grid') as HTMLElement;
    expect(speciesGrid).toBeInTheDocument();

    // Check Human card details
    const humanCard = within(speciesGrid).getByText('Human').closest('button');
    expect(humanCard).toHaveTextContent('Size: Medium');
    expect(humanCard).toHaveTextContent('Speed: 30 ft.');
    expect(humanCard).toHaveTextContent('0 traits');

    // Check Dwarf card details
    const dwarfCard = within(speciesGrid).getByText('Dwarf').closest('button');
    expect(dwarfCard).toHaveTextContent('Size: Medium');
    expect(dwarfCard).toHaveTextContent('Speed: 25 ft.');
    expect(dwarfCard).toHaveTextContent('5 traits');
  });

  it('updates character when species without subspecies is clicked', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Get species grid and find Human card
    const speciesGrid = container.querySelector('.grid') as HTMLElement;
    const humanCard = within(speciesGrid).getByText('Human').closest('button');
    fireEvent.click(humanCard!);

    // Should call updateCharacter with Human species and undefined subspecies
    expect(mockUpdate).toHaveBeenCalledWith({
      species: expect.objectContaining({ name: 'Human' }),
      subspecies: undefined,
    });
  });

  it('shows subspecies cards when species with subspecies is selected', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Subspecies section should not be visible initially
    expect(screen.queryByText('Choose Your Subspecies')).not.toBeInTheDocument();

    // Click Dwarf (has subspecies)
    const speciesGrid = container.querySelector('.grid') as HTMLElement;
    const dwarfCard = within(speciesGrid).getByText('Dwarf').closest('button');
    fireEvent.click(dwarfCard!);

    // Subspecies section should now be visible
    expect(screen.getByText('Choose Your Subspecies')).toBeInTheDocument();
    expect(screen.getByText('Hill Dwarf')).toBeInTheDocument();
  });

  it('does not update character when species with subspecies is clicked without selecting subspecies', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Dwarf (has subspecies)
    const speciesGrid = container.querySelector('.grid') as HTMLElement;
    const dwarfCard = within(speciesGrid).getByText('Dwarf').closest('button');
    fireEvent.click(dwarfCard!);

    // Should NOT have updated character yet (no subspecies selected)
    expect(mockUpdate).not.toHaveBeenCalled();

    // Subspecies section should now be visible
    const subspeciesHeaders = screen.queryAllByText(/Choose Your Subspecies/i);
    expect(subspeciesHeaders.length).toBeGreaterThan(0);
  });

  it('highlights selected species card', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />);

    const speciesGrid = container.querySelector('.grid') as HTMLElement;
    const humanCard = within(speciesGrid).getByText('Human').closest('button');
    const dwarfCard = within(speciesGrid).getByText('Dwarf').closest('button');

    // Initially no highlight
    expect(humanCard).toHaveClass('border-gray-300');
    expect(dwarfCard).toHaveClass('border-gray-300');

    // Click Human
    fireEvent.click(humanCard!);

    // Human should be highlighted
    expect(humanCard).toHaveClass('border-blue-600');
    expect(dwarfCard).toHaveClass('border-gray-300');
  });

  it('highlights selected subspecies card', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Elf (has High Elf subspecies)
    const speciesGrid = container.querySelector('.grid') as HTMLElement;
    const elfCard = within(speciesGrid).getByText('Elf').closest('button');
    fireEvent.click(elfCard!);

    const highElfCards = screen.getAllByText('High Elf');
    const highElfCard = highElfCards[0].closest('button');

    // Initially no highlight
    expect(highElfCard).toHaveClass('border-gray-300');

    // Click High Elf
    fireEvent.click(highElfCard!);

    // High Elf should be highlighted
    expect(highElfCard).toHaveClass('border-blue-600');
  });

  it('shows different subspecies when changing species', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />);

    const speciesGrid = container.querySelector('.grid') as HTMLElement;

    // Click Dwarf - has Hill Dwarf subspecies
    const dwarfCard = within(speciesGrid).getByText('Dwarf').closest('button');
    fireEvent.click(dwarfCard!);

    // Hill Dwarf should be visible
    expect(screen.getAllByText(/Hill Dwarf/i).length).toBeGreaterThan(0);

    // Click Elf - has High Elf subspecies
    const elfCard = within(speciesGrid).getByText('Elf').closest('button');
    fireEvent.click(elfCard!);

    // Should show Elf subspecies (High Elf)
    expect(screen.getAllByText(/High Elf/i).length).toBeGreaterThan(0);
  });

  it('initializes with character current species', () => {
    const mockCharacter = {
      species: {
        name: 'Tiefling',
        size: 'Medium' as const,
        speed: 30,
        traits: [
          { name: 'Darkvision', description: 'You can see in the dark.' },
        ],
        languages: ['Common', 'Infernal'],
        subspecies: [],
      },
    };
    const mockUpdate = vi.fn();

    const { container } = render(<SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Tiefling card should be highlighted
    const speciesGrid = container.querySelector('.grid') as HTMLElement;
    const tieflingCard = within(speciesGrid).getByText('Tiefling').closest('button');
    expect(tieflingCard).toHaveClass('border-blue-600');
  });

  it('initializes with character current species and subspecies', () => {
    const mockCharacter = {
      species: {
        name: 'Halfling',
        size: 'Small' as const,
        speed: 25,
        traits: [
          { name: 'Lucky', description: 'Reroll 1s on d20.' },
        ],
        languages: ['Common', 'Halfling'],
        subspecies: [
          {
            name: 'Lightfoot Halfling',
            traits: [
              { name: 'Naturally Stealthy', description: 'Hide behind larger creatures.' },
            ],
          },
        ],
      },
      subspecies: {
        name: 'Lightfoot Halfling',
        traits: [
          { name: 'Naturally Stealthy', description: 'Hide behind larger creatures.' },
        ],
      },
    };
    const mockUpdate = vi.fn();

    const { container } = render(<SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Halfling card should be highlighted
    const speciesGrid = container.querySelector('.grid') as HTMLElement;
    const halflingCard = within(speciesGrid).getByText('Halfling').closest('button');
    expect(halflingCard).toHaveClass('border-blue-600');

    // Subspecies section should be visible
    const subspeciesHeaders = screen.getAllByText('Choose Your Subspecies');
    expect(subspeciesHeaders.length).toBeGreaterThan(0);

    // Lightfoot Halfling card should be highlighted
    const lightfootButtons = screen.getAllByRole('button', { name: /Lightfoot Halfling/i });
    expect(lightfootButtons[0]).toHaveClass('border-blue-600');
  });

  it('handles species with no traits (Human)', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />);

    const speciesGrid = container.querySelector('.grid') as HTMLElement;
    const humanCard = within(speciesGrid).getByText('Human').closest('button');
    expect(humanCard).toHaveTextContent('0 traits');
  });

  it('displays trait count with correct singular/plural form', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />);

    const speciesGrid = container.querySelector('.grid') as HTMLElement;

    // Human has 0 traits
    const humanCard = within(speciesGrid).getByText('Human').closest('button');
    expect(humanCard).toHaveTextContent('0 traits');

    // Dragonborn has 3 traits
    const dragonbornCard = within(speciesGrid).getByText('Dragonborn').closest('button');
    expect(dragonbornCard).toHaveTextContent('3 traits');

    // Click Halfling to see subspecies
    const halflingCard = within(speciesGrid).getByText('Halfling').closest('button');
    fireEvent.click(halflingCard!);

    // Lightfoot Halfling has 1 additional trait
    const lightfootCards = screen.getAllByText('Lightfoot Halfling');
    const lightfootCard = lightfootCards[0].closest('button');
    expect(lightfootCard).toHaveTextContent('1 additional trait');
  });
});

describe('formatAbilityBonuses', () => {
  it('returns empty string for undefined bonuses', () => {
    expect(formatAbilityBonuses(undefined)).toBe('');
  });

  it('returns empty string for empty bonuses object', () => {
    expect(formatAbilityBonuses({} as AbilityBonuses)).toBe('');
  });

  it('formats single ability bonus correctly', () => {
    const bonuses: AbilityBonuses = { CON: 2 };
    expect(formatAbilityBonuses(bonuses)).toBe('+2 CON');
  });

  it('formats multiple ability bonuses correctly', () => {
    const bonuses: AbilityBonuses = { CON: 2, WIS: 1 };
    expect(formatAbilityBonuses(bonuses)).toBe('+2 CON, +1 WIS');
  });

  it('formats all six ability bonuses in canonical order', () => {
    const bonuses: AbilityBonuses = {
      STR: 1,
      DEX: 1,
      CON: 1,
      INT: 1,
      WIS: 1,
      CHA: 1,
    };
    expect(formatAbilityBonuses(bonuses)).toBe(
      '+1 STR, +1 DEX, +1 CON, +1 INT, +1 WIS, +1 CHA'
    );
  });

  it('ignores zero bonuses', () => {
    const bonuses: AbilityBonuses = { CON: 2, WIS: 0 };
    expect(formatAbilityBonuses(bonuses)).toBe('+2 CON');
  });

  it('sorts abilities in canonical order (STR, DEX, CON, INT, WIS, CHA)', () => {
    const bonuses: AbilityBonuses = { CHA: 1, STR: 2, INT: 1 };
    expect(formatAbilityBonuses(bonuses)).toBe('+2 STR, +1 INT, +1 CHA');
  });

  it('does not display bonuses line in UI when no bonuses exist', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />);

    const speciesGrid = container.querySelector('.grid') as HTMLElement;

    // Check that Human card does not have "Bonuses:" text
    const humanCard = within(speciesGrid).getByText('Human').closest('button');
    expect(humanCard).not.toHaveTextContent('Bonuses:');

    // Check that Dwarf card does not have "Bonuses:" text
    const dwarfCard = within(speciesGrid).getByText('Dwarf').closest('button');
    expect(dwarfCard).not.toHaveTextContent('Bonuses:');
  });
});
