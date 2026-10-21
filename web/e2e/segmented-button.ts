import { expect } from '@playwright/test'
import type { Locator } from '@playwright/test'

export async function expectSegmentEnds(group: Locator) {
	const radios = group.getByRole('radio')
	await expect(radios).not.toHaveCount(0)
	const [first, ...rest] = await radios.all()
	const last = rest.at(-1)
	if (!first || !last) {
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
	for (const middle of rest.slice(0, -1)) {
		for (const corner of ['top-left', 'top-right', 'bottom-left', 'bottom-right']) {
			await expect(middle).toHaveCSS(`border-${corner}-radius`, '0px')
		}
	}
	await expect(first).toHaveCSS('border-left-width', '0px')
	for (const segment of [first, ...rest]) {
		if (segment !== first) {
			await expect(segment).toHaveCSS('border-left-width', '1px')
		}
		await expect(segment).toHaveCSS('border-right-width', '0px')
	}
}
