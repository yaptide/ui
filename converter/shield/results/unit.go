package results

import (
	"bytes"
	"encoding/binary"
	bin "github.com/Palantir/palantir/utils/binary"
	"github.com/Palantir/palantir/utils/log"
	"strconv"
	"strings"
)

type bdoDataUnit string

func (b bdoDataUnit) GetByteOrder(host binary.ByteOrder) binary.ByteOrder {
	dataUnit := string(b)
	if strings.Contains(dataUnit, ">") {
		return binary.BigEndian
	} else if strings.Contains(dataUnit, "<") {
		return binary.LittleEndian
	}
	return host
}

func (b bdoDataUnit) GetSize() int {
	dataUnit := string(b)
	if strings.Contains(dataUnit, "4") {
		return 4
	} else if strings.Contains(dataUnit, "8") {
		return 8
	} else if strings.Contains(dataUnit, "10") {
		return 10
	} else if strings.Contains(dataUnit, "16") {
		return 16
	} else if strings.Contains(dataUnit, "32") {
		return 32
	}
	log.Error("Invalid shield data type unit (%v)", dataUnit)
	return 0
}

func (b bdoDataUnit) IsString() bool {
	dataUnit := string(b)
	return strings.Contains(dataUnit, "S")
}

func (b bdoDataUnit) ToString(value []byte, hostByteOrder binary.ByteOrder) string {
	switch string(b) {
	case "i4":
		fallthrough
	case "<i4":
		var val int32
		_ = binary.Read(bytes.NewBuffer(value), b.GetByteOrder(hostByteOrder), &val)
		return strconv.FormatInt(int64(val), 10)

	case "i8":
		fallthrough
	case "<i8":
		var val int64
		_ = binary.Read(bytes.NewBuffer(value), b.GetByteOrder(hostByteOrder), &val)
		return strconv.FormatInt(val, 10)

	case "u4":
		fallthrough
	case "<u4":
		var val uint32
		_ = binary.Read(bytes.NewBuffer(value), b.GetByteOrder(hostByteOrder), &val)
		return strconv.FormatInt(int64(val), 10)

	case "u8":
		fallthrough
	case "<u8":
		var val uint64
		_ = binary.Read(bytes.NewBuffer(value), b.GetByteOrder(hostByteOrder), &val)
		return strconv.FormatInt(int64(val), 10)

	case "f4":
		fallthrough
	case "<f4":
		var val float32
		_ = binary.Read(bytes.NewBuffer(value), b.GetByteOrder(hostByteOrder), &val)
		return strconv.FormatFloat(float64(val), 'e', -1, 32)

	case "f8":
		fallthrough
	case "<f8":
		var val float64
		_ = binary.Read(bytes.NewBuffer(value), b.GetByteOrder(hostByteOrder), &val)
		return strconv.FormatFloat(val, 'e', -1, 64)
	}
	return bin.ReadNULLTerminatedString(value)
}
