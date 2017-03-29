// Package test provide utils for testing.
package test

import (
	"bytes"
	"encoding/json"
	"reflect"
	"testing"
)

func jsonPrettyPrint(in string) string {
	var out bytes.Buffer
	err := json.Indent(&out, []byte(in), "", "\t")
	if err != nil {
		return in
	}
	return out.String()
}

// MarshallingCases contains test cases for Marshalling Test functions.
type MarshallingCases []struct {
	Model interface{}

	// JSON which is compared to json.Marshal result.
	// JSON can be in any valid format. Indents and white spaces are ignored.
	JSON string
}

// Marshal run testCases on json.Marshal function.
func Marshal(t *testing.T, testCases MarshallingCases) {
	for _, tc := range testCases {
		prettyJSON := jsonPrettyPrint(tc.JSON)
		result, err := json.MarshalIndent(tc.Model, "", "\t")

		if err != nil {
			t.Error(err.Error())
		}

		sres := string(result[:])
		if sres != prettyJSON {
			t.Errorf("json.Marshal(%T): \nexpected:\n%s\nactual:\n%s",
				tc.Model, prettyJSON, sres)
		}
	}
}

// Unmarshal run test cases on json.Unmarshal function.
func Unmarshal(t *testing.T, testCases MarshallingCases) {
	for _, tc := range testCases {
		objType := reflect.TypeOf(tc.Model).Elem()
		res := reflect.New(objType).Interface()

		bInput := []byte(tc.JSON)
		err := json.Unmarshal(bInput, &res)

		if err != nil {
			t.Error(err.Error())
		}

		if !reflect.DeepEqual(res, tc.Model) {
			t.Errorf("json.Unmarshal(%T, %T): \nexpected:\n%+v\nactual:\n%+v",
				bInput, res, tc.Model, res)
		}
	}
}

// UnmarshalMarshalled first Marshal tc.Model, then Unmarshal result from previous operation.
func UnmarshalMarshalled(t *testing.T, testCases MarshallingCases) {
	for _, tc := range testCases {
		marshallingResult, err := json.Marshal(tc.Model)

		if err != nil {
			t.Error(err.Error())
		}

		objType := reflect.TypeOf(tc.Model).Elem()
		res := reflect.New(objType).Interface()
		err = json.Unmarshal(marshallingResult, &res)

		if err != nil {
			t.Error(err.Error())
		}

		if !reflect.DeepEqual(res, tc.Model) {
			t.Errorf("json.Unmarshal(%T, %T) on json.Marshal(%T) result: \nexpected:\n%s\nactual:\n%s",
				marshallingResult, res, tc.Model, tc.Model, res)
		}
	}
}

// MarshalUnmarshalled first Unmarshal tc.JSON, then Marshal result from previous operation.
func MarshalUnmarshalled(t *testing.T, testCases MarshallingCases) {
	for _, tc := range testCases {
		objType := reflect.TypeOf(tc.Model).Elem()
		unmarshallingResult := reflect.New(objType).Interface()

		bInput := []byte(tc.JSON)
		err := json.Unmarshal(bInput, &unmarshallingResult)

		if err != nil {
			t.Error(err.Error())
		}

		res, err := json.MarshalIndent(unmarshallingResult, "", "\t")

		if err != nil {
			t.Error(err.Error())
		}

		sres := string(res[:])
		if sres != jsonPrettyPrint(tc.JSON) {
			t.Errorf("json.Marshal(%T) on json.Unmarshal(%T, %T) result:\nexpected:\n%s\nactual:\n%s",
				unmarshallingResult, bInput, unmarshallingResult, tc.JSON, sres)
		}
	}
}
