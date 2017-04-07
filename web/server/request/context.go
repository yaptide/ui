package request

import (
	"net/http"

	"github.com/Palantir/palantir/db"
)

// Context wraps object used in request handler.
type Context struct {
	R  *http.Request
	W  http.ResponseWriter
	Db db.Session
}
