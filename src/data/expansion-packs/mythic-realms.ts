import type { ExpansionPack } from '../../types/expansion-pack';

/**
 * Mythic Realms expansion pack.
 * Adds celestial and arcane-craft options: Aasimar species, Artificer class,
 * and Far Traveler background.
 */
export const MYTHIC_REALMS_PACK: ExpansionPack = {
  id: 'mythic-realms',
  name: 'Mythic Realms',
  description: 'Adds celestial and arcane-craft options: the Aasimar species, the Artificer class, and the Far Traveler background.',
  species: [
    {
      name: 'Aasimar',
      speed: 30,
      size: 'Medium',
      traits: [
        {
          name: 'Darkvision',
          description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light. You cannot discern color in darkness, only shades of gray.',
        },
        {
          name: 'Celestial Resistance',
          description: 'You have resistance to necrotic damage and radiant damage.',
        },
        {
          name: 'Healing Hands',
          description: 'As an action, you can touch a creature and cause it to regain a number of hit points equal to your level. Once you use this trait, you cannot use it again until you finish a long rest.',
        },
        {
          name: 'Light Bearer',
          description: 'You know the Light cantrip. Charisma is your spellcasting ability for it.',
        },
      ],
      languages: ['Common', 'Celestial'],
      subspecies: [
        {
          name: 'Protector Aasimar',
          traits: [
            {
              name: 'Radiant Soul',
              description: 'Starting at 3rd level, you can use your action to unleash divine energy within yourself. Your eyes glimmer and two luminous wings sprout from your back. Your transformation lasts 1 minute or until you end it as a bonus action. During it, you have a flying speed of 30 feet, and once on each of your turns, you can deal extra radiant damage equal to your level when you deal damage with an attack or spell.',
            },
          ],
        },
        {
          name: 'Scourge Aasimar',
          traits: [
            {
              name: 'Radiant Consumption',
              description: 'Starting at 3rd level, you can use your action to unleash divine energy within yourself, causing searing light to radiate from you. Your transformation lasts 1 minute or until you end it as a bonus action. During it, you shed bright light in a 10-foot radius and dim light for an additional 10 feet, and at the start of each of your turns, you and each creature within 10 feet of you each take radiant damage equal to half your level (rounded up).',
            },
          ],
        },
      ],
    },
  ],
  classes: [
    {
      name: 'Artificer',
      hitDie: 8,
      primaryAbility: ['INT'],
      savingThrows: ['CON', 'INT'],
      armorProficiencies: ['light', 'medium', 'shields'],
      weaponProficiencies: ['simple'],
      skillChoices: {
        options: ['Arcana', 'History', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Sleight of Hand'],
        count: 2,
      },
      startingEquipment: {
        choices: [
          {
            description: 'Choose a weapon:',
            options: [
              { label: 'Light crossbow and 20 bolts', items: [{ name: 'Crossbow, Light' }, { name: 'Bolts (20)' }] },
              { label: 'Any two simple weapons', items: [{ name: 'Handaxe', quantity: 2 }] },
            ],
          },
        ],
        fixed: [
          { name: "Thieves' Tools" },
          { name: "Artisan's tools of your choice" },
          { name: 'Leather Armor' },
          { name: "Dungeoneer's pack" },
        ],
      },
      features: [
        {
          name: 'Magical Tinkering',
          description: "You've learned to invest a spark of magic into mundane objects. To use this ability, you must have thieves' tools or artisan's tools in hand. You touch a Tiny nonmagical object as an action and give it one magical property of your choice: it sheds bright light in a 5-foot radius, when tapped it plays a brief recorded message, it emits a continuous odor or nonverbal sound, or a static visual effect appears on one of its surfaces.",
        },
        {
          name: 'Spellcasting',
          description: "You've studied the workings of magic and how to channel it through objects. You use Intelligence as your spellcasting ability. You can cast artificer spells using your tools as a spellcasting focus. You prepare spells from the artificer spell list each day after a long rest.",
        },
      ],
      spellcasting: {
        ability: 'INT',
        cantripsKnown: 2,
        spellSlots: 2,
        spellsPrepared: 3,
      },
      subclasses: [],
    },
  ],
  backgrounds: [
    {
      name: 'Far Traveler',
      abilityOptions: ['STR', 'DEX', 'INT'],
      skillProficiencies: ['Insight', 'Perception'],
      toolProficiency: 'Any one musical instrument or gaming set of your choice',
      equipment: [
        { name: "Clothes, Traveler's", quantity: 1 },
        { name: 'Maps of your homeland', quantity: 1 },
        { name: 'Journal', quantity: 1 },
        { name: 'Pouch', quantity: 1 },
      ],
      feature: {
        name: 'All Eyes on You',
        description: 'Your accent, mannerisms, figures of speech, and perhaps even your appearance all mark you as foreign. Curious glances are directed your way wherever you go, which can be a nuisance, but you also gain the friendly interest of scholars and others intrigued by far-off lands, and locals curious about where you are from may be willing to offer you free lodging or meals.',
      },
      originFeat: 'Lucky',
      personalityTraits: [
        "I have different assumptions from those around me concerning personal space, expressions of affection, or some other social behavior that reflects my upbringing.",
        "I have my own ideas about what is and is not food, and I find the eating habits of those around me fascinating, disturbing, or delectable.",
        "I speak with a lilting accent that enchants some and confuses others.",
        "I am endlessly curious about the seemingly mundane customs and rituals I observe around me.",
      ],
      ideals: [
        "Open. I have much to learn from the kindly folk I meet along my way. (Good)",
        "Reserved. As someone new to these strange lands, I am cautious and respectful in my dealings. (Lawful)",
        "Adventure. I am far from home, and everything is strange and wonderful. (Chaotic)",
        "Cunning. Though I may seem naive, I know how to use my outsider status to my advantage. (Any)",
      ],
      bonds: [
        "So long as I have this token from my homeland, I can face any adversity in this strange land.",
        "The people of this land welcomed me when I was a stranger; I will not forget that debt.",
        "I am searching for something I lost, or left behind, when I fled my homeland.",
      ],
      flaws: [
        "I am secretly (or not so secretly) convinced of the superiority of my own culture over that of this foreign land.",
        "I pretend not to understand the local language in order to avoid interactions I would rather not have.",
        "I have a weakness for exotic food, drink, and intoxicants, some of which are quite illegal in this land.",
      ],
    },
  ],
};
