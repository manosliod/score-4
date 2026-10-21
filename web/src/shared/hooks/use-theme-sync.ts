import { useEffect } from 'react'

import { useThemeActions } from '@/shared/stores/theme-store'

export function useThemeSync() {
	const { listen } = useThemeActions()
	useEffect(listen, [listen])
}
