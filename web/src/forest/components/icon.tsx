import type { CSSProperties } from 'react'

import arrowBack from '@/forest/assets/icons/arrow_back.svg'
import brightnessAuto from '@/forest/assets/icons/brightness_auto.svg'
import check from '@/forest/assets/icons/check.svg'
import darkMode from '@/forest/assets/icons/dark_mode.svg'
import error from '@/forest/assets/icons/error.svg'
import lightMode from '@/forest/assets/icons/light_mode.svg'
import refresh from '@/forest/assets/icons/refresh.svg'

const icons = { arrowBack, brightnessAuto, check, darkMode, error, lightMode, refresh }

export type IconName = keyof typeof icons

type IconProps = { name: IconName; className?: string }

export function Icon({ name, className = 'size-icon' }: IconProps) {
	const style = { '--icon': `url(${JSON.stringify(icons[name])})` } as CSSProperties
	return <span aria-hidden="true" className={`icon shrink-0 bg-current ${className}`} style={style} />
}
