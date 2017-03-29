package project

import (
	"testing"

	"gopkg.in/mgo.v2/bson"

	"github.com/Palantir/palantir/model/test"
)

var testCases test.MarshallingCases = test.MarshallingCases{
	{
		&Version{ID: bson.ObjectIdHex("AAAAAAAAAAAAAAAAAAAAAAAA"),
			Settings: "setId",
			SetupID:  bson.ObjectIdHex("BBBBBBBBBBBBBBBBBBBBBBBB"),
			Results:  "resultsId",
		},
		`{
			"id": "aaaaaaaaaaaaaaaaaaaaaaaa",
			"settings": "setId",
			"setup": "bbbbbbbbbbbbbbbbbbbbbbbb",
			"results": "resultsId"
		}`,
	},

	{
		&Project{ID: bson.ObjectIdHex("58cfd607dc25403a3b691781"), Name: "name", Versions: []Version{}},
		`{
			"id": "58cfd607dc25403a3b691781",
			"name": "name",
			"versions": []
		}`,
	},

	{
		&List{[]Project{}},
		`{"projects":[]}`,
	},
}

func TestMarshal(t *testing.T) {
	test.Marshal(t, testCases)
}

func TestUnmarshal(t *testing.T) {
	test.Unmarshal(t, testCases)
}

func TestUnmarshalMarshalled(t *testing.T) {
	test.UnmarshalMarshalled(t, testCases)
}

func TestMarshalUnmarshalled(t *testing.T) {
	test.MarshalUnmarshalled(t, testCases)
}
