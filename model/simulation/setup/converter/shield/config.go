package shield

// Config contains SHIELD-HIT input files data
type Config struct {
	Mat    string `json:"mat"`
	Beam   string `json:"beam"`
	Geo    string `json:"geo"`
	Detect string `json:"detect"`
}
