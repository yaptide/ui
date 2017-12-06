package processor

import (
	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/converter/shield/results"
	"github.com/Palantir/palantir/converter/shield/setup/serialize"
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/runner"
	"github.com/Palantir/palantir/runner/file"
	"github.com/Palantir/palantir/utils/log"
)

type localShieldRequest struct {
	*mainRequestComponent
	shieldInputFiles        shieldFiles
	shieldResultFiles       shieldFiles
	shieldSimulationContext *shield.SimulationContext
	runner                  *file.Runner
	runnerInput             *file.LocalSimulationInput
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
	ls.shieldInputFiles = mockParserExample
	return nil
}

func (ls *localShieldRequest) StartSimulation() error {
	simulationInput := &file.LocalSimulationInput{
		InputCommon:   runner.NewInputCommon(),
		Files:         ls.shieldInputFiles,
		CmdCreator:    generateShieldPath,
		ResultChannel: make(chan *file.LocalSimulationResults),
	}
	go handleStatusUpdateChannel(ls.session, ls.versionID, simulationInput.StatusUpdateChannel)
	ls.runnerInput = simulationInput
	simulationErr := ls.runner.StartSimulation(simulationInput)
	if simulationErr != nil {
		return simulationErr
	}

	go func() {
		simResults := <-simulationInput.ResultChannel
		if len(simResults.Errors) == 0 {
			_ = ls.session.Project().SetVersionStatus(ls.versionID, project.Success)
		} else {
			_ = ls.session.Project().SetVersionStatus(ls.versionID, project.Failure)
		}
		if simResults != nil {
			log.Debug("[Result parser] output %v", simResults.LogStdOut)
			ls.shieldResultFiles = simResults.Files
			_ = ls.ParseResults()
		}
	}()
	return nil
}

func (ls *localShieldRequest) ParseResults() error {
	parserInput, constructErr := results.NewShieldParserInput(
		ls.shieldResultFiles,
		ls.shieldSimulationContext,
	)
	if constructErr != nil {
		return constructErr
	}

	parserOutput, _ := results.ParseResults(parserInput)
	updateErr := ls.session.Result().Update(ls.versionID, parserOutput.Results)
	if updateErr != nil {
		return updateErr
	}
	log.Debug("[Result parser] output %v", parserOutput.Results)
	return nil
}
