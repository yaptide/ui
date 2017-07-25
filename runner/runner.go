// Package runner implements running simulations and supervising existing processes.
package runner

import (
	"github.com/Palantir/palantir/model/project"
)

// ResultsCommon contains common part of results of
type ResultsCommon struct {
	LogStdOut string
	LogStdErr string
	Errors    map[string]string
}

// NewResultsCommon is Results constructor
func NewResultsCommon() *ResultsCommon {
	return &ResultsCommon{
		Errors: make(map[string]string),
	}
}

// InputCommon simulation context
type InputCommon struct {
	StatusUpdateChannel chan project.VersionStatus
}

// NewInputCommon constructor
func NewInputCommon() *InputCommon {
	return &InputCommon{
		StatusUpdateChannel: make(chan project.VersionStatus),
	}
}
