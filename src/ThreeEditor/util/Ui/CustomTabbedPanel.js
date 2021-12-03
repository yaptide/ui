import { UIDiv, UIText } from '../../js/libs/ui.js';
import { hideUIElement, showUIElement } from './Uis';

/**
 * @typedef {import('../js/libs/ui').UIElement} UIElement
 */

export class UICustomTab extends UIText {
	/**
	 * @param {string text}
	 * @param {UICustomTabbedPanel parent}
	 * @constructor
	 */
	constructor(text, parent) {
		super(text);

		this.dom.className = 'Tab';

		this.parent = parent;

		const scope = this;

		this.dom.addEventListener('click', function () {
			scope.parent.select(scope.dom.id);
		});
	}
}
export class UICustomTabbedPanel extends UIDiv {
	/**
	 * @constructor
	 */
	constructor() {
		super();

		this.dom.className = 'TabbedPanel';

		this.tabs = [];
		this.panels = [];

		this.tabsDiv = new UIDiv();
		this.tabsDiv.setClass('Tabs');

		this.panelsDiv = new UIDiv();
		this.panelsDiv.setClass('Panels');

		this.add(this.tabsDiv);
		this.add(this.panelsDiv);

		this.selected = '';
	}

	/**
	 * @param {string id}
	 * @param {string newName}
	 * @return {this}
	 */
	changeTabName(id, newName) {
		const tab = this.tabs.find(function (item) {
			return item.dom.id === id;
		});
		if (tab) tab.setValue(newName);

		return this;
	}

	hideTab(id) {
		const tab = this.tabs.find(function (item) {
			return item.dom.id === id;
		});
		if (tab) hideUIElement(tab);

		if (this.selected !== id) return;
		const panel = this.panels.find(function (item) {
			return item.dom.id === id;
		});
		if (panel) hideUIElement(panel);
		this.select(this.tabs[0].dom.id);

		return this;
	}

	showTab(id) {
		const tab = this.tabs.find(function (item) {
			return item.dom.id === id;
		});
		if (tab) showUIElement(tab);

		if (this.selected !== id) return;
		const panel = this.panels.find(function (item) {
			return item.dom.id === id;
		});
		if (panel) showUIElement(panel);

		return this;
	}

	/**
	 * @param {string id}
	 * @return {this}
	 */
	select(id) {
		let tab = null;
		let panel = null;
		const scope = this;

		// Deselect current selection
		if (this.selected && this.selected.length) {
			tab = this.tabs.find(function (item) {
				return item.dom.id === scope.selected;
			});
			panel = this.panels.find(function (item) {
				return item.dom.id === scope.selected;
			});

			if (tab) {
				tab.removeClass('selected');
			}

			if (panel) {
				panel.setDisplay('none');
			}
		}

		tab =
			this.tabs.find(function (item) {
				return item.dom.id === id;
			}) ?? this.tabs[0];
		panel =
			this.panels.find(function (item) {
				return item.dom.id === id;
			}) ?? this.panels[0];

		if (tab) {
			tab.addClass('selected');
		}

		if (panel) {
			panel.setDisplay('');
			this.selected = panel.dom.id;
		}

		return this;
	}

	/**
	 * @param {string id}
	 * @param {string label}
	 * @param {UIElement[] items}
	 * @return {void}
	 */
	addTab(id, label, items) {
		const tab = new UICustomTab(label, this);
		tab.setId(id);
		this.tabs.push(tab);
		this.tabsDiv.add(tab);

		const panel = new UIDiv();
		panel.setId(id);
		panel.add(...items);
		panel.setDisplay('none');
		panel.setPadding('10px');
		this.panels.push(panel);
		this.panelsDiv.add(panel);
	}

	/**
	 * @return {void}
	 */
	reset() {
		this.clear();
		this.dom.className = 'TabbedPanel';

		this.tabs = [];
		this.panels = [];

		this.tabsDiv = new UIDiv();
		this.tabsDiv.setClass('Tabs');

		this.panelsDiv = new UIDiv();
		this.panelsDiv.setClass('Panels');

		this.add(this.tabsDiv);
		this.add(this.panelsDiv);
	}
}
