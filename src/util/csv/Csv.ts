import { Estimator, Page1D } from '../../JsRoot/GraphData';
import { TablePage0DItem } from '../../WrapperApp/components/Results/ResultsTable';

export const commentCsvString = (string: string) => {
	return `#${string}`.replace(/\n/g, '\n#').replace(/#$/, '');
};

export const estimatorPage1DToCsv = (estimator: Estimator, page: Page1D) => {
	const estimatorMetaData = JSON.stringify(estimator.metadata ?? {}, null, 4);
	const pageMetaData = JSON.stringify(page.metadata ?? {}, null, 4);

	const titleXaxis = `${page.axisDim1.name} [${page.axisDim1.unit}]`;
	const titleYaxis = `${page.data.name} [${page.data.unit}]`;

	const fileTemplate = `# --------------------------------
#  ESTIMATOR metadata
${commentCsvString(estimatorMetaData)}
# --------------------------------
#  PAGE metadata
${commentCsvString(pageMetaData)}
# --------------------------------
${titleXaxis}, ${titleYaxis}
${page.axisDim1.values.map((x, idx) => `${x}, ${page.data.values[idx]}`).join('\n')} `;

	return fileTemplate;
};

export const pages0DToCsv = (estimator: Estimator, pages: TablePage0DItem[]) => {
	const estimatorMetaData = JSON.stringify(estimator.metadata ?? {}, null, 4);

	const keys = Object.keys(pages[0]).filter(
		k => !['id'].includes(k)
	) as (keyof TablePage0DItem)[];

	const fileTemplate = `# --------------------------------
#  ESTIMATOR metadata
${commentCsvString(estimatorMetaData)}
# --------------------------------
${keys.join(',')}
${pages.map(page => keys.map(key => page[key]).join(',')).join('\n')}
`;

	return fileTemplate;
};
