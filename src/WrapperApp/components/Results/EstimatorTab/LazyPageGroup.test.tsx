import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import LazyPageGroup from './LazyPageGroup';

const group = { dimension: 2, names: ['Dose map'], pageNums: [2] };

describe('LazyPageGroup', () => {
	const original = window.IntersectionObserver;
	let container: HTMLDivElement;
	let root: Root;

	beforeAll(() => {
		(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
	});

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		root.unmount();
		container.remove();
		window.IntersectionObserver = original;
	});

	const show = (loading: boolean, onLoad: jest.Mock, failed = false, shown = group) =>
		// React's own act around a plain root: this test does not use Testing Library
		// eslint-disable-next-line testing-library/no-unnecessary-act
		act(() =>
			root.render(
				<LazyPageGroup
					group={shown}
					loading={loading}
					failed={failed}
					onLoad={onLoad}
				/>
			)
		);

	const loadButton = () =>
		Array.from(container.querySelectorAll('button')).find(
			button => button.textContent === 'Load'
		);

	test('loads its pages once when it comes into view', () => {
		let notify: (entries: { isIntersecting: boolean }[]) => void = () => {};
		const disconnect = jest.fn();
		window.IntersectionObserver = jest.fn(callback => {
			notify = callback;

			return { observe: jest.fn(), disconnect };
		}) as unknown as typeof IntersectionObserver;
		const onLoad = jest.fn();

		show(false, onLoad);
		notify([{ isIntersecting: false }]);
		expect(onLoad).not.toHaveBeenCalled();

		notify([{ isIntersecting: true }]);
		expect(onLoad).toHaveBeenCalledTimes(1);
		expect(onLoad).toHaveBeenCalledWith(group);
		expect(disconnect).toHaveBeenCalled();
	});

	const observeAll = () => {
		const observers: ((entries: { isIntersecting: boolean }[]) => void)[] = [];
		window.IntersectionObserver = jest.fn(callback => {
			observers.push(callback);

			return { observe: jest.fn(), disconnect: jest.fn() };
		}) as unknown as typeof IntersectionObserver;

		return observers;
	};

	test('is not observed again when its group is only built anew', () => {
		const observers = observeAll();
		const onLoad = jest.fn();

		show(false, onLoad);
		show(false, onLoad, false, { ...group, pageNums: [...group.pageNums] });

		expect(observers).toHaveLength(1);
	});

	test('after a failed load waits for the Load button instead of loading again by itself', () => {
		const observers = observeAll();
		const onLoad = jest.fn();

		show(false, onLoad, true);

		expect(observers).toHaveLength(0);
		expect(container.textContent).toContain('Could not load the 2D results: Dose map');
		act(() => loadButton()?.click());
		expect(onLoad).toHaveBeenCalledTimes(1);
	});

	test('offers a Load button where the browser cannot tell what is in view', () => {
		// a browser without IntersectionObserver
		delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
		const onLoad = jest.fn();

		show(false, onLoad);
		expect(container.textContent).toContain('2D results: Dose map');
		act(() => loadButton()?.click());

		expect(onLoad).toHaveBeenCalledWith(group);
	});

	test('shows a spinner instead of the button while its pages load', () => {
		delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;

		show(true, jest.fn());

		expect(loadButton()).toBeUndefined();
		expect(container.querySelector('[role="progressbar"]')).not.toBeNull();
	});
});
