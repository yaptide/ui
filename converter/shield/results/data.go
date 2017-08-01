package results

import (
	"github.com/Palantir/palantir/converter/shield"
)

// ShieldParserInput input for shield results parser.
type ShieldParserInput struct {
	serializeContext *shield.SerializeParseContext
	bdo              map[string]string
}

// ShieldParserOutput output from shield results parser.
type ShieldParserOutput struct {
}

// NewShieldParserInput constructor.
func NewShieldParserInput(input map[string]string, serializeContext *shield.SerializeParseContext) (*ShieldParserInput, error) {
	return &ShieldParserInput{
		serializeContext: serializeContext,
		bdo:              input,
	}, nil
}
