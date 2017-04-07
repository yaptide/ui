package id

import (
	"net/http"

	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2/bson"
)

func extractProjectID(r *http.Request) (bson.ObjectId, bool) {
	projectID := mux.Vars(r)[projectIDRouteVar]
	if !bson.IsObjectIdHex(projectID) {
		return "", false
	}
	return bson.ObjectIdHex(projectID), true
}
