package results

import (
	"github.com/Palantir/palantir/utils/binary"
	err "github.com/Palantir/palantir/utils/error"
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
	tagdele       = 0xCC00
	tagdemin      = 0xCC01
	tagitypst     = 0xCC02
	tagitypms     = 0xCC03
	tagoln        = 0xCC04
	taginucre     = 0xCC05
	tagiemtrans   = 0xCC06
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
	tagdetgeotyp    = 0xDD00 // may differ from estgeotyp in case of spc
	tagdetnbin      = 0xDD01 // idet(1-3) (len=3) number of bins x,y,z
	tagdetpart      = 0xDD02 // idet(4) particle type which was scored
	tagdetdtype     = 0xDD03 // idet(5) detector type
	tagdetpartz     = 0xDD04 // idet(6)
	tagdetparta     = 0xDD05 // idet(7)
	tagdetdmat      = 0xDD06 // idet(8)
	tagdetnbine     = 0xDD07 // idet(9) number of bins in diff scorer, negative means log binning
	tagdetdifftype  = 0xDD08 // idet(10) detector type for differential scorer (i.e. angle, energy, let)
	tagdetzonestart = 0xDD09 // idet(11)
	tagdetdsize     = 0xDD0A // idet(12)
	tagdetdsizexyz  = 0xDD0B // idet(13)

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
	tagHostname:          constructHandleGeneralInfoTags("password"),

	//MOCK handlers
	tagdele:          constructHandleDebugTags("tagdele"),
	tagdemin:         constructHandleDebugTags("tagdemin"),
	tagitypst:        constructHandleDebugTags("tagitypst"),
	tagitypms:        constructHandleDebugTags("tagitypms"),
	tagoln:           constructHandleDebugTags("tagoln"),
	taginucre:        constructHandleDebugTags("taginucre"),
	tagiemtrans:      constructHandleDebugTags("tagiemtrans"),
	tagiextspec:      constructHandleDebugTags("tagiextspec"),
	tagintrfast:      constructHandleDebugTags("tagintrfast"),
	tagintrslow:      constructHandleDebugTags("tagintrslow"),
	tagapzlscl:       constructHandleDebugTags("tagapzlscl"),
	tagioffset:       constructHandleDebugTags("tagioffset"),
	tagirifimc:       constructHandleDebugTags("tagirifimc"),
	tagirifitrans:    constructHandleDebugTags("tagirifitrans"),
	tagirifizone:     constructHandleDebugTags("tagirifizone"),
	tagextnproj:      constructHandleDebugTags("tagextnproj"),
	tagextptvdose:    constructHandleDebugTags("tagextptvdose"),
	tagixfirs:        constructHandleDebugTags("tagixfirs"),
	tagctang:         constructHandleDebugTags("tagctang"),
	tagcticnt:        constructHandleDebugTags("tagcticnt"),
	tagctlen:         constructHandleDebugTags("tagctlen"),
	tagestgeotyp:     constructHandleDebugTags("tagestgeotyp"),
	tagestpages:      constructHandleDebugTags("tagestpages"),
	tagdetgeotyp:     constructHandleDebugTags("tagdetgeotyp"),
	tagdetnbin:       constructHandleDebugTags("tagdetnbin"),
	tagdetpart:       constructHandleDebugTags("tagdetpart"),
	tagdetdtype:      constructHandleDebugTags("tagdetdtype"),
	tagdetpartz:      constructHandleDebugTags("tagdetpartz"),
	tagdetparta:      constructHandleDebugTags("tagdetparta"),
	tagdetdmat:       constructHandleDebugTags("tagdetdmat"),
	tagdetnbine:      constructHandleDebugTags("tagdetnbine"),
	tagdetdifftype:   constructHandleDebugTags("tagdetdifftype"),
	tagdetzonestart:  constructHandleDebugTags("tagdetzonestart"),
	tagdetdsize:      constructHandleDebugTags("tagdetdsize"),
	tagdetdsizexyz:   constructHandleDebugTags("tagdetdsizexyz"),
	tagdetxyzstart:   constructHandleDebugTags("tagdetxyzstart"),
	tagdetxyzstop:    constructHandleDebugTags("tagdetxyzstop"),
	tagdetdifstart:   constructHandleDebugTags("tagdetdifstart"),
	tagdetdifstop:    constructHandleDebugTags("tagdetdifstop"),
	tagdetvoxvol:     constructHandleDebugTags("tagdetvoxvol"),
	tagMainDataBlock: constructHandleDebugTags("tagdetvoxvol"),
	tagrtnstat:       constructHandleDebugTags("tagrtnstat"),
	tagrttime:        constructHandleDebugTags("tagrttime"),
}

func constructHandleGeneralInfoTags(tagStatName string) tagHandlerFunc {
	return func(dtype bdoDataUnit, payload [][]byte, parser *bdoParser) error {
		log.Debug("Started handler bdoDataUnit %v", dtype)
		if len(payload) > 1 {
			errStr := log.Warning("Too much tag values(%v) for tag %s", len(payload), tagStatName)
			return err.NewApp(errStr)
		}
		if len(payload) == 0 {
			errStr := log.Warning("No values for tag %s", tagStatName)
			return err.NewApp(errStr)
		}
		if dtype.IsString() {
			value := binary.ReadNULLTerminatedString(payload[0])
			parser.metadata[tagStatName] = value
		} else {
			errStr := log.Warning("Unexpected type %v for tag %s", dtype, tagStatName)
			return err.NewApp(errStr)
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
			return err.NewApp(errStr)
		}
		if len(payload) == 1 {
			log.Debug("Tag %s value %s", dtype, dtype.ToString(payload[0], parser.endiness))
		}
		return nil
	}
}
