import type { ExpansionPack } from '../../types/expansion-pack';

/**
 * Shadowrun expansion pack.
 * Adds content inspired by the cyberpunk-fantasy TTRPG Shadowrun:
 * Elf/Dwarf/Ork/Troll/Metahuman species, Street Samurai/Adept/Mage/Shaman/Decker/Face
 * classes (each with 2 subclasses), Corporate SINner/Shadowrunner backgrounds,
 * and cyberpunk-themed equipment (firearms, monofilament whip, armor jacket, cyberware).
 *
 * Note: "Metahuman" is used for the Shadowrun Human to avoid collision with the
 * base content "Human" species.
 */
export const SHADOWRUN_PACK: ExpansionPack = {
  id: 'shadowrun',
  name: 'Shadowrun',
  description:
    'Adds content inspired by the Shadowrun TTRPG: Elf, Dwarf, Ork, Troll, and Metahuman species, Street Samurai/Adept/Mage/Shaman/Decker/Face classes with subclasses, and Corporate SINner/Shadowrunner backgrounds.',
  species: [
    {
      name: 'Elf',
      speed: 35,
      size: 'Medium',
      traits: [
        {
          name: 'Low-Light Vision',
          description: 'You have darkvision out to 60 feet.',
        },
        {
          name: 'Elven Grace',
          description:
            'You have proficiency in the Perception skill. Your lithe frame gives you advantage on saving throws against being charmed.',
        },
        {
          name: 'Elven Charm',
          description:
            'You know the Friends cantrip. Charisma is your spellcasting ability for it.',
        },
      ],
      languages: ['Common', 'Sperethiel'],
      subspecies: [],
      abilityBonuses: { DEX: 2, CHA: 1 },
    },
    {
      name: 'Dwarf',
      speed: 25,
      size: 'Small',
      traits: [
        {
          name: 'Thermographic Vision',
          description:
            'You have darkvision out to 60 feet. Your thermal vision allows you to detect heat signatures, granting advantage on Wisdom (Perception) checks to detect hidden living creatures within 30 feet.',
        },
        {
          name: 'Dwarven Resilience',
          description:
            'You have advantage on saving throws against poison, and you have resistance to poison damage.',
        },
        {
          name: 'Squat & Sturdy',
          description:
            'Your speed is not reduced by wearing heavy armor. You also have advantage on saving throws against being knocked prone or forcibly moved.',
        },
      ],
      languages: ['Common', "Or'zet"],
      subspecies: [],
      abilityBonuses: { CON: 2, WIS: 1 },
    },
    {
      name: 'Ork',
      speed: 30,
      size: 'Medium',
      traits: [
        {
          name: 'Low-Light Vision',
          description: 'You have darkvision out to 30 feet.',
        },
        {
          name: 'Ork Toughness',
          description:
            'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.',
        },
        {
          name: 'Intimidating Presence',
          description:
            'You have proficiency in the Intimidation skill. You can use your Strength modifier instead of Charisma when making Intimidation checks.',
        },
      ],
      languages: ['Common', "Or'zet"],
      subspecies: [],
      abilityBonuses: { STR: 2, CON: 1 },
    },
    {
      name: 'Troll',
      speed: 30,
      size: 'Medium',
      traits: [
        {
          name: 'Thermographic Vision',
          description: 'You have darkvision out to 60 feet.',
        },
        {
          name: 'Dermal Armor',
          description:
            'Your thick, bony skin provides natural protection. When you are not wearing armor, your AC equals 13 + your Dexterity modifier. You can use a shield and still gain this benefit.',
        },
        {
          name: 'Reach',
          description:
            'Your massive frame extends your reach. Your melee attacks have a reach of 10 feet instead of 5 feet when using weapons with the reach property.',
        },
        {
          name: 'Troll Physique',
          description:
            'You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift.',
        },
      ],
      languages: ['Common', "Or'zet"],
      subspecies: [],
      abilityBonuses: { STR: 2, CON: 1 },
    },
    {
      name: 'Metahuman',
      speed: 30,
      size: 'Medium',
      traits: [
        {
          name: 'Adaptability',
          description:
            'You gain proficiency in one skill of your choice and one tool of your choice.',
        },
        {
          name: 'Versatile Training',
          description:
            'You gain one feat of your choice for which you qualify. (At level 1, this is typically a general feat with no prerequisites.)',
        },
      ],
      languages: ['Common', 'one of choice'],
      subspecies: [],
      abilityBonuses: { DEX: 1, INT: 1, CHA: 1 },
    },
  ],
  classes: [
    {
      name: 'Street Samurai',
      hitDie: 10,
      primaryAbility: ['STR', 'DEX'],
      savingThrows: ['STR', 'CON'],
      armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
      weaponProficiencies: ['simple', 'martial'],
      skillChoices: {
        options: [
          'Acrobatics',
          'Athletics',
          'Intimidation',
          'Perception',
          'Stealth',
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
                label: 'Two handaxes',
                items: [{ name: 'Handaxe', quantity: 2 }],
              },
            ],
          },
          {
            description: 'Choose armor:',
            options: [
              {
                label: 'Chain Mail',
                items: [{ name: 'Chain Mail' }],
              },
              {
                label: 'Leather Armor',
                items: [{ name: 'Leather Armor' }],
              },
            ],
          },
        ],
        fixed: [{ name: 'Dagger', quantity: 2 }],
      },
      features: [
        {
          name: 'Wired Reflexes',
          description:
            'Your cybernetically enhanced reflexes grant you a +2 bonus to initiative rolls. Additionally, you cannot be surprised while you are conscious.',
        },
        {
          name: 'Street Combat',
          description:
            'When you hit a creature with a weapon attack on your first turn in combat, you deal an extra 1d6 damage of the weapon\'s type. This increases to 2d6 at 5th level.',
        },
      ],
      subclasses: [
        {
          name: 'Cyber Warrior',
          features: [
            {
              name: 'Dermal Plating',
              description:
                'Your implanted subdermal armor grants you a +1 bonus to AC while you are wearing armor.',
            },
            {
              name: 'Boosted Reflexes',
              description:
                'When you take the Attack action, you can make one additional weapon attack as a bonus action. You can use this feature a number of times equal to your proficiency bonus per long rest.',
            },
          ],
        },
        {
          name: 'Blade Adept',
          features: [
            {
              name: 'Implant Blades',
              description:
                'You have retractable blades implanted in your forearms. They count as finesse martial melee weapons that deal 1d6 slashing damage. Drawing or sheathing them requires no action.',
            },
            {
              name: 'Flurry of Blades',
              description:
                'When you take the Attack action with your implant blades or a melee weapon with the finesse property, you can make one additional attack as a bonus action. This attack deals an extra 1d4 damage of the weapon\'s type.',
            },
          ],
        },
      ],
    },
    {
      name: 'Adept',
      hitDie: 8,
      primaryAbility: ['STR', 'DEX'],
      savingThrows: ['STR', 'WIS'],
      armorProficiencies: ['light'],
      weaponProficiencies: ['simple', 'martial'],
      skillChoices: {
        options: [
          'Acrobatics',
          'Athletics',
          'Insight',
          'Perception',
          'Stealth',
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
                label: 'Shortsword',
                items: [{ name: 'Shortsword' }],
              },
              {
                label: 'Quarterstaff',
                items: [{ name: 'Quarterstaff' }],
              },
            ],
          },
        ],
        fixed: [
          { name: 'Dart', quantity: 10 },
          { name: 'Leather Armor' },
        ],
      },
      features: [
        {
          name: 'Chi Focus',
          description:
            'You channel magical energy through your body to enhance your physical abilities. Your unarmed strikes deal 1d6 bludgeoning damage. While you are not wearing armor or wielding a shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier.',
        },
        {
          name: 'Killing Hands',
          description:
            'Your unarmed strikes count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage. When you hit with an unarmed strike, you can spend your reaction to deal an extra 1d4 force damage.',
        },
      ],
      subclasses: [
        {
          name: 'Way of the Warrior',
          features: [
            {
              name: 'Mystic Strike',
              description:
                'When you take the Attack action with an unarmed strike, you can make one additional unarmed strike as a bonus action. This extra attack deals an additional 1d4 force damage.',
            },
            {
              name: 'Iron Skin',
              description:
                'You can use your reaction to reduce damage from an attack that hits you by 1d8 + your Wisdom modifier. You can use this feature a number of times equal to your proficiency bonus per long rest.',
            },
          ],
        },
        {
          name: 'Way of the Speaker',
          features: [
            {
              name: 'Voice of Command',
              description:
                'As an action, you can speak a word of power to a creature within 30 feet that can hear you. The target must succeed on a Wisdom saving throw (DC 8 + your proficiency bonus + your Wisdom modifier) or be charmed by you until the end of your next turn. You can use this feature a number of times equal to your Wisdom modifier (minimum of once) per long rest.',
            },
            {
              name: 'Empathic Sense',
              description:
                'You can sense the emotional state of creatures within 30 feet of you. You have advantage on Wisdom (Insight) checks to determine if a creature is lying or to discern its intentions.',
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
          name: 'Astral Perception',
          description:
            'As a bonus action, you can open your senses to the astral plane. For 1 minute, you can see invisible creatures and objects within 30 feet, and you have advantage on saving throws against spells. You can use this feature a number of times equal to your proficiency bonus per long rest.',
        },
        {
          name: 'Spellcasting',
          description:
            'You have learned to channel mana through force of will. Intelligence is your spellcasting ability. You know two cantrips and can prepare spells from the mage spell list each day after a long rest.',
        },
      ],
      spellcasting: {
        ability: 'INT',
        cantripsKnown: 2,
        spellSlots: 2,
      },
      subclasses: [
        {
          name: 'Hermetic Mage',
          features: [
            {
              name: 'Formulaic Casting',
              description:
                'When you cast a spell that requires a saving throw, you can add +1 to the spell save DC. You can use this feature a number of times equal to your Intelligence modifier (minimum of once) per long rest.',
            },
            {
              name: 'Spell Defense',
              description:
                'When you or a creature within 30 feet is targeted by a spell, you can use your reaction to grant the target advantage on its saving throw against the spell. You can use this feature a number of times equal to your proficiency bonus per long rest.',
            },
          ],
        },
        {
          name: 'Chaos Mage',
          features: [
            {
              name: 'Wild Surge',
              description:
                'When you cast a spell of 1st level or higher, you can choose to add your Intelligence modifier to one damage roll of that spell. If you do, roll a d20. On a 1, the spell also deals 1d6 force damage to you.',
            },
            {
              name: 'Mana Flux',
              description:
                'When you roll initiative and have no spell slots remaining, you regain one 1st-level spell slot.',
            },
          ],
        },
      ],
    },
    {
      name: 'Shaman',
      hitDie: 8,
      primaryAbility: ['WIS'],
      savingThrows: ['WIS', 'CHA'],
      armorProficiencies: ['light', 'shields'],
      weaponProficiencies: ['simple'],
      skillChoices: {
        options: [
          'Animal Handling',
          'Insight',
          'Medicine',
          'Nature',
          'Perception',
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
                label: 'Leather Armor',
                items: [{ name: 'Leather Armor' }],
              },
              {
                label: 'Hide Armor',
                items: [{ name: 'Hide Armor' }],
              },
            ],
          },
        ],
        fixed: [
          { name: 'Shield' },
          { name: 'Totem (Druidic Focus)' },
        ],
      },
      features: [
        {
          name: 'Spirit Ally',
          description:
            'You have forged a bond with a nature spirit. As a bonus action, you can summon your spirit ally to an unoccupied space within 30 feet. The spirit has AC 13, hit points equal to 5 + your Wisdom modifier, and can take the Help action on your turn (no action required by you). The spirit lasts for 1 hour or until reduced to 0 hit points. You can use this feature once per long rest.',
        },
        {
          name: 'Spellcasting',
          description:
            'You channel magic through your connection to the spirit world. Wisdom is your spellcasting ability. You know two cantrips and prepare spells from the shaman spell list each day after a long rest.',
        },
      ],
      spellcasting: {
        ability: 'WIS',
        cantripsKnown: 2,
        spellSlots: 2,
        spellsPrepared: 3,
      },
      subclasses: [
        {
          name: 'Totem Shaman',
          features: [
            {
              name: 'Totem Bond',
              description:
                'Choose a totem animal: Bear (gain +1 to Constitution saving throws), Wolf (allies within 10 feet gain advantage on melee attack rolls against creatures within 5 feet of you), or Eagle (you have advantage on Wisdom (Perception) checks that rely on sight).',
            },
            {
              name: 'Spirit Surge',
              description:
                'When your spirit ally is summoned, it can also take the Dodge action on your turn. Additionally, when your spirit ally is reduced to 0 hit points, it explodes in spiritual energy, dealing 1d6 radiant damage to each hostile creature within 10 feet of it.',
            },
          ],
        },
        {
          name: 'Idol Shaman',
          features: [
            {
              name: 'Idol Worship',
              description:
                'You carry a sacred idol that serves as your spellcasting focus. While holding your idol, you can add your Wisdom modifier to one healing spell you cast per long rest (in addition to any other modifiers).',
            },
            {
              name: 'Ancestral Guidance',
              description:
                'You can cast Augury once per long rest without expending a spell slot. When you do, the spirits of your ancestors answer, and the DM gives you a clearer response than the spell normally provides.',
            },
          ],
        },
      ],
    },
    {
      name: 'Decker',
      hitDie: 8,
      primaryAbility: ['INT'],
      savingThrows: ['INT', 'DEX'],
      armorProficiencies: ['light'],
      weaponProficiencies: ['simple'],
      skillChoices: {
        options: [
          'Arcana',
          'Deception',
          'History',
          'Investigation',
          'Perception',
          'Sleight of Hand',
          'Stealth',
        ],
        count: 3,
      },
      startingEquipment: {
        choices: [
          {
            description: 'Choose a weapon:',
            options: [
              {
                label: 'Light Crossbow and 20 bolts',
                items: [{ name: 'Light Crossbow' }, { name: 'Bolts (20)' }],
              },
              {
                label: 'Shortsword',
                items: [{ name: 'Shortsword' }],
              },
            ],
          },
        ],
        fixed: [
          { name: 'Leather Armor' },
          { name: 'Dagger', quantity: 2 },
        ],
      },
      features: [
        {
          name: 'Matrix Interface',
          description:
            'You have a cyberdeck implant that allows you to interface with electronic devices. You have advantage on Intelligence checks to interact with, hack, or understand electronic or mechanical devices. You can also communicate silently with any willing creature that has a commlink within 100 feet.',
        },
        {
          name: 'Exploit Weakness',
          description:
            'When you hit a creature with a weapon attack, you can analyze its defenses. Until the end of your next turn, the next attack roll made against that creature by you or an ally has advantage. You can use this feature a number of times equal to your Intelligence modifier (minimum of once) per long rest.',
        },
      ],
      subclasses: [
        {
          name: 'Black Hat',
          features: [
            {
              name: 'System Overload',
              description:
                'As an action, you can target one creature wearing metal armor or carrying a device within 60 feet. The target must make a Constitution saving throw (DC 8 + your proficiency bonus + your Intelligence modifier) or take 2d6 lightning damage and be stunned until the end of its next turn. On a success, the target takes half damage and is not stunned. You can use this feature once per long rest.',
            },
            {
              name: 'Ghost in the Machine',
              description:
                'You can cast Disguise Self at will without expending a spell slot. The illusion includes visual alterations to any electronic displays or screens near you.',
            },
          ],
        },
        {
          name: 'Technomancer',
          features: [
            {
              name: 'Living Network',
              description:
                'Your connection to the digital world is innate. You can sense the presence and general location of electronic devices within 60 feet. You can also determine whether a device is active, dormant, or transmitting.',
            },
            {
              name: 'Data Sprite',
              description:
                'As a bonus action, you can summon a small digital sprite that assists you. The sprite is intangible, has a fly speed of 30 feet, and lasts for 10 minutes. It can scout ahead (you see through its senses), deliver short messages, or distract a creature (imposing disadvantage on its next Perception check). You can use this feature a number of times equal to your proficiency bonus per long rest.',
            },
          ],
        },
      ],
    },
    {
      name: 'Face',
      hitDie: 8,
      primaryAbility: ['CHA'],
      savingThrows: ['CHA', 'DEX'],
      armorProficiencies: ['light'],
      weaponProficiencies: ['simple'],
      skillChoices: {
        options: [
          'Deception',
          'Insight',
          'Intimidation',
          'Performance',
          'Persuasion',
          'Sleight of Hand',
        ],
        count: 3,
      },
      startingEquipment: {
        choices: [
          {
            description: 'Choose a weapon:',
            options: [
              {
                label: 'Rapier',
                items: [{ name: 'Rapier' }],
              },
              {
                label: 'Shortsword',
                items: [{ name: 'Shortsword' }],
              },
            ],
          },
        ],
        fixed: [
          { name: 'Leather Armor' },
          { name: 'Dagger', quantity: 2 },
        ],
      },
      features: [
        {
          name: 'Silver Tongue',
          description:
            'You have a natural talent for persuasion and deception. When you make a Charisma (Persuasion) or Charisma (Deception) check, you can treat a d20 roll of 7 or lower as an 8.',
        },
        {
          name: 'Read the Room',
          description:
            'You can quickly assess the social dynamics of any situation. As a bonus action, you can study a creature you can see within 30 feet. You learn whether the creature is hostile, indifferent, or friendly toward you, and you have advantage on your next Charisma check directed at that creature within the next minute.',
        },
      ],
      subclasses: [
        {
          name: 'Negotiator',
          features: [
            {
              name: 'Deal Maker',
              description:
                'When you succeed on a Charisma (Persuasion) check to negotiate or bargain, you can gain an additional concession from the target (DM discretion). Additionally, you and your allies have advantage on initiative rolls when combat starts during or immediately after a social encounter you were leading.',
            },
            {
              name: 'Calming Presence',
              description:
                'As an action, you can speak calming words to a creature within 30 feet that can hear and understand you. The target must succeed on a Wisdom saving throw (DC 8 + your proficiency bonus + your Charisma modifier) or become charmed by you for 1 minute or until you or your allies do anything harmful to it. You can use this feature a number of times equal to your Charisma modifier (minimum of once) per long rest.',
            },
          ],
        },
        {
          name: 'Con Artist',
          features: [
            {
              name: 'Master of Disguise',
              description:
                'You can create a disguise for yourself in 1 minute using minimal materials. While disguised, you have advantage on Charisma (Deception) checks to maintain your false identity. You also gain proficiency with the disguise kit if you do not already have it.',
            },
            {
              name: 'Misdirection',
              description:
                'When a creature makes an attack roll against you, you can use your reaction to choose another creature within 5 feet of you (other than the attacker). The attacker must redirect its attack to the chosen creature. You can use this feature a number of times equal to your proficiency bonus per long rest.',
            },
          ],
        },
      ],
    },
  ],
  backgrounds: [
    {
      name: 'Corporate SINner',
      abilityOptions: ['DEX', 'INT', 'CHA'],
      skillProficiencies: ['Deception', 'Persuasion'],
      toolProficiency: 'Forgery kit',
      equipment: [
        { name: 'Fine clothes', quantity: 1 },
        { name: 'Signet ring', quantity: 1 },
        { name: 'Pouch', quantity: 1 },
        { name: 'Scroll of pedigree', quantity: 1 },
      ],
      feature: {
        name: 'Corporate Credibility',
        description:
          'Your System Identification Number marks you as a legitimate corporate citizen. You can gain access to corporate facilities, request meetings with mid-level executives, and leverage your corporate affiliation to obtain credit, lodging, or minor favors in any major city. However, your SIN also makes you easier to track.',
      },
      originFeat: 'Alert',
      personalityTraits: [
        'I instinctively calculate the cost-benefit ratio of every decision before acting.',
        'I dress impeccably, even in the most dangerous situations — appearances matter.',
        'I drop corporate jargon into casual conversation without realizing it.',
        'I keep a mental dossier on everyone I meet, noting their weaknesses and leverage points.',
      ],
      ideals: [
        'Ambition. The corporate ladder is just the beginning — I aim for the top of the world. (Neutral)',
        'Loyalty. The corp raised me, trained me, and gave me purpose. I repay that debt. (Lawful)',
        'Freedom. I left the corporate world to escape its chains, and I will never go back willingly. (Chaotic)',
        'Power. Information is currency, and I intend to be wealthy beyond measure. (Evil)',
      ],
      bonds: [
        'I still have contacts inside my former corporation who feed me information — for a price.',
        'A corporate extraction team is hunting me for secrets I took when I left.',
        'I am secretly working to bring down the corporation from the outside.',
      ],
      flaws: [
        'I look down on people who lack refinement or education.',
        'I cannot resist a good deal, even when it is obviously too good to be true.',
        'I trust systems and protocols more than people, which makes me slow to form genuine bonds.',
      ],
    },
    {
      name: 'Shadowrunner',
      abilityOptions: ['STR', 'DEX', 'CON'],
      skillProficiencies: ['Stealth', 'Insight'],
      toolProficiency: "Thieves' Tools",
      equipment: [
        { name: "Traveler's clothes", quantity: 1 },
        { name: 'Dagger', quantity: 1 },
        { name: 'Pouch', quantity: 1 },
        { name: 'Crowbar', quantity: 1 },
      ],
      feature: {
        name: 'Street Contacts',
        description:
          'You have a network of contacts in the criminal underworld. When you arrive in a settlement, you can locate a fixer, black-market dealer, or safe house within a few hours. Your contacts can arrange meetings, fence stolen goods, or provide rumors about local power players — though their loyalty extends only as far as your credstick.',
      },
      originFeat: 'Tough',
      personalityTraits: [
        'I never use my real name — not even my team knows it.',
        "I always plan two exits from every room I enter. It's not paranoia if they're really out to get you.",
        "I keep a go-bag packed at all times. You never know when you'll need to vanish.",
        'I speak in a clipped, professional manner during runs — emotion is a liability.',
      ],
      ideals: [
        "Professionalism. A job is a job. I don't ask questions, and I deliver results. (Lawful)",
        'Freedom. The shadows are the only place where you answer to no one. (Chaotic)',
        'Loyalty. Your team is your family in the shadows — you never leave them behind. (Good)',
        'Survival. The only rule that matters is making it to tomorrow. (Neutral)',
      ],
      bonds: [
        'I owe a debt to a fixer who saved my life, and they intend to collect.',
        'A run went wrong and my old team was killed — I need to find out who set us up.',
        'I am building a reputation in the shadows so I can one day retire somewhere safe.',
      ],
      flaws: [
        'I trust no one completely and always expect betrayal.',
        "I take unnecessary risks for a bigger payout — I can't resist the thrill.",
        'I have a price on my head from a previous run, and it follows me everywhere.',
      ],
    },
  ],
  equipment: [
    {
      kind: 'weapon',
      name: 'Heavy Pistol',
      category: 'simple',
      damage: '1d6',
      damageType: 'piercing',
      properties: ['ammunition'],
      range: { normal: 30, long: 90 },
      weight: 3,
      cost: '25 gp',
    },
    {
      kind: 'weapon',
      name: 'Assault Rifle',
      category: 'martial',
      damage: '1d8',
      damageType: 'piercing',
      properties: ['ammunition', 'two-handed'],
      range: { normal: 80, long: 320 },
      weight: 8,
      cost: '75 gp',
    },
    {
      kind: 'weapon',
      name: 'Monofilament Whip',
      category: 'martial',
      damage: '1d8',
      damageType: 'slashing',
      properties: ['finesse', 'reach'],
      weight: 2,
      cost: '50 gp',
    },
    {
      kind: 'armor',
      name: 'Armor Jacket',
      category: 'medium',
      baseAC: 13,
      addDex: true,
      maxDexBonus: 2,
      stealthDisadvantage: false,
      weight: 10,
      cost: '50 gp',
    },
    {
      kind: 'gear',
      name: 'Datajack',
      description: 'Cybernetic interface for electronic devices. Allows direct neural connection to commlinks, cyberdecks, and other devices.',
      weight: 0,
      cost: '100 gp',
    },
    {
      kind: 'gear',
      name: 'Commlink',
      description: 'Personal computer and communications device. Can make calls, send messages, access the Matrix, and run basic applications.',
      weight: 1,
      cost: '50 gp',
    },
  ],
};
