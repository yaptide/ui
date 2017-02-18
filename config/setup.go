package config

// SetupConfig read and check config from various sources
// Return error, if config is not valid
func SetupConfig() (*Config, error) {
	cmdConf := parseCmd()
	conf := getDefaultConfig()

	readJSON(conf)
	readEnv(conf)
	readCmd(conf, cmdConf)

	return conf, checkConfig(*conf)
}

func getDefaultConfig() *Config {
	return &Config{
		Port:            3001,
		StaticDirectory: "./dist",
	}
}
