import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

    // Check that all 12 classes are rendered using test IDs
    (classesData as unknown as CharacterClass[]).forEach((charClass) => {
      const card = screen.getByTestId(`class-card-${charClass.name.toLowerCase()}`);
      expect(card).toBeInTheDocument();
    });
  });

  it('displays class details correctly', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Check Fighter card details
    const fighterCard = screen.getByTestId('class-card-fighter');
    expect(fighterCard).toHaveTextContent('Hit Die: d10');
    expect(fighterCard).toHaveTextContent('Primary: STR, DEX');
    expect(fighterCard).toHaveTextContent('Saves: STR, CON');

    // Check Wizard card details
    const wizardCard = screen.getByTestId('class-card-wizard');
    expect(wizardCard).toHaveTextContent('Hit Die: d6');
    expect(wizardCard).toHaveTextContent('Primary: INT');
    expect(wizardCard).toHaveTextContent('Saves: INT, WIS');
  });

  it('updates character when class is clicked', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Fighter card using test ID
    const fighterCard = screen.getByTestId('class-card-fighter');
    fireEvent.click(fighterCard);

    // Should call updateCharacter with Fighter class
    expect(mockUpdate).toHaveBeenCalledWith({
      class: expect.objectContaining({ name: 'Fighter' }),
    });
  });

  it('highlights selected class card', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    const fighterCard = screen.getByTestId('class-card-fighter');
    const wizardCard = screen.getByTestId('class-card-wizard');

    // Initially no highlight
    expect(fighterCard).toHaveClass('border-gray-300');
    expect(wizardCard).toHaveClass('border-gray-300');

    // Click Fighter
    fireEvent.click(fighterCard);

    // Fighter should be highlighted
    expect(fighterCard).toHaveClass('border-blue-600');
    expect(wizardCard).toHaveClass('border-gray-300');
  });

  it('shows detail panel when class is selected', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Detail panel should not be visible initially
    expect(screen.queryByTestId('class-detail-panel')).not.toBeInTheDocument();

    // Click Fighter using test ID
    const fighterCard = screen.getByTestId('class-card-fighter');
    fireEvent.click(fighterCard);

    // Detail panel should now be visible
    expect(screen.getByTestId('class-detail-panel')).toBeInTheDocument();
    expect(screen.getByTestId('class-detail-heading')).toHaveTextContent('Fighter Details');
  });

  it('displays proficiencies correctly in detail panel', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Fighter
    const fighterCard = screen.getByTestId('class-card-fighter');
    fireEvent.click(fighterCard);

    // Check proficiencies using test IDs
    const armorProfs = screen.getByTestId('armor-proficiencies');
    expect(armorProfs).toHaveTextContent('Armor: light, medium, heavy, shields');

    expect(screen.getByTestId('weapon-proficiencies')).toBeInTheDocument();
    expect(screen.getByTestId('saving-throws')).toBeInTheDocument();
  });

  it('displays "None" for classes with no armor proficiencies', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Monk (has no armor proficiencies)
    const monkCard = screen.getByTestId('class-card-monk');
    fireEvent.click(monkCard);

    // Check "None" for armor
    const armorProfs = screen.getByTestId('armor-proficiencies');
    expect(armorProfs).toHaveTextContent('Armor: None');
  });

  it('displays skill choices correctly', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Fighter (2 skill choices)
    const fighterCard = screen.getByTestId('class-card-fighter');
    fireEvent.click(fighterCard);

    // Check skill choices using test ID
    const skillChoices = screen.getByTestId('skill-choices-text');
    expect(skillChoices).toHaveTextContent('Choose 2 from:');
    expect(skillChoices).toHaveTextContent('Acrobatics, Animal Handling, Athletics');
    expect(screen.getByText(/You will choose your skills in a later step/)).toBeInTheDocument();
  });

  it('displays features correctly', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Fighter
    const fighterCard = screen.getByTestId('class-card-fighter');
    fireEvent.click(fighterCard);

    // Check features section using test ID
    const featuresSection = screen.getByTestId('features-section');
    expect(featuresSection).toBeInTheDocument();
    expect(screen.getByText('Fighting Style')).toBeInTheDocument();
    expect(screen.getByText('Second Wind')).toBeInTheDocument();
  });

  it('displays spellcasting info for caster classes', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Wizard (has spellcasting)
    const wizardCard = screen.getByTestId('class-card-wizard');
    fireEvent.click(wizardCard);

    // Check spellcasting section using test IDs
    expect(screen.getByTestId('spellcasting-section')).toBeInTheDocument();

    const spellcastingAbility = screen.getByTestId('spellcasting-ability');
    expect(spellcastingAbility).toHaveTextContent('Spellcasting Ability: INT');

    expect(screen.getByTestId('cantrips-known')).toBeInTheDocument();
    expect(screen.getByTestId('spell-slots')).toBeInTheDocument();
  });

  it('does not display spellcasting section for non-caster classes', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Fighter (no spellcasting)
    const fighterCard = screen.getByTestId('class-card-fighter');
    fireEvent.click(fighterCard);

    // Spellcasting section should not be present
    expect(screen.queryByTestId('spellcasting-section')).not.toBeInTheDocument();
  });

  it('displays pact magic note for Warlock', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Warlock
    const warlockCard = screen.getByTestId('class-card-warlock');
    fireEvent.click(warlockCard);

    // Check pact magic note using test ID
    const pactMagicNote = screen.getByTestId('pact-magic-note');
    expect(pactMagicNote).toHaveTextContent(/Pact Magic/i);
  });

  it('displays spells prepared for classes that prepare spells', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Wizard (prepares spells)
    const wizardCard = screen.getByTestId('class-card-wizard');
    fireEvent.click(wizardCard);

    // Check spells prepared using test ID
    const spellsPrepared = screen.getByTestId('spells-prepared');
    expect(spellsPrepared).toHaveTextContent(/Spells Prepared\/Known:/);
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

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Rogue card should be highlighted
    const rogueCard = screen.getByTestId('class-card-rogue');
    expect(rogueCard).toHaveClass('border-blue-600');

    // Detail panel should be visible
    expect(screen.getByTestId('class-detail-panel')).toBeInTheDocument();
    expect(screen.getByTestId('class-detail-heading')).toHaveTextContent('Rogue Details');
  });

  it('handles classes with multiple primary abilities', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Fighter has STR, DEX as primary abilities
    const fighterCard = screen.getByTestId('class-card-fighter');
    expect(fighterCard).toHaveTextContent('Primary: STR, DEX');

    // Paladin has STR, CHA as primary abilities
    const paladinCard = screen.getByTestId('class-card-paladin');
    expect(paladinCard).toHaveTextContent('Primary: STR, CHA');
  });

  it('changes selection when different class is clicked', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    const fighterCard = screen.getByTestId('class-card-fighter');
    const wizardCard = screen.getByTestId('class-card-wizard');

    // Click Fighter
    fireEvent.click(fighterCard);

    // Fighter should be selected
    expect(fighterCard).toHaveClass('border-blue-600');
    expect(screen.getByTestId('class-detail-heading')).toHaveTextContent('Fighter Details');

    // Click Wizard
    fireEvent.click(wizardCard);

    // Wizard should now be selected, Fighter unselected
    expect(wizardCard).toHaveClass('border-blue-600');
    expect(fighterCard).toHaveClass('border-gray-300');
    expect(screen.getByTestId('class-detail-heading')).toHaveTextContent('Wizard Details');
  });

  it('renders correct number of skill choices for each class', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Bard has 3 skill choices
    const bardCard = screen.getByTestId('class-card-bard');
    fireEvent.click(bardCard);

    let skillChoices = screen.getByTestId('skill-choices-text');
    expect(skillChoices).toHaveTextContent('Choose 3 from:');

    // Rogue has 4 skill choices
    const rogueCard = screen.getByTestId('class-card-rogue');
    fireEvent.click(rogueCard);

    skillChoices = screen.getByTestId('skill-choices-text');
    expect(skillChoices).toHaveTextContent('Choose 4 from:');
  });

  it('displays all class features with descriptions', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(<ClassStep character={mockCharacter} updateCharacter={mockUpdate} />);

    // Click Barbarian (has Rage and Unarmored Defense)
    const barbarianCard = screen.getByTestId('class-card-barbarian');
    fireEvent.click(barbarianCard);

    // Check features section
    const featuresSection = screen.getByTestId('features-section');
    expect(featuresSection).toBeInTheDocument();

    // Barbarian has 2 features at level 1
    expect(screen.getByTestId('feature-0')).toBeInTheDocument();
    expect(screen.getByTestId('feature-1')).toBeInTheDocument();

    // Check feature names
    expect(screen.getByText('Rage')).toBeInTheDocument();
    expect(screen.getByText('Unarmored Defense')).toBeInTheDocument();
  });
});
