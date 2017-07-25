package simulation

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"gopkg.in/mgo.v2/bson"

	"github.com/Palantir/palantir/db"
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/web/auth/token"
	"github.com/Palantir/palantir/web/server"
	"github.com/Palantir/palantir/web/util"
)

type runSimulationHandler struct {
	*server.Context
}

func runSimulation(readRequest, checkVersionStatus, pushSimulationJob func() bool) {
	ok := readRequest()
	if !ok {
		return
	}

	ok = checkVersionStatus()
	if !ok {
		return
	}

	_ = pushSimulationJob()
}

func (h *runSimulationHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var dbVersionID db.VersionID
	dbSession := h.Db.Copy()
	defer dbSession.Close()

	readRequest := func() bool {
		runRequest := struct {
			ProjectID string `json:"projectId"`
			VersionID string `json:"versionId"`
		}{}

		ok := util.DecodeJSONRequest(w, r, &runRequest)
		if !ok {
			return false
		}

		versionID, rqVersionIDError := strconv.Atoi(runRequest.VersionID)

		errorMap := map[string]string{}
		switch {
		case runRequest.ProjectID == "":
			errorMap["emptyProjectId"] = "ProjectId can not be empty"
		case !bson.IsObjectIdHex(runRequest.ProjectID):
			errorMap["badProjectId"] = "Bad ProjectId format"
		}

		switch {
		case runRequest.VersionID == "":
			errorMap["emptyVersionId"] = "VersionId can not be empty"
		case rqVersionIDError != nil:
			errorMap["badVersionId"] = "Bad VersionId format"
		}
		if len(errorMap) > 0 {
			_ = util.WriteJSONResponse(w, http.StatusBadRequest, errorMap)
			return false
		}

		dbVersionID = db.VersionID{
			Account: token.ExtractAccountID(r),
			Project: bson.ObjectIdHex(runRequest.ProjectID),
			Version: project.VersionID(versionID),
		}
		return true
	}

	checkVersionStatus := func() bool {
		currentVersionStatus, err := dbSession.Project().FetchVersionStatus(dbVersionID)
		if err != nil {
			util.HandleDbError(w, err)
			return false
		}

		errorMap := map[string]string{}
		if !currentVersionStatus.IsRunnable() {
			switch currentVersionStatus {
			case project.Running:
				errorMap["error"] = "The simulation is running already"
			default:
				errorMap["error"] =
					fmt.Sprint(
						"Can not run simulation due to bad version state: ",
						currentVersionStatus,
					)
			}
			_ = util.WriteJSONResponse(w, http.StatusBadRequest, errorMap)
			return false
		}
		return true
	}

	pushSimulationJob := func() bool {
		err := dbSession.Project().SetVersionStatus(dbVersionID, project.New)
		if err != nil {
			log.Print(err)
			w.WriteHeader(http.StatusInternalServerError)
			return false
		}

		simulationStartErr := h.SimulationProcessor.HandleSimulation(dbVersionID)
		if simulationStartErr != nil {
			errorResponseMap := map[string]string{"simulation": simulationStartErr.Error()}
			_ = util.WriteJSONResponse(w, http.StatusBadRequest, errorResponseMap)
			return false
		}

		responseMap := map[string]string{}
		responseMap["simulation"] = "simulation pending"
		_ = util.WriteJSONResponse(w, http.StatusOK, responseMap)
		return true
	}

	runSimulation(readRequest, checkVersionStatus, pushSimulationJob)
}
