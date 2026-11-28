import { alpha, Theme } from '@mui/material';
import { EditorView } from '@uiw/react-codemirror';

export function searchPanelTheme(theme: Theme) {
	const { palette, shape, typography } = theme;
	const search = '.cm-panel.cm-search';
	const fontFamily = typography.fontFamily ?? 'inherit';
	const fontSize = typography.body2.fontSize ?? '0.875rem';
	const button = {
		fontSize: typography.button.fontSize ?? fontSize,
		fontWeight: typography.button.fontWeight ?? 500,
		letterSpacing: typography.button.letterSpacing ?? 'normal'
	};

	return EditorView.theme({
		'.cm-panels': {
			backgroundColor: palette.background.paper,
			color: palette.text.primary
		},
		'.cm-panels.cm-panels-bottom': {
			borderTop: `1px solid ${palette.divider}`
		},
		[search]: {
			display: 'flex',
			flexWrap: 'wrap',
			alignItems: 'center',
			gap: theme.spacing(0.5, 1),
			padding: theme.spacing(1, 5, 1, 1.5),
			fontFamily,
			fontSize
		},
		[`${search} br`]: {
			flexBasis: '100%',
			height: 0
		},
		[`${search} .cm-textfield`]: {
			margin: 0,
			padding: theme.spacing(0.5, 1),
			minWidth: '12rem',
			fontFamily,
			fontSize,
			color: palette.text.primary,
			backgroundColor: 'transparent',
			border: `1px solid ${alpha(palette.text.primary, 0.23)}`,
			borderRadius: `${shape.borderRadius}px`,
			outline: 'none'
		},
		[`${search} .cm-textfield:hover`]: {
			borderColor: palette.text.primary
		},
		[`${search} .cm-textfield:focus`]: {
			borderColor: palette.primary.main,
			boxShadow: `inset 0 0 0 1px ${palette.primary.main}`
		},
		[`${search} .cm-button`]: {
			margin: 0,
			padding: theme.spacing(0.5, 1),
			fontFamily,
			...button,
			textTransform: 'uppercase',
			color: palette.primary.main,
			backgroundImage: 'none',
			backgroundColor: 'transparent',
			border: 'none',
			borderRadius: `${shape.borderRadius}px`,
			cursor: 'pointer'
		},
		[`${search} .cm-button:hover`]: {
			backgroundColor: alpha(palette.primary.main, palette.action.hoverOpacity)
		},
		[`${search} .cm-button:active`]: {
			backgroundImage: 'none',
			backgroundColor: alpha(palette.primary.main, palette.action.activatedOpacity)
		},
		[`${search} label`]: {
			display: 'inline-flex',
			alignItems: 'center',
			gap: theme.spacing(0.5),
			color: palette.text.secondary,
			fontSize
		},
		[`${search} input[type=checkbox]`]: {
			margin: 0,
			accentColor: palette.primary.main
		},
		[`${search} button[name=close]`]: {
			top: '50%',
			right: theme.spacing(1),
			transform: 'translateY(-50%)',
			padding: theme.spacing(0.5, 1),
			fontSize: '1.25rem',
			color: palette.text.secondary,
			borderRadius: '50%',
			cursor: 'pointer'
		},
		[`${search} button[name=close]:hover`]: {
			backgroundColor: palette.action.hover,
			color: palette.text.primary
		}
	});
}
