package config

import (
	"flag"
)

func readCmd(conf *Config) {
	cmdConf := parseCmd()
	if cmdConf.Port != 0 {
		conf.Port = cmdConf.Port
	}

	if cmdConf.StaticDirectory != "" {
		conf.StaticDirectory = cmdConf.StaticDirectory
	}
}

func parseCmd() Config {
	port := flag.Int64("port", 0, "port number")
	dist := flag.String("dist", "", "static directory path")

	flag.Parse()

	return Config{Port: *port, StaticDirectory: *dist}
}
