// Package util provide utilities functions for web package.
package util

import (
	"encoding/json"
	"log"
	"net/http"
)

// DecodeJSONResponse decode json payload from request to result.
// Write http.StatusBadRequest, if payload is not json or incorrect.
// Return true, if everything is ok.
func DecodeJSONResponse(w http.ResponseWriter, r *http.Request, result interface{}) bool {
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
