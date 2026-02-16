import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ClassStep } from './ClassStep';
import classesData from '../../data/classes.json';
import type { CharacterClass } from '../../types/class';

describe('ClassStep', () => {
  it('renders all classes from data file', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Check header
    expect(screen.getByText('Choose Your Class')).toBeInTheDocument();

    // Check that all 12 classes are rendered
    (classesData as CharacterClass[]).forEach((charClass) => {
      const buttons = screen.getAllByRole('button', { name: new RegExp(charClass.name, 'i') });
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('displays class details correctly', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Get the class grid
    const classGrid = container.querySelector('.grid') as HTMLElement;
    expect(classGrid).toBeInTheDocument();

    // Check Fighter card details
    const fighterCard = within(classGrid).getByText('Fighter').closest('button');
    expect(fighterCard).toHaveTextContent('Hit Die: d10');
    expect(fighterCard).toHaveTextContent('Primary: STR, DEX');
    expect(fighterCard).toHaveTextContent('Saves: STR, CON');

    // Check Wizard card details
    const wizardCard = within(classGrid).getByText('Wizard').closest('button');
    expect(wizardCard).toHaveTextContent('Hit Die: d6');
    expect(wizardCard).toHaveTextContent('Primary: INT');
    expect(wizardCard).toHaveTextContent('Saves: INT, WIS');
  });

  it('updates character when class is clicked', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Get class grid and find Fighter card
    const classGrid = container.querySelector('.grid') as HTMLElement;
    const fighterCard = within(classGrid).getByText('Fighter').closest('button');
    fireEvent.click(fighterCard!);

    // Should call updateCharacter with Fighter class
    expect(mockUpdate).toHaveBeenCalledWith({
      class: expect.objectContaining({ name: 'Fighter' }),
    });
  });

  it('highlights selected class card', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    const classGrid = container.querySelector('.grid') as HTMLElement;
    const fighterCard = within(classGrid).getByText('Fighter').closest('button');
    const wizardCard = within(classGrid).getByText('Wizard').closest('button');

    // Initially no highlight
    expect(fighterCard).toHaveClass('border-gray-300');
    expect(wizardCard).toHaveClass('border-gray-300');

    // Click Fighter
    fireEvent.click(fighterCard!);

    // Fighter should be highlighted
    expect(fighterCard).toHaveClass('border-blue-600');
    expect(wizardCard).toHaveClass('border-gray-300');
  });

  it('shows detail panel when class is selected', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Detail panel should not be visible initially
    expect(screen.queryByText(/Details$/)).not.toBeInTheDocument();

    // Click Fighter
    const fighterCard = screen.getByRole('button', { name: /Fighter/i });
    fireEvent.click(fighterCard);

    // Detail panel should now be visible
    expect(screen.getByText('Fighter Details')).toBeInTheDocument();
  });

  it('displays proficiencies correctly in detail panel', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Fighter
    const fighterCard = screen.getByRole('button', { name: /Fighter/i });
    fireEvent.click(fighterCard);

    // Check proficiencies
    expect(screen.getByText(/Armor:/)).toBeInTheDocument();
    expect(screen.getByText(/light, medium, heavy, shields/)).toBeInTheDocument();
    expect(screen.getByText(/Weapons:/)).toBeInTheDocument();
    expect(screen.getByText(/Saving Throws:/)).toBeInTheDocument();
  });

  it('displays "None" for classes with no armor proficiencies', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Monk (has no armor proficiencies)
    const monkCard = screen.getByRole('button', { name: /^Monk/i });
    fireEvent.click(monkCard);

    // Should show "None" for armor
    const armorText = screen.getByText(/Armor:/);
    expect(armorText.parentElement).toHaveTextContent('Armor: None');
  });

  it('displays skill choices correctly', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Fighter (2 skill choices)
    const fighterCard = screen.getByRole('button', { name: /Fighter/i });
    fireEvent.click(fighterCard);

    // Check skill choices
    expect(screen.getByText(/Choose 2 from:/)).toBeInTheDocument();
    expect(screen.getByText(/Acrobatics, Animal Handling, Athletics/)).toBeInTheDocument();
    expect(screen.getByText(/You will choose your skills in a later step/)).toBeInTheDocument();
  });

  it('displays features correctly', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Fighter
    const fighterCard = screen.getByRole('button', { name: /Fighter/i });
    fireEvent.click(fighterCard);

    // Check features
    expect(screen.getByText('Level 1 Features')).toBeInTheDocument();
    expect(screen.getByText('Fighting Style')).toBeInTheDocument();
    expect(screen.getByText('Second Wind')).toBeInTheDocument();
  });

  it('displays spellcasting info for caster classes', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Wizard (has spellcasting)
    const wizardCard = screen.getByRole('button', { name: /Wizard/i });
    fireEvent.click(wizardCard);

    // Check spellcasting section
    expect(screen.getByText('Spellcasting')).toBeInTheDocument();
    expect(screen.getByText(/Spellcasting Ability:/)).toBeInTheDocument();
    expect(screen.getByText(/INT/)).toBeInTheDocument();
    expect(screen.getByText(/Cantrips Known:/)).toBeInTheDocument();
    expect(screen.getByText(/Spell Slots \(Level 1\):/)).toBeInTheDocument();
  });

  it('does not display spellcasting section for non-caster classes', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Fighter (no spellcasting)
    const fighterCard = screen.getByRole('button', { name: /Fighter/i });
    fireEvent.click(fighterCard);

    // Spellcasting section should not be present
    expect(screen.queryByText('Spellcasting')).not.toBeInTheDocument();
  });

  it('displays pact magic note for Warlock', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Warlock
    const warlockCard = screen.getByRole('button', { name: /Warlock/i });
    fireEvent.click(warlockCard);

    // Check for pact magic note
    expect(screen.getByText(/Pact Magic/i)).toBeInTheDocument();
  });

  it('displays spells prepared for classes that prepare spells', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Wizard (prepares spells)
    const wizardCard = screen.getByRole('button', { name: /Wizard/i });
    fireEvent.click(wizardCard);

    // Check for spells prepared
    expect(screen.getByText(/Spells Prepared\/Known:/)).toBeInTheDocument();
  });

  it('initializes with character current class', () => {
    const mockCharacter = {
      class: {
        name: 'Rogue',
        hitDie: 8 as const,
        primaryAbility: ['DEX' as const],
        savingThrows: ['DEX', 'INT'] as ['DEX', 'INT'],
        armorProficiencies: ['light' as const],
        weaponProficiencies: ['simple' as const],
        skillChoices: { options: ['Acrobatics', 'Athletics'], count: 4 },
        features: [],
        subclasses: [],
      },
    };
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Rogue card should be highlighted
    const classGrid = container.querySelector('.grid') as HTMLElement;
    const rogueCard = within(classGrid).getByText('Rogue').closest('button');
    expect(rogueCard).toHaveClass('border-blue-600');

    // Detail panel should be visible
    expect(screen.getByText('Rogue Details')).toBeInTheDocument();
  });

  it('handles classes with multiple primary abilities', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    const classGrid = container.querySelector('.grid') as HTMLElement;

    // Fighter has STR, DEX as primary abilities
    const fighterCard = within(classGrid).getByText('Fighter').closest('button');
    expect(fighterCard).toHaveTextContent('Primary: STR, DEX');

    // Paladin has STR, CHA as primary abilities
    const paladinCard = within(classGrid).getByText('Paladin').closest('button');
    expect(paladinCard).toHaveTextContent('Primary: STR, CHA');
  });

  it('changes selection when different class is clicked', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    const classGrid = container.querySelector('.grid') as HTMLElement;
    const fighterCard = within(classGrid).getByText('Fighter').closest('button');
    const wizardCard = within(classGrid).getByText('Wizard').closest('button');

    // Click Fighter
    fireEvent.click(fighterCard!);
    expect(fighterCard).toHaveClass('border-blue-600');
    expect(screen.getByText('Fighter Details')).toBeInTheDocument();

    // Click Wizard
    fireEvent.click(wizardCard!);
    expect(wizardCard).toHaveClass('border-blue-600');
    expect(fighterCard).toHaveClass('border-gray-300');
    expect(screen.getByText('Wizard Details')).toBeInTheDocument();
    expect(screen.queryByText('Fighter Details')).not.toBeInTheDocument();
  });

  it('renders correct number of skill choices for each class', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Bard has 3 skill choices
    const bardCard = screen.getByRole('button', { name: /Bard/i });
    fireEvent.click(bardCard);
    expect(screen.getByText(/Choose 3 from:/)).toBeInTheDocument();

    // Rogue has 4 skill choices
    const rogueCard = screen.getByRole('button', { name: /Rogue/i });
    fireEvent.click(rogueCard);
    expect(screen.getByText(/Choose 4 from:/)).toBeInTheDocument();
  });

  it('displays all class features with descriptions', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Barbarian (has Rage and Unarmored Defense)
    const barbarianCard = screen.getByRole('button', { name: /Barbarian/i });
    fireEvent.click(barbarianCard);

    // Check that both features are displayed
    expect(screen.getByText('Rage')).toBeInTheDocument();
    expect(screen.getByText('Unarmored Defense')).toBeInTheDocument();

    // Check that descriptions are present
    expect(screen.getByText(/primal ferocity/i)).toBeInTheDocument();
    expect(screen.getByText(/Armor Class equals 10/i)).toBeInTheDocument();
  });
});
