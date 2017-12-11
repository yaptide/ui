package serialize

import (
	"bytes"
	"fmt"
	"io"

	"github.com/Palantir/palantir/converter/shield/setup/serialize/data"
)

func serializeGeo(geometry data.Geometry) string {
	w := &bytes.Buffer{}

	serializeTitle(w)
	serializeBodies(w, geometry.Bodies)
	serializeZones(w, geometry.Zones)
	serializeZoneToMaterialPairs(w, geometry.ZoneToMaterialPairs)
	w.WriteString("\n")

	return w.String()
}

func serializeTitle(w io.Writer) {
	const (
		// JDBG1 selects whether the file for017 containing the
		// geometry debugging information should be kept
		// (0) or deleted (1) after the geometry parser was initialized.
		jdbg1 = 0

		//JDBG2 describes the lower cutoff value of transportation
		// step size in powers of 10, i.e. 10e−|JDBG2|.
		jdbg2 = 0
	)
	var (
		geoName = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxNAMExxxxxxxxxxxxxxxxxxxxxxxxxxxx"
	)
	fmt.Fprintf(w, "%5d%5d%10s%60s", jdbg1, jdbg2, "", geoName)
}

func serializeBodies(w io.Writer, bodies []data.Body) {
	const argumentsNumberInLine = 6

	writeBodyArgumentsLine := func(arguments []float64, argOffset int) {
		for i := 0; i < argumentsNumberInLine; i++ {
			if argOffset+i < len(arguments) {
				fmt.Fprintf(w, floatToFixedWidthString(arguments[argOffset+i], 10))
			} else {
				// padding
				fmt.Fprintf(w, "%10s", "")
			}
		}
	}

	for _, body := range bodies {
		// first line
		fmt.Fprintf(w,
			"\n%2s%3s%1s%4d",
			"",
			body.Identifier,
			"",
			body.ID,
		)
		writeBodyArgumentsLine(body.Arguments, 0)

		// next lines
		for i := argumentsNumberInLine; i < len(body.Arguments); i += argumentsNumberInLine {
			fmt.Fprintf(w, "\n%10s", "")
			writeBodyArgumentsLine(body.Arguments, i)
		}

	}
	fmt.Fprintf(w, "\n  END")
}

func generateNameFromNumber(n, nameLength int) string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	buff := bytes.Buffer{}
	for i := 0; i < nameLength; i++ {
		buff.WriteByte(charset[n%len(charset)])
		n /= len(charset)
	}

	return buff.String()
}

func serializeZones(w io.Writer, zones []data.Zone) {

	const constructionsNumberInLine = 9

	for n, zone := range zones {
		for i := 0; i < len(zone.Constructions); i += constructionsNumberInLine {
			fmt.Fprintf(w, "\n%2s", "")
			if i == 0 {
				fmt.Fprintf(w, "%3s", generateNameFromNumber(n, 3))
			} else {
				fmt.Fprintf(w, "%3s", "")
			}
			fmt.Fprintf(w, "%5d", zone.ID)

			var currentSlice []data.Construction
			if i+constructionsNumberInLine < len(zone.Constructions) {
				currentSlice = zone.Constructions[i : i+constructionsNumberInLine]
			} else {
				currentSlice = zone.Constructions[i:]
			}

			for _, construction := range currentSlice {
				number := fmt.Sprintf("%s%d", construction.Sign, construction.BodyID)
				fmt.Fprintf(w, "%2s%5s", construction.Operation, number)
			}
		}
	}

	fmt.Fprintf(w, "\n  END")
}

func serializeZoneToMaterialPairs(w io.Writer, zoneToMaterialPairs []data.ZoneToMaterial) {
	const mappingNumberPerLine = 14

	type IDGetter = func(data.ZoneToMaterial) int64

	for _, idGetter := range []IDGetter{
		func(ztm data.ZoneToMaterial) int64 { return int64(ztm.ZoneID) },
		func(ztm data.ZoneToMaterial) int64 { return int64(ztm.MaterialID) },
	} {
		for i := 0; i < len(zoneToMaterialPairs); i += 14 {
			var currentSlice []data.ZoneToMaterial
			if i+mappingNumberPerLine <= len(zoneToMaterialPairs) {
				currentSlice = zoneToMaterialPairs[i : i+mappingNumberPerLine]
			} else {
				currentSlice = zoneToMaterialPairs[i:]
			}
			fmt.Fprintf(w, "\n")
			for _, zoneToMaterial := range currentSlice {
				fmt.Fprintf(w, "%5d", idGetter(zoneToMaterial))
			}
		}
	}

}
