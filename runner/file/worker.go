package file

import (
	"bytes"
	"fmt"
	"github.com/Palantir/palantir/config"
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/runner"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path"
	"strconv"
	"time"
)

const (
	maxJobDuration = 1000 * time.Second
)

type worker struct {
	cmd                 *exec.Cmd
	cmdString           []string
	dirInPath           string
	dirOutPath          string
	workerFinishChannel chan bool
	job                 *LocalSimulationInput
	results             *LocalSimulationResults
	outbuf              bytes.Buffer
	errbuf              bytes.Buffer
}

func createWorker(config *config.Config, job *LocalSimulationInput) (*worker, error) {
	w := &worker{
		job:                 job,
		workerFinishChannel: make(chan bool),
		results: &LocalSimulationResults{
			ResultsCommon: runner.NewResultsCommon(),
			Files:         make(map[string]string),
		},
	}
	job.StatusUpdateChannel <- project.Running
	setupDirectoryErr := w.setupDirectory()
	if setupDirectoryErr != nil {
		job.StatusUpdateChannel <- project.Failure
		return nil, setupDirectoryErr
	}

	setupExecutionErr := w.setupExecution()
	if setupExecutionErr != nil {
		job.StatusUpdateChannel <- project.Failure
		return nil, setupExecutionErr
	}

	return w, nil
}

func (w *worker) setupDirectory() error {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	w.dirInPath = path.Join(
		"/",
		"tmp",
		"palantir_tmp_simulation_files",
		fmt.Sprintf("sim_workdir_%s_in", timestamp),
	)
	w.dirOutPath = path.Join(
		"/",
		"tmp",
		"palantir_tmp_simulation_files",
		fmt.Sprintf("sim_workdir_%s_out", timestamp),
	)

	mkdirInErr := os.MkdirAll(w.dirInPath, os.ModePerm)
	if mkdirInErr != nil {
		log.Printf("[Runner.Local.SHIELD] Error: Unable to create workdir. Reason: %s", mkdirInErr.Error())
		return mkdirInErr
	}

	mkdirOutErr := os.MkdirAll(w.dirOutPath, os.ModePerm)
	if mkdirOutErr != nil {
		log.Printf("[Runner.Local.SHIELD] Error: Unable to create workdir. Reason: %s", mkdirOutErr.Error())
		return mkdirOutErr
	}

	for fileName, fileContent := range w.job.Files {
		content := []byte(fileContent)
		writeErr := ioutil.WriteFile(path.Join(w.dirInPath, fileName), content, os.ModePerm)
		if writeErr != nil {
			log.Printf("[Runner.Local.SHIELD] Error: Problem during file write. Reason: %s", writeErr.Error())
			return writeErr
		}
	}
	return nil
}

func (w *worker) setupExecution() error {
	w.cmdString = w.job.CmdCreator(w.dirInPath)
	binaryName := w.cmdString[0]
	binaryArgs := w.cmdString[1:]

	log.Println(binaryName)
	binaryPath, lookupErr := exec.LookPath(binaryName)
	if lookupErr != nil {
		log.Printf("[Runner.Local] Error: Unable to find %s on PATH. Reason: %s", binaryName, lookupErr.Error())
		return lookupErr
	}

	w.cmd = exec.Command(binaryPath, binaryArgs...)
	w.cmd.Dir = w.dirOutPath
	w.cmd.Stdout = &w.outbuf
	w.cmd.Stderr = &w.errbuf

	return nil
}

func (w *worker) startWorker(release chan bool) {
	timer := time.AfterFunc(maxJobDuration, func() {
		killErr := w.cmd.Process.Kill()
		if killErr != nil {
			log.Printf("[Runner.Local.SHIELD] Warning: Unable to kill process. Reason: %s", killErr.Error())
		}
		w.workerFinishChannel <- true
	})
	defer func() {
		release <- true
		timer.Stop()
		if w.cmd.ProcessState == nil || !w.cmd.ProcessState.Exited() {
			killErr := w.cmd.Process.Kill()
			if killErr != nil {
				log.Printf("[Runner.Local.SHIELD] Warning: Unable to kill process. Reason: %s", killErr.Error())
			}
		}
		w.job.ResultChannel <- w.results
		log.Println("Defer finished")
	}()

	startErr := w.cmd.Start()
	if startErr != nil {
		log.Printf("[Runner.Local.SHIELD] Error: Unable to start worker. Reason: %s", startErr.Error())
		return
	}
	go func() {
		err := w.cmd.Wait()
		if err != nil {
			log.Printf("[Runner.Local.SHIELD] Warning: Problem during final wait. Reason: %s", err.Error())
		}
		log.Println("Process finished")
		w.workerFinishChannel <- true
	}()

	<-w.workerFinishChannel
	w.postSimulationSteps()
}

func (w *worker) postSimulationSteps() {
	log.Println("Post simulation steps")
	files, listDirErr := ioutil.ReadDir(w.dirOutPath)
	if listDirErr != nil {
		log.Printf("[Runner.Local.SHIELD] Warning: Can't access directory with solutions. Reason: %s", listDirErr.Error())
		return
	}

	for _, fileInfo := range files {
		content, readFileErr := ioutil.ReadFile(path.Join(w.dirOutPath, fileInfo.Name()))
		if readFileErr != nil {
			log.Printf("[Runner.Local.SHIELD] Warning: Can't open %s in simulation directory. Reason: %s", fileInfo.Name(), readFileErr.Error())
			w.results.Errors["readResults"] = readFileErr.Error()
			return
		}
		w.results.Files[fileInfo.Name()] = string(content)
	}
	w.results.LogStdOut = w.outbuf.String()
	log.Printf("LogStdOut %v", w.results.LogStdOut)
	w.results.LogStdErr = w.errbuf.String()
}
