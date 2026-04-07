/**
 * List of particles supported by each simulator.
 * SHIELD-HIT and FLUKA share most of the types,
 * while Geant4 has separate list due to how the simulator is integrated.
 */

export interface Particle {
	id: number;
	name: string;
	a?: number;
	z?: number;
	isMostAbundant?: boolean;
}

// all isotopes with the most abundant one marked for each element.
export const HEAVY_ION_LIST = [
	{ id: 25, name: 'H-1', a: 1, z: 1, isMostAbundant: true },
	{ id: 25, name: 'H-2', a: 2, z: 1 },
	{ id: 25, name: 'He-3', a: 3, z: 2 },
	{ id: 25, name: 'He-4', a: 4, z: 2, isMostAbundant: true },
	{ id: 25, name: 'Li-6', a: 6, z: 3 },
	{ id: 25, name: 'Li-7', a: 7, z: 3, isMostAbundant: true },
	{ id: 25, name: 'Be-9', a: 9, z: 4, isMostAbundant: true },
	{ id: 25, name: 'B-10', a: 10, z: 5 },
	{ id: 25, name: 'B-11', a: 11, z: 5, isMostAbundant: true },
	{ id: 25, name: 'C-12', a: 12, z: 6, isMostAbundant: true },
	{ id: 25, name: 'C-13', a: 13, z: 6 },
	{ id: 25, name: 'N-14', a: 14, z: 7, isMostAbundant: true },
	{ id: 25, name: 'N-15', a: 15, z: 7 },
	{ id: 25, name: 'O-16', a: 16, z: 8, isMostAbundant: true },
	{ id: 25, name: 'O-17', a: 17, z: 8 },
	{ id: 25, name: 'O-18', a: 18, z: 8 },
	{ id: 25, name: 'F-19', a: 19, z: 9, isMostAbundant: true },
	{ id: 25, name: 'Ne-20', a: 20, z: 10, isMostAbundant: true },
	{ id: 25, name: 'Ne-21', a: 21, z: 10 },
	{ id: 25, name: 'Ne-22', a: 22, z: 10 },
	{ id: 25, name: 'Na-23', a: 23, z: 11, isMostAbundant: true },
	{ id: 25, name: 'Mg-24', a: 24, z: 12, isMostAbundant: true },
	{ id: 25, name: 'Mg-25', a: 25, z: 12 },
	{ id: 25, name: 'Mg-26', a: 26, z: 12 },
	{ id: 25, name: 'Al-27', a: 27, z: 13, isMostAbundant: true },
	{ id: 25, name: 'Si-28', a: 28, z: 14, isMostAbundant: true },
	{ id: 25, name: 'Si-29', a: 29, z: 14 },
	{ id: 25, name: 'Si-30', a: 30, z: 14 },
	{ id: 25, name: 'P-31', a: 31, z: 15, isMostAbundant: true },
	{ id: 25, name: 'S-32', a: 32, z: 16, isMostAbundant: true },
	{ id: 25, name: 'S-33', a: 33, z: 16 },
	{ id: 25, name: 'S-34', a: 34, z: 16 },
	{ id: 25, name: 'S-36', a: 36, z: 16 },
	{ id: 25, name: 'Cl-35', a: 35, z: 17, isMostAbundant: true },
	{ id: 25, name: 'Cl-37', a: 37, z: 17 },
	{ id: 25, name: 'Ar-36', a: 36, z: 18 },
	{ id: 25, name: 'Ar-38', a: 38, z: 18 },
	{ id: 25, name: 'Ar-40', a: 40, z: 18, isMostAbundant: true },
	{ id: 25, name: 'K-39', a: 39, z: 19, isMostAbundant: true },
	{ id: 25, name: 'K-40', a: 40, z: 19 },
	{ id: 25, name: 'K-41', a: 41, z: 19 },
	{ id: 25, name: 'Ca-40', a: 40, z: 20, isMostAbundant: true },
	{ id: 25, name: 'Ca-42', a: 42, z: 20 },
	{ id: 25, name: 'Ca-43', a: 43, z: 20 },
	{ id: 25, name: 'Ca-44', a: 44, z: 20 },
	{ id: 25, name: 'Ca-46', a: 46, z: 20 },
	{ id: 25, name: 'Ca-48', a: 48, z: 20 },
	{ id: 25, name: 'Sc-45', a: 45, z: 21, isMostAbundant: true },
	{ id: 25, name: 'Ti-46', a: 46, z: 22 },
	{ id: 25, name: 'Ti-47', a: 47, z: 22 },
	{ id: 25, name: 'Ti-48', a: 48, z: 22, isMostAbundant: true },
	{ id: 25, name: 'Ti-49', a: 49, z: 22 },
	{ id: 25, name: 'Ti-50', a: 50, z: 22 },
	{ id: 25, name: 'V-50', a: 50, z: 23 },
	{ id: 25, name: 'V-51', a: 51, z: 23, isMostAbundant: true },
	{ id: 25, name: 'Cr-50', a: 50, z: 24 },
	{ id: 25, name: 'Cr-52', a: 52, z: 24, isMostAbundant: true },
	{ id: 25, name: 'Cr-53', a: 53, z: 24 },
	{ id: 25, name: 'Cr-54', a: 54, z: 24 },
	{ id: 25, name: 'Mn-55', a: 55, z: 25, isMostAbundant: true },
	{ id: 25, name: 'Fe-54', a: 54, z: 26 },
	{ id: 25, name: 'Fe-56', a: 56, z: 26, isMostAbundant: true },
	{ id: 25, name: 'Fe-57', a: 57, z: 26 },
	{ id: 25, name: 'Fe-58', a: 58, z: 26 },
	{ id: 25, name: 'Co-59', a: 59, z: 27, isMostAbundant: true },
	{ id: 25, name: 'Ni-58', a: 58, z: 28, isMostAbundant: true },
	{ id: 25, name: 'Ni-60', a: 60, z: 28 },
	{ id: 25, name: 'Ni-61', a: 61, z: 28 },
	{ id: 25, name: 'Ni-62', a: 62, z: 28 },
	{ id: 25, name: 'Ni-64', a: 64, z: 28 },
	{ id: 25, name: 'Cu-63', a: 63, z: 29, isMostAbundant: true },
	{ id: 25, name: 'Cu-65', a: 65, z: 29 },
	{ id: 25, name: 'Zn-64', a: 64, z: 30, isMostAbundant: true },
	{ id: 25, name: 'Zn-66', a: 66, z: 30 },
	{ id: 25, name: 'Zn-67', a: 67, z: 30 },
	{ id: 25, name: 'Zn-68', a: 68, z: 30 },
	{ id: 25, name: 'Zn-70', a: 70, z: 30 },
	{ id: 25, name: 'Ga-69', a: 69, z: 31, isMostAbundant: true },
	{ id: 25, name: 'Ga-71', a: 71, z: 31 },
	{ id: 25, name: 'Ge-70', a: 70, z: 32 },
	{ id: 25, name: 'Ge-72', a: 72, z: 32 },
	{ id: 25, name: 'Ge-73', a: 73, z: 32 },
	{ id: 25, name: 'Ge-74', a: 74, z: 32, isMostAbundant: true },
	{ id: 25, name: 'Ge-76', a: 76, z: 32 },
	{ id: 25, name: 'As-75', a: 75, z: 33, isMostAbundant: true },
	{ id: 25, name: 'Se-74', a: 74, z: 34 },
	{ id: 25, name: 'Se-76', a: 76, z: 34 },
	{ id: 25, name: 'Se-77', a: 77, z: 34 },
	{ id: 25, name: 'Se-78', a: 78, z: 34 },
	{ id: 25, name: 'Se-80', a: 80, z: 34, isMostAbundant: true },
	{ id: 25, name: 'Se-82', a: 82, z: 34 },
	{ id: 25, name: 'Br-79', a: 79, z: 35, isMostAbundant: true },
	{ id: 25, name: 'Br-81', a: 81, z: 35 },
	{ id: 25, name: 'Kr-78', a: 78, z: 36 },
	{ id: 25, name: 'Kr-80', a: 80, z: 36 },
	{ id: 25, name: 'Kr-82', a: 82, z: 36 },
	{ id: 25, name: 'Kr-83', a: 83, z: 36 },
	{ id: 25, name: 'Kr-84', a: 84, z: 36, isMostAbundant: true },
	{ id: 25, name: 'Kr-86', a: 86, z: 36 },
	{ id: 25, name: 'Rb-85', a: 85, z: 37, isMostAbundant: true },
	{ id: 25, name: 'Rb-87', a: 87, z: 37 },
	{ id: 25, name: 'Sr-84', a: 84, z: 38 },
	{ id: 25, name: 'Sr-86', a: 86, z: 38 },
	{ id: 25, name: 'Sr-87', a: 87, z: 38 },
	{ id: 25, name: 'Sr-88', a: 88, z: 38, isMostAbundant: true },
	{ id: 25, name: 'Y-89', a: 89, z: 39, isMostAbundant: true },
	{ id: 25, name: 'Zr-90', a: 90, z: 40, isMostAbundant: true },
	{ id: 25, name: 'Zr-91', a: 91, z: 40 },
	{ id: 25, name: 'Zr-92', a: 92, z: 40 },
	{ id: 25, name: 'Zr-94', a: 94, z: 40 },
	{ id: 25, name: 'Zr-96', a: 96, z: 40 },
	{ id: 25, name: 'Nb-93', a: 93, z: 41, isMostAbundant: true },
	{ id: 25, name: 'Mo-92', a: 92, z: 42 },
	{ id: 25, name: 'Mo-94', a: 94, z: 42 },
	{ id: 25, name: 'Mo-95', a: 95, z: 42 },
	{ id: 25, name: 'Mo-96', a: 96, z: 42 },
	{ id: 25, name: 'Mo-97', a: 97, z: 42 },
	{ id: 25, name: 'Mo-98', a: 98, z: 42, isMostAbundant: true },
	{ id: 25, name: 'Mo-100', a: 100, z: 42 },
	{ id: 25, name: 'Ru-96', a: 96, z: 44 },
	{ id: 25, name: 'Ru-98', a: 98, z: 44 },
	{ id: 25, name: 'Ru-99', a: 99, z: 44 },
	{ id: 25, name: 'Ru-100', a: 100, z: 44 },
	{ id: 25, name: 'Ru-101', a: 101, z: 44 },
	{ id: 25, name: 'Ru-102', a: 102, z: 44, isMostAbundant: true },
	{ id: 25, name: 'Ru-104', a: 104, z: 44 },
	{ id: 25, name: 'Rh-103', a: 103, z: 45, isMostAbundant: true },
	{ id: 25, name: 'Pd-102', a: 102, z: 46 },
	{ id: 25, name: 'Pd-104', a: 104, z: 46 },
	{ id: 25, name: 'Pd-105', a: 105, z: 46 },
	{ id: 25, name: 'Pd-106', a: 106, z: 46, isMostAbundant: true },
	{ id: 25, name: 'Pd-108', a: 108, z: 46 },
	{ id: 25, name: 'Pd-110', a: 110, z: 46 },
	{ id: 25, name: 'Ag-107', a: 107, z: 47, isMostAbundant: true },
	{ id: 25, name: 'Ag-109', a: 109, z: 47 },
	{ id: 25, name: 'Cd-106', a: 106, z: 48 },
	{ id: 25, name: 'Cd-108', a: 108, z: 48 },
	{ id: 25, name: 'Cd-110', a: 110, z: 48 },
	{ id: 25, name: 'Cd-111', a: 111, z: 48 },
	{ id: 25, name: 'Cd-112', a: 112, z: 48 },
	{ id: 25, name: 'Cd-113', a: 113, z: 48 },
	{ id: 25, name: 'Cd-114', a: 114, z: 48, isMostAbundant: true },
	{ id: 25, name: 'Cd-116', a: 116, z: 48 },
	{ id: 25, name: 'In-113', a: 113, z: 49 },
	{ id: 25, name: 'In-115', a: 115, z: 49, isMostAbundant: true },
	{ id: 25, name: 'Sn-112', a: 112, z: 50 },
	{ id: 25, name: 'Sn-114', a: 114, z: 50 },
	{ id: 25, name: 'Sn-115', a: 115, z: 50 },
	{ id: 25, name: 'Sn-116', a: 116, z: 50 },
	{ id: 25, name: 'Sn-117', a: 117, z: 50 },
	{ id: 25, name: 'Sn-118', a: 118, z: 50 },
	{ id: 25, name: 'Sn-119', a: 119, z: 50 },
	{ id: 25, name: 'Sn-120', a: 120, z: 50, isMostAbundant: true },
	{ id: 25, name: 'Sn-122', a: 122, z: 50 },
	{ id: 25, name: 'Sn-124', a: 124, z: 50 },
	{ id: 25, name: 'Sb-121', a: 121, z: 51, isMostAbundant: true },
	{ id: 25, name: 'Sb-123', a: 123, z: 51 },
	{ id: 25, name: 'Te-120', a: 120, z: 52 },
	{ id: 25, name: 'Te-122', a: 122, z: 52 },
	{ id: 25, name: 'Te-123', a: 123, z: 52 },
	{ id: 25, name: 'Te-124', a: 124, z: 52 },
	{ id: 25, name: 'Te-125', a: 125, z: 52 },
	{ id: 25, name: 'Te-126', a: 126, z: 52 },
	{ id: 25, name: 'Te-128', a: 128, z: 52 },
	{ id: 25, name: 'Te-130', a: 130, z: 52, isMostAbundant: true },
	{ id: 25, name: 'I-127', a: 127, z: 53, isMostAbundant: true },
	{ id: 25, name: 'Xe-124', a: 124, z: 54 },
	{ id: 25, name: 'Xe-126', a: 126, z: 54 },
	{ id: 25, name: 'Xe-128', a: 128, z: 54 },
	{ id: 25, name: 'Xe-129', a: 129, z: 54 },
	{ id: 25, name: 'Xe-130', a: 130, z: 54 },
	{ id: 25, name: 'Xe-131', a: 131, z: 54 },
	{ id: 25, name: 'Xe-132', a: 132, z: 54, isMostAbundant: true },
	{ id: 25, name: 'Xe-134', a: 134, z: 54 },
	{ id: 25, name: 'Xe-136', a: 136, z: 54 },
	{ id: 25, name: 'Cs-133', a: 133, z: 55, isMostAbundant: true },
	{ id: 25, name: 'Ba-130', a: 130, z: 56 },
	{ id: 25, name: 'Ba-132', a: 132, z: 56 },
	{ id: 25, name: 'Ba-134', a: 134, z: 56 },
	{ id: 25, name: 'Ba-135', a: 135, z: 56 },
	{ id: 25, name: 'Ba-136', a: 136, z: 56 },
	{ id: 25, name: 'Ba-137', a: 137, z: 56 },
	{ id: 25, name: 'Ba-138', a: 138, z: 56, isMostAbundant: true },
	{ id: 25, name: 'La-138', a: 138, z: 57 },
	{ id: 25, name: 'La-139', a: 139, z: 57, isMostAbundant: true },
	{ id: 25, name: 'Ce-136', a: 136, z: 58 },
	{ id: 25, name: 'Ce-138', a: 138, z: 58 },
	{ id: 25, name: 'Ce-140', a: 140, z: 58, isMostAbundant: true },
	{ id: 25, name: 'Ce-142', a: 142, z: 58 },
	{ id: 25, name: 'Pr-141', a: 141, z: 59, isMostAbundant: true },
	{ id: 25, name: 'Nd-142', a: 142, z: 60, isMostAbundant: true },
	{ id: 25, name: 'Nd-143', a: 143, z: 60 },
	{ id: 25, name: 'Nd-144', a: 144, z: 60 },
	{ id: 25, name: 'Nd-145', a: 145, z: 60 },
	{ id: 25, name: 'Nd-146', a: 146, z: 60 },
	{ id: 25, name: 'Nd-148', a: 148, z: 60 },
	{ id: 25, name: 'Nd-150', a: 150, z: 60 },
	{ id: 25, name: 'Sm-144', a: 144, z: 62 },
	{ id: 25, name: 'Sm-147', a: 147, z: 62 },
	{ id: 25, name: 'Sm-148', a: 148, z: 62 },
	{ id: 25, name: 'Sm-149', a: 149, z: 62 },
	{ id: 25, name: 'Sm-150', a: 150, z: 62 },
	{ id: 25, name: 'Sm-152', a: 152, z: 62, isMostAbundant: true },
	{ id: 25, name: 'Sm-154', a: 154, z: 62 },
	{ id: 25, name: 'Eu-151', a: 151, z: 63 },
	{ id: 25, name: 'Eu-153', a: 153, z: 63, isMostAbundant: true },
	{ id: 25, name: 'Gd-152', a: 152, z: 64 },
	{ id: 25, name: 'Gd-154', a: 154, z: 64 },
	{ id: 25, name: 'Gd-155', a: 155, z: 64 },
	{ id: 25, name: 'Gd-156', a: 156, z: 64 },
	{ id: 25, name: 'Gd-157', a: 157, z: 64 },
	{ id: 25, name: 'Gd-158', a: 158, z: 64, isMostAbundant: true },
	{ id: 25, name: 'Gd-160', a: 160, z: 64 },
	{ id: 25, name: 'Tb-159', a: 159, z: 65, isMostAbundant: true },
	{ id: 25, name: 'Dy-156', a: 156, z: 66 },
	{ id: 25, name: 'Dy-158', a: 158, z: 66 },
	{ id: 25, name: 'Dy-160', a: 160, z: 66 },
	{ id: 25, name: 'Dy-161', a: 161, z: 66 },
	{ id: 25, name: 'Dy-162', a: 162, z: 66 },
	{ id: 25, name: 'Dy-163', a: 163, z: 66 },
	{ id: 25, name: 'Dy-164', a: 164, z: 66, isMostAbundant: true },
	{ id: 25, name: 'Ho-165', a: 165, z: 67, isMostAbundant: true },
	{ id: 25, name: 'Er-162', a: 162, z: 68 },
	{ id: 25, name: 'Er-164', a: 164, z: 68 },
	{ id: 25, name: 'Er-166', a: 166, z: 68, isMostAbundant: true },
	{ id: 25, name: 'Er-167', a: 167, z: 68 },
	{ id: 25, name: 'Er-168', a: 168, z: 68 },
	{ id: 25, name: 'Er-170', a: 170, z: 68 },
	{ id: 25, name: 'Tm-169', a: 169, z: 69, isMostAbundant: true },
	{ id: 25, name: 'Yb-168', a: 168, z: 70 },
	{ id: 25, name: 'Yb-170', a: 170, z: 70 },
	{ id: 25, name: 'Yb-171', a: 171, z: 70 },
	{ id: 25, name: 'Yb-172', a: 172, z: 70 },
	{ id: 25, name: 'Yb-173', a: 173, z: 70 },
	{ id: 25, name: 'Yb-174', a: 174, z: 70, isMostAbundant: true },
	{ id: 25, name: 'Yb-176', a: 176, z: 70 },
	{ id: 25, name: 'Lu-175', a: 175, z: 71, isMostAbundant: true },
	{ id: 25, name: 'Lu-176', a: 176, z: 71 },
	{ id: 25, name: 'Hf-174', a: 174, z: 72 },
	{ id: 25, name: 'Hf-176', a: 176, z: 72 },
	{ id: 25, name: 'Hf-177', a: 177, z: 72 },
	{ id: 25, name: 'Hf-178', a: 178, z: 72 },
	{ id: 25, name: 'Hf-179', a: 179, z: 72 },
	{ id: 25, name: 'Hf-180', a: 180, z: 72, isMostAbundant: true },
	{ id: 25, name: 'Ta-181', a: 181, z: 73, isMostAbundant: true },
	{ id: 25, name: 'W-180', a: 180, z: 74 },
	{ id: 25, name: 'W-182', a: 182, z: 74 },
	{ id: 25, name: 'W-183', a: 183, z: 74 },
	{ id: 25, name: 'W-184', a: 184, z: 74, isMostAbundant: true },
	{ id: 25, name: 'W-186', a: 186, z: 74 },
	{ id: 25, name: 'Re-185', a: 185, z: 75 },
	{ id: 25, name: 'Re-187', a: 187, z: 75, isMostAbundant: true },
	{ id: 25, name: 'Os-184', a: 184, z: 76 },
	{ id: 25, name: 'Os-186', a: 186, z: 76 },
	{ id: 25, name: 'Os-187', a: 187, z: 76 },
	{ id: 25, name: 'Os-188', a: 188, z: 76 },
	{ id: 25, name: 'Os-189', a: 189, z: 76 },
	{ id: 25, name: 'Os-190', a: 190, z: 76 },
	{ id: 25, name: 'Os-192', a: 192, z: 76, isMostAbundant: true },
	{ id: 25, name: 'Ir-191', a: 191, z: 77 },
	{ id: 25, name: 'Ir-193', a: 193, z: 77, isMostAbundant: true },
	{ id: 25, name: 'Pt-190', a: 190, z: 78 },
	{ id: 25, name: 'Pt-192', a: 192, z: 78 },
	{ id: 25, name: 'Pt-194', a: 194, z: 78 },
	{ id: 25, name: 'Pt-195', a: 195, z: 78, isMostAbundant: true },
	{ id: 25, name: 'Pt-196', a: 196, z: 78 },
	{ id: 25, name: 'Pt-198', a: 198, z: 78 },
	{ id: 25, name: 'Au-197', a: 197, z: 79, isMostAbundant: true },
	{ id: 25, name: 'Hg-196', a: 196, z: 80 },
	{ id: 25, name: 'Hg-198', a: 198, z: 80 },
	{ id: 25, name: 'Hg-199', a: 199, z: 80 },
	{ id: 25, name: 'Hg-200', a: 200, z: 80 },
	{ id: 25, name: 'Hg-201', a: 201, z: 80 },
	{ id: 25, name: 'Hg-202', a: 202, z: 80, isMostAbundant: true },
	{ id: 25, name: 'Hg-204', a: 204, z: 80 },
	{ id: 25, name: 'Tl-203', a: 203, z: 81 },
	{ id: 25, name: 'Tl-205', a: 205, z: 81, isMostAbundant: true },
	{ id: 25, name: 'Pb-204', a: 204, z: 82 },
	{ id: 25, name: 'Pb-206', a: 206, z: 82 },
	{ id: 25, name: 'Pb-207', a: 207, z: 82 },
	{ id: 25, name: 'Pb-208', a: 208, z: 82, isMostAbundant: true },
	{ id: 25, name: 'Bi-209', a: 209, z: 83, isMostAbundant: true },
	{ id: 25, name: 'Th-230', a: 230, z: 90 },
	{ id: 25, name: 'Th-232', a: 232, z: 90, isMostAbundant: true },
	{ id: 25, name: 'Pa-231', a: 231, z: 91, isMostAbundant: true },
	{ id: 25, name: 'U-234', a: 234, z: 92 },
	{ id: 25, name: 'U-235', a: 235, z: 92 },
	{ id: 25, name: 'U-238', a: 238, z: 92, isMostAbundant: true }
] as const satisfies readonly Particle[];

/**
 * Particle types supported by SHIELD-HIT12A and FLUKA. A and Z are defined for composite particles
 * like deuteron, triton, helium, and heavy ions.
 */
export const COMMON_PARTICLE_TYPES = [
	{
		id: 1,
		name: 'Neutron',
		a: 1,
		z: 0
	},
	{
		id: 2,
		name: 'Proton',
		a: 1,
		z: 1
	},
	{
		id: 3,
		name: 'Pion π-'
	},
	{
		id: 4,
		name: 'Pion π+'
	},
	{
		id: 7,
		name: 'Anti-proton',
		a: 1,
		z: 1
	},
	{
		id: 8,
		name: 'Kaon κ-'
	},
	{
		id: 9,
		name: 'Kaon κ+'
	},
	{
		id: 10,
		name: 'Kaon κ0'
	},
	{
		id: 11,
		name: 'Kaon κ~'
	},
	{
		id: 15,
		name: 'Muon µ-'
	},
	{
		id: 16,
		name: 'Muon µ+'
	},
	{
		id: 21,
		name: 'Deuteron',
		a: 2,
		z: 1
	},
	{
		id: 22,
		name: 'Triton',
		a: 3,
		z: 1
	},
	{
		id: 23,
		name: 'Helium-3',
		a: 3,
		z: 2
	},
	{
		id: 24,
		name: 'Helium-4',
		a: 4,
		z: 2
	},
	...HEAVY_ION_LIST
	// {
	// 	id: 25,
	// 	name: 'Heavy Ions',
	// 	a: 12,
	// 	z: 6
	// }
] as const satisfies readonly Particle[];

/**
 * Additional particle types supported by FLUKA, but not by SHIELD-HIT12A
 */
export const FLUKA_PARTICLE_TYPES = [
	{
		id: 26,
		name: 'Electron'
	}
] as const satisfies readonly Particle[];

/**
 * Particle types supported by Geant4. A and Z are defined for composite particles
 *  * like deuteron, triton, helium, and heavy ions.
 */
export const GEANT4_PARTICLE_TYPES = [
	{
		id: 1,
		name: 'Neutron',
		a: 1,
		z: 0
	},
	{
		id: 2,
		name: 'Proton',
		a: 1,
		z: 1
	},
	{
		id: 3,
		name: 'Photon'
	},
	{
		id: 4,
		name: 'Electron'
	},
	{
		id: 5,
		name: 'Positron'
	},
	{
		id: 6,
		name: 'Alpha',
		a: 4,
		z: 2
	},
	{
		id: 7,
		name: 'Muon µ-'
	},
	{
		id: 8,
		name: 'Muon µ+'
	},
	{
		id: 9,
		name: 'Pion π-'
	},
	{
		id: 10,
		name: 'Pion π+'
	},
	// {
	// 	id: 11,
	// 	name: '12C',
	// 	a: 12,
	// 	z: 6
	// },
	...HEAVY_ION_LIST
	// {
	// 	id: 25,
	// 	name: 'Heavy ions',
	// 	a: 12,
	// 	z: 6
	// }
] as const satisfies readonly Particle[];
