package results

import (
	"strings"

	"github.com/Palantir/palantir/model/simulation/result"
	"github.com/Palantir/palantir/utils/log"
)

// ParseResults will parse results of shield simulation.
func ParseResults(input *ShieldParserInput) (*ShieldParserOutput, error) {
	log.Info("Start shield parser.")

	simulationResult := result.NewEmptyResult()

	for bdoFile, content := range input.bdo {
		if strings.Contains(bdoFile, ".bdo") {
			log.Info("Start parsing result file %s", bdoFile)
			parser := newBdoParser(bdoFile, []byte(content), input.serializeContext)
			parseErr := parser.Parse()
			if parseErr != nil {
				log.Info(parseErr.Error())
			}
			simulationResult.AddDetectorResults(parser.Results)
		}
	}

	log.Info("Finished shield parser")
	return &ShieldParserOutput{Results: simulationResult}, nil
}
