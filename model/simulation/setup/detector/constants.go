package detector

// PredefinedParticleRecord ...
type PredefinedParticleRecord struct {
	Value string `json:"value"`
	Name  string `json:"name"`
}

// ScoringTypeRecord ...
type ScoringTypeRecord struct {
	Value string `json:"value"`
	Name  string `json:"name"`
}

var predefinedParticles = []PredefinedParticleRecord{
	PredefinedParticleRecord{"all", "All particles"},
	PredefinedParticleRecord{"neutron", "Neutron"},
	PredefinedParticleRecord{"proton", "Proton"},
	PredefinedParticleRecord{"pion_pi_minus", "Pion π−"},
	PredefinedParticleRecord{"pion_pi_plus", "Pion π+"},
	PredefinedParticleRecord{"pion_pi_zero", "Pion π0"},
	PredefinedParticleRecord{"anti_neutron", "Anti-neutron"},
	PredefinedParticleRecord{"anti_proton", "Anti-proton"},
	PredefinedParticleRecord{"kaon_minus", "Kaon κ-"},
	PredefinedParticleRecord{"kaon_plus", "Kaon κ+"},
	PredefinedParticleRecord{"kaon_zero", "Kaon κ0"},
	PredefinedParticleRecord{"kaon_anti", "Kaon κ~"},
	PredefinedParticleRecord{"gamma", "Gamma ray"},
	PredefinedParticleRecord{"electron", "Electron"},
	PredefinedParticleRecord{"positron", "Positron"},
	PredefinedParticleRecord{"muon_minus", "Moun µ-"},
	PredefinedParticleRecord{"muon_plus", "Muon µ+"},
	PredefinedParticleRecord{"e_neutrino", "Neutrino e-"},
	PredefinedParticleRecord{"e_anti_neutrino", "Anti-Neutrino e-"},
	PredefinedParticleRecord{"mi_neutrino", "Neutrino µ−"},
	PredefinedParticleRecord{"mi_anti_neutrino", "Anti-Neutrino µ−"},
	PredefinedParticleRecord{"deuteron", "Deuteron"},
	PredefinedParticleRecord{"triton", "Triton"},
	PredefinedParticleRecord{"he_3", "He-3"},
	PredefinedParticleRecord{"he_4", "He-4"},
	PredefinedParticleRecord{"heavy_ion", "Heavy ion"},
}

var predefinedScoring = []ScoringTypeRecord{
	ScoringTypeRecord{"energy", "Energy"},
	ScoringTypeRecord{"fluence", "Fluence"},
	ScoringTypeRecord{"crossflu", "Cross"},
	ScoringTypeRecord{"dose", "Dose"},
	ScoringTypeRecord{"letflu", "Letflue"},
	ScoringTypeRecord{"dlet", "Dlet"},
	ScoringTypeRecord{"tlet", "Tlet"},
	ScoringTypeRecord{"avg_energy", "Avg energy"},
	ScoringTypeRecord{"avg_beta", "Avg beta"},
	ScoringTypeRecord{"ddd", "DDD"},
	ScoringTypeRecord{"spc", "SPC"},
	ScoringTypeRecord{"alanine", "Alanine"},
	ScoringTypeRecord{"counter", "Counter"},
}

// ParticleTypes ...
func ParticleTypes() []PredefinedParticleRecord {
	return predefinedParticles
}

// ScoringTypes ...
func ScoringTypes() []ScoringTypeRecord {
	return predefinedScoring
}
