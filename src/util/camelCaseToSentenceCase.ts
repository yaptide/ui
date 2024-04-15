import { CapitalizeString } from "./Capitalize";

export function camelCaseToNormalText(input: string) {
    // Insert a space before all caps and trim any leading space
    let result = input.replace(/([A-Z])/g, ' $1').trim();
    
    // Convert the first character to uppercase and the rest to lowercase
    return CapitalizeString(result);
}