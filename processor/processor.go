// Package processor implements processing all simulation requests. Is responsible for serialization, starting simulation and processing results.
package processor

import (
	"fmt"

	"github.com/Palantir/palantir/config"
	"github.com/Palantir/palantir/db"
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/runner/file"
	"github.com/Palantir/palantir/utils/log"
)

// SimulationProcessor responsible for all steps of processing simulation.
type SimulationProcessor struct {
	session    db.Session
	fileRunner *file.Runner
}

// NewProcessor constructor.
func NewProcessor(config *config.Config, session db.Session) *SimulationProcessor {
	processor := &SimulationProcessor{
		session:    session,
		fileRunner: file.SetupRunner(config),
	}
	return processor
}

// HandleSimulation processes simulation.
func (p *SimulationProcessor) HandleSimulation(versionID db.VersionID) error {
	dbSession := p.session.Copy()
	defer dbSession.Close()
	version, dbErr := dbSession.Project().FetchVersion(versionID)
	if dbErr != nil {
		log.Warning("[SimulationProcessor] Unable to fetch version. Reason: %s", dbErr.Error())
		return dbErr
	}

	setup, dbErr := dbSession.Setup().Fetch(versionID)
	if dbErr != nil {
		return dbErr
	}

	mainRequestComponent := &mainRequestComponent{
		version:   version,
		versionID: versionID,
		session:   p.session,
		setup:     setup,
	}

	log.Debug("[SimulationProcessor] Start simulation request")
	var request request
	var simErr error
	switch version.Settings.ComputingLibrary {
	case project.ShieldLibrary:
		switch version.Settings.SimulationEngine {
		case project.LocalMachine:
			request = newLocalShieldRequest(mainRequestComponent, p.fileRunner)
		default:
			simErr = fmt.Errorf("Invalid engine simulation")
		}
	case project.FlukaLibrary:
	default:
		simErr = fmt.Errorf("[SimulationProcessor] Invalid computing library")
	}
	if simErr != nil {
		return simErr
	}

	log.Info("[SimulationProcessor] Start simulation request (serialization)")
	serializeErr := request.ConvertModel()
	if serializeErr != nil {
		return serializeErr
	}

	log.Info("[SimulationProcessor] Start simulation request (enqueue in runner)")
	startSimulationErr := request.StartSimulation()
	if startSimulationErr != nil {
		return startSimulationErr
	}

	updateStatusErr := dbSession.Project().SetVersionStatus(versionID, project.Pending)
	if updateStatusErr != nil {
		log.Debug("[SimulationProcessor] Error while setting job to pending %v", updateStatusErr.Error())
		return updateStatusErr
	}
	return nil
}
