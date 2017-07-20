// Package result implement result.result, which contains simulation results data.
package result

// Result contains all simulation result data.
type Result struct {
	Errors map[string]string `json:"errors"`
}

// NewEmptyResult constructor.
func NewEmptyResult() *Result {
	return &Result{}
}
