package project

// Object TODO
type Object struct {
	ID       string    `json:"id"`
	Name     string    `json:"name"`
	Versions []Version `json:"versions"`
}

// List TODO
type List struct {
	Projects []Object `json:"projects"`
}

// Version TODO
type Version struct {
	ID       string `json:"id"`
	Settings string `json:"settings"` // TODO create setting model
	Setup    string `json:"setupId"`  // TODO change id to reference add Marshaling
	Results  string `json:"resultsId"`
}
