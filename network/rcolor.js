exports.rcolor = function randomColor(){
	return "#"+(~~(Math.random()*(1<<24))).toString(16)
}
