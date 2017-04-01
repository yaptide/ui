// Package token provide support for generating and validating JWT tokens.
package token

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/Palantir/palantir/web/server/middleware"
	"github.com/dgrijalva/jwt-go"
	"github.com/dgrijalva/jwt-go/request"
	"gopkg.in/mgo.v2/bson"
)

// Generate generate JWT token for account, signed by key.
// Used claims: "id" -> account.ID (bson.ObjectId),
// "exp" -> exp time (int64).
func Generate(id bson.ObjectId, key []byte) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)

	claims["id"] = id
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

	tokenString, err := token.SignedString(key)
	return tokenString, err
}

// ContextKeyType is type of keys used in context.Context map
// TODO move somewhere else
type ContextKeyType int

// ContextIDKey is key for "id" in context.Context map
const ContextIDKey ContextKeyType = 0

// NewValidationMiddleware create middleware which validate access to next http.Handler.
// Returned middleware call next.Serve.Http(w, r), if token from response is correct.
// Otherwise WriteHeader http.StatusUnauthorized and write proper message to w.
// Token is taken from HTTP header: "X-Auth-Token".
// Token claims are passed by context.Context.
func NewValidationMiddleware(key []byte) middleware.Middleware {
	return func(next http.Handler) http.Handler {
		handlerFunc := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			var keyFunc jwt.Keyfunc = func(*jwt.Token) (interface{}, error) {
				return key, nil
			}

			token, err := request.ParseFromRequest(r, request.HeaderExtractor{"X-Auth-Token"}, keyFunc)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				_, err = fmt.Fprint(w, "Unauthorised access to this resource")
				if err != nil {
				}
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if token.Valid && ok {
				idKey := ContextIDKey
				idVal := claims["id"]

				ctx := context.WithValue(r.Context(), idKey, idVal)
				next.ServeHTTP(w, r.WithContext(ctx))
			} else {
				w.WriteHeader(http.StatusUnauthorized)
				_, err = fmt.Fprint(w, "Token is not valid")
				if err != nil {
				}
				return
			}
		})
		return handlerFunc
	}
}
