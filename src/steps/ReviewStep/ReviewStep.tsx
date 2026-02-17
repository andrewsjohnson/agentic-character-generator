import type { StepProps } from '../types';
import type { AbilityName } from '../../types/ability';
import { ABILITY_NAMES } from '../../types/ability';
import { SKILL_NAMES } from '../../types/skill';
import { calculateAllModifiers, applyAbilityBonuses } from '../../rules/ability-scores';
import { calculateAC, getEquipmentByCategory } from '../../rules/equipment';
import { getSpeciesTraits, getSpeciesSpeed, getSpeciesBonuses } from '../../rules/species';
import { getClassProficiencies, getHitDie } from '../../rules/classes';
import {
  getProficiencyBonus,
  calculateHP,
  calculateSkillModifiers,
  calculateSpellSaveDC,
  calculateSpellAttackModifier,
  calculateInitiative,
  SKILL_TO_ABILITY,
} from '../../rules/derived-stats';

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

const ABILITY_LABELS: Record<AbilityName, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
};

export function ReviewStep({ character }: StepProps) {
  const level = character.level ?? 1;
  const proficiencyBonus = getProficiencyBonus(level);

  // Compute final ability scores (base + species bonuses)
  const baseScores = character.baseAbilityScores;
  const speciesBonuses = character.species
    ? getSpeciesBonuses(character.species, character.subspecies)
    : {};
  const finalScores = baseScores
    ? applyAbilityBonuses(baseScores, speciesBonuses)
    : undefined;
  const modifiers = finalScores ? calculateAllModifiers(finalScores) : undefined;

  // Combat stats
  const hitDie = character.class ? getHitDie(character.class) : undefined;
  const hp =
    hitDie !== undefined && modifiers
      ? calculateHP(hitDie, modifiers.CON)
      : undefined;
  const acOptions = character.class
    ? {
        characterClassName: character.class.name,
        wisModifier: modifiers?.WIS,
        conModifier: modifiers?.CON,
      }
    : undefined;
  const ac = modifiers
    ? calculateAC(character.equipment ?? [], modifiers.DEX, acOptions)
    : undefined;
  const initiative = modifiers ? calculateInitiative(modifiers.DEX) : undefined;
  const speed = character.species
    ? getSpeciesSpeed(character.species, character.subspecies)
    : undefined;

  // Saving throws
  const savingThrowProficiencies: readonly AbilityName[] = character.class?.savingThrows ?? [];

  // Skills
  const skillModifiers =
    modifiers
      ? calculateSkillModifiers(
          modifiers,
          character.skillProficiencies ?? [],
          proficiencyBonus,
        )
      : undefined;

  // Proficiencies
  const classProficiencies = character.class
    ? getClassProficiencies(character.class)
    : undefined;

  // Equipment
  const equipment = character.equipment ?? [];
  const categorizedEquipment = getEquipmentByCategory(equipment);

  // Species traits
  const speciesTraits = character.species
    ? getSpeciesTraits(character.species, character.subspecies)
    : [];

  // Class features
  const classFeatures = character.class?.features ?? [];

  // Background feature
  const backgroundFeature = character.background?.feature;

  // Spellcasting
  const spellcasting = character.class?.spellcasting;
  const spellSaveDC =
    spellcasting && modifiers
      ? calculateSpellSaveDC(modifiers[spellcasting.ability], proficiencyBonus)
      : undefined;
  const spellAttackMod =
    spellcasting && modifiers
      ? calculateSpellAttackModifier(
          modifiers[spellcasting.ability],
          proficiencyBonus,
        )
      : undefined;

  // Languages
  const speciesLanguages = character.species?.languages ?? [];
  const selectedLanguages = character.selectedLanguages ?? [];
  const allLanguages = [...speciesLanguages, ...selectedLanguages];

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Character Sheet</h2>

      {/* Header Section */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200"
        data-testid="header-section"
      >
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase">
            Name
          </span>
          <p className="text-lg font-bold" data-testid="character-name">
            {character.name || 'Unnamed Character'}
          </p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase">
            Species
          </span>
          <p className="text-lg font-semibold" data-testid="character-species">
            {character.subspecies
              ? `${character.subspecies.name} ${character.species?.name ?? ''}`
              : character.species?.name ?? 'Not selected'}
          </p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase">
            Class
          </span>
          <p className="text-lg font-semibold" data-testid="character-class">
            {character.class?.name ?? 'Not selected'}
          </p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase">
            Background
          </span>
          <p
            className="text-lg font-semibold"
            data-testid="character-background"
          >
            {character.background?.name ?? 'Not selected'}
          </p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase">
            Level
          </span>
          <p className="text-lg font-semibold" data-testid="character-level">
            {level}
          </p>
        </div>
      </div>

      {/* Ability Scores */}
      {finalScores && modifiers && (
        <div className="mb-8" data-testid="ability-scores-section">
          <h3 className="text-xl font-bold mb-4">Ability Scores</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {ABILITY_NAMES.map((ability) => (
              <div
                key={ability}
                className="text-center p-3 bg-white border-2 border-gray-300 rounded-lg"
                data-testid={`ability-${ability}`}
              >
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                  {ABILITY_LABELS[ability]}
                </div>
                <div className="text-2xl font-bold" data-testid={`modifier-${ability}`}>
                  {formatModifier(modifiers[ability])}
                </div>
                <div
                  className="text-sm text-gray-600 mt-1"
                  data-testid={`score-${ability}`}
                >
                  {finalScores[ability]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Combat Stats */}
      <div className="mb-8" data-testid="combat-stats-section">
        <h3 className="text-xl font-bold mb-4">Combat Stats</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <div className="text-center p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <div className="text-xs font-medium text-blue-600 uppercase mb-1">
              AC
            </div>
            <div className="text-2xl font-bold text-blue-800" data-testid="combat-ac">
              {ac ?? '—'}
            </div>
          </div>
          <div className="text-center p-3 bg-red-50 border-2 border-red-300 rounded-lg">
            <div className="text-xs font-medium text-red-600 uppercase mb-1">
              HP
            </div>
            <div className="text-2xl font-bold text-red-800" data-testid="combat-hp">
              {hp ?? '—'}
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 border-2 border-green-300 rounded-lg">
            <div className="text-xs font-medium text-green-600 uppercase mb-1">
              Initiative
            </div>
            <div className="text-2xl font-bold text-green-800" data-testid="combat-initiative">
              {initiative !== undefined ? formatModifier(initiative) : '—'}
            </div>
          </div>
          <div className="text-center p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <div className="text-xs font-medium text-yellow-700 uppercase mb-1">
              Speed
            </div>
            <div className="text-2xl font-bold text-yellow-800" data-testid="combat-speed">
              {speed !== undefined ? `${speed} ft` : '—'}
            </div>
          </div>
          <div className="text-center p-3 bg-purple-50 border-2 border-purple-300 rounded-lg">
            <div className="text-xs font-medium text-purple-600 uppercase mb-1">
              Hit Die
            </div>
            <div className="text-2xl font-bold text-purple-800" data-testid="combat-hit-die">
              {hitDie ? `d${hitDie}` : '—'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 border-2 border-gray-300 rounded-lg">
            <div className="text-xs font-medium text-gray-600 uppercase mb-1">
              Proficiency
            </div>
            <div className="text-2xl font-bold text-gray-800" data-testid="combat-proficiency">
              {formatModifier(proficiencyBonus)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div>
          {/* Saving Throws */}
          {modifiers && (
            <div className="mb-8" data-testid="saving-throws-section">
              <h3 className="text-xl font-bold mb-4">Saving Throws</h3>
              <div className="space-y-1">
                {ABILITY_NAMES.map((ability) => {
                  const isProficient = savingThrowProficiencies.includes(ability);
                  const mod =
                    modifiers[ability] +
                    (isProficient ? proficiencyBonus : 0);
                  return (
                    <div
                      key={ability}
                      className="flex items-center gap-2 py-1 px-2 rounded text-sm"
                      data-testid={`save-${ability}`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs ${
                          isProficient
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-400'
                        }`}
                        data-testid={`save-prof-${ability}`}
                      >
                        {isProficient ? '✓' : ''}
                      </span>
                      <span className="font-mono w-8 text-right" data-testid={`save-mod-${ability}`}>
                        {formatModifier(mod)}
                      </span>
                      <span className="text-gray-700">
                        {ABILITY_LABELS[ability]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skills */}
          {skillModifiers && (
            <div className="mb-8" data-testid="skills-section">
              <h3 className="text-xl font-bold mb-4">Skills</h3>
              <div className="space-y-1">
                {[...SKILL_NAMES]
                  .sort((a, b) => a.localeCompare(b))
                  .map((skill) => {
                    const ability = SKILL_TO_ABILITY[skill];
                    const isProficient = (
                      character.skillProficiencies ?? []
                    ).includes(skill);
                    return (
                      <div
                        key={skill}
                        className="flex items-center gap-2 py-1 px-2 rounded text-sm"
                        data-testid={`skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs ${
                            isProficient
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-400'
                          }`}
                          data-testid={`skill-prof-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {isProficient ? '✓' : ''}
                        </span>
                        <span className="font-mono w-8 text-right">
                          {formatModifier(skillModifiers[skill])}
                        </span>
                        <span className="text-gray-700">{skill}</span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {ability}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div>
          {/* Proficiencies & Languages */}
          <div className="mb-8" data-testid="proficiencies-section">
            <h3 className="text-xl font-bold mb-4">
              Proficiencies & Languages
            </h3>

            {classProficiencies && (
              <>
                {classProficiencies.armor.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">
                      Armor
                    </h4>
                    <p className="text-sm text-gray-800" data-testid="prof-armor">
                      {classProficiencies.armor.join(', ')}
                    </p>
                  </div>
                )}

                {classProficiencies.weapons.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">
                      Weapons
                    </h4>
                    <p className="text-sm text-gray-800" data-testid="prof-weapons">
                      {classProficiencies.weapons.join(', ')}
                    </p>
                  </div>
                )}
              </>
            )}

            {character.background?.toolProficiency &&
              character.background.toolProficiency !== 'None' && (
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">
                    Tools
                  </h4>
                  <p className="text-sm text-gray-800" data-testid="prof-tools">
                    {character.background.toolProficiency}
                  </p>
                </div>
              )}

            {allLanguages.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-600 mb-1">
                  Languages
                </h4>
                <p className="text-sm text-gray-800" data-testid="prof-languages">
                  {allLanguages.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Equipment */}
          <div className="mb-8" data-testid="equipment-section">
            <h3 className="text-xl font-bold mb-4">Equipment</h3>
            {equipment.length === 0 ? (
              <p className="text-sm text-gray-500 italic">None</p>
            ) : (
              <>
                {categorizedEquipment.weapon.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">
                      Weapons
                    </h4>
                    <ul className="space-y-1">
                      {categorizedEquipment.weapon.map((item, i) => (
                        <li
                          key={`weapon-${i}`}
                          className="text-sm text-gray-800"
                        >
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {categorizedEquipment.armor.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">
                      Armor & Shields
                    </h4>
                    <ul className="space-y-1">
                      {categorizedEquipment.armor.map((item, i) => (
                        <li
                          key={`armor-${i}`}
                          className="text-sm text-gray-800"
                        >
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {categorizedEquipment.gear.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">
                      Gear
                    </h4>
                    <ul className="space-y-1">
                      {categorizedEquipment.gear.map((item, i) => (
                        <li
                          key={`gear-${i}`}
                          className="text-sm text-gray-800"
                        >
                          {item.name}
                          {item.kind === 'gear' &&
                            item.quantity !== undefined &&
                            item.quantity > 1 &&
                            ` (x${item.quantity})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Traits & Features */}
          <div className="mb-8" data-testid="features-section">
            <h3 className="text-xl font-bold mb-4">Traits & Features</h3>

            {speciesTraits.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  Species Traits
                </h4>
                {speciesTraits.map((trait) => (
                  <div key={trait.name} className="mb-2">
                    <p className="text-sm font-medium text-gray-800">
                      {trait.name}
                    </p>
                    <p className="text-sm text-gray-600">{trait.description}</p>
                  </div>
                ))}
              </div>
            )}

            {classFeatures.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  Class Features
                </h4>
                {classFeatures.map((feature) => (
                  <div key={feature.name} className="mb-2">
                    <p className="text-sm font-medium text-gray-800">
                      {feature.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {backgroundFeature && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  Background Feature
                </h4>
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-800">
                    {backgroundFeature.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {backgroundFeature.description}
                  </p>
                </div>
              </div>
            )}

            {speciesTraits.length === 0 &&
              classFeatures.length === 0 &&
              !backgroundFeature && (
                <p className="text-sm text-gray-500 italic">None</p>
              )}
          </div>
        </div>
      </div>

      {/* Spellcasting Section (conditional) */}
      {spellcasting && (
        <div
          className="mb-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg"
          data-testid="spellcasting-section"
        >
          <h3 className="text-xl font-bold mb-4 text-indigo-900">
            Spellcasting
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <span className="text-xs font-medium text-indigo-600 uppercase">
                Spellcasting Ability
              </span>
              <p className="text-lg font-semibold" data-testid="spell-ability">
                {ABILITY_LABELS[spellcasting.ability]}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-indigo-600 uppercase">
                Spell Save DC
              </span>
              <p className="text-lg font-semibold" data-testid="spell-save-dc">
                {spellSaveDC ?? '—'}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-indigo-600 uppercase">
                Spell Attack
              </span>
              <p
                className="text-lg font-semibold"
                data-testid="spell-attack-mod"
              >
                {spellAttackMod !== undefined
                  ? formatModifier(spellAttackMod)
                  : '—'}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-indigo-600 uppercase">
                Spell Slots (Lvl 1)
              </span>
              <p className="text-lg font-semibold" data-testid="spell-slots">
                {spellcasting.spellSlots}
              </p>
            </div>
          </div>

          {(character.cantripsKnown ?? []).length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-indigo-700 mb-1">
                Cantrips
              </h4>
              <p className="text-sm text-indigo-800" data-testid="cantrips-list">
                {(character.cantripsKnown ?? []).join(', ')}
              </p>
            </div>
          )}

          {(character.spellsKnown ?? []).length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-indigo-700 mb-1">
                Spells Known
              </h4>
              <p className="text-sm text-indigo-800" data-testid="spells-list">
                {(character.spellsKnown ?? []).join(', ')}
              </p>
            </div>
          )}

          {(character.cantripsKnown ?? []).length === 0 &&
            (character.spellsKnown ?? []).length === 0 && (
              <p className="text-sm text-indigo-600 italic">
                No spells selected yet.
              </p>
            )}
        </div>
      )}
    </div>
  );
}
