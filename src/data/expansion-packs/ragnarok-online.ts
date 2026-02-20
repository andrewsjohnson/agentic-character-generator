import type { ExpansionPack } from '../../types/expansion-pack';

/**
 * Ragnarok Online expansion pack.
 * Adds content inspired by the Korean MMORPG Ragnarok Online:
 * Doram and Aesir-Blooded species, Swordsman/Mage/Acolyte classes
 * (each with 2 subclasses), and Prontera Citizen/Morroc Wanderer backgrounds.
 *
 * Note: The "Acolyte" class shares a name with the base Acolyte background.
 * This is not a technical conflict — classes and backgrounds are separate types
 * in different selection steps. The authentic Ragnarok Online job name is kept.
 */
export const RAGNAROK_ONLINE_PACK: ExpansionPack = {
  id: 'ragnarok-online',
  name: 'Ragnarok Online',
  description:
    'Adds content inspired by the MMORPG Ragnarok Online: Doram and Aesir-Blooded species, Swordsman/Mage/Acolyte classes with subclasses, and Prontera/Morroc backgrounds.',
  species: [
    {
      name: 'Doram',
      speed: 35,
      size: 'Small',
      traits: [
        {
          name: 'Feline Senses',
          description:
            'You have darkvision out to 30 feet. You also have advantage on Wisdom (Perception) checks that rely on hearing or smell.',
        },
        {
          name: 'Graceful Landing',
          description:
            'When you fall, you can use your reaction to reduce any falling damage you take by an amount equal to your level.',
        },
        {
          name: "Cat's Agility",
          description:
            'You can take the Dash action as a bonus action. Once you use this trait, you cannot use it again until you finish a short or long rest.',
        },
      ],
      languages: ['Common', 'Doram'],
      subspecies: [],
      abilityBonuses: { DEX: 2, WIS: 1 },
    },
    {
      name: 'Aesir-Blooded',
      speed: 30,
      size: 'Medium',
      traits: [
        {
          name: 'Frost Resistance',
          description: 'You have resistance to cold damage.',
        },
        {
          name: 'Nordic Fortitude',
          description:
            'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.',
        },
        {
          name: 'Runic Legacy',
          description:
            'You know the Resistance cantrip. Wisdom is your spellcasting ability for it.',
        },
      ],
      languages: ['Common', 'Norse'],
      subspecies: [],
      abilityBonuses: { STR: 2, CON: 1 },
    },
  ],
  classes: [
    {
      name: 'Swordsman',
      hitDie: 10,
      primaryAbility: ['STR', 'DEX'],
      savingThrows: ['STR', 'CON'],
      armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
      weaponProficiencies: ['simple', 'martial'],
      skillChoices: {
        options: [
          'Acrobatics',
          'Athletics',
          'History',
          'Insight',
          'Intimidation',
          'Perception',
          'Survival',
        ],
        count: 2,
      },
      startingEquipment: {
        choices: [
          {
            description: 'Choose a weapon:',
            options: [
              {
                label: 'Longsword and shield',
                items: [{ name: 'Longsword' }, { name: 'Shield' }],
              },
              {
                label: 'Greatsword',
                items: [{ name: 'Greatsword' }],
              },
            ],
          },
          {
            description: 'Choose armor or ranged kit:',
            options: [
              {
                label: 'Chain Mail',
                items: [{ name: 'Chain Mail' }],
              },
              {
                label: 'Leather Armor and Longbow with 20 arrows',
                items: [
                  { name: 'Leather Armor' },
                  { name: 'Longbow' },
                  { name: 'Arrows (20)' },
                ],
              },
            ],
          },
        ],
        fixed: [{ name: 'Handaxe', quantity: 2 }],
      },
      features: [
        {
          name: 'Provoke',
          description:
            'As a bonus action, you can taunt a creature within 30 feet that can see and hear you. The target must succeed on a Wisdom saving throw (DC 8 + your proficiency bonus + your Strength modifier) or have disadvantage on attack rolls against targets other than you until the start of your next turn.',
        },
        {
          name: 'Iron Will',
          description:
            'Your martial training grants you mental resilience. You gain a +1 bonus to Wisdom saving throws against being frightened or charmed.',
        },
      ],
      subclasses: [
        {
          name: 'Knight',
          features: [
            {
              name: 'Mounted Combat Mastery',
              description:
                'You have advantage on melee attack rolls against any unmounted creature smaller than your mount. In addition, you can force an attack targeted at your mount to target you instead.',
            },
            {
              name: 'Cavalry Charge',
              description:
                'If you move at least 20 feet in a straight line toward a target while mounted and then hit it with a melee weapon attack on the same turn, the target takes an extra 1d8 damage of the weapon\'s type.',
            },
          ],
        },
        {
          name: 'Crusader',
          features: [
            {
              name: 'Holy Weapon',
              description:
                'As a bonus action, you can imbue one weapon you are holding with radiant energy. For 1 minute, the weapon deals an extra 1d4 radiant damage on a hit. You can use this feature once per long rest.',
            },
            {
              name: 'Divine Shield',
              description:
                'When you or a creature within 5 feet of you takes damage, you can use your reaction to reduce that damage by 1d6 + your Charisma modifier (minimum of 1). You can use this feature a number of times equal to your proficiency bonus per long rest.',
            },
          ],
        },
      ],
    },
    {
      name: 'Mage',
      hitDie: 6,
      primaryAbility: ['INT'],
      savingThrows: ['INT', 'WIS'],
      armorProficiencies: [],
      weaponProficiencies: ['simple'],
      skillChoices: {
        options: [
          'Arcana',
          'History',
          'Insight',
          'Investigation',
          'Medicine',
          'Nature',
          'Religion',
        ],
        count: 2,
      },
      startingEquipment: {
        choices: [
          {
            description: 'Choose a weapon:',
            options: [
              {
                label: 'Quarterstaff',
                items: [{ name: 'Quarterstaff' }],
              },
              {
                label: 'Dagger',
                items: [{ name: 'Dagger' }],
              },
            ],
          },
          {
            description: 'Choose an arcane focus:',
            options: [
              {
                label: 'Component Pouch',
                items: [{ name: 'Component Pouch' }],
              },
              {
                label: 'Arcane Focus (Crystal)',
                items: [{ name: 'Arcane Focus (Crystal)' }],
              },
            ],
          },
        ],
        fixed: [{ name: 'Dagger', quantity: 2 }],
      },
      features: [
        {
          name: 'Elemental Affinity',
          description:
            'Choose one element: fire, cold, or lightning. You gain resistance to damage of the chosen type. Once chosen, this cannot be changed.',
        },
        {
          name: 'Spellcasting',
          description:
            'You have learned to channel arcane magic through study and practice. Intelligence is your spellcasting ability. You know three cantrips and can prepare spells from the mage spell list each day after a long rest.',
        },
      ],
      spellcasting: {
        ability: 'INT',
        cantripsKnown: 3,
        spellSlots: 2,
      },
      subclasses: [
        {
          name: 'Wizard',
          features: [
            {
              name: 'Offensive Magic',
              description:
                'When you cast a spell that deals damage, you can add your Intelligence modifier to one damage roll of that spell.',
            },
            {
              name: 'Firestorm Expertise',
              description:
                'You learn the Fire Bolt cantrip if you don\'t already know it. When you deal fire damage with a spell, you can reroll any 1s on the damage dice (you must use the new roll).',
            },
          ],
        },
        {
          name: 'Sage',
          features: [
            {
              name: 'Mystical Understanding',
              description:
                'You gain proficiency in the Arcana skill if you don\'t already have it. Your proficiency bonus is doubled for any Intelligence check you make that uses Arcana.',
            },
            {
              name: 'Spellbreaker',
              description:
                'When a creature you can see within 60 feet casts a spell, you can use your reaction to impose disadvantage on the spell\'s attack roll or grant advantage on the saving throw against it. You can use this feature a number of times equal to your Intelligence modifier (minimum of once) per long rest.',
            },
          ],
        },
      ],
    },
    {
      name: 'Acolyte',
      hitDie: 8,
      primaryAbility: ['WIS'],
      savingThrows: ['WIS', 'CHA'],
      armorProficiencies: ['light', 'medium', 'shields'],
      weaponProficiencies: ['simple'],
      skillChoices: {
        options: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
        count: 2,
      },
      startingEquipment: {
        choices: [
          {
            description: 'Choose a weapon:',
            options: [
              {
                label: 'Mace',
                items: [{ name: 'Mace' }],
              },
              {
                label: 'Quarterstaff',
                items: [{ name: 'Quarterstaff' }],
              },
            ],
          },
          {
            description: 'Choose armor:',
            options: [
              {
                label: 'Scale Mail',
                items: [{ name: 'Scale Mail' }],
              },
              {
                label: 'Leather Armor',
                items: [{ name: 'Leather Armor' }],
              },
            ],
          },
        ],
        fixed: [
          { name: 'Shield' },
          { name: 'Holy Symbol (Amulet)' },
        ],
      },
      features: [
        {
          name: 'Heal',
          description:
            'As an action, you can restore hit points to a creature you touch. The creature regains 1d8 + your Wisdom modifier hit points. You can use this feature a number of times equal to your proficiency bonus per long rest.',
        },
        {
          name: 'Turn Undead',
          description:
            'As an action, you present your holy symbol and speak a prayer. Each undead within 30 feet that can see or hear you must make a Wisdom saving throw (DC 8 + your proficiency bonus + your Wisdom modifier). On a failed save, the creature is turned for 1 minute or until it takes damage.',
        },
      ],
      spellcasting: {
        ability: 'WIS',
        cantripsKnown: 3,
        spellSlots: 2,
        spellsPrepared: 4,
      },
      subclasses: [
        {
          name: 'Priest',
          features: [
            {
              name: 'Blessing of the Gods',
              description:
                'As a bonus action, you can bless a creature within 30 feet. For 1 minute, the target can add 1d4 to one attack roll or saving throw per turn. You can use this feature a number of times equal to your Wisdom modifier (minimum of once) per long rest.',
            },
            {
              name: 'Sanctuary',
              description:
                'As a bonus action, you can ward a creature within 30 feet. Until the start of your next turn, any creature that targets the warded creature with an attack or harmful spell must first make a Wisdom saving throw. On a failed save, the creature must choose a new target or lose the attack or spell.',
            },
          ],
        },
        {
          name: 'Monk',
          features: [
            {
              name: 'Iron Fists',
              description:
                'Your unarmed strikes deal 1d6 bludgeoning damage. When you take the Attack action with an unarmed strike, you can make one additional unarmed strike as a bonus action.',
            },
            {
              name: 'Inner Focus',
              description:
                'You can use your Wisdom modifier instead of Dexterity for AC calculation when not wearing armor or using a shield (AC = 10 + your Wisdom modifier + your Dexterity modifier). You also have advantage on saving throws against being stunned.',
            },
          ],
        },
      ],
    },
  ],
  backgrounds: [
    {
      name: 'Prontera Citizen',
      abilityOptions: ['STR', 'WIS', 'CHA'],
      skillProficiencies: ['Athletics', 'Religion'],
      toolProficiency: 'Vehicles (land)',
      equipment: [
        { name: 'Chain Mail', quantity: 1 },
        { name: 'Holy Symbol (Amulet)', quantity: 1 },
        { name: 'Pouch', quantity: 1 },
        { name: "Clothes, Traveler's", quantity: 1 },
      ],
      feature: {
        name: "Knight's Authority",
        description:
          'You can invoke the name of the Prontera Knight Order to gain minor assistance from city guards, militia members, and devout citizens. They may provide you with basic supplies, directions, or brief shelter, though they will not risk their lives for you.',
      },
      originFeat: 'Sentinel',
      personalityTraits: [
        'I stand at attention when anyone of rank speaks, a habit from growing up near the Knight Order.',
        'I believe every problem can be solved with enough honor and a sturdy blade.',
        'I light a candle at every temple I pass, whispering a prayer for Prontera\'s safety.',
        'I keep my armor polished to a mirror shine, even when sleeping in the wild.',
      ],
      ideals: [
        'Order. The laws of Prontera keep people safe, and they should be upheld everywhere. (Lawful)',
        'Protection. I will shield the weak from harm, no matter the cost to myself. (Good)',
        'Glory. My deeds will be spoken of in the halls of Prontera for generations. (Any)',
        'Faith. The gods watch over us, and I act as their hand in this world. (Lawful)',
      ],
      bonds: [
        'The Prontera Cathedral is my spiritual home; I would do anything to protect it.',
        'I owe my training to a knight captain who saw potential in a street orphan.',
        'I carry a letter from a fallen comrade that I have sworn to deliver to their family.',
      ],
      flaws: [
        'I look down on those who lack discipline or martial training.',
        'I am inflexible in my beliefs and refuse to consider that the Knight Order could be wrong.',
        'I cannot resist a direct challenge to my honor, even when it is clearly a trap.',
      ],
    },
    {
      name: 'Morroc Wanderer',
      abilityOptions: ['DEX', 'INT', 'CHA'],
      skillProficiencies: ['Deception', 'Survival'],
      toolProficiency: "Thieves' tools",
      equipment: [
        { name: "Clothes, Traveler's", quantity: 1 },
        { name: 'Dagger', quantity: 1 },
        { name: 'Pouch', quantity: 1 },
        { name: 'Waterskin', quantity: 1 },
      ],
      feature: {
        name: 'Street Connections',
        description:
          'You have contacts in the underground networks of most major cities. When you arrive in a settlement, you can locate a black-market dealer, fence, or information broker within a few hours. These contacts will trade with you and share local rumors, though their information is not always reliable.',
      },
      originFeat: 'Alert',
      personalityTraits: [
        'I never sit with my back to a door — old habits from the alleys of Morroc.',
        'I speak in riddles and half-truths, even when there is no reason to be evasive.',
        'I carry a handful of desert sand in my pocket to remind me where I came from.',
        'I size up every person I meet, calculating what they have and how easily I could take it.',
      ],
      ideals: [
        'Freedom. No one should be bound by chains, laws, or loyalty they did not choose. (Chaotic)',
        'Survival. The desert taught me that only the resourceful endure. (Any)',
        'Ambition. I left Morroc with nothing; I intend to build an empire. (Neutral)',
        'Community. Even thieves look after their own — loyalty to your crew is everything. (Lawful)',
      ],
      bonds: [
        'I am searching for a legendary treasure buried beneath the ruins of old Morroc.',
        'A guild master in Morroc saved my life, and I will repay that debt no matter what.',
        'I stole something valuable from the wrong person, and they have not stopped looking for me.',
      ],
      flaws: [
        'I cannot resist the temptation to pocket something valuable when no one is looking.',
        'I trust no one completely, and I always have an escape plan ready.',
        'I owe dangerous people a great deal of money, and they are running out of patience.',
      ],
    },
  ],
  equipment: [
    {
      kind: 'weapon',
      name: 'Katar',
      category: 'martial',
      damage: '1d6',
      damageType: 'piercing',
      properties: ['finesse', 'light'],
      weight: 2,
      cost: '25 gp',
    },
    {
      kind: 'weapon',
      name: 'Composite Bow',
      category: 'martial',
      damage: '1d8',
      damageType: 'piercing',
      properties: ['ammunition', 'two-handed'],
      range: { normal: 150, long: 600 },
      weight: 3,
      cost: '75 gp',
    },
    {
      kind: 'weapon',
      name: 'Stiletto',
      category: 'simple',
      damage: '1d4',
      damageType: 'piercing',
      properties: ['finesse', 'light', 'thrown'],
      range: { normal: 20, long: 60 },
      weight: 1,
      cost: '5 gp',
    },
    {
      kind: 'armor',
      name: 'Rune Mail',
      category: 'medium',
      baseAC: 14,
      addDex: true,
      maxDexBonus: 2,
      stealthDisadvantage: false,
      weight: 40,
      cost: '200 gp',
    },
  ],
};
