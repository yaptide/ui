import type { LocalLoginStatus } from '../../../services/AuthService';

export type LoginMethod = 'sso' | 'local';
export type LoginScreen = 'sso' | 'local' | 'waitingForServer' | 'noLoginMethod';

export interface LoginOptions {
	sso: boolean;
	local: LocalLoginStatus;
}

/** Both login methods work, so the user can switch between them. */
export function canChooseLoginMethod(options: LoginOptions): boolean {
	return options.sso && options.local === 'enabled';
}

/** Selects the only valid screen for the current configuration and user choice. */
export function chooseLoginScreen(options: LoginOptions, userChoice: LoginMethod): LoginScreen {
	// A choice only matters when both methods are known to work.
	if (canChooseLoginMethod(options)) return userChoice;

	// SSO is immediately available; do not flash an unavailable local form.
	if (options.sso) return 'sso';

	if (options.local === 'enabled') return 'local';
	if (options.local === 'checking') return 'waitingForServer';

	return 'noLoginMethod';
}
