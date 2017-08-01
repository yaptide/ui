package results

import (
	"github.com/Palantir/palantir/utils/log"
	"strings"
)

// ParseResults will parse results of shield simulation.
func ParseResults(input *ShieldParserInput) (*ShieldParserOutput, error) {
	log.SetLoggerLevel(log.LevelDebug)
	log.Info("Start shield parser")

	for bdoFile, content := range input.bdo {
		if strings.Contains(bdoFile, ".bdo") {
			log.Info("Start parsing result file %s", bdoFile)
			parser := newBdoParser(bdoFile, []byte(content))
			parseErr := parser.Parse()
			if parseErr != nil {
				return nil, parseErr
			}
		}
	}

	log.Info("Finished shield parser")
	return &ShieldParserOutput{}, nil
}
