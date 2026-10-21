import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

import { expectSegmentEnds, startGame } from './play'

const lightSurface = 'rgb(250, 248, 255)'
const darkSurface = 'rgb(18, 19, 24)'

const html = (page: Page) => page.locator('html')
const surface = (page: Page) => page.locator('body')
const themeButton = (page: Page) => page.getByRole('button', { name: 'Theme' })
const picker = (page: Page) => page.getByRole('radiogroup', { name: 'Theme' })
const overflows = (locator: Locator) => locator.evaluate((node) => node.scrollWidth > node.clientWidth)

async function openTheme(page: Page) {
	await themeButton(page).click()
	await expect(picker(page)).toBeVisible()
}

async function openLoadedTheme(page: Page) {
	const loaded = page.waitForResponse(panelChunk)
	await themeButton(page).hover()
	await loaded
	await openTheme(page)
}

test('the Theme button opens a sheet on compact and a dialog with Done from medium up', async ({ page }, info) => {
	await page.goto('./')
	await openLoadedTheme(page)
	const done = page.getByRole('button', { name: 'Done' })
	if (info.project.name === 'compact') {
		await expect(done).toHaveCount(0)
	} else {
		await expect(done).toBeVisible()
	}
	await expect(page.getByRole('radio', { name: 'System' })).toBeChecked()
	await expect(page.getByRole('radio', { name: 'System' })).toBeFocused()
})

test("with Dark checked the picker keeps the group's rounded ends and dividers between segments", async ({ page }) => {
	await page.goto('./')
	await openTheme(page)
	const dark = page.getByRole('radio', { name: 'Dark' })
	await dark.click()
	await expect(dark).toBeChecked()
	await expectSegmentEnds(picker(page))
})

test('a choice applies at once, keeps the panel open and closes with Escape', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' })
	await page.goto('./')
	await openTheme(page)
	await page.getByRole('radio', { name: 'Dark' }).click()
	await expect(html(page)).toHaveAttribute('data-theme', 'dark')
	await expect(surface(page)).toHaveCSS('background-color', darkSurface)
	await expect(picker(page)).toBeVisible()
	await page.keyboard.press('Escape')
	await expect(picker(page)).toBeHidden()
	await expect(themeButton(page)).toBeFocused()
})

test('arrow keys move the choice and the scrim or Done closes the panel', async ({ page }, info) => {
	await startGame(page)
	await expect(page.getByRole('button', { name: 'New game' })).toBeVisible()
	await openLoadedTheme(page)
	await expect(page.getByRole('radio', { name: 'System' })).toBeFocused()
	await page.keyboard.press('ArrowRight')
	await expect(page.getByRole('radio', { name: 'Light' })).toBeChecked()
	await expect(html(page)).toHaveAttribute('data-theme', 'light')
	if (info.project.name === 'compact') {
		await page.mouse.click(200, 100)
	} else {
		await page.getByRole('button', { name: 'Done' }).click()
	}
	await expect(picker(page)).toBeHidden()
	await expect(page.getByRole('heading', { name: 'Player 2’s turn' })).toBeVisible()
})

test('dragging the sheet down closes it on compact', async ({ page }, info) => {
	test.skip(info.project.name !== 'compact', 'the sheet is the compact window class only')
	await page.goto('./')
	await openTheme(page)
	const sheet = await page.getByRole('dialog', { name: 'Theme' }).boundingBox()
	expect(sheet).not.toBeNull()
	const x = (sheet?.x ?? 0) + 200
	const y = (sheet?.y ?? 0) + 16
	await page.mouse.move(x, y)
	await page.mouse.down()
	await page.mouse.move(x, y + 60, { steps: 4 })
	await page.mouse.move(x, y + 200, { steps: 6 })
	await page.mouse.up()
	await expect(picker(page)).toBeHidden()
	await expect(themeButton(page)).toBeFocused()
})

test('with reduced motion a released sheet fades where it was dropped instead of sliding back up', async ({
	page
}, info) => {
	test.skip(info.project.name !== 'compact', 'the sheet is the compact window class only')
	await page.goto('./')
	await openTheme(page)
	const sheet = await page.getByRole('dialog', { name: 'Theme' }).boundingBox()
	const x = (sheet?.x ?? 0) + 200
	const y = (sheet?.y ?? 0) + 16
	await page.mouse.move(x, y)
	await page.mouse.down()
	await page.mouse.move(x, y + 40, { steps: 4 })
	await page.mouse.move(x, y + 120, { steps: 6 })
	await page.evaluate(() => {
		const tops: number[] = []
		Object.assign(window, { sheetTops: tops })
		const sample = () => {
			const popup = document.querySelector('.sheet-popup')
			if (popup) {
				tops.push(popup.getBoundingClientRect().top)
				requestAnimationFrame(sample)
			}
		}
		sample()
	})
	await page.mouse.up()
	await expect(picker(page)).toBeHidden()
	const tops = await page.evaluate(() => (window as unknown as { sheetTops: number[] }).sheetTops)
	const released = tops[0] ?? 0
	expect(released).toBeGreaterThan((sheet?.y ?? 0) + 60)
	expect(Math.min(...tops)).toBeGreaterThanOrEqual(released - 1)
})

test('the sheet or dialog plays its entry each time it opens', async ({ page }) => {
	await page.goto('./')
	await page.evaluate(() => {
		let entries = 0
		Reflect.set(window, 'entries', () => entries)
		new MutationObserver((records) => {
			for (const { target, oldValue } of records) {
				if (target instanceof HTMLElement && target.role === 'dialog' && oldValue !== null) {
					entries += 1
				}
			}
		}).observe(document.body, { subtree: true, attributeOldValue: true, attributeFilter: ['data-starting-style'] })
	})
	const entries = () => page.evaluate(() => (Reflect.get(window, 'entries') as () => number)())
	for (const round of [1, 2]) {
		await openTheme(page)
		await expect.poll(entries).toBe(round)
		await page.keyboard.press('Escape')
		await expect(picker(page)).toBeHidden()
	}
})

test('the open panel stays what it was across a resize and gives focus back on close', async ({ page }, info) => {
	const [from, to] = info.project.name === 'compact' ? [412, 1024] : [1024, 412]
	await page.setViewportSize({ width: from, height: 800 })
	await page.goto('./')
	await openTheme(page)
	const done = await page.getByRole('button', { name: 'Done' }).count()
	await page.setViewportSize({ width: to, height: 800 })
	await expect(picker(page)).toBeVisible()
	await expect(page.getByRole('button', { name: 'Done' })).toHaveCount(done)
	await page.keyboard.press('Escape')
	await expect(picker(page)).toBeHidden()
	await expect(themeButton(page)).toBeFocused()
})

test('the choice survives a reload and colours the page before the app script runs', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' })
	await page.goto('./')
	await openTheme(page)
	await page.getByRole('radio', { name: 'Dark' }).click()
	await page.route(/\/(src\/app\/main\.tsx|assets\/index-[^/]*\.js)$/, (route) => route.abort())
	await page.reload()
	await expect(themeButton(page)).toHaveCount(0)
	await expect(html(page)).toHaveAttribute('data-theme', 'dark')
	await expect(surface(page)).toHaveCSS('background-color', darkSurface)
	await expect(page.locator('meta[data-scheme="dark"]')).toHaveAttribute('media', 'all')
	await page.unroute(/\/(src\/app\/main\.tsx|assets\/index-[^/]*\.js)$/)
	await page.reload()
	await openTheme(page)
	await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked()
})

const panelChunk = /\/(src\/shared\/components\/theme\/theme-panel\.tsx|assets\/theme-panel-[^/]*\.js)$/

test('a failed Theme panel download says so, and the next press tries again', async ({ page }) => {
	await page.route(panelChunk, (route) => route.abort())
	await page.goto('./')
	await themeButton(page).click()
	await expect(page.getByText('Couldn’t open Theme. Try again.')).toBeVisible()
	await expect(picker(page)).toBeHidden()
	await page.unroute(panelChunk)
	await openTheme(page)
})

async function holdPanelChunk(page: Page) {
	const { promise: released, resolve: release } = Promise.withResolvers<'continue' | 'abort'>()
	await page.route(panelChunk, async (route) => {
		if ((await released) === 'abort') {
			await route.abort()
		} else {
			await route.continue()
		}
	})
	return release
}

const loading = (page: Page) => page.getByRole('progressbar', { name: 'Loading Theme' })

test('a slow Theme panel download opens the sheet or dialog at once, loading, then the picker in it', async ({
	page
}, info) => {
	const release = await holdPanelChunk(page)
	await page.goto('./')
	await themeButton(page).click()
	const panel = page.getByRole('dialog', { name: 'Theme' })
	await expect(panel.getByRole('progressbar', { name: 'Loading Theme' })).toBeVisible()
	const done = panel.getByRole('button', { name: 'Done' })
	if (info.project.name === 'compact') {
		await expect(done).toHaveCount(0)
		await expect(panel).toBeFocused()
	} else {
		await expect(done).toBeFocused()
	}
	const slot = await loading(page).evaluate((node) => {
		const box = node.parentElement?.getBoundingClientRect()
		return { width: box?.width, height: box?.height }
	})
	expect(slot).toEqual({ width: 310, height: 48 })
	const surface = await panel.elementHandle()
	release('continue')
	await expect(picker(page)).toBeVisible()
	await expect(loading(page)).toHaveCount(0)
	expect(await panel.evaluate((node, before) => node === before, surface)).toBe(true)
	if (info.project.name === 'compact') {
		await expect(panel).toBeFocused()
	} else {
		await expect(done).toBeFocused()
	}
})

test('closing the loading sheet or dialog cancels the open', async ({ page }, info) => {
	const release = await holdPanelChunk(page)
	await page.goto('./')
	await themeButton(page).click()
	await expect(loading(page)).toBeVisible()
	if (info.project.name === 'compact') {
		await page.keyboard.press('Escape')
	} else {
		await page.getByRole('button', { name: 'Done' }).click()
	}
	await expect(page.getByRole('dialog', { name: 'Theme' })).toHaveCount(0)
	await expect(themeButton(page)).toBeFocused()
	const arrived = page.waitForResponse(panelChunk)
	release('continue')
	await arrived
	await expect(page.getByRole('dialog', { name: 'Theme' })).toHaveCount(0)
	await openTheme(page)
	await expect(loading(page)).toHaveCount(0)
})

test('a download that fails while loading closes the panel at its size and says so', async ({ page }) => {
	const release = await holdPanelChunk(page)
	await page.goto('./')
	await themeButton(page).click()
	await expect(loading(page)).toBeVisible()
	const height = await page.getByRole('dialog', { name: 'Theme' }).evaluate((node: HTMLElement) => {
		const heights: number[] = []
		Reflect.set(window, 'exitHeights', heights)
		const sample = () => {
			if (node.isConnected) {
				if (node.hasAttribute('data-ending-style')) {
					heights.push(node.offsetHeight)
				}
				requestAnimationFrame(sample)
			}
		}
		sample()
		return node.offsetHeight
	})
	release('abort')
	await expect(page.getByText('Couldn’t open Theme. Try again.')).toBeVisible()
	await expect(page.getByRole('dialog', { name: 'Theme' })).toHaveCount(0)
	const heights = await page.evaluate(() => Reflect.get(window, 'exitHeights') as number[])
	expect(heights.length).toBeGreaterThan(0)
	expect(new Set(heights)).toEqual(new Set([height]))
	await expect(themeButton(page)).toBeFocused()
	await page.unroute(panelChunk)
	await openTheme(page)
})

test('New game cannot open a second modal while the Theme panel downloads', async ({ page }) => {
	const release = await holdPanelChunk(page)
	await startGame(page)
	const newGame = await page.getByRole('button', { name: 'New game' }).boundingBox()
	await themeButton(page).click()
	await expect(loading(page)).toBeVisible()
	await page.mouse.click(
		(newGame?.x ?? 0) + (newGame?.width ?? 0) / 2,
		(newGame?.y ?? 0) + (newGame?.height ?? 0) / 2
	)
	const arrived = page.waitForResponse(panelChunk)
	release('continue')
	await arrived
	await expect(page.getByRole('alertdialog')).toHaveCount(0)
	await expect(page.getByRole('dialog', { name: 'Theme' })).toHaveCount(0)
})

test('the picker fits a 320 px phone', async ({ page }, info) => {
	test.skip(info.project.name !== 'compact', 'a phone width')
	await page.setViewportSize({ width: 320, height: 640 })
	await page.goto('./')
	await openTheme(page)
	const box = await picker(page).boundingBox()
	expect(box?.x).toBeGreaterThanOrEqual(16)
	expect((box?.x ?? 0) + (box?.width ?? Infinity)).toBeLessThanOrEqual(320 - 16)
	expect(await overflows(picker(page))).toBe(false)
})

test('the picker fits a dialog opened wide and narrowed to 400 px', async ({ page }, info) => {
	test.skip(info.project.name !== 'expanded', 'opens as a dialog')
	await page.goto('./')
	await openTheme(page)
	await page.setViewportSize({ width: 400, height: 800 })
	const dialog = page.getByRole('dialog', { name: 'Theme' })
	const room = await dialog.evaluate((node) => {
		const box = node.getBoundingClientRect()
		const padding = Number.parseFloat(getComputedStyle(node).paddingLeft)
		return { left: box.left, right: box.right, inner: box.width - 2 * padding }
	})
	expect(room.left).toBeGreaterThanOrEqual(24)
	expect(room.right).toBeLessThanOrEqual(400 - 24)
	const box = await picker(page).boundingBox()
	expect(box?.width).toBeLessThanOrEqual(room.inner)
	expect(await overflows(picker(page))).toBe(false)
	expect(await overflows(dialog)).toBe(false)
})

test('a choice made in another tab reaches this one', async ({ page, context }) => {
	await page.emulateMedia({ colorScheme: 'light' })
	await page.goto('./')
	const other = await context.newPage()
	await other.goto('./')
	await openTheme(other)
	await other.getByRole('radio', { name: 'Dark' }).click()
	await expect(html(page)).toHaveAttribute('data-theme', 'dark')
	await expect(surface(page)).toHaveCSS('background-color', darkSurface)
})

test('System follows a live change of the system theme', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' })
	await page.goto('./')
	await expect(html(page)).toHaveAttribute('data-theme', 'system')
	await expect(surface(page)).toHaveCSS('background-color', lightSurface)
	await page.emulateMedia({ colorScheme: 'dark' })
	await expect(surface(page)).toHaveCSS('background-color', darkSurface)
	await expect(html(page)).toHaveCSS('color-scheme', 'dark')
})

test('a storage that throws falls back to System and the picker still works', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(window, 'localStorage', {
			get: () => {
				throw new DOMException('denied', 'SecurityError')
			}
		})
	})
	await page.emulateMedia({ colorScheme: 'dark' })
	await page.goto('./')
	await expect(html(page)).toHaveAttribute('data-theme', 'system')
	await expect(surface(page)).toHaveCSS('background-color', darkSurface)
	await openTheme(page)
	await page.getByRole('radio', { name: 'Light' }).click()
	await expect(surface(page)).toHaveCSS('background-color', lightSurface)
})

test('an open Theme panel stays open when the screen changes under it', async ({ page }) => {
	let release: () => void = () => undefined
	const engineDone = new Promise<void>((resolve) => {
		release = resolve
	})
	await page.route('**/*.wasm', async (route) => {
		await engineDone
		await route.abort()
	})
	await page.goto('./')
	await page.getByLabel('Player 1 age').fill('30')
	await page.getByLabel('Player 2 age').fill('20')
	await page.getByRole('button', { name: 'Continue' }).click()
	await openTheme(page)
	release()
	await expect(page.getByText('The game couldn’t start')).toBeAttached()
	await expect(picker(page)).toBeVisible()
	await page.keyboard.press('Escape')
	await expect(picker(page)).toBeHidden()
	await expect(page.getByRole('button', { name: 'New game' })).toBeVisible()
	await expect(themeButton(page)).toBeFocused()
})
