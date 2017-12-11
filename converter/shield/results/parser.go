package results

import (
	"strings"

	"github.com/Palantir/palantir/converter/shield"
	"github.com/Palantir/palantir/model/simulation/result"
	"github.com/Palantir/palantir/utils/log"
)

// ParseResults will parse results of shield simulation.
func ParseResults(files map[string]string, simulationContext shield.SimulationContext) (result.Result, error) {
	log.Info("[Parser][Results] Start shield parser.")

	simulationResult := result.NewEmptyResult()

	for bdoFile, content := range files {
		if strings.Contains(bdoFile, ".bdo") {
			log.Debug("[Parser][Results] Start parsing result file %s", bdoFile)
			parser := newBdoParser(bdoFile[:len(bdoFile)-4], []byte(content), simulationContext)
			parseErr := parser.Parse()
			if parseErr != nil {
				log.Warning("[Parser][Results] file parsing error %s", parseErr.Error())
			}
			simulationResult.AddDetectorResults(parser.Results)
		}
	}

	log.Info("[Parser][Results] Finished shield parser")
	return simulationResult, nil
}
