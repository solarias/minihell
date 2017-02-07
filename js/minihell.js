
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
var droprate = [//임시 - 아이템 드랍률
    0.064,//마계 일반 던전
    0.11//마계의 틈
    //1//테스트용
];
var droptype = {
    name:["무기","방어구","악세서리","특수장비"],
    num:[1,1,1,0.2]//장비 타입별 드랍확률 가중치
};
var droplevel = {
    name:[85,90],
    num:[60,40]
};
var autoWish;//찜목록 늦게출현 오토
var wishLimit = 5;//찜하기 최대치

//던전 관련
var selectedDungeon = {before:"",after:""};
var dungeonList = [
    "gate","metro_1","metro_2","metro_3","metro_4","metro_5","metro_6"
];

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
        imageList.push("./img/bg/bg_" + dungeonList[i] + ".jpg");
        imageList.push("./img/slot/" + dungeonList[i] + ".png");
    }
    /*캐릭터 이미지*/
    for(i in characterList) imageList.push("./img/sprite/character_" + i + ".png");
    /*스프라이트 이미지*/
    imageList.push("https://solarias.github.io/dnf/sprite/images/sprite_item.png");
    imageList.push("https://solarias.github.io/dnf/sprite/images/sprite_hell.png");
    /*에픽 이펙트*/
    imageList.push("./img/epic_appear.png");
    imageList.push("./img/epic_land.png");
    imageList.push("./img/epic_land_wish1.png");
    imageList.push("./img/epic_land_wish2.png");
    imageList.push("./img/epic_land_wish3.png");
    imageList.push("./img/epic_wait.png");
    imageList.push("./img/epic_wait_wish1.png");
    imageList.push("./img/epic_wait_wish2.png");
    imageList.push("./img/epic_wait_wish3.png");
    imageList.push("./img/epic_wait_wish4.png");
    imageList.push("./img/epic_wait_wish5.png");
    /*기타 이미지*/
    imageList.push("./img/npc/seria.png");
    imageList.push("./img/epic_crack.png");
//브금
var bgmObj = {};
for (i = 0;i < dungeonList.length;i++) {
    bgmObj[dungeonList[i]] = new Howl({
        src:[
            "./sound/bgm/bgm_" + dungeonList[i] + ".ogg",
            "./sound/bgm/bgm_" + dungeonList[i] + ".mp3"
        ],
        preload:false,
        loop:true,
        volume:0.3
    });
}
//효과음
var epicSfxList = ["epic_appear","epic_land","epic_appear_wish","epic_land_wish"];
var hitList = ["hit_slash","hit_hit","hit_gun","hit_magic","hit_beckey"];
var sfxList = ["slot_open","slot_close","map_show","map_enter", "wish_set"];
var sfxObj = {};
//에픽 사운드 업데이트
for (i = 0;i < epicSfxList.length;i++) {
    sfxObj[epicSfxList[i]] = new Howl({
        src:["./sound/sfx/sfx_" + epicSfxList[i] + ".ogg", "./sound/sfx/sfx_" + epicSfxList[i] + ".mp3"],
        preload:false,
        loop:false,
        volume:0.2
    });
}
//타격음 업데이트
for (i = 0;i < hitList.length;i++) {
    sfxObj[hitList[i]] = new Howl({
        src:["./sound/sfx/sfx_" + hitList[i] + ".ogg", "./sound/sfx/sfx_" + hitList[i] + ".mp3"],
        preload:false,
        loop:false,
        volume:0.8
    });
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
        sfx:1
    }
};

//=====================================================================
//※ 처리 함수
//=====================================================================
//탐색 관련
function simulateP() {}
//★탐색 전 부위/레벨 가중치 구축
simulateP.prototype.build = function() {
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
            //a. 레벨 종류만큼 칸 설정
            var level_arr = [0, 0];//85레벨, 90레벨
            //b. 해당 칸은 특정 레벨 & 특정 장비의 개수만큼 숫자가 증가
            for (i=0;i<itemList.length;i++) {
                for (j=0;j<droplevel.name.length;j++) {
                    //앞에서 선택된 장비이고 레벨이 맞을 경우, 해당 레벨 칸 +1
                    if ((itemList[i]["sort1"] === droptype.name[k] //무기, 방어구 전용 : 대분류
                    || itemList[i]["sort2"] === droptype.name[k])//악세사리, 특수장비 : 1차 소분류
                    && itemList[i]["level"] === droplevel.name[j]) {
                        level_arr[j] += 1;
                    }
                }
            }
            //c. 추가 가중치 계산
            level_arr[0] = level_arr[0] * droplevel.num[0];
            level_arr[1] = level_arr[1] * droplevel.num[1];
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
        if (this.result()) {
            //아이템 드랍 승인 -> 아이템 선정
            this.getItem();
            //탐색 종료 여부 : 찜 여부에 따라 차후 결정
        } else if (state === "waiting") {
            //탐색 종료
            this.end();
        } else {
            //탐색 지속
            this.run();
        }
    }.bind(this),125);
};
//★탐색 결과 판별
simulateP.prototype.result = function() {
    //드랍 결과 확인 (랜덤)
    var rate = Math.random();
    var sb = selectedDungeon.before;
    if ((sb !== "metro_6" && rate <= droprate[0]) ||
    (sb === "metro_6" && rate <= droprate[1])) {
        return true;
    } else {
        return false;
    }
};
//★아이템 선정 (차후 세련되게 개선)
simulateP.prototype.getItem = function() {
    //아이템 부위 선정
    var type_num = rand(weighted_type);
    var type = droptype.name[type_num];
    //아이템 레벨 선정
    var lv = droplevel.name[rand(weighted_level[type_num])];
    //아이템 최종 선정
    var tempArr = [];
    for (i=0;i<itemList.length;i++) {
        if ((itemList[i]["sort1"] === type || /*종류-무기*/
        itemList[i]["sort2"] === type ||/*종류-방어구*/
        itemList[i]["sort3"] === type) &&/*종류-악세서리&특수장비*/
        itemList[i]["level"] === lv)/*레벨*/ {
            tempArr.push(itemList[i]);
        }
    }
    //미리 리스트에서 랜덤으로 선정
    var item = tempArr[Math.floor(Math.random() * tempArr.length)];
    //->아이템 선정결과 반영
    this.applyItem(item);
};
//★아이템 선정결과 반영
simulateP.prototype.applyItem = function(item) {
    //습득 채널 표시
    var arr = resultList.channel;
    user.channel= arr[Math.floor(Math.random() * arr.length)];
    $("#channel_text").innerHTML = user.channel;

    //에픽 획득/보유량 증가
    user.holding.epic.get += 1;
    user.holding.epic.have += 1;
        //에픽 획득량 표시
        $("#board_epic_num").innerHTML = thousand(user.holding.epic.have);
    //아이템 획득/보유량/최초획득시기 기억
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

    //아이템 획득내역 기록
        //일반 아이템
        if (item.set === "") {
            //기록 : [회차, 채널, 아이템ID, 보유수]
            user.record.item.push([user.count, user.channel, item.id, user.inventory[item.id].have]);
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
        }
    //세트 정보 출력
    if (item.set === "") {
        $("#board_set_text").className = "color_gray";
        $("#board_set_text").innerHTML = "정보 없음";
    } else {
        $("#board_set_text").className = "color_set";
        $("#board_set_text").innerHTML = item.set + " (" + temp[0].toString() + "/" +  temp[1].toString() + ")";
    }
    //해당 아이템 도감 업데이트
    display.modifyInventory(item.id);
    //(찜한 아이템이라면) 찜 목록 업데이트
    display.checkWish(item.id);

    //->아이템 드랍
    this.dropItem(item);
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
};
//★아이템 드랍
simulateP.prototype.dropItem = function(item) {
    //찜한 아이템인지 & 미보유 아이템인지 판별
    var wished = false;
    if (user.wish.indexOf(item.id) >= 0) wished = true;
    //아이템 원위치, 기존 에픽 이펙트 제거
    this.resetItem();
    //========================================================
    //★ 종료 버튼 설정
    if (!wished) {
        this.end();//일반 : 즉시 실행
    } else {
        this.readyToEnd();//wished : 대기중
    }
    //========================================================

    //아이템 이름 변경
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
            {
                xPercent:-30,
                ease:Power0.easeNone
            });
        //Y좌표 (상합Max : 25/ 하합Max : 65 / 최소 Y축 이동 절대값 : 40)
        TweenMax.fromTo($("#item1"),0.2,
            {yPercent:0},
            {
                yPercent:"-=5",
                ease:Power0.easeNone
            });
        TweenMax.to($("#item1"),0.4,{
                yPercent:"+=45",
                ease: Circ.easeIn,
                delay:0.2,
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
                            //(wished) : 버튼 활성화 (아직 종료 안했으니)
                            if (wished) simulate.end();
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
                    //(wished) : 버튼 활성화 (아직 종료 안했으니) - 대기 이펙트와 함께
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
};
//★탐색 종료
simulateP.prototype.end = function() {
    state ="waiting";
    //캐릭터 스프라이트 변경
    $("#main_character").classList.remove("attack");
    $("#main_character").classList.add("wait");
    //버튼 활성화
    main.setButton("normal");
    main.setButton("enableAll");
    $("#button_main").innerHTML = "탐색 개시";

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
    //(보유량 = 1 이상)
    if (have > 0) {
        //아이콘 표시
        $$("#item_" + id + " .icon")[0].classList.remove("nothing");
        //이름 색상 표시
        $$("#item_" + id + " .name")[0].classList.remove("color_nothing");
        $$("#item_" + id + " .name")[0].classList.add("color_" + rarity);
        //보유량 변경
        $$("#item_" + id + " .amount")[0].innerHTML = " [x" + thousand(have) + "]";
        $$("#item_" + id + " .amount")[0].classList.remove("nothing");
        //최초획득 변경
        $$("#item_" + id + " .firstGet")[0].innerHTML = " (" + thousand(firstGet) + "회차)";
    //(보유량 = 0)
    } else  {
        //아이콘 표시
        $$("#item_" + id + " .icon")[0].classList.add("nothing");
        //이름 색상 표시
        $$("#item_" + id + " .name")[0].classList.remove("color_" + rarity);
        $$("#item_" + id + " .name")[0].classList.add("color_nothing");
        //보유량 변경
        $$("#item_" + id + " .amount")[0].innerHTML = " [x" + have + "]";
        $$("#item_" + id + " .amount")[0].classList.add("nothing");
        //최초획득 변경
        $$("#item_" + id + " .firstGet")[0].innerHTML = "";
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
        swal({
            title:"찜하기 최대치 도달",
            text:"찜하기는 최대 " + wishLimit.toString() + "개까지 가능합니다.",
            type:"error"
        });
    } else {
        //찜 설정 사운드
        if (user.option.sfx) sfxObj.wish_set.play();
        //찜 등록, 아이콘 표시
        user.wish.push(id);
        //찜 현황 반영
        display.checkWish();
        //해당 아이템줄 색상 변경
        $("#item_" + id).classList.add("wish");
        //아이콘에 WISH 추가
        $$("#item_" + id + " .wish")[0].classList.add("show");
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
    //아이콘에 WISH 제거
    $$("#item_" + id + " .wish")[0].classList.remove("show");

    //해당 아이콘 색상 복구
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
            //찜 아이템 보유여부 : OFF
            $("#wish_item_state" + (i+1).toString()).classList.remove("yes");
            $("#wish_item_state" + (i+1).toString()).classList.remove("no");
        }
    }
};
//★찜하기 초기화
displayP.prototype.clearWish = function() {
    var length = user.wish.length;
    for (var it = length - 1;it >= 0;it--) {
        this.removeWish(user.wish[it],"noSound");
    }
    //초기화 별도 사운드
    if (user.option.sfx) sfxObj.wish_set.play();
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
                //획득 에픽 수
                $("#board_epic_num").innerHTML = thousand(user.holding.epic.have);
                //캐릭터 (랜덤 X)
                main.changeCharacter();
                //사운드 모드
                switch (user.option.bgm) {
                    case 1:
                        $("#main_sound_change").innerHTML = "사운드 <span class='color_red'>OFF</span>";

                        break;
                    case 0:
                        $("#main_sound_change").innerHTML = "사운드 <span class='color_green'>ON</span>";

                        break;
                }
        }
    }
};
//※ 데이터 정제 (이전 버전 데이터)
mainP.prototype.maintainData = function() {
    if (user.bgm) user.option.bgm = user.bgm;
    if (user.sfx) user.option.sfx = user.sfx;
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
                //BGM은 사운드 활성화했을 때만 로딩 (게이트 빼고)
                if ((target === "gate" || user.option.bgm) && !bgmObj[target].loadCompleted) audioObj[target] = bgmObj[target];

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
//★도감 창 생성 (나중에 하면 렉걸리니)
mainP.prototype.createInventory = function() {
    //var text = "";
    var fragment = document.createDocumentFragment();
    var item;
    var id = "";
    var rarity = "";
    var set = "";
    var setKey = "";
    var line = "";
    var have = 0;
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
        if (have === 0) rarity = "nothing";
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
        var el_item = document.createElement("#item_" + id + "." + line);
            var el_icon = document.createElement("p.icon." + rarity + "[style='background-position:" + icon_position + "']");
            var el_wish = document.createElement("p.wish");
                el_wish.innerHTML = "찜";
            var el_name = document.createElement("p.name.color_" + rarity);
                el_name.innerHTML = setKey + item.name;
            var el_under = document.createElement("p");
                var el_amount = document.createElement("span.amount.color_skyblue." + rarity);
                    el_amount.innerHTML = "[x0]";
                var el_firstGet = document.createElement("span.firstGet.color_gray." + rarity);
                    el_firstGet.innerHTML = "";
                var el_right = document.createElement("span.right");
                    var el_level = document.createElement("span.level.color_white");
                        el_level.innerHTML = "[Lv." + item.level.toString() + "]";
                    var el_type = document.createElement("span.right.color_white");
                        el_type.innerHTML =  "[" + ttype + "]";
        //★아이템이 찜한건 지 체크
        if (user.wish.indexOf(id) >= 0) {
            //해당 아이템 색상 변경
            el_item.classList.add("wish");
            //아이콘에 WISH 추가
            el_wish.classList.add("show");
        }
        //★아이템 element 모으기
        el_item.appendChild(el_icon);
        el_item.appendChild(el_wish);
        el_item.appendChild(el_name);
        el_item.appendChild(el_under);
            el_under.appendChild(el_amount);
            el_under.appendChild(el_firstGet);
            el_under.appendChild(el_right);
                el_right.appendChild(el_level);
                el_right.appendChild(el_type);
        fragment.appendChild(el_item);
    }
    //아이템 줄 생성 개시
    for (i = 0;i < itemList.length;i++) {
        createItem(i);
    }
    //텍스트 출력
    $("#inventory_scroll").appendChild(fragment);
        //클러스터 생성 (부드로운 스크롤)
        var clusterize = new Clusterize({
            scrollId: 'inventory_box',
            contentId: 'inventory_scroll',
            //하단 1번 : 1 블록에 들어가는 최대 row 수 (디폴트 : 50)
            //하단 2번 : 1 클러스터에 들어가는 최대 블록 수 (디폴트 : 4)
            rows_in_block:20,
            blocks_in_cluster:Math.ceil($("#inventory_scroll").childNodes.length / 20)
        });
        //★ (클러스터 생성 후) 각 아이템에 클릭 이벤트 추가 (찜하기)
        var nodes = $("#inventory_scroll").childNodes;
        var length = nodes.length;
        for (i = 0;i < nodes.length;i++) {
            (function(i) {
                nodes[i].onclick = function() {
                    display.clickWish(nodes[i].id.replace("item_",""));
                };
            })(i);
        }
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
                        //아이템 도감 작성
                        setTimeout(function() {
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
                    "(플레이 진행 : " + thousand(JSON.parse(localStorage.minihell).count) + "회차,<br/>" +
                    "획득 에픽 : " + thousand(JSON.parse(localStorage.minihell).holding.epic.get) + "개)",
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
                            //아이템 도감 작성
                            setTimeout(function() {
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
            $("#button_left").innerHTML = "처음부터<br/>하기";
            $("#button_right").classList.add("hide");
            $("#button_right").classList.add("long");
            $("#button_right").innerHTML = "이어서<br/>하기";
            $("#button_main").classList.add("hide");

            break;
        //일반 모드
        case "normal":
            $("#button_left").classList.remove("hide");
            $("#button_left").classList.remove("long");
            $("#button_left").innerHTML = "획득<br/>기록";
            $("#button_right").classList.remove("hide");
            $("#button_right").classList.remove("long");
            $("#button_right").innerHTML = "행선지<br/>선택";
            $("#button_main").classList.remove("hide");

            break;
        //모조리 비활성화
        case "disableAll":
            $("#button_left").disabled = true;
            $("#button_main").disabled = true;
            $("#button_right").disabled = true;
            $("#main_inventory").disabled = true;
            $("#main_sound_change").disabled = true;
            $("#main_character_change").disabled = true;

            break;
        //모조리 활성화(게이트 빼고)
        case "enableAll":
            $("#button_left").disabled = false;
            if (selectedDungeon.before !== "gate")
                $("#button_main").disabled = false;
            $("#button_right").disabled = false;
            $("#main_inventory").disabled = false;
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
    selectedDungeon.after = target;
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
            //캐릭터, 아이템 배치
            if (target !== "gate") {
                //던전 - 캐릭터 배치
                $("#main_character").classList.remove("gate");
                $("#main_character").classList.add("dungeon");
                //던전 - 아이템 원위치
                simulate.resetItem();
                //던전 -  아이템 드랍 부위/레벨 가중치 구축
                simulate.build();
                //던전 - NPC 관련 치우기
                $("#main_npc_text").style.display = "none";
                $("#main_npc").style.display = "none";
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
                $("#main_sound_change").style.display = "block";
                $("#main_character_change").style.display = "block";
                //$("#main_inventory").style.display = "block";
            }
            //===============================================================
            setTimeout(function() {
                //입장 완료
                $("#frame_cover").style.opacity = "0";
                //기존 브금 종료
                if (selectedDungeon.before !== "" && selectedDungeon.before !== selectedDungeon.after)
                    bgmObj[selectedDungeon.before].stop();
                //새 브금 실행
                if (selectedDungeon.before !== selectedDungeon.after)
                    if (user.option.bgm) bgmObj[selectedDungeon.after].play();
                setTimeout(function() {
                    //던전 변경 완료
                    selectedDungeon.before = selectedDungeon.after;
                    selectedDungeon.after = "";
                    //클릭 가능
                    $("#frame_cover").style.display = "none";
                    //버튼들 활성화
                    main.setButton("enableAll");
                    //메인 버튼 문구 변경
                    if (selectedDungeon.before !== "gate") {
                        $("#button_main").innerHTML = "탐색 개시";
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
    //캐릭터 랜덤 선택
    var chaList = [];
    for (i in characterList) {
        if (characterList.hasOwnProperty(i)) {
            chaList.push(i);
        }
    }
    //랜덤 선정(신청했다면)
    if (cmd === "random")
        user.myCharacter = chaList[Math.floor(Math.random() * chaList.length)];
    //선택된 캐릭터 출력
    for (i = 0;i < chaList.length;i++) {
        $("#main_character").classList.remove(chaList[i]);
    }
    $("#main_character").classList.add(user.myCharacter);
};
//★ (마을/던전 진입하기) 메뉴 버튼 설정
mainP.prototype.setMenuButton = function() {
    //※ 버튼 : 획득 기록
    $("#button_left").onclick = function() {
        //버튼들 비활성화
        main.setButton("disableAll");
        //메뉴창 열기
        $("#frame_slot_left").style.display = "block";
        TweenMax.to($("#frame_slot_left"),0.3,{xPercent:100});
        //메뉴창 열기 사운드
        if (user.option.sfx) sfxObj.slot_open.play();
        //획득내용 보여주기
        display.showRecord();
        //닫기 버튼
        $("#slot_left_close").onclick = function() {
            //메뉴창 닫기
            TweenMax.to($("#frame_slot_left"),0.3,{xPercent:0,
                onComplete:function() {
                    //메뉴창 지우기
                    $("#frame_slot_left").style.display = "none";
                    //획득내용 지우기
                    display.clearRecord();
                    //버튼들 활성화
                    main.setButton("enableAll");
                }
            });
            //메뉴창 닫기 사운드
            if (user.option.sfx) sfxObj.slot_close.play();
        };
    };

    //※ 버튼 : 던전 변경
    $("#button_right").onclick = function() {
        //버튼들 비활성화
        main.setButton("disableAll");
        //메뉴창 열기
        $("#frame_slot_right").style.display = "block";
        TweenMax.to($("#frame_slot_right"),0.3,{xPercent:-100});
        //메뉴창 열기 사운드
        if (user.option.sfx) sfxObj.slot_open.play();
        //던전 교체
        for (i=0;i<$$(".dg_list").length;i++) {
            (function() {
                var bt = $$(".dg_list")[i];
                bt.onclick = function() {
                    //메뉴창 닫기
                    TweenMax.to($("#frame_slot_right"),0.3,{xPercent:0,
                        onComplete:function() {
                            $("#frame_slot_right").style.display = "none";
                        }
                    });
                    //마을/던전 입장하기
                    main.enterMap(bt.dataset.target);
                };
            })();
        }
        //닫기 버튼
        $("#slot_right_close").onclick = function() {
            //메뉴창 닫기
            TweenMax.to($("#frame_slot_right"),0.3,{xPercent:0,
                onComplete:function() {
                    $("#frame_slot_right").style.display = "none";
                    //버튼들 활성화
                    main.setButton("enableAll");
                }
            });
            //메뉴창 닫기 사운드
            if (user.option.sfx) sfxObj.slot_close.play();
        };
    };

    //※ 버튼 : 탐색 개시
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

    //※ 버튼 : 캐릭터 변경
    $("#main_character_change").onclick = function() {
        //사운드
        if (user.option.sfx) sfxObj.map_enter.play();
        //실행
        main.changeCharacter("random");

        /*게임 저장*/main.saveData();
    };
    //※ 버튼 : 사운드 변경
    $("#main_sound_change").onclick = function() {
        switch (user.option.bgm) {
            case 1:
                user.option.bgm = 0;
                user.option.sfx = 0;
                $("#main_sound_change").innerHTML = "사운드 <span class='color_green'>ON</span>";
                bgmObj[selectedDungeon.before].stop();

                break;
            case 0:
                user.option.bgm = 1;
                user.option.sfx = 1;
                $("#main_sound_change").innerHTML = "사운드 <span class='color_red'>OFF</span>";
                if (user.option.bgm) bgmObj[selectedDungeon.before].play();

                break;
        }

        /*게임 저장*/main.saveData();
    };
    //※ 버튼 : 도감
    $("#main_inventory").onclick = function() {
        //버튼들 비활성화
        main.setButton("disableAll");
        //메뉴창 열기
        $("#frame_slot_left").style.display = "block";
        TweenMax.to($("#frame_slot_left"),0.3,{xPercent:100});
            //메뉴창 열기 사운드
            if (user.option.sfx) sfxObj.slot_open.play();
            //좌측 메뉴창 제목 석정
            $("#slot_title_left").innerHTML = "에픽아이템 도감";
            //스크롤 : 내리지 않음
            //획득기록창 & 설명 열기
            $("#inventory_box").style.display = "block";
            $("#inventory_footer").style.display = "block";
            //찜하기 창 키우기
            $("#frame_wish").classList.remove("mini");
        //닫기 버튼
        $("#slot_left_close").onclick = function() {
            //메뉴창 닫기
            TweenMax.to($("#frame_slot_left"),0.3,{xPercent:0,
                onComplete:function() {
                    //메뉴창 제거
                    $("#frame_slot_left").style.display = "none";
                    //획득 도감 지우기
                    display.clearInventory();
                    //버튼들 활성화
                    main.setButton("enableAll");
                }
            });
            //찜하기 창 줄이기
            $("#frame_wish").classList.add("mini");
            //메뉴창 닫기 사운드
            if (user.option.sfx) sfxObj.slot_close.play();
        };
    };
        //※ 버튼 : 도감 - 찜 개별 초기화
        for (var iw = 0;iw < wishLimit;iw++) {
            (function(iw) {
                $("#wish_item_icon" + (iw+1).toString()).onclick = function() {
                    if (user.wish[iw]) {
                        display.removeWish(user.wish[iw]);
                    }
                };
            })(iw);
        }
        $("#wish_clear").onclick = function() {
            display.clearWish();
        };

        //※ 버튼 : 도감 - 찜 초기화
        $("#wish_clear").onclick = function() {
            display.clearWish();
        };



};
var main = new mainP();
//=====================================================================
//※ 실행
//=====================================================================
document.addEventListener("DOMContentLoaded", function(e) {
    //초기 함수
    try {
        main.init();
    } catch(err) {
        alert(err.message);
    }

    //강제 스크롤링 (터치 한정)
    var touchY = 0;//첫 터치 Y좌표 기억(스크립트 스크롤 용)
    $("#dg_box").addEventListener("touchstart",function(e) {
        //스크롤 비활성화
        $("#dg_box").style.overflowY = "hidden";
        //$("#dg_box").classList.remove("scroll");
        //터치포인트 기억
        touchY = e.touches[0].clientY - $("#dg_box").offsetTop;
    },false);
    $("#dg_box").addEventListener("touchmove",function(e) {
        //스크롤 적용
        var touchYC = e.touches[0].clientY - $("#dg_box").offsetTop;
        $("#dg_box").scrollTop = $("#dg_box").scrollTop + (touchY - touchYC);
        //이동 이후 터치포인트 기억
        touchY = touchYC;
    },false);
    $("#dg_box").addEventListener("touchend",function(e) {
        //스크롤 재활성화
        $("#dg_box").style.overflowY = "scroll";
        //$("#dg_box").classList.add("scroll");
    },false);

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
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady() {
            document.addEventListener("backbutton", onBackKeyDown, false);
        }
        function onBackKeyDown() {
            quit();
            //navigator.notification.confirm('종료하시겠습니까?', onBackKeyDownMsg, '종료', '취소, 종료');
        }




});

})();
