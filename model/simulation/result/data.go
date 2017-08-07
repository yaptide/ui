package result

// Dimensions contains data about dimesnions of scored results.
type Dimensions struct {
	NumberOfDimensions int64  `json:"numberOfDimensions"`
	SegmentsInDim1     int64  `json:"segmentsInDim1"`
	SegmentsInDim2     int64  `json:"segmentsInDim2"`
	SegmentsInDim3     int64  `json:"segmentsInDim3"`
	CoordinatesType    string `json:"coordinatesType"`
}
