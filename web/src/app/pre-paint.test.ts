import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { themeChoices } from '@/forest/theme'
import { createThemeService } from '@/shared/services/theme-service'

const page = readFileSync(join(import.meta.dirname, '..', '..', 'index.html'), 'utf8')
const head = /<head>([\s\S]*?)<\/head>/.exec(page)?.[1] ?? ''
const script = /<script>([\s\S]*?)<\/script>/.exec(head)?.[1] ?? ''
const metas = [...head.matchAll(/<meta name="theme-color"[^>]*>/g)].map((match) => match[0]).join('')

const runScript = () => {
	window.eval(script)
}

const snapshot = () => ({
	theme: document.documentElement.dataset['theme'],
	media: [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map((meta) =>
		meta.getAttribute('media')
	)
})

const reset = () => {
	document.head.innerHTML = metas
	delete document.documentElement.dataset['theme']
}

describe('pre-paint script in index.html', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		localStorage.clear()
		reset()
	})

	it.each([...themeChoices, 'sepia', null])(
		'applies the stored value %s exactly like the theme service',
		(stored) => {
			reset()
			if (stored !== null) {
				localStorage.setItem('theme', stored)
			}
			runScript()
			const fromScript = snapshot()

			reset()
			const service = createThemeService({
				storage: () => localStorage,
				root: () => document,
				events: () => window
			})
			service.apply(service.read())
			expect(fromScript).toEqual(snapshot())
		}
	)

	it('falls back to System when storage throws and leaves no global behind', () => {
		reset()
		vi.stubGlobal('localStorage', {
			getItem: () => {
				throw new DOMException('denied', 'SecurityError')
			}
		})
		runScript()
		expect(snapshot().theme).toBe('system')
		expect(window.eval('typeof theme')).toBe('undefined')
	})
})
