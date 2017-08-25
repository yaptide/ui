package results

import (
	"bytes"
	"encoding/binary"
	"strings"

	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/result"
	bin "github.com/Palantir/palantir/utils/binary"
	"github.com/Palantir/palantir/utils/errors"
	"github.com/Palantir/palantir/utils/log"
)

// TODO: suport for big endian (for no litle endian files and host system is assumed)
type bdoParser struct {
	filename string
	content  []byte
	metadata map[string]string
	endiness binary.ByteOrder
	context  *shield.SimulationContext
	Results  *result.DetectorResult
}

var (
	shieldNameTag       = "xSH12A"
	lilteEndianFormat   = "II"
	bigEndianFormat     = "MM"
	shield0p6VersionTag = "0.6" + strings.Repeat("\000", 13)
)

func newBdoParser(name string, filecontent []byte, context *shield.SimulationContext) *bdoParser {
	return &bdoParser{
		context:  context,
		filename: name,
		content:  filecontent,
		metadata: map[string]string{},
		endiness: nil,
		Results:  result.NewDetectorResult(),
	}
}

func (p *bdoParser) Parse() error {
	if err := p.validateShieldVersion(); err != nil {
		return err
	}
	p.Results.DetectorMetadata = p.metadata
	p.metadata["filename"] = p.filename
	for {
		if len(p.content) == 0 {
			return nil
		}
		tokenErr := p.readNextToken()
		if tokenErr != nil {
			return tokenErr
		}
	}
}

func (p *bdoParser) validateShieldVersion() error {
	if len(p.content) < 24 {
		return errors.NewApp("To short content of %s", p.filename)
	}
	if string(p.content[0:6]) != shieldNameTag {
		return errors.NewApp("Shield [0:6] don't match xSH12A")
	}
	if string(p.content[6:8]) == lilteEndianFormat {
		p.metadata["endianness"] = "litle-endian"
		p.endiness = binary.LittleEndian
	} else if string(p.content[6:8]) == bigEndianFormat {
		p.metadata["endianness"] = "big-endian"
		p.endiness = binary.BigEndian
	} else {
		return errors.NewApp("Unknown endinaess")
	}
	if string(p.content[8:24]) != shield0p6VersionTag {
		return errors.NewApp("Suported only version 0.6 of shield binnary")
	}
	p.metadata["version"] = "0.6"
	p.content = p.content[24:]
	log.Debug("Metada after initial tag %v", p.metadata)
	return nil
}

func (p *bdoParser) readNextToken() error {
	if len(p.content) < 24 {
		return errors.NewApp("To short content of %s", p.filename)
	}

	var tagID uint64
	tagIDBinErr := binary.Read(bytes.NewBuffer(p.content[0:8]), p.endiness, &tagID)

	dataType := bdoDataUnit(bin.ReadNULLTerminatedString(p.content[8:16]))

	var numberOfItems uint64
	numberOfItemsErr := binary.Read(bytes.NewBuffer(p.content[16:24]), p.endiness, &numberOfItems)
	log.Debug("Number of items p.content %v", p.content[16:24])

	itemSize := uint64(dataType.GetSize())

	if tagIDBinErr != nil || numberOfItemsErr != nil {
		errMsg := log.Error("Unexpected read error. Can't ever happend")
		return errors.NewApp(errMsg)
	}
	tokenSize := uint64(24) + itemSize*numberOfItems
	if uint64(len(p.content)) < tokenSize {
		errMsg := log.Warning("To short content of %s", p.filename)
		return errors.NewApp(errMsg)
	}

	log.Info("Bdo token header tagId: %v, dataType: %v, tokenSize %v, numberOfItems: %v, itemSize: %v", tagID, dataType, tokenSize, numberOfItems, itemSize)
	splitedToken := p.splitTokenPayload(numberOfItems, p.content[24:tokenSize])

	handler := tagsHandler[tagID]
	if handler == nil {
		errMsg := log.Warning("Unknown handler %d", tagID)
		return errors.NewApp(errMsg)
	}

	parseTokenErr := handler(dataType, splitedToken, p)
	if parseTokenErr != nil {
		return parseTokenErr
	}
	p.content = p.content[tokenSize:]
	return nil
}

func (p *bdoParser) splitTokenPayload(numberOfItems uint64, tokenPayload []byte) [][]byte {
	splitedPayload := make([][]byte, numberOfItems)
	itemSize := uint64(len(tokenPayload)) / numberOfItems
	for i := range splitedPayload {
		splitedPayload[i] = tokenPayload[itemSize*uint64(i) : itemSize*uint64(i+1)]
	}
	return splitedPayload
}
