/*
The MIT License
Copyright (c) Jeff Hansen 2018 to present.
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import requestAnimationFrame from 'raf';
import {Component} from 'react';

export const memoryStore = {
	_data: new Map(),
	get(key) {
		if (!key) {
			return null;
		}

		return this._data.get(key) || null;
	},
	set(key, data) {
		if (!key) {
			return;
		}
		return this._data.set(key, data);
	}
};

/**
 * Component that will save and restore Window scroll position.
 */
export default class ScrollPositionManager extends Component {
	constructor(props) {
		super(...arguments);
		this.connectScrollTarget = this.connectScrollTarget.bind(this);
		this._target = window;
	}

	connectScrollTarget(node) {
		this._target = node;
	}

	restoreScrollPosition(pos) {
		pos = pos || this.props.scrollStore.get(this.props.scrollKey);
		if (this._target && pos) {
			requestAnimationFrame(() => {
				scroll(this._target, pos.x, pos.y);
			});
		}
	}

	saveScrollPosition(key) {
		if (this._target) {
			const pos = getScrollPosition(this._target);
			key = key || this.props.scrollKey;
			this.props.scrollStore.set(key, pos);
		}
	}

	componentDidMount() {
		this.restoreScrollPosition();
	}

	getSnapshotBeforeUpdate(prevProps) {
		if (this.props.scrollKey !== prevProps.scrollKey) {
			this.saveScrollPosition();
		}
		return null;
	}

	componentDidUpdate(prevProps) {
		if (this.props.scrollKey !== prevProps.scrollKey) {
			this.restoreScrollPosition();
		}
	}

	componentWillUnmount() {
		this.saveScrollPosition();
	}

	render() {
		const { children = null, ...props } = this.props;
		return children && children({ ...props, connectScrollTarget: this.connectScrollTarget });
	}
}

ScrollPositionManager.defaultProps = {
	scrollStore: memoryStore
};

function scroll(target, x, y) {
	if (target instanceof window.Window) {
		target.scrollTo(x, y);
	} else {
		if (target !== null) {
			target.scrollLeft = x;
			target.scrollTop = y;
		}
	}
}

function getScrollPosition(target) {
	if (target instanceof window.Window) {
		return { x: target.scrollX, y: target.scrollY };
	}

	return { x: target.scrollLeft, y: target.scrollTop };
}
