package serialize

import (
	"bytes"
	"fmt"

	"github.com/Palantir/palantir/model/simulation/setup/body"
	"github.com/Palantir/palantir/model/simulation/setup/material"
)

type materialIDSlice []material.ID

func (p materialIDSlice) Len() int           { return len(p) }
func (p materialIDSlice) Less(i, j int) bool { return p[i] < p[j] }
func (p materialIDSlice) Swap(i, j int)      { p[i], p[j] = p[j], p[i] }

type bodyIDSlice []body.ID

func (p bodyIDSlice) Len() int           { return len(p) }
func (p bodyIDSlice) Less(i, j int) bool { return p[i] < p[j] }
func (p bodyIDSlice) Swap(i, j int)      { p[i], p[j] = p[j], p[i] }

// TODO change to type aliases in go 1.9
// type newGeneralErrorFunc func(message interface{}, formatedvalues ...interface{}) error
// type newIDErrorFunc func(id interface{}, message interface{}, formatedValues ...interface{}) error

var newGeneralMatError = generalErrorFactory("mat.dat")

var newMaterialIDError = idErrorFactory("Material", "mat.dat")

func generalErrorFactory(serializedFileName string) func(message string, formatedvalues ...interface{}) error {
	return func(message string, formatedValues ...interface{}) error {
		return fmt.Errorf("[serializer] "+serializedFileName+": "+message, formatedValues...)
	}
}

func idErrorFactory(modelName, serializedFileName string) func(id interface{}, message string, formatedValues ...interface{}) error {
	return func(id interface{}, message string, formatedValues ...interface{}) error {
		header := fmt.Sprintf("[serializer] %s{Id: %v} -> %s: ",
			modelName,
			id,
			serializedFileName)
		return fmt.Errorf(header+message, formatedValues...)
	}
}

func writeColumnsIndicators(outputBuffer *bytes.Buffer, columnsLengths []int) {
	if len(columnsLengths) < 1 || columnsLengths[0] < 1 {
		return
	}

	outputBuffer.WriteByte('*')
	for i, v := range columnsLengths {
		if v < 2 {
			if i == 0 {
				continue
			} else {
				outputBuffer.WriteByte('#')
			}
		} else {
			if i > 0 {
				outputBuffer.WriteByte('<')
			}
			dashLen := columnsLengths[i] - 2
			outputBuffer.Write(bytes.Repeat([]byte("-"), dashLen))
			outputBuffer.WriteByte('>')
		}
	}
	outputBuffer.WriteByte('\n')
}

func writeSectionNameComment(outputBuffer *bytes.Buffer, name string) {
	if outputBuffer.Len() != 0 {
		fmt.Fprint(outputBuffer, "*\n*\n*\n")
	}
	fmt.Fprintf(outputBuffer, "* %s:\n", name)
}
