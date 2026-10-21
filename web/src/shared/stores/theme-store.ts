import { createStore, useStore } from 'zustand'

import type { ThemeChoice } from '@/forest/theme'
import { themeService } from '@/shared/services/theme-service'
import type { ThemeService } from '@/shared/services/theme-service'

export type ThemeState = Readonly<{
	theme: ThemeChoice
	actions: Readonly<{ choose: (theme: ThemeChoice) => void; listen: () => () => void }>
}>

export function createThemeStore(service: ThemeService) {
	return createStore<ThemeState>()((set) => ({
		theme: service.read(),
		actions: {
			choose: (theme) => {
				service.save(theme)
				service.apply(theme)
				set({ theme })
			},
			listen: () => {
				const follow = (theme: ThemeChoice) => {
					service.apply(theme)
					set({ theme })
				}
				follow(service.read())
				return service.subscribe(follow)
			}
		}
	}))
}

const themeStore = createThemeStore(themeService)

export const useTheme = () => useStore(themeStore, (state) => state.theme)
export const useThemeActions = () => useStore(themeStore, (state) => state.actions)
