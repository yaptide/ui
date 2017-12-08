package data

import "fmt"

type makeNewGeneralErrorFuncType = func(message string, formatedvalues ...interface{}) error
type makeNewIDErrorFuncType = func(id interface{}, message string, formatedValues ...interface{}) error

var newGeneralMatError = makeNewGeneralErrorFunc("mat.dat")
var newMaterialIDError = makeNewIDErrorFunc("Material", "mat.dat")
var newGeneralDetectorError = makeNewGeneralErrorFunc("detect.dat")

var newBodyIDError = makeNewIDErrorFunc("Body", "geo.dat")
var newZoneIDError = makeNewIDErrorFunc("Zone", "geo.dat")

var newDetectorIDError = makeNewIDErrorFunc("Detector", "detect.dat")

func makeNewGeneralErrorFunc(serializedFileName string) makeNewGeneralErrorFuncType {
	return func(message string, formatedValues ...interface{}) error {
		return fmt.Errorf("[serializer] "+serializedFileName+": "+message, formatedValues...)
	}
}

func makeNewIDErrorFunc(modelName, serializedFileName string) makeNewIDErrorFuncType {
	return func(id interface{}, message string, formatedValues ...interface{}) error {
		header := fmt.Sprintf("[serializer] %s{Id: %v} -> %s: ", modelName, id, serializedFileName)
		return fmt.Errorf(header+message, formatedValues...)
	}
}
