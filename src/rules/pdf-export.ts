import { jsPDF } from 'jspdf';
import type { CharacterDraft } from '../types/character';
import type { AbilityName } from '../types/ability';
import { ABILITY_NAMES } from '../types/ability';
import { SKILL_NAMES } from '../types/skill';
import { calculateAllModifiers, applyAbilityBonuses } from './ability-scores';
import { calculateAC, getEquipmentByCategory } from './equipment';
import { getSpeciesTraits, getSpeciesSpeed, getSpeciesBonuses } from './species';
import { getClassProficiencies, getHitDie } from './classes';
import {
  getProficiencyBonus,
  calculateHP,
  calculateSkillModifiers,
  calculateSpellSaveDC,
  calculateSpellAttackModifier,
  calculateInitiative,
  SKILL_TO_ABILITY,
} from './derived-stats';
import { sanitizeFilename } from './json-export';

const ABILITY_LABELS: Record<AbilityName, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
};

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/**
 * Generates a PDF character sheet from a CharacterDraft.
 * Returns a jsPDF instance for flexibility (download, preview, etc.).
 */
export function generateCharacterPDF(character: CharacterDraft): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPage = () => {
    if (y > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = margin;
    }
  };

  const level = character.level ?? 1;
  const proficiencyBonus = getProficiencyBonus(level);

  // Compute derived values
  const baseScores = character.baseAbilityScores;
  const speciesBonuses = character.species
    ? getSpeciesBonuses(character.species, character.subspecies)
    : {};
  const finalScores = baseScores
    ? applyAbilityBonuses(baseScores, speciesBonuses)
    : undefined;
  const modifiers = finalScores ? calculateAllModifiers(finalScores) : undefined;

  const hitDie = character.class ? getHitDie(character.class) : undefined;
  const hp = hitDie !== undefined && modifiers
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

  // ---- Title ----
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('D&D 5e Character Sheet', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // ---- Header Section ----
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(character.name || 'Unnamed Character', margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const speciesName = character.subspecies
    ? `${character.subspecies.name} ${character.species?.name ?? ''}`
    : character.species?.name ?? 'Not selected';
  const className = character.class?.name ?? 'Not selected';
  const bgName = character.background?.name ?? 'Not selected';
  doc.text(`Species: ${speciesName}  |  Class: ${className}  |  Background: ${bgName}  |  Level: ${level}`, margin, y);
  y += 8;

  // ---- Divider ----
  doc.setDrawColor(180);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ---- Ability Scores ----
  if (finalScores && modifiers) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Ability Scores', margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const colWidth = contentWidth / 6;
    for (let i = 0; i < ABILITY_NAMES.length; i++) {
      const ability = ABILITY_NAMES[i];
      const x = margin + i * colWidth;
      doc.setFont('helvetica', 'bold');
      doc.text(ABILITY_LABELS[ability], x, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${finalScores[ability]} (${formatModifier(modifiers[ability])})`, x, y + 5);
    }
    y += 14;
    checkPage();
  }

  // ---- Combat Stats ----
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Combat Stats', margin, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const combatStats = [
    `AC: ${ac ?? '-'}`,
    `HP: ${hp ?? '-'}`,
    `Initiative: ${initiative !== undefined ? formatModifier(initiative) : '-'}`,
    `Speed: ${speed !== undefined ? `${speed} ft` : '-'}`,
    `Hit Die: ${hitDie ? `d${hitDie}` : '-'}`,
    `Proficiency: ${formatModifier(proficiencyBonus)}`,
  ];
  doc.text(combatStats.join('  |  '), margin, y);
  y += 8;

  // ---- Divider ----
  doc.setDrawColor(180);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  checkPage();

  // ---- Saving Throws ----
  if (modifiers) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Saving Throws', margin, y);
    y += 6;

    const savingThrowProficiencies: readonly AbilityName[] = character.class?.savingThrows ?? [];
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const saveLines: string[] = [];
    for (const ability of ABILITY_NAMES) {
      const isProficient = savingThrowProficiencies.includes(ability);
      const mod = modifiers[ability] + (isProficient ? proficiencyBonus : 0);
      const marker = isProficient ? '*' : ' ';
      saveLines.push(`${marker} ${ABILITY_LABELS[ability]}: ${formatModifier(mod)}`);
    }
    doc.text(saveLines.join('   '), margin, y);
    y += 8;
    checkPage();
  }

  // ---- Skills ----
  if (modifiers) {
    const skillModifiers = calculateSkillModifiers(
      modifiers,
      character.skillProficiencies ?? [],
      proficiencyBonus,
    );

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Skills', margin, y);
    y += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const sortedSkills = [...SKILL_NAMES].sort((a, b) => a.localeCompare(b));
    const halfLen = Math.ceil(sortedSkills.length / 2);
    const leftSkills = sortedSkills.slice(0, halfLen);
    const rightSkills = sortedSkills.slice(halfLen);

    for (let i = 0; i < halfLen; i++) {
      const leftSkill = leftSkills[i];
      const isProficientLeft = (character.skillProficiencies ?? []).includes(leftSkill);
      const markerLeft = isProficientLeft ? '*' : ' ';
      doc.text(`${markerLeft} ${formatModifier(skillModifiers[leftSkill])} ${leftSkill} (${SKILL_TO_ABILITY[leftSkill]})`, margin, y);

      if (i < rightSkills.length) {
        const rightSkill = rightSkills[i];
        const isProficientRight = (character.skillProficiencies ?? []).includes(rightSkill);
        const markerRight = isProficientRight ? '*' : ' ';
        doc.text(`${markerRight} ${formatModifier(skillModifiers[rightSkill])} ${rightSkill} (${SKILL_TO_ABILITY[rightSkill]})`, margin + contentWidth / 2, y);
      }

      y += 4;
      checkPage();
    }

    y += 4;
  }

  checkPage();

  // ---- Proficiencies ----
  const classProficiencies = character.class ? getClassProficiencies(character.class) : undefined;
  if (classProficiencies) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Proficiencies', margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    if (classProficiencies.armor.length > 0) {
      doc.text(`Armor: ${classProficiencies.armor.join(', ')}`, margin, y);
      y += 5;
      checkPage();
    }
    if (classProficiencies.weapons.length > 0) {
      doc.text(`Weapons: ${classProficiencies.weapons.join(', ')}`, margin, y);
      y += 5;
      checkPage();
    }
    if (character.background?.toolProficiency && character.background.toolProficiency !== 'None') {
      doc.text(`Tools: ${character.background.toolProficiency}`, margin, y);
      y += 5;
      checkPage();
    }

    const speciesLanguages = character.species?.languages ?? [];
    const selectedLanguages = character.selectedLanguages ?? [];
    const allLanguages = [...speciesLanguages, ...selectedLanguages];
    if (allLanguages.length > 0) {
      doc.text(`Languages: ${allLanguages.join(', ')}`, margin, y);
      y += 5;
      checkPage();
    }
    y += 3;
  }

  checkPage();

  // ---- Equipment ----
  const equipment = character.equipment ?? [];
  const categorizedEquipment = getEquipmentByCategory(equipment);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Equipment', margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  if (equipment.length === 0) {
    doc.text('None', margin, y);
    y += 5;
  } else {
    if (categorizedEquipment.weapon.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Weapons:', margin, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      for (const item of categorizedEquipment.weapon) {
        doc.text(`  ${item.name}`, margin, y);
        y += 4;
        checkPage();
      }
    }
    if (categorizedEquipment.armor.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Armor & Shields:', margin, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      for (const item of categorizedEquipment.armor) {
        doc.text(`  ${item.name}`, margin, y);
        y += 4;
        checkPage();
      }
    }
    if (categorizedEquipment.gear.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Gear:', margin, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      for (const item of categorizedEquipment.gear) {
        const qty = item.kind === 'gear' && item.quantity !== undefined && item.quantity > 1
          ? ` (x${item.quantity})`
          : '';
        doc.text(`  ${item.name}${qty}`, margin, y);
        y += 4;
        checkPage();
      }
    }
  }
  y += 3;

  checkPage();

  // ---- Traits & Features ----
  const speciesTraits = character.species
    ? getSpeciesTraits(character.species, character.subspecies)
    : [];
  const classFeatures = character.class?.features ?? [];
  const backgroundFeature = character.background?.feature;

  if (speciesTraits.length > 0 || classFeatures.length > 0 || backgroundFeature) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Traits & Features', margin, y);
    y += 6;

    doc.setFontSize(9);

    if (speciesTraits.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Species Traits:', margin, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      for (const trait of speciesTraits) {
        doc.text(`  ${trait.name}`, margin, y);
        y += 4;
        checkPage();
      }
    }

    if (classFeatures.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Class Features:', margin, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      for (const feature of classFeatures) {
        doc.text(`  ${feature.name}`, margin, y);
        y += 4;
        checkPage();
      }
    }

    if (backgroundFeature) {
      doc.setFont('helvetica', 'bold');
      doc.text('Background Feature:', margin, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`  ${backgroundFeature.name}`, margin, y);
      y += 4;
    }
    y += 3;
  }

  checkPage();

  // ---- Spellcasting ----
  const spellcasting = character.class?.spellcasting;
  if (spellcasting && modifiers) {
    const spellSaveDC = calculateSpellSaveDC(modifiers[spellcasting.ability], proficiencyBonus);
    const spellAttackMod = calculateSpellAttackModifier(modifiers[spellcasting.ability], proficiencyBonus);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Spellcasting', margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Ability: ${ABILITY_LABELS[spellcasting.ability]}  |  Save DC: ${spellSaveDC}  |  Attack: ${formatModifier(spellAttackMod)}  |  Slots: ${spellcasting.spellSlots}`,
      margin, y,
    );
    y += 5;

    const cantrips = character.cantripsKnown ?? [];
    if (cantrips.length > 0) {
      doc.text(`Cantrips: ${cantrips.join(', ')}`, margin, y);
      y += 5;
    }

    const spells = character.spellsKnown ?? [];
    if (spells.length > 0) {
      doc.text(`Spells: ${spells.join(', ')}`, margin, y);
      y += 5;
    }
  }

  return doc;
}

/**
 * Generates a PDF character sheet and triggers a browser download.
 */
export function exportCharacterPDF(character: CharacterDraft): void {
  const doc = generateCharacterPDF(character);
  const name = character.name ? sanitizeFilename(character.name) : 'unnamed';
  doc.save(`character-${name}.pdf`);
}
