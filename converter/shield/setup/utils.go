package setup

import (
	"bytes"
	"fmt"
)

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

//func removeShieldComments(input string) string {
//	result := ""
//	for _, line := range strings.Split(strings.TrimSuffix(input, "\n"), "\n") {
//		if !strings.HasPrefix(line, "*") {
//			result += line
//		}
//	}
//	return result
//}
