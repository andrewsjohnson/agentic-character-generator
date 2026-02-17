import { test, expect } from '@playwright/test';
import { percySnapshot } from '@percy/playwright';

/**
 * End-to-end flow for the full D&D character creation wizard.
 *
 * Playwright drives the browser and asserts functional correctness;
 * percySnapshot() uploads each step to Percy for visual diff review.
 * Percy compares against the approved baseline and posts a status check on
 * the PR.  An automated Claude vision agent (percy-review.yml) reviews any
 * diffs and either auto-approves or flags them for human attention.
 *
 * Running locally without PERCY_TOKEN set is fine — percySnapshot() is a
 * no-op when the token is absent, so the functional assertions still run.
 */

test('full character creation wizard', async ({ page }) => {
  await page.goto('/');

  // ─── Step 1: Name ─────────────────────────────────────────────────────────
  await expect(
    page.getByRole('heading', { name: 'Name Your Character' })
  ).toBeVisible();

  await page.getByLabel('Character Name').fill('Aria Swiftwind');

  await percySnapshot(page, '01 Name step', { fullPage: true });

  // ─── Step 2: Species ───────────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Species' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Your Species' })
  ).toBeVisible();

  // Human has no subspecies, so clicking it immediately saves to character state.
  await page
    .locator('button', {
      has: page.getByRole('heading', { name: 'Human', level: 3 }),
    })
    .click();

  await percySnapshot(page, '02 Species step — Human selected', { fullPage: true });

  // ─── Step 3: Class ─────────────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Class' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Your Class' })
  ).toBeVisible();

  await page.getByTestId('class-card-fighter').click();
  await expect(page.getByTestId('class-detail-panel')).toBeVisible();

  await percySnapshot(page, '03 Class step — Fighter selected', { fullPage: true });

  // ─── Step 4: Ability Scores ────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Ability Scores' }).click();
  await expect(
    page.getByRole('heading', { name: 'Assign Ability Scores' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Standard Array' }).click();

  // Assign the standard array [15, 14, 13, 12, 10, 8] across the six abilities.
  await page.getByLabel('Select score for STR').selectOption('15');
  await page.getByLabel('Select score for DEX').selectOption('14');
  await page.getByLabel('Select score for CON').selectOption('13');
  await page.getByLabel('Select score for INT').selectOption('12');
  await page.getByLabel('Select score for WIS').selectOption('10');
  await page.getByLabel('Select score for CHA').selectOption('8');

  await expect(page.getByText('✓ All values assigned!')).toBeVisible();

  await percySnapshot(page, '04 Ability Scores step — standard array assigned', { fullPage: true });

  // ─── Step 5: Background ────────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Background' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Your Background' })
  ).toBeVisible();

  await page.getByTestId('background-card-soldier').click();
  await expect(page.getByTestId('background-detail-panel')).toBeVisible();

  await percySnapshot(page, '05 Background step — Soldier selected', { fullPage: true });

  // ─── Step 6: Equipment ─────────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Equipment' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Equipment' })
  ).toBeVisible();

  // Fighter has three equipment choices.
  await page.getByTestId('choice-0-option-0').click(); // Chain Mail
  await page.getByTestId('choice-1-option-0').click(); // Martial weapon + shield
  await page.getByTestId('choice-2-option-0').click(); // Light crossbow + 20 bolts

  await expect(page.getByTestId('equipment-summary')).toBeVisible();

  await percySnapshot(page, '06 Equipment step — all choices made', { fullPage: true });

  // ─── Step 7: Review (Character Sheet) ─────────────────────────────────────
  await page.getByRole('link', { name: 'Review' }).click();
  await expect(
    page.getByRole('heading', { name: 'Character Sheet' })
  ).toBeVisible();

  await expect(page.getByTestId('character-name')).toHaveText('Aria Swiftwind');
  await expect(page.getByTestId('character-class')).toHaveText('Fighter');
  await expect(page.getByTestId('character-background')).toHaveText('Soldier');

  await percySnapshot(page, '07 Review step — complete character sheet', { fullPage: true });
});
