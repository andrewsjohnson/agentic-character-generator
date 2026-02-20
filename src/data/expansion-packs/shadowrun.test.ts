import { describe, it, expect } from 'vitest';
import { SHADOWRUN_PACK } from './shadowrun';
import { computeAvailableContent, findStaleSelections } from '../../rules/expansion-packs';
import type { CharacterDraft } from '../../types/character';

const baseContent = {
  species: [],
  classes: [],
  backgrounds: [],
};

describe('SHADOWRUN_PACK', () => {
  it('has the correct id, name, and description', () => {
    expect(SHADOWRUN_PACK.id).toBe('shadowrun');
    expect(SHADOWRUN_PACK.name).toBe('Shadowrun');
    expect(SHADOWRUN_PACK.description).toContain('Shadowrun');
  });

  it('contains 5 species', () => {
    expect(SHADOWRUN_PACK.species).toHaveLength(5);
    const names = SHADOWRUN_PACK.species!.map(s => s.name);
    expect(names).toContain('Elf');
    expect(names).toContain('Dwarf');
    expect(names).toContain('Ork');
    expect(names).toContain('Troll');
    expect(names).toContain('Metahuman');
  });

  it('contains 6 classes', () => {
    expect(SHADOWRUN_PACK.classes).toHaveLength(6);
    const names = SHADOWRUN_PACK.classes!.map(c => c.name);
    expect(names).toContain('Street Samurai');
    expect(names).toContain('Adept');
    expect(names).toContain('Mage');
    expect(names).toContain('Shaman');
    expect(names).toContain('Decker');
    expect(names).toContain('Face');
  });

  it('contains 2 backgrounds', () => {
    expect(SHADOWRUN_PACK.backgrounds).toHaveLength(2);
    const names = SHADOWRUN_PACK.backgrounds!.map(b => b.name);
    expect(names).toContain('Corporate SINner');
    expect(names).toContain('Shadowrunner');
  });

  it('contains 6 equipment items', () => {
    expect(SHADOWRUN_PACK.equipment).toHaveLength(6);
    const names = SHADOWRUN_PACK.equipment!.map(e => e.name);
    expect(names).toContain('Heavy Pistol');
    expect(names).toContain('Assault Rifle');
    expect(names).toContain('Monofilament Whip');
    expect(names).toContain('Armor Jacket');
    expect(names).toContain('Datajack');
    expect(names).toContain('Commlink');
  });

  describe('species details', () => {
    it('Elf has speed 35 and is Medium', () => {
      const elf = SHADOWRUN_PACK.species!.find(s => s.name === 'Elf')!;
      expect(elf.speed).toBe(35);
      expect(elf.size).toBe('Medium');
      expect(elf.abilityBonuses).toEqual({ DEX: 2, CHA: 1 });
      expect(elf.languages).toEqual(['Common', 'Sperethiel']);
    });

    it('Dwarf has speed 25 and is Small', () => {
      const dwarf = SHADOWRUN_PACK.species!.find(s => s.name === 'Dwarf')!;
      expect(dwarf.speed).toBe(25);
      expect(dwarf.size).toBe('Small');
      expect(dwarf.abilityBonuses).toEqual({ CON: 2, WIS: 1 });
      expect(dwarf.languages).toEqual(['Common', "Or'zet"]);
    });

    it('Ork has speed 30 and is Medium', () => {
      const ork = SHADOWRUN_PACK.species!.find(s => s.name === 'Ork')!;
      expect(ork.speed).toBe(30);
      expect(ork.size).toBe('Medium');
      expect(ork.abilityBonuses).toEqual({ STR: 2, CON: 1 });
      expect(ork.languages).toEqual(['Common', "Or'zet"]);
    });

    it('Troll has speed 30 and is Medium with 4 traits', () => {
      const troll = SHADOWRUN_PACK.species!.find(s => s.name === 'Troll')!;
      expect(troll.speed).toBe(30);
      expect(troll.size).toBe('Medium');
      expect(troll.abilityBonuses).toEqual({ STR: 2, CON: 1 });
      expect(troll.traits).toHaveLength(4);
      expect(troll.traits.map(t => t.name)).toContain('Dermal Armor');
      expect(troll.traits.map(t => t.name)).toContain('Reach');
    });

    it('Metahuman has speed 30 and is Medium', () => {
      const metahuman = SHADOWRUN_PACK.species!.find(s => s.name === 'Metahuman')!;
      expect(metahuman.speed).toBe(30);
      expect(metahuman.size).toBe('Medium');
      expect(metahuman.abilityBonuses).toEqual({ DEX: 1, INT: 1, CHA: 1 });
      expect(metahuman.languages).toEqual(['Common', 'one of choice']);
    });
  });

  describe('class details', () => {
    it('Street Samurai has hitDie 10 and 2 subclasses', () => {
      const samurai = SHADOWRUN_PACK.classes!.find(c => c.name === 'Street Samurai')!;
      expect(samurai.hitDie).toBe(10);
      expect(samurai.primaryAbility).toEqual(['STR', 'DEX']);
      expect(samurai.savingThrows).toEqual(['STR', 'CON']);
      expect(samurai.armorProficiencies).toEqual(['light', 'medium', 'heavy', 'shields']);
      expect(samurai.spellcasting).toBeUndefined();
      expect(samurai.subclasses).toHaveLength(2);
      expect(samurai.subclasses[0].name).toBe('Cyber Warrior');
      expect(samurai.subclasses[1].name).toBe('Blade Adept');
    });

    it('Adept has hitDie 8 and no spellcasting', () => {
      const adept = SHADOWRUN_PACK.classes!.find(c => c.name === 'Adept')!;
      expect(adept.hitDie).toBe(8);
      expect(adept.primaryAbility).toEqual(['STR', 'DEX']);
      expect(adept.savingThrows).toEqual(['STR', 'WIS']);
      expect(adept.armorProficiencies).toEqual(['light']);
      expect(adept.spellcasting).toBeUndefined();
      expect(adept.subclasses).toHaveLength(2);
      expect(adept.subclasses[0].name).toBe('Way of the Warrior');
      expect(adept.subclasses[1].name).toBe('Way of the Speaker');
    });

    it('Mage has hitDie 6 and INT spellcasting', () => {
      const mage = SHADOWRUN_PACK.classes!.find(c => c.name === 'Mage')!;
      expect(mage.hitDie).toBe(6);
      expect(mage.primaryAbility).toEqual(['INT']);
      expect(mage.savingThrows).toEqual(['INT', 'WIS']);
      expect(mage.armorProficiencies).toEqual([]);
      expect(mage.spellcasting!.ability).toBe('INT');
      expect(mage.spellcasting!.cantripsKnown).toBe(2);
      expect(mage.spellcasting!.spellSlots).toBe(2);
      expect(mage.subclasses).toHaveLength(2);
      expect(mage.subclasses[0].name).toBe('Hermetic Mage');
      expect(mage.subclasses[1].name).toBe('Chaos Mage');
    });

    it('Shaman has hitDie 8 and WIS spellcasting with spellsPrepared', () => {
      const shaman = SHADOWRUN_PACK.classes!.find(c => c.name === 'Shaman')!;
      expect(shaman.hitDie).toBe(8);
      expect(shaman.primaryAbility).toEqual(['WIS']);
      expect(shaman.savingThrows).toEqual(['WIS', 'CHA']);
      expect(shaman.armorProficiencies).toEqual(['light', 'shields']);
      expect(shaman.spellcasting!.ability).toBe('WIS');
      expect(shaman.spellcasting!.cantripsKnown).toBe(2);
      expect(shaman.spellcasting!.spellSlots).toBe(2);
      expect(shaman.spellcasting!.spellsPrepared).toBe(3);
      expect(shaman.subclasses).toHaveLength(2);
      expect(shaman.subclasses[0].name).toBe('Totem Shaman');
      expect(shaman.subclasses[1].name).toBe('Idol Shaman');
    });

    it('Decker has hitDie 8 and no spellcasting', () => {
      const decker = SHADOWRUN_PACK.classes!.find(c => c.name === 'Decker')!;
      expect(decker.hitDie).toBe(8);
      expect(decker.primaryAbility).toEqual(['INT']);
      expect(decker.savingThrows).toEqual(['INT', 'DEX']);
      expect(decker.armorProficiencies).toEqual(['light']);
      expect(decker.spellcasting).toBeUndefined();
      expect(decker.subclasses).toHaveLength(2);
      expect(decker.subclasses[0].name).toBe('Black Hat');
      expect(decker.subclasses[1].name).toBe('Technomancer');
    });

    it('Face has hitDie 8 and no spellcasting', () => {
      const face = SHADOWRUN_PACK.classes!.find(c => c.name === 'Face')!;
      expect(face.hitDie).toBe(8);
      expect(face.primaryAbility).toEqual(['CHA']);
      expect(face.savingThrows).toEqual(['CHA', 'DEX']);
      expect(face.armorProficiencies).toEqual(['light']);
      expect(face.spellcasting).toBeUndefined();
      expect(face.subclasses).toHaveLength(2);
      expect(face.subclasses[0].name).toBe('Negotiator');
      expect(face.subclasses[1].name).toBe('Con Artist');
    });
  });

  describe('background details', () => {
    it('Corporate SINner has correct skills and origin feat', () => {
      const corp = SHADOWRUN_PACK.backgrounds!.find(b => b.name === 'Corporate SINner')!;
      expect(corp.skillProficiencies).toEqual(['Deception', 'Persuasion']);
      expect(corp.originFeat).toBe('Alert');
      expect(corp.abilityOptions).toEqual(['DEX', 'INT', 'CHA']);
    });

    it('Shadowrunner has correct skills and origin feat', () => {
      const runner = SHADOWRUN_PACK.backgrounds!.find(b => b.name === 'Shadowrunner')!;
      expect(runner.skillProficiencies).toEqual(['Stealth', 'Insight']);
      expect(runner.originFeat).toBe('Tough');
      expect(runner.abilityOptions).toEqual(['STR', 'DEX', 'CON']);
    });
  });
});

describe('computeAvailableContent with Shadowrun pack', () => {
  it('includes Shadowrun content when pack is enabled', () => {
    const result = computeAvailableContent(
      ['shadowrun'],
      [SHADOWRUN_PACK],
      baseContent,
    );

    expect(result.species).toHaveLength(2);
    expect(result.species[1].source).toBe('Shadowrun');
    expect(result.species[1].items).toHaveLength(5);
    expect(result.species[1].items.map(s => s.name)).toContain('Elf');
    expect(result.species[1].items.map(s => s.name)).toContain('Troll');
    expect(result.species[1].items.map(s => s.name)).toContain('Metahuman');

    expect(result.classes).toHaveLength(2);
    expect(result.classes[1].source).toBe('Shadowrun');
    expect(result.classes[1].items).toHaveLength(6);

    expect(result.backgrounds).toHaveLength(2);
    expect(result.backgrounds[1].source).toBe('Shadowrun');
    expect(result.backgrounds[1].items).toHaveLength(2);
  });

  it('does not include Shadowrun content when pack is disabled', () => {
    const result = computeAvailableContent([], [SHADOWRUN_PACK], baseContent);

    expect(result.species).toHaveLength(1);
    expect(result.classes).toHaveLength(1);
    expect(result.backgrounds).toHaveLength(1);
  });
});

describe('findStaleSelections with Shadowrun pack', () => {
  it('clears Elf species when pack is disabled', () => {
    const elf = SHADOWRUN_PACK.species![0];
    const character: CharacterDraft = { species: elf };

    const baseOnly = computeAvailableContent([], [SHADOWRUN_PACK], baseContent);
    const stale = findStaleSelections(character, baseOnly);

    expect('species' in stale).toBe(true);
    expect(stale.species).toBeUndefined();
  });

  it('does not clear Elf species when pack is enabled', () => {
    const elf = SHADOWRUN_PACK.species![0];
    const character: CharacterDraft = { species: elf };

    const withPack = computeAvailableContent(
      ['shadowrun'],
      [SHADOWRUN_PACK],
      baseContent,
    );
    const stale = findStaleSelections(character, withPack);

    expect(Object.keys(stale)).toHaveLength(0);
  });
});
