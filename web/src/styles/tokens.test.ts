import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { compile } from 'tailwindcss'
import { afterEach, describe, expect, it } from 'vitest'

const tokens = readFileSync(join(import.meta.dirname, 'tokens.css'), 'utf8')

async function darkSelectors() {
	const compiler = await compile(`${tokens}\n@tailwind utilities;`)
	const css = compiler.build(['dark:bg-surface'])
	const selectors = [...css.matchAll(/^\s*(\.dark\\:bg-surface[^{]*?)\s*\{/gm)].map((match) => match[1] ?? '')
	return {
		chosen: selectors[0] ?? '',
		system: selectors[1] ?? '',
		media: css.includes('@media (prefers-color-scheme: dark)')
	}
}

function child() {
	const element = document.createElement('div')
	element.className = 'dark:bg-surface'
	document.body.append(element)
	return element
}

describe('dark variant', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		delete document.documentElement.dataset['theme']
	})

	it('reaches elements inside a page set to Dark', async () => {
		const { chosen } = await darkSelectors()
		document.documentElement.dataset['theme'] = 'dark'
		expect(child().matches(chosen)).toBe(true)
		document.documentElement.dataset['theme'] = 'light'
		expect(child().matches(chosen)).toBe(false)
	})

	it('follows the system on System and never on Light', async () => {
		const { system, media } = await darkSelectors()
		expect(media).toBe(true)
		document.documentElement.dataset['theme'] = 'system'
		expect(child().matches(system)).toBe(true)
		document.documentElement.dataset['theme'] = 'light'
		expect(child().matches(system)).toBe(false)
	})
})

describe('window classes', () => {
	it('emits the medium breakpoint on :root for the window class to read', async () => {
		const compiler = await compile(`${tokens}\n@tailwind utilities;`)
		const root = /:root[^{]*\{([^}]*)\}/.exec(compiler.build([]))?.[1] ?? ''
		expect(root).toMatch(/--breakpoint-medium:\s*600px;/)
	})
})
