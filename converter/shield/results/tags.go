package results

import (
	"bytes"
	"encoding/binary"

	"github.com/Palantir/palantir/model/simulation/result"
	bin "github.com/Palantir/palantir/utils/binary"
	"github.com/Palantir/palantir/utils/errors"
	"github.com/Palantir/palantir/utils/log"
)

const (
	// Basic system info
	tagShieldVersionName = 0x00
	tagShieldBuildDate   = 0x01
	tagFileCreationDat   = 0x02
	tagUsername          = 0x03
	tagHostname          = 0x04

	// Configuraton

	// DELTAE
	tagdele = 0xCC00 // Tag <f8 value 5.000000074505806e-02
	// DEMIN
	tagdemin  = 0xCC01 // Tag <f8 value 2.500000037252903e-02
	tagitypst = 0xCC02 // Tag <i8 value 1
	tagitypms = 0xCC03 // Tag <i8 value 1
	tagoln    = 0xCC04 // <f8 0e+00
	//NUCRE
	// 1 - Allow nucler reactions
	// 0 - oposite
	tagConfNucre  = 0xCC05 // <i8
	tagiemtrans   = 0xCC06 //
	tagiextspec   = 0xCC07
	tagintrfast   = 0xCC08
	tagintrslow   = 0xCC09
	tagapzlscl    = 0xCC0A
	tagioffset    = 0xCC0B
	tagirifimc    = 0xCC0C
	tagirifitrans = 0xCC0D
	tagirifizone  = 0xCC0E
	tagextnproj   = 0xCC0F
	tagextptvdose = 0xCC10
	tagixfirs     = 0xCC11

	// CT specific tags
	tagctang  = 0xCE00 // holds two doubles with the couch and gantry angle
	tagcticnt = 0xCE01 // holds three
	tagctlen  = 0xCE02 // holds three

	// Estimator specific tags
	tagestgeotyp = 0xEE00 // may differ from detgeotyp in case of spc
	tagestpages  = 0xEE01 // number of detectors / pages for this estimator

	// Detector/page specific tags
	tagdetgeotyp = 0xDD00 // may differ from estgeotyp in case of spc

	// Nuber of slices along certain axis (not necessary cartesian depends on  detector
	tagDetectorSlices = 0xDD01 // <i8 (len=3) number of bins x,y,z
	tagdetpart        = 0xDD02 // idet(4) particle type which was scored
	tagdetdtype       = 0xDD03 // idet(5) detector type
	tagdetpartz       = 0xDD04 // idet(6)
	tagdetparta       = 0xDD05 // idet(7)
	tagdetdmat        = 0xDD06 // idet(8)
	tagdetnbine       = 0xDD07 // idet(9) number of bins in diff scorer, negative means log binning
	tagdetdifftype    = 0xDD08 // idet(10) detector type for differential scorer (i.e. angle, energy, let)
	tagdetzonestart   = 0xDD09 // idet(11)
	tagdetdsize       = 0xDD0A // idet(12)
	tagdetdsizexyz    = 0xDD0B // idet(13)

	tagdetxyzstart = 0xDD0C // det(1-3)
	tagdetxyzstop  = 0xDD0D // det(4-6)
	tagdetdifstart = 0xDD0E // det(7)
	tagdetdifstop  = 0xDD0F // det(8)
	tagdetvoxvol   = 0xDD10 // det(9)

	tagMainDataBlock = 0xDDBB // data block

	// Runtime variables
	tagrtnstat = 0xAA00 // number of actually simulated particles
	tagrttime  = 0xAA01 // [usignend long int] optional runtime in seconds
)

type tagHandlerFunc func(dtype bdoDataUnit, payload [][]byte, parser *bdoParser) error

var tagsHandler = map[uint64]tagHandlerFunc{
	tagShieldVersionName: constructHandleGeneralInfoTags("shieldVersionName"),
	tagShieldBuildDate:   constructHandleGeneralInfoTags("shieldBinaryBuildDate"),
	tagFileCreationDat:   constructHandleGeneralInfoTags("endSimulationDate"),
	tagUsername:          constructHandleGeneralInfoTags("username"),
	tagHostname:          constructHandleGeneralInfoTags("hostname"),

	//MOCK handlers
	tagdele:       constructHandleDebugTags("tagdele"),
	tagdemin:      constructHandleDebugTags("tagdemin"),
	tagitypst:     constructHandleDebugTags("tagitypst"),
	tagitypms:     constructHandleDebugTags("tagitypms"),
	tagoln:        constructHandleDebugTags("tagoln"),
	tagConfNucre:  constructHandleDebugTags("taginucre"),
	tagiemtrans:   constructHandleDebugTags("tagiemtrans"),
	tagiextspec:   constructHandleDebugTags("tagiextspec"),
	tagintrfast:   constructHandleDebugTags("tagintrfast"),
	tagintrslow:   constructHandleDebugTags("tagintrslow"),
	tagapzlscl:    constructHandleDebugTags("tagapzlscl"),
	tagioffset:    constructHandleDebugTags("tagioffset"),
	tagirifimc:    constructHandleDebugTags("tagirifimc"),
	tagirifitrans: constructHandleDebugTags("tagirifitrans"),
	tagirifizone:  constructHandleDebugTags("tagirifizone"),
	tagextnproj:   constructHandleDebugTags("tagextnproj"),
	tagextptvdose: constructHandleDebugTags("tagextptvdose"),
	tagixfirs:     constructHandleDebugTags("tagixfirs"),
	tagctang:      constructHandleDebugTags("tagctang"),
	tagcticnt:     constructHandleDebugTags("tagcticnt"),
	tagctlen:      constructHandleDebugTags("tagctlen"),
	tagestgeotyp:  constructHandleDebugTags("tagestgeotyp"),
	tagestpages:   constructHandleDebugTags("tagestpages"),
	tagdetgeotyp:  constructHandleDebugTags("tagdetgeotyp"),

	tagDetectorSlices: handleResultDimensions,

	tagdetpart:      constructHandleDebugTags("tagdetpart"),
	tagdetdtype:     constructHandleDebugTags("tagdetdtype"),
	tagdetpartz:     constructHandleDebugTags("tagdetpartz"),
	tagdetparta:     constructHandleDebugTags("tagdetparta"),
	tagdetdmat:      constructHandleDebugTags("tagdetdmat"),
	tagdetnbine:     constructHandleDebugTags("tagdetnbine"),
	tagdetdifftype:  constructHandleDebugTags("tagdetdifftype"),
	tagdetzonestart: constructHandleDebugTags("tagdetzonestart"),
	tagdetdsize:     constructHandleDebugTags("tagdetdsize"),
	tagdetdsizexyz:  constructHandleDebugTags("tagdetdsizexyz"),
	tagdetxyzstart:  constructHandleDebugTags("tagdetxyzstart"),
	tagdetxyzstop:   constructHandleDebugTags("tagdetxyzstop"),
	tagdetdifstart:  constructHandleDebugTags("tagdetdifstart"),
	tagdetdifstop:   constructHandleDebugTags("tagdetdifstop"),
	tagdetvoxvol:    constructHandleDebugTags("tagdetvoxvol"),

	// Main data block contain result of detector scoring
	tagMainDataBlock: handleMainDataBlockTag,
	tagrtnstat:       constructHandleDebugTags("tagrtnstat"),
	tagrttime:        constructHandleDebugTags("tagrttime"),
}

func constructHandleGeneralInfoTags(tagStatName string) tagHandlerFunc {
	return func(dtype bdoDataUnit, payload [][]byte, parser *bdoParser) error {
		log.Debug("Started handler bdoDataUnit %v", dtype)
		if len(payload) > 1 {
			errStr := log.Warning("Too much tag values(%v) for tag %s", len(payload), tagStatName)
			return errors.NewApp(errStr)
		}
		if len(payload) == 0 {
			errStr := log.Warning("No values for tag %s", tagStatName)
			return errors.NewApp(errStr)
		}
		if dtype.IsString() {
			value := bin.ReadNULLTerminatedString(payload[0])
			parser.metadata[tagStatName] = value
		} else {
			errStr := log.Warning("Unexpected type %v for tag %s", dtype, tagStatName)
			return errors.NewApp(errStr)
		}
		return nil
	}
}

func constructHandleDebugTags(tagStatName string) tagHandlerFunc {
	return func(dtype bdoDataUnit, payload [][]byte, parser *bdoParser) error {
		log.Debug("Started handler bdoDataUnit %v", dtype)
		if len(payload) > 1 {
			log.Debug("Start printing multiple tags for %s number: %v", tagStatName, len(payload))
			for k, v := range payload {
				log.Debug("index %v value %s", k, dtype.ToString(v, parser.endiness))
			}
		}
		if len(payload) == 0 {
			errStr := log.Warning("No values for tag %s", tagStatName)
			return errors.NewApp(errStr)
		}
		if len(payload) == 1 {
			log.Debug("Tag %s value %s", dtype, dtype.ToString(payload[0], parser.endiness))
		}
		return nil
	}
}

func handleResultDimensions(dtype bdoDataUnit, payload [][]byte, parser *bdoParser) error {
	if dtype != "<i8" {
		errStr := log.Warning("[handleMainDataBlockTag] Unexpected data type %s.", dtype)
		return errors.NewRest("dataType", "Unexpected data type in Shield result file", errStr)
	}
	if len(payload) != 3 {
		errStr := log.Warning("[handleMainDataBlockTag] Should be 3 dimesnions", dtype)
		return errors.NewRest("dataType", "Unexpected token length in Shield result file. Expected 3 dimensions.", errStr)
	}
	parser.Results.Dimensions = result.Dimensions{}
	var dim1, dim2, dim3 int64
	_ = binary.Read(bytes.NewBuffer(payload[0]), dtype.GetByteOrder(parser.endiness), &dim1)
	_ = binary.Read(bytes.NewBuffer(payload[1]), dtype.GetByteOrder(parser.endiness), &dim2)
	_ = binary.Read(bytes.NewBuffer(payload[2]), dtype.GetByteOrder(parser.endiness), &dim3)
	dims := []int64{dim1, dim2, dim3}
	numOfDimensions := int64(0)
	for _, dim := range dims {
		if dim > 1 {
			numOfDimensions++
		}
	}
	parser.Results.Dimensions.NumberOfDimensions = numOfDimensions
	parser.Results.Dimensions.SegmentsInDim1 = dim1
	parser.Results.Dimensions.SegmentsInDim2 = dim2
	parser.Results.Dimensions.SegmentsInDim3 = dim3
	return nil
}

func handleMainDataBlockTag(dtype bdoDataUnit, payload [][]byte, parser *bdoParser) error {
	if dtype != "<f8" {
		errStr := log.Error("[handleMainDataBlockTag] Unexpected data type %s.", dtype)
		return errors.NewRest("dataType", "Unexpected data type in SHIeld result file", errStr)
	}
	expectedPayloadSize := parser.Results.Dimensions.SegmentsInDim1 *
		parser.Results.Dimensions.SegmentsInDim2 *
		parser.Results.Dimensions.SegmentsInDim3

	if int64(len(payload)) != expectedPayloadSize {
		errStr := log.Error("[handleMainDataBlockTag] To short token payload size.")
		return errors.NewRest("mainDataBlock", "To short token payload size.", errStr)
	}

	parser.Results.Data = make([][][]float64, parser.Results.Dimensions.SegmentsInDim3)
	for i := int64(0); i < parser.Results.Dimensions.SegmentsInDim3; i++ {
		parser.Results.Data[i] = make([][]float64, parser.Results.Dimensions.SegmentsInDim2)
		for j := int64(0); j < parser.Results.Dimensions.SegmentsInDim2; j++ {
			parser.Results.Data[i][j] = make([]float64, parser.Results.Dimensions.SegmentsInDim1)
			for k := int64(0); k < parser.Results.Dimensions.SegmentsInDim1; k++ {
				index :=
					i*parser.Results.Dimensions.SegmentsInDim1*parser.Results.Dimensions.SegmentsInDim2 +
						j*parser.Results.Dimensions.SegmentsInDim1 +
						k
				var parsedValue float64
				_ = binary.Read(bytes.NewBuffer(payload[index]), dtype.GetByteOrder(parser.endiness), &parsedValue)
				parser.Results.Data[i][j][k] = parsedValue
			}
		}
	}
	return nil
}
