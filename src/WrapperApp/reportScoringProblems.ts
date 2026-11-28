import { enqueueSnackbar } from 'notistack';

import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { findScoringProblems } from '../ThreeEditor/Simulation/Scoring/scoringProblems';

const SHOWN_PROBLEMS = 5;

export function reportScoringProblems(editorJson: EditorJson, title: string): boolean {
	const problems = findScoringProblems(editorJson);

	if (problems.length === 0) return false;

	const hidden = problems.length - SHOWN_PROBLEMS;
	const lines = [
		title,
		...problems.slice(0, SHOWN_PROBLEMS),
		...(hidden > 0 ? [`…and ${hidden} more.`] : [])
	];

	enqueueSnackbar(lines.join('\n'), {
		variant: 'error',
		autoHideDuration: 10000,
		style: { whiteSpace: 'pre-line' }
	});

	return true;
}
