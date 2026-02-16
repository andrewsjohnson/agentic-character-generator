import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
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
    (classesData as unknown as CharacterClass[]).forEach((charClass) => {
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

  it('shows detail panel when class is selected', async () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Detail panel should not be visible initially
    expect(screen.queryByText('Fighter Details')).not.toBeInTheDocument();
    expect(screen.queryByText('Level 1 Features')).not.toBeInTheDocument();

    // Click Fighter using grid
    const classGrid = container.querySelector('.grid') as HTMLElement;
    const fighterCard = within(classGrid).getByText('Fighter').closest('button');
    fireEvent.click(fighterCard!);

    // Detail panel should now be visible - wait for React transition
    await waitFor(() => {
      expect(screen.getByText('Fighter Details')).toBeInTheDocument();
      expect(screen.getByText('Level 1 Features')).toBeInTheDocument();
    });
  });

  it('displays proficiencies correctly in detail panel', async () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Fighter
    const classGrid = container.querySelector('.grid') as HTMLElement;
    const fighterCard = within(classGrid).getByText('Fighter').closest('button');
    fireEvent.click(fighterCard!);

    // Wait for detail panel to appear and check proficiencies
    await waitFor(() => {
      const detailPanel = screen.getByText('Fighter Details').closest('div') as HTMLElement;
      expect(within(detailPanel).getByText(/Armor:/)).toBeInTheDocument();
      expect(within(detailPanel).getByText(/light, medium, heavy, shields/)).toBeInTheDocument();
      expect(within(detailPanel).getByText(/Weapons:/)).toBeInTheDocument();
      expect(within(detailPanel).getByText(/Saving Throws:/)).toBeInTheDocument();
    });
  });

  it('displays "None" for classes with no armor proficiencies', async () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Monk (has no armor proficiencies)
    const classGrid = container.querySelector('.grid') as HTMLElement;
    const monkCard = within(classGrid).getByText('Monk').closest('button');
    fireEvent.click(monkCard!);

    // Wait for detail panel and check "None" for armor
    await waitFor(() => {
      const detailPanel = screen.getByText('Monk Details').closest('div') as HTMLElement;
      const armorText = within(detailPanel).getByText(/Armor:/);
      expect(armorText.parentElement).toHaveTextContent('Armor: None');
    });
  });

  it('displays skill choices correctly', async () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Fighter (2 skill choices)
    const classGrid = container.querySelector('.grid') as HTMLElement;
    const fighterCard = within(classGrid).getByText('Fighter').closest('button');
    fireEvent.click(fighterCard!);

    // Wait for detail panel and check skill choices
    await waitFor(() => {
      const detailPanel = screen.getByText('Fighter Details').closest('div') as HTMLElement;
      expect(within(detailPanel).getByText(/Choose 2 from:/)).toBeInTheDocument();
      expect(within(detailPanel).getByText(/Acrobatics, Animal Handling, Athletics/)).toBeInTheDocument();
      expect(within(detailPanel).getByText(/You will choose your skills in a later step/)).toBeInTheDocument();
    });
  });

  it('displays features correctly', async () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Fighter
    const classGrid = container.querySelector('.grid') as HTMLElement;
    const fighterCard = within(classGrid).getByText('Fighter').closest('button');
    fireEvent.click(fighterCard!);

    // Wait for detail panel and check features
    await waitFor(() => {
      const detailPanel = screen.getByText('Fighter Details').closest('div') as HTMLElement;
      expect(within(detailPanel).getByText('Level 1 Features')).toBeInTheDocument();
      expect(within(detailPanel).getByText('Fighting Style')).toBeInTheDocument();
      expect(within(detailPanel).getByText('Second Wind')).toBeInTheDocument();
    });
  });

  it('displays spellcasting info for caster classes', async () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Wizard (has spellcasting)
    const classGrid = container.querySelector('.grid') as HTMLElement;
    const wizardCard = within(classGrid).getByText('Wizard').closest('button');
    fireEvent.click(wizardCard!);

    // Wait for detail panel and check spellcasting
    await waitFor(() => {
      const detailPanel = screen.getByText('Wizard Details').closest('div') as HTMLElement;
      expect(within(detailPanel).getByText('Spellcasting')).toBeInTheDocument();
      expect(within(detailPanel).getByText(/Spellcasting Ability:/)).toBeInTheDocument();
      expect(within(detailPanel).getByText(/INT/)).toBeInTheDocument();
      expect(within(detailPanel).getByText(/Cantrips Known:/)).toBeInTheDocument();
      expect(within(detailPanel).getByText(/Spell Slots \(Level 1\):/)).toBeInTheDocument();
    });
  });

  it('does not display spellcasting section for non-caster classes', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Fighter (no spellcasting)
    const classGrid = container.querySelector('.grid') as HTMLElement;
    const fighterCard = within(classGrid).getByText('Fighter').closest('button');
    fireEvent.click(fighterCard!);

    // Spellcasting section should not be present
    expect(screen.queryByText('Spellcasting')).not.toBeInTheDocument();
  });

  it('displays pact magic note for Warlock', async () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Warlock
    const classGrid = container.querySelector('.grid') as HTMLElement;
    const warlockCard = within(classGrid).getByText('Warlock').closest('button');
    fireEvent.click(warlockCard!);

    // Wait for detail panel and check pact magic note
    await waitFor(() => {
      const detailPanel = screen.getByText('Warlock Details').closest('div') as HTMLElement;
      expect(within(detailPanel).getByText(/Pact Magic/i)).toBeInTheDocument();
    });
  });

  it('displays spells prepared for classes that prepare spells', async () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Wizard (prepares spells)
    const classGrid = container.querySelector('.grid') as HTMLElement;
    const wizardCard = within(classGrid).getByText('Wizard').closest('button');
    fireEvent.click(wizardCard!);

    // Wait for detail panel and check spells prepared
    await waitFor(() => {
      const detailPanel = screen.getByText('Wizard Details').closest('div') as HTMLElement;
      expect(within(detailPanel).getByText(/Spells Prepared\/Known:/)).toBeInTheDocument();
    });
  });

  it('initializes with character current class', async () => {
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

    // Detail panel should be visible - wait for it
    await waitFor(() => {
      expect(screen.getByText('Rogue Details')).toBeInTheDocument();
    });
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

  it('changes selection when different class is clicked', async () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    const classGrid = container.querySelector('.grid') as HTMLElement;
    const fighterCard = within(classGrid).getByText('Fighter').closest('button');
    const wizardCard = within(classGrid).getByText('Wizard').closest('button');

    // Click Fighter
    fireEvent.click(fighterCard!);

    // Wait for Fighter detail panel to appear
    await waitFor(() => {
      expect(fighterCard).toHaveClass('border-blue-600');
      expect(screen.getByText('Fighter Details')).toBeInTheDocument();
    });

    // Click Wizard
    fireEvent.click(wizardCard!);

    // Wait for Wizard detail panel to appear and Fighter to disappear
    await waitFor(() => {
      expect(wizardCard).toHaveClass('border-blue-600');
      expect(fighterCard).toHaveClass('border-gray-300');
      expect(screen.getByText('Wizard Details')).toBeInTheDocument();
      expect(screen.queryByText('Fighter Details')).not.toBeInTheDocument();
    });
  });

  it('renders correct number of skill choices for each class', async () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);
    const classGrid = container.querySelector('.grid') as HTMLElement;

    // Bard has 3 skill choices
    const bardCard = within(classGrid).getByText('Bard').closest('button');
    fireEvent.click(bardCard!);

    // Wait for Bard detail panel
    await waitFor(() => {
      const bardDetailPanel = screen.getByText('Bard Details').closest('div') as HTMLElement;
      expect(within(bardDetailPanel).getByText(/Choose 3 from:/)).toBeInTheDocument();
    });

    // Rogue has 4 skill choices
    const rogueCard = within(classGrid).getByText('Rogue').closest('button');
    fireEvent.click(rogueCard!);

    // Wait for Rogue detail panel (and Bard to be removed)
    await waitFor(() => {
      const rogueDetailPanel = screen.getByText('Rogue Details').closest('div') as HTMLElement;
      expect(within(rogueDetailPanel).getByText(/Choose 4 from:/)).toBeInTheDocument();
    });
  });

  it('displays all class features with descriptions', async () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    const { container } = render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Barbarian (has Rage and Unarmored Defense)
    const classGrid = container.querySelector('.grid') as HTMLElement;
    const barbarianCard = within(classGrid).getByText('Barbarian').closest('button');
    fireEvent.click(barbarianCard!);

    // Wait for detail panel and check features
    await waitFor(() => {
      const detailPanel = screen.getByText('Barbarian Details').closest('div') as HTMLElement;
      expect(within(detailPanel).getByText('Rage')).toBeInTheDocument();
      expect(within(detailPanel).getByText('Unarmored Defense')).toBeInTheDocument();
      expect(within(detailPanel).getByText(/primal ferocity/i)).toBeInTheDocument();
      expect(within(detailPanel).getByText(/Armor Class equals 10/i)).toBeInTheDocument();
    });
  });
});
