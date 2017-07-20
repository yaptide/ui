// Package util provide utilities functions for web package.
package util

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Palantir/palantir/db"
	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/pathvars"
)

// DecodeJSONRequest decode json payload from request to result.
// Write http.StatusBadRequest, if payload is not json or incorrect.
// Return true, if everything is ok.
func DecodeJSONRequest(w http.ResponseWriter, r *http.Request, result interface{}) bool {
	err := json.NewDecoder(r.Body).Decode(result)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Print(err.Error())
		return false
	}
	return true
}

// WriteJSONResponse write payload to w with given httpStatus.
// Return true, if everything is ok.
func WriteJSONResponse(w http.ResponseWriter, httpStatus int, payload interface{}) bool {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(httpStatus)
	err := json.NewEncoder(w).Encode(payload)
	if err != nil {
		log.Print(err.Error())
	}
	return err == nil
}

// WriteJSONResponseWithHeaders works like WriteJSONResponse adding headers to HTTP Response headers.
// Return true, if everything is ok.
func WriteJSONResponseWithHeaders(w http.ResponseWriter, httpStatus int, headers map[string]string, payload interface{}) bool {
	for k, v := range headers {
		w.Header().Set(k, v)
	}
	return WriteJSONResponse(w, httpStatus, payload)
}

// HandleDbError write proper http status code based on database error.
func HandleDbError(w http.ResponseWriter, err error) {
	switch {
	case err == db.ErrNotFound:
		w.WriteHeader(http.StatusNotFound)
		return
	case err != nil:
		log.Print(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

// ReadDBProjectID read db.ProjectID from request claims and routes path variables.
// It write http.StatusNotFound to w, if path variables are not valid.
// When everything goes well it return ok == true.
func ReadDBProjectID(w http.ResponseWriter, r *http.Request) (db.ProjectID, bool) {
	accountID := token.ExtractAccountID(r)
	projectID, isValid := pathvars.ExtractProjectID(r)
	if !isValid {
		w.WriteHeader(http.StatusNotFound)
		return db.ProjectID{}, false
	}
	return db.ProjectID{
		Account: accountID,
		Project: projectID,
	}, true
}

// ReadDBVersionID read db.VersionID from request claims and routes path variables.
// It write http.StatusNotFound to w, if path variables are not valid.
// When everything goes well it return ok == true.
func ReadDBVersionID(w http.ResponseWriter, r *http.Request) (db.VersionID, bool) {
	accountID := token.ExtractAccountID(r)
	projectID, isValid := pathvars.ExtractProjectID(r)
	if !isValid {
		w.WriteHeader(http.StatusNotFound)
		return db.VersionID{}, false
	}
	versionID, isValid := pathvars.ExtractVersionID(r)
	if !isValid {
		w.WriteHeader(http.StatusNotFound)
		return db.VersionID{}, false
	}
	return db.VersionID{
		Account: accountID,
		Project: projectID,
		Version: versionID,
	}, true
}
