exports.ruid = function genUid(){
	return new Date().getTime()+""+Math.floor(Math.random()*899+100);
}
