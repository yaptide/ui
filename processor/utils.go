package processor

import (
	"github.com/Palantir/palantir/db"
	"github.com/Palantir/palantir/model/project"
	"github.com/Palantir/palantir/utils/log"
)

func handleStatusUpdateChannel(session db.Session, versionID db.VersionID, listen chan project.VersionStatus) {
	for status := range listen {
		updateErr := session.Project().SetVersionStatus(versionID, status)
		if updateErr != nil {
			log.Error("Unable to update version status.")
		}
	}
}
