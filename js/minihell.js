
(function() {
'use strict';

//=====================================================================
//※ 변수, 기초 정보
//=====================================================================
var i,j,k,l,m;

//실행 관련
var state = "waiting";//실행 상태
var goyuList = [];//고유 에픽 리스트
var weighted_type = [];//에픽 부위 선정 가중치
var weighted_level = [];//에픽 레벨 선정 가중치
var current_goyu = [];//현재 지역 고유에픽 리스트

//아이템 관련
var droprate = {//아이템 드랍률
    name:["epic","soul","beed",false],//에픽, 소울, 구슬, 꽝
    num:[0.065,0.04,0.0065,0.8885]
};
var droprate_special = {//특수지역 에픽 드랍률
    "metro_6":0.11//이계의 틈
};
var droptype = {//장비 타입별 드랍확률 가중치
    name:["무기","방어구","악세서리","특수장비"],
    num:[1,1,1,0.4]
};
var droplevel = {
    name:[85,90],
    num:[60,40]
};
var autoWish;//찜목록 늦게출현 오토
var wishLimit = 8;//찜하기 최대치

//던전 관련
var selectedDungeon = {now:{},after:{}};
var areaList = [];//지역 리스트 (스크롤용)

//캐릭터 리스트
var characterList = {
	"swordman_m":{
		"name":"귀검사(남)",
		"hittype":"slash"
	},
	"swordman_f":{
		"name":"귀검사(여)",
  		"hittype":"slash"
	},
	"darkknight_m":{
		"name":"다크나이트(남)",
		"hittype":"slash"
	},
	"fighter_m":{
		"name":"격투가(남)",
		"hittype":"hit"
	},
	"fighter_f":{
		"name":"격투가(여)",
		"hittype":"hit"
	},
	"gunner_m":{
		"name":"거너(남)",
		"hittype":"gun"
	},
	"gunner_f":{
		"name":"거너(여)",
		"hittype":"gun"
	},
	"mage_m":{
		"name":"마법사(남)",
		"hittype":"hit"
	},
	"mage_f":{
		"name":"마법사(여)",
		"hittype":"hit"
	},
	"creator_f":{
		"name":"크리에이터(여)",
		"hittype":"magic"
	},
	"priest_m":{
		"name":"프리스트(남)",
		"hittype":"hit"
	},
	"priest_f":{
		"name":"프리스트(여)",
		"hittype":"hit"
	},
	"thief_f":{
		"name":"도적(여)",
		"hittype":"slash"
	},
	"knight_f":{
		"name":"나이트(여)",
		"hittype":"slash"
	},
	"lancer_m":{
		"name":"마창사(남)",
		"hittype":"slash"
	},
	"beckey":{
		"name":"베키",
		"hittype":"beckey"
	}
};

//=====================================================================
//※ 미디어 파일
//=====================================================================
//이미지
var imageList = [];
    /*로딩 이미지*/
    imageList.push("./img/bg/loading_gate.jpg");
    imageList.push("./img/bg/loading_metro.jpg");
    /*던전 슬롯*/
    for(i=0;i<dungeonList.length;i++) {
        imageList.push("./img/bg/bg_" + dungeonList[i].id + ".jpg");
        imageList.push("./img/slot/" + dungeonList[i].id + ".png");
    }
    /*캐릭터 이미지*/
    for(i in characterList) imageList.push("./img/sprite/character_" + i + ".png");
    /*스프라이트 이미지*/
    imageList.push("https://solarias.github.io/dnf/sprite/images/sprite_item.png");
    imageList.push("https://solarias.github.io/dnf/sprite/images/sprite_hell.png");
    /*에픽 이펙트*/
    imageList.push("./img/epic_appear.png");
    imageList.push("./img/epic_land.png");
    imageList.push("./img/epic_land_wish.png");
    imageList.push("./img/epic_wait.png");
    imageList.push("./img/epic_wait_wish1.png");
    imageList.push("./img/epic_wait_wish2.png");
    /*기타 이미지*/
    imageList.push("./img/npc/erze.gif");
    imageList.push("./img/epic_crack.png");
    imageList.push("./img/icon_crack.png");
    imageList.push("./img/icon_soul.png");
    imageList.push("./img/icon_beed.png");
    imageList.push("./img/icon_wished.png");
    imageList.push("./img/icon_arrow.png");
//브금
var bgmObj = {};
for (i = 0;i < dungeonList.length;i++) {
    bgmObj[dungeonList[i].id] = new Howl({
        src:[
            "./sound/bgm/bgm_" + dungeonList[i].id + ".ogg",
            "./sound/bgm/bgm_" + dungeonList[i].id + ".mp3"
        ],
        preload:false,
        loop:true,
        volume:0.3
    });
    bgmObj[dungeonList[i].id].loadCompleted = false;
}
//효과음
var itemSfxList = ["epic_appear","epic_land","epic_appear_wish","epic_land_wish","item_appear"];
var hitList = ["hit_slash","hit_hit","hit_gun","hit_magic","hit_beckey"];
var sfxList = ["slot_open","slot_close","slot_act","map_show","map_enter", "wish_set"];
var sfxObj = {};
//에픽 사운드 업데이트
for (i = 0;i < itemSfxList.length;i++) {
    sfxObj[itemSfxList[i]] = new Howl({
        src:["./sound/sfx/sfx_" + itemSfxList[i] + ".ogg", "./sound/sfx/sfx_" + itemSfxList[i] + ".mp3"],
        preload:false,
        loop:false,
        volume:0.2
    });
    sfxObj[itemSfxList[i]].loadCompleted = false;
}
//타격음 업데이트
for (i = 0;i < hitList.length;i++) {
    sfxObj[hitList[i]] = new Howl({
        src:["./sound/sfx/sfx_" + hitList[i] + ".ogg", "./sound/sfx/sfx_" + hitList[i] + ".mp3"],
        preload:false,
        loop:false,
        volume:0.6
    });
    sfxObj[hitList[i]].loadCompleted = false;
}
    //일부 큰 소리 작게
    sfxObj.hit_hit.volume(0.2);
    sfxObj.hit_slash.volume(0.2);
//기타 효과음 업데이트
for (i = 0;i < sfxList.length;i++) {
    sfxObj[sfxList[i]] = new Howl({
        src:["./sound/sfx/sfx_" + sfxList[i] + ".ogg", "./sound/sfx/sfx_" + sfxList[i] + ".mp3"],
        preload:false,
        loop:false,
        volume:0.5
    });
    sfxObj[sfxList[i]].loadCompleted = false;
}
//유저 정보(세이브 가능)
var user = {
    //저장 정보
    version:1.0,
    //플레이 정보
    count:0,//회차
    channel:"",//아이템 획득한 채널
    myCharacter:"",//현재 캐릭터
    holding:{//획득(get)/보유(have)량
        epic:{get:0,have:0},//에픽템
        soul:{get:0,have:0},//소울
        beed:{get:0,have:0},//구슬
        invite:{get:0,have:0},//초대장
    },
    record:{
        item:[],//획득 기록 - 아이템
        set:[]//획득 기록 - 세트(세트완성 중복 출력 방지)
    },
    inventory:{},//보유 아이템 수량 정보
    wish:[],//찜한 아이템(id만 기억함)
    //옵션
    option:{
        //미디어
        bgm:1,
        sfx:1,
        //탐색
        searchMode:"에픽"
    }
};

//=====================================================================
//※ 처리 함수
//=====================================================================
//탐색 관련
function simulateP() {}
//★탐색 전 입장 던전 기준 부위/레벨 가중치 구축
simulateP.prototype.build = function(target) {
    //1. 부위 구축
        //a. 장비 종류만큼 칸 설정
        var arr_num = [];
        for (var i=0;i<droptype["name"].length;i++) {
            arr_num.push(0);
        }
        //b. 해당 칸은 특정 장비의 개수만큼 숫자가 증가
        for (i=0;i<itemList.length;i++) {
            for (j=0;j<droptype["name"].length;j++) {
                //계산 중인 장비라면, 해당 레벨 칸 +1
                if ((itemList[i]["sort1"] === droptype["name"][j] || //무기, 방어구 전용 : 대분류
                itemList[i]["sort2"] === droptype["name"][j]) &&
                (itemList[i]["level"] === 85 ||
                itemList[i]["level"] === 90)) {//악세사리, 특수장비 : 1차 소분류
                    arr_num[j] += 1;
                }
            }
        }
        //c. 아이템 수량 & 기본 가중치 합산
        var arr_num2 = [];
        for (i=0;i<droptype["num"].length;i++) {
            arr_num2[i] = arr_num[i] * droptype["num"][i];
        }
        //d. 부위 가중치 기억
        weighted_type = arr_num2;
    //2. 레벨 구축
        //x - 부위별로 레벨 가중치 구축
        weighted_level = [];
        for (k=0;k<droptype.name.length;k++) {
            //던전 정보 잠시 가져오기 (for 레벨)
            var dg = indexArrKey(dungeonList,"id",target);
            //a. 드랍레벨 종류만큼 칸 설정
            var level_arr = [];
            for (i = 0;i < dg.level.length;i++) {
                level_arr[i] = 0;
            }
            //b. 해당 칸은 특정 레벨 & 특정 장비의 개수만큼 숫자가 증가
            for (i=0;i<itemList.length;i++) {
                for (j=0;j<dg.level.length;j++) {
                    //앞에서 선택된 장비이고 레벨이 맞을 경우, 해당 레벨 칸 +1
                    if ((itemList[i]["sort1"] === droptype.name[k] //무기, 방어구 전용 : 대분류
                    || itemList[i]["sort2"] === droptype.name[k])//악세사리, 특수장비 : 1차 소분류
                    && itemList[i]["level"] === dg.level[j]) {
                        level_arr[j] += 1;
                    }
                }
            }
            //c. 추가 가중치 계산
            for (i = 0;i < dg.level.length;i++) {
                level_arr[i] = level_arr[i] * dg.level_weight[i];
            }
            //d. 해당 부위 레벨 가중치 기억
            weighted_level[k] = level_arr;
        }
};
//★탐색 준비
simulateP.prototype.ready = function() {
    //캐릭터 스프라이트 변경
    $("#main_character").classList.remove("wait");
    $("#main_character").classList.add("attack");
    //버튼 문구 변경
    $("#button_main").innerHTML = "탐색 중단";
    //기타 버튼 비활성화
    $("#button_left").disabled = true;
    $("#button_right").disabled = true;
    $("#main_inventory").disabled = true;
    //1회 탐색 개시
    this.run();
};
//★1회 탐색 중
simulateP.prototype.run = function() {
    //종료 대기중이라면 실행하지 않고 즉각 종료시킴
    if (state === "waiting") {
        this.end();
        return;
    }
    //회차 증가
    user.count += 1;
        //변경 회차 반영
        $("#board_count_num").innerHTML = thousand(user.count);
    //0.5초 후(타격 애니메이션 종료 후)
    setTimeout(function() {
        //타격 사운드
        if (user.option.sfx) {
            var sd = sfxObj["hit_" + characterList[user.myCharacter].hittype];
            sd.play();
        }
        //탐색 결과 확인
        var result = this.result();
        if (result !== false) {
            //아이템 드랍 승인 -> 아이템 선정
            this.getItem(result);
            //탐색 종료 여부 : 탐색모드 및 찜 여부에 따라 차후 결정
        } else {
            //아니라면 탐색 지속
            this.run();
        }
    }.bind(this),125);
};
//★탐색 결과 판별
simulateP.prototype.result = function() {
    //확률 가져오기
    var thisrate = deepCopy(droprate);
    //특수지역이라면 해당 확률 변경된
    if (Object.keys(droprate_special).indexOf(selectedDungeon.now.id) >= 0)
        thisrate.num[0] = droprate_special[selectedDungeon.now.id];
    //드랍 결과 반환 (랜덤)
    return thisrate.name[rand(thisrate.num)];
};
//★아이템 선정 (차후 세련되게 개선)
simulateP.prototype.getItem = function(str) {
    //변수 준비
    var item;
    //에픽이라면 아이템을 고를 것
    if (str === "epic") {
        //아이템 부위 선정
        var type_num = rand(weighted_type);
        var type = droptype.name[type_num];
        //아이템 레벨 선정
        var lv = droplevel.name[rand(weighted_level[type_num])];
        //아이템 최종 선정
        var tempArr = [];
        for (i=0;i<itemList.length;i++) {
            if ((itemList[i].sort1 === type || /*종류-무기*/
            itemList[i].sort2 === type ||/*종류-방어구*/
            itemList[i].sort3 === type) &&/*종류-악세서리&특수장비*/
            itemList[i].level === lv)/*레벨*/ {
                tempArr.push(itemList[i]);
            }
        }
        //미리 리스트에서 랜덤으로 선정
        item = tempArr[Math.floor(Math.random() * tempArr.length)];
        //->아이템 선정결과 반영
        this.applyItem(item);
        //->아이템 드랍
        this.dropEpic(item);
    //아니라면 그냥 str 집어넣기
    } else {
        item = str;
        //->아이템 선정결과 반영
        this.applyItem(item);
        //->기타아이템 드랍
        this.dropEtc(item);
    }


};
//★아이템 선정결과 반영
simulateP.prototype.applyItem = function(item) {
    //(공통 1) 습득 채널 표시
    var arr = resultList.channel;
    user.channel= arr[Math.floor(Math.random() * arr.length)];
    $("#channel_text").innerHTML = user.channel;

    //(공통 2) 획득/보유량 증가
    if (typeof item !== "string") {
        user.holding.epic.get += 1;
        user.holding.epic.have += 1;
        $("#board_epic_num").innerHTML = thousand(user.holding.epic.have);
    } else {
        user.holding[item].get += 1;
        user.holding[item].have += 1;
        $("#board_" + item + "_num").innerHTML = thousand(user.holding[item].have);
    }

    //에픽 한정
    if (typeof item !== "string") {
        //1. 아이템 획득/보유량/최초획득시기 기억
        var target;
        if (!user.inventory[item.id]) {
            user.inventory[item.id] = {};
            user.inventory[item.id].get = 1;/*획득량*/
            user.inventory[item.id].have = 1;/*보유량*/
            user.inventory[item.id].firstGet = user.count;/*최초획득시기*/
        } else {
            user.inventory[item.id].get += 1;
            user.inventory[item.id].have += 1;
        }

        //2. 아이템 획득내역 기록
            //일반 아이템
            if (item.set === "") {
                //기록 : [회차, 채널, 아이템ID, 보유수]
                user.record.item.push([user.count, user.channel, item.id, user.inventory[item.id].have]);
                //세트 정보 출력
                $("#main_set_text").className = "color_gray";
                $("#main_set_text").innerHTML = "정보 없음";

            //세트 아이템
            } else {
                var temp = [0,0];//해당 세트 아이템 수, 수집 수
                for (i = 0;i < itemList.length;i++) {
                    if (itemList[i].set === item.set) {
                        temp[1] += 1;
                        if (user.inventory[itemList[i].id] &&
                            user.inventory[itemList[i].id].have > 0)
                            temp[0] += 1;
                    }
                }
                //기록 : [회차, 채널, 아이템ID, 보유수, 세트 확보량]
                user.record.item.push([user.count, user.channel, item.id, user.inventory[item.id].have, temp[0] + "/" + temp[1]]);

                //이전까지 세트 미완성 시 : 완성여부 파악
                if (item.set !== "" && user.record.set.indexOf(item.set) < 0) {
                    if (temp[1] === temp[0]) {
                        //record_set 등록하기
                        user.record.set.push(item.set);
                        //recor_item 등록하기
                        user.record.item.push(item.set);
                    }
                }

                //세트 정보 출력
                    $("#main_set_text").className = "color_set";
                    $("#main_set_text").innerHTML = item.set + " (" + temp[0].toString() + "/" +  temp[1].toString() + ")";
            }

        //3. 해당 아이템 도감 업데이트
        display.modifyInventory(item.id);
        //4. (찜한 아이템이라면) 찜 목록 업데이트
        display.checkWish(item.id);
    }
};
//★아이템 원위치, 기존 에픽 이펙트 제거
simulateP.prototype.resetItem = function() {
    //아이템 이름, 필드 이미지 가시화
    $("#item_name1").style.visibility = "hidden";
    $("#item_img1").style.visibility = "hidden";
    //기존 아이템 이펙트 제거
    $("#item_img1").classList.remove("rotate");
    void $("#item_img1").offsetWidth;
    $("#item1").classList.remove("appear");
    $("#item1").classList.remove("land");
    $("#item1").classList.remove("wait");
        //찜빔 이펙트 제거
        $("#item1").classList.remove("appear_wish");
        $("#item1").classList.remove("land_wish");
        $("#item1").classList.remove("wait_wish");
        clearTimeout(autoWish);
    void $("#item1").offsetWidth;
    //GSAP 애니메이션 없애기
    TweenMax.killAll();
};
//★ 기타아이템 드랍 (간략)
simulateP.prototype.dropEtc = function(item) {
    //★ 종료 여부 설정 (탐색모드에 따라)
    switch (user.option.searchMode) {
        case "모두":
            this.end();

            break;
        default://그 외 = "에픽", "찜", "무한"
            //무조건 달림
            this.run();

            break;
    }
    //아이템 원위치
    this.resetItem();
    //아이템 이름 변경
    $("#item_name1").classList.remove("color_epic","color_soul","color_beed");
    $("#item_name1").classList.add("color_" + item);
    switch (item) {
        case "soul":
            $("#item_name1").innerHTML = "에픽 소울";break;
        case "beed":
            $("#item_name1").innerHTML = selectedDungeon.now.area_name + " 지옥 구슬";break;
        default:
            $("#item_name1").innerHTML = "에픽 소울";break;
    }
    //아이템 이미지 출력
    item = "기타";
    var field_name = "field_" + item;
    $("#item_img1").className = "item_img " + field_name;
        // ★ 아이템 필드 이미지 자료 : sprite 폴더 내 spriteCss.css 파일 참고
        //	(엑셀 파일 영향받지 않음, 개별 편집 필요)
        //기본 px 정보를 rem에 맞춰줌( ÷ 33.3)
        $("#item_img1").removeAttribute("style");
        var temp = [
            getComputedStyle($("#item_img1")).getPropertyValue("background-position").replace("px",""),
            getComputedStyle($("#item_img1")).getPropertyValue("width").replace("px",""),
            getComputedStyle($("#item_img1")).getPropertyValue("height").replace("px","")
        ];
        var arr = temp[0].split(" ");
        for (i=0;i<arr.length;i++) {
            arr[i] = parseFloat(arr[i]) / 33.3;
            arr[i] += "rem";
        }
        $("#item_img1").style.backgroundPosition = arr.join(" ");
        $("#item_img1").style.width = (parseFloat(temp[1]) / 33.3).toString() + "rem";
        $("#item_img1").style.height = (parseFloat(temp[2] / 33.3)).toString() + "rem";
	//아이템 이름, 필드 이미지 가시화
	$("#item_name1").style.visibility = "visible";
	$("#item_img1").style.visibility = "visible";
    //기타아이템 등장 사운드
    if (user.option.sfx) sfxObj.item_appear.stop().play();
    //아이템 회전 시작
    $("#item_img1").classList.add("rotate");
    //균열 등장
    $("#main_crack").classList.add("show");
    void $("#main_crack").offsetWidth;
    //아이템 루팅
        //X좌표 (좌Max : -45 / 우Max : -25)
        TweenMax.fromTo($("#item1"),0.6,
            {xPercent:0},
            {xPercent:-30,ease:Power0.easeNone});
        //Y좌표 (상합Max : 25/ 하합Max : 65 / 최소 Y축 이동 절대값 : 40)
        TweenMax.fromTo($("#item1"),0.2,
            {yPercent:0},
            {yPercent:"-=5",ease:Circ.easeOut});
        TweenMax.to($("#item1"),0.4,{yPercent:"+=45",ease: Circ.easeIn,delay:0.2,
                onComplete:function() {
                    //균열 사라짐
                    $("#main_crack").classList.remove("show");
                    void $("#main_crack").offsetWidth;
                }
            });
};
//★ 에픽템 드랍
simulateP.prototype.dropEpic = function(item) {
    //찜한 아이템인지 & 1개만 보유한 아이템인지 판별 (첫 획득이면 개수는 1개)
    var wished = false;
    if (user.wish.indexOf(item.id) >= 0 &&
    (user.inventory[item.id].have <= 1)) wished = true;
    //아이템 원위치, 기존 에픽 이펙트 제거
    this.resetItem();
    //========================================================
    //★ 종료 여부 설정 (탐색모드에 따라)
    switch (user.option.searchMode) {
        case "찜하나":
            if (!wished) {
                this.run();//찜한 게 아님 : 지속
            } else {
                this.readyToEnd();//쨈한 거 : 잠시 후 종료
            }

            break;
        case "모든찜":
            if (!wished) {
                this.run();//찜한 게 아님 : 지속
            } else {
                //쨈한 거
                var num = 0;
                for (var i = 0;i < user.wish.length;i++) {
                    if (user.inventory[user.wish[i]] &&
                        user.inventory[user.wish[i]].have > 0) num += 1;
                }
                if (user.wish.length === num) {
                    this.readyToEnd();//찜한 거 다 모았음 : 잠시 후 종료
                } else {
                    this.run();//찜한 거 아직 다 못 모았음 : 지속
                }


            }

            break;
        case "무한"://
            //재실행
            this.run();

            break;
        default://그 외 = "모두", "에픽"
            //무조건 멈춤
            this.end();

            break;
    }
    //========================================================

    //아이템 이름 변경
    $("#item_name1").classList.remove("color_epic","color_soul","color_beed");
    $("#item_name1").classList.add("color_epic");
    $("#item_name1").innerHTML = item.name;

    //아이템 이미지 출력
    var field_name = "field_" + item.sort1 + "_" + item.sort2 + "_" + item.sort3;
    $("#item_img1").className = "item_img " + field_name;
        // ★ 아이템 필드 이미지 자료 : sprite 폴더 내 spriteCss.css 파일 참고
        //	(엑셀 파일 영향받지 않음, 개별 편집 필요)
        //기본 px 정보를 rem에 맞춰줌( ÷ 33.3)
        $("#item_img1").removeAttribute("style");
        var temp = [
            getComputedStyle($("#item_img1")).getPropertyValue("background-position").replace("px",""),
            getComputedStyle($("#item_img1")).getPropertyValue("width").replace("px",""),
            getComputedStyle($("#item_img1")).getPropertyValue("height").replace("px","")
        ];
        var arr = temp[0].split(" ");
        for (i=0;i<arr.length;i++) {
            arr[i] = parseFloat(arr[i]) / 33.3;
            arr[i] += "rem";
        }
        $("#item_img1").style.backgroundPosition = arr.join(" ");
        $("#item_img1").style.width = (parseFloat(temp[1]) / 33.3).toString() + "rem";
        $("#item_img1").style.height = (parseFloat(temp[2] / 33.3)).toString() + "rem";
	//아이템 이름, 필드 이미지 가시화
	$("#item_name1").style.visibility = "visible";
	$("#item_img1").style.visibility = "visible";

    //에픽 등장 사운드
    if (user.option.sfx) {
        if (!wished) {
            //일반 에픽사운드
            sfxObj.epic_appear.stop().play();
            //불필요 사운드 중단
            sfxObj.epic_appear_wish.stop();
        } else {
            //찜빔 에픽사운드
            sfxObj.epic_appear_wish.stop().play();
            //불필요 사운드 중단
            sfxObj.epic_appear.stop();
        }
        //불필요 사운드 중단
        sfxObj.epic_land.stop();
        sfxObj.epic_land_wish.stop();
    }

    //아이템 회전 시작
    $("#item_img1").classList.add("rotate");
    //에픽 등장 이펙트
        if (!wished) {
            $("#item1").classList.add("appear");
        } else {
            $("#item1").classList.add("appear_wish");
        }
    //균열 등장
    $("#main_crack").classList.add("show");
    void $("#main_crack").offsetWidth;


    //아이템 루팅
        //향후 자리 4곳 정하기
        //X좌표 (좌Max : -45 / 우Max : -25)
        TweenMax.fromTo($("#item1"),0.6,
            {xPercent:0},
            {xPercent:-30,ease:Power0.easeNone});
        //Y좌표 (상합Max : 25/ 하합Max : 65 / 최소 Y축 이동 절대값 : 40)
        TweenMax.fromTo($("#item1"),0.2,
            {yPercent:0},
            {yPercent:"-=5",ease:Circ.easeOut});
        TweenMax.to($("#item1"),0.4,{yPercent:"+=45",ease: Circ.easeIn,delay:0.2,
                onComplete:function() {
                    if (!wished) {
                    /*일반 이펙트*/
                        //에픽 착지 이펙트
                        $("#item1").classList.add("land");
                        //에픽 대기 이펙트 (즉시 실행)
                        $("#item1").classList.add("wait");
                    /*찜빔 이펙트 */
                    } else {
                        //에픽 착지 이펙트
                        $("#item1").classList.add("land_wish");
                        //에픽 대기 이펙트 (착지 이펙트 0.6초 종료 후)
                        autoWish = setTimeout(function() {
                            $("#item1").classList.add("wait_wish");
                        },600);
                    }
                    //균열 사라짐
                    $("#main_crack").classList.remove("show");
                    void $("#main_crack").offsetWidth;
                    //에픽 착지 사운드
                    if (user.option.sfx) {
                        if (!wished) {
                            //일반 에픽사운드
                            sfxObj.epic_land.play();
                        } else {
                            //찜빔 에픽사운드
                            sfxObj.epic_land_wish.play();
                        }
                    }
                }
            });

};
//★탐색 종료 대기 (찜빔 확인)
simulateP.prototype.readyToEnd = function() {
    state ="waiting";
    //캐릭터 스프라이트 변경
    $("#main_character").classList.remove("attack");
    $("#main_character").classList.add("wait");
    //대기 문구
    $("#button_main").innerHTML = "확인 중";
    $("#button_main").disabled = true;
    //(0.9초 후) 버튼 활성화
    setTimeout(function() {
        this.end();

        /*게임 저장*/main.saveData();
    }.bind(this),900);
};
//★탐색 종료
simulateP.prototype.end = function(wished) {
    state ="waiting";
    //캐릭터 스프라이트 변경
    $("#main_character").classList.remove("attack");
    $("#main_character").classList.add("wait");
    //버튼 활성화
    main.setButton("normal");
    main.setButton("enableAll");
    $("#button_main").innerHTML = user.option.searchMode + " 탐색";

    /*게임 저장*/main.saveData();
};
var simulate = new simulateP();

//출력 관련
function displayP() {}
//★획득기록 창 출력
displayP.prototype.showRecord = function() {
    //텍스트 생성
    var text = "";
    for (i = 0;i < user.record.item.length;i++) {
        switch(typeof user.record.item[i]) {
            case "object":
                var itemInfo = indexArrKey(itemList,"id",user.record.item[i][2]);
                var itemNum = user.inventory[user.record.item[i][2]];
                var name = indexArrKey(itemList,"id",user.record.item[i][2]).name;
                var tmp = user.record.item[i];
                var ttype = (itemInfo.sort1 === "방어구") ? itemInfo.sort2 : itemInfo.sort3;
                text += "<p class='record_head'>" + thousand(user.record.item[i][0]) +
                    "회차 <span class='font_small color_gray'>(" + user.record.item[i][1] + ")</span></p>";
                if (itemInfo.set === ""){
                    text += "<p class='record_item color_epic'>" + name +
                        "<span class='color_skyblue'> [x" + thousand(user.record.item[i][3]) + "]</span>" +
                        "<span class='color_white font_small'> [Lv." + itemInfo.level.toString() + "]</span>" +
                        "<span class='color_white font_small'>[" + ttype + "]</span>" +
                        "</p>";
                } else {
                    text += "<p class='record_item color_set'>" + name +
                        "<span class='color_skyblue'> [x" + thousand(user.record.item[i][3]) + "]</span> " +
                        "<span class='color_white font_small'> [Lv." + itemInfo.level.toString() + "]</span>" +
                        "<span class='color_white font_small'>[" + ttype + "]</span>" +
                        "<span class='font_small'>(세트 : " +  user.record.item[i][4] + ")</span>" +
                        "</p>";
                }
                break;
            case "string":
                text += "<p class='record_set color_yellow'>\"" + user.record.item[i] + "\" 완성!</p>";

                break;
        }
    }
    //텍스트 출력
    $("#record_box").innerHTML = text;
    //좌측 메뉴창 제목 석정
    $("#slot_title_left").innerHTML = "에픽아이템 획득 기록";
    //획득기록창 열기
    $("#record_box").style.display = "block";
    //스크롤 내리기
    $("#record_box").scrollTop = $("#record_box").scrollHeight;
};
//★획득기록 창 지우기
displayP.prototype.clearRecord = function() {
    //획득기록창 닫기
    $("#record_box").style.display = "none";
    //획득기록창 내용물 지우기
    var myNode = $("#record_box");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
};
//★ 도감 창 수정
displayP.prototype.modifyInventory = function(id) {
    //아이템 지정
    var item = indexArrKey(itemList,"id",id);
    //등급, 보유량, 최초획득시점 파악
    var rarity = (item.set === "") ? "epic" : "set";
    var have = (user.inventory[id]) ? user.inventory[id].have : 0;
    var firstGet = (user.inventory[id]) ? user.inventory[id].firstGet : 0;
    //(보유량 >= 1)
    if (have > 0) {
        //아이콘 표시
        $$("#item_" + id + " .icon")[0].classList.remove("nothing");
        //아이템 이름 색상 표시
        $("#item_" + id).classList.remove("color_nothing");
        $("#item_" + id).classList.add("color_" + rarity);
        //보유량 변경
        $("#item_" + id).innerHTML = $("#item_" + id).innerHTML.replace(/\[x?(\d+)?\]/gi,"[x" + thousand(have) + "]");
        //최초획득 변경
        $$("#item_" + id + " .firstGet")[0].innerHTML = " (" + thousand(firstGet) + "회차)";
        $$("#item_" + id + " .firstGet")[0].classList.remove("nothing");
    //(보유량 = 0)
    } else  {
        //아이콘 표시
        $$("#item_" + id + " .icon")[0].classList.add("nothing");
        //이름 색상 표시;
        $("#item_" + id).classList.remove("color_" + rarity);
        $("#item_" + id).classList.add("color_nothing");
        //보유량 변경
        $("#item_" + id).innerHTML = $("#item_" + id).innerHTML.replace(/\[x?(\d+)?\]/gi,"[x" + thousand(have) + "]");
        //최초획득 변경
        $$("#item_" + id + " .firstGet")[0].innerHTML = "";
        $$("#item_" + id + " .firstGet")[0].classList.add("nothing");
    }
};
//★도감 창 지우기
displayP.prototype.clearInventory = function() {
    //획득기록창 닫기
    $("#inventory_box").style.display = "none";
    $("#inventory_footer").style.display = "none";
    //획득기록창 내용물 지우기 (현재는 하지 않음)
        /*
        var myNode = $("#inventory_box");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
        */
};
//★찜하기 클릭 (특정 id 기준)
displayP.prototype.clickWish = function(tmpid) {
    //이전에 등록된 id가 있는 지 확인
    var range = user.wish.length;
    for (i = 0;i < range;i++) {
        //(기존에 등록된 게 있다면) 해당 찜 지우기
        if (user.wish[i] === tmpid) {
            this.removeWish(tmpid);
            return;
        }
    }
    //(기존에 등록된 게 없다면) 찜 추가
    this.addWish(tmpid);
    //해당 버튼 blur 처리
    $("#item_" + tmpid).blur();
};
//★찜하기 추가 (특정 id 기준)
displayP.prototype.addWish = function(id) {
    //최대치 넘으면 중지
    if (user.wish.length >= wishLimit) {
        var st = $("#inventory_box").scrollTop;//클릭 당시 스크롤 위치 기억
        swal({
            title:"찜하기 최대치 도달",
            text:"찜하기는 최대 <strong>" + wishLimit.toString() + "</strong>개까지 가능합니다.",
            type:"error"
        }).then(function() {
            $("#inventory_box").scrollTop = st;//스크롤 위치 복원
        });
    } else {
        //찜 설정 사운드
        if (user.option.sfx) sfxObj.wish_set.play();
        //찜 등록, 아이콘 표시
        user.wish.push(id);
        //찜 현황 반영
        display.checkWish();
        //해당 아이템 색상 변경, WISH 마크 추가
        $("#item_" + id).classList.add("wish");
    }
    /*게임 저장*/main.saveData();
};
//★찜하기 지우기 (특정 위치 기준)
displayP.prototype.removeWish = function(id, cmd) {
    //찜 설정 사운드
    if (cmd !== "noSound" && user.option.sfx) sfxObj.wish_set.play();
    //찜 해제
    user.wish.splice(user.wish.indexOf(id),1);
    //찜 현황 반영
    display.checkWish(id);
    //해당 아이템 WISH 마크 제거, 아이콘 색상 복구
    $("#item_" + id).classList.remove("wish");

    /*게임 저장*/main.saveData();
};
//★ 찜 현황 반영
displayP.prototype.checkWish = function() {
    var item, id = "", num = 0;
    for (i = 0;i < wishLimit;i++) {
        //(찜해둔 칸)
        if (user.wish[i]) {
            //변수 지정
            id = user.wish[i];
            item = indexArrKey(itemList,"id",id);
            //찜 아이콘 체크
            $("#wish_item_icon" + (i+1).toString()).classList.remove("nothing");
            $("#wish_item_icon" + (i+1).toString()).style.backgroundPosition =
                spritePosition(item.icon,"rem");
            //찜 아이템 보유여부 체크
            if (user.inventory[id] && user.inventory[id].have > 0) {
                $("#wish_item_state" + (i+1).toString()).classList.remove("no");
                $("#wish_item_state" + (i+1).toString()).classList.add("yes");
            } else {
                $("#wish_item_state" + (i+1).toString()).classList.remove("yes");
                $("#wish_item_state" + (i+1).toString()).classList.add("no");
            }
        //(찜 안해둔 칸)
        } else {
            //아이콘 제거
            $("#wish_item_icon" + (i+1).toString()).style.backgroundPosition = "";
            $("#wish_item_icon" + (i+1).toString()).classList.add("nothing");
            //찜 아이템 보유여부 : OFF
            $("#wish_item_state" + (i+1).toString()).classList.remove("yes");
            $("#wish_item_state" + (i+1).toString()).classList.remove("no");
        }
    }
};
//★찜하기 초기화
displayP.prototype.clearWish = function() {
    swal({
        text:"찜 목록을 초기화하시겠습니까?",
        type:"warning",
        showCancelButton:true,
        confirmButtonText: '예',
        cancelButtonText: '아니요',
        cancelButtonColor: '#d33'
    }).then(function(isConfirm){
        if (isConfirm) {
            var length = user.wish.length;
            for (var it = length - 1;it >= 0;it--) {
                this.removeWish(user.wish[it],"noSound");
            }
            //초기화 별도 사운드
            if (user.option.sfx) sfxObj.wish_set.play();
        }
    }.bind(this));
};
var display = new displayP();


//게임 샐힝, 메뉴 관련
function mainP() {}
//※ 데이터 로드
mainP.prototype.loadData = function() {
    if (localStorage) {
        if(!localStorage["minihell"]) {
            //없으면 초기치 만들기
            saveData("game");
        } else {
            //있으면 불러오기
            user = deepCopy(localGet("minihell"));
            //데이터 정제
            this.maintainData();
            //불러온 파일 적용
                //회차
                $("#board_count_num").innerHTML = thousand(user.count);
                //획득 아이템 수 (에픽, 소울, 구슬)
                    $("#board_epic_num").innerHTML = thousand(user.holding.epic.have);
                    $("#board_soul_num").innerHTML = thousand(user.holding.soul.have);
                    $("#board_beed_num").innerHTML = thousand(user.holding.beed.have);
                //탐색모드 설정
                $("#searchMode_text").innerHTML = user.option.searchMode || "에픽";
                //사운드 모드
                switch (user.option.bgm) {
                    case 1:
                        $("#main_sound_change").innerHTML = "사운드 <span class='color_red'>끄기</span>";

                        break;
                    case 0:
                        $("#main_sound_change").innerHTML = "사운드 <span class='color_green'>켜기</span>";

                        break;
                    case undefined:
                        $("#main_sound_change").innerHTML = "사운드 <span class='color_green'>켜기</span>";

                        break;
                }
                //캐릭터 설정
                main.changeCharacter(user.myCharacter);
        }
    }
};
//※ 데이터 정제 (이전 버전 데이터)
mainP.prototype.maintainData = function() {
    if (!user.option) user.option = {};
    if (!user.option.bgm) user.option.bgm = user.bgm;
    if (!user.option.bgm) user.option.sfx = user.sfx;
    if (!user.option.searchMode) user.option.searchMode = "에픽";
};
//※ 데이터 세이브
mainP.prototype.saveData = function(cmd) {
    //세이브 시점 : 탐색 종료, 아이템 찜 등록/해제, 사운드 설정, 캐릭터 변경
    if (localStorage) {
        localStore("minihell",user);
    }
};
//★ 이미지 선로딩
mainP.prototype.loadImage = function(arr, callback) {
    //원본 출처 : http://stackoverflow.com/questions/8264528/image-preloader-javascript-that-supports-eventNames/8265310#8265310
    //로딩 이미지 준비
    $("#cover_loading_bar").style.width = "0%";
    $("#cover_loading_text").innerHTML = "이미지 로딩 중...";
    $("#cover_loading").className = "hidden1";
    void $("#cover_loading").offsetWidth;
    $("#cover_loading").className = "";
    //로딩
    var imagesArray = [];
    var img;
    var initial = arr.length;
    var remaining = arr.length;
    //이미지
    for (i = 0; i < arr.length; i++) {
        img = new Image();
        img.onload = function() {
            //내부 처리
            --remaining;
            //외부 처리
            $("#cover_loading_bar").style.width = (((initial - remaining)/initial)*100).toString() + "%";
            //향후
            if (remaining <= 0) {
                //로딩 이미지 끄지 않기 (사운드 로딩 남아있음)
                //콜백
                callback();
            }
        };
        img.onerror = function() {
            //내부 처리
            --remaining;
            //외부 처리
            $("#cover_loading_bar").style.width = (((initial - remaining)/initial)*100).toString() + "%";
            //향후
            if (remaining <= 0) {
                //로딩 이미지 끄지 않기 (사운드 로딩 남아있음)
                //콜백
                callback();
            }
        };
        img.src = arr[i];
        $("#imagePreloader").innerHTML += "<img src='" + arr[i] + "' />";
        imagesArray.push(img);
    }
};
//★ 오디오 선로딩
mainP.prototype.loadAudio = function(target, callback) {//로딩 이미지 준비
    //로딩바 등장
    $("#cover_loading_bar").style.width = "0%";
        //로딩바 설명
        switch(target) {
            case "sfx":
                $("#cover_loading_text").innerHTML = "효과음 로딩 중...";

                break;
            default:
                $("#cover_loading_text").innerHTML = "배경음악 로딩 중...";

                break;
        }
    $("#cover_loading").className = "hidden1";
    void $("#cover_loading").offsetWidth;
    $("#cover_loading").className = "";
    var audioObj = {};
        //로딩 대상 불러오기
        switch(target) {
            case "sfx":
                for (var attrname in sfxObj) {
                    //효과음은 무조건 로딩
                    if (!sfxObj[attrname].loadCompleted) audioObj[attrname] = sfxObj[attrname];
                }

                break;
            default:
                //BGM은 사운드 활성화했을 때만 로딩
                if ((user.option.bgm) && !bgmObj[target].loadCompleted) audioObj[target] = bgmObj[target];

                break;
        }
    var initial = Object.keys(audioObj).length;
    var remaining = Object.keys(audioObj).length;
    //브금 lazy 로딩 (게이트 빼고)
    /*
    for (k in bgmObj) {
        if (k !== "gate")
        bgmObj[k].load();
    }
    */
    //(로딩할 게 없으면) 당장 실행
    if (initial === 0) {
        //0.3초 뒤 (애니메이션)
        setTimeout(function() {
            //길이 100% 만들기
            $("#cover_loading_bar").style.width = "100%";
            //로딩 이미지 끄기
            $("#cover_loading").className = "hidden1";
            void $("#cover_loading").offsetWidth;
            $("#cover_loading").className = "hidden2";
            callback();
        }, 300);

        return;
    }
    //(아니면) 로딩 개시
    for (j in audioObj) {
        if (audioObj.hasOwnProperty(j)) {
            if (!audioObj[j].loadCompleted) {
                audioObj[j].once("load",function() {
                    //내부 처리
                    --remaining;
                    //외부 처리
                    $("#cover_loading_bar").style.width = (((initial - remaining)/initial)*100).toString() + "%";
                    //향후
                    if (remaining <= 0) {
                        setTimeout(function() {
                            //로딩 이미지 끄기
                            $("#cover_loading").className = "hidden1";
                            void $("#cover_loading").offsetWidth;
                            $("#cover_loading").className = "hidden2";
                            //콜백
                            callback();
                        }, 300);
                    }
                });
                audioObj[j].once("loaderror",function() {
                    //내부 처리
                    --remaining;
                    //외부 처리
                    $("#cover_loading_bar").style.width = (((initial - remaining)/initial)*100).toString() + "%";
                    //향후
                    if (remaining <= 0) {
                        setTimeout(function() {
                            //로딩 이미지 끄기
                            $("#cover_loading").className = "hidden1";
                            void $("#cover_loading").offsetWidth;
                            $("#cover_loading").className = "hidden2";
                            //콜백
                            callback();
                        }, 300);
                    }
                });
                audioObj[j].load();
                audioObj[j].loadCompleted = true;
            }
        }
    }
};
//★던전 선택창 생성 (나중에 하면 렉걸리니)
mainP.prototype.createDungeon = function() {
    //버튼 임시저장
    var tagFrag = document.createDocumentFragment();
    //던전 수량 임시저장
    var dgNum = 0;
    //버튼 생성
    for (i = 0;i < dungeonList.length;i++) {
        //notCreatable은 생성하지 말 것
        if (dungeonList[i].notCreatable === 1) continue;
        //최초 던전 : 게이트 아래에 지역명 표시
        if (dgNum === 0) {
            $("#dg_box_title").dataset.area = dungeonList[i].area_id;
            $("#dg_box_title_name").innerHTML = dungeonList[i].area_name;
            //지역명 수집
            areaList.push(dungeonList[i].area_id);
        }
        //(최초 던전 제외) 각 지역 첫 던전 : 제목줄 표시
        if (dgNum !== 0  &
            (i > 0 && dungeonList[i].area_id !== dungeonList[i-1].area_id)) {
            var el_area = document.createElement("#area_" + dungeonList[i].area_id + ".slot_area");
                el_area.dataset.area = dungeonList[i].area_id;
                el_area.innerHTML = dungeonList[i].area_name;
            tagFrag.appendChild(el_area);
            //지역명 수집
            areaList.push(dungeonList[i].area_id);
        }
        var el_button = document.createElement("button#dg_" + dungeonList[i].id +
            ".slot_list.dg_list[data-target='" + dungeonList[i].id + "']");
            el_button.dataset.dungeon = dungeonList[i].id;
            el_button.dataset.area = dungeonList[i].area_id;
            //각자 배경 지정
            el_button.style.backgroundImage = "url('./img/slot/" + dungeonList[i].id + ".png')";
        //던전 추가, 던전 수량 증가
        tagFrag.appendChild(el_button);
        dgNum += 1;
    }
    //붙여넣기
    $("#dg_box").appendChild(tagFrag);
    //던전 스크롤 -> (지역명 변경 시) 지역명 타이틀 변경
    $("#dg_box").onscroll = function() {
        main.changeDungeonTitle();
    };
};
//★ 던전 스크롤 -> (지역명 변경 시) 지역명 타이틀 변경
mainP.prototype.changeDungeonTitle = function() {
    var mainW = $("#frame_main").offsetWidth;
    var boxW = $("#dg_box").offsetWidth;
    var boxT = $("#dg_box").offsetTop;
    var el = document.elementFromPoint(mainW - boxW/2,boxT);
    if (el.dataset.area && $("#dg_box_title").dataset.area !== el.dataset.area) {
        $("#dg_box_title").dataset.area = el.dataset.area;
        $("#dg_box_title_name").innerHTML = indexArrKey(dungeonList,"area_id",el.dataset.area).area_name;
    }
};
//★도감 창 생성 (나중에 하면 렉걸리니)
mainP.prototype.createInventory = function() {
    //var text = "";
    var scrollArr = [];
    var item;
    var id = "";
    var rarity = "";
    var set = "";
    var setKey = "";
    var line = "";
    var amount = 0;
    var firstGet = 0;
    var icon = "";
        var icon_position = "";
    //아이템 줄 생성 함수
    function createItem(num) {
        //아이템 선정
        item = itemList[num];
        //(아직은) 85, 90레벨 장비만 생성
        if (item.level !== 85 && item.level !== 90) return false;
        //ID, 등급 기억
        id = item.id;
        rarity = (item.set === "") ? "epic" : "set";
        amount = (user.inventory[id]) ? user.inventory[id].have : 0;
        firstGet = (user.inventory[id]) ? user.inventory[id].firstGet : 0;
        if (amount === 0) rarity = "nothing";
        //세트 키워드
        if (item.set !== "") {
            if (item.set !== set) {
                setKey = "┏ ";
                line = "line_set";
                set = item.set;
            } else {
                if (itemList[i+1]) {
                    if (item.set === itemList[i+1].set) {
                        setKey = "┣ ";
                        line = "line_set";
                    } else {
                        setKey = "┗ ";
                        line = "";
                    }
                } else {
                    setKey = "┗ ";
                    line = "";
                }
            }
        } else {
            setKey = "";
            set = "";
            line = "";
        }
        //방어구 등급
        var ttype = (item.sort1 === "방어구") ? item.sort2 : item.sort3;
        //아이콘 좌표 계산
        icon = item.icon;
        icon_position = spritePosition(icon,"rem");
        //★아이템 element 생성
        var el_item = document.createElement("li#item_" + id + ".item_li" +
            ".color_" + rarity + "." + line);
            //아이템에 이름, 수량 붙임
            var string = setKey + item.name + "<br/>[x" + amount + "]";
            el_item.innerHTML = string;
        var el_icon = document.createElement("p.icon." + rarity + "[style='background-position:" + icon_position + "']");
        var el_firstGet = document.createElement("span.firstGet.color_gray." + rarity);
            el_firstGet.innerHTML = " (" + firstGet + "회차)";
        var el_detail = document.createElement("span.right.color_white");
            el_detail.innerHTML =  "[Lv." + item.level.toString() + "][" + ttype + "]";
        //★아이템이 찜한건 지 체크
        if (user.wish.indexOf(id) >= 0) {
            //해당 아이템 이름 색상 변경, WISH 아이콘 추가
            el_item.classList.add("wish");
        }
        //★아이템 element 모으기
        el_item.appendChild(el_icon);
        el_item.appendChild(el_firstGet);
        el_item.appendChild(el_detail);
        //아이템 줄 미리 붙여두기
        scrollArr.push(el_item.outerHTML);
    }
        //아이템 줄 생성 개시
        for (i = 0;i < itemList.length;i++) {
            createItem(i);
        }
        //클러스터 생성 (부드로운 스크롤)
        var clusterize_inventory = new Clusterize({
            rows:[],
            scrollId: 'inventory_box',
            contentId: 'inventory_scroll',
            //하단 1번 : 1 블록에 들어가는 최대 row 수 (디폴트 : 50)
            //하단 2번 : 1 클러스터에 들어가는 최대 블록 수 (디폴트 : 4)
            rows_in_block:15,
            blocks_in_cluster:Math.ceil(scrollArr.length / 15)
        });
        //클러스터 추가
        clusterize_inventory.append(scrollArr);
        //★ (클러스터 생성 후) 클러스터 클릭 이벤트 추가 (찜하기)
        $("#inventory_scroll").addEventListener("click",function(e) {
            e = e || event;
            var target = e.target || e.srcElement;
            if(target.nodeName !== "LI") return;
            display.clickWish(target.id.replace("item_",""));
        }, false);
    //찜 현황 반영
    display.checkWish();
};
//★ 첫 실행
mainP.prototype.init = function() {
    //메인 버튼 활성화
    $("#button_main").disabled = false;
    $("#button_main").innerHTML = "실행";
    $("#button_main").onclick = function() {
        //사이드 버튼 출력
        main.setButton("init");
        //처음부터 하기
        $("#button_left").onclick = function() {
            swal({
                title:"처음부터 하기",
                html:"기존에 저장된 데이터가 지워질 수 있습니다.<br/>" +
                    "어플이 아니라면, 데이터 소모에 주의하세요.",
                imageUrl: './img/icon_crack.png',
                imageWidth: 128,
                imageHeight: 128,
                showCancelButton:true,
                confirmButtonText: '예',
                cancelButtonText: '아니요',
                cancelButtonColor: '#d33'
            }).then(function(isConfirm){
                if (isConfirm) {
                    //일반 버튼 모드
                    main.setButton("normal");
                    //버튼 비활성화
                    $("#button_left").disabled = true;
                    $("#button_right").disabled = true;
                    $("#button_main").disabled = true;
                    $("#button_main").innerHTML = "입장 중...";
                    ///구글 플레이 버튼 지우기
                    $("#cover_google").style.display ="none";
                    //이미지 로딩
                    main.loadImage(imageList, function() {
                        //던전 목록, 아이템 도감 작성
                        setTimeout(function() {
                            main.createDungeon();
                            main.createInventory();
                        },0);
                        //효과음 로딩
                        main.loadAudio("sfx", function() {
                            //커버 타이틀 변경
                            $("#cover_title").innerHTML = "입장 중...";
                            //공지 지우기
                            $("#cover_notice").style.display ="none";
                            //캐릭터 랜덤 선정
                            main.changeCharacter("random");
                            //게이트 입장
                            main.enterMap("gate");
                        });
                    });
                }
            });
        };
        //이어서 하기
        $("#button_right").onclick = function() {
            //불러올 데이터 없음
            if (!localStorage || !localStorage.minihell) {
                swal({
                    title:"이어하기 불가",
                    text:"불러올 데이터가 없습니다",
                    type:"error"
                });
            //불러올 데이터 있음
            } else {
                swal({
                    title:"이어서 하기",
                    html:"이어서 하시겠습니까?<br/>" +
                    "(플레이 진행 : <strong>" + thousand(JSON.parse(localStorage.minihell).count) + "</strong>회차,<br>" +
                    "획득 에픽 : <strong>" + thousand(JSON.parse(localStorage.minihell).holding.epic.get) + "</strong>개,<br>" +
                    "소울 : <strong>" + thousand(JSON.parse(localStorage.minihell).holding.soul.get) + "</strong>개, " +
                    "구슬 : <strong>" + thousand(JSON.parse(localStorage.minihell).holding.beed.get) + "</strong>개)",
                    type:"info",
                    showCancelButton:true,
                    confirmButtonText: '예',
                    cancelButtonText: '아니요',
                    cancelButtonColor: '#d33'
                }).then(function(isConfirm){
                    if (isConfirm) {
                        //로딩 게시
                        main.loadData();
                        //일반 버튼 모드
                        main.setButton("normal");
                        //버튼 비활성화
                        $("#button_left").disabled = true;
                        $("#button_right").disabled = true;
                        $("#button_main").disabled = true;
                        $("#button_main").innerHTML = "입장 중...";
                        ///구글 플레이 버튼 지우기
                        $("#cover_google").style.display ="none";
                        //이미지 로딩
                        main.loadImage(imageList, function() {
                            //던전 목록, 아이템 도감 작성
                            setTimeout(function() {
                                main.createDungeon();
                                main.createInventory();
                            },0);
                            //효과음 로딩
                            main.loadAudio("sfx", function() {
                                //커버 타이틀 변경
                                $("#cover_title").innerHTML = "입장 중...";
                                //공지 지우기
                                $("#cover_notice").style.display ="none";
                                //게이트 입장
                                main.enterMap("gate");
                            });
                        });
                    }
                });
            }
        };
    };
};
//★ 버튼 설정
mainP.prototype.setButton = function(situation) {
    switch (situation) {
        //처음부터 하기, 이어서 하기
        case "init":
            $("#button_left").classList.add("hide");
            $("#button_left").classList.add("long");
            $("#button_left").innerHTML = "시작하기";
            $("#button_right").classList.add("hide");
            $("#button_right").classList.add("long");
            $("#button_right").innerHTML = "이어서 하기";
            $("#button_main").classList.add("hide");

            break;
        //일반 모드
        case "normal":
            $("#button_left").classList.remove("hide");
            $("#button_left").classList.remove("long");
            $("#button_left").innerHTML = "획득<br/>기록";
            $("#button_right").classList.remove("hide");
            $("#button_right").classList.remove("long");
            $("#button_right").innerHTML = "지역<br/>선택";
            $("#button_main").classList.remove("hide");

            break;
        //모조리 비활성화
        case "disableAll":
            $("#button_left").disabled = true;
            $("#button_main").disabled = true;
            $("#button_right").disabled = true;
            $("#main_inventory").disabled = true;
            $("#main_search_change").disabled = true;
            $("#main_sound_change").disabled = true;
            $("#main_character_change").disabled = true;

            break;
        //모조리 활성화(게이트 빼고)
        case "enableAll":
            $("#button_left").disabled = false;
            if (selectedDungeon.now.id !== "gate")
                $("#button_main").disabled = false;
            $("#button_right").disabled = false;
            $("#main_inventory").disabled = false;
            $("#main_search_change").disabled = false;
            $("#main_sound_change").disabled = false;
            $("#main_character_change").disabled = false;

            break;
    }
};
//★ 마을/던전 진입하기
mainP.prototype.enterMap = function(target) {
    //입장 사운드
    if (user.option.sfx) sfxObj.map_show.play();
    //메인 버튼 문구 변경
    $("#button_main").innerHTML = "입장 중...";
    //던전 정보 변경
    selectedDungeon.after = indexArrKey(dungeonList,"id",target);
    //던전 입장 이미지
    $("#frame_cover").style.display = "block";
    $("#frame_cover").style.opacity = "1";
    $("#frame_cover_bg").style.backgroundImage = "url('./img/bg/loading_" + target.split("_")[0] + ".jpg')";
    $("#frame_cover_bg").style.opacity = "1";
    //입장 사운드 로딩
    main.loadAudio(target,function() {
        //던전 입장 사운드
        if (user.option.sfx) sfxObj.map_enter.play();
        //블랙 아웃 딜레이
        setTimeout(function() {
            //===============================================================
            //블랙 아웃 (던전 정보 반영)
            $("#frame_cover_bg").style.opacity = "0";
            //던전 배경 변경
            $("#frame_main").style.backgroundImage = "url('./img/bg/bg_" + target + ".jpg')";
                //배경 미세조정
                var dg = indexArrKey(dungeonList,"id",target);
                $("#frame_main").style.backgroundPosition = dg.bgPosition;
            //캐릭터, 아이템 배치
            if (target !== "gate") {
                //던전 - 캐릭터 배치
                $("#main_character").classList.remove("gate");
                $("#main_character").classList.add("dungeon");
                //던전 - 아이템 원위치
                simulate.resetItem();
                //던전 -  (입장하는 던전의) 아이템 드랍 부위/레벨 가중치 구축
                simulate.build(target);
                //던전 - NPC 관련 치우기
                $("#main_npc_text").style.display = "none";
                $("#main_npc").style.display = "none";
                $("#main_search_change").style.display = "none";
                $("#main_sound_change").style.display = "none";
                $("#main_character_change").style.display = "none";
                //$("#main_inventory").style.display = "none";
            } else {
                //게이트
                $("#main_character").classList.remove("dungeon");
                $("#main_character").classList.add("gate");
                //아이템 원위치
                simulate.resetItem();
                //던전 - NPC 표시
                $("#main_npc_text").style.display = "inline-block";
                $("#main_npc").style.display = "block";
                $("#main_search_change").style.display = "block";
                $("#main_sound_change").style.display = "block";
                $("#main_character_change").style.display = "block";
                //$("#main_inventory").style.display = "block";
            }
            //===============================================================
            setTimeout(function() {
                //입장 완료
                $("#frame_cover").style.opacity = "0";
                //기존 브금 종료
                if (selectedDungeon.now.id && selectedDungeon.now.id !== selectedDungeon.after.id)
                    bgmObj[selectedDungeon.now.id].stop();
                //새 브금 실행 (브금이 다르거나, 같은데 브금이 미실행중이라면)
                if (selectedDungeon.now.id !== selectedDungeon.after.id ||
                    (selectedDungeon.now.id === selectedDungeon.after.id &&
                    !bgmObj[selectedDungeon.after.id].playing())) {
                    if (user.option.bgm) bgmObj[selectedDungeon.after.id].play();
                }
                setTimeout(function() {
                    //던전 변경 완료
                    selectedDungeon.now = selectedDungeon.after;
                    selectedDungeon.after = {};
                    //클릭 가능
                    $("#frame_cover").style.display = "none";
                    //버튼들 활성화
                    main.setButton("enableAll");
                    //메인 버튼 문구 변경
                    if (selectedDungeon.now.id !== "gate") {
                        $("#button_main").innerHTML = user.option.searchMode + " 탐색";
                    }
                    else {
                        $("#button_main").innerHTML = "클릭 ▷";
                    }
                    //메뉴 버튼 설정
                    main.setMenuButton();

                },750);
            },750);
        },750);
    });
};
//★ 캐릭터 변경
mainP.prototype.changeCharacter = function(cmd) {
    //캐릭터 목록 생성
    var chaList = [];
    for (i in characterList) {
        if (characterList.hasOwnProperty(i)) {
            chaList.push(i);
        }
    }
    //캐릭터 선택 (cmd에 따라)
    switch (cmd) {
        case "random":
            user.myCharacter = chaList[Math.floor(Math.random() * chaList.length)];

            break;
        default:
            user.myCharacter = cmd;

            break;
    }
    //선택된 캐릭터 출력
    for (i = 0;i < chaList.length;i++) {
        $("#main_character").classList.remove(chaList[i]);
    }
    $("#main_character").classList.add(user.myCharacter);
};
//※ 메뉴창 열기/닫기
mainP.prototype.toggleMenu = function(target, cmd, callback) {
    //cmd 종류 : open, close, act, enter
    //*사전 - 이동거리 준비
    var num = 0;
    switch (cmd) {
        case "open":
            num = 100;
            break;
        case "close":
            num = 0;
            break;
        case "act":
            num = 0;
            break;
        case "enter":
            num = 0;
            break;
    }
    if (target === "right") {
        num *= -1;
    }
    //작동 개시
        //(열기라면)
        if (cmd === "open") {
            //버튼 비황성화
            main.setButton("disableAll");
            //메뉴 생성
            $("#frame_slot_" + target).style.display = "block";
        }
    //사운드 출력 (act, enter 제외)
    if (user.option.sfx && cmd !== "act" && cmd !== "enter") sfxObj["slot_" + cmd].stop().play();
    //중앙부 밝기 조절 (frame_main, frame_board, frame_button)
    var bright = (100 - Math.abs(num) / 1.3).toString() + "%";
    $("#frame_main").style.filter = "brightness(" + bright + ")";
    $("#frame_board").style.filter = "brightness(" + bright + ")";
    $("#frame_button").style.filter = "brightness(" + bright + ")";
    //메뉴 이동
    TweenMax.to($("#frame_slot_" + target),0.3,{xPercent:num,
        onComplete:function() {
            //(닫기라면)
            if (cmd === "close") {
                //메뉴 제거
                $("#frame_slot_" + target).style.display = "none";
                //버튼 활성화
                main.setButton("enableAll");
            //(적용이라면)
            } else if (cmd === "act") {
                //메뉴만 제거
                $("#frame_slot_" + target).style.display = "none";
                //버튼 활성화
                main.setButton("enableAll");
            //(입장이라면)
            }else if (cmd === "enter") {
                //메뉴 제거
                $("#frame_slot_" + target).style.display = "none";
            }
            //콜백 있으면 개시
            if (callback) callback();
        }
    });
};
//★ 각종 "주" 버튼 설정
mainP.prototype.setMenuButton = function() {

    //※ 좌측 버튼 1 : 획득 기록
    $("#button_left").onclick = function() {
        //메뉴창 열기
        main.toggleMenu("left","open");
        //좌측 메뉴창 제목 설정
        $("#slot_title_left").innerHTML = "에픽아이템 도감";
        //획득기록창 열기
        $("#record_box").style.display = "block";
        //획득내용 보여주기
        display.showRecord();
    };
    //※ 좌측 버튼 2 : 도감
    $("#main_inventory").onclick = function() {
        //메뉴창 열기
        main.toggleMenu("left","open");
        //좌측 메뉴창 제목 설정
        $("#slot_title_left").innerHTML = "에픽아이템 도감";
        //도감창 & 설명 열기
        $("#inventory_box").style.display = "block";
        $("#inventory_footer").style.display = "block";
        //찜하기 창 키우기
        $("#frame_wish").classList.remove("mini");
    };
        //※ 좌측 내부 버튼 1 : 도감 - 찜 개별 초기화
        for (var iw = 0;iw < wishLimit;iw++) {
            (function(iw) {
                $("#wish_item_icon" + (iw+1).toString()).onclick = function() {
                    if (user.wish[iw]) {
                        display.removeWish(user.wish[iw]);
                    }
                };
            })(iw);
        }
        //※ 좌측 내부 버튼 2 : 도감 - 찜 초기화
        $("#wish_clear").onclick = function() {
            display.clearWish();
        };
    // 좌측 버튼 공통 : 닫기 버튼
    $("#slot_left_close").onclick = function() {
        //찜하기 창 줄이기
        $("#frame_wish").classList.add("mini");
        //획득내용 지우기
        display.clearRecord();
        //메뉴창 닫기
        main.toggleMenu("left","close",function() {
            //모든 내부선택창 닫기
            $("#record_box").style.display = "none";
            $("#inventory_box").style.display = "none";
            $("#inventory_footer").style.display = "none";
        });
    };


    //※ 우측 버튼 1 : 던전 변경
    $("#button_right").onclick = function() {
        //메뉴창 열기
        main.toggleMenu("right","open");
            //던전 선택창 열기
            $("#dg_box").style.display = "block";
            //우측 메뉴창 제목 설정
            $("#dg_header").style.display = "block";
            $("#slot_title_right").innerHTML = "이동 지역 선택";
        //내부 클릭 1 - 던전 교체
        for (i=0;i<$$(".dg_list").length;i++) {
            (function() {
                var bt = $$(".dg_list")[i];
                bt.onclick = function() {
                    //마을/던전 입장하기
                    main.enterMap(bt.dataset.dungeon);
                    //메뉴창 닫기
                    main.toggleMenu("right","enter",function() {
                        //던전 선택창 닫기
                        $("#dg_header").style.display = "none";
                        $("#dg_box").style.display = "none";
                    });
                };
            })();
        }
        //내부 클릭 2 - 던전 스크롤
        $("#dg_box_arrow_down").onclick = function() {
            var pos = areaList.indexOf(dg_box_title.dataset.area);
            if (pos < areaList.length - 1) {
                TweenMax.to($("#dg_box"),0.2,{scrollTo:$("#area_" + areaList[pos+1]).offsetTop});
            } else {
                TweenMax.to($("#dg_box"),0.2,{scrollTo:$("#dg_box").scrollHeight - $("#dg_box").offsetHeight});
            }
            //사운드 출력
            if (user.option.sfx) sfxObj.slot_close.play();
            $("#dg_box_arrow_down").blur();
        };
        $("#dg_box_arrow_up").onclick = function() {
            //현재 스크롤 최상단 element 파악
                var mainW = $("#frame_main").offsetWidth;
                var boxW = $("#dg_box").offsetWidth;
                var boxT = $("#dg_box").offsetTop;
                var el = document.elementFromPoint(mainW - boxW/2,boxT);
            var pos = areaList.indexOf(dg_box_title.dataset.area);
            if (pos !== 0) {
                if (!el.classList.contains("slot_area")) {
                    TweenMax.to($("#dg_box"),0.2,{scrollTo:$("#area_" + areaList[pos]).offsetTop});
                } else {
                    if (pos !== 1) {
                        TweenMax.to($("#dg_box"),0.2,{scrollTo:$("#area_" + areaList[pos-1]).offsetTop});
                    } else {
                        TweenMax.to($("#dg_box"),0.2,{scrollTo:0});
                    }
                }
            } else {
                TweenMax.to($("#dg_box"),0.2,{scrollTo:0});
            }
            //사운드 출력
            if (user.option.sfx) sfxObj.slot_close.play();
            $("#dg_box_arrow_down").blur();

        };
    };
    //※ 우측 버튼 2 : 캐릭터 변경
    $("#main_character_change").onclick = function() {
        //메뉴창 열기
        main.toggleMenu("right","open");
            //우측 메뉴창 제목 설정
            $("#slot_title_right").innerHTML = "캐릭터 선택";
            //캐릭터 선택창 열기
            $("#cha_box").style.display = "block";
        //캐릭터 교체
        for (i=0;i<$$(".cha_list").length;i++) {
            (function() {
                var bt = $$(".cha_list")[i];
                bt.onclick = function() {
                    //캐릭터 변경
                    main.changeCharacter(bt.dataset.character);
                    //효과음
                    if (user.option.sfx) sfxObj.slot_act.play();
                    //메뉴창 닫기
                    main.toggleMenu("right","act",function() {
                        //캐릭터 선택창 닫기
                        $("#cha_box").style.display = "none";
                    });
                };
            })();
        }
    };
    //★ 우측 버튼 공통 : 닫기 버튼
    $("#slot_right_close").onclick = function() {
        //메뉴창 닫기
        main.toggleMenu("right","close",function() {
            //모든 내부선택창 닫기
            $("#cha_box").style.display = "none";
            $("#dg_header").style.display = "none";
            $("#dg_box").style.display = "none";
        });
    };


    //※ 중앙 버튼 : 탐색 개시
    $("#button_main").onclick = function() {
        //버튼 사운드
        if (user.option.sfx) sfxObj.slot_open.play();
        switch (state) {
            case "waiting":
                //실행상태 변경
                state = "running";
                //탐색 준비
                simulate.ready();

                break;
            case "running":
                //실행상태 변경
                state = "waiting";
                //버튼 문구 변경 & 활성화
                $("#button_main").innerHTML = "중단 중...";
                $("#button_main").disabled = true;
                //차후 탐색 함수에서 자동 종료

                break;
            default:
                break;
        }
    };
    //※ 기타 버튼 : 사운드 변경
    $("#main_sound_change").onclick = function() {
        switch (user.option.bgm) {
            case 1:
                user.option.bgm = 0;
                user.option.sfx = 0;
                $("#main_sound_change").innerHTML = "사운드 <span class='color_green'>켜기</span>";
                bgmObj[selectedDungeon.now.id].stop();

                /*게임 저장*/main.saveData();
                break;
            case 0:
                user.option.bgm = 1;
                user.option.sfx = 1;
                $("#main_sound_change").innerHTML = "사운드 <span class='color_red'>끄기</span>";
                //사운드 비활성화 시
                if (bgmObj[selectedDungeon.now.id].loadCompleted) {
                    bgmObj[selectedDungeon.now.id].play();
                } else {
                    swal({
                        title:"불러올 음악이 없음",
                        text:"현재 지역 재입장 시 배경음악을 들을 수 있습니다.",
                        type:"info"
                    });
                }

                /*게임 저장*/main.saveData();
                break;
            //(오류 대처 용) 둘다 아니면 일단 틀고 보기
            default:
                user.option.bgm = 1;
                user.option.sfx = 1;
                $("#main_sound_change").innerHTML = "사운드 <span class='color_red'>끄기</span>";
                //사운드 비활성화 시
                if (bgmObj[selectedDungeon.now.id].loadCompleted) {
                    bgmObj[selectedDungeon.now.id].play();
                } else {
                    swal({
                        title:"불러올 음악이 없음",
                        text:"현재 지역 재입장 시 배경음악을 들을 수 있습니다.",
                        type:"info"
                    });
                }

                /*게임 저장*/main.saveData();
                break;
        }
    };
    //※ 기타 버튼 : 탐색모드 변경
    $("#main_search_change").onclick = function() {
        //탐색모드 선택창 개방
        swal({
            title:"탐색모드 설정",
            text:"탐색이 자동으로 멈추는 시점을 설정해주세요",
            input:"radio",
            confirmButtonText:"설정 적용하기",
            inputOptions:{
                "모두":"아무 아이템 습득 시",
                "에픽":"에픽 장비 습득 시",
                "찜하나":"찜한 장비 <strong>'하나'</strong> 습득 시",
                "모든찜":"찜한 장비 <strong>'모두'</strong> 습득 시",
                "무한":"자동으로 멈추지 않음"
            },
            inputValue:user.option.searchMode
        }).then(function(selected) {
            if (selected) {
                //적용 사운드 출력
                if (user.option.sfx) sfxObj.slot_act.play();
                //탐색모드 변경
                user.option.searchMode = selected;
                //탐색모드 출력
                $("#searchMode_text").innerHTML = user.option.searchMode;

                /*게임 저장*/main.saveData();
            }
        });

    };


};
var main = new mainP();
//=====================================================================
//※ 실행
//=====================================================================
    //오류 취급 (출처 : http://stackoverflow.com/questions/951791/javascript-global-error-handling)
    window.onerror = function(msg, url, line, col, error) {
        var extra = !col ? '' : ', Column : ' + col;
        extra += !error ? '' : '\n * 에러 : ' + error;
        var notice = " * 내용 : " + msg + "\n * Line : " + line + extra;
        if (swal) {
            swal({
                title:"오류 발생",
                type:"error",
                html:"아래의 내용을 제보해주시면 감사하겠습니다.<br>" +
                "(<a href='http://blog.naver.com/ansewo/220924971980' target='_blank'>클릭하면 블로그로 이동합니다</a>)<br/>" +
                notice.replaceAll("\n","<br>")
            });
        } else alert("아래의 내용을 제보해주시면 감사하겠습니다.(http://blog.naver.com/ansewo/220924971980)\n" + notice);
        var suppressErrorAlert = true;
        return suppressErrorAlert;
    };
        //테스트용
        window.onerror = function(){};
//★ 실행
document.addEventListener("DOMContentLoaded", function(e) {
    //초기 함수
    main.init();


    //강제 스크롤링 (터치 한정)
    /*
    var touchY = 0;//첫 터치 Y좌표 기억(스크립트 스크롤 용)
    var forcedScroll = [$("#dg_box"),$("#cha_box")];
    var f_len = forcedScroll.length;
    for (i=0;i<f_len;i++) {
        (function() {
            var target = forcedScroll[i];
            target.addEventListener("touchstart",function(e) {
                //스크롤 비활성화
                target.style.overflowY = "hidden";
                //$("#dg_box").classList.remove("scroll");
                //터치포인트 기억
                touchY = e.touches[0].clientY - target.offsetTop;
            },false);
            target.addEventListener("touchmove",function(e) {
                //스크롤 적용
                var touchYC = e.touches[0].clientY - target.offsetTop;
                target.scrollTop = target.scrollTop + (touchY - touchYC);
                //이동 이후 터치포인트 기억
                touchY = touchYC;
                //스크롤 -> (지역명 변경 시) 지역명 타이틀 변경
                main.changeDungeonTitle();
            },false);
            target.addEventListener("touchend",function(e) {
                //스크롤 재활성화
                target.style.overflowY = "scroll";
                //$("#dg_box").classList.add("scroll");
        },false);
        })();
    }
    */

    //나가기 경고
        //웹 브라우저
        window.addEventListener("beforeunload", function(e) {
            return "'에픽의 균열'을 종료하시겠습니까?";
        }, false);
        //어플리케이션
        function quit() {
            swal({
                text:"'에픽의 균열'을 종료하시겠습니까?",
                imageUrl: './img/icon_crack.png',
                imageWidth: 128,
                imageHeight: 128,
                showCancelButton:true,
                confirmButtonText: '종료',
                confirmButtonColor: '#d33',
                cancelButtonText: '취소'
            }).then(function(isConfirm){
                if (isConfirm) {
                    navigator.app.exitApp();
                }
            });
        }
        document.addEventListener("deviceready", function() {
            document.addEventListener("pause", onPause, false);
            document.addEventListener("resume", onResume, false);
            document.addEventListener("backbutton", onBackKeyDown, false);
        }, false);
        function onPause() {
            Howler.mute(true);
        }
        function onResume() {
            Howler.mute(false);
        }
        function onBackKeyDown() {
            quit();
            //navigator.notification.confirm('종료하시겠습니까?', onBackKeyDownMsg, '종료', '취소, 종료');
        }




});

})();
