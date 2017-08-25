package results

import (
	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/result"
)

// ShieldParserInput input for shield results parser.
type ShieldParserInput struct {
	serializeContext *shield.SimulationContext
	bdo              map[string]string
}

// ShieldParserOutput output from shield results parser.
type ShieldParserOutput struct {
	Results *result.Result
}

// NewShieldParserInput constructor.
func NewShieldParserInput(input map[string]string, serializeContext *shield.SimulationContext) (*ShieldParserInput, error) {
	return &ShieldParserInput{
		serializeContext: serializeContext,
		bdo:              input,
	}, nil
}

// NewShieldParserOutput constructor.
func NewShieldParserOutput() *ShieldParserOutput {
	return &ShieldParserOutput{
		Results: result.NewEmptyResult(),
	}
}
