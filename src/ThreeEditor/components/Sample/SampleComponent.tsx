import React, { useCallback, useEffect, useState } from 'react';
import { Signal } from 'signals';
import './SampleComponent.css';

interface SampleComponentProps {
	signal: Signal;
}

function SampleComponent(props: SampleComponentProps) {
	const [objectName, setObjectName] = useState();
	const [objectID, setObjectID] = useState();

	const objectSelected = useCallback(object => {
		setObjectName(object?.name);
		setObjectID(object?.id);
	}, []);

	useEffect(() => {
		props.signal.add(objectSelected);
		return () => {
			props.signal.remove(objectSelected);
		};
	}, [objectSelected, props.signal]);

	return (
		<div className='SampleComponent'>
			Selected Name:{objectName}
			<br></br>
			Selected ID:{objectID}
		</div>
	);
}

export default SampleComponent;
