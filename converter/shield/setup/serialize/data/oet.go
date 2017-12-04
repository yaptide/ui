package data

import (
	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
)

type oetType int

const (
	value oetType = iota
	binaryExpression
)

type oetOperator int

const (
	union oetOperator = iota
	intersection
)

func (o oetOperator) opposite() oetOperator {
	if o == union {
		return intersection
	}
	return union
}

// operationExpressionTree represent expression tree of constructive solid geometry formulas.
type oet struct {
	Type oetType
	Sign Sign

	// Only when Type==value
	Value shield.BodyID

	// Only when Type==binaryExpression
	Left     *oet
	Right    *oet
	Operator oetOperator
}

func createOetValue(val shield.BodyID, sign Sign) *oet {
	return &oet{Type: value, Value: val, Sign: sign}
}

func createOetBinaryExpression(operator oetOperator, left *oet, right *oet, sign Sign) *oet {
	return &oet{
		Type:     binaryExpression,
		Left:     left,
		Right:    right,
		Operator: operator,
		Sign:     sign,
	}
}

func (o *oet) applyDeMorganLaw() *oet {
	if o.Type == value || o.Sign == Plus {
		return o
	}

	newLeft := *o.Left
	newLeft.Sign = newLeft.Sign.opposite()

	newRight := *o.Right
	newRight.Sign = newRight.Sign.opposite()

	return createOetBinaryExpression(o.Operator.opposite(), &newLeft, &newRight, Plus)
}
func (o *oet) applyDeMorganLawRecursively() *oet {
	if o.Type == value {
		return o
	}

	afterDeMorgan := o.applyDeMorganLaw()
	return createOetBinaryExpression(
		afterDeMorgan.Operator,
		afterDeMorgan.Left.applyDeMorganLawRecursively(),
		afterDeMorgan.Right.applyDeMorganLawRecursively(),
		Plus)
}

type signValue struct {
	Sign  Sign
	Value shield.BodyID
}

func cartesian(l, r [][]signValue) [][]signValue {
	res := [][]signValue{}
	for _, i := range l {
		for _, j := range r {
			n := []signValue{}
			n = append(n, i...)
			n = append(n, j...)
			res = append(res, n)
		}
	}
	return res
}
func (o *oet) transformToUnionsOfIntersections() [][]signValue {
	if o.Type == value {
		return [][]signValue{
			[]signValue{
				signValue{Sign: o.Sign, Value: o.Value},
			},
		}
	}
	if o.Operator == union {
		return append(
			o.Left.transformToUnionsOfIntersections(),
			o.Right.transformToUnionsOfIntersections()...,
		)
	}
	return cartesian(
		o.Left.transformToUnionsOfIntersections(),
		o.Right.transformToUnionsOfIntersections(),
	)
}

func (o *oet) toConstructions() []Construction {
	withoutComplements := o.applyDeMorganLawRecursively()
	signValuesArray := withoutComplements.transformToUnionsOfIntersections()

	constructions := []Construction{}
	for i, intersections := range signValuesArray {
		for j, elem := range intersections {
			var op Operation
			if i != 0 && j == 0 {
				op = Union
			} else {
				op = Intersection
			}

			constructions = append(constructions, Construction{
				Operation: op,
				Sign:      elem.Sign,
				BodyID:    elem.Value,
			})
		}
	}

	return constructions
}

func oetFromZoneDescription(baseBodyID shield.BodyID, operations []operation) *oet {
	result := createOetValue(baseBodyID, Plus)

	for _, o := range operations {
		var operator oetOperator
		var sign Sign
		switch o.Type {
		case zone.Intersect:
			operator, sign = intersection, Plus
		case zone.Union:
			operator, sign = union, Plus
		case zone.Subtract:
			operator, sign = intersection, Minus
		}

		oetRight := createOetValue(o.BodyID, sign)
		result = createOetBinaryExpression(operator, result, oetRight, Plus)
	}
	return result
}

func oetUnion(oets ...*oet) *oet {
	if len(oets) == 0 {
		return nil
	}

	result := oets[0]
	for _, o := range oets[1:] {
		result = createOetBinaryExpression(union, result, o, Plus)
	}

	return result
}

func oetSubtract(left, right *oet) *oet {
	if right == nil {
		return left
	}
	rightCopy := *right

	switch rightCopy.Sign {
	case Plus:
		rightCopy.Sign = Minus
	case Minus:
		rightCopy.Sign = Plus
	}

	return createOetBinaryExpression(intersection, left, &rightCopy, Plus)
}
