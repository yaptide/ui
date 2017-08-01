package processor

import (
	//"github.com/Palantir/palantir/converter/serializer"
	"github.com/Palantir/palantir/converter/shield/results"
	"github.com/Palantir/palantir/converter/shield/setup"
	"github.com/Palantir/palantir/runner"
	"github.com/Palantir/palantir/runner/file"
	"log"
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
	if serializeErr != nil {
		return serializeErr
	}
	_ = serializer.Files
	ls.shieldFileOutput.serializeContext = serializer.SerializeContext
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
	ls.runnerInput = simulationInput
	simulationErr := ls.runner.StartSimulation(simulationInput)
	if simulationErr != nil {
		return simulationErr
	}

	go func() {
		results := <-simulationInput.ResultChannel
		log.Println("logerr", len(results.LogStdErr))
		log.Println("logstd", len(results.LogStdOut))
		for name, file := range results.Files {
			log.Println(name, len(file))
		}
		log.Println("errors", results.Errors)

		if results != nil {
			ls.shieldFileOutput.files = results.Files
			_ = ls.ParseResults()
		}
	}()
	return nil
}

func (ls *localShieldRequest) ParseResults() error {
	parserInput, constructErr := results.NewShieldParserInput(ls.shieldFileOutput.files, ls.shieldFileOutput.serializeContext)
	if constructErr != nil {
		return constructErr
	}

	parserOutput, parseErr := results.ParseResults(parserInput)
	if parseErr != nil {
		return parseErr
	}
	log.Println(parserOutput)
	return nil
}
