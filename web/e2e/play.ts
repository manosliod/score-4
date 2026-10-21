import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export async function enterAges(page: Page, playerOne: string, playerTwo: string) {
	await page.goto('./')
	await page.getByLabel('Player 1 age').fill(playerOne)
	await page.getByLabel('Player 2 age').fill(playerTwo)
	await page.getByRole('button', { name: 'Continue' }).click()
}

export async function startGame(page: Page) {
	await enterAges(page, '30', '20')
	await page.getByRole('button', { name: 'Start game' }).click()
	await expect(page.getByRole('heading', { name: 'Player 2’s turn' })).toBeVisible()
}

export function column(page: Page, number: number) {
	return page.getByRole('gridcell', { name: new RegExp(`^Column ${String(number)},`) })
}

export async function dropAll(page: Page, columns: readonly number[]) {
	for (const number of columns) {
		await column(page, number).click({ force: true })
	}
}

export async function expectSegmentEnds(group: Locator) {
	const segments = await group.getByRole('radio').all()
	const first = segments[0]
	const last = segments.at(-1)
	if (!first || !last || segments.length < 2) {
		throw new Error('A segmented button needs at least two segments')
	}
	const radius = await group.evaluate((node) => getComputedStyle(node).borderTopLeftRadius)
	expect(radius).not.toBe('0px')
	for (const corner of ['top-left', 'bottom-left']) {
		await expect(first).toHaveCSS(`border-${corner}-radius`, radius)
		await expect(last).toHaveCSS(`border-${corner}-radius`, '0px')
	}
	for (const corner of ['top-right', 'bottom-right']) {
		await expect(last).toHaveCSS(`border-${corner}-radius`, radius)
		await expect(first).toHaveCSS(`border-${corner}-radius`, '0px')
	}
	for (const middle of segments.slice(1, -1)) {
		for (const corner of ['top-left', 'top-right', 'bottom-left', 'bottom-right']) {
			await expect(middle).toHaveCSS(`border-${corner}-radius`, '0px')
		}
	}
	await expect(first).toHaveCSS('border-left-width', '0px')
	for (const segment of segments.slice(1)) {
		await expect(segment).toHaveCSS('border-left-width', '1px')
	}
	for (const segment of segments) {
		await expect(segment).toHaveCSS('border-right-width', '0px')
	}
}
