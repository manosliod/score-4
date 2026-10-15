type SetupHeadingProps = { title: string; text: string }

export function SetupHeading({ title, text }: SetupHeadingProps) {
	return (
		<div className="flex flex-col gap-1">
			<h2 className="text-headline-small text-on-surface expanded:text-headline-medium">{title}</h2>
			<p className="text-body-medium text-on-surface-variant">{text}</p>
		</div>
	)
}
