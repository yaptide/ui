package config

import (
	"errors"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strconv"
)

type checkFunc func(conf *Config) error

func checkConfig(conf *Config) error {
	checkFuncs := []checkFunc{
		checkPort,
		checkStaticDirectory,
	}

	for _, checkFunc := range checkFuncs {
		if err := checkFunc(conf); err != nil {
			return err
		}
	}

	return nil
}

func checkPort(conf *Config) error {
	port := conf.Port
	if port < 1000 || port > 65535 {
		return errors.New("Invalid port number")
	}

	ln, connectErr := net.Listen("tcp", ":"+strconv.FormatInt(port, 10))
	if connectErr != nil {
		return connectErr
	}
	closeErr := ln.Close()
	return closeErr
}

func checkStaticDirectory(conf *Config) error {
	dist := conf.StaticDirectory
	fileInfo, statErr := os.Stat(dist)
	if statErr != nil {
		return statErr
	}
	if !fileInfo.IsDir() {
		return fmt.Errorf("%s is not directory", dist)
	}

	indexPath := filepath.Join(dist, "index.html")
	_, statErr = os.Stat(indexPath)
	return statErr
}
