package project

// Object TODO
type Object struct {
	ID       int64     `json:"id"`
	Name     string    `json:"name"`
	Versions []Version `json:"versions"`
}

// List TODO
type List struct {
	Projects []Object `json:"projects"`
}

// Version TODO
type Version struct {
	ID         int64 `json:"id"`
	Settings   int64 `json:"settings"`     // TODO create setting model
	Simulation int64 `json:"simulationId"` // TODO change id to reference add Marshaling
	Results    int64 `json:"resultsId"`
}
