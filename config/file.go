package config

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
)

func readJSON(conf *Config) {
	file, openErr := os.Open("./conf.json")
	if openErr != nil {
		log.Print(openErr.Error())
		return
	}

	rawFile, readErr := ioutil.ReadAll(file)
	if readErr != nil {
		log.Print(readErr.Error())
		return
	}

	readConf := &Config{}
	parseErr := json.Unmarshal(rawFile, readConf)
	if parseErr != nil {
		log.Print(parseErr.Error())
		return
	}

	if readConf.Port != 0 {
		conf.Port = readConf.Port
	}

	if readConf.StaticDirectory != "" {
		conf.StaticDirectory = readConf.StaticDirectory
	}
}
