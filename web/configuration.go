package web

import (
	"net/http"

	"github.com/Palantir/palantir/config"
	"github.com/Palantir/palantir/model/simulation/setup/material"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
)

type getConfigurationHandler struct {
	*server.Context
	*config.Config
}

func (h *getConfigurationHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var response struct {
		PredefinedMaterials []string `json:"predefinedMaterials"`
		Isotopes            []string `json:"isotopes"`
	}

	response.PredefinedMaterials = material.PredefinedMaterials()
	response.Isotopes = material.Isotopes()

	util.WriteJSONResponse(w, http.StatusOK, response)
}
