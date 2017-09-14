package web

import (
	"net/http"

	"github.com/Palantir/palantir/config"
	"github.com/Palantir/palantir/model/simulation/setup/detector"
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
		PredefinedMaterials []material.PredefinedMaterialRecord `json:"predefinedMaterials"`
		Isotopes            []material.IsotopeRecord            `json:"isotopes"`
		ParticleTypes       []detector.PredefinedParticleRecord `json:"particles"`
		ScoringTypes        []detector.ScoringTypeRecord        `json:"scoringTypes"`
	}

	response.PredefinedMaterials = material.PredefinedMaterials()
	response.Isotopes = material.Isotopes()
	response.ParticleTypes = detector.ParticleTypes()
	response.ScoringTypes = detector.ScoringTypes()

	util.WriteJSONResponse(w, http.StatusOK, response)
}
