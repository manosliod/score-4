import { createStore, useStore } from 'zustand'

import { isCompactWindow } from '@/shared/utils/window-class'

export type ThemePanelVariant = 'sheet' | 'dialog'

type Panel = Readonly<{ variant: ThemePanelVariant; open: boolean }>

export type ThemePanelState = Readonly<{
	panel: Panel | null
	opens: number
	actions: Readonly<{
		open: () => void
		close: () => void
		exited: () => void
	}>
}>

export function createThemePanelStore() {
	return createStore<ThemePanelState>()((set, get) => ({
		panel: null,
		opens: 0,
		actions: {
			open: () => {
				const { panel, opens } = get()
				if (!panel?.open) {
					set({
						panel: { variant: panel?.variant ?? (isCompactWindow() ? 'sheet' : 'dialog'), open: true },
						opens: opens + 1
					})
				}
			},
			close: () => {
				const { panel } = get()
				if (panel) {
					set({ panel: { variant: panel.variant, open: false } })
				}
			},
			exited: () => {
				if (get().panel?.open === false) {
					set({ panel: null })
				}
			}
		}
	}))
}

const themePanelStore = createThemePanelStore()

export const useThemePanel = () => useStore(themePanelStore, (state) => state.panel)
export const useThemePanelOpens = () => useStore(themePanelStore, (state) => state.opens)
export const useThemePanelActions = () => useStore(themePanelStore, (state) => state.actions)
