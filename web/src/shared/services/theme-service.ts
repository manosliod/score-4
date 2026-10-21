import { z } from 'zod'

import { themeChoices } from '@/forest/theme'
import type { ThemeChoice } from '@/forest/theme'

const storageKey = 'theme'
const themeSchema = z.enum(themeChoices)

type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>

type ThemeServiceDeps = Readonly<{ storage: () => ThemeStorage; root: () => Document; events: () => Window }>

export type ThemeService = Readonly<{
	read: () => ThemeChoice
	save: (theme: ThemeChoice) => void
	apply: (theme: ThemeChoice) => void
	subscribe: (onChange: (theme: ThemeChoice) => void) => () => void
}>

const metaMedia = (scheme: string | undefined, theme: ThemeChoice) => {
	if (theme === 'system') {
		return `(prefers-color-scheme: ${scheme ?? 'light'})`
	}
	return scheme === theme ? 'all' : 'not all'
}

export function createThemeService({ storage, root, events }: ThemeServiceDeps): ThemeService {
	const parse = (value: string | null): ThemeChoice => {
		const parsed = themeSchema.safeParse(value)
		return parsed.success ? parsed.data : 'system'
	}

	const ownStorage = (event: StorageEvent) => {
		try {
			return event.storageArea === storage()
		} catch {
			return false
		}
	}

	const read = () => {
		try {
			return parse(storage().getItem(storageKey))
		} catch {
			return 'system'
		}
	}

	return {
		read,
		save: (theme) => {
			try {
				storage().setItem(storageKey, theme)
			} catch {
				return
			}
		},
		apply: (theme) => {
			const document = root()
			document.documentElement.dataset['theme'] = theme
			for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
				meta.setAttribute('media', metaMedia(meta.dataset['scheme'], theme))
			}
		},
		subscribe: (onChange) => {
			const target = events()
			const onStorage = (event: StorageEvent) => {
				if (ownStorage(event) && (event.key === storageKey || event.key === null)) {
					onChange(parse(event.newValue))
				}
			}
			const onPageShow = (event: PageTransitionEvent) => {
				if (event.persisted) {
					onChange(read())
				}
			}
			target.addEventListener('storage', onStorage)
			target.addEventListener('pageshow', onPageShow)
			return () => {
				target.removeEventListener('storage', onStorage)
				target.removeEventListener('pageshow', onPageShow)
			}
		}
	}
}

export const themeService = createThemeService({
	storage: () => window.localStorage,
	root: () => document,
	events: () => window
})
