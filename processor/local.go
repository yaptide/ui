package processor

import (
	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/converter/shield/results"
	"github.com/Palantir/palantir/converter/shield/setup/serialize"
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/runner/file"
	"github.com/Palantir/palantir/utils/log"
)

type localShieldRequest struct {
	*mainRequestComponent
	shieldInputFiles        shieldFiles
	shieldResultFiles       shieldFiles
	shieldSimulationContext shield.SimulationContext
	runner                  *file.Runner
}

func newLocalShieldRequest(mainRequestComponent *mainRequestComponent, runner *file.Runner) *localShieldRequest {
	return &localShieldRequest{
		mainRequestComponent: mainRequestComponent,
		runner:               runner,
	}
}

func (ls *localShieldRequest) ConvertModel() error {
	serializerRes, serializeErr := serialize.Serialize(ls.mainRequestComponent.setup)
	if serializeErr != nil {
		return serializeErr
	}
	ls.shieldSimulationContext = serializerRes.SimulationContext
	ls.shieldInputFiles = serializerRes.Files
	ls.shieldInputFiles[detectorsDatFile] = mockParserExample[detectorsDatFile]
	return nil
}

func (ls *localShieldRequest) StartSimulation() error {
	simulationInput := file.LocalSimulationInput{
		StatusUpdate: func(status project.VersionStatus) {
			_ = ls.session.Project().SetVersionStatus(ls.versionID, status)
		},

		Files:      ls.shieldInputFiles,
		CmdCreator: generateShieldPath,
		ResultCallback: func(results file.LocalSimulationResults) {
			ls.shieldResultFiles = results.Files
			ls.ParseResults()
		},
	}
	simulationErr := ls.runner.StartSimulation(simulationInput)
	if simulationErr != nil {
		log.Warning("[Processor][localfile][Simulation] failed to schedule job")
		return simulationErr
	}
	return nil
}

func (ls *localShieldRequest) ParseResults() {
	parserOutput, parserErr := results.ParseResults(ls.shieldResultFiles, ls.shieldSimulationContext)
	if parserErr != nil {
		log.Warning("[Processor][localfile][parser] error results parsing %v", parserErr)
		_ = ls.session.Project().SetVersionStatus(ls.versionID, project.Failure)
		return
	}
	updateErr := ls.session.Result().Update(ls.versionID, parserOutput)
	if updateErr != nil {
		log.Error("[Processor][localfile][parser] Unable to update results %v", updateErr)
		_ = ls.session.Project().SetVersionStatus(ls.versionID, project.Failure)
		return
	}
	_ = ls.session.Project().SetVersionStatus(ls.versionID, project.Failure)
	log.Debug("[Processor][localfile][parser] Parser results %v", parserOutput)
}
