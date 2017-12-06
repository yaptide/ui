package processor

import (
	"fmt"
	"path"
)

const (
	shieldBinaryName = "shieldhit"
	beamDatFile      = "beam.dat"
	detectorsDatFile = "detect.dat"
	geometryDatFile  = "geo.dat"
	materialsDatFile = "mat.dat"
)

type shieldFiles map[string]string

func generateShieldPath(workDir string) []string {
	cmd := []string{
		shieldBinaryName,
		fmt.Sprintf("--beamfile=%s", path.Join(workDir, beamDatFile)),
		fmt.Sprintf("--geofile=%s", path.Join(workDir, geometryDatFile)),
		fmt.Sprintf("--matfile=%s", path.Join(workDir, materialsDatFile)),
		fmt.Sprintf("--detectfile=%s", path.Join(workDir, detectorsDatFile)),
	}
	return cmd
}

var mockParserExample = map[string]string{
	beamDatFile: `*         Input file FOR023.DAT for the SHIELD Transport Code

RNDSEED         89736501     ! Random seed
JPART0          25           ! Incident particle type
HIPROJ		    12.0    6.0  ! A and Z of heavy ion
TMAX0		    391.0   0.0  ! Incident energy; (MeV/nucl)
NSTAT           6000    -1   ! NSTAT, Step of saving
STRAGG          1            ! Straggling: 0-Off 1-Gauss, 2-Vavilov
MSCAT           1            ! Mult. scatt 0-Off 1-Gauss, 2-Moliere
NUCRE           0            ! Nucl.Reac. switcher: 1-ON, 0-OFF
`,
	detectorsDatFile: `*----0---><----1---><----2---><----3---><----4---><----5---><----6--->
CYL              0.0       0.0       0.0      10.0       7.0      30.0
                  10        20        30        -1    ENERGY    ex_cyl
*----0---><----1---><----2---><----3---><----4---><----5---><----6--->
MSH             -5.0      -5.0       0.0       5.0       5.0      30.0
                   1         1       300        -1    ENERGY   ex_zmsh
*----0---><----1---><----2---><----3---><----4---><----5---><----6--->
MSH             -1.0      -5.0      10.0       1.0       5.0      12.0
                   1       100         1        -1    ENERGY   ex_ymsh
*----0---><----1---><----2---><----3---><----4---><----5---><----6--->
MSH             -5.0      -5.0       0.0       5.0       5.0      30.0
                   1       100       300        -1    ENERGY  ex_yzmsh
*----0---><----1---><----2---><----3---><----4---><----5---><----6--->
GEOMAP          -1.0     -25.0     -15.0       1.0      25.0      35.0
                   1        50        50                ZONE  ex_yzzon
*----0---><----1---><----2---><----3---><----4---><----5---><----6--->
GEOMAP         -25.0     -25.0      10.0      25.0      25.0      11.0
                   5         5         1                ZONE  ex_xyzon
`,
	geometryDatFile: `*---><---><--------><------------------------------------------------>
    0    0           C12 200 MeV/A, H2O 30 cm cylinder, r=10, 1 zone
*---><---><--------><--------><--------><--------><--------><-------->
  RCC    1       0.0       0.0       0.0       0.0       0.0      30.0
                10.0
  RCC    2       0.0       0.0      -5.0       0.0       0.0      35.0
                15.0
  RCC    3       0.0       0.0     -10.0       0.0       0.0      40.0
                20.0
  END
  001          +1
  002          +2     -1
  003          +3     -2
  END
    1    2    3
    1 1000    0
`,
	materialsDatFile: `MEDIUM 1
ICRU 276
END
`,
}
