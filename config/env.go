package config

import (
	"log"
	"net"
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
	if port < 1000 || port > 65535 {
		log.Print("Invalid port number")
		return
	}

	ln, connectErr := net.Listen("tcp", ":"+strconv.FormatInt(port, 10))
	if connectErr != nil {
		log.Print(connectErr.Error())
		return
	}
	closeErr := ln.Close()
	if closeErr != nil {
		log.Print(closeErr)
	}

	// TODO move port verifier to separate function

	conf.Port = port
}

func readStaticDirRoute(conf *Config) {
	path := os.Getenv("PALANTIR_STATIC_ROUTE")
	if path == "" {
		return
	}

	fileInfo, statErr := os.Stat(path)
	if statErr != nil {
		log.Print(statErr.Error())
		return
	}
	if !fileInfo.IsDir() {
		log.Printf("%v: This path is not a directory\n", path)
		return
	}

	// TODO more checks(if contain index.html)
	// TODO move path verifier to separate function

	conf.StaticDirectory = path
}
