import { commentCsvString } from "./Csv";


test('empty line comment', () => {
    expect(commentCsvString('')).toBe('');
})

test('single line comment', () => {
    expect(commentCsvString('Amogus')).toBe('#Amogus');
})

test('multi line comment', () => {
    expect(commentCsvString('Amogus\nis\nsus')).toBe('#Amogus\n#is\n#sus');
})

test('json comment', () => {
    const jsonString = JSON.stringify({ a: 1, b: 2, c: 3 }, null, 4);
    const expected =
        `#{
#    "a": 1,
#    "b": 2,
#    "c": 3
#}`

    const commented = commentCsvString(jsonString);
    expect(commented).toBe(expected);
})
