package config

import (
	"github.com/Palantir/palantir/utils/log"
	"os"
	"path"
	"path/filepath"
)

// PRODEnv - current environment
var PRODEnv = false

// DEVEnv - current environment
var DEVEnv = false

// SetupConfig read and check config from various sources
// Close application, if any checkConfig err occurs
func SetupConfig() *Config {
	readEnv()
	conf := getDefaultConfig()

	log.SetLoggerLevel(log.LevelWarning)

	paramsMapping := map[string]configParam{
		"port":       configParam{"int64", &conf.Port, "Port on which application is served"},
		"dbHost":     configParam{"string", &conf.DbHost, "Database ip"},
		"dbPort":     configParam{"int64", &conf.DbPort, "Database port"},
		"dbName":     configParam{"string", &conf.DbName, "Database name"},
		"dbUsername": configParam{"string", &conf.DbUsername, "Database username"},
		"dbPassword": configParam{"string", &conf.DbPassword, "Database password"},
	}

	reader := &compositeReader{
		readers: []reader{
			createCmdReader(paramsMapping),
			createFileReader("conf.json"),
		},
	}

	for key, param := range paramsMapping {
		param.readConfigParam(key, reader)
	}

	err := checkConfig(conf)
	if err != nil {
		log.Error(err.Error())
		os.Exit(-1)
	}

	return conf
}

func getDefaultConfig() *Config {
	var static string
	if PRODEnv {
		dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
		if err != nil {
			log.Error("Unable to find configuration file %s", err.Error())
		}
		static = path.Join(dir, "../static")
	} else if DEVEnv {
		static = "./static"
	}

	return &Config{
		Port:            3001,
		DbHost:          "localhost",
		DbPort:          27018,
		StaticDirectory: static,
	}
}
