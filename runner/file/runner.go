// Package file implements mechanism of starting and supervising simulations. Simulations are started by running binary configured using config files.
package file

import (
	"fmt"
	"github.com/Palantir/palantir/config"
	"github.com/Palantir/palantir/runner"
	"log"
)

const (
	maxNumberOfPendingJobs = 1000 // TODO: remove pending jobs limit
)

// Runner starts and supervises running of shield simulations.
type Runner struct {
	jobsChannel        chan *LocalSimulationInput
	workerReleased     chan bool
	maxNumberOfWorkers int64
	workers            map[*worker]bool
}

// LocalSimulationInput localSimulationInput.
type LocalSimulationInput struct {
	*runner.InputCommon
	Files         map[string]string
	CmdCreator    func(workDir string) []string
	ResultChannel chan *LocalSimulationResults
}

// LocalSimulationResults localSimulationResults.
type LocalSimulationResults struct {
	*runner.ResultsCommon
	Files map[string]string
}

// SetupRunner is RunnerSupervisor constructor.
func SetupRunner(config *config.Config) *Runner {
	runner := &Runner{
		jobsChannel:        make(chan *LocalSimulationInput, maxNumberOfPendingJobs),
		workerReleased:     make(chan bool, maxNumberOfPendingJobs),
		maxNumberOfWorkers: 2,
		workers:            make(map[*worker]bool),
	}

	for i := int64(0); i < runner.maxNumberOfWorkers; i++ {
		runner.workerReleased <- true
	}

	go runner.listenForNewJobs(config)
	return runner
}

// StartSimulation starts local simulation using shield library.
func (r *Runner) StartSimulation(simultion *LocalSimulationInput) error {
	// TODO: potentialy blocking
	if len(r.jobsChannel) < maxNumberOfPendingJobs {
		log.Println("[Runner.Local.SHIELD] Add pending simulation")
		r.jobsChannel <- simultion //pending}
		return nil
	}
	return fmt.Errorf("too much jobs pending")
}

func (r *Runner) listenForNewJobs(config *config.Config) {
	for {
		<-r.workerReleased
		job := <-r.jobsChannel
		newWorker, createErr := createWorker(config, job)
		if createErr != nil {
			continue
		}
		log.Println("[Runner.Local.SHIELD] Start simulation")
		go newWorker.startWorker(r.workerReleased)
	}
}
