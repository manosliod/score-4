import type { CSSProperties } from 'react'

import arrowBack from '@/forest/assets/icons/arrow_back.svg'
import check from '@/forest/assets/icons/check.svg'
import error from '@/forest/assets/icons/error.svg'
import refresh from '@/forest/assets/icons/refresh.svg'

const icons = { arrowBack, check, error, refresh }

export type IconName = keyof typeof icons

type IconProps = { name: IconName; className?: string }

export function Icon({ name, className = 'size-icon' }: IconProps) {
	const style = { '--icon': `url(${JSON.stringify(icons[name])})` } as CSSProperties
	return <span aria-hidden="true" className={`icon shrink-0 bg-current ${className}`} style={style} />
}
