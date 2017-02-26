package config

import (
	"encoding/json"
	"flag"
	"io/ioutil"
	"log"
	"os"
	"path"
	"path/filepath"
	"strconv"
)

type reader interface {
	readInt(key string) (int64, bool)
	readString(key string) (string, bool)
}

type compositeReader struct {
	readers []reader
}

func (r *compositeReader) readInt(key string) (int64, bool) {
	for _, compositeReader := range r.readers {
		val, ok := compositeReader.readInt(key)
		if ok {
			return val, true
		}
	}
	return 0, false
}

func (r *compositeReader) readString(key string) (string, bool) {
	for _, compositeReader := range r.readers {
		val, ok := compositeReader.readString(key)
		if ok {
			return val, true
		}
	}
	return "", false
}

type fileReader struct {
	conf map[string]string
}

func createFileReader(filePath string) *fileReader {
	var configPath string
	if PRODEnv {
		dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
		if err != nil {
			log.Println(err.Error())
		}
		configPath = path.Join(dir, "..", filePath)
	} else if DEVEnv {
		configPath = filePath
	}

	file, openErr := os.Open(configPath)
	if openErr != nil {
		return &fileReader{map[string]string{}}
	}

	rawFile, readErr := ioutil.ReadAll(file)
	if readErr != nil {
		log.Print(readErr.Error())
		return &fileReader{map[string]string{}}
	}

	readConf := map[string]string{}
	parseErr := json.Unmarshal(rawFile, &readConf)
	if parseErr != nil {
		log.Println(parseErr.Error())
		return &fileReader{map[string]string{}}
	}
	return &fileReader{
		conf: readConf,
	}
}

func (r *fileReader) readInt(key string) (int64, bool) {
	result, err := strconv.ParseInt(r.conf[key], 10, 64)
	if err != nil {
		return 0, false
	}
	return result, true
}

func (r *fileReader) readString(key string) (string, bool) {
	result := r.conf[key]
	if result == "" {
		return "", false
	}
	return result, true
}

type cmdReader struct {
	ints    map[string]*int64
	strings map[string]*string
}

func createCmdReader(params map[string]configParam) *cmdReader {
	newReader := &cmdReader{
		map[string]*int64{},
		map[string]*string{},
	}
	for key, param := range params {
		if param.varType == "int64" {
			newReader.ints[key] = flag.Int64(key, 0, param.description)
		} else if param.varType == "string" {
			newReader.strings[key] = flag.String(key, "", param.description)
		}
	}
	flag.Parse()
	return newReader
}

func (r *cmdReader) readInt(key string) (int64, bool) {
	if r.ints[key] == nil || *(r.ints[key]) == 0 {
		return 0, false
	}
	return *r.ints[key], true
}

func (r *cmdReader) readString(key string) (string, bool) {
	if r.strings[key] == nil || *(r.strings[key]) == "" {
		return "", false
	}
	return *r.strings[key], true
}
