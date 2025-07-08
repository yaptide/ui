export const COMMON_MATERIAL_ICRUS = [104, 276, 223, 179, 222, 6, 13, 14, 82, 245, 170, 1000];
export const DEFAULT_MATERIAL_ICRU = 276;
export const WORLD_ZONE_DEFAULT_MATERIAL_ICRU = 1000;
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
	{ 'icru': 1000, 'name': 'VACUUM', 'sanitized_name': 'vacuum', 'density': 0 },
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
	{ icru: 1000, name: 'VACUUM', sanitized_name: 'vacuum', density: 0 },
	{ icru: 0, name: 'BLACK HOLE', sanitized_name: 'black_hole', density: 0 },
	{ icru: 1, name: 'HYDROGEN', sanitized_name: 'H', density: 8.3748e-5 },
	{ icru: 2, name: 'HELIUM', sanitized_name: 'He', density: 0.000166322 },
	{ icru: 3, name: 'LITHIUM', sanitized_name: 'Li', density: 0.534 },
	{ icru: 4, name: 'BERYLLIUM', sanitized_name: 'Be', density: 1.848 },
	{ icru: 5, name: 'BORON', sanitized_name: 'B', density: 2.37 },
	{ icru: 6, name: 'CARBON', sanitized_name: 'C', density: 2.0 },
	{ icru: 7, name: 'NITROGEN', sanitized_name: 'N', density: 0.00116528 },
	{ icru: 8, name: 'OXYGEN', sanitized_name: 'O', density: 0.00133151 },
	{ icru: 9, name: 'FLUORINE', sanitized_name: 'F', density: 0.00158029 },
	{ icru: 10, name: 'NEON', sanitized_name: 'Ne', density: 0.000838505 },
	{ icru: 11, name: 'SODIUM', sanitized_name: 'Na', density: 0.971 },
	{ icru: 12, name: 'MAGNESIUM', sanitized_name: 'Mg', density: 1.74 },
	{ icru: 13, name: 'ALUMINUM', sanitized_name: 'Al', density: 2.6989 },
	{ icru: 14, name: 'SILICON', sanitized_name: 'Si', density: 2.33 },
	{ icru: 15, name: 'PHOSPHORUS', sanitized_name: 'P', density: 2.2 },
	{ icru: 16, name: 'SULFUR', sanitized_name: 'S', density: 2.0 },
	{ icru: 17, name: 'CHLORINE', sanitized_name: 'Cl', density: 0.00299473 },
	{ icru: 18, name: 'ARGON', sanitized_name: 'Ar', density: 0.00166201 },
	{ icru: 19, name: 'POTASSIUM', sanitized_name: 'K', density: 0.862 },
	{ icru: 20, name: 'CALCIUM', sanitized_name: 'Ca', density: 1.55 },
	{ icru: 21, name: 'SCANDIUM', sanitized_name: 'Sc', density: 2.989 },
	{ icru: 22, name: 'TITANIUM', sanitized_name: 'Ti', density: 4.54 },
	{ icru: 23, name: 'VANADIUM', sanitized_name: 'V', density: 6.11 },
	{ icru: 24, name: 'CHROMIUM', sanitized_name: 'Cr', density: 7.18 },
	{ icru: 25, name: 'MANGANESE', sanitized_name: 'Mn', density: 7.44 },
	{ icru: 26, name: 'IRON', sanitized_name: 'Fe', density: 7.874 },
	{ icru: 27, name: 'COBALT', sanitized_name: 'Co', density: 8.9 },
	{ icru: 28, name: 'NICKEL', sanitized_name: 'Ni', density: 8.902 },
	{ icru: 29, name: 'COPPER', sanitized_name: 'Cu', density: 8.96 },
	{ icru: 30, name: 'ZINC', sanitized_name: 'Zn', density: 7.133 },
	{ icru: 31, name: 'GALLIUM', sanitized_name: 'Ga', density: 5.904 },
	{ icru: 32, name: 'GERMANIUM', sanitized_name: 'Ge', density: 5.323 },
	{ icru: 33, name: 'ARSENIC', sanitized_name: 'As', density: 5.73 },
	{ icru: 34, name: 'SELENIUM', sanitized_name: 'Se', density: 4.5 },
	{ icru: 35, name: 'BROMINE', sanitized_name: 'Br', density: 0.00707218 },
	{ icru: 36, name: 'KRYPTON', sanitized_name: 'Kr', density: 0.00347832 },
	{ icru: 37, name: 'RUBIDIUM', sanitized_name: 'Rb', density: 1.532 },
	{ icru: 38, name: 'STRONTIUM', sanitized_name: 'Sr', density: 2.54 },
	{ icru: 39, name: 'YTTRIUM', sanitized_name: 'Y', density: 4.469 },
	{ icru: 40, name: 'ZIRCONIUM', sanitized_name: 'Zr', density: 6.506 },
	{ icru: 41, name: 'NIOBIUM', sanitized_name: 'Nb', density: 8.57 },
	{ icru: 42, name: 'MOLYBDENUM', sanitized_name: 'Mo', density: 10.22 },
	{ icru: 43, name: 'TECHNETIUM', sanitized_name: 'Tc', density: 11.5 },
	{ icru: 44, name: 'RUTHENIUM', sanitized_name: 'Ru', density: 12.41 },
	{ icru: 45, name: 'RHODIUM', sanitized_name: 'Rh', density: 12.41 },
	{ icru: 46, name: 'PALLADIUM', sanitized_name: 'Pd', density: 12.02 },
	{ icru: 47, name: 'SILVER', sanitized_name: 'Ag', density: 10.5 },
	{ icru: 48, name: 'CADMIUM', sanitized_name: 'Cd', density: 8.65 },
	{ icru: 49, name: 'INDIUM', sanitized_name: 'In', density: 7.31 },
	{ icru: 50, name: 'TIN', sanitized_name: 'Sn', density: 7.31 },
	{ icru: 51, name: 'ANTIMONY', sanitized_name: 'Sb', density: 6.691 },
	{ icru: 52, name: 'TELLURIUM', sanitized_name: 'Te', density: 6.24 },
	{ icru: 53, name: 'IODINE', sanitized_name: 'I', density: 4.93 },
	{ icru: 54, name: 'XENON', sanitized_name: 'Xe', density: 0.00548536 },
	{ icru: 55, name: 'CESIUM', sanitized_name: 'Cs', density: 1.873 },
	{ icru: 56, name: 'BARIUM', sanitized_name: 'Ba', density: 3.5 },
	{ icru: 57, name: 'LANTHANUM', sanitized_name: 'La', density: 6.154 },
	{ icru: 58, name: 'CERIUM', sanitized_name: 'Ce', density: 6.657 },
	{ icru: 59, name: 'PRASEODYMIUM', sanitized_name: 'Pr', density: 6.71 },
	{ icru: 60, name: 'NEODYMIUM', sanitized_name: 'Nd', density: 6.9 },
	{ icru: 61, name: 'PROMETHIUM', sanitized_name: 'Pm', density: 7.22 },
	{ icru: 62, name: 'SAMARIUM', sanitized_name: 'Sm', density: 7.46 },
	{ icru: 63, name: 'EUROPIUM', sanitized_name: 'Eu', density: 5.243 },
	{ icru: 64, name: 'GADOLINIUM', sanitized_name: 'Gd', density: 7.9004 },
	{ icru: 65, name: 'TERBIUM', sanitized_name: 'Tb', density: 8.229 },
	{ icru: 66, name: 'DYSPROSIUM', sanitized_name: 'Dy', density: 8.55 },
	{ icru: 67, name: 'HOLMIUM', sanitized_name: 'Ho', density: 8.795 },
	{ icru: 68, name: 'ERBIUM', sanitized_name: 'Er', density: 9.066 },
	{ icru: 69, name: 'THULIUM', sanitized_name: 'Tm', density: 9.321 },
	{ icru: 70, name: 'YTTERBIUM', sanitized_name: 'Yb', density: 6.73 },
	{ icru: 71, name: 'LUTETIUM', sanitized_name: 'Lu', density: 9.84 },
	{ icru: 72, name: 'HAFNIUM', sanitized_name: 'Hf', density: 13.31 },
	{ icru: 73, name: 'TANTALUM', sanitized_name: 'Ta', density: 16.654 },
	{ icru: 74, name: 'TUNGSTEN', sanitized_name: 'W', density: 19.3 },
	{ icru: 75, name: 'RHENIUM', sanitized_name: 'Re', density: 21.02 },
	{ icru: 76, name: 'OSMIUM', sanitized_name: 'Os', density: 22.57 },
	{ icru: 77, name: 'IRIDIUM', sanitized_name: 'Ir', density: 22.42 },
	{ icru: 78, name: 'PLATINUM', sanitized_name: 'Pt', density: 21.45 },
	{ icru: 79, name: 'GOLD', sanitized_name: 'Au', density: 19.32 },
	{ icru: 80, name: 'MERCURY', sanitized_name: 'Hg', density: 13.546 },
	{ icru: 81, name: 'THALLIUM', sanitized_name: 'Tl', density: 11.72 },
	{ icru: 82, name: 'LEAD', sanitized_name: 'Pb', density: 11.35 },
	{ icru: 83, name: 'BISMUTH', sanitized_name: 'Bi', density: 9.747 },
	{ icru: 84, name: 'POLONIUM', sanitized_name: 'Po', density: 9.32 },
	{ icru: 85, name: 'ASTATINE', sanitized_name: 'At', density: 9.32 },
	{ icru: 86, name: 'RADON', sanitized_name: 'Rn', density: 0.00906618 },
	{ icru: 87, name: 'FRANCIUM', sanitized_name: 'Fr', density: 1.0 },
	{ icru: 88, name: 'RADIUM', sanitized_name: 'Ra', density: 5.0 },
	{ icru: 89, name: 'ACTINIUM', sanitized_name: 'Ac', density: 10.07 },
	{ icru: 90, name: 'THORIUM', sanitized_name: 'Th', density: 11.72 },
	{ icru: 91, name: 'PROTACTINIUM', sanitized_name: 'Pa', density: 15.37 },
	{ icru: 92, name: 'URANIUM', sanitized_name: 'U', density: 18.95 },
	{ icru: 93, name: 'NEPTUNIUM', sanitized_name: 'Np', density: 20.25 },
	{ icru: 94, name: 'PLUTONIUM', sanitized_name: 'Pu', density: 19.84 },
	{ icru: 95, name: 'AMERICIUM', sanitized_name: 'Am', density: 13.67 },
	{ icru: 96, name: 'CURIUM', sanitized_name: 'Cm', density: 13.51 },
	{ icru: 97, name: 'BERKELIUM', sanitized_name: 'Bk', density: 14.0 },
	{ icru: 98, name: 'CALIFORNIUM', sanitized_name: 'Cf', density: 10.0 },
	{
		icru: 99,
		name: 'A-150 TISSUE-EQUIVALENT PLASTIC',
		sanitized_name: 'a-150_tissue-equivalent_plastic',
		density: 1.127
	},
	{ icru: 100, name: 'ACETONE', sanitized_name: 'acetone', density: 0.7899 },
	{ icru: 101, name: 'ACETYLENE', sanitized_name: 'acetylene', density: 0.0010967 },
	{ icru: 102, name: 'ADENINE', sanitized_name: 'adenine', density: 1.35 },
	{
		icru: 103,
		name: 'ADIPOSE TISSUE (ICRP)',
		sanitized_name: 'adipose_tissue_icrp',
		density: 0.92
	},
	{
		icru: 104,
		name: 'AIR, DRY (NEAR SEA LEVEL)',
		sanitized_name: 'air_dry_near_sea_level',
		density: 0.00120479
	},
	{ icru: 105, name: 'ALANINE', sanitized_name: 'alanine', density: 1.42 },
	{ icru: 106, name: 'ALUMINUM OXIDE', sanitized_name: 'aluminum_oxide', density: 3.97 },
	{ icru: 107, name: 'AMBER', sanitized_name: 'amber', density: 1.1 },
	{ icru: 108, name: 'AMMONIA', sanitized_name: 'ammonia', density: 0.000826019 },
	{ icru: 109, name: 'ANILINE', sanitized_name: 'aniline', density: 1.0235 },
	{ icru: 110, name: 'ANTHRACENE', sanitized_name: 'anthracene', density: 1.283 },
	{ icru: 111, name: 'B100', sanitized_name: 'b100', density: 1.45 },
	{ icru: 112, name: 'BAKELITE', sanitized_name: 'bakelite', density: 1.25 },
	{ icru: 113, name: 'BARIUM FLUORIDE', sanitized_name: 'barium_fluoride', density: 4.89 },
	{ icru: 114, name: 'BARIUM SULFATE', sanitized_name: 'barium_sulfate', density: 4.5 },
	{ icru: 115, name: 'BENZENE', sanitized_name: 'benzene', density: 0.87865 },
	{ icru: 116, name: 'BERYLLIUM OXIDE', sanitized_name: 'beryllium_oxide', density: 3.01 },
	{
		icru: 117,
		name: 'BISMUTH GERMANIUM OXIDE',
		sanitized_name: 'bismuth_germanium_oxide',
		density: 7.13
	},
	{ icru: 118, name: 'BLOOD (ICRP)', sanitized_name: 'blood_icrp', density: 1.06 },
	{ icru: 119, name: 'BONE, COMPACT (ICRU)', sanitized_name: 'bone_compact_icru', density: 1.85 },
	{
		icru: 120,
		name: 'BONE, CORTICAL (ICRP)',
		sanitized_name: 'bone_cortical_icrp',
		density: 1.85
	},
	{ icru: 121, name: 'BORON CARBIDE', sanitized_name: 'boron_carbide', density: 2.52 },
	{ icru: 122, name: 'BORON OXIDE', sanitized_name: 'boron_oxide', density: 1.812 },
	{ icru: 123, name: 'BRAIN (ICRP)', sanitized_name: 'brain_icrp', density: 1.03 },
	{ icru: 124, name: 'BUTANE', sanitized_name: 'butane', density: 0.00249343 },
	{ icru: 125, name: 'N-BUTYLALCOHOL', sanitized_name: 'n-butylalcohol', density: 0.8098 },
	{
		icru: 126,
		name: 'C-552 AIR-EQUIVALENT PLASTIC',
		sanitized_name: 'c-552_air-equivalent_plastic',
		density: 1.76
	},
	{ icru: 127, name: 'CADMIUM TELLURIDE', sanitized_name: 'cadmium_telluride', density: 6.2 },
	{ icru: 128, name: 'CADMIUM TUNGSTATE', sanitized_name: 'cadmium_tungstate', density: 7.9 },
	{ icru: 129, name: 'CALCIUM CARBONATE', sanitized_name: 'calcium_carbonate', density: 2.8 },
	{ icru: 130, name: 'CALCIUM FLUORIDE', sanitized_name: 'calcium_fluoride', density: 3.18 },
	{ icru: 131, name: 'CALCIUM OXIDE', sanitized_name: 'calcium_oxide', density: 3.3 },
	{ icru: 132, name: 'CALCIUM SULFATE', sanitized_name: 'calcium_sulfate', density: 2.96 },
	{ icru: 133, name: 'CALCIUM TUNGSTATE', sanitized_name: 'calcium_tungstate', density: 6.062 },
	{ icru: 134, name: 'CARBON DIOXIDE', sanitized_name: 'carbon_dioxide', density: 0.00184212 },
	{
		icru: 135,
		name: 'CARBON TETRACHLORIDE',
		sanitized_name: 'carbon_tetrachloride',
		density: 1.594
	},
	{
		icru: 136,
		name: 'CELLULOSE ACETATE, CELLOPHANE',
		sanitized_name: 'cellulose_acetate_cellophane',
		density: 1.42
	},
	{
		icru: 137,
		name: 'CELLULOSE ACETATE BUTYRATE',
		sanitized_name: 'cellulose_acetate_butyrate',
		density: 1.2
	},
	{ icru: 138, name: 'CELLULOSE NITRATE', sanitized_name: 'cellulose_nitrate', density: 1.49 },
	{
		icru: 139,
		name: 'CERIC SULFATE DOSIMETER SOLUTION',
		sanitized_name: 'ceric_sulfate_dosimeter_solution',
		density: 1.03
	},
	{ icru: 140, name: 'CESIUM FLUORIDE', sanitized_name: 'cesium_fluoride', density: 4.115 },
	{ icru: 141, name: 'CESIUM IODIDE', sanitized_name: 'cesium_iodide', density: 4.51 },
	{ icru: 142, name: 'CHLOROBENZENE', sanitized_name: 'chlorobenzene', density: 1.1058 },
	{ icru: 143, name: 'CHLOROFORM', sanitized_name: 'chloroform', density: 1.4832 },
	{ icru: 144, name: 'CONCRETE PORTLAND', sanitized_name: 'concrete_portland', density: 2.3 },
	{ icru: 145, name: 'CYCLOHEXANE', sanitized_name: 'cyclohexane', density: 0.779 },
	{
		icru: 146,
		name: '1,2-DICHLOROBENZENE',
		sanitized_name: '12-dichlorobenzene',
		density: 1.3048
	},
	{
		icru: 147,
		name: 'DICHLORODIETHYL ETHER',
		sanitized_name: 'dichlorodiethyl_ether',
		density: 1.2199
	},
	{ icru: 148, name: 'DICHLOROETHANE', sanitized_name: 'dichloroethane', density: 1.2351 },
	{ icru: 149, name: 'DIETHYLETHER', sanitized_name: 'diethylether', density: 0.71378 },
	{
		icru: 150,
		name: 'N,N-DIMETHYL FORMAMIDE',
		sanitized_name: 'nn-dimethyl_formamide',
		density: 0.9487
	},
	{ icru: 151, name: 'DIMETHYLSULFOXIDE', sanitized_name: 'dimethylsulfoxide', density: 1.1014 },
	{ icru: 152, name: 'ETHANE', sanitized_name: 'ethane', density: 0.00125324 },
	{ icru: 153, name: 'ETHYL ALCOHOL', sanitized_name: 'ethyl_alcohol', density: 0.7893 },
	{ icru: 154, name: 'ETHYL CELLULOSE', sanitized_name: 'ethyl_cellulose', density: 1.13 },
	{ icru: 155, name: 'ETHYLENE', sanitized_name: 'ethylene', density: 0.00117497 },
	{ icru: 156, name: 'EYELENS (ICRP)', sanitized_name: 'eyelens_icrp', density: 1.1 },
	{ icru: 157, name: 'FERRIC OXIDE', sanitized_name: 'ferric_oxide', density: 5.2 },
	{ icru: 158, name: 'FERRO BORIDE', sanitized_name: 'ferro_boride', density: 7.15 },
	{ icru: 159, name: 'FERROUS OXIDE', sanitized_name: 'ferrous_oxide', density: 7.15 },
	{
		icru: 160,
		name: 'FERROUS SULFATE DOSIMETER SOLUTION',
		sanitized_name: 'ferrous_sulfate_dosimeter_solution',
		density: 1.024
	},
	{ icru: 161, name: 'FREON-12', sanitized_name: 'freon-12', density: 1.12 },
	{ icru: 162, name: 'FREON-12B2', sanitized_name: 'freon-12b2', density: 1.8 },
	{ icru: 163, name: 'FREON-13', sanitized_name: 'freon-13', density: 0.95 },
	{ icru: 164, name: 'FREON-13B1', sanitized_name: 'freon-13b1', density: 1.5 },
	{ icru: 165, name: 'FREON-13I1', sanitized_name: 'freon-13i1', density: 1.8 },
	{
		icru: 166,
		name: 'GADOLINIUM OXYSULFIDE',
		sanitized_name: 'gadolinium_oxysulfide',
		density: 7.44
	},
	{ icru: 167, name: 'GALLIUM ARSENIDE', sanitized_name: 'gallium_arsenide', density: 5.31 },
	{
		icru: 168,
		name: 'GEL IN PHOTOGRAPHIC EMULSION',
		sanitized_name: 'gel_in_photographic_emulsion',
		density: 1.2914
	},
	{ icru: 169, name: 'GLASS, PYREX', sanitized_name: 'glass_pyrex', density: 6.22 },
	{ icru: 170, name: 'GLASS, LEAD', sanitized_name: 'glass_lead', density: 2.4 },
	{ icru: 171, name: 'GLASS, PLATE', sanitized_name: 'glass_plate', density: 2.23 },
	{ icru: 172, name: 'GLUCOSE', sanitized_name: 'glucose', density: 1.54 },
	{ icru: 173, name: 'GLUTAMINE', sanitized_name: 'glutamine', density: 1.46 },
	{ icru: 174, name: 'GLYCEROL', sanitized_name: 'glycerol', density: 1.2613 },
	{ icru: 175, name: 'GUANINE', sanitized_name: 'guanine', density: 1.58 },
	{
		icru: 176,
		name: 'GYPSUM / PLASTER OF PARIS',
		sanitized_name: 'gypsum_plaster_of_paris',
		density: 2.32
	},
	{ icru: 177, name: 'N-HEPTANE', sanitized_name: 'n-heptane', density: 0.68376 },
	{ icru: 178, name: 'N-HEXANE', sanitized_name: 'n-hexane', density: 0.6603 },
	{
		icru: 179,
		name: 'KAPTON POLYIMIDE FILM',
		sanitized_name: 'kapton_polyimide_film',
		density: 1.42
	},
	{
		icru: 180,
		name: 'LANTHANUM OXYBROMIDE',
		sanitized_name: 'lanthanum_oxybromide',
		density: 6.28
	},
	{
		icru: 181,
		name: 'LANTHANUM OXYSULFIDE',
		sanitized_name: 'lanthanum_oxysulfide',
		density: 5.86
	},
	{ icru: 182, name: 'LEADOXIDE', sanitized_name: 'leadoxide', density: 9.53 },
	{ icru: 183, name: 'LITHIUM AMIDE', sanitized_name: 'lithium_amide', density: 1.178 },
	{ icru: 184, name: 'LITHIUM CARBONATE', sanitized_name: 'lithium_carbonate', density: 2.11 },
	{ icru: 185, name: 'LITHIUM FLUORIDE', sanitized_name: 'lithium_fluoride', density: 2.635 },
	{ icru: 186, name: 'LITHIUM HYDRIDE', sanitized_name: 'lithium_hydride', density: 0.82 },
	{ icru: 187, name: 'LITHIUM IODIDE', sanitized_name: 'lithium_iodide', density: 3.494 },
	{ icru: 188, name: 'LITHIUM OXIDE', sanitized_name: 'lithium_oxide', density: 2.013 },
	{
		icru: 189,
		name: 'LITHIUM TETRABORATE',
		sanitized_name: 'lithium_tetraborate',
		density: 2.44
	},
	{ icru: 190, name: 'LUNG (ICRP)', sanitized_name: 'lung_icrp', density: 1.05 },
	{ icru: 191, name: 'M3 WAX', sanitized_name: 'm3_wax', density: 1.05 },
	{
		icru: 192,
		name: 'MAGNESIUM CARBONATE',
		sanitized_name: 'magnesium_carbonate',
		density: 2.958
	},
	{ icru: 193, name: 'MAGNESIUM FLUORIDE', sanitized_name: 'magnesium_fluoride', density: 3.0 },
	{ icru: 194, name: 'MAGNESIUM OXIDE', sanitized_name: 'magnesium_oxide', density: 3.58 },
	{
		icru: 195,
		name: 'MAGNESIUM TETRABORATE',
		sanitized_name: 'magnesium_tetraborate',
		density: 2.53
	},
	{ icru: 196, name: 'MERCURIC IODIDE', sanitized_name: 'mercuric_iodide', density: 6.36 },
	{ icru: 197, name: 'METHANE', sanitized_name: 'methane', density: 0.000667151 },
	{ icru: 198, name: 'METHANOL', sanitized_name: 'methanol', density: 0.7914 },
	{ icru: 199, name: 'MIX D WAX', sanitized_name: 'mix_d_wax', density: 0.99 },
	{
		icru: 200,
		name: 'MS20 TISSUE SUBSTITUTE',
		sanitized_name: 'ms20_tissue_substitute',
		density: 1.0
	},
	{
		icru: 201,
		name: 'MUSCLE, SKELETAL (ICRP)',
		sanitized_name: 'muscle_skeletal_icrp',
		density: 1.04
	},
	{
		icru: 202,
		name: 'MUSCLE, STRIATED (ICRU)',
		sanitized_name: 'muscle_striated_icru',
		density: 1.04
	},
	{
		icru: 203,
		name: 'MUSCLE EQUIVALENT LIQUID, WITH SUCROSE',
		sanitized_name: 'muscle_equivalent_liquid_with_sucrose',
		density: 1.11
	},
	{
		icru: 204,
		name: 'MUSCLE EQUIVALENT LIQUID, NO SUCROSE',
		sanitized_name: 'muscle_equivalent_liquid_no_sucrose',
		density: 1.07
	},
	{ icru: 205, name: 'NAPHTHALENE', sanitized_name: 'naphthalene', density: 1.145 },
	{ icru: 206, name: 'NITROBENZENE', sanitized_name: 'nitrobenzene', density: 1.19867 },
	{ icru: 207, name: 'NITROUS OXIDE', sanitized_name: 'nitrous_oxide', density: 0.00183094 },
	{
		icru: 208,
		name: 'NYLON, DU PONT ELVAMIDE 8062',
		sanitized_name: 'nylon_du_pont_elvamide_8062',
		density: 1.08
	},
	{
		icru: 209,
		name: 'NYLON, TYPE 6 AND 6/6',
		sanitized_name: 'nylon_type_6_and_6by6',
		density: 1.14
	},
	{ icru: 210, name: 'NYLON, TYPE 6/10', sanitized_name: 'nylon_type_6by10', density: 1.14 },
	{
		icru: 211,
		name: 'NYLON, TYPE 11 (RILSAN)',
		sanitized_name: 'nylon_type_11_rilsan',
		density: 1.425
	},
	{ icru: 212, name: 'OCTANE, LIQUID', sanitized_name: 'octane_liquid', density: 0.7026 },
	{ icru: 213, name: 'PARAFFINWAX', sanitized_name: 'paraffinwax', density: 0.93 },
	{ icru: 214, name: 'N-PENTANE', sanitized_name: 'n-pentane', density: 0.6262 },
	{
		icru: 215,
		name: 'PHOTOGRAPHIC EMULSION',
		sanitized_name: 'photographic_emulsion',
		density: 3.815
	},
	{
		icru: 216,
		name: 'PLASTIC SCINTILLATOR (VINYLTOLUENE BASED)',
		sanitized_name: 'plastic_scintillator_vinyltoluene_based',
		density: 1.032
	},
	{ icru: 217, name: 'PLUTONIUM DIOXIDE', sanitized_name: 'plutonium_dioxide', density: 11.46 },
	{ icru: 218, name: 'POLYACRYLONITRILE', sanitized_name: 'polyacrylonitrile', density: 1.17 },
	{
		icru: 219,
		name: 'POLYCARBONATE (MAKROLON, LEXAN)',
		sanitized_name: 'polycarbonate_makrolon_lexan',
		density: 1.2
	},
	{ icru: 220, name: 'POLYCHLOROSTYRENE', sanitized_name: 'polychlorostyrene', density: 1.3 },
	{ icru: 221, name: 'POLYETHYLENE', sanitized_name: 'polyethylene', density: 0.94 },
	{
		icru: 222,
		name: 'POLYETHYLENE TEREPHTHALATE (MYLAR)',
		sanitized_name: 'polyethylene_terephthalate_mylar',
		density: 1.4
	},
	{
		icru: 223,
		name: 'POLYMETHYL METHACRALATE (LUCITE, PERSPEX, PMMA)',
		sanitized_name: 'polymethyl_methacralate_lucite_perspex_pmma',
		density: 1.19
	},
	{ icru: 224, name: 'POLYOXYMETHYLENE', sanitized_name: 'polyoxymethylene', density: 1.425 },
	{ icru: 225, name: 'POLYPROPYLENE', sanitized_name: 'polypropylene', density: 0.9 },
	{ icru: 226, name: 'POLYSTYRENE', sanitized_name: 'polystyrene', density: 1.06 },
	{
		icru: 227,
		name: 'POLYTETRAFLUOROETHYLENE (TEFLON)',
		sanitized_name: 'polytetrafluoroethylene_teflon',
		density: 2.2
	},
	{
		icru: 228,
		name: 'POLYTRIFLUOROCHLOROETHYLENE',
		sanitized_name: 'polytrifluorochloroethylene',
		density: 2.1
	},
	{ icru: 229, name: 'POLYVINYL ACETATE', sanitized_name: 'polyvinyl_acetate', density: 1.19 },
	{ icru: 230, name: 'POLYVINYL ALCOHOL', sanitized_name: 'polyvinyl_alcohol', density: 1.3 },
	{ icru: 231, name: 'POLYVINYL BUTYRAL', sanitized_name: 'polyvinyl_butyral', density: 1.12 },
	{ icru: 232, name: 'POLYVINYL CHLORIDE', sanitized_name: 'polyvinyl_chloride', density: 1.3 },
	{ icru: 233, name: 'SARAN', sanitized_name: 'saran', density: 1.7 },
	{
		icru: 234,
		name: 'POLYVINYLIDENE FLUORIDE',
		sanitized_name: 'polyvinylidene_fluoride',
		density: 1.76
	},
	{
		icru: 235,
		name: 'POLYVINYLPYRROLIDONE',
		sanitized_name: 'polyvinylpyrrolidone',
		density: 1.25
	},
	{ icru: 236, name: 'POTASSIUM IODIDE', sanitized_name: 'potassium_iodide', density: 3.13 },
	{ icru: 237, name: 'POTASSIUM OXIDE', sanitized_name: 'potassium_oxide', density: 2.32 },
	{ icru: 238, name: 'PROPANE', sanitized_name: 'propane', density: 0.00187939 },
	{ icru: 239, name: 'PROPANE, LIQUID', sanitized_name: 'propane_liquid', density: 0.43 },
	{ icru: 240, name: 'N-PROPYL ALCOHOL', sanitized_name: 'n-propyl_alcohol', density: 0.8035 },
	{ icru: 241, name: 'PYRIDINE', sanitized_name: 'pyridine', density: 0.9819 },
	{ icru: 242, name: 'RUBBER, BUTYL', sanitized_name: 'rubber_butyl', density: 0.92 },
	{ icru: 243, name: 'RUBBER, NATURAL', sanitized_name: 'rubber_natural', density: 0.92 },
	{ icru: 244, name: 'RUBBER, NEOPRENE', sanitized_name: 'rubber_neoprene', density: 1.23 },
	{ icru: 245, name: 'SILICON DIOXIDE', sanitized_name: 'silicon_dioxide', density: 2.32 },
	{ icru: 246, name: 'SILVER BROMIDE', sanitized_name: 'silver_bromide', density: 6.473 },
	{ icru: 247, name: 'SILVER CHLORIDE', sanitized_name: 'silver_chloride', density: 5.56 },
	{
		icru: 248,
		name: 'SILVER HALIDES IN PHOTOGRAPHIC EMULSION',
		sanitized_name: 'silver_halides_in_photographic_emulsion',
		density: 6.47
	},
	{ icru: 249, name: 'SILVER IODIDE', sanitized_name: 'silver_iodide', density: 6.01 },
	{ icru: 250, name: 'SKIN (ICRP)', sanitized_name: 'skin_icrp', density: 1.1 },
	{ icru: 251, name: 'SODIUM CARBONATE', sanitized_name: 'sodium_carbonate', density: 2.532 },
	{ icru: 252, name: 'SODIUM IODIDE', sanitized_name: 'sodium_iodide', density: 3.667 },
	{ icru: 253, name: 'SODIUM MONOXIDE', sanitized_name: 'sodium_monoxide', density: 2.27 },
	{ icru: 254, name: 'SODIUM NITRATE', sanitized_name: 'sodium_nitrate', density: 2.261 },
	{ icru: 255, name: 'STILBENE', sanitized_name: 'stilbene', density: 0.9707 },
	{ icru: 256, name: 'SUCROSE', sanitized_name: 'sucrose', density: 1.5805 },
	{ icru: 257, name: 'TERPHENYL', sanitized_name: 'terphenyl', density: 1.234 },
	{ icru: 258, name: 'TESTES (ICRP)', sanitized_name: 'testes_icrp', density: 1.04 },
	{
		icru: 259,
		name: 'TETRACHLOROETHYLENE',
		sanitized_name: 'tetrachloroethylene',
		density: 1.625
	},
	{ icru: 260, name: 'THALLIUM CHLORIDE', sanitized_name: 'thallium_chloride', density: 7.004 },
	{ icru: 261, name: 'TISSUE, SOFT (ICRP)', sanitized_name: 'tissue_soft_icrp', density: 1.0 },
	{
		icru: 262,
		name: 'TISSUE, SOFT (ICRU, FOUR COMPONENT)',
		sanitized_name: 'tissue_soft_icru_four_component',
		density: 1.0
	},
	{
		icru: 263,
		name: 'TISSUE-EQUIVALENT GAS (METHANE BASED)',
		sanitized_name: 'tissue-equivalent_gas_methane_based',
		density: 0.00106409
	},
	{
		icru: 264,
		name: 'TISSUE-EQUIVALENT GAS (PROPANE BASED)',
		sanitized_name: 'tissue-equivalent_gas_propane_based',
		density: 0.00182628
	},
	{ icru: 265, name: 'TITANIUM DIOXIDE', sanitized_name: 'titanium_dioxide', density: 4.26 },
	{ icru: 266, name: 'TOLUENE', sanitized_name: 'toluene', density: 0.8669 },
	{ icru: 267, name: 'TRICHLOROETHYLENE', sanitized_name: 'trichloroethylene', density: 1.46 },
	{ icru: 268, name: 'TRIETHYL PHOSPHATE', sanitized_name: 'triethyl_phosphate', density: 1.07 },
	{
		icru: 269,
		name: 'TUNGSTEN HEXAFLUORIDE',
		sanitized_name: 'tungsten_hexafluoride',
		density: 2.4
	},
	{ icru: 270, name: 'URANIUM DICARBIDE', sanitized_name: 'uranium_dicarbide', density: 11.28 },
	{
		icru: 271,
		name: 'URANIUM MONOCARBIDE',
		sanitized_name: 'uranium_monocarbide',
		density: 13.63
	},
	{ icru: 272, name: 'URANIUM OXIDE', sanitized_name: 'uranium_oxide', density: 10.96 },
	{ icru: 273, name: 'UREA', sanitized_name: 'urea', density: 1.323 },
	{ icru: 274, name: 'VALINE', sanitized_name: 'valine', density: 1.23 },
	{
		icru: 275,
		name: 'VITON FLUOROELASTOMER',
		sanitized_name: 'viton_fluoroelastomer',
		density: 1.8
	},
	{ icru: 276, name: 'WATER, LIQUID', sanitized_name: 'water_liquid', density: 1.0 },
	{ icru: 277, name: 'WATER VAPOR', sanitized_name: 'water_vapor', density: 0.000756182 },
	{ icru: 278, name: 'XYLENE', sanitized_name: 'xylene', density: 0.87 }
] as const;
