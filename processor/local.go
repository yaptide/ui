package processor

import (
	//"github.com/Palantir/palantir/converter/serializer"
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
	/*	serialized, serializeErr := serializer.ProcessShieldInput(ls.mainRequestComponent.setup)
			return serializeErr
		}
		ls.shieldFileInput.files = serialized
		return nil
	*/
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
		ls.shieldFileOutput.files = results.Files
	}()
	return nil
}

func (ls *localShieldRequest) ParseResults() error {
	return nil
}
