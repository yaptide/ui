package config

import (
	"log"
)

// SetupConfig read and check config from various sources
// Close application, if any checkConfig err occurs
func SetupConfig() *Config {
	conf := getDefaultConfig()

	type readConfFunc func(*Config)
	readConfFuncs := []readConfFunc{
		readJSON,
		readEnv,
		readCmd,
	}

	for _, readConfFunc := range readConfFuncs {
		readConfFunc(conf)
	}

	err := checkConfig(conf)
	if err != nil {
		log.Fatal(err.Error())
	}

	return conf
}

func getDefaultConfig() *Config {
	return &Config{
		Port:            3001,
		StaticDirectory: "./dist",
	}
}
