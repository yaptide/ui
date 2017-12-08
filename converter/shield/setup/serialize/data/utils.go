package data

func centerAndSizeToMinAndMax(center, size float64) (min, max float64) {
	min = center - size/2
	max = center + size/2
	return
}
