package shield

// SerializeParseContext is data used to recover data lost in process of serializing simulation data.
type SerializeParseContext struct {
	MapBodyID           map[string]string
	MapDetectorIDToFile map[string]string
	MapZoneIDToZones    map[string][]string
	// TODO needs to extended
}

// NewSerializeParseContext constructor
func NewSerializeParseContext() *SerializeParseContext {
	return &SerializeParseContext{
		MapBodyID:           map[string]string{},
		MapDetectorIDToFile: map[string]string{},
		MapZoneIDToZones:    map[string][]string{},
	}
}
