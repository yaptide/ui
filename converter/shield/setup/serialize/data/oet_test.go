package data

import (
	"testing"

	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/setup/zone"
	"github.com/stretchr/testify/assert"
)

func TestOetFromZoneDescription(t *testing.T) {
	baseBodyID := shield.BodyID(1)
	operations := []operation{
		operation{BodyID: 2, Type: zone.Intersect},
		operation{BodyID: 3, Type: zone.Union},
		operation{BodyID: 4, Type: zone.Subtract},
	}

	expected := createOetBinaryExpression(intersection,
		createOetBinaryExpression(
			union,
			createOetBinaryExpression(
				intersection,
				createOetValue(1, Plus),
				createOetValue(2, Plus),
				Plus,
			),
			createOetValue(3, Plus),
			Plus,
		),
		createOetValue(4, Minus),
		Plus)

	actual := oetFromZoneDescription(baseBodyID, operations)

	assert.Equal(t, expected, actual)
}

func TestOetUnion(t *testing.T) {
	oets := []*oet{
		createOetValue(1, Plus),
		createOetValue(2, Minus),
		createOetValue(3, Minus),
	}

	expected := createOetBinaryExpression(
		union,
		createOetBinaryExpression(
			union,
			createOetValue(1, Plus),
			createOetValue(2, Minus),
			Plus,
		),
		createOetValue(3, Minus),
		Plus,
	)

	actual := oetUnion(oets...)

	assert.Equal(t, expected, actual)
}

func TestOetSubstract(t *testing.T) {
	left := createOetValue(1, Plus)
	right := createOetBinaryExpression(
		union,
		createOetBinaryExpression(
			union,
			createOetValue(1, Plus),
			createOetValue(2, Minus),
			Plus,
		),
		createOetValue(3, Minus),
		Plus,
	)

	expected := createOetBinaryExpression(
		intersection,
		createOetValue(1, Plus),
		createOetBinaryExpression(
			union,
			createOetBinaryExpression(
				union,
				createOetValue(1, Plus),
				createOetValue(2, Minus),
				Plus,
			),
			createOetValue(3, Minus),
			Minus,
		),
		Plus)

	actual := oetSubtract(left, right)

	assert.Equal(t, expected, actual)
}
