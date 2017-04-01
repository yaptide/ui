package request

import (
	"github.com/Palantir/palantir/db"
	"net/http"
)

// Context wraps object used in request handler.
type Context struct {
	R  *http.Request
	W  http.ResponseWriter
	Db db.Session
}
