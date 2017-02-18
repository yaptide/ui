package config

import (
	"log"
	"os"
	"strconv"
)

func readEnv(conf *Config) {
	readPortEnv(conf)
	readStaticDirRoute(conf)
}

func readPortEnv(conf *Config) {
	portString := os.Getenv("PORT")
	if portString == "" {
		return
	}

	port, parseErr := strconv.ParseInt(portString, 10, 64)
	if parseErr != nil {
		log.Print(parseErr.Error())
		return
	}

	conf.Port = port
}

func readStaticDirRoute(conf *Config) {
	path := os.Getenv("PALANTIR_STATIC_ROUTE")
	if path != "" {
		conf.StaticDirectory = path
	}
}
