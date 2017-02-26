package config

import (
	"os"
)

func readEnv() {
	isProd := os.Getenv("PROD") != ""
	isDev := os.Getenv("DEV") != ""
	env := os.Getenv("PALANTIR_ENV")
	if isProd || env == "PROD" {
		PRODEnv = true
	} else if isDev || env == "DEV" {
		DEVEnv = true
	} else {
		PRODEnv = true
	}
}
