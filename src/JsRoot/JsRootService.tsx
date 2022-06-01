import { ReactNode, useEffect, useState } from 'react';
import { createGenericContext } from '../util/GenericContext';
import makeAsyncScriptLoader from 'react-async-script';

// submodule copy of JSROOT v6.3.4
// https://github.com/root-project/jsroot/tree/6.3.4
const JsRootUrl = `/libs/jsroot/scripts/JSRoot.core.js`;
const JsRootPainterUrl = `/libs/jsroot/scripts/JSRoot.painter.js`;
const JsRootKey = 'JSROOT';

declare global {
	interface Window {
		[JsRootKey]: {};
	}
}

export interface JsRootProps {
	children: ReactNode;
	JSROOT?: any;
}

export interface IJsRoot {
	JSROOT: any;
}

const [useJSROOT, JsRootContextProvider] = createGenericContext<IJsRoot>();

const JsRoot = (props: JsRootProps) => {
	const [value, setValue] = useState<IJsRoot>();

	useEffect(() => {
		if (!props.JSROOT) return;

		const script = document.createElement('script');

		script.src = JsRootPainterUrl;
		script.async = true;

		const handler = {
			set: function (obj: object, prop: PropertyKey, value: any) {
				Reflect.set(obj, prop, value);
				if (prop === 'Painter') {
					// detect JSROOT.Painter loaded
					setValue({ JSROOT: window.JSROOT });
				}
				return true;
			}
		};
		const proxyJsRoot = new Proxy(window.JSROOT, handler);
		window.JSROOT = proxyJsRoot;

		document.body.appendChild(script);
	}, [props.JSROOT]);

	return (
		<JsRootContextProvider value={value}>
			{value?.JSROOT && props.children}
		</JsRootContextProvider>
	);
};

const AsyncLoaderJsRoot = makeAsyncScriptLoader(JsRootUrl, {
	globalName: JsRootKey
})(JsRoot);

export { useJSROOT, AsyncLoaderJsRoot as JsRootService, JsRootUrl, JsRootKey };
