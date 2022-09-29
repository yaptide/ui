export function getPrecision(num: number): number {
    var numAsStr = num.toFixed(10); //number can be presented in exponential format, avoid it
    numAsStr = numAsStr.replace(/0+$/g, '');

    var precision = String(numAsStr).replace('.', '').length - num.toFixed().length;
    return precision;
}

export function isNumeric(str: string) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str as unknown as number) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
