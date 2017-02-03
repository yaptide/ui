package auth

import (
	"net/http"
)

func mockLogin(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Here is a string"))
}
