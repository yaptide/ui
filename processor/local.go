package processor

import (
	"log"

	"github.com/Palantir/palantir/converter/shield/results"
	"github.com/Palantir/palantir/converter/shield/setup"
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/runner"
	"github.com/Palantir/palantir/runner/file"
)

type localShieldRequest struct {
	*mainRequestComponent
	*shieldFileInput
	*shieldFileOutput
	runner      *file.Runner
	runnerInput *file.LocalSimulationInput
}

func newLocalShieldRequest(mainRequestComponent *mainRequestComponent, runner *file.Runner) *localShieldRequest {
	return &localShieldRequest{
		mainRequestComponent: mainRequestComponent,
		shieldFileInput:      &shieldFileInput{},
		shieldFileOutput:     &shieldFileOutput{},
		runner:               runner,
	}
}

func (ls *localShieldRequest) SerializeModel() error {
	serializer := setup.NewShieldSerializer(ls.mainRequestComponent.setup)
	serializeErr := serializer.Serialize()
	_ = serializer.ResultFiles
	if serializeErr != nil {
		_ = ls.session.Project().SetVersionStatus(ls.versionID, project.Failure)
		return serializeErr
	}
	ls.shieldFileOutput.serializeContext = serializer.Context
	ls.shieldFileInput.files = mockParserExample
	return nil
}

func (ls *localShieldRequest) StartSimulation() error {
	simulationInput := &file.LocalSimulationInput{
		InputCommon:   runner.NewInputCommon(),
		Files:         ls.shieldFileInput.files,
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
			ls.shieldFileOutput.files = simResults.Files
			_ = ls.ParseResults()
		}
	}()
	return nil
}

func (ls *localShieldRequest) ParseResults() error {
	parserInput, constructErr := results.NewShieldParserInput(
		ls.shieldFileOutput.files,
		ls.shieldFileOutput.serializeContext,
	)
	if constructErr != nil {
		return constructErr
	}

	parserOutput, _ := results.ParseResults(parserInput)
	updateErr := ls.session.Result().Update(ls.versionID, parserOutput.Results)
	if updateErr != nil {
		return updateErr
	}
	log.Println(parserOutput)
	return nil
}
