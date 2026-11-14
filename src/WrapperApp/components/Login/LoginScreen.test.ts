import type { LoginOptions } from './LoginScreen';
import { canChooseLoginMethod, chooseLoginScreen } from './LoginScreen';

describe('chooseLoginScreen', () => {
	const options = (overrides: Partial<LoginOptions> = {}): LoginOptions => ({
		sso: true,
		local: 'enabled',
		...overrides
	});

	it('allows the user to choose when both methods are available', () => {
		expect(canChooseLoginMethod(options())).toBe(true);
		expect(chooseLoginScreen(options(), 'sso')).toBe('sso');
		expect(chooseLoginScreen(options(), 'local')).toBe('local');
	});

	it('uses SSO while local login is still being checked', () => {
		expect(chooseLoginScreen(options({ local: 'checking' }), 'local')).toBe('sso');
	});

	it('uses SSO when local login is disabled', () => {
		expect(chooseLoginScreen(options({ local: 'disabled' }), 'local')).toBe('sso');
	});

	it('uses local login when SSO is unavailable and local login is enabled', () => {
		expect(chooseLoginScreen(options({ sso: false }), 'sso')).toBe('local');
	});

	it('waits for the backend when neither method is known to work yet', () => {
		expect(chooseLoginScreen(options({ sso: false, local: 'checking' }), 'local')).toBe(
			'waitingForServer'
		);
	});

	it('reports when no login method is available', () => {
		expect(chooseLoginScreen(options({ sso: false, local: 'disabled' }), 'local')).toBe(
			'noLoginMethod'
		);
	});
});
