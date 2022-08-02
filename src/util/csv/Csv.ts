import { Estimator, Page1D } from "../../JsRoot/GraphData";

export const commentCsvString = (string: string) => {
    return (`#${string}`).replace(/\n/g, '\n#').replace(/#$/, '');
}

export const estimatorPageToCsv = (estimator: Estimator, page: Page1D) => {

    let estimatorMetaData = JSON.stringify(estimator.metadata ?? {}, null, 4);
    let pageMetaData = JSON.stringify(page.metadata ?? {}, null, 4);

    const titleXaxis = `${page.first_axis.name} [${page.first_axis.unit}]`;
    const titleYaxis = `${page.data.name} [${page.data.unit}]`;

    const fileTemplate =
        `# --------------------------------
#  ESTIMATOR metadata
${commentCsvString(estimatorMetaData)}
# --------------------------------
#  PAGE metadata
${commentCsvString(pageMetaData)}
${titleXaxis}, ${titleYaxis}
${page.first_axis.values.map((x, idx) => `${x}, ${page.data.values[idx]}`).join("\n")}`

    return fileTemplate;
}