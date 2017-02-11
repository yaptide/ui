package config

// SetupConfig read config from various sources
func SetupConfig() *Config {
	conf := getDefaultConfig()
	readJSON(conf)
	readEnv(conf)
	return conf
}

func getDefaultConfig() *Config {
	return &Config{
		Port:            3001,
		StaticDirectory: "./dist",
	}
}
