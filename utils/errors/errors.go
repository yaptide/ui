// Package errors contain custom error types to  distinguish
// reason of error passed beetween function calls.
package errors

import (
	"encoding/json"
	"fmt"
)

// Rest is error format ready to pass to rest response.
type Rest struct {
	API map[string]string `json:"api"`
	Log string            `json:"log,omitempty"`
}

// App is error internal for application and will be signaled as internal server error.
type App struct {
	log string
}

// NewRest constructor.
func NewRest(key string, value string, optionalMessage string, formatedValues ...interface{}) Rest {
	var logMessage string
	if optionalMessage != "" {
		logMessage = fmt.Sprintf(optionalMessage, formatedValues...)
	}
	return Rest{
		API: map[string]string{key: value},
		Log: logMessage,
	}
}

func (e Rest) Error() string {
	marshalled, err := json.Marshal(e)
	if err == nil {
		panic(err)
	}
	return string(marshalled)
}

// NewApp constructor.
func NewApp(message string, formatedValues ...interface{}) App {
	return App{
		log: fmt.Sprintf(message, formatedValues...),
	}
}

func (e App) Error() string {
	return e.log
}
