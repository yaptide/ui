// Package pathvars offers pathvars names and pathvars extract functions.
package pathvars

import (
	"net/http"
	"strconv"

	"github.com/Palantir/palantir/model/project"
	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2/bson"
)

const (
	// ProjectID pathvar: /projects/{ProjectID}
	ProjectID = "projectId"

	// VersionID pathvar: /projects/{ProjectID}/versions/{VersionID}
	VersionID = "versionId"
)

// ExtractProjectID return extracted projectID from routes variables.
func ExtractProjectID(r *http.Request) (bson.ObjectId, bool) {
	projectID := mux.Vars(r)[ProjectID]
	if !bson.IsObjectIdHex(projectID) {
		return "", false
	}
	return bson.ObjectIdHex(projectID), true
}

// ExtractVersionID return extracted versionId from routes variables.
func ExtractVersionID(r *http.Request) (project.VersionID, bool) {
	versionIDString := mux.Vars(r)[VersionID]
	result, err := strconv.Atoi(versionIDString)
	if err != nil {
		return 0, false
	}
	return project.VersionID(result), true
}
