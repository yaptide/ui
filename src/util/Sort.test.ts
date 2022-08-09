import { orderAccordingToList } from "./Sort";

test('ordering according to full list', () => {
    const list = [{ id: '1', name: 'a' }, { id: '2', name: 'b' }, { id: '3', name: 'c' }, { id: '4', name: 'd' }];
    const orderList = [{ id: '1' }, { id: '3' }, { id: '4' }, { id: '2' }];

    const listExpected = [{ id: '1', name: 'a' }, { id: '3', name: 'c' }, { id: '4', name: 'd' }, { id: '2', name: 'b' }];

    const listOrdered = orderAccordingToList(list, orderList, 'id');

    expect(listOrdered).toEqual(listExpected);
});

test('ordering according to list with duplicates', () => {
    const list = [{ id: '1', name: 'a' }, { id: '2', name: 'b' }, { id: '3', name: 'c2' }, { id: '3', name: 'c1' }, { id: '4', name: 'd' }];
    const orderList = [{ id: '1' }, { id: '3' }, { id: '4' }, { id: '2' }, { id: '3' }];

    const listExpected = [{ id: '1', name: 'a' }, { id: '3', name: 'c2' }, { id: '4', name: 'd' }, { id: '2', name: 'b' }, { id: '3', name: 'c1' }];

    const listOrdered = orderAccordingToList(list, orderList, 'id');

    expect(listOrdered).toEqual(listExpected);
});
