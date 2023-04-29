import {
	Button,
	ButtonProps,
	ClickAwayListener,
	Grow,
	MenuItem,
	MenuList,
	Paper,
	Popper,
	Typography,
	buttonClasses
} from '@mui/material';
import { Fragment, useRef, useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export type ButtonWithPopperListProps<T = undefined> = Omit<
	ButtonProps,
	'onChange' | 'children'
> & {
	onChange?: (value: T) => void;
	options: { value: T; label: string }[];
};

export function ButtonWithPopperList<T = undefined>({
	options,
	onChange,
	onClick,
	...other
}: ButtonWithPopperListProps<T>) {
	const [open, setOpen] = useState(false);
	const anchorRef = useRef<HTMLButtonElement>(null);
	const [selectedIndex, setSelectedIndex] = useState(1);

	const handleToggle = () => {
		setOpen(prevOpen => !prevOpen);
	};

	const handleClose = (event: Event) => {
		if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
			return;
		}

		setOpen(false);
	};

	return (
		<Fragment>
			<Button
				sx={{
					[`&.${buttonClasses.root}`]: {
						width: 120
					}
				}}
				size='small'
				aria-controls={open ? 'split-button-menu' : undefined}
				aria-expanded={open ? 'true' : undefined}
				aria-haspopup='menu'
				onClick={e => {
					handleToggle();
					onClick?.(e);
				}}
				ref={anchorRef}
				endIcon={<ArrowDropDownIcon />}
				{...other}>
				<Typography sx={{ fontSize: 12, flexGrow: 1 }}>
					{options[selectedIndex].label}
				</Typography>
			</Button>
			<Popper
				open={open}
				anchorEl={anchorRef.current}
				role={undefined}
				transition
				disablePortal>
				{({ TransitionProps, placement }) => (
					<Grow
						{...TransitionProps}
						style={{
							transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'
						}}>
						<Paper>
							<ClickAwayListener onClickAway={handleClose}>
								<MenuList autoFocusItem>
									{options.map((option, index) => (
										<MenuItem
											key={index}
											selected={index === selectedIndex}
											onClick={event => {
												setSelectedIndex(index);
												setOpen(false);
												onChange?.(option.value);
											}}>
											{option.label}
										</MenuItem>
									))}
								</MenuList>
							</ClickAwayListener>
						</Paper>
					</Grow>
				)}
			</Popper>
		</Fragment>
	);
}
