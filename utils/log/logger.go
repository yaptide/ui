// Package log contains custom logger wrapper.
package log

import (
	"fmt"
	go_log "log"
)

// LoggerLevel logger level.
type LoggerLevel int

const (
	// LevelDebug logger level.
	LevelDebug LoggerLevel = iota
	// LevelInfo logger level.
	LevelInfo
	// LevelWarning logger level.
	LevelWarning
	// LevelError logger level.
	LevelError
)

var currentLoggerLevel = LevelWarning

// Debug logs debug message
func Debug(message string, values ...interface{}) string {
	if currentLoggerLevel <= LevelDebug {
		return log("Debug", message, values...)
	}
	return fmt.Sprintf(message, values...)
}

// Info logs info message
func Info(message string, values ...interface{}) string {
	if currentLoggerLevel <= LevelInfo {
		return log("Info", message, values...)
	}
	return fmt.Sprintf(message, values...)
}

// Warning logs info message
func Warning(message string, values ...interface{}) string {
	if currentLoggerLevel <= LevelWarning {
		log("Warning", message, values...)
	}
	return fmt.Sprintf(message, values...)
}

// Error logs info message
func Error(message string, values ...interface{}) string {
	if currentLoggerLevel <= LevelError {
		log("Error", message, values...)
	}
	return fmt.Sprintf(message, values...)
}

// SetLoggerLevel sets logger level.
func SetLoggerLevel(level LoggerLevel) {
	go_log.SetFlags(go_log.Lshortfile | go_log.Ldate | go_log.Ltime | go_log.LUTC)
	currentLoggerLevel = level
}

func log(prefix string, message string, values ...interface{}) string {
	msg := fmt.Sprintf(message, values...)
	prefixedMsg := fmt.Sprintf("[%s] %s", prefix, msg)
	_ = go_log.Output(3, prefixedMsg)
	return msg
}
