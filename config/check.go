package config

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
)

func checkConfig(conf Config) error {
	if err := checkPort(conf); err != nil {
		return err
	}
	if err := checkStaticDirectory(conf); err != nil {
		return err
	}
	return nil
}

func checkPort(conf Config) error {
	port := conf.Port
	if port < 1000 || port > 65535 {
		return errors.New("Invalid port number")
	}
	return nil
}

func checkStaticDirectory(conf Config) error {
	dist := conf.StaticDirectory
	fileInfo, statErr := os.Stat(dist)
	if statErr != nil {
		return statErr
	}
	if !fileInfo.IsDir() {
		return fmt.Errorf("%s is not directory", dist)
	}

	indexPath := filepath.Join(dist, "index.html")
	if _, statErr = os.Stat(indexPath); statErr != nil {
		return statErr
	}

	return nil
}
