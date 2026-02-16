/**
 * Transform raw 5e SRD class data into src/data/classes.json
 * matching the CharacterClass type.
 *
 * Usage: node scripts/transform-classes.cjs
 */

const fs = require('fs');
const path = require('path');

const RAW = path.join(__dirname, '..', 'raw-dnd-data', '2014');
const OUT = path.join(__dirname, '..', 'src', 'data', 'classes.json');

const rawClasses = JSON.parse(fs.readFileSync(path.join(RAW, '5e-SRD-Classes.json'), 'utf-8'));
const rawFeatures = JSON.parse(fs.readFileSync(path.join(RAW, '5e-SRD-Features.json'), 'utf-8'));
const rawSubclasses = JSON.parse(fs.readFileSync(path.join(RAW, '5e-SRD-Subclasses.json'), 'utf-8'));

// --- Lookup tables ---

// Primary abilities from docs/rules/classes.md
const PRIMARY_ABILITY = {
  barbarian: ['STR'],
  bard: ['CHA'],
  cleric: ['WIS'],
  druid: ['WIS'],
  fighter: ['STR', 'DEX'],
  monk: ['DEX', 'WIS'],
  paladin: ['STR', 'CHA'],
  ranger: ['DEX', 'WIS'],
  rogue: ['DEX'],
  sorcerer: ['CHA'],
  warlock: ['CHA'],
  wizard: ['INT'],
};

// Map saving-throw proficiency index to AbilityName
const SAVE_MAP = {
  'saving-throw-str': 'STR',
  'saving-throw-dex': 'DEX',
  'saving-throw-con': 'CON',
  'saving-throw-int': 'INT',
  'saving-throw-wis': 'WIS',
  'saving-throw-cha': 'CHA',
};

// Map armor proficiency index to ArmorProficiency
const ARMOR_MAP = {
  'light-armor': 'light',
  'medium-armor': 'medium',
  'heavy-armor': 'heavy',
  'all-armor': null, // expand to light + medium + heavy
  'shields': 'shields',
};

// Map weapon proficiency index to WeaponProficiency
const WEAPON_MAP = {
  'simple-weapons': 'simple',
  'martial-weapons': 'martial',
};

// Specific weapon index -> display name
const SPECIFIC_WEAPONS = {
  'longswords': 'Longsword',
  'rapiers': 'Rapier',
  'shortswords': 'Shortsword',
  'hand-crossbows': 'Hand crossbow',
  'clubs': 'Club',
  'daggers': 'Dagger',
  'javelins': 'Javelin',
  'maces': 'Mace',
  'quarterstaffs': 'Quarterstaff',
  'sickles': 'Sickle',
  'spears': 'Spear',
  'darts': 'Dart',
  'slings': 'Sling',
  'scimitars': 'Scimitar',
  'light-crossbows': 'Light crossbow',
  'crossbows-light': 'Light crossbow',
};

// Spellcasting info for level-1 casters.
// Paladin and Ranger don't cast at level 1, so they are omitted.
const SPELLCASTING = {
  bard: { ability: 'CHA', cantripsKnown: 2, spellSlots: 2, spellsPrepared: 4 },
  cleric: { ability: 'WIS', cantripsKnown: 3, spellSlots: 2 },
  druid: { ability: 'WIS', cantripsKnown: 2, spellSlots: 2 },
  sorcerer: { ability: 'CHA', cantripsKnown: 4, spellSlots: 2, spellsPrepared: 2 },
  warlock: { ability: 'CHA', cantripsKnown: 2, spellSlots: 1, spellsPrepared: 2, isPactMagic: true },
  wizard: { ability: 'INT', cantripsKnown: 3, spellSlots: 2 },
};

// Life Domain subclass gets heavy armor and spellcasting on the subclass
const LIFE_DOMAIN_SPELLCASTING = {
  ability: 'WIS',
  cantripsKnown: 0,
  spellSlots: 0,
};

// --- Helper functions ---

function extractSkillName(skillRef) {
  // "Skill: Animal Handling" -> "Animal Handling"
  return skillRef.name.replace(/^Skill:\s*/, '');
}

function extractSavingThrows(proficiencies) {
  const saves = [];
  for (const prof of proficiencies) {
    if (SAVE_MAP[prof.index]) {
      saves.push(SAVE_MAP[prof.index]);
    }
  }
  return saves;
}

function extractArmorProficiencies(proficiencies) {
  const armors = [];
  for (const prof of proficiencies) {
    if (prof.index === 'all-armor') {
      armors.push('light', 'medium', 'heavy');
    } else if (ARMOR_MAP[prof.index] !== undefined) {
      if (ARMOR_MAP[prof.index] !== null) {
        armors.push(ARMOR_MAP[prof.index]);
      }
    }
  }
  return armors;
}

function extractWeaponProficiencies(proficiencies) {
  const weapons = [];
  for (const prof of proficiencies) {
    if (WEAPON_MAP[prof.index]) {
      weapons.push(WEAPON_MAP[prof.index]);
    } else if (SPECIFIC_WEAPONS[prof.index]) {
      weapons.push(SPECIFIC_WEAPONS[prof.index]);
    }
  }
  return weapons;
}

function extractSkillChoices(rawClass) {
  // Find skill proficiency choices
  for (const choice of rawClass.proficiency_choices || []) {
    if (!choice.from || !choice.from.options) continue;
    const firstOpt = choice.from.options[0];
    if (!firstOpt) continue;
    const item = firstOpt.item || firstOpt;
    if (item && item.index && item.index.startsWith('skill-')) {
      const options = choice.from.options
        .map(opt => extractSkillName(opt.item || opt))
        .sort();
      return { options, count: choice.choose };
    }
  }
  return { options: [], count: 0 };
}

// Fighting Style sub-options that should not appear as separate features
const FIGHTING_STYLE_VARIANTS = new Set([
  'Fighting Style: Archery',
  'Fighting Style: Defense',
  'Fighting Style: Dueling',
  'Fighting Style: Great Weapon Fighting',
  'Fighting Style: Protection',
  'Fighting Style: Two-Weapon Fighting',
]);

// Dragon Ancestor sub-options that should not appear as separate features
const DRAGON_ANCESTOR_VARIANTS = new Set([
  'Dragon Ancestor: Black - Acid Damage',
  'Dragon Ancestor: Blue - Lightning Damage',
  'Dragon Ancestor: Brass - Fire Damage',
  'Dragon Ancestor: Bronze - Lightning Damage',
  'Dragon Ancestor: Copper - Acid Damage',
  'Dragon Ancestor: Gold - Fire Damage',
  'Dragon Ancestor: Green - Poison Damage',
  'Dragon Ancestor: Red - Fire Damage',
  'Dragon Ancestor: Silver - Cold Damage',
  'Dragon Ancestor: White - Cold Damage',
]);

function getLevel1Features(classIndex) {
  return rawFeatures
    .filter(f =>
      f.class.index === classIndex &&
      f.level === 1 &&
      !f.subclass &&
      !FIGHTING_STYLE_VARIANTS.has(f.name)
    )
    .map(f => ({
      name: f.name,
      description: f.desc.join('\n'),
    }));
}

function getSubclassLevel1Features(subclassIndex) {
  return rawFeatures
    .filter(f =>
      f.subclass &&
      f.subclass.index === subclassIndex &&
      f.level === 1 &&
      !DRAGON_ANCESTOR_VARIANTS.has(f.name)
    )
    .map(f => ({
      name: f.name,
      description: f.desc.join('\n'),
    }));
}

function getSubclasses(classIndex) {
  return rawSubclasses
    .filter(sc => sc.class.index === classIndex)
    .map(sc => {
      const sub = {
        name: sc.name,
        features: getSubclassLevel1Features(sc.index),
      };
      // Life Domain Cleric subclass grants heavy armor + domain spells
      // but the spellcasting field on subclass is for subclass-specific casting
      // which Life domain doesn't have independently
      return sub;
    });
}

// --- Main transformation ---

const classes = rawClasses.map(raw => {
  const classIndex = raw.index;

  const result = {
    name: raw.name,
    hitDie: raw.hit_die,
    primaryAbility: PRIMARY_ABILITY[classIndex],
    savingThrows: extractSavingThrows(raw.proficiencies),
    armorProficiencies: extractArmorProficiencies(raw.proficiencies),
    weaponProficiencies: extractWeaponProficiencies(raw.proficiencies),
    skillChoices: extractSkillChoices(raw),
    features: getLevel1Features(classIndex),
    subclasses: getSubclasses(classIndex),
  };

  // Add spellcasting if this class casts at level 1
  if (SPELLCASTING[classIndex]) {
    result.spellcasting = { ...SPELLCASTING[classIndex] };
  }

  return result;
});

// Sort alphabetically by name
classes.sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(OUT, JSON.stringify(classes, null, 2) + '\n', 'utf-8');

console.log(`Wrote ${classes.length} classes to ${OUT}`);
for (const c of classes) {
  const featureNames = c.features.map(f => f.name).join(', ');
  const subNames = c.subclasses.map(s => s.name).join(', ');
  console.log(`  ${c.name}: ${c.hitDie}HD, saves=[${c.savingThrows}], armor=[${c.armorProficiencies}], weapons=[${c.weaponProficiencies}], skills=${c.skillChoices.count} of ${c.skillChoices.options.length}, features=[${featureNames}], subclasses=[${subNames}]${c.spellcasting ? ', caster' : ''}`);
}
