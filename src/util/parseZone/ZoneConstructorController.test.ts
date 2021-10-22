import ZoneConstructorController from "./ZoneConstructorController";

test("find correct dimension of array", () => {
    let dim = new ZoneConstructorController().getDimension(null);
    expect(dim).toBe(-1);

    dim = new ZoneConstructorController().getDimension(1);
    expect(dim).toBe(0);

    dim = new ZoneConstructorController().getDimension([1]);
    expect(dim).toBe(1);

    dim = new ZoneConstructorController().getDimension([[], [1]]);
    expect(dim).toBe(2);

    dim = new ZoneConstructorController().getDimension([[]]);
    expect(dim).toBe(-1);
});

test("create valid controller with class constructor", () => {
    let ctrl = new ZoneConstructorController();
    expect(ctrl.commonPrefix).toEqual([]);
    expect(ctrl.tails).toEqual([]);

    ctrl = new ZoneConstructorController([2, 1, 3, 7]);
    expect(ctrl.commonPrefix).toEqual([2, 1, 3, 7]);
    expect(ctrl.tails).toEqual([]);

    ctrl = new ZoneConstructorController(0, [2, 1, 3, 7]);
    expect(ctrl.commonPrefix).toEqual([0]);
    expect(ctrl.tails).toEqual([[2, 1, 3, 7]]);
});

test("generate correct string value for the zone", () => {
    let ctrl = new ZoneConstructorController([7], []);
    expect(ctrl.toString()).toEqual("+7");

    ctrl = new ZoneConstructorController([], [[-6], [-5]]);
    expect(ctrl.toString()).toEqual("-5 OR -6");

    ctrl = new ZoneConstructorController([3], [[-2], [1]]);
    expect(ctrl.toString()).toEqual("+1 +3 OR -2 +3");

    ctrl = new ZoneConstructorController(
        [9],
        [
            [8, 7, 6],
            [-5, -4],
        ]
    );
    expect(ctrl.toString()).toEqual("-4 -5 +9 OR +6 +7 +8 +9");
});

test("shift tails to new values", () => {
    let ctrl = new ZoneConstructorController([], []);
    ctrl.shiftTails(10);
    expect(ctrl.commonPrefix).toEqual([10]);
    expect(ctrl.tails).toEqual([]);

    ctrl = new ZoneConstructorController([], [-2]);
    ctrl.shiftTails(10);
    expect(ctrl.commonPrefix).toEqual([10]);
    expect(ctrl.tails).toEqual([[2]]);

    ctrl = new ZoneConstructorController([3], [2, 1]);
    ctrl.shiftTails(4);
    expect(ctrl.commonPrefix).toEqual([4]);
    expect(ctrl.tails).toEqual([[-3], [-2], [-1]]);

    ctrl = new ZoneConstructorController([3], [[2], [-1]]);
    ctrl.shiftTails(4);
    expect(ctrl.commonPrefix).toEqual([4]);
    expect(ctrl.tails).toEqual([
        [-3], 
        [-2, +1]
    ]);
});

test("extend common prefix values", () => {
    let ctrl = new ZoneConstructorController();
    ctrl.extendPrefix(-2);
    expect(ctrl.commonPrefix).toEqual([-2]);

    ctrl = new ZoneConstructorController([2, 1]);
    ctrl.extendPrefix(3);
    expect(ctrl.commonPrefix).toEqual([3, 2, 1]);
});
