export const COMMON_MATERIAL_ICRUS = [104, 276, 223, 179, 222, 6, 13, 14, 82, 245, 170, 1000];
export const DEFAULT_MATERIAL_ICRU = 276;
export const DEFAULT_MATERIAL_NAME = 'WATER, LIQUID';
export const DEFAULT_SANITIZED_MATERIAL_NAME = 'water_liquid';
export const DEFAULT_MATERIAL_DENSITY = 1.0;

// made with this Python script:
/*
# call this script from main repository with SH12A source code
import json
from periodictable import elements  # pip install periodictable
import re

densities = []
additional_materials = [
	{ 'icru': 1000, 'name': 'VACUUM', 'sanitized_name': 'vacuum', 'density': 0, geant_name: 'unknown' },
	{ 'icru': 0, 'name': 'BLACK HOLE', 'sanitized_name': 'black_hole', 'density': 0 }
]
with open('./src/shieldhit/microdhi/icru.f', 'r') as icru_file:
	for line in icru_file.readlines()[494:565]:
		if line.rstrip().endswith(','):
			numbers = [float(entry.rstrip(',')) for entry in line.split()[1:5]]
			densities.extend(numbers)
		if len(line.split()) > 4 and line.split()[4] == '/':
			numbers = [float(entry.rstrip(',')) for entry in line.split()[1:4]]
			densities.extend(numbers)

for material in additional_materials:
	print(f"	{{ icru: {material['icru']}, name: '{material['name']}', sanitized_name: '{material['sanitized_name']}', density: {material['density']} }},")
 
for i, elem in enumerate(elements):
	if i > 0 and i < 99:
		icru = i
		name = elem.name.upper()
		density = densities[i-1]
		sanitized_name = elem
		line = f"	{{ icru: {icru}, name: '{name}', sanitized_name: '{sanitized_name}', density: {density} }},"
		print(line)

with open('./doc/tex/UsersGuide/07_reftab.tex', 'r') as infile:
	for line in infile.readlines()[335:526]:
		if line.strip():
			data = line.strip().split('&')
			icru = data[0].rstrip()
			name = data[2].rstrip('\\')
			sanitized_name = name.lower().replace(' ', '_')
			sanitized_name = re.sub(r'\(|\)|\,', '', sanitized_name)
			sanitized_name = re.sub(r'\\|\/', 'by', sanitized_name)
			density = str(densities[int(icru)-1])
			line = f"	{{ icru: {icru}, name: '{name}', sanitized_name: '{sanitized_name}', density: {density} }},"
			print(line)
*/

export const MATERIALS = [
	{ icru: 1000, name: 'VACUUM', sanitized_name: 'vacuum', density: 0, geant_name: 'G4_Galactic' },
	{
		icru: 0,
		name: 'BLACK HOLE',
		sanitized_name: 'black_hole',
		density: 0,
		geant_name: 'G4_Galactic'
	},
	{ icru: 1, name: 'HYDROGEN', sanitized_name: 'H', density: 8.3748e-5, geant_name: 'G4_H' },
	{ icru: 2, name: 'HELIUM', sanitized_name: 'He', density: 0.000166322, geant_name: 'G4_He' },
	{ icru: 3, name: 'LITHIUM', sanitized_name: 'Li', density: 0.534, geant_name: 'G4_Li' },
	{ icru: 4, name: 'BERYLLIUM', sanitized_name: 'Be', density: 1.848, geant_name: 'G4_Be' },
	{ icru: 5, name: 'BORON', sanitized_name: 'B', density: 2.37, geant_name: 'G4_B' },
	{ icru: 6, name: 'CARBON', sanitized_name: 'C', density: 2.0, geant_name: 'G4_C' },
	{ icru: 7, name: 'NITROGEN', sanitized_name: 'N', density: 0.00116528, geant_name: 'G4_N' },
	{ icru: 8, name: 'OXYGEN', sanitized_name: 'O', density: 0.00133151, geant_name: 'G4_O' },
	{ icru: 9, name: 'FLUORINE', sanitized_name: 'F', density: 0.00158029, geant_name: 'G4_F' },
	{ icru: 10, name: 'NEON', sanitized_name: 'Ne', density: 0.000838505, geant_name: 'G4_Ne' },
	{ icru: 11, name: 'SODIUM', sanitized_name: 'Na', density: 0.971, geant_name: 'G4_Na' },
	{ icru: 12, name: 'MAGNESIUM', sanitized_name: 'Mg', density: 1.74, geant_name: 'G4_Mg' },
	{ icru: 13, name: 'ALUMINUM', sanitized_name: 'Al', density: 2.6989, geant_name: 'G4_Al' },
	{ icru: 14, name: 'SILICON', sanitized_name: 'Si', density: 2.33, geant_name: 'G4_Si' },
	{ icru: 15, name: 'PHOSPHORUS', sanitized_name: 'P', density: 2.2, geant_name: 'G4_P' },
	{ icru: 16, name: 'SULFUR', sanitized_name: 'S', density: 2.0, geant_name: 'G4_S' },
	{ icru: 17, name: 'CHLORINE', sanitized_name: 'Cl', density: 0.00299473, geant_name: 'G4_Cl' },
	{ icru: 18, name: 'ARGON', sanitized_name: 'Ar', density: 0.00166201, geant_name: 'G4_Ar' },
	{ icru: 19, name: 'POTASSIUM', sanitized_name: 'K', density: 0.862, geant_name: 'G4_K' },
	{ icru: 20, name: 'CALCIUM', sanitized_name: 'Ca', density: 1.55, geant_name: 'G4_Ca' },
	{ icru: 21, name: 'SCANDIUM', sanitized_name: 'Sc', density: 2.989, geant_name: 'G4_Sc' },
	{ icru: 22, name: 'TITANIUM', sanitized_name: 'Ti', density: 4.54, geant_name: 'G4_Ti' },
	{ icru: 23, name: 'VANADIUM', sanitized_name: 'V', density: 6.11, geant_name: 'G4_V' },
	{ icru: 24, name: 'CHROMIUM', sanitized_name: 'Cr', density: 7.18, geant_name: 'G4_Cr' },
	{ icru: 25, name: 'MANGANESE', sanitized_name: 'Mn', density: 7.44, geant_name: 'G4_Mn' },
	{ icru: 26, name: 'IRON', sanitized_name: 'Fe', density: 7.874, geant_name: 'G4_Fe' },
	{ icru: 27, name: 'COBALT', sanitized_name: 'Co', density: 8.9, geant_name: 'G4_Co' },
	{ icru: 28, name: 'NICKEL', sanitized_name: 'Ni', density: 8.902, geant_name: 'G4_Ni' },
	{ icru: 29, name: 'COPPER', sanitized_name: 'Cu', density: 8.96, geant_name: 'G4_Cu' },
	{ icru: 30, name: 'ZINC', sanitized_name: 'Zn', density: 7.133, geant_name: 'G4_Zn' },
	{ icru: 31, name: 'GALLIUM', sanitized_name: 'Ga', density: 5.904, geant_name: 'G4_Ga' },
	{ icru: 32, name: 'GERMANIUM', sanitized_name: 'Ge', density: 5.323, geant_name: 'G4_Ge' },
	{ icru: 33, name: 'ARSENIC', sanitized_name: 'As', density: 5.73, geant_name: 'G4_As' },
	{ icru: 34, name: 'SELENIUM', sanitized_name: 'Se', density: 4.5, geant_name: 'G4_Se' },
	{ icru: 35, name: 'BROMINE', sanitized_name: 'Br', density: 0.00707218, geant_name: 'G4_Br' },
	{ icru: 36, name: 'KRYPTON', sanitized_name: 'Kr', density: 0.00347832, geant_name: 'G4_Kr' },
	{ icru: 37, name: 'RUBIDIUM', sanitized_name: 'Rb', density: 1.532, geant_name: 'G4_Rb' },
	{ icru: 38, name: 'STRONTIUM', sanitized_name: 'Sr', density: 2.54, geant_name: 'G4_Sr' },
	{ icru: 39, name: 'YTTRIUM', sanitized_name: 'Y', density: 4.469, geant_name: 'G4_Y' },
	{ icru: 40, name: 'ZIRCONIUM', sanitized_name: 'Zr', density: 6.506, geant_name: 'G4_Zr' },
	{ icru: 41, name: 'NIOBIUM', sanitized_name: 'Nb', density: 8.57, geant_name: 'G4_Nb' },
	{ icru: 42, name: 'MOLYBDENUM', sanitized_name: 'Mo', density: 10.22, geant_name: 'G4_Mo' },
	{ icru: 43, name: 'TECHNETIUM', sanitized_name: 'Tc', density: 11.5, geant_name: 'G4_Tc' },
	{ icru: 44, name: 'RUTHENIUM', sanitized_name: 'Ru', density: 12.41, geant_name: 'G4_Ru' },
	{ icru: 45, name: 'RHODIUM', sanitized_name: 'Rh', density: 12.41, geant_name: 'G4_Rh' },
	{ icru: 46, name: 'PALLADIUM', sanitized_name: 'Pd', density: 12.02, geant_name: 'G4_Pd' },
	{ icru: 47, name: 'SILVER', sanitized_name: 'Ag', density: 10.5, geant_name: 'G4_Ag' },
	{ icru: 48, name: 'CADMIUM', sanitized_name: 'Cd', density: 8.65, geant_name: 'G4_Cd' },
	{ icru: 49, name: 'INDIUM', sanitized_name: 'In', density: 7.31, geant_name: 'G4_In' },
	{ icru: 50, name: 'TIN', sanitized_name: 'Sn', density: 7.31, geant_name: 'G4_Sn' },
	{ icru: 51, name: 'ANTIMONY', sanitized_name: 'Sb', density: 6.68, geant_name: 'G4_Sb' },
	{ icru: 52, name: 'TELLURIUM', sanitized_name: 'Te', density: 6.24, geant_name: 'G4_Te' },
	{ icru: 53, name: 'IODINE', sanitized_name: 'I', density: 4.93, geant_name: 'G4_I' },
	{ icru: 54, name: 'XENON', sanitized_name: 'Xe', density: 0.00548537, geant_name: 'G4_Xe' },
	{ icru: 55, name: 'CESIUM', sanitized_name: 'Cs', density: 1.873, geant_name: 'G4_Cs' },
	{ icru: 56, name: 'BARIUM', sanitized_name: 'Ba', density: 3.62, geant_name: 'G4_Ba' },
	{ icru: 57, name: 'LANTHANUM', sanitized_name: 'La', density: 6.145, geant_name: 'G4_La' },
	{ icru: 58, name: 'CERIUM', sanitized_name: 'Ce', density: 6.657, geant_name: 'G4_Ce' },
	{ icru: 59, name: 'PRASEODYMIUM', sanitized_name: 'Pr', density: 6.773, geant_name: 'G4_Pr' },
	{ icru: 60, name: 'NEODYMIUM', sanitized_name: 'Nd', density: 7.007, geant_name: 'G4_Nd' },
	{ icru: 61, name: 'PROMETHIUM', sanitized_name: 'Pm', density: 7.264, geant_name: 'G4_Pm' },
	{ icru: 62, name: 'SAMARIUM', sanitized_name: 'Sm', density: 7.52, geant_name: 'G4_Sm' },
	{ icru: 63, name: 'EUROPIUM', sanitized_name: 'Eu', density: 5.264, geant_name: 'G4_Eu' },
	{ icru: 64, name: 'GADOLINIUM', sanitized_name: 'Gd', density: 7.9, geant_name: 'G4_Gd' },
	{ icru: 65, name: 'TERBIUM', sanitized_name: 'Tb', density: 8.229, geant_name: 'G4_Tb' },
	{ icru: 66, name: 'DYSPROSIUM', sanitized_name: 'Dy', density: 8.55, geant_name: 'G4_Dy' },
	{ icru: 67, name: 'HOLMIUM', sanitized_name: 'Ho', density: 8.795, geant_name: 'G4_Ho' },
	{ icru: 68, name: 'ERBIUM', sanitized_name: 'Er', density: 9.066, geant_name: 'G4_Er' },
	{ icru: 69, name: 'THULIUM', sanitized_name: 'Tm', density: 9.321, geant_name: 'G4_Tm' },
	{ icru: 70, name: 'YTTERBIUM', sanitized_name: 'Yb', density: 6.9, geant_name: 'G4_Yb' },
	{ icru: 71, name: 'LUTETIUM', sanitized_name: 'Lu', density: 9.84, geant_name: 'G4_Lu' },
	{ icru: 72, name: 'HAFNIUM', sanitized_name: 'Hf', density: 13.31, geant_name: 'G4_Hf' },
	{ icru: 73, name: 'TANTALUM', sanitized_name: 'Ta', density: 16.654, geant_name: 'G4_Ta' },
	{ icru: 74, name: 'TUNGSTEN', sanitized_name: 'W', density: 19.25, geant_name: 'G4_W' },
	{ icru: 75, name: 'RHENIUM', sanitized_name: 'Re', density: 21.02, geant_name: 'G4_Re' },
	{ icru: 76, name: 'OSMIUM', sanitized_name: 'Os', density: 22.57, geant_name: 'G4_Os' },
	{ icru: 77, name: 'IRIDIUM', sanitized_name: 'Ir', density: 22.56, geant_name: 'G4_Ir' },
	{ icru: 78, name: 'PLATINUM', sanitized_name: 'Pt', density: 21.46, geant_name: 'G4_Pt' },
	{ icru: 79, name: 'GOLD', sanitized_name: 'Au', density: 19.32, geant_name: 'G4_Au' },
	{ icru: 80, name: 'MERCURY', sanitized_name: 'Hg', density: 13.546, geant_name: 'G4_Hg' },
	{ icru: 81, name: 'THALLIUM', sanitized_name: 'Tl', density: 11.85, geant_name: 'G4_Tl' },
	{ icru: 82, name: 'LEAD', sanitized_name: 'Pb', density: 11.35, geant_name: 'G4_Pb' },
	{ icru: 83, name: 'BISMUTH', sanitized_name: 'Bi', density: 9.747, geant_name: 'G4_Bi' },
	{ icru: 84, name: 'POLONIUM', sanitized_name: 'Po', density: 9.32, geant_name: 'G4_Po' },
	{ icru: 85, name: 'ASTATINE', sanitized_name: 'At', density: 7.0, geant_name: 'G4_At' },
	{ icru: 86, name: 'RADON', sanitized_name: 'Rn', density: 0.00972932, geant_name: 'G4_Rn' },
	{ icru: 87, name: 'FRANCIUM', sanitized_name: 'Fr', density: 1.87, geant_name: 'G4_Fr' },
	{ icru: 88, name: 'RADIUM', sanitized_name: 'Ra', density: 5.0, geant_name: 'G4_Ra' },
	{ icru: 89, name: 'ACTINIUM', sanitized_name: 'Ac', density: 10.07, geant_name: 'G4_Ac' },
	{ icru: 90, name: 'THORIUM', sanitized_name: 'Th', density: 11.72, geant_name: 'G4_Th' },
	{ icru: 91, name: 'PROTACTINIUM', sanitized_name: 'Pa', density: 15.37, geant_name: 'G4_Pa' },
	{ icru: 92, name: 'URANIUM', sanitized_name: 'U', density: 18.95, geant_name: 'G4_U' },
	{ icru: 93, name: 'NEPTUNIUM', sanitized_name: 'Np', density: 20.45, geant_name: 'G4_Np' },
	{ icru: 94, name: 'PLUTONIUM', sanitized_name: 'Pu', density: 19.84, geant_name: 'G4_Pu' },
	{ icru: 95, name: 'AMERICIUM', sanitized_name: 'Am', density: 13.67, geant_name: 'G4_Am' },
	{ icru: 96, name: 'CURIUM', sanitized_name: 'Cm', density: 13.51, geant_name: 'G4_Cm' },
	{ icru: 97, name: 'BERKELIUM', sanitized_name: 'Bk', density: 14.0, geant_name: 'G4_Bk' },
	{ icru: 98, name: 'CALIFORNIUM', sanitized_name: 'Cf', density: 10.0, geant_name: 'G4_Cf' },
	{
		icru: 99,
		name: 'A-150 TISSUE-EQUIVALENT PLASTIC',
		sanitized_name: 'a-150_tissue-equivalent_plastic',
		density: 1.127,
		geant_name: 'G4_A-150_TISSUE'
	},
	{
		icru: 100,
		name: 'ACETONE',
		sanitized_name: 'acetone',
		density: 0.7899,
		geant_name: 'G4_ACETONE'
	},
	{
		icru: 101,
		name: 'ACETYLENE',
		sanitized_name: 'acetylene',
		density: 0.0010967,
		geant_name: 'G4_ACETYLENE'
	},
	{
		icru: 102,
		name: 'ADENINE',
		sanitized_name: 'adenine',
		density: 1.35,
		geant_name: 'G4_ADENINE'
	},
	{
		icru: 103,
		name: 'ADIPOSE TISSUE (ICRP)',
		sanitized_name: 'adipose_tissue_icrp',
		density: 0.92,
		geant_name: 'G4_ADIPOSE_TISSUE_ICRP'
	},
	{
		icru: 104,
		name: 'AIR, DRY (NEAR SEA LEVEL)',
		sanitized_name: 'air_dry_near_sea_level',
		density: 0.00120479,
		geant_name: 'G4_AIR'
	},
	{
		icru: 105,
		name: 'ALANINE',
		sanitized_name: 'alanine',
		density: 1.42,
		geant_name: 'G4_ALANINE'
	},
	{
		icru: 106,
		name: 'ALUMINUM OXIDE',
		sanitized_name: 'aluminum_oxide',
		density: 3.97,
		geant_name: 'G4_ALUMINUM_OXIDE'
	},
	{ icru: 107, name: 'AMBER', sanitized_name: 'amber', density: 1.1, geant_name: 'G4_AMBER' },
	{
		icru: 108,
		name: 'AMMONIA',
		sanitized_name: 'ammonia',
		density: 0.000826019,
		geant_name: 'G4_AMMONIA'
	},
	{
		icru: 109,
		name: 'ANILINE',
		sanitized_name: 'aniline',
		density: 1.0235,
		geant_name: 'G4_ANILINE'
	},
	{
		icru: 110,
		name: 'ANTHRACENE',
		sanitized_name: 'anthracene',
		density: 1.283,
		geant_name: 'G4_ANTHRACENE'
	},
	{ icru: 111, name: 'B100', sanitized_name: 'b100', density: 1.45, geant_name: 'G4_B-100_BONE' },
	{
		icru: 112,
		name: 'BAKELITE',
		sanitized_name: 'bakelite',
		density: 1.25,
		geant_name: 'G4_BAKELITE'
	},
	{
		icru: 113,
		name: 'BARIUM FLUORIDE',
		sanitized_name: 'barium_fluoride',
		density: 4.89,
		geant_name: 'G4_BARIUM_FLUORIDE'
	},
	{
		icru: 114,
		name: 'BARIUM SULFATE',
		sanitized_name: 'barium_sulfate',
		density: 4.5,
		geant_name: 'G4_BARIUM_SULFATE'
	},
	{
		icru: 115,
		name: 'BENZENE',
		sanitized_name: 'benzene',
		density: 0.87865,
		geant_name: 'G4_BENZENE'
	},
	{
		icru: 116,
		name: 'BERYLLIUM OXIDE',
		sanitized_name: 'beryllium_oxide',
		density: 3.01,
		geant_name: 'G4_BERYLLIUM_OXIDE'
	},
	{
		icru: 117,
		name: 'BISMUTH GERMANIUM OXIDE',
		sanitized_name: 'bismuth_germanium_oxide',
		density: 7.13,
		geant_name: 'G4_BGO'
	},
	{
		icru: 118,
		name: 'BLOOD (ICRP)',
		sanitized_name: 'blood_icrp',
		density: 1.06,
		geant_name: 'G4_BLOOD_ICRP'
	},
	{
		icru: 119,
		name: 'BONE, COMPACT (ICRU)',
		sanitized_name: 'bone_compact_icru',
		density: 1.85,
		geant_name: 'G4_BONE_COMPACT_ICRU'
	},
	{
		icru: 120,
		name: 'BONE, CORTICAL (ICRP)',
		sanitized_name: 'bone_cortical_icrp',
		density: 1.85,
		geant_name: 'G4_BONE_CORTICAL_ICRP'
	},
	{
		icru: 121,
		name: 'BORON CARBIDE',
		sanitized_name: 'boron_carbide',
		density: 2.52,
		geant_name: 'G4_BORON_CARBIDE'
	},
	{
		icru: 122,
		name: 'BORON OXIDE',
		sanitized_name: 'boron_oxide',
		density: 1.812,
		geant_name: 'G4_BORON_OXIDE'
	},
	{
		icru: 123,
		name: 'BRAIN (ICRP)',
		sanitized_name: 'brain_icrp',
		density: 1.03,
		geant_name: 'G4_BRAIN_ICRP'
	},
	{
		icru: 124,
		name: 'BUTANE',
		sanitized_name: 'butane',
		density: 0.00249343,
		geant_name: 'G4_BUTANE'
	},
	{
		icru: 125,
		name: 'N-BUTYLALCOHOL',
		sanitized_name: 'n-butylalcohol',
		density: 0.8098,
		geant_name: 'G4_N-BUTYL_ALCOHOL'
	},
	{
		icru: 126,
		name: 'C-552 AIR-EQUIVALENT PLASTIC',
		sanitized_name: 'c-552_air-equivalent_plastic',
		density: 1.76,
		geant_name: 'G4_C-552'
	},
	{
		icru: 127,
		name: 'CADMIUM TELLURIDE',
		sanitized_name: 'cadmium_telluride',
		density: 6.2,
		geant_name: 'G4_CADMIUM_TELLURIDE'
	},
	{
		icru: 128,
		name: 'CADMIUM TUNGSTATE',
		sanitized_name: 'cadmium_tungstate',
		density: 7.9,
		geant_name: 'G4_CADMIUM_TUNGSTATE'
	},
	{
		icru: 129,
		name: 'CALCIUM CARBONATE',
		sanitized_name: 'calcium_carbonate',
		density: 2.8,
		geant_name: 'G4_CALCIUM_CARBONATE'
	},
	{
		icru: 130,
		name: 'CALCIUM FLUORIDE',
		sanitized_name: 'calcium_fluoride',
		density: 3.18,
		geant_name: 'G4_CALCIUM_FLUORIDE'
	},
	{
		icru: 131,
		name: 'CALCIUM OXIDE',
		sanitized_name: 'calcium_oxide',
		density: 3.3,
		geant_name: 'G4_CALCIUM_OXIDE'
	},
	{
		icru: 132,
		name: 'CALCIUM SULFATE',
		sanitized_name: 'calcium_sulfate',
		density: 2.96,
		geant_name: 'G4_CALCIUM_SULFATE'
	},
	{
		icru: 133,
		name: 'CALCIUM TUNGSTATE',
		sanitized_name: 'calcium_tungstate',
		density: 6.062,
		geant_name: 'G4_CALCIUM_TUNGSTATE'
	},
	{
		icru: 134,
		name: 'CARBON DIOXIDE',
		sanitized_name: 'carbon_dioxide',
		density: 0.00184212,
		geant_name: 'G4_CARBON_DIOXIDE'
	},
	{
		icru: 135,
		name: 'CARBON TETRACHLORIDE',
		sanitized_name: 'carbon_tetrachloride',
		density: 1.594,
		geant_name: 'G4_CARBON_TETRACHLORIDE'
	},
	{
		icru: 136,
		name: 'CELLULOSE ACETATE, CELLOPHANE',
		sanitized_name: 'cellulose_acetate_cellophane',
		density: 1.42,
		geant_name: 'G4_CELLULOSE_CELLOPHANE'
	},
	{
		icru: 137,
		name: 'CELLULOSE ACETATE BUTYRATE',
		sanitized_name: 'cellulose_acetate_butyrate',
		density: 1.2,
		geant_name: 'G4_CELLULOSE_BUTYRATE'
	},
	{
		icru: 138,
		name: 'CELLULOSE NITRATE',
		sanitized_name: 'cellulose_nitrate',
		density: 1.49,
		geant_name: 'G4_CERIC_SULFATE'
	},
	{
		icru: 139,
		name: 'CERIC SULFATE DOSIMETER SOLUTION',
		sanitized_name: 'ceric_sulfate_dosimeter_solution',
		density: 1.03,
		geant_name: 'G4_CELLULOSE_NITRATE'
	},
	{
		icru: 140,
		name: 'CESIUM FLUORIDE',
		sanitized_name: 'cesium_fluoride',
		density: 4.115,
		geant_name: 'G4_CESIUM_FLUORIDE'
	},
	{
		icru: 141,
		name: 'CESIUM IODIDE',
		sanitized_name: 'cesium_iodide',
		density: 4.51,
		geant_name: 'G4_CESIUM_IODIDE'
	},
	{
		icru: 142,
		name: 'CHLOROBENZENE',
		sanitized_name: 'chlorobenzene',
		density: 1.1058,
		geant_name: 'G4_CHLOROBENZENE'
	},
	{
		icru: 143,
		name: 'CHLOROFORM',
		sanitized_name: 'chloroform',
		density: 1.4832,
		geant_name: 'G4_CHLOROFORM'
	},
	{
		icru: 144,
		name: 'CONCRETE PORTLAND',
		sanitized_name: 'concrete_portland',
		density: 2.3,
		geant_name: 'G4_CONCRETE'
	},
	{
		icru: 145,
		name: 'CYCLOHEXANE',
		sanitized_name: 'cyclohexane',
		density: 0.779,
		geant_name: 'G4_CYCLOHEXANE'
	},
	{
		icru: 146,
		name: '1,2-DICHLOROBENZENE',
		sanitized_name: '12-dichlorobenzene',
		density: 1.3048,
		geant_name: 'G4_1,2-DICHLOROBENZENE'
	},
	{
		icru: 147,
		name: 'DICHLORODIETHYL ETHER',
		sanitized_name: 'dichlorodiethyl_ether',
		density: 1.2199,
		geant_name: 'G4_DICHLORODIETHYL_ETHER'
	},
	{
		icru: 148,
		name: 'DICHLOROETHANE',
		sanitized_name: 'dichloroethane',
		density: 1.2351,
		geant_name: 'G4_1,2-DICHLOROETHANE'
	},
	{
		icru: 149,
		name: 'DIETHYLETHER',
		sanitized_name: 'diethylether',
		density: 0.71378,
		geant_name: 'G4_DIETHYL_ETHER'
	},
	{
		icru: 150,
		name: 'N,N-DIMETHYL FORMAMIDE',
		sanitized_name: 'nn-dimethyl_formamide',
		density: 0.9487,
		geant_name: 'G4_N,N-DIMETHYL_FORMAMIDE'
	},
	{
		icru: 151,
		name: 'DIMETHYLSULFOXIDE',
		sanitized_name: 'dimethylsulfoxide',
		density: 1.1014,
		geant_name: 'G4_DIMETHYL_SULFOXIDE'
	},
	{
		icru: 152,
		name: 'ETHANE',
		sanitized_name: 'ethane',
		density: 0.00125324,
		geant_name: 'G4_ETHANE'
	},
	{
		icru: 153,
		name: 'ETHYL ALCOHOL',
		sanitized_name: 'ethyl_alcohol',
		density: 0.7893,
		geant_name: 'G4_ETHYL_ALCOHOL'
	},
	{
		icru: 154,
		name: 'ETHYL CELLULOSE',
		sanitized_name: 'ethyl_cellulose',
		density: 1.13,
		geant_name: 'G4_ETHYL_CELLULOSE'
	},
	{
		icru: 155,
		name: 'ETHYLENE',
		sanitized_name: 'ethylene',
		density: 0.00117497,
		geant_name: 'G4_ETHYLENE'
	},
	{
		icru: 156,
		name: 'EYELENS (ICRP)',
		sanitized_name: 'eyelens_icrp',
		density: 1.1,
		geant_name: 'G4_EYE_LENS_ICRP'
	},
	{
		icru: 157,
		name: 'FERRIC OXIDE',
		sanitized_name: 'ferric_oxide',
		density: 5.2,
		geant_name: 'G4_FERRIC_OXIDE'
	},
	{
		icru: 158,
		name: 'FERRO BORIDE',
		sanitized_name: 'ferro_boride',
		density: 7.15,
		geant_name: 'G4_FERROBORIDE'
	},
	{
		icru: 159,
		name: 'FERROUS OXIDE',
		sanitized_name: 'ferrous_oxide',
		density: 7.15,
		geant_name: 'G4_FERROUS_OXIDE'
	},
	{
		icru: 160,
		name: 'FERROUS SULFATE DOSIMETER SOLUTION',
		sanitized_name: 'ferrous_sulfate_dosimeter_solution',
		density: 1.024,
		geant_name: 'G4_FERROUS_SULFATE'
	},
	{
		icru: 161,
		name: 'FREON-12',
		sanitized_name: 'freon-12',
		density: 1.12,
		geant_name: 'G4_FREON-12'
	},
	{
		icru: 162,
		name: 'FREON-12B2',
		sanitized_name: 'freon-12b2',
		density: 1.8,
		geant_name: 'G4_FREON-12B2'
	},
	{
		icru: 163,
		name: 'FREON-13',
		sanitized_name: 'freon-13',
		density: 0.95,
		geant_name: 'G4_FREON-13'
	},
	{
		icru: 164,
		name: 'FREON-13B1',
		sanitized_name: 'freon-13b1',
		density: 1.5,
		geant_name: 'G4_FREON-13B1'
	},
	{
		icru: 165,
		name: 'FREON-13I1',
		sanitized_name: 'freon-13i1',
		density: 1.8,
		geant_name: 'G4_FREON-13I1'
	},
	{
		icru: 166,
		name: 'GADOLINIUM OXYSULFIDE',
		sanitized_name: 'gadolinium_oxysulfide',
		density: 7.44,
		geant_name: 'G4_GADOLINIUM_OXYSULFIDE'
	},
	{
		icru: 167,
		name: 'GALLIUM ARSENIDE',
		sanitized_name: 'gallium_arsenide',
		density: 5.31,
		geant_name: 'G4_GALLIUM_ARSENIDE'
	},
	{
		icru: 168,
		name: 'GEL IN PHOTOGRAPHIC EMULSION',
		sanitized_name: 'gel_in_photographic_emulsion',
		density: 1.2914,
		geant_name: 'G4_GEL_PHOTO_EMULSION'
	},
	{
		icru: 169,
		name: 'GLASS, PYREX',
		sanitized_name: 'glass_pyrex',
		density: 6.22,
		geant_name: 'G4_Pyrex_Glass'
	},
	{
		icru: 170,
		name: 'GLASS, LEAD',
		sanitized_name: 'glass_lead',
		density: 2.4,
		geant_name: 'G4_GLASS_LEAD'
	},
	{
		icru: 171,
		name: 'GLASS, PLATE',
		sanitized_name: 'glass_plate',
		density: 2.23,
		geant_name: 'G4_GLASS_PLATE'
	},
	{
		icru: 172,
		name: 'GLUCOSE',
		sanitized_name: 'glucose',
		density: 1.54,
		geant_name: 'G4_GLUCOSE'
	},
	{
		icru: 173,
		name: 'GLUTAMINE',
		sanitized_name: 'glutamine',
		density: 1.46,
		geant_name: 'G4_GLUTAMINE'
	},
	{
		icru: 174,
		name: 'GLYCEROL',
		sanitized_name: 'glycerol',
		density: 1.2613,
		geant_name: 'G4_GLYCEROL'
	},
	{
		icru: 175,
		name: 'GUANINE',
		sanitized_name: 'guanine',
		density: 1.58,
		geant_name: 'G4_GUANINE'
	},
	{
		icru: 176,
		name: 'GYPSUM / PLASTER OF PARIS',
		sanitized_name: 'gypsum_plaster_of_paris',
		density: 2.32,
		geant_name: 'G4_GYPSUM'
	},
	{
		icru: 177,
		name: 'N-HEPTANE',
		sanitized_name: 'n-heptane',
		density: 0.68376,
		geant_name: 'G4_N-HEPTANE'
	},
	{
		icru: 178,
		name: 'N-HEXANE',
		sanitized_name: 'n-hexane',
		density: 0.6603,
		geant_name: 'G4_N-HEXANE'
	},
	{
		icru: 179,
		name: 'KAPTON POLYIMIDE FILM',
		sanitized_name: 'kapton_polyimide_film',
		density: 1.42,
		geant_name: 'G4_KAPTON'
	},
	{
		icru: 180,
		name: 'LANTHANUM OXYBROMIDE',
		sanitized_name: 'lanthanum_oxybromide',
		density: 6.28,
		geant_name: 'G4_LANTHANUM_OXYBROMIDE'
	},
	{
		icru: 181,
		name: 'LANTHANUM OXYSULFIDE',
		sanitized_name: 'lanthanum_oxysulfide',
		density: 5.86,
		geant_name: 'G4_LANTHANUM_OXYSULFIDE'
	},
	{
		icru: 182,
		name: 'LEADOXIDE',
		sanitized_name: 'leadoxide',
		density: 9.53,
		geant_name: 'G4_LEAD_OXIDE'
	},
	{
		icru: 183,
		name: 'LITHIUM AMIDE',
		sanitized_name: 'lithium_amide',
		density: 1.178,
		geant_name: 'G4_LITHIUM_AMIDE'
	},
	{
		icru: 184,
		name: 'LITHIUM CARBONATE',
		sanitized_name: 'lithium_carbonate',
		density: 2.11,
		geant_name: 'G4_LITHIUM_CARBONATE'
	},
	{
		icru: 185,
		name: 'LITHIUM FLUORIDE',
		sanitized_name: 'lithium_fluoride',
		density: 2.635,
		geant_name: 'G4_LITHIUM_FLUORIDE'
	},
	{
		icru: 186,
		name: 'LITHIUM HYDRIDE',
		sanitized_name: 'lithium_hydride',
		density: 0.82,
		geant_name: 'G4_LITHIUM_HYDRIDE'
	},
	{
		icru: 187,
		name: 'LITHIUM IODIDE',
		sanitized_name: 'lithium_iodide',
		density: 3.494,
		geant_name: 'G4_LITHIUM_IODIDE'
	},
	{
		icru: 188,
		name: 'LITHIUM OXIDE',
		sanitized_name: 'lithium_oxide',
		density: 2.013,
		geant_name: 'G4_LITHIUM_OXIDE'
	},
	{
		icru: 189,
		name: 'LITHIUM TETRABORATE',
		sanitized_name: 'lithium_tetraborate',
		density: 2.44,
		geant_name: 'G4_LITHIUM_TETRABORATE'
	},
	{
		icru: 190,
		name: 'LUNG (ICRP)',
		sanitized_name: 'lung_icrp',
		density: 1.05,
		geant_name: 'G4_LUNG_ICRP'
	},
	{ icru: 191, name: 'M3 WAX', sanitized_name: 'm3_wax', density: 1.05, geant_name: 'G4_M3_WAX' },
	{
		icru: 192,
		name: 'MAGNESIUM CARBONATE',
		sanitized_name: 'magnesium_carbonate',
		density: 2.958,
		geant_name: 'G4_MAGNESIUM_CARBONATE'
	},
	{
		icru: 193,
		name: 'MAGNESIUM FLUORIDE',
		sanitized_name: 'magnesium_fluoride',
		density: 3.0,
		geant_name: 'G4_MAGNESIUM_FLUORIDE'
	},
	{
		icru: 194,
		name: 'MAGNESIUM OXIDE',
		sanitized_name: 'magnesium_oxide',
		density: 3.58,
		geant_name: 'G4_MAGNESIUM_OXIDE'
	},
	{
		icru: 195,
		name: 'MAGNESIUM TETRABORATE',
		sanitized_name: 'magnesium_tetraborate',
		density: 2.53,
		geant_name: 'G4_MAGNESIUM_TETRABORATE'
	},
	{
		icru: 196,
		name: 'MERCURIC IODIDE',
		sanitized_name: 'mercuric_iodide',
		density: 6.36,
		geant_name: 'G4_MERCURIC_IODIDE'
	},
	{
		icru: 197,
		name: 'METHANE',
		sanitized_name: 'methane',
		density: 0.000667151,
		geant_name: 'G4_METHANE'
	},
	{
		icru: 198,
		name: 'METHANOL',
		sanitized_name: 'methanol',
		density: 0.7914,
		geant_name: 'G4_METHANOL'
	},
	{
		icru: 199,
		name: 'MIX D WAX',
		sanitized_name: 'mix_d_wax',
		density: 0.99,
		geant_name: 'G4_MIX_D_WAX'
	},
	{
		icru: 200,
		name: 'MS20 TISSUE SUBSTITUTE',
		sanitized_name: 'ms20_tissue_substitute',
		density: 1.0,
		geant_name: 'G4_MS20_TISSUE'
	},
	{
		icru: 201,
		name: 'MUSCLE, SKELETAL (ICRP)',
		sanitized_name: 'muscle_skeletal_icrp',
		density: 1.04,
		geant_name: 'G4_MUSCLE_SKELETAL_ICRP'
	},
	{
		icru: 202,
		name: 'MUSCLE, STRIATED (ICRU)',
		sanitized_name: 'muscle_striated_icru',
		density: 1.04,
		geant_name: 'G4_MUSCLE_STRIATED_ICRU'
	},
	{
		icru: 203,
		name: 'MUSCLE EQUIVALENT LIQUID, WITH SUCROSE',
		sanitized_name: 'muscle_equivalent_liquid_with_sucrose',
		density: 1.11,
		geant_name: 'G4_MUSCLE_WITH_SUCROSE'
	},
	{
		icru: 204,
		name: 'MUSCLE EQUIVALENT LIQUID, NO SUCROSE',
		sanitized_name: 'muscle_equivalent_liquid_no_sucrose',
		density: 1.07,
		geant_name: 'G4_MUSCLE_WITHOUT_SUCROSE'
	},
	{
		icru: 205,
		name: 'NAPHTHALENE',
		sanitized_name: 'naphthalene',
		density: 1.145,
		geant_name: 'G4_NAPHTHALENE'
	},
	{
		icru: 206,
		name: 'NITROBENZENE',
		sanitized_name: 'nitrobenzene',
		density: 1.19867,
		geant_name: 'G4_NITROBENZENE'
	},
	{
		icru: 207,
		name: 'NITROUS OXIDE',
		sanitized_name: 'nitrous_oxide',
		density: 0.00183094,
		geant_name: 'G4_NITROUS_OXIDE'
	},
	{
		icru: 208,
		name: 'NYLON, DU PONT ELVAMIDE 8062',
		sanitized_name: 'nylon_du_pont_elvamide_8062',
		density: 1.08,
		geant_name: 'G4_NYLON-8062'
	},
	{
		icru: 209,
		name: 'NYLON, TYPE 6 AND 6/6',
		sanitized_name: 'nylon_type_6_and_6by6',
		density: 1.14,
		geant_name: 'G4_NYLON-6/6'
	},
	{
		icru: 210,
		name: 'NYLON, TYPE 6/10',
		sanitized_name: 'nylon_type_6by10',
		density: 1.14,
		geant_name: 'G4_NYLON-6/10'
	},
	{
		icru: 211,
		name: 'NYLON, TYPE 11 (RILSAN)',
		sanitized_name: 'nylon_type_11_rilsan',
		density: 1.425,
		geant_name: 'G4_NYLON-11_RILSAN'
	},
	{
		icru: 212,
		name: 'OCTANE, LIQUID',
		sanitized_name: 'octane_liquid',
		density: 0.7026,
		geant_name: 'G4_OCTANE'
	},
	{
		icru: 213,
		name: 'PARAFFINWAX',
		sanitized_name: 'paraffinwax',
		density: 0.93,
		geant_name: 'G4_PARAFFIN'
	},
	{
		icru: 214,
		name: 'N-PENTANE',
		sanitized_name: 'n-pentane',
		density: 0.6262,
		geant_name: 'G4_N-PENTANE'
	},
	{
		icru: 215,
		name: 'PHOTOGRAPHIC EMULSION',
		sanitized_name: 'photographic_emulsion',
		density: 3.815,
		geant_name: 'G4_PHOTO_EMULSION'
	},
	{
		icru: 216,
		name: 'PLASTIC SCINTILLATOR (VINYLTOLUENE BASED)',
		sanitized_name: 'plastic_scintillator_vinyltoluene_based',
		density: 1.032,
		geant_name: 'G4_PLASTIC_SC_VINYLTOLUENE'
	},
	{
		icru: 217,
		name: 'PLUTONIUM DIOXIDE',
		sanitized_name: 'plutonium_dioxide',
		density: 11.46,
		geant_name: 'G4_PLUTONIUM_DIOXIDE'
	},
	{
		icru: 218,
		name: 'POLYACRYLONITRILE',
		sanitized_name: 'polyacrylonitrile',
		density: 1.17,
		geant_name: 'G4_POLYACRYLONITRILE'
	},
	{
		icru: 219,
		name: 'POLYCARBONATE (MAKROLON, LEXAN)',
		sanitized_name: 'polycarbonate_makrolon_lexan',
		density: 1.2,
		geant_name: 'G4_POLYCARBONATE'
	},
	{
		icru: 220,
		name: 'POLYCHLOROSTYRENE',
		sanitized_name: 'polychlorostyrene',
		density: 1.3,
		geant_name: 'G4_POLYCHLOROSTYRENE'
	},
	{
		icru: 221,
		name: 'POLYETHYLENE',
		sanitized_name: 'polyethylene',
		density: 0.94,
		geant_name: 'G4_POLYETHYLENE'
	},
	{
		icru: 222,
		name: 'POLYETHYLENE TEREPHTHALATE (MYLAR)',
		sanitized_name: 'polyethylene_terephthalate_mylar',
		density: 1.4,
		geant_name: 'G4_MYLAR'
	},
	{
		icru: 223,
		name: 'POLYMETHYL METHACRALATE (LUCITE, PERSPEX, PMMA)',
		sanitized_name: 'polymethyl_methacralate_lucite_perspex_pmma',
		density: 1.19,
		geant_name: 'G4_PLEXIGLASS'
	},
	{
		icru: 224,
		name: 'POLYOXYMETHYLENE',
		sanitized_name: 'polyoxymethylene',
		density: 1.425,
		geant_name: 'G4_POLYOXYMETHYLENE'
	},
	{
		icru: 225,
		name: 'POLYPROPYLENE',
		sanitized_name: 'polypropylene',
		density: 0.9,
		geant_name: 'G4_POLYPROPYLENE'
	},
	{
		icru: 226,
		name: 'POLYSTYRENE',
		sanitized_name: 'polystyrene',
		density: 1.06,
		geant_name: 'G4_POLYSTYRENE'
	},
	{
		icru: 227,
		name: 'POLYTETRAFLUOROETHYLENE (TEFLON)',
		sanitized_name: 'polytetrafluoroethylene_teflon',
		density: 2.2,
		geant_name: 'G4_TEFLON'
	},
	{
		icru: 228,
		name: 'POLYTRIFLUOROCHLOROETHYLENE',
		sanitized_name: 'polytrifluorochloroethylene',
		density: 2.1,
		geant_name: 'G4_POLYTRIFLUOROCHLOROETHYLENE'
	},
	{
		icru: 229,
		name: 'POLYVINYL ACETATE',
		sanitized_name: 'polyvinyl_acetate',
		density: 1.19,
		geant_name: 'G4_POLYVINYL_ACETATE'
	},
	{
		icru: 230,
		name: 'POLYVINYL ALCOHOL',
		sanitized_name: 'polyvinyl_alcohol',
		density: 1.3,
		geant_name: 'G4_POLYVINYL_ALCOHOL'
	},
	{
		icru: 231,
		name: 'POLYVINYL BUTYRAL',
		sanitized_name: 'polyvinyl_butyral',
		density: 1.12,
		geant_name: 'G4_POLYVINYL_BUTYRAL'
	},
	{
		icru: 232,
		name: 'POLYVINYL CHLORIDE',
		sanitized_name: 'polyvinyl_chloride',
		density: 1.3,
		geant_name: 'G4_POLYVINYL_CHLORIDE'
	},
	{
		icru: 233,
		name: 'SARAN',
		sanitized_name: 'saran',
		density: 1.7,
		geant_name: 'G4_POLYVINYLIDENE_CHLORIDE'
	},
	{
		icru: 234,
		name: 'POLYVINYLIDENE FLUORIDE',
		sanitized_name: 'polyvinylidene_fluoride',
		density: 1.76,
		geant_name: 'G4_POLYVINYLIDENE_FLUORIDE'
	},
	{
		icru: 235,
		name: 'POLYVINYLPYRROLIDONE',
		sanitized_name: 'polyvinylpyrrolidone',
		density: 1.25,
		geant_name: 'G4_POLYVINYL_PYRROLIDONE'
	},
	{
		icru: 236,
		name: 'POTASSIUM IODIDE',
		sanitized_name: 'potassium_iodide',
		density: 3.13,
		geant_name: 'G4_POTASSIUM_IODIDE'
	},
	{
		icru: 237,
		name: 'POTASSIUM OXIDE',
		sanitized_name: 'potassium_oxide',
		density: 2.32,
		geant_name: 'G4_POTASSIUM_OXIDE'
	},
	{
		icru: 238,
		name: 'PROPANE',
		sanitized_name: 'propane',
		density: 0.00187939,
		geant_name: 'G4_PROPANE'
	},
	{
		icru: 239,
		name: 'PROPANE, LIQUID',
		sanitized_name: 'propane_liquid',
		density: 0.43,
		geant_name: 'G4_lPROPANE'
	},
	{
		icru: 240,
		name: 'N-PROPYL ALCOHOL',
		sanitized_name: 'n-propyl_alcohol',
		density: 0.8035,
		geant_name: 'G4_N-PROPYL_ALCOHOL'
	},
	{
		icru: 241,
		name: 'PYRIDINE',
		sanitized_name: 'pyridine',
		density: 0.9819,
		geant_name: 'G4_PYRIDINE'
	},
	{
		icru: 242,
		name: 'RUBBER, BUTYL',
		sanitized_name: 'rubber_butyl',
		density: 0.92,
		geant_name: 'G4_RUBBER_BUTYL'
	},
	{
		icru: 243,
		name: 'RUBBER, NATURAL',
		sanitized_name: 'rubber_natural',
		density: 0.92,
		geant_name: 'G4_RUBBER_NATURAL'
	},
	{
		icru: 244,
		name: 'RUBBER, NEOPRENE',
		sanitized_name: 'rubber_neoprene',
		density: 1.23,
		geant_name: 'G4_RUBBER_NEOPRENE'
	},
	{
		icru: 245,
		name: 'SILICON DIOXIDE',
		sanitized_name: 'silicon_dioxide',
		density: 2.32,
		geant_name: 'G4_SILICON_DIOXIDE'
	},
	{
		icru: 246,
		name: 'SILVER BROMIDE',
		sanitized_name: 'silver_bromide',
		density: 6.473,
		geant_name: 'G4_SILVER_BROMIDE'
	},
	{
		icru: 247,
		name: 'SILVER CHLORIDE',
		sanitized_name: 'silver_chloride',
		density: 5.56,
		geant_name: 'G4_SILVER_CHLORIDE'
	},
	{
		icru: 248,
		name: 'SILVER HALIDES IN PHOTOGRAPHIC EMULSION',
		sanitized_name: 'silver_halides_in_photographic_emulsion',
		density: 6.47,
		geant_name: 'G4_SILVER_HALIDES'
	},
	{
		icru: 249,
		name: 'SILVER IODIDE',
		sanitized_name: 'silver_iodide',
		density: 6.01,
		geant_name: 'G4_SILVER_IODIDE'
	},
	{
		icru: 250,
		name: 'SKIN (ICRP)',
		sanitized_name: 'skin_icrp',
		density: 1.1,
		geant_name: 'G4_SKIN_ICRP'
	},
	{
		icru: 251,
		name: 'SODIUM CARBONATE',
		sanitized_name: 'sodium_carbonate',
		density: 2.532,
		geant_name: 'G4_SODIUM_CARBONATE'
	},
	{
		icru: 252,
		name: 'SODIUM IODIDE',
		sanitized_name: 'sodium_iodide',
		density: 3.667,
		geant_name: 'G4_SODIUM_IODIDE'
	},
	{
		icru: 253,
		name: 'SODIUM MONOXIDE',
		sanitized_name: 'sodium_monoxide',
		density: 2.27,
		geant_name: 'G4_SODIUM_MONOXIDE'
	},
	{
		icru: 254,
		name: 'SODIUM NITRATE',
		sanitized_name: 'sodium_nitrate',
		density: 2.261,
		geant_name: 'G4_SODIUM_NITRATE'
	},
	{
		icru: 255,
		name: 'STILBENE',
		sanitized_name: 'stilbene',
		density: 0.9707,
		geant_name: 'G4_STILBENE'
	},
	{
		icru: 256,
		name: 'SUCROSE',
		sanitized_name: 'sucrose',
		density: 1.5805,
		geant_name: 'G4_SUCROSE'
	},
	{
		icru: 257,
		name: 'TERPHENYL',
		sanitized_name: 'terphenyl',
		density: 1.234,
		geant_name: 'G4_TERPHENYL'
	},
	{
		icru: 258,
		name: 'TESTES (ICRP)',
		sanitized_name: 'testes_icrp',
		density: 1.04,
		geant_name: 'G4_TESTES_ICRP'
	},
	{
		icru: 259,
		name: 'G4_TETRACHLOROETHYLENE',
		sanitized_name: 'tetrachloroethylene',
		density: 1.625,
		geant_name: 'unknown'
	},
	{
		icru: 260,
		name: 'THALLIUM CHLORIDE',
		sanitized_name: 'thallium_chloride',
		density: 7.004,
		geant_name: 'G4_THALLIUM_CHLORIDE'
	},
	{
		icru: 261,
		name: 'TISSUE, SOFT (ICRP)',
		sanitized_name: 'tissue_soft_icrp',
		density: 1.0,
		geant_name: 'G4_TISSUE_SOFT_ICRP'
	},
	{
		icru: 262,
		name: 'TISSUE, SOFT (ICRU, FOUR COMPONENT)',
		sanitized_name: 'tissue_soft_icru_four_component',
		density: 1.0,
		geant_name: 'G4_TISSUE_SOFT_ICRU'
	},
	{
		icru: 263,
		name: 'TISSUE-EQUIVALENT GAS (METHANE BASED)',
		sanitized_name: 'tissue-equivalent_gas_methane_based',
		density: 0.00106409,
		geant_name: 'G4_TISSUE-METHANE'
	},
	{
		icru: 264,
		name: 'TISSUE-EQUIVALENT GAS (PROPANE BASED)',
		sanitized_name: 'tissue-equivalent_gas_propane_based',
		density: 0.00182628,
		geant_name: 'G4_TISSUE-PROPANE'
	},
	{
		icru: 265,
		name: 'TITANIUM DIOXIDE',
		sanitized_name: 'titanium_dioxide',
		density: 4.26,
		geant_name: 'G4_TITANIUM_DIOXIDE'
	},
	{
		icru: 266,
		name: 'TOLUENE',
		sanitized_name: 'toluene',
		density: 0.8669,
		geant_name: 'G4_TOLUENE'
	},
	{
		icru: 267,
		name: 'TRICHLOROETHYLENE',
		sanitized_name: 'trichloroethylene',
		density: 1.46,
		geant_name: 'G4_TRICHLOROETHYLENE'
	},
	{
		icru: 268,
		name: 'TRIETHYL PHOSPHATE',
		sanitized_name: 'triethyl_phosphate',
		density: 1.07,
		geant_name: 'G4_TRIETHYL_PHOSPHATE'
	},
	{
		icru: 269,
		name: 'TUNGSTEN HEXAFLUORIDE',
		sanitized_name: 'tungsten_hexafluoride',
		density: 2.4,
		geant_name: 'G4_TUNGSTEN_HEXAFLUORIDE'
	},
	{
		icru: 270,
		name: 'URANIUM DICARBIDE',
		sanitized_name: 'uranium_dicarbide',
		density: 11.28,
		geant_name: 'G4_URANIUM_DICARBIDE'
	},
	{
		icru: 271,
		name: 'URANIUM MONOCARBIDE',
		sanitized_name: 'uranium_monocarbide',
		density: 13.63,
		geant_name: 'G4_URANIUM_MONOCARBIDE'
	},
	{
		icru: 272,
		name: 'URANIUM OXIDE',
		sanitized_name: 'uranium_oxide',
		density: 10.96,
		geant_name: 'G4_URANIUM_OXIDE'
	},
	{ icru: 273, name: 'UREA', sanitized_name: 'urea', density: 1.323, geant_name: 'G4_UREA' },
	{ icru: 274, name: 'VALINE', sanitized_name: 'valine', density: 1.23, geant_name: 'G4_VALINE' },
	{
		icru: 275,
		name: 'VITON FLUOROELASTOMER',
		sanitized_name: 'viton_fluoroelastomer',
		density: 1.8,
		geant_name: 'G4_VITON'
	},
	{
		icru: 276,
		name: 'WATER, LIQUID',
		sanitized_name: 'water_liquid',
		density: 1.0,
		geant_name: 'G4_WATER'
	},
	{
		icru: 277,
		name: 'WATER VAPOR',
		sanitized_name: 'water_vapor',
		density: 0.000756182,
		geant_name: 'G4_WATER_VAPOR'
	},
	{ icru: 278, name: 'XYLENE', sanitized_name: 'G4_XYLENE', density: 0.87 }
];

export const DEFAULT_SIMULATION_MATERIAL = MATERIALS.find(
	mat => mat.icru === DEFAULT_MATERIAL_ICRU
)!;
