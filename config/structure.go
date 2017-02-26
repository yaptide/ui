package config

// Config contains basic server configuration
type Config struct {
	Port            int64
	DbHost          string
	DbPort          int64
	DbName          string
	DbUsername      string
	DbPassword      string
	StaticDirectory string
}

type configParam struct {
	varType     string
	assignTo    interface{}
	description string
}

func (p *configParam) readConfigParam(key string, reader reader) {
	if p.varType == "int64" {
		value, ok := reader.readInt(key)
		if ok {
			*p.assignTo.(*int64) = value
		}
	} else if p.varType == "string" {
		value, ok := reader.readString(key)
		if ok {
			*p.assignTo.(*string) = value
		}
	}
}
