import { incrementName } from "./Name";


test('basic increments', () => {
    const names = ['a', 'b_1', 'c', 'c_1', 'c_2', 'd_', 'e', 'f_f_1', 'g_1_1'];
    const until = (name: string) => names.includes(name);

    expect(incrementName('a', until)).toBe('a_1');

    expect(incrementName('b', until)).toBe('b');

    expect(incrementName('c', until)).toBe('c_3');

    expect(incrementName('d', until)).toBe('d');

    expect(incrementName('e_e', until)).toBe('e_e');

    expect(incrementName('f_f_1', until)).toBe('f_f_2');

    expect(incrementName('f_f', until)).toBe('f_f');

    expect(incrementName('g_1', until)).toBe('g_1');

    expect(incrementName('g_1_1', until)).toBe('g_1_2');
});

