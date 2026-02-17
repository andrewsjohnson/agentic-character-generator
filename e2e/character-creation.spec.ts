import { test, expect } from '@playwright/test';

/**
 * End-to-end flow for the full D&D character creation wizard.
 *
 * Each step navigates via the top nav link, makes a concrete choice, then
 * captures a full-page screenshot.  Screenshots are stored as baselines in
 * the adjacent `character-creation.spec.ts-snapshots/` directory (committed
 * to git) and compared on every subsequent CI run to catch styling regressions.
 *
 * To regenerate baselines after an intentional UI change, run:
 *   npx playwright test --update-snapshots
 */

test('full character creation wizard', async ({ page }) => {
  await page.goto('/');

  // ─── Step 1: Name ─────────────────────────────────────────────────────────
  await expect(
    page.getByRole('heading', { name: 'Name Your Character' })
  ).toBeVisible();

  await page.getByLabel('Character Name').fill('Aria Swiftwind');

  await expect(page).toHaveScreenshot('01-name-step.png', { fullPage: true });

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

  await expect(page).toHaveScreenshot('02-species-step.png', { fullPage: true });

  // ─── Step 3: Class ─────────────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Class' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Your Class' })
  ).toBeVisible();

  await page.getByTestId('class-card-fighter').click();
  await expect(page.getByTestId('class-detail-panel')).toBeVisible();

  await expect(page).toHaveScreenshot('03-class-step.png', { fullPage: true });

  // ─── Step 4: Ability Scores ────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Ability Scores' }).click();
  await expect(
    page.getByRole('heading', { name: 'Assign Ability Scores' })
  ).toBeVisible();

  // Switch to Standard Array mode.
  await page.getByRole('button', { name: 'Standard Array' }).click();

  // Assign the standard array [15, 14, 13, 12, 10, 8] across the six abilities.
  await page.getByLabel('Select score for STR').selectOption('15');
  await page.getByLabel('Select score for DEX').selectOption('14');
  await page.getByLabel('Select score for CON').selectOption('13');
  await page.getByLabel('Select score for INT').selectOption('12');
  await page.getByLabel('Select score for WIS').selectOption('10');
  // CHA defaults to 8 (the only remaining value); selecting it explicitly
  // confirms the assignment and triggers the "All values assigned!" banner.
  await page.getByLabel('Select score for CHA').selectOption('8');

  await expect(page.getByText('✓ All values assigned!')).toBeVisible();

  await expect(page).toHaveScreenshot('04-ability-scores-step.png', { fullPage: true });

  // ─── Step 5: Background ────────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Background' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Your Background' })
  ).toBeVisible();

  // Soldier — Athletics + Perception (no skill conflict with Fighter since
  // class skill choices haven't been made yet in the wizard).
  await page.getByTestId('background-card-soldier').click();
  await expect(page.getByTestId('background-detail-panel')).toBeVisible();

  await expect(page).toHaveScreenshot('05-background-step.png', { fullPage: true });

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

  await expect(page).toHaveScreenshot('06-equipment-step.png', { fullPage: true });

  // ─── Step 7: Review (Character Sheet) ─────────────────────────────────────
  await page.getByRole('link', { name: 'Review' }).click();
  await expect(
    page.getByRole('heading', { name: 'Character Sheet' })
  ).toBeVisible();

  // Sanity-check a few key values before screenshotting.
  await expect(page.getByTestId('character-name')).toHaveText('Aria Swiftwind');
  await expect(page.getByTestId('character-class')).toHaveText('Fighter');
  await expect(page.getByTestId('character-background')).toHaveText('Soldier');

  await expect(page).toHaveScreenshot('07-review-step.png', { fullPage: true });
});
