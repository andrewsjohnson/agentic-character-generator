import { useState, useEffect } from 'react';
import type { StepProps } from '../types';
import type { Background } from '../../types/background';
import type { SkillName } from '../../types/skill';
import { isSkillName } from '../../types/skill';
import { getBackgroundSkills, getBackgroundEquipment, hasSkillConflict } from '../../rules/backgrounds';
import backgroundsData from '../../data/backgrounds.json';
import classesData from '../../data/classes.json';
import type { CharacterClass } from '../../types/class';

// Extract all unique skills from classes data (computed once at module level)
const ALL_SKILLS = Array.from(
  new Set(
    (classesData as unknown as CharacterClass[]).flatMap((c) => c.skillChoices.options)
  )
).sort();

type BackgroundCardProps = {
  background: Background;
  selected: boolean;
  onClick: () => void;
};

function BackgroundCard({ background, selected, onClick }: BackgroundCardProps) {
  const [skill1, skill2] = getBackgroundSkills(background);

  return (
    <button
      onClick={onClick}
      data-testid={`background-card-${background.name.toLowerCase()}`}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        selected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      <h3 className="text-xl font-bold mb-2">{background.name}</h3>
      <div className="space-y-1 text-sm text-gray-700">
        <p><span className="font-medium">Skills:</span> {skill1}, {skill2}</p>
        <p><span className="font-medium">Tool:</span> {background.toolProficiency}</p>
        <p><span className="font-medium">Origin Feat:</span> {background.originFeat}</p>
      </div>
    </button>
  );
}

type BackgroundDetailProps = {
  background: Background;
  conflictingSkills: SkillName[];
  onResolveConflicts: (replacements: SkillName[]) => void;
  character: StepProps['character'];
};

function BackgroundDetail({ background, conflictingSkills, onResolveConflicts, character }: BackgroundDetailProps) {
  const equipment = getBackgroundEquipment(background);
  const hasConflicts = conflictingSkills.length > 0;

  // Get skills the character already has (from class)
  const existingSkills = new Set(character.skillProficiencies || []);

  // Get non-conflicting background skills
  const backgroundSkills = getBackgroundSkills(background);
  const nonConflictingBackgroundSkills = backgroundSkills.filter(
    skill => !conflictingSkills.includes(skill)
  );

  // Previously resolved replacement skills should remain selectable
  const resolvedReplacements = new Set(
    character.backgroundSkillReplacements
      ? Object.values(character.backgroundSkillReplacements)
      : []
  );

  // Skills unavailable for replacement: existing skills + non-conflicting background skills,
  // but exclude already-selected replacements so they remain available in the dropdowns
  const unavailableSkills = new Set([
    ...Array.from(existingSkills).filter(skill => !resolvedReplacements.has(skill as SkillName)),
    ...nonConflictingBackgroundSkills
  ]);

  // Available skills for replacement (excluding those already possessed)
  const availableSkills = ALL_SKILLS.filter(skill => !unavailableSkills.has(skill));

  // Track selected replacement skills — initialize from character state if available
  const [replacements, setReplacements] = useState<SkillName[]>(() => {
    if (character.backgroundSkillReplacements && conflictingSkills.length > 0) {
      return conflictingSkills.map(
        (skill) => character.backgroundSkillReplacements![skill]
      ).filter((s): s is SkillName => s !== undefined);
    }
    return [];
  });

  // Sync replacements when the background changes.
  // We key on background.name because conflictingSkills and
  // backgroundSkillReplacements are both derived from the current background.
  // When the user switches backgrounds, we either restore previously
  // resolved replacements or reset to empty.
  const backgroundName = background.name;
  useEffect(() => {
    if (character.backgroundSkillReplacements && conflictingSkills.length > 0) {
      const restored = conflictingSkills.map(
        (skill) => character.backgroundSkillReplacements![skill]
      ).filter((s): s is SkillName => s !== undefined);
      setReplacements(restored);
    } else {
      setReplacements([]);
    }
    // conflictingSkills is derived from backgroundName + character skills, so
    // backgroundName is sufficient to capture when conflicts change.
  }, [backgroundName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReplacementChange = (index: number, skill: SkillName) => {
    const newReplacements = [...replacements];
    newReplacements[index] = skill;
    setReplacements(newReplacements);
  };

  const allConflictsResolved = replacements.length === conflictingSkills.length;

  const handleConfirm = () => {
    if (allConflictsResolved) {
      onResolveConflicts(replacements);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-200" data-testid="background-detail-panel">
      <h3 className="text-2xl font-bold mb-4">{background.name}</h3>

      {/* Feature Section */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Feature: {background.feature.name}</h4>
        <p className="text-sm text-gray-700">{background.feature.description}</p>
      </div>

      {/* Origin Feat */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Origin Feat</h4>
        <p className="text-sm text-gray-700">{background.originFeat}</p>
      </div>

      {/* Tool Proficiency */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Tool Proficiency</h4>
        <p className="text-sm text-gray-700">{background.toolProficiency}</p>
      </div>

      {/* Ability Options */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Ability Score Options</h4>
        <p className="text-sm text-gray-700">
          Choose +2/+1 or +1/+1/+1 split among: {background.abilityOptions.join(', ')}
        </p>
      </div>

      {/* Skill Proficiencies */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Skill Proficiencies</h4>
        <p className="text-sm text-gray-700">{backgroundSkills.join(', ')}</p>
      </div>

      {/* Equipment */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Starting Equipment</h4>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {equipment.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Skill Conflict Resolution */}
      {hasConflicts && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg" data-testid="skill-conflict-notice">
          <h4 className="text-lg font-semibold mb-2 text-yellow-800">Skill Conflicts Detected</h4>
          <p className="text-sm text-yellow-700 mb-4">
            The following skills from this background conflict with skills you already have from your class.
            Please choose replacement skills:
          </p>
          <div className="space-y-3">
            {conflictingSkills.map((skill, index) => (
              <div key={skill} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-32">{skill} →</span>
                <select
                  value={replacements[index] || ''}
                  onChange={(e) => {
                    if (isSkillName(e.target.value)) {
                      handleReplacementChange(index, e.target.value);
                    }
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  data-testid={`replacement-select-${index}`}
                >
                  <option value="">Select a replacement skill</option>
                  {availableSkills.map((availableSkill) => (
                    <option key={availableSkill} value={availableSkill}>
                      {availableSkill}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button
            onClick={handleConfirm}
            disabled={!allConflictsResolved}
            className={`mt-4 px-4 py-2 rounded font-medium ${
              allConflictsResolved
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            data-testid="confirm-replacements-button"
          >
            Confirm Selection
          </button>
        </div>
      )}
    </div>
  );
}

export function BackgroundStep({ character, updateCharacter }: StepProps) {
  const [selectedBackground, setSelectedBackground] = useState<Background | undefined>(
    character.background
  );

  // Initialize from character state
  useEffect(() => {
    setSelectedBackground(character.background);
  }, [character.background]);

  const handleBackgroundClick = (background: Background) => {
    setSelectedBackground(background);

    // Get class skills (may be undefined if no class chosen yet)
    const classSkills = character.skillProficiencies || [];

    // Get background skills
    const backgroundSkills = getBackgroundSkills(background);

    // Check for conflicts
    const conflicts = hasSkillConflict(backgroundSkills, classSkills);

    if (conflicts.length === 0) {
      // No conflicts: merge skills and clear any stale replacements
      const mergedSkills = [...classSkills, ...backgroundSkills];
      updateCharacter({
        background,
        skillProficiencies: mergedSkills,
        backgroundSkillReplacements: undefined
      });
    } else {
      // Conflicts exist: set the background but clear stale replacements.
      // skillProficiencies is intentionally NOT updated here — the existing
      // class skills remain in state, and the background skills will be
      // merged in only after the user resolves conflicts via handleResolveConflicts.
      // Validation enforces that conflicts must be resolved before proceeding.
      updateCharacter({
        background,
        backgroundSkillReplacements: undefined
      });
    }
  };

  const handleResolveConflicts = (replacements: SkillName[]) => {
    if (!selectedBackground) return;

    // Get class skills
    const classSkills = character.skillProficiencies || [];

    // Get background skills
    const backgroundSkills = getBackgroundSkills(selectedBackground);

    // Find conflicts
    const conflicts = hasSkillConflict(backgroundSkills, classSkills);

    // Build the backgroundSkillReplacements mapping
    const replacementMap: Partial<Record<SkillName, SkillName>> = {};
    conflicts.forEach((conflictSkill, index) => {
      replacementMap[conflictSkill] = replacements[index];
    });

    // Build final skill list: class skills + non-conflicting background skills + replacements
    const nonConflictingBackgroundSkills = backgroundSkills.filter(
      skill => !conflicts.includes(skill)
    );

    const finalSkills = [
      ...classSkills,
      ...nonConflictingBackgroundSkills,
      ...replacements
    ];

    updateCharacter({
      background: selectedBackground,
      skillProficiencies: finalSkills,
      backgroundSkillReplacements: replacementMap
    });
  };

  // Calculate current conflicts for the detail panel.
  // If conflicts have already been resolved (backgroundSkillReplacements is populated),
  // show the original conflicts so the UI can display the resolved state.
  const currentConflicts = (() => {
    if (!selectedBackground) return [];
    const backgroundSkills = getBackgroundSkills(selectedBackground);
    const allSkills = character.skillProficiencies || [];

    if (character.backgroundSkillReplacements) {
      // Conflicts were resolved — return the original conflicting skills
      // (the keys of backgroundSkillReplacements)
      return Object.keys(character.backgroundSkillReplacements).filter(
        (skill): skill is SkillName => backgroundSkills.includes(skill as SkillName)
      );
    }

    return hasSkillConflict(backgroundSkills, allSkills);
  })();

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-2">Choose Your Background</h2>
      <p className="text-gray-600 mb-6">
        Select your character's background to determine their past and additional skills.
      </p>

      {/* Background Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {(backgroundsData as unknown as Background[]).map((background) => (
          <BackgroundCard
            key={background.name}
            background={background}
            selected={selectedBackground?.name === background.name}
            onClick={() => handleBackgroundClick(background)}
          />
        ))}
      </div>

      {/* Detail Panel */}
      {selectedBackground && (
        <BackgroundDetail
          background={selectedBackground}
          conflictingSkills={currentConflicts}
          onResolveConflicts={handleResolveConflicts}
          character={character}
        />
      )}
    </div>
  );
}
