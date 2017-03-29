package shield

import "github.com/Palantir/palantir/model/simulation/setup"

// Parser parse shield.Config to setup.Setup.
type Parser struct {
	conf *Config
}

// Parse shield.Config to setup.Setup.
// Return error, if any parser error occurs.
func (p *Parser) Parse(c *Config) (*setup.Setup, error) {
	p.conf = c
	setup := &setup.Setup{}

	err := p.parseMat(setup)
	if err != nil {
		return nil, err
	}

	err = p.parseBeam(setup)
	if err != nil {
		return nil, err
	}

	err = p.parseGeo(setup)
	if err != nil {
		return nil, err
	}

	err = p.parseDetect(setup)
	if err != nil {
		return nil, err
	}

	return setup, nil
}

func (p *Parser) parseMat(setup *setup.Setup) error {
	return nil
}

func (p *Parser) parseBeam(setup *setup.Setup) error {
	return nil
}

func (p *Parser) parseGeo(setup *setup.Setup) error {
	return nil
}

func (p *Parser) parseDetect(setup *setup.Setup) error {
	return nil
}
