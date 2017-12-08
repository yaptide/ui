// Package result implement result.result, which contains simulation results data.
package result

import "github.com/Palantir/palantir/model/simulation/setup/detector"

// Result contains all simulation result data.
type Result struct {
	Errors    map[string]string `json:"errors"`
	Metadata  map[string]string `json:"result_metadata"`
	Detectors []DetectorResult  `json:"detectors"`
}

// DetectorResult contains simulation result data for single detector.
type DetectorResult struct {
	DetectorID       detector.ID       `json:"detectorId"`
	Errors           map[string]string `json:"errors"`
	DetectorMetadata map[string]string `json:"metadata"`
	Data             [][][]float64     `json:"scored"`
	Dimensions       Dimensions        `json:"dimensions"`
}

// NewDetectorResult constructor.
func NewDetectorResult() DetectorResult {
	return DetectorResult{
		Errors:           map[string]string{},
		DetectorMetadata: map[string]string{},
	}
}

// NewEmptyResult constructor.
func NewEmptyResult() Result {
	return Result{
		Detectors: make([]DetectorResult, 0),
	}
}

// AddDetectorResults adds results for single detector.
func (r *Result) AddDetectorResults(detectorResult DetectorResult) {
	r.Detectors = append(r.Detectors, detectorResult)
}
