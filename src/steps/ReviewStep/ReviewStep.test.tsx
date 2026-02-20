import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReviewStep } from './ReviewStep';
import type { CharacterDraft } from '../../types/character';
import type { CharacterClass } from '../../types/class';
import type { Species } from '../../types/species';
import type { Background } from '../../types/background';
import type { Armor, Weapon, Gear } from '../../types/equipment';
import type { AvailableContent } from '../../types/expansion-pack';

const stubContent: AvailableContent = {
  species: [{ source: 'Base Content', items: [] }],
  classes: [{ source: 'Base Content', items: [] }],
  backgrounds: [{ source: 'Base Content', items: [] }],
};

// -- Test fixtures using SRD values --

const mockElf: Species = {
  name: 'Elf',
  size: 'Medium',
  speed: 30,
  traits: [
    { name: 'Darkvision', description: 'You can see in dim light within 60 feet of you as if it were bright light.' },
    { name: 'Fey Ancestry', description: 'You have advantage on saving throws against being charmed.' },
  ],
  languages: ['Common', 'Elvish'],
  subspecies: [
    {
      name: 'High',
      traits: [{ name: 'Cantrip', description: 'You know one cantrip from the wizard spell list.' }],
      abilityBonuses: { INT: 1 },
    },
  ],
};

const mockHighElfSubspecies = mockElf.subspecies[0];

const mockDwarf: Species = {
  name: 'Dwarf',
  size: 'Medium',
  speed: 25,
  traits: [
    { name: 'Darkvision', description: 'You can see in dim light within 60 feet.' },
    { name: 'Dwarven Resilience', description: 'You have advantage on saving throws against poison.' },
  ],
  languages: ['Common', 'Dwarvish'],
  subspecies: [],
};

const mockFighter: CharacterClass = {
  name: 'Fighter',
  hitDie: 10,
  primaryAbility: ['STR', 'DEX'],
  savingThrows: ['STR', 'CON'],
  armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
  weaponProficiencies: ['simple', 'martial'],
  skillChoices: { options: ['Acrobatics', 'Athletics'], count: 2 },
  features: [
    { name: 'Fighting Style', description: 'You adopt a particular style of fighting as your specialty.' },
    { name: 'Second Wind', description: 'You have a limited well of stamina that you can draw on to protect yourself from harm.' },
  ],
  subclasses: [],
};

const mockWizard: CharacterClass = {
  name: 'Wizard',
  hitDie: 6,
  primaryAbility: ['INT'],
  savingThrows: ['INT', 'WIS'],
  armorProficiencies: [],
  weaponProficiencies: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
  skillChoices: { options: ['Arcana', 'History', 'Investigation'], count: 2 },
  features: [
    { name: 'Spellcasting', description: 'As a student of arcane magic, you have a spellbook.' },
    { name: 'Arcane Recovery', description: 'You have learned to regain some magical energy by studying your spellbook.' },
  ],
  spellcasting: {
    ability: 'INT',
    cantripsKnown: 3,
    spellSlots: 2,
    spellsPrepared: 6,
  },
  subclasses: [],
};

const mockBarbarian: CharacterClass = {
  name: 'Barbarian',
  hitDie: 12,
  primaryAbility: ['STR'],
  savingThrows: ['STR', 'CON'],
  armorProficiencies: ['light', 'medium', 'shields'],
  weaponProficiencies: ['simple', 'martial'],
  skillChoices: { options: ['Athletics', 'Intimidation'], count: 2 },
  features: [
    { name: 'Rage', description: 'In battle, you fight with primal ferocity.' },
    { name: 'Unarmored Defense', description: 'While not wearing armor, your AC equals 10 + DEX modifier + CON modifier.' },
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
  skillChoices: { options: ['Acrobatics', 'Athletics', 'Stealth'], count: 2 },
  features: [
    { name: 'Unarmored Defense', description: 'While not wearing armor, your AC equals 10 + DEX modifier + WIS modifier.' },
    { name: 'Martial Arts', description: 'Your practice of martial arts gives you mastery of combat styles.' },
  ],
  subclasses: [],
};

const mockSage: Background = {
  name: 'Sage',
  abilityOptions: ['INT', 'WIS', 'CHA'],
  skillProficiencies: ['Arcana', 'History'],
  toolProficiency: 'None',
  equipment: [{ name: 'Ink', quantity: 1 }, { name: 'Parchment', quantity: 5 }],
  feature: { name: 'Researcher', description: 'When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it.' },
  originFeat: 'Magic Initiate',
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
};

const mockAcolyte: Background = {
  name: 'Acolyte',
  abilityOptions: ['INT', 'WIS', 'CHA'],
  skillProficiencies: ['Insight', 'Religion'],
  toolProficiency: "Calligrapher's Supplies",
  equipment: [{ name: 'Holy Symbol', quantity: 1 }],
  feature: { name: 'Shelter of the Faithful', description: 'As an acolyte, you command the respect of those who share your faith.' },
  originFeat: 'Magic Initiate',
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
};

const chainMail: Armor = {
  kind: 'armor',
  name: 'Chain Mail',
  category: 'heavy',
  baseAC: 16,
  addDex: false,
  strengthRequirement: 13,
  stealthDisadvantage: true,
  weight: 55,
  cost: '75 gp',
};

const shield: Armor = {
  kind: 'armor',
  name: 'Shield',
  category: 'shield',
  baseAC: 2,
  addDex: false,
  stealthDisadvantage: false,
  weight: 6,
  cost: '10 gp',
};

const longsword: Weapon = {
  kind: 'weapon',
  name: 'Longsword',
  category: 'martial',
  damage: '1d8',
  damageType: 'slashing',
  properties: ['versatile'],
  weight: 3,
  cost: '15 gp',
};

const backpack: Gear = {
  kind: 'gear',
  name: 'Backpack',
  weight: 5,
  cost: '2 gp',
};

// -- Helper to render ReviewStep --

function renderReview(character: CharacterDraft) {
  return render(
    <MemoryRouter>
      <ReviewStep character={character} updateCharacter={vi.fn()} availableContent={stubContent} />
    </MemoryRouter>
  );
}

// Standard ability scores used across tests: STR 15, DEX 14, CON 13, INT 12, WIS 10, CHA 8
const standardScores = { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 };

// -- Tests --

describe('ReviewStep', () => {
  describe('basic rendering', () => {
    it('renders without crashing with empty character', () => {
      renderReview({});
      expect(screen.getByText('Character Sheet')).toBeInTheDocument();
    });

    it('renders header with character name from state', () => {
      renderReview({ name: 'Aragorn' });
      expect(screen.getByTestId('character-name')).toHaveTextContent('Aragorn');
    });

    it('displays "Unnamed Character" when name is missing', () => {
      renderReview({});
      expect(screen.getByTestId('character-name')).toHaveTextContent('Unnamed Character');
    });

    it('renders species name', () => {
      renderReview({ species: mockElf });
      expect(screen.getByTestId('character-species')).toHaveTextContent('Elf');
    });

    it('renders class name', () => {
      renderReview({ class: mockFighter });
      expect(screen.getByTestId('character-class')).toHaveTextContent('Fighter');
    });

    it('renders background name', () => {
      renderReview({ background: mockSage });
      expect(screen.getByTestId('character-background')).toHaveTextContent('Sage');
    });

    it('shows "Not selected" for missing selections', () => {
      renderReview({});
      expect(screen.getByTestId('character-species')).toHaveTextContent('Not selected');
      expect(screen.getByTestId('character-class')).toHaveTextContent('Not selected');
      expect(screen.getByTestId('character-background')).toHaveTextContent('Not selected');
    });

    it('defaults level to 1', () => {
      renderReview({});
      expect(screen.getByTestId('character-level')).toHaveTextContent('1');
    });

    it('shows subspecies name with species', () => {
      renderReview({ species: mockElf, subspecies: mockHighElfSubspecies });
      expect(screen.getByTestId('character-species')).toHaveTextContent('High Elf');
    });
  });

  describe('ability scores', () => {
    it('displays all six ability scores', () => {
      renderReview({ baseAbilityScores: standardScores });

      expect(screen.getByTestId('ability-STR')).toBeInTheDocument();
      expect(screen.getByTestId('ability-DEX')).toBeInTheDocument();
      expect(screen.getByTestId('ability-CON')).toBeInTheDocument();
      expect(screen.getByTestId('ability-INT')).toBeInTheDocument();
      expect(screen.getByTestId('ability-WIS')).toBeInTheDocument();
      expect(screen.getByTestId('ability-CHA')).toBeInTheDocument();
    });

    it('displays computed modifiers correctly', () => {
      // STR 15 → +2, DEX 14 → +2, CON 13 → +1, INT 12 → +1, WIS 10 → +0, CHA 8 → -1
      renderReview({ baseAbilityScores: standardScores });

      expect(screen.getByTestId('modifier-STR')).toHaveTextContent('+2');
      expect(screen.getByTestId('modifier-DEX')).toHaveTextContent('+2');
      expect(screen.getByTestId('modifier-CON')).toHaveTextContent('+1');
      expect(screen.getByTestId('modifier-INT')).toHaveTextContent('+1');
      expect(screen.getByTestId('modifier-WIS')).toHaveTextContent('+0');
      expect(screen.getByTestId('modifier-CHA')).toHaveTextContent('-1');
    });

    it('displays raw ability scores', () => {
      renderReview({ baseAbilityScores: standardScores });

      expect(screen.getByTestId('score-STR')).toHaveTextContent('15');
      expect(screen.getByTestId('score-DEX')).toHaveTextContent('14');
      expect(screen.getByTestId('score-CON')).toHaveTextContent('13');
    });

    it('does not render ability section when scores are missing', () => {
      renderReview({});
      expect(screen.queryByTestId('ability-scores-section')).not.toBeInTheDocument();
    });

    it('applies species bonuses to ability scores', () => {
      // High Elf adds +1 INT, so INT 12 → 13 → modifier +1
      renderReview({
        baseAbilityScores: standardScores,
        species: mockElf,
        subspecies: mockHighElfSubspecies,
      });

      // INT should be 13 (12 + 1 from High Elf)
      expect(screen.getByTestId('score-INT')).toHaveTextContent('13');
    });
  });

  describe('combat stats', () => {
    it('computes AC from equipment and DEX', () => {
      // Chain Mail (base 16, heavy) + Shield (+2) = 18, DEX ignored for heavy
      renderReview({
        baseAbilityScores: standardScores,
        class: mockFighter,
        equipment: [chainMail, shield],
      });

      expect(screen.getByTestId('combat-ac')).toHaveTextContent('18');
    });

    it('computes unarmored AC when no equipment', () => {
      // No equipment, DEX 14 → modifier +2, AC = 10 + 2 = 12
      renderReview({
        baseAbilityScores: standardScores,
        class: mockFighter,
      });

      expect(screen.getByTestId('combat-ac')).toHaveTextContent('12');
    });

    it('computes Monk AC when applicable', () => {
      // Monk unarmored: 10 + DEX(+2) + WIS(+0) = 12
      // With high WIS scores: STR 8, DEX 15, CON 10, INT 12, WIS 16, CHA 13
      // Modifier: DEX +2, WIS +3 → Monk AC = 10 + 2 + 3 = 15
      renderReview({
        baseAbilityScores: { STR: 8, DEX: 15, CON: 10, INT: 12, WIS: 16, CHA: 13 },
        class: mockMonk,
      });

      expect(screen.getByTestId('combat-ac')).toHaveTextContent('15');
    });

    it('computes Barbarian AC when applicable', () => {
      // Barbarian unarmored: 10 + DEX(+2) + CON(+3) = 15
      renderReview({
        baseAbilityScores: { STR: 15, DEX: 14, CON: 16, INT: 8, WIS: 10, CHA: 12 },
        class: mockBarbarian,
      });

      expect(screen.getByTestId('combat-ac')).toHaveTextContent('15');
    });

    it('computes HP from hit die and CON modifier', () => {
      // Fighter d10 + CON +1 = 11
      renderReview({
        baseAbilityScores: standardScores,
        class: mockFighter,
      });

      expect(screen.getByTestId('combat-hp')).toHaveTextContent('11');
    });

    it('computes initiative from DEX modifier', () => {
      // DEX 14 → +2
      renderReview({
        baseAbilityScores: standardScores,
      });

      expect(screen.getByTestId('combat-initiative')).toHaveTextContent('+2');
    });

    it('shows correct proficiency bonus for level 1', () => {
      renderReview({});
      expect(screen.getByTestId('combat-proficiency')).toHaveTextContent('+2');
    });

    it('shows species speed', () => {
      renderReview({ species: mockElf });
      expect(screen.getByTestId('combat-speed')).toHaveTextContent('30 ft');
    });

    it('shows dwarf speed (25 ft)', () => {
      renderReview({ species: mockDwarf });
      expect(screen.getByTestId('combat-speed')).toHaveTextContent('25 ft');
    });

    it('shows hit die from class', () => {
      renderReview({ class: mockFighter });
      expect(screen.getByTestId('combat-hit-die')).toHaveTextContent('d10');
    });

    it('shows dash for missing combat values', () => {
      renderReview({});
      expect(screen.getByTestId('combat-ac')).toHaveTextContent('—');
      expect(screen.getByTestId('combat-hp')).toHaveTextContent('—');
      expect(screen.getByTestId('combat-initiative')).toHaveTextContent('—');
      expect(screen.getByTestId('combat-speed')).toHaveTextContent('—');
      expect(screen.getByTestId('combat-hit-die')).toHaveTextContent('—');
    });
  });

  describe('saving throws', () => {
    it('displays all six saving throws', () => {
      renderReview({
        baseAbilityScores: standardScores,
        class: mockFighter,
      });

      expect(screen.getByTestId('save-STR')).toBeInTheDocument();
      expect(screen.getByTestId('save-DEX')).toBeInTheDocument();
      expect(screen.getByTestId('save-CON')).toBeInTheDocument();
      expect(screen.getByTestId('save-INT')).toBeInTheDocument();
      expect(screen.getByTestId('save-WIS')).toBeInTheDocument();
      expect(screen.getByTestId('save-CHA')).toBeInTheDocument();
    });

    it('marks class saving throw proficiencies correctly', () => {
      // Fighter is proficient in STR and CON
      renderReview({
        baseAbilityScores: standardScores,
        class: mockFighter,
      });

      expect(screen.getByTestId('save-prof-STR')).toHaveTextContent('✓');
      expect(screen.getByTestId('save-prof-CON')).toHaveTextContent('✓');
      expect(screen.getByTestId('save-prof-DEX')).not.toHaveTextContent('✓');
      expect(screen.getByTestId('save-prof-INT')).not.toHaveTextContent('✓');
    });

    it('computes saving throw modifiers with proficiency', () => {
      // Fighter: STR proficient → +2 (mod) + 2 (prof) = +4
      // CON proficient → +1 (mod) + 2 (prof) = +3
      // DEX not proficient → +2 (mod only)
      renderReview({
        baseAbilityScores: standardScores,
        class: mockFighter,
      });

      expect(screen.getByTestId('save-mod-STR')).toHaveTextContent('+4');
      expect(screen.getByTestId('save-mod-CON')).toHaveTextContent('+3');
      expect(screen.getByTestId('save-mod-DEX')).toHaveTextContent('+2');
    });
  });

  describe('skills', () => {
    it('lists all 18 skills', () => {
      renderReview({
        baseAbilityScores: standardScores,
        class: mockFighter,
        skillProficiencies: [],
      });

      expect(screen.getByTestId('skill-acrobatics')).toBeInTheDocument();
      expect(screen.getByTestId('skill-athletics')).toBeInTheDocument();
      expect(screen.getByTestId('skill-arcana')).toBeInTheDocument();
      expect(screen.getByTestId('skill-stealth')).toBeInTheDocument();
      expect(screen.getByTestId('skill-perception')).toBeInTheDocument();
      expect(screen.getByTestId('skill-persuasion')).toBeInTheDocument();
    });

    it('marks proficient skills', () => {
      renderReview({
        baseAbilityScores: standardScores,
        class: mockFighter,
        skillProficiencies: ['Athletics', 'Perception'],
      });

      expect(screen.getByTestId('skill-prof-athletics')).toHaveTextContent('✓');
      expect(screen.getByTestId('skill-prof-perception')).toHaveTextContent('✓');
      expect(screen.getByTestId('skill-prof-arcana')).not.toHaveTextContent('✓');
    });

    it('does not render skills section when ability scores are missing', () => {
      renderReview({});
      expect(screen.queryByTestId('skills-section')).not.toBeInTheDocument();
    });
  });

  describe('proficiencies', () => {
    it('lists armor proficiencies from class', () => {
      renderReview({ class: mockFighter });
      expect(screen.getByTestId('prof-armor')).toHaveTextContent('light, medium, heavy, shields');
    });

    it('lists weapon proficiencies from class', () => {
      renderReview({ class: mockFighter });
      expect(screen.getByTestId('prof-weapons')).toHaveTextContent('simple, martial');
    });

    it('lists tool proficiency from background', () => {
      renderReview({ background: mockAcolyte });
      expect(screen.getByTestId('prof-tools')).toHaveTextContent("Calligrapher's Supplies");
    });

    it('does not show tools when toolProficiency is "None"', () => {
      renderReview({ background: mockSage });
      expect(screen.queryByTestId('prof-tools')).not.toBeInTheDocument();
    });

    it('lists languages from species', () => {
      renderReview({ species: mockElf });
      expect(screen.getByTestId('prof-languages')).toHaveTextContent('Common, Elvish');
    });
  });

  describe('equipment', () => {
    it('groups equipment by category', () => {
      renderReview({
        equipment: [longsword, chainMail, backpack],
      });

      expect(screen.getByText('Longsword')).toBeInTheDocument();
      expect(screen.getByText('Chain Mail')).toBeInTheDocument();
      expect(screen.getByText('Backpack')).toBeInTheDocument();
    });

    it('shows quantity for gear items with quantity > 1', () => {
      const arrows: Gear = {
        kind: 'gear',
        name: 'Arrows',
        quantity: 20,
        weight: 1,
        cost: '1 gp',
      };
      renderReview({
        equipment: [longsword, arrows],
      });

      expect(screen.getByText('Longsword')).toBeInTheDocument();
      // Gear items with quantity > 1 show "(x{quantity})" suffix
      expect(screen.getByText(/Arrows/)).toBeInTheDocument();
      expect(screen.getByText(/\(x20\)/)).toBeInTheDocument();
    });

    it('does not show quantity suffix for gear items with quantity 1', () => {
      renderReview({
        equipment: [backpack],
      });

      expect(screen.getByText('Backpack')).toBeInTheDocument();
      const gearSection = screen.getByTestId('equipment-section');
      expect(gearSection).not.toHaveTextContent('(x');
    });

    it('handles empty equipment list', () => {
      renderReview({ equipment: [] });
      const section = screen.getByTestId('equipment-section');
      expect(section).toHaveTextContent('None');
    });

    it('handles missing equipment', () => {
      renderReview({});
      const section = screen.getByTestId('equipment-section');
      expect(section).toHaveTextContent('None');
    });
  });

  describe('traits and features', () => {
    it('lists species traits', () => {
      renderReview({ species: mockElf });
      expect(screen.getByText('Darkvision')).toBeInTheDocument();
      expect(screen.getByText('Fey Ancestry')).toBeInTheDocument();
    });

    it('includes subspecies traits', () => {
      renderReview({ species: mockElf, subspecies: mockHighElfSubspecies });
      expect(screen.getByText('Cantrip')).toBeInTheDocument();
      expect(screen.getByText('Darkvision')).toBeInTheDocument();
    });

    it('lists class features', () => {
      renderReview({ class: mockFighter });
      expect(screen.getByText('Fighting Style')).toBeInTheDocument();
      expect(screen.getByText('Second Wind')).toBeInTheDocument();
    });

    it('displays background feature', () => {
      renderReview({ background: mockSage });
      expect(screen.getByText('Researcher')).toBeInTheDocument();
    });
  });

  describe('spellcasting', () => {
    it('renders spellcasting section for spellcasters', () => {
      renderReview({
        baseAbilityScores: standardScores,
        class: mockWizard,
      });

      expect(screen.getByTestId('spellcasting-section')).toBeInTheDocument();
    });

    it('does NOT render spellcasting for non-casters', () => {
      renderReview({ class: mockFighter });
      expect(screen.queryByTestId('spellcasting-section')).not.toBeInTheDocument();
    });

    it('does NOT render spellcasting for Barbarian', () => {
      renderReview({ class: mockBarbarian });
      expect(screen.queryByTestId('spellcasting-section')).not.toBeInTheDocument();
    });

    it('displays spellcasting ability', () => {
      renderReview({
        baseAbilityScores: standardScores,
        class: mockWizard,
      });

      expect(screen.getByTestId('spell-ability')).toHaveTextContent('Intelligence');
    });

    it('displays spell save DC', () => {
      // Wizard INT: 12 → +1, proficiency +2, DC = 8 + 1 + 2 = 11
      renderReview({
        baseAbilityScores: standardScores,
        class: mockWizard,
      });

      expect(screen.getByTestId('spell-save-dc')).toHaveTextContent('11');
    });

    it('displays spell attack modifier', () => {
      // Wizard INT: 12 → +1, proficiency +2, attack = 1 + 2 = +3
      renderReview({
        baseAbilityScores: standardScores,
        class: mockWizard,
      });

      expect(screen.getByTestId('spell-attack-mod')).toHaveTextContent('+3');
    });

    it('displays cantrips', () => {
      renderReview({
        baseAbilityScores: standardScores,
        class: mockWizard,
        cantripsKnown: ['Fire Bolt', 'Mage Hand', 'Light'],
      });

      expect(screen.getByTestId('cantrips-list')).toHaveTextContent('Fire Bolt, Mage Hand, Light');
    });

    it('displays spells known', () => {
      renderReview({
        baseAbilityScores: standardScores,
        class: mockWizard,
        spellsKnown: ['Magic Missile', 'Shield'],
      });

      expect(screen.getByTestId('spells-list')).toHaveTextContent('Magic Missile, Shield');
    });

    it('handles missing spells gracefully', () => {
      renderReview({
        baseAbilityScores: standardScores,
        class: mockWizard,
      });

      expect(screen.getByText('No spells selected yet.')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders complete character with all data', () => {
      const fullCharacter: CharacterDraft = {
        name: 'Gandalf the Grey',
        species: mockElf,
        subspecies: mockHighElfSubspecies,
        class: mockWizard,
        background: mockSage,
        baseAbilityScores: { STR: 8, DEX: 14, CON: 12, INT: 15, WIS: 13, CHA: 10 },
        level: 1,
        skillProficiencies: ['Arcana', 'History', 'Investigation', 'Religion'],
        equipment: [longsword, backpack],
        cantripsKnown: ['Fire Bolt', 'Mage Hand', 'Light'],
        spellsKnown: ['Magic Missile', 'Shield', 'Detect Magic'],
        selectedLanguages: ['Draconic'],
      };

      renderReview(fullCharacter);

      expect(screen.getByTestId('character-name')).toHaveTextContent('Gandalf the Grey');
      expect(screen.getByTestId('character-species')).toHaveTextContent('High Elf');
      expect(screen.getByTestId('character-class')).toHaveTextContent('Wizard');
      expect(screen.getByTestId('character-background')).toHaveTextContent('Sage');
      expect(screen.getByTestId('spellcasting-section')).toBeInTheDocument();
      // INT: 15 + 1 (High Elf) = 16 → +3 modifier
      expect(screen.getByTestId('modifier-INT')).toHaveTextContent('+3');
      // Spell Save DC: 8 + 3 + 2 = 13
      expect(screen.getByTestId('spell-save-dc')).toHaveTextContent('13');
      // Languages: Common, Elvish (from species) + Draconic (selected)
      expect(screen.getByTestId('prof-languages')).toHaveTextContent('Common, Elvish, Draconic');
    });

    it('handles characters with no subspecies', () => {
      renderReview({ species: mockDwarf });
      expect(screen.getByTestId('character-species')).toHaveTextContent('Dwarf');
    });
  });
});
