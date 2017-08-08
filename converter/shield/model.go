package shield

import "github.com/Palantir/palantir/model/simulation/setup/body"

// BodyID used directly in shield input files.
type BodyID int

// SerializeParseContext is data used to recover data lost in process of serializing simulation data.
type SerializeParseContext struct {
	MapBodyID map[body.ID]BodyID
	//MapDetectorIDToFile map[string]string
	//MapZoneIDToZones    map[string][]string
}
