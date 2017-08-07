package project

import (
	"encoding/json"
	"fmt"
)

// ComputingLibrary library used for computing
type ComputingLibrary int

const (
	// UnassignedLibrary unassigned
	UnassignedLibrary ComputingLibrary = iota

	// ShieldLibrary SHILD-HIT12A
	ShieldLibrary

	// FlukaLibrary FLUKA
	FlukaLibrary
)

// SimulationEngine is method/location of running simulation
type SimulationEngine int

const (
	// UnassignedEngine unassigned
	UnassignedEngine SimulationEngine = iota

	// LocalMachine simulation engine
	LocalMachine
)

var mapComputingLibraryToJSON = map[ComputingLibrary]string{
	UnassignedLibrary: "",
	ShieldLibrary:     "shield",
	FlukaLibrary:      "fluka",
}

var mapJSONToComputingLibrary = map[string]ComputingLibrary{
	"":       UnassignedLibrary,
	"shield": ShieldLibrary,
	"fluka":  FlukaLibrary,
}

var mapSimulationEnginetoJSON = map[SimulationEngine]string{
	UnassignedEngine: "",
	LocalMachine:     "local",
}

var mapJSONToSimulationEngine = map[string]SimulationEngine{
	"":      UnassignedEngine,
	"local": LocalMachine,
}

// Settings contains simulation settings such as the used simulation engine.
type Settings struct {
	SimulationEngine SimulationEngine `json:"simulationEngine"`
	ComputingLibrary ComputingLibrary `json:"computingLibrary"`
}

// NewSettings constructor.
func NewSettings() Settings {
	return Settings{}
}

// MarshalJSON json.Marshaller implementation.
func (l ComputingLibrary) MarshalJSON() ([]byte, error) {
	res, ok := mapComputingLibraryToJSON[l]
	if !ok {
		return nil, fmt.Errorf("[Model.ComputingLibrary.MarshalJSON]: can not convert %v to string", l)
	}
	return json.Marshal(res)
}

// UnmarshalJSON json.Unmarshaller implementation.
func (l *ComputingLibrary) UnmarshalJSON(b []byte) error {
	var input string
	err := json.Unmarshal(b, &input)
	if err != nil {
		return err
	}

	lib, ok := mapJSONToComputingLibrary[input]
	if !ok {
		return fmt.Errorf("[Model.ComputingLibrary.UnmarshalJSON] Warning: can not convert %s to ComputingLibrary", input)
	}
	*l = lib
	return nil
}

// MarshalJSON json.Marshaller implementation.
func (s SimulationEngine) MarshalJSON() ([]byte, error) {
	res, ok := mapSimulationEnginetoJSON[s]
	if !ok {
		return nil, fmt.Errorf("[Model.SimulationEngine.MarshalJSON]: can not convert %v to string", s)
	}
	return json.Marshal(res)
}

// UnmarshalJSON json.Unmarshaller implementation.
func (s *SimulationEngine) UnmarshalJSON(b []byte) error {
	var input string
	err := json.Unmarshal(b, &input)
	if err != nil {
		return err
	}

	engine, ok := mapJSONToSimulationEngine[input]
	if !ok {
		return fmt.Errorf("[Model.SimulationEngine.UnmarshalJSON] Warning: can not convert %s to SimulationEngine", input)
	}
	*s = engine
	return nil
}
