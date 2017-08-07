package results

import (
	"github.com/Palantir/palantir/model/simulation/result"
	"github.com/Palantir/palantir/utils/log"
	"strings"
)

// ParseResults will parse results of shield simulation.
func ParseResults(input *ShieldParserInput) (*ShieldParserOutput, error) {
	log.SetLoggerLevel(log.LevelDebug)
	log.Info("Start shield parser.")

	simulationResult := result.NewEmptyResult()

	for bdoFile, content := range input.bdo {
		if strings.Contains(bdoFile, ".bdo") {
			log.Info("Start parsing result file %s", bdoFile)
			parser := newBdoParser(bdoFile, []byte(content), input.serializeContext)
			parseErr := parser.Parse()
			if parseErr != nil {
				return nil, parseErr
			}
			simulationResult.AddDetectorResults(parser.Results)
		}
	}

	log.Info("Finished shield parser")
	return &ShieldParserOutput{Results: simulationResult}, nil
}
