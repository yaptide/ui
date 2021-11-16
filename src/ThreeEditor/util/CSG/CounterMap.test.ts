import { CounterMap } from './CounterMap';

test('basic operations', () => {
    const map = new CounterMap();

    // empty
    expect(map.has('a')).toBe(false);

    expect(map.get('a')).toBe(undefined);

    expect(() => map.decrement('a')).toThrow();

    // increment
    expect(map.increment('a')).toBe(1);

    expect(map.has('a')).toBe(true);

    expect(map.get('a')).toBe(1);

    // decrement
    expect(map.decrement('a')).toBe(0);

    expect(map.has('a')).toBe(false);

    expect(map.get('a')).toBe(0);

    expect(() => map.decrement('a')).toThrow();
});

test('loading from array', () => {
    const arr = ['a', 'a', 'c', 'b', 'a', 'b'];
    const map = new CounterMap(arr);
    expect(map.get('a')).toBe(3);
    expect(map.get('b')).toBe(2);
    expect(map.get('c')).toBe(1);
    expect(map.get('d')).toBe(undefined);
});

test('serialization', () => {
    const arr = ['a', 'a', 'c', 'b', 'a', 'b'];
    const map = new CounterMap(arr);

    const obj = map.toJSON();
    expect(obj).toEqual({ a: 3, b: 2, c: 1 });

    const map2 = new CounterMap().fromJSON(obj);
    expect(map2.get('a')).toBe(3);
    expect(map2.get('b')).toBe(2);
    expect(map2.get('c')).toBe(1);
});
