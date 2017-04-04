//이름으로 좌표 검색
function spritePosition(name, zoom) {
	for (var i=0;i<spriteList.length;i++) {
		if (spriteList[i][0] == name) {
			if (zoom == 1) {
				return spriteList[i][2].toString() + "px " + spriteList[i][3].toString() + "px";
			} else if (zoom == undefined || zoom == 2) {
				return (spriteList[i][2] * 2).toString() + "px " + (spriteList[i][3] * 2).toString() + "px";
			} else if (zoom === "rem") {
				return (spriteList[i][6] * 2).toString() + "rem " + (spriteList[i][7] * 2).toString() + "rem";
			}
		}
	}

	return false;
}

function spriteSize(name, widthORheight, zoom) {
	for (var i=0;i<spriteList.length;i++) {
		if (spriteList[i][0] == name) {
			if (zoom == 1) {
				if (widthORheight == "width") {//가로
					return spriteList[i][4].toString() + "px";
				} else if (widthORheight == "height") {//세로
					return spriteList[i][5].toString() + "px";
				}
			} else if (zoom == undefined || zoom == 2) {
				if (widthORheight == "width") {//가로
					return (spriteList[i][4] * 2).toString() + "px";
				} else if (widthORheight == "height") {//세로
					return (spriteList[i][5] * 2).toString() + "px";
				}
			}
		}
	}

	return false;
}
