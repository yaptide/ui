export type LoginMethod = 'sso' | 'local';
export type LoginScreen = 'sso' | 'local' | 'waitingForServer' | 'noLoginMethod';
export type LocalLoginStatus = 'checking' | 'enabled' | 'disabled';

export interface LoginOptions {
	sso: boolean;
	local: LocalLoginStatus;
}

export function canChooseLoginMethod(options: LoginOptions): boolean {
	return options.sso && options.local === 'enabled';
}

export function chooseLoginScreen(options: LoginOptions, userChoice: LoginMethod): LoginScreen {
	if (canChooseLoginMethod(options)) return userChoice;
	if (options.sso) return 'sso';
	if (options.local === 'enabled') return 'local';
	if (options.local === 'checking') return 'waitingForServer';

	return 'noLoginMethod';
}
