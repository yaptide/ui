// Package error contain custom error implemntation.
package error

import (
	"fmt"
)

// Rest is error format ready to pass to rest response.
type Rest struct {
	api map[string]string
	log string
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
		api: map[string]string{key: value},
		log: logMessage,
	}
}

func (e Rest) Error() string {
	if e.log != "" {
		return fmt.Sprint(e.api)
	}
	return e.log
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
