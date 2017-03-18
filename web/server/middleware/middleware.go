// Package middleware provide interface for Middleware functions.
package middleware

import "net/http"

// Middleware is wrapper function to http.Handler
type Middleware func(http.Handler) http.Handler
