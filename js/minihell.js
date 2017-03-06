
(function() {
'use strict';

//=====================================================================
//※ 변수, 기초 정보
//=====================================================================
var i,j,k,l,m;

//실행 관련
var state = "waiting";//실행 상태
var goyuList = [];//고유 에픽 리스트
var current_type = [];//(현재 던전) 에픽 부위 선정 가중치
var current_level = [];//(현재 던전) 에픽 레벨 선정 가중치
var current_rate = [];//(현재 던전) 부위별 드랍률
var current_goyu = [];//현재 지역 고유에픽 리스트
var searchList = [
    "모두","에픽","찜하나","모든찜","무한"
];

//아이템 관련
var droprate = {//아이템 드랍률 (합산 기준)
    name:["epic","soul","beed"],//에픽, 소울, 구슬, 꽝
    num:[0.065,0.04,0.0065]
};
var droprate_special = {//특수 에픽 드랍률
    "metro_6":[0.11,0,0,0.89],//이계의 틈
    "$perfect":[1,0,0,0]//퍼펙트 모드
};
var droptype = {//장비 타입별 드랍확률 가중치
    name:["무기","방어구","악세서리","특수장비"],
    num:[1,1,1,0.4]
};
var droplevel = {
    name:[85,90],
    num:[60,40]
};
var droparea = [/*오브젝트 수 = 드랍 가능 아이템 수량*/
    {x:130,y1:20,y2:110},//1번 아이템
    {x:50,y1:16,y2:140},//2번 아이템
    {x:170,y1:14,y2:170},//3번 아이템
    {x:100,y1:12,y2:200}//4번 아이템
];
//기록, 인벤토리
var recordInfo = document.createDocumentFragment();//획득기록 정보
var invenInfo = document.createDocumentFragment();//인벤토리 정보
var clusterize_record;//획득기록 클러스터
var clusterize_inventory;//인벤토리 클러스터
var autoClear;//기록 초기화 대기 타이머
//찜
var autoWish = [];//찜목록 늦게출현 오토
    for (var i = 0;i < droparea.length;i++) {
        autoWish[i];
    }
var wishLimit = 9;//찜하기 최대치


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
    imageList.push("./img/bg/loading_death.jpg");
    imageList.push("./img/bg/loading_metro.jpg");
    /*던전 슬롯*/
    for(i=0;i<dungeonList.length;i++) {
        imageList.push("./img/bg/bg_" + dungeonList[i].id + ".jpg");
        imageList.push("./img/slot/" + dungeonList[i].id + ".png");
    }
    /*캐릭터 이미지*/
    for(var key in characterList) {
        //스프라이트
        for (i = 0;i < 24;i++) {
            imageList.push("./img/sprite/" + key + "/sprite_" + i.toString() + ".png");
        }
        //페이스
        imageList.push("./img/character_face/" + key + ".png");
    }
    /*아이템 스프라이트 이미지*/
    imageList.push("https://solarias.github.io/dnf/sprite/images/sprite_item.png");
    imageList.push("https://solarias.github.io/dnf/sprite/images/sprite_hell.png");
    /*에픽 이펙트 스프라이트*/
    for (i = 0;i < spriteInfo.length;i++) {
        var info = spriteInfo[i];
        if (info.type === "epic") {
            for (j = 0;j < info.c;j++) {
                imageList.push("./img/sprite/" + info.name + "/sprite_" + j.toString() + ".png");
            }
        }
    }
    /*기타 이미지*/
    imageList.push("./img/npc/erze.gif");
    imageList.push("./img/epic_crack.png");
    imageList.push("./img/icon_crack.png");
    imageList.push("./img/icon_soul.png");
    imageList.push("./img/icon_beed.png");
    imageList.push("./img/icon_wished.png");
    imageList.push("./img/icon_arrow.png");
//애니메이션(PIXI) 준비
PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR;
//해상도 설정 (WebGL을 지원하지 않으면 1로 고정)
var pixi_resolution = 2;
    if (!PIXI.utils.isWebGLSupported()) {
        pixi_resolution = 1;
    }
var app = new PIXI.autoDetectRenderer(540, 405, {
    view: $("#main_canvas"), transparent: true,
    antialias: true,resolution : pixi_resolution});
var stage = new PIXI.display.Stage();
    //애니메이션 텍스처, 개체 관리
    var textureObj = {};//텍스처
    var spriteObj = {};//개체
    //종합 레이어
    var globalLayer = new PIXI.display.Layer();
        globalLayer.group.enableSort = true;
        stage.addChild(globalLayer);
    //GSAP 개체
    var auto = {};
        auto.epic = [];
        for (i = 0;i < droparea.length;i++) {
            auto.epic[i] = {};
        }
    //컬러 개체
    var colorObj = {
        epic:"#E5B64A",
        soul:"#E5B64A",
        beed:"#FF00FF"
    };
    //개체 zIndex 조절 함수
    /*
    PIXI.Container.prototype.updateLayersOrder = function () {
        this.children.sort(function(a,b) {
            a.zIndex = a.zIndex || 0;
            b.zIndex = b.zIndex || 0;
            return a.zIndex - b.zIndex;
        });
    };
    */

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
        invite:{get:0,have:0,used:0},//초대장
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
        //탐색,관련
        searchMode:"에픽",
        channel:["랜덤",""]
    },
    //기타
    perfectMode:false
};
var userDefault = deepCopy(user);//유저 정보 복사본


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
        current_type = arr_num2;
    //2. 레벨 구축
        //x - 부위별로 레벨 가중치 구축
        current_level = [];
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
            current_level[k] = level_arr;
        }
    //3. 확률 구축
    //합산 확률 가져오기
    current_rate = [];
    current_rate[0] = deepCopy(droprate);
    current_rate[1] = {name:[],num:[]};
    //특수지역이라면 해당 확률 변경된
    if (Object.keys(droprate_special).indexOf(selectedDungeon.now.id) >= 0)
        current_rate[0].num = deepCopy(droprate_special[selectedDungeon.now.id]);
    //퍼펙트모드라면 별도 확률 처리
    if (user.perfectMode) current_rate[0].num = deepCopy(droprate_special.$perfect);
    //개별 드랍률로 치환(하면서 합쳐놓기)
    var sumRate = 0;
    for (i = 0;i < current_rate[0].num.length;i++) {
        current_rate[1].name[i] = current_rate[0].name[i];
            var num = current_rate[0].num[i];
        current_rate[1].num[i] = 1 - Math.pow(1 - num, 1/droparea.length);
        sumRate += current_rate[1].num[i];
    }
    //"실패" 확률 추가
    current_rate[1].name.push(false);
    current_rate[1].num.push(1 - sumRate);
};
//★탐색 준비
simulateP.prototype.ready = function() {
    //캐릭터 행동 변경 -> 공격
    animation.setCharacter(user.myCharacter, "attack");
    //버튼 문구 변경
    $("#button_main").innerHTML = "탐색 중단";
    //기타 버튼 비활성화
    $("#button_left_top").disabled = true;
    $("#button_left_bottom").disabled = true;
    $("#button_right_top").disabled = true;
    $("#button_right_bottom").disabled = true;
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
    //입장비 지불 (퍼펙트모드 제외)
    if (!user.perfectMode) {
        user.holding.invite.used += selectedDungeon.now.cost;
        $("#board_invite_num").innerHTML = thousand(user.holding.invite.used);
    }
    //0.5초 후(타격 애니메이션 종료 후)
    setTimeout(function() {
        //타격 사운드
        if (user.option.sfx) {
            var sd = sfxObj["hit_" + characterList[user.myCharacter].hittype];
            sd.play();
        }
        //(모든 라인) 탐색 결과 확인
        var todayArr = [];//모든 탐색결과
        var epicArr = [];//에픽템 결과물
        var wishedArr = [];//희망템 결과물
        var falseNum = 0;
        for (var i = 0;i < droparea.length;i++) {
            //개별 탐색 결과 확인
            var result = simulate.getResult();
            //탐색 결과 임시저장
            todayArr.push(result);
            //false라면 falseNum 증가
            if (result === false) falseNum += 1;
        }
        //(false가 하나라도 없다면) 드랍 개시
        if (todayArr.length > falseNum) {
            //습득 채널 표시
                //(고정된 채널 있으면) 해당 채널 설정
                if (user.option.channel[0] === "고정") {
                    user.channel = user.option.channel[1];
                    $("#channel_text").innerHTML = user.channel + " (고정)";
                //(랜덤 채널이라면) 랜덤으로 채널 설정
                } else {
                    var arr = resultList.channel;
                    user.channel= arr[Math.floor(Math.random() * arr.length)];
                    $("#channel_text").innerHTML = user.channel;
                }
            //아이템 리셋
            animation.resetItem();
            //균열 등장
            $("#main_crack").classList.add("show");
            //종류별 / 라인별 드랍 개시
            for (var i = 0;i < todayArr.length;i++) {
                (function(i) {
                    //object (에픽) 아이템)
                    if (typeof todayArr[i] === "object") {
                        if (todayArr[i][1] === "epic") {
                            epicArr.push(todayArr[i][0]);
                        } else {
                            wishedArr.push(todayArr[i][0]);
                        }
                        //->아이템 선정결과 반영
                        this.applyItem(todayArr[i][0], todayArr[i][1]);
                        //->아이템 드랍
                        this.dropEpic(i, todayArr[i][0], todayArr[i][1]);
                    //그 외 false가 아닌 것 (기타 아이템)
                    } else if (todayArr[i] !== false) {
                        //->아이템 선정결과 반영
                        this.applyItem(todayArr[i]);
                        //->기타아이템 드랍
                        this.dropEtc(i, todayArr[i]);
                    }

                    return;
                }.bind(this))(i);
            }
            //탐색모드별 재탐색모드 결정
            switch (user.option.searchMode) {
                case "찜하나":
                    if (wishedArr.length <= 0) {
                        this.run();//찜한 게 아님 : 지속
                    } else {
                        this.readyToEnd();//쨈한 거 : 잠시 후 종료
                    }

                    break;
                case "모든찜":
                    if (wishedArr.length <= 0) {
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
                case "에픽":
                    if (epicArr.length <= 0 && wishedArr.length <= 0) {
                        this.run();//찜 or 에픽이 아님 : 지속
                    } else if (wishedArr.length > 0) {
                        this.readyToEnd();//쨈 : 잠시 후 종료
                    } else {
                        this.end();//에픽 : 종료
                    }

                    break;
                case "무한":
                    //무조건 재실행
                    this.run();

                    break;
                default://그 외 = "모두"
                    //무조건 멈춤
                    this.end();

                    break;
            }
        //(전부다 false라면)
        } else {
            //즉시 재개
            this.run();
        }
    }.bind(this),125);
};
//★탐색 결과 판별
simulateP.prototype.getResult = function() {
    //드랍 결과 반환 (랜덤)
    var result = current_rate[1].name[rand(current_rate[1].num)];
    //(결과 : 에픽)
    if (result === "epic") {
        //에픽 아이템 선정
        var item = this.getEpic();
        //찜한 아이템인지 & 미보유 아이템인지 판별
        if (user.wish.indexOf(item.id) >= 0 && !user.inventory[item.id]) {
            //찜한 아이템이라면 결과는 "찜했음"이 됨
            result = "wished";
        }
        //결과 키워드 반환 (일반 에픽은 epic, 찜한 에픽은 "wished")
        return [item, result];
    //(결과 : Not 에픽, Not 꽝)
    } else if (result !== false) {
        //"기타" 키워드 반환
        return result;
    //(결과 : 꽝)
    } else {
        return result;
    }
};
//★에픽아이템 선정
simulateP.prototype.getEpic = function() {
    //아이템 종류 선정
    var type_num = rand(current_type);
    var type = droptype.name[type_num];
    //아이템 레벨 선정
    var lv = droplevel.name[rand(current_level[type_num])];
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
    //미리 리스트에서 랜덤으로 선정, 반환
    return tempArr[Math.floor(Math.random() * tempArr.length)];
};
//★아이템 선정결과 반영
simulateP.prototype.applyItem = function(item, wished) {
    //(공통) 획득/보유량 증가
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
            var itemObj = {};
            var wish = (wished !== "wished") ? false : true;
            //일반 아이템
            if (item.set === "") {
                //기록 : [회차, 채널, 아이템ID, 보유수]
                itemObj = {
                    type:"epic",
                    wished:wish,
                    count:user.count,
                    channel:user.channel,
                    id:item.id,
                    have:user.inventory[item.id].have
                };
                //획득기록 업데이트
                user.record.item.push(itemObj);
                display.addRecord(itemObj);
                //세트 정보 : 미출력
            //세트 아이템
            } else {
                var temp = [0,0,""];//해당 세트 아이템 수, 수집 수, 완료여부
                for (i = 0;i < itemList.length;i++) {
                    if (itemList[i].set === item.set) {
                        temp[1] += 1;
                        if (user.inventory[itemList[i].id] &&
                            user.inventory[itemList[i].id].have > 0)
                            temp[0] += 1;
                    }
                }
                //기록 : [회차, 채널, 아이템ID, 보유수, 세트 확보량]
                itemObj = {
                    type:"epic",
                    wished:wish,
                    count:user.count,
                    channel:user.channel,
                    id:item.id,
                    have:user.inventory[item.id].have,
                    setState:temp[0] + "/" + temp[1]
                };
                //획득기록 업데이트
                user.record.item.push(itemObj);
                display.addRecord(itemObj);

                //이전까지 세트 미완성 시 : 완성여부 파악
                if (item.set !== "" && user.record.set.indexOf(item.set) < 0) {
                    if (temp[1] === temp[0]) {
                        //record_set 등록하기
                        user.record.set.push(item.set);
                        //recor_item 등록 : [회차, 세트명]
                        itemObj = {
                            type:"set",
                            count:user.count,
                            set:item.set
                        };
                        //획득기록 업데이트
                        user.record.item.push(itemObj);
                        display.addRecord(itemObj);
                        //완성했다고 기록
                        temp[2] = "<span class='color_yellow'>완성!</span>";
                    }
                }

                //세트 정보 출력
                    $("#main_set").style.display = "block";
                    $("#main_set").className = "color_set";
                    $("#main_set").innerHTML +=
                        item.set +
                        " (" + temp[0].toString() + "/" +  temp[1].toString() + ") " +
                        temp[2] + "<br>";
            }

        //3. 도감 업데이트
        display.modifyInventory(item.id);
        //4. (찜한 아이템이라면) 찜 목록 업데이트
        display.checkWish(item.id);

    }
    //비에픽 : 세트 정보 미출력
};
//★ 기타아이템 드랍 (간략)
simulateP.prototype.dropEtc = function(pos, item) {
    //아이템 이미지 출력
    var field_name = "field_기타";
    animation.setItemImage(pos, field_name);
    //아이템 이름 변경
    var nameText = "";
    switch (item) {
        case "soul":
            nameText = "에픽 소울";break;
        case "beed":
            nameText = selectedDungeon.now.area_name + " 지옥 구슬";break;
        default:
            nameText = "에픽 소울";break;
    }
    animation.setItemName(pos, nameText, item);
    //기타아이템 등장 사운드
    if (user.option.sfx && !sfxObj.item_appear.playing()) sfxObj.item_appear.stop().play();
    //아이템 회전 & 루팅 시작
    animation.moveItem(pos,"etc", function() {
        //균열 사라짐
        $("#main_crack").classList.remove("show");
        void $("#main_crack").offsetWidth;
    });
};
//★ 에픽템 드랍
simulateP.prototype.dropEpic = function(pos,item,wished) {
    //아이템 이미지 출력
    var field_name = "field_" + item.sort1 + "_" + item.sort2 + "_" + item.sort3;
    animation.setItemImage(pos,field_name);

    //아이템 이름 변경
    var nameText = item.name;
    animation.setItemName(pos, item.name, "epic");

    //에픽 등장 사운드
    if (user.option.sfx) {
        if (wished !== "wished") {
            //일반 에픽사운드 (아직 미출력이면)
            if (!sfxObj.epic_appear.playing())
                sfxObj.epic_appear.play();
        } else {
            //찜빔 에픽사운드 (아직 미출력이면)
            if (!sfxObj.epic_appear_wish.playing())
                sfxObj.epic_appear_wish.play();
        }
    }
    //에픽 등장 이펙트
    if (wished !== "wished") {
        animation.epicBeam(pos, "epic_appear");
    } else {
        animation.epicBeam(pos, "epic_appear_wish", {flip:true});
    }
    //아이템 회전 & 루팅 시작
    animation.moveItem(pos, wished, function() {
        //콜백
        if (wished !== "wished") {
        //일반 이펙트
            //에픽 착지 이펙트
            animation.epicBeam(pos, "epic_land");
            //에픽 대기 이펙트 (즉시 실행)
            animation.epicBeam(pos, "epic_wait",{repeat:true});
        //찜빔 이펙트
        } else {
            //에픽 착지 이펙트
            animation.epicBeam(pos, "epic_land_wish");
            //에픽 대기 이펙트 (착지 이펙트 0.6초 종료 후)
            autoWish[pos] = setTimeout(function() {
                animation.epicBeam(pos, "epic_wait_wish1",{repeat:true,alpha:true});
                animation.epicBeam(pos, "epic_wait_wish2",{repeat:true,alpha:true});
            },600);
        }
        //균열 사라짐
        $("#main_crack").classList.remove("show");
        void $("#main_crack").offsetWidth;
        //에픽 착지 사운드
        if (user.option.sfx) {
            if (wished !== "wished") {
                //일반 에픽사운드
                sfxObj.epic_land.play();
            } else {
                //찜빔 에픽사운드
                sfxObj.epic_land_wish.play();
            }
        }
    });
};
//★탐색 종료 대기 (찜빔 확인)
simulateP.prototype.readyToEnd = function() {
    state ="waiting";
    //캐릭터 스프라이트 변경
    animation.setCharacter(user.myCharacter, "wait");
    //대기 문구
    $("#button_main").innerHTML = "확인 중";
    $("#button_main").disabled = true;
    //(0.9초 후) 버튼 활성화
    setTimeout(function() {
        this.end();
    }.bind(this),1100);
};
//★탐색 종료
simulateP.prototype.end = function(wished) {
    state ="waiting";
    //캐릭터 스프라이트 변경
    animation.setCharacter(user.myCharacter, "wait");
    //버튼 활성화
    main.setButton("normal");
    main.setButton("enableAll");
    $("#button_main").innerHTML = user.option.searchMode + " 탐색";

    /*게임 저장*/main.saveData("탐색 종료");
};
var simulate = new simulateP();

//애니메이션 관련
function animationP() {}
//★ 게임 루프
animationP.prototype.loop = function() {
    requestAnimationFrame(animation.loop);
    app.render(stage);
};
//★ 애니메이션 초기설정
animationP.prototype.init = function() {
    var i, j, name, info, url, texture;
    //캐릭터 텍스처 생성
    for (var key in characterList) {
        //텍스처 정보 저장
         name = key;
        //wait 생성
            //텍스처 저장 준비
            textureObj[name + "_wait"] = [];
            //변수 준비
            info = indexArrKey(spriteInfo,"name","character_wait");
            url = "./img/sprite/" + name + "/sprite_";
            //텍스처 저장 개시
            for (i = 0;i < info.c;i++) {
                (function(i) {
                    texture = new PIXI.Texture(PIXI.BaseTexture.fromImage(url + i.toString() + ".png"));
                    //Texture 저장
                    textureObj[name + "_wait"].push(texture);
                })(i);
            }
        //attack 생성
            //텍스처 저장 준비
            textureObj[name + "_attack"] = [];
            //변수 준비
            info = indexArrKey(spriteInfo,"name","character_attack");
            url = "./img/sprite/" + name + "/sprite_";
            //텍스처 저장 개시
            for (i = 0;i < info.c;i++) {
                (function(i) {
                    texture = new PIXI.Texture(PIXI.BaseTexture.fromImage(url + (i+12).toString() + ".png"));
                    //Texture 저장
                    textureObj[name + "_attack"].push(texture);
                })(i);
            }
    }
    //나머지 텍스처 생성 (아이템 수량만큼)
    //텍스처 생성 준비
    textureObj.other = [];
    for (var i = 0;i < droparea.length;i++) {
        //텍스처 생성 준비
        textureObj.other[i] = {};
        for (var j = 0;j < spriteInfo.length;j++) {
            //"에팍", "아이템"만 생성하기
            var available = ["epic", "item"];
            if (available.indexOf(spriteInfo[j].type) < 0) continue;
            //텍스처 정보 저장
            name = spriteInfo[j].name;
            info = spriteInfo[j];
            //텍스처 생성 준비
            textureObj.other[i][name] = [];
            //나머지 텍스처 생성
            if (info.c > 1) {
                url = "./img/sprite/" + name + "/sprite_";
                for (k = 0;k < info.c;k++) {
                    (function(k) {
                        texture = new PIXI.Texture(PIXI.BaseTexture.fromImage(url + k.toString() + ".png"));
                        textureObj.other[i][name].push(texture);
                    })(k);
                }
            } else {
                url = spriteInfo[j].url;
                texture = new PIXI.Texture(PIXI.BaseTexture.fromImage(url));
                textureObj.other[i][name].push(texture);
            }
        }
    }
    //스프라이트 생성
        //캐릭터
        spriteObj.character = new PIXI.Sprite();
        spriteObj.character.frameIndex = 0;
        //레이어 설정
        spriteObj.character.parentLayer = globalLayer;
        spriteObj.character.zIndex = 3;
        stage.addChild(spriteObj.character);
        //아이템 (4개)
            spriteObj.epic = [];
            var rng = droparea.length;
            for (i = 0;i < rng;i++) {
                spriteObj.epic[i] = {};
                //묶음(컨테이너) 생성 (4개) - 오직 "좌표 공유"를 위해서 사용
                spriteObj.epic[i].cover = new PIXI.Container();
                spriteObj.epic[i].cover.width = 0;
                spriteObj.epic[i].cover.height = 0;
                stage.addChild(spriteObj.epic[i].cover);
                //아이템 이미지 (4개)
                spriteObj.epic[i].item = new PIXI.Sprite();
                spriteObj.epic[i].item.anchor.set(0.5,0.5);
                spriteObj.epic[i].item.texture = textureObj.other[i].item[0];
                spriteObj.epic[i].item.parentLayer = globalLayer;
                spriteObj.epic[i].item.zIndex = 4;
                spriteObj.epic[i].cover.addChild(spriteObj.epic[i].item);
                //아이템 이름 (4개)
                spriteObj.epic[i].item_name = new PIXI.Text();
                spriteObj.epic[i].item_name.anchor.set(0.5,0.5);
                spriteObj.epic[i].item_name.style.font = "12px Ariel";
                spriteObj.epic[i].item_name.parentLayer = globalLayer;
                spriteObj.epic[i].item_name.zIndex = 7;
                spriteObj.epic[i].cover.addChild(spriteObj.epic[i].item_name);
                //아이템 이름 상자 (4개)
                spriteObj.epic[i].item_box = new PIXI.Graphics();
                spriteObj.epic[i].item_box.parentLayer = globalLayer;
                spriteObj.epic[i].item_box.zIndex = 6;
                    //이름 상자는 향후에 그림 (텍스트 채울 때마다 실시간 적용)
                spriteObj.epic[i].cover.addChild(spriteObj.epic[i].item_box);
                //에픽 이펙트 (4개)
                spriteObj.epic[i].effect = {};
                for (j = 0;j < spriteInfo.length;j++) {
                    if (spriteInfo[j].type === "epic") {
                        spriteObj.epic[i].effect[spriteInfo[j].name] = new PIXI.Sprite();
                        var target = spriteObj.epic[i].effect[spriteInfo[j].name];
                        target.frameIndex = 0;
                        target.texture = textureObj.other[i][spriteInfo[j].name][0];
                        //좌표, 확대 정보
                        target.anchor.set(0.5,0.5);
                        target.width = spriteInfo[j].w;
                        target.height = spriteInfo[j].h;
                        target.parentLayer = globalLayer;
                        target.zIndex = spriteInfo[j].z;
                        //집어넣기
                        spriteObj.epic[i].cover.addChild(target);
                    }
                }
            }


        //스프라이트 정렬
        /*
        stage.updateLayersOrder();
        spriteObj.cover.updateLayersOrder();
        */
    //애니메이션 루프 작동개시
    this.loop();
};
//★ 캐릭터 스프라이트 설정
animationP.prototype.setCharacter = function(character, stat) {
    //정보 수집
    var target = spriteObj.character;
    var name = character + "_" + stat;
    var info = indexArrKey(spriteInfo,"name","character_" + stat);
    //텍스처, 프레임 지정
    target.texture = textureObj[name][0];
    //좌표 설정 (게이트 여부에 따라 다르게)
    if (selectedDungeon.after.id === "gate" ||
        (!selectedDungeon.after.id && selectedDungeon.now.id === "gate"))  {
        target.position.set(info.gateX, info.gateY);
    } else {
        target.position.set(info.x, info.y);
    }
    //캐릭터 작동 개시
    auto.character = TweenMax.fromTo(target,info.t,
        {frameIndex:0},
        {frameIndex:info.c-1,ease:SteppedEase.config(info.c-1),repeat:-1});
    auto.character.eventCallback("onUpdate",function() {
        target.texture = textureObj[name][target.frameIndex];
    });
};
//★ 아이템 초기화 (스프라이트, 사운드, 세트 정보)
animationP.prototype.resetItem = function() {
    //(모든 드랍위치에 적용)
    for (i = 0;i < droparea.length;i++) {
        //아이템 이름*, 필드 아이템 이미지 비가시화
        spriteObj.epic[i].item.renderable = false;
        spriteObj.epic[i].item_name.renderable = false;
        spriteObj.epic[i].item_box.renderable = false;
        //기존 아이템 이펙트 제거
        for (var key in spriteObj.epic[i].effect) {
            spriteObj.epic[i].effect[key].renderable = false;
        }
        //setTimeout 중단
        clearTimeout(autoWish[i]);
        //GSAP 중단
        if (auto.epic[i].item) auto.epic[i].item.kill();
            spriteObj.epic[i].item.rotation = 0;
        if (auto.epic[i].cover) {
            //아이템 이동
            if (auto.epic[i].cover.x) auto.epic[i].cover.x.kill();
            if (auto.epic[i].cover.y1) auto.epic[i].cover.y1.kill();
            if (auto.epic[i].cover.y2) auto.epic[i].cover.y2.kill();
            //에픽빔
            for (var key in spriteObj.epic[i].effect) {
                if (auto.epic[i][key]) auto.epic[i][key].kill();
            }
        }
        //아이템 커버 원위치
        var info = indexArrKey(spriteInfo,"name","cover");
        spriteObj.epic[i].cover.position.set(info.x,info.y);
    }
    //모든 에픽 사운드 중단
    sfxObj.epic_appear.stop();
    sfxObj.epic_appear_wish.stop();
    sfxObj.epic_land.stop();
    sfxObj.epic_land_wish.stop();
    //세트정보 초기화
    $("#main_set").innerHTML = "";
    $("#main_set").style.display = "none";
};
//★ 아이템 이미지 설정
animationP.prototype.setItemImage = function(pos,field_name) {
    var tempItem = spriteObj.epic[pos].item;
    //아이템 이미지 분석
    var tempEl = document.createElement("");
        tempEl.className = field_name;
        tempEl.style.display = "none";
        document.body.appendChild(tempEl);
    var tempArr = [
        getComputedStyle(tempEl).getPropertyValue("background-position").replaceAll("px","").replaceAll("-",""),
        getComputedStyle(tempEl).getPropertyValue("width").replace("px",""),
        getComputedStyle(tempEl).getPropertyValue("height").replace("px","")
    ];
    document.body.removeChild(tempEl);
    //아이템 이미지 적용
    tempItem.texture.frame = new PIXI.Rectangle(
        parseInt(tempArr[0].split(" ")[0]), parseInt(tempArr[0].split(" ")[1]),
        parseInt(tempArr[1]), parseInt(tempArr[2]));
    tempItem.width = parseInt(tempArr[1]);
    tempItem.height = parseInt(tempArr[2]);
    //아이템 위치 변경
    tempItem.position.set(0,0);
    //아이템 이미지 가시화
    tempItem.renderable = true;
};
//★ 아이템 이름 설정
animationP.prototype.setItemName = function(pos,nameText,colorText) {
    var tempName = spriteObj.epic[pos].item_name;
    var tempBox = spriteObj.epic[pos].item_box;

    //이름 변경, 색상 설정
    tempName.text = nameText;
    tempName.style.fill = colorObj[colorText];
    //(이름 변경에 따른) 위치 설정
    tempName.position.set(
        0, -(spriteObj.epic[pos].item.height/2)-14
    );
    //이름 상자 새로 그리기
    tempBox.clear();
    tempBox.beginFill(0x000000,0.7);
    tempBox.lineStyle(1, 0xB89F7C, 1);
    var rec = tempName.getLocalBounds();
        //그림 그리기 : border 두께 포함시켜서 좌표/크기 정할 것
        tempBox.drawRoundedRect(
            -(4+1), -(2+1),
            tempName.width + (4+1)*2, tempName.height + (2+1)*2, 5);
    tempBox.position.set(
        tempName.x - tempName.width/2, tempName.y - tempName.height/2);
    tempBox.endFill();
    //이름, 이름 상자 출력
    tempName.renderable = true;
    tempBox.renderable = true;
};
//★ 아이템 회전, 이동
animationP.prototype.moveItem = function(pos,type,callback) {
    //딜레이 결정 (에픽 : 0.7~0.9초, 나머지 : 0.6초)
    var aniDelay = 0.6;
        if (type === "epic") aniDelay =  0.7;
        if (type === "wished") aniDelay =  0.9;
    //아이템 회전
    auto.epic[pos].item = TweenMax.fromTo(spriteObj.epic[pos].item,aniDelay,
        {rotation:0},
        {rotation:-Math.PI * 2});
    //아이템 이동
    var tempArea = droparea[pos];
    auto.epic[pos].cover = {};
    new TweenMax.set(spriteObj.epic[pos].cover,aniDelay,
        {x:380,y:140});
    auto.epic[pos].cover.x = new TweenMax.to(spriteObj.epic[pos].cover,aniDelay,
        {x:"-=" + tempArea.x.toString(),ease:Power0.easeNone});
    auto.epic[pos].cover.y1 = new TweenMax.to(spriteObj.epic[pos].cover,aniDelay/5,
        {y:"-=" + tempArea.y1.toString(),ease:Circ.easeOut});
    auto.epic[pos].cover.y2 = new TweenMax.to(spriteObj.epic[pos].cover,aniDelay*4/5,
        {y:"+=" + tempArea.y2.toString(),ease:Circ.easeIn,delay:aniDelay/5,
        //콜백
        onComplete:callback});
};
//★ 에픽 이펙트 스프라이트
animationP.prototype.epicBeam = function(pos,name,option) {
    //대상 설정
    var info = indexArrKey(spriteInfo,"name",name);
    var target = spriteObj.epic[pos].effect[name];
    //이펙트 좌표 설정 및 가시화
    target.position.set(info.x,info.y);
    target.renderable = true;
    //뒤집기 적용
    if (option && option.flip === true) target.scale.x = -1;
    //반복여부
    var r = 0;
    if (option && option.repeat === true) r =-1;
    //GSAP 가동
    auto.epic[pos][name] = TweenMax.fromTo(target,info.t,
        {frameIndex:0},
        {frameIndex:info.c-1,
            ease:SteppedEase.config(info.c-1),repeat:r});
    auto.epic[pos][name].eventCallback("onUpdate",function() {
        target.texture = textureObj.other[pos][name][Math.round(target.frameIndex)];
    });
    //Alpha 처리 GSAP
    if (option && option.alpha === true) {
        TweenMax.fromTo(target,0.9,
            {alpha:0},
            {alpha:1,ease:Power0.easeNone});
    }
};
var animation = new animationP();


//아이템 출력 관련
function displayP() {}
//★획득기록 창 생성
displayP.prototype.createRecord = function() {
    //기록 생성
    var rng = user.record.item.length;
    for (i = 0;i < rng;i++) {
        //구버전 호환 - Array -> Object
        if (user.record.item[i] instanceof Array) {
            var itemObj = {
                type:"epic",
                wished:false,
                count:user.record.item[i][0],
                channel:user.record.item[i][1],
                id:user.record.item[i][2],
                have:user.record.item[i][3]
            };
            if (user.record.item[i][4]) {
                itemObj.setState = user.record.item[i][4];
            }
            user.record.item[i] = itemObj;
        //구버전 호환 - string -> Object
        } else if (typeof user.record.item[i] === "string") {
            var itemObj = {
                type:"set",
                count:user.record.item[i-1][0],
                set:user.record.item[i]
            };
            user.record.item[i] = itemObj;
        }
        this.addRecord(user.record.item[i]);
    }
};
//★획득기록 창 변경
displayP.prototype.addRecord = function(item) {
    //라인넘버 체크
    var row = user.record.item.indexOf(item);
    switch(item.type) {
        //아이템 정보
        case "epic":
            //관련 정보 수집
            var info = indexArrKey(itemList,"id",item.id);
            var itemNum = user.inventory[item.id];
            var name = info.name;
            var count = item.count;
            var ttype = (info.sort1 === "방어구") ? info.sort2 : info.sort3;
            //기록 만들기
            var el_item = document.createElement("p.record_item");
                //세트 컬러
                if (info.set === "") el_item.classList.add("color_epic");
                    else el_item.classList.add("color_set");
                //찜 마크
                if (item.wished === true) name = "<span class='color_yellow'>★ </span>" + name;
                el_item.innerHTML = name;
            var el_amount = document.createElement("span.record_amount");
                el_amount.innerHTML = " [x" + thousand(item.have) + "]";
                el_item.appendChild(el_amount);
            var el_level = document.createElement("span.record_level");
                el_level.innerHTML = " [Lv." + info.level.toString() + "]";
                el_item.appendChild(el_level);
            var el_type = document.createElement("span.record_type");
                el_type.innerHTML = "[" + ttype + "]";
                el_item.appendChild(el_type);
            if (info.set !== "") {
                var el_set = document.createElement("span.record_set");
                    el_set.innerHTML = "(세트 : " +  item.setState + ")";
                    el_item.appendChild(el_set);
            }
            //(첫 회차 or 회차가 달라졌다면)
            if (!recordInfo.querySelector("#record_header_" + count.toString())) {
                //헤더 만들기
                var el_header = document.createElement("#record_header_" + count.toString() + ".record_header");
                    el_header.innerHTML = thousand(count) + "회차 ";
                var el_count = document.createElement("span.font_small.color_gray");
                    el_count.innerHTML = "(" + item.channel + ")";
                    el_header.appendChild(el_count);
                //헤더에 기록 집어넣기
                el_header.appendChild(el_item);
                //헤더 등록
                recordInfo.appendChild(el_header);
            //(아직 회차 진행중)
            } else {
                //이전 헤더에 기록 집어넣기
                recordInfo.querySelector("#record_header_" + count.toString()).appendChild(el_item);
            }

            break;
        //세트 정보
        case "set":
            //변수 준비
            var count = item.count;
            //기록 만들기
            var el_complete = document.createElement("p.record_complete");
                el_complete.innerHTML = "\"" + item.set + "\" 완성!";
            //(첫 회차 or 회차가 달라졌다면)
            if (!recordInfo.querySelector("#record_footer_" + count.toString())) {
                //푸터 만들기
                var el_footer = document.createElement("#record_footer_" + count.toString());
                //푸터에 세트 기록 집어넣기
                el_footer.appendChild(el_complete);
                //푸터 등록
                recordInfo.appendChild(el_footer);
            //(아직 회차 진행중)
            } else {
                //이전 푸터에 기록 집어넣기
                recordInfo.querySelector("#record_footer_" + count.toString()).appendChild(el_complete);
            }

            break;
    }
};
//★획득기록 창 업데이트
displayP.prototype.updateRecord = function() {
    //획득기록 업데이트
    $("#record_box").appendChild(recordInfo.cloneNode(true));
    //스크롤 내리기
    $("#record_box").scrollTop = $("#record_box").scrollHeight;
};
//★획득기록 창 지우기
displayP.prototype.clearRecord = function() {
    //획득기록창 닫기
    $("#record_box").style.display = "none";
    //획득기록창 내용물 지우기
    var myDiv = $("#record_box");
    while( myDiv.hasChildNodes() ){
        myDiv.removeChild(myDiv.lastChild);
    }
};
//★도감 창 생성 (나중에 하면 렉걸리니)
displayP.prototype.createInventory = function(cmd) {
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
    //획득 가능 장비 레벨대 파악
    var levelList = [];
    for (var i = 0;i < dungeonList.length;i++) {
        if (!dungeonList[i].level) continue;//획득가능 장비 없으면 패스
        var levelArr = dungeonList[i].level;
        for (var j = 0;j < levelArr.length;j++) {
            if (levelList.indexOf(levelArr[j]) < 0)
                levelList.push(levelArr[j]);
        }
    }
    //아이템 줄 생성 함수
    function createItem(num) {
        //아이템 선정
        item = itemList[num];
        //획득 불가 레벨대는 스킵
        if (levelList.indexOf(item.level) < 0) return false;
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
        //invenInfo에 저장해두기
        invenInfo.appendChild(el_item);
    }
    //클러스터 생성해두기
    clusterize_inventory = new Clusterize({
        scrollId: 'inventory_box',
        contentId: 'inventory_scroll',
        tag:"li",
        rows_in_block:16
    });
    //(클러스터 생성 후) 클러스터 클릭 이벤트 추가 (찜하기)
    $("#inventory_scroll").onclick = function(e) {
        e = e || event;
        var target = e.target || e.srcElement;
        if(target.nodeName !== "LI") return;
        display.clickWish(target.id.replace("item_",""));
    };
    //아이템 줄 생성 개시
    for (i = 0;i < itemList.length;i++) {
        createItem(i);
    }
    //찜 현황 반영
    this.checkWish();
    //도감 적용하기
    this.updateInventory();
};
//★도감 창 재생성
displayP.prototype.resetInventory = function() {
    //획득 가능 장비 레벨대 파악
    var levelList = [];
    for (var i = 0;i < dungeonList.length;i++) {
        if (!dungeonList[i].level) continue;//획득가능 장비 없으면 패스
        var levelArr = dungeonList[i].level;
        for (var j = 0;j < levelArr.length;j++) {
            if (levelList.indexOf(levelArr[j]) < 0)
                levelList.push(levelArr[j]);
        }
    }
    //획득 가능 장비들만 골라서 초기화 (그 외는 정보가 없으니)
    var rng = itemList.length;
    for (var i = 0;i < rng;i++) {
        if (levelList.indexOf(itemList[i].level) >= 0)
        this.modifyInventory(itemList[i].id);
    }
    //찜 점검
    this.checkWish();
    //도감 업데이트
    this.updateInventory();
};
//★ 도감 업데이트
displayP.prototype.updateInventory = function() {
    //(도감이 눈에 보인다면)
    if ($("#inventory_box").offsetWidth > 0 && $("#inventory_box").offsetHeight > 0) {
        //업데이트할 정보 정리
        var arr = [];
        var fragList = invenInfo.childNodes;
        for (var i = 0;i < fragList.length;i++) {
            arr.push(fragList[i].outerHTML);
        }
        //업데이트 전 현위치 파악
        var tempTop = $("#inventory_box").scrollTop;
        //업데이트 실시
        clusterize_inventory.update(arr);
        //위치 복귀
        $("#inventory_box").scrollTop = tempTop;
    }
};
//★ 도감정보 수정 (documentFragment 활용)
displayP.prototype.modifyInventory = function(id) {
    //아이템 지정
    var item = indexArrKey(itemList,"id",id);
    //등급, 보유량, 최초획득시점 파악
    var rarity = (item.set === "") ? "epic" : "set";
    var have = (user.inventory[id]) ? user.inventory[id].have : 0;
    var firstGet = (user.inventory[id]) ? user.inventory[id].firstGet : 0;
    //도감정보 수정
        //(보유량 >= 1)
        if (have > 0) {
            //아이콘 표시
            invenInfo.querySelectorAll("#item_" + id + " .icon")[0].classList.remove("nothing");
            //아이템 이름 색상 표시
            invenInfo.querySelector("#item_" + id).classList.remove("color_nothing");
            invenInfo.querySelector("#item_" + id).classList.add("color_" + rarity);
            //보유량 변경
            invenInfo.querySelector("#item_" + id).innerHTML =
                invenInfo.querySelector("#item_" + id).innerHTML.replace(/\[x?(\d+)?\]/gi,"[x" + thousand(have) + "]");
            //최초획득 변경
            invenInfo.querySelectorAll("#item_" + id + " .firstGet")[0].innerHTML = " (" + thousand(firstGet) + "회차)";
            invenInfo.querySelectorAll("#item_" + id + " .firstGet")[0].classList.remove("nothing");
        //(보유량 = 0)
        } else  {
            //아이콘 표시
            invenInfo.querySelectorAll("#item_" + id + " .icon")[0].classList.add("nothing");
            //이름 색상 표시;
            invenInfo.querySelector("#item_" + id).classList.remove("color_" + rarity);
            invenInfo.querySelector("#item_" + id).classList.add("color_nothing");
            //보유량 변경
            invenInfo.querySelector("#item_" + id).innerHTML =
                invenInfo.querySelector("#item_" + id).innerHTML.replace(/\[x?(\d+)?\]/gi,"[x" + thousand(have) + "]");
            //최초획득 변경
            invenInfo.querySelectorAll("#item_" + id + " .firstGet")[0].innerHTML = "";
            invenInfo.querySelectorAll("#item_" + id + " .firstGet")[0].classList.add("nothing");
        }
    //수정된 도감정보 업데이트
    this.updateInventory();
};
//★ 진행사항 출력
displayP.prototype.showProgress = function() {
    //외부 UI
        //보드
        $("#board_count_num").innerHTML = thousand(user.count);//회차
        $("#board_invite_num").innerHTML = thousand(user.holding.invite.used);//초대장
        $("#board_epic_num").innerHTML = thousand(user.holding.epic.have);//에픽
        $("#board_soul_num").innerHTML = thousand(user.holding.soul.have);//소울
        $("#board_beed_num").innerHTML = thousand(user.holding.beed.have);//구슬
    //내부 UI
        //세부 진행사항
};
//★ 진행사항 초기화
displayP.prototype.clearProgress = function() {
    //유저 기록 초기화
    user.count = deepCopy(userDefault.count);//회차
    user.holding = deepCopy(userDefault.holding);//획득/보유량
    user.record = deepCopy(userDefault.record);//기록
    user.inventory = deepCopy(userDefault.inventory);//인벤토리
    //정보 초기화
    recordInfo = document.createDocumentFragment();
    //도감 재생성
    this.resetInventory();
    //획득기록 초기화
    this.clearRecord();
    //인터페이스 초기화
    this.showProgress();
    //알림 (사운드, 팝업)
    if (user.option.sfx) sfxObj.wish_set.play();
    swal({
        title:"획득기록 초기화 완료",
        text:"초기화를 되돌리고 싶으면 지금 바로 사이트(어플)을 재실행한 후 이어하기를 해주세요.",
        type:"success",
        confirmButtonText:"확인"
    });
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
            html:"찜하기는 최대 <strong>" + wishLimit.toString() + "</strong>개까지 가능합니다.",
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
        //<도감 정보> 해당 아이템 색상 변경, WISH 마크 추가
        invenInfo.querySelector("#item_" + id).classList.add("wish");
            //도감 업데이트
            this.updateInventory();
    }
    /*게임 저장*/main.saveData("찜 추가");
};
//★찜하기 지우기 (특정 위치 기준)
displayP.prototype.removeWish = function(id, cmd) {
    //찜 설정 사운드
    if (cmd !== "noSound" && user.option.sfx) sfxObj.wish_set.play();
    //찜 해제
    user.wish.splice(user.wish.indexOf(id),1);
    //찜 현황 반영
    display.checkWish();
    //<도감 정보> 해당 아이템 WISH 마크 제거, 아이콘 색상 복구
        invenInfo.querySelector("#item_" + id).classList.remove("wish");
        //도감 업데이트
        this.updateInventory();

    /*게임 저장*/main.saveData("찜 제거");
};
//★ 찜 현황 반영 (찜하기 창)
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
                //수치 관련 UI 출력
                    display.showProgress();
                //옵션 관련
                    //탐색모드 설정
                    $("#option_searchMode_text").innerHTML = user.option.searchMode || "에픽";
                    //배경음
                    switch (user.option.bgm) {
                        case 1:
                            $("#option_bgm").checked = true;break;
                        case 0:
                            $("#option_bgm").checked = false;break;
                        case undefined:
                            $("#option_bgm").checked = true;break;
                    }
                    //효과음
                    switch (user.option.sfx) {
                        case 1:
                            $("#option_sfx").checked = true;break;
                        case 0:
                            $("#option_sfx").checked = false;break;
                        case undefined:
                            $("#option_sfx").checked = true;break;
                    }
                //특수 모드
                if (user.perfectMode) {
                    //모드 활성화
                    $("#board_invite").style.display = "none";
                    $("#board_soul").style.display = "none";
                    $("#board_beed").style.display = "none";
                    $("#board_perfect1").style.display = "block";
                    $("#board_perfect2").style.display = "block";
                }
        }
    }
};
//※ 데이터 정제 (이전 버전 데이터)
mainP.prototype.maintainData = function() {
    //옵션
    if (!user.option) user.option = {};
    if (!user.option.bgm) user.option.bgm = user.bgm;
    if (!user.option.bgm) user.option.sfx = user.sfx;
    if (!user.option.searchMode || searchList.indexOf(user.option.searchMode) < 0)
        user.option.searchMode = "에픽";
    if (!user.option.channel) user.option.channel = ["랜덤",""];
    //아이템 획득정보
    if (!user.holding.invite.used) user.holding.invite.used = 0;
};
//※ 데이터 세이브
mainP.prototype.saveData = function(cmd) {
    //세이브 시점 : 탐색 종료, 아이템 찜 등록/해제, 사운드 설정, 캐릭터 변경
    if (localStorage) {
        localStore("minihell",user);
    }
    //세이브 표시
    console.log("Saved (" + cmd + ")");
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
    var styleText = "";
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
                //통합된 이미지 스타일 적용
                styleText = styleText.slice(0, -1);
                $("#imagePreloader").style.backgroundImage = styleText;
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
                //통합된 이미지 스타일 적용
                styleText = styleText.slice(0, -1);
                $("#imagePreloader").style.backgroundImage = styleText;
                //콜백
                callback();
            }
        };
        //이미지 처리
        img.src = arr[i];
        styleText += "url('" + arr[i] + "'),";
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

//★ 첫 실행
mainP.prototype.init = function() {
    //메인 버튼 활성화
    $("#button_main").disabled = false;
    $("#button_main").innerHTML = "실행";
    $("#button_main").onclick = function() {
        //사이드 버튼 출력
        main.setButton("init");
        //처음부터 하기
        $("#button_left_bottom").onclick = function() {
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
                    //나머지 설정
                    main.initLatter();
                }
            });
        };
        //이어서 하기
        $("#button_right_top").onclick = function() {
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
                        //데이터 로딩 게시
                        main.loadData();
                        //나머지 설정
                        main.initLatter();
                    }
                });
            }
        };
    };
};
//★ 초기설정 후반부
mainP.prototype.initLatter = function() {
    //일반 버튼 모드
    this.setButton("normal");
    //버튼 비활성화
    $("#button_left_top").disabled = true;
    $("#button_left_bottom").disabled = true;
    $("#button_right_top").disabled = true;
    $("#button_right_bottom").disabled = true;
    $("#button_main").disabled = true;
    $("#button_main").innerHTML = "입장 중...";
    ///구글 플레이 버튼 및 기타 텍스트 지우기
    $("#cover_google").style.display ="none";
    $("#cover_text").style.display ="none";
    //이미지 로딩
    this.loadImage(imageList, function() {
        //(이미지 로딩 이후) 애니메이션 초기설정
        animation.init();
        //던전 목록, 획득기록, 아이템 도감 작성
        setTimeout(function() {
            this.createDungeon();
            display.createRecord();
            display.createInventory();
        }.bind(this),0);
        //효과음 로딩
        this.loadAudio("sfx", function() {
            //커버 타이틀 변경
            $("#cover_title").innerHTML = "입장 중...";
            //공지 지우기
            $("#cover_notice").style.display ="none";
            //게이트 입장
            this.enterMap("gate");
        }.bind(this));
    }.bind(this));
};
//★ 버튼 설정
mainP.prototype.setButton = function(situation) {
    switch (situation) {
        //처음부터 하기, 이어서 하기
        case "init":
            $("#button_left_bottom").classList.add("hide");
            $("#button_left_bottom").classList.add("long");
            $("#button_left_bottom").innerHTML = "시작하기";
            $("#button_right_top").classList.add("hide");
            $("#button_right_top").classList.add("long");
            $("#button_right_top").innerHTML = "이어서 하기";
            $("#button_right_bottom").classList.add("hide");
            $("#button_main").classList.add("hide");

            break;
        //일반 모드
        case "normal":
            $("#button_left_top").classList.remove("hide");
            $("#button_left_bottom").classList.remove("hide");
            $("#button_left_bottom").classList.remove("long");
            $("#button_left_bottom").innerHTML = "기록";
            $("#button_right_top").classList.remove("hide");
            $("#button_right_top").classList.remove("long");
            $("#button_right_top").innerHTML = "이동";
            $("#button_right_bottom").classList.remove("hide");
            $("#button_main").classList.remove("hide");

            break;
        //모조리 비활성화
        case "disableAll":
            $("#button_left_top").disabled = true;
            $("#button_left_bottom").disabled = true;
            $("#button_main").disabled = true;
            $("#button_right_top").disabled = true;
            $("#button_right_bottom").disabled = true;
            var options = $$(".main_option");
            for (var i = 0;i < options.length;i++) {
                options[i].disabled = true;
            }

            break;
        //모조리 활성화(게이트 빼고)
        case "enableAll":
            $("#button_left_top").disabled = false;
            $("#button_left_bottom").disabled = false;
            if (selectedDungeon.now.id !== "gate")
                $("#button_main").disabled = false;
            $("#button_right_top").disabled = false;
            $("#button_right_bottom").disabled = false;
            var options = $$(".main_option");
            for (var i = 0;i < options.length;i++) {
                options[i].disabled = false;
            }

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
                //던전 - 아이템 원위치
                animation.resetItem();
                //던전 - 캐릭터 배치
                main.changeCharacter(user.myCharacter);
                //던전 -  (입장하는 던전의) 아이템 드랍 부위/레벨 가중치 구축
                simulate.build(target);
                //던전 - NPC 관련, 메인 버튼 치우기
                $("#main_npc_text").style.display = "none";
                $("#main_npc").style.display = "none";
                var options = $$(".main_option");
                for (var i = 0;i < options.length;i++) {
                    options[i].style.display = "none";
                }
            } else {
                //게이트 - 아이템 원위치
                animation.resetItem();
                //게이트 - 캐릭터 배치
                main.changeCharacter(user.myCharacter);
                //던전 - NPC 관련, 메인 버튼 표시
                $("#main_npc_text").style.display = "inline-block";
                $("#main_npc").style.display = "block";
                var options = $$(".main_option");
                for (var i = 0;i < options.length;i++) {
                    options[i].style.display = "block";
                }
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
mainP.prototype.changeCharacter = function(target) {
    //캐릭터 목록 생성
    var chaList = [];
    for (i in characterList) {
        if (characterList.hasOwnProperty(i)) {
            chaList.push(i);
        }
    }
    //선정해둔 캐릭터가 없다면 랜덤으로 선정
    if (target === "") target = chaList[Math.floor(Math.random() * chaList.length)];
    //선정 캐릭터 반영
    user.myCharacter = target;
    //선택된 캐릭터 출력
    animation.setCharacter(target, "wait");
    //옵션 버튼 이미지 적용
    $("#option_character").style.backgroundImage = "url('./img/character_face/" + user.myCharacter + ".png')";

    /*게임 저장*/main.saveData("캐릭터 변경");
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
            //메뉴 생성
            $("#frame_slot_" + target).style.display = "block";
            //버튼 비황성화
            main.setButton("disableAll");
        }
    //중앙부 밝기 조절 (frame_main, frame_board, frame_button)
    var bright = (100 - Math.abs(num) / 1.5).toString() + "%";
    $("#frame_main").style.filter = "brightness(" + bright + ")";
    $("#frame_board").style.filter = "brightness(" + bright + ")";
    $("#frame_button").style.filter = "brightness(" + bright + ")";
    //사운드 출력 (act, enter 제외)
    if (user.option.sfx && cmd !== "act" && cmd !== "enter") sfxObj["slot_" + cmd].stop().play();
    //메뉴 이동
    TweenMax.to($("#frame_slot_" + target),0.3,{xPercent:num,
        onComplete:function() {
            var bright = (100 - Math.abs(num) / 1.5).toString() + "%";
            //(열기, 입장이 아니라면)
            if (cmd !== "open" && cmd !== "enter") {
                //메뉴 제거
                $("#frame_slot_" + target).style.display = "none";
                //버튼 활성화
                main.setButton("enableAll");
            } else if (cmd === "enter") {
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
    $("#button_left_bottom").onclick = function() {
        //메뉴창 열기
        main.toggleMenu("left","open");
        //좌측 메뉴창 제목 설정
        $("#slot_title_left").innerHTML = "에픽아이템 획득 기록";
        //획득기록창 열기
        $("#record_box").style.display = "block";
        //획득내용 갱신
        display.updateRecord();
    };
    //※ 좌측 버튼 2 : 도감
    $("#button_left_top").onclick = function() {
        //메뉴창 열기
        main.toggleMenu("left","open");
        //좌측 메뉴창 제목 설정
        $("#slot_title_left").innerHTML = "에픽아이템 도감";
        //도감창 & 설명 열기
        $("#inventory_box").style.display = "block";
        $("#inventory_footer").style.display = "block";
        //도감 창 최신화 (스크롤 조절을 위해)
        display.updateInventory();
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
    $("#button_right_top").onclick = function() {
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
    //※ 우측 버튼 2 : 옵션
    $("#button_right_bottom").onclick = function() {
        //메뉴창 열기
        main.toggleMenu("right","open");
            //우측 메뉴창 제목 설정
            $("#slot_title_right").innerHTML = "옵션";
            //캐릭터 선택창 열기
            $("#option_box").style.display = "block";
            $("#option_side").style.display = "block";
    };
    //★ 우측 버튼 공통 : 닫기 버튼
    $("#slot_right_close").onclick = function() {
        //메뉴창 닫기
        main.toggleMenu("right","close",function() {
            //모든 내부선택창 닫기
            $("#dg_header").style.display = "none";
            $("#dg_box").style.display = "none";
            $("#option_box").style.display = "none";
            $("#option_side").style.display = "none";
            $("#cha_box").style.display = "none";
        });
    };

    //※ 중앙 버튼 : 탐색 개시
    $("#button_main").onclick = function() {
        //버튼 사운드
        if (user.option.sfx) sfxObj.slot_open.play();
        switch (state) {
            case "waiting":
                if (user.option.searchMode === "찜하나" ||user.option.searchMode === "모든찜") {
                    //쨈한 거
                    var num = 0;
                    for (var i = 0;i < user.wish.length;i++) {
                        if (user.inventory[user.wish[i]] &&
                            user.inventory[user.wish[i]].have > 0) num += 1;
                    }
                    if (user.wish.length === num) {
                        //모든 찜이고 찜한 거 다 모았으면
                        swal({
                            title:"모든 찜 아이템 수집 완료",
                            text:"탐색을 더 하려면, 찜 아이템 목록을 바꾸거나 옵션에서 탐색모드를 변경해주세요.",
                            type:"info"
                        });
                        //실행하지 않음
                        return;
                    }
                }
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


    //※ 옵션 : 캐릭터 변경
    $("#option_character").onclick = function() {
        //메뉴창 열기
        main.toggleMenu("right","open");
            //옵션 선택창 닫기
            $("#option_box").style.display = "none";
            $("#option_side").style.display = "none";
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
                    //메뉴창 닫기
                    main.toggleMenu("right","act",function() {
                        //모든 내부선택창 닫기
                        $("#cha_box").style.display = "none";
                    });

                    //효과음
                    if (user.option.sfx) sfxObj.slot_act.play();
                };
            })();
        }
    };
    //※ 옵션 : 탐색모드 변경
    $("#option_searchMode").onclick = function() {
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
                //탐색모드 변경
                user.option.searchMode = selected;
                //탐색모드 출력
                $("#option_searchMode_text").innerHTML = user.option.searchMode;

                //적용 사운드 출력
                if (user.option.sfx) sfxObj.slot_act.play();
                /*게임 저장*/main.saveData("탐색모드 변경");
            }
        });

    };
    //※ 옵션 : 채널 변경
    $("#option_channel").onclick = function() {
        swal({
            title:"획득 채널 결정방식",
            html:'<label for="option_channel_radio1">' +
                    '<input id="option_channel_radio1" type="radio" name="option_channel_radio" value="랜덤">' +
                    '<span>랜덤으로 채널 결정</span>' +
                '</label><label for="option_channel_radio2">' +
                    '<input id="option_channel_radio2" type="radio" name="option_channel_radio" value="고정">' +
                    '<span>정해둔 채널로 고정</span>' +
                '</label>' +
                '<select id="option_channel_list"></select>',
            confirmButtonText:"설정 적용하기",
            preConfirm: function () {
                return new Promise(function (resolve) {
                    resolve([
                        $('input[name="option_channel_radio"]:checked').value,
                        $("#option_channel_list").value
                    ]);
                });
            },
            onOpen: function () {
                //버튼 채크
                $('input[name="option_channel_radio"][value=' + user.option.channel[0] + ']').checked = true;
                //(최초) 채널 목록 구축
                if ($("#option_channel_list").options.length <= 0) {
                    var rng = resultList.channel.length;
                    for (var i = 0;i < rng;i++) {
                        var option = document.createElement("option");
                            option.value = resultList.channel[i];
                            option.innerHTML = resultList.channel[i];
                        $("#option_channel_list").add(option);
                    }
                }
                //채널 체크
                if (user.option.channel[1] !== "") {
                    var options = $("#option_channel_list").options;
                    for (var i = 0;i < options.length;i++) {
                        if (options[i].text === user.option.channel[1]) {
                            $("#option_channel_list").selectedIndex = i;
                            break;
                        }
                    }
                }
            }
        }).then(function(result) {
            if (result) {
                //옵션 적용
                user.option.channel = result;
                //버튼 표시
                $("#option_channel_text").innerHTML = result[0];

                //적용 사운드 출력
                if (user.option.sfx) sfxObj.slot_act.play();
                /*게임 저장*/main.saveData("채널 설정");
            }
        });
    };
    //※ 옵션 : 배경음 설정
    $("#option_bgm").onclick = function() {
        switch ($("#option_bgm").checked) {
            case true:
                user.option.bgm = 1;
                //사운드 비활성화 시
                if (bgmObj[selectedDungeon.now.id].loadCompleted) {
                    bgmObj[selectedDungeon.now.id].play();
                } else {
                    swal({
                        title:"불러올 음악이 없음",
                        text:"다른 던전으로 이동한 후 다시 돌아오면 음악을 불러올 수 있습니다.",
                        type:"info"
                    });
                }

                /*게임 저장*/main.saveData("배경음 활성화");
                break;
            case false:
                user.option.bgm = 0;
                bgmObj[selectedDungeon.now.id].stop();

                /*게임 저장*/main.saveData("배경음 배활성화");
                break;
            //(오류 대처 용) 둘다 아니면 일단 틀고 보기
            default:
                user.option.bgm = 1;
                //사운드 비활성화 시
                if (bgmObj[selectedDungeon.now.id].loadCompleted) {
                    bgmObj[selectedDungeon.now.id].play();
                } else {
                    swal({
                        title:"불러올 음악이 없음",
                        text:"다른 던전으로 이동한 후 다시 돌아오면 음악을 불러올 수 있습니다.",
                        type:"info"
                    });
                }

                /*게임 저장*/main.saveData("배경음 활성화");
                break;
        }
    };
    //※ 옵션 : 효과음 설정
    $("#option_sfx").onclick = function() {
        switch ($("#option_sfx").checked) {
            case true:
                user.option.sfx = 1;

                /*게임 저장*/main.saveData("효과음 활성화");
                break;
            case false:
                user.option.sfx = 0;

                /*게임 저장*/main.saveData("효과음 비활성화");
                break;
            //(오류 대처 용) 둘다 아니면 일단 틀고 보기
            default:
                user.option.sfx = 1;

                /*게임 저장*/main.saveData("효과음 활성화");
                break;
        }
    };
    //※ 옵션 : 획득 기록 초기화
    $("#option_clearRecord").onclick = function() {
        swal({
            title:"획득기록 초기화",
            html:"정말로 초기화하시겠습니까? 처음부터 다시 시작하게 되며, 초기화된 기록은 복구할 수 없습니다.",
            type:"warning",
            focusCancel:true,
            confirmButtonText: '예',
            showCancelButton:true,
            cancelButtonText: '아니요',
            cancelButtonColor: '#d33',
            showLoaderOnConfirm:true
        }).then(function(isConform) {
            if (isConform) {
                display.clearProgress();
            }
        });
    };

    //※ 기타 버튼 : 캐릭터 변경
    $("#main_character_change").onclick = function() {
        $("#option_character").click();
    };
    //※ 기타 버튼 : NPC 클릭 (퍼펙트 모드)
    $("#main_npc").onclick = function() {
        if (!user.perfectMode) {
            swal({
                title:"퍼펙트 모드 돌입",
                html:"에픽 드랍률이 100%가 되며, 입장료를 계산하지 않습니다.<br>" +
                    "(NPC를 다시 클릭하면 퍼펙트 모드가 종료됩니다.)",
                imageUrl: './img/icon_crack.png',
                imageWidth: 128,
                imageHeight: 128,
                showCancelButton:true,
                confirmButtonText: '예',
                cancelButtonText: '아니요',
                cancelButtonColor: '#d33'
            }).then(function(isConfirm){
                if (isConfirm) {
                    //모드 활성화
                    user.perfectMode = true;
                    $("#board_invite").style.display = "none";
                    $("#board_soul").style.display = "none";
                    $("#board_beed").style.display = "none";
                    $("#board_perfect1").style.display = "block";
                    $("#board_perfect2").style.display = "block";
                    //에픽 이펙트
                    spriteObj.epic[0].cover.position.set(270,120);
                    animation.epicBeam(0,"epic_appear_wish");
                    if (user.option.sfx)
                        sfxObj.epic_appear_wish.play();

                    /*게임 저장*/main.saveData("퍼펙트 모드 On");
                }
            });
        } else {
            swal({
                html:"<strong>퍼펙트 모드를 종료하시겠습니까?</strong><br>" +
                    "(NPC를 다시 클릭하면 퍼펙트 모드에 돌입합니다.)",
                type:"warning",
                showCancelButton:true,
                confirmButtonText: '예',
                cancelButtonText: '아니요',
                cancelButtonColor: '#d33'
            }).then(function(isConfirm){
                if (isConfirm) {
                    //모드 비활성화
                    user.perfectMode = false;
                    $("#board_invite").style.display = "block";
                    $("#board_soul").style.display = "block";
                    $("#board_beed").style.display = "block";
                    $("#board_perfect1").style.display = "none";
                    $("#board_perfect2").style.display = "none";
                    //에픽 이펙트
                    spriteObj.epic[0].cover.position.set(270,120);
                    animation.epicBeam(0,"epic_land");
                    if (user.option.sfx)
                        sfxObj.epic_land.play();

                    /*게임 저장*/main.saveData("퍼펙트 모드 Off");
                }
            });
        }
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
//★ 실행
document.addEventListener("DOMContentLoaded", function(e) {
    //초기 함수
    main.init();

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
            //화면 꺼짐 방지 플러그인
            window.plugins.insomnia.keepAwake();
        }, false);
        function onPause() {
            Howler.mute(true);
        }
        function onResume() {
            Howler.mute(false);
        }
        function onBackKeyDown() {
            //sweetAlert 열림 : 그거 닫기
            if (swal.isVisible()) {
                swal.close();
            //아무것도 없음 : 종료
            } else {
                quit();
            }
        }




});

})();
