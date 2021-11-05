import { UIRow, UINumber, UIText, UISelect } from "../js/libs/ui";

function createNumberInput({
    value = 0,
    precision = 3,
    update,
    min = undefined,
    max = undefined
}) {
    const input = new UINumber(value).setPrecision(precision).setWidth('50px').onChange(update);
    if (min !== undefined)
        input.min = min;
    if (max !== undefined)
        input.max = max;
    return input;
}


export function createRowParamXYZ({ text = 'Label',
    value: { x = 0, y = 0, z = 0 },
    precision = undefined,
    update,
    min = undefined,
    max = undefined }) {

    const row = new UIRow();
    const inputX = createNumberInput({ update, precision, value: x });
    const inputY = createNumberInput({ update, precision, value: y });
    const inputZ = createNumberInput({ update, precision, value: z });
    const label = new UIText(text).setWidth('90px');

    row.add(label);
    row.add(inputX, inputY, inputZ);
    return [row, inputX, inputY, inputZ, label];
}

export function createRowParam({ text = 'Label',
    value = 0,
    precision = undefined,
    update,
    min = undefined,
    max = undefined }) {

    const row = new UIRow();
    const input = createNumberInput({ update, precision, value });
    const label = new UIText(text).setWidth('90px');

    row.add(label);
    row.add(input);
    return [row, input, label];
}

export function createRowSelect({
    text = 'Label',
    options = undefined,
    value = undefined,
    update
}) {

    const row = new UIRow();
    const select = new UISelect().setWidth('150px').setFontSize('12px').setOptions(options).setValue(value).onChange(update);
    const label = new UIText(text).setWidth('90px');

    row.add(label);
    row.add(select);
    return [row, select, label];
}