
(function() {
'use strict';

//=====================================================================
//※ 변수, 기초 정보
//=====================================================================
var i,j,k,l,m;

//실행 관련
var count = 0;//회차
var state = "waiting";//실행 상태
var goyuList = [];//고유 에픽 리스트
var weighted_type = [];//에픽 부위 선정 가중치
var weighted_level = [];//에픽 레벨 선정 가중치
var current_goyu = [];//현재 지역 고유에픽 리스트

//아이템 관련
var channel = "";//아이템 획득한 채널
var record_item = [];//획득 아이템 정보
var record_epic = 0;//획득 에픽 수
var record_set = [];//획득 세트(세트완성 중복 출력 방지)
var droprate = [//임시 - 아이템 드랍률
    0.064,//마계 일반 던전
    0.11//마계의 틈
];
var droptype = {
    name:["무기","방어구","악세서리","특수장비"],
    num:[1,1,1,0.2]//장비 타입별 드랍확률 가중치
};
var droplevel = {
    name:[85,90],
    num:[60,40]
};
var itemP = {//최초 아이템 위치(개선판 만들 땐 꼭 없앨 것)
    x:getComputedStyle($("#item1")).getPropertyValue("left").replace("px","") / 33.3,
    y:getComputedStyle($("#item1")).getPropertyValue("top").replace("px","") / 33.3
};

//던전 관련
var selectedDungeon = {before:"gate",after:""};
var dungeonList = [
    "gate","metro_1","metro_2","metro_3","metro_4","metro_5","metro_6"
];

//브금
var bgmObj = {};
for (i = 0;i < dungeonList.length;i++) {
    bgmObj[dungeonList[i]] = new Howl({
        src:["./sound/bgm/bgm_" + dungeonList[i] + ".ogg"],
        loop:true,
        volume:0.3
    });
}
var epicSfxList = [
    "epic_appear","epic_land"
];
var sfxList = [
    "slot_open","slot_enter","slot_close"
];
var hitList = ["hit_slash","hit_hit","hit_gun","hit_magic"];
var sfxObj = {};
for (i = 0;i < epicSfxList.length;i++) {
    sfxObj[epicSfxList[i]] = new Howl({
        src:["./sound/sfx/sfx_" + epicSfxList[i] + ".ogg"],
        loop:false,
        volume:0.4
    });
}
for (i = 0;i < sfxList.length;i++) {
    sfxObj[sfxList[i]] = new Howl({
        src:["./sound/sfx/sfx_" + sfxList[i] + ".ogg"],
        loop:false,
        volume:0.9
    });
}
for (i = 0;i < hitList.length;i++) {
    sfxObj[hitList[i]] = new Howl({
        src:["./sound/sfx/sfx_" + hitList[i] + ".ogg"],
        loop:false,
        volume:0.2
    });
}

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

//기타
var imageList = []; //이미지 선로딩용 임시저장소


//=====================================================================
//※ 처리 함수
//=====================================================================
//탐색 관련
function simulateP() {}
simulateP.prototype = {
    //★탐색 전 부위/레벨 가중치 구축
    build:function() {
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
    },
    //★탐색 준비
    ready:function() {
        //캐릭터 스프라이트 변경
        $("#main_character").classList.remove("wait");
        $("#main_character").classList.add("attack");
        //버튼 문구 변경
        $("#button_main").innerHTML = "탐색 중단";
        //사이드 버튼 비활성화
        $("#button_left").disabled = true;
        $("#button_right").disabled = true;
        //1회 탐색 개시
        this.run();
    },
    //★1회 탐색 중
    run:function() {
        //회차 증가
        count += 1;
            //변경 회차 반영
            $("#board_count_num").innerHTML = thousand(count);
        //0.5초 후(타격 애니메이션 종료 후)
        setTimeout(function() {
            //타격 사운드
                //임시로 남격가 타격음 출력
                sfxObj.hit_hit.play();
            //탐색 결과 확인
            if (this.result()) {
                //아이템 드랍 승인 -> 아이템 선정
                this.getItem();
                //탐색 종료
                this.end();
            } else if (state === "waiting") {
                //탐색 종료
                this.end();
            } else {
                //탐색 지속
                this.run();
            }
        }.bind(this),125);
    },
    //★탐색 결과 판별
    result:function() {
        //드랍 결과 확인 (랜덤)
        var rate = Math.random();
        var sb = selectedDungeon.before;
        if ((sb !== "metro_6" && rate <= droprate[0]) ||
        (sb === "metro_6" && rate <= droprate[1])) {
            return true;
        } else {
            return false;
        }
    },
    //★아이템 선정 (차후 세련되게 개선)
    getItem:function() {
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
    },
    //★아이템 선정결과 반영
    applyItem:function(item) {
        //습득 채널 표시
        var arr = resultList.channel;
        channel= arr[Math.floor(Math.random() * arr.length)];
        $("#channel_text").innerHTML = channel;

        //에픽 획득량 증가
        record_epic += 1;
            //에픽 획득량 표시
            $("#board_epic_num").innerHTML = thousand(record_epic);
        //아이템 수량 증가
        indexArrKey(itemList,"name",item.name).get += 1;
        indexArrKey(itemList,"name",item.name).have += 1;
        //아이템 획득내역 기록
            //일반 아이템
            if (item.set === "") {
                //기록 : [회차, 채널, 아이템정보, 획득수]
                record_item.push([count, channel, deepCopy(item), indexArrKey(itemList,"name",item.name).have]);
            //세트 아이템
            } else {
                var temp = [0,0];//해당 세트 아이템 수, 수집 수
                for (i = 0;i < itemList.length;i++) {
                    if (itemList[i].set === item.set) {
                        temp[1] += 1;
                        if (itemList[i].have > 0)
                            temp[0] += 1;
                    }
                }
                //기록 : [회차, 채널, 아이템정보, 세트 확보량]
                record_item.push([count, channel, deepCopy(item), indexArrKey(itemList,"name",item.name).have, temp[0] + "/" + temp[1]]);
            }
        //이전까지 세트 미완성 시 : 완성여부 파악
        if (item.set !== "" && record_set.indexOf(item.set) < 0) {
            if (temp[1] === temp[0]) {
                //record_set 등록하기
                record_set.push(item.set);
                //recor_item 등록하기
                record_item.push(item.set);
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
        //->아이템 드랍
        this.dropItem(item);
    },
    //★아이템 원위치, 기존 에픽 이펙트 제거
    resetItem:function() {
        //아이템 이름, 필드 이미지 가시화
        $("#item_name1").style.visibility = "hidden";
        $("#item_img1").style.visibility = "hidden";
        //아이템 원위치
        $("#item1").style.left = itemP.x + "rem";
        $("#item1").style.top = itemP.y + "rem";
        //기존 아이템 이펙트 제거
        $("#item_img1").classList.remove("rotate");
        void $("#item_img1").offsetWidth;
        $("#effect_appear1").classList.remove("act");
        void $("#effect_appear1").offsetWidth;
        $("#effect_land1").classList.remove("act");
        void $("#effect_land1").offsetWidth;
        $("#effect_wait1").classList.remove("act");
        void $("#effect_wait1").offsetWidth;
    },
    //★아이템 드랍
    dropItem:function(item) {
        //아이템 원위치, 기존 에픽 이펙트 제거
        this.resetItem();

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
        sfxObj.epic_appear.stop().play();

        //아이템 회전 시작
        $("#item_img1").classList.add("rotate");
        //에픽 등장 이펙트
        $("#effect_appear1").classList.add("act");


        //아이템 루팅
            //X좌표
            TweenMax.to($("#item1"),0.6,{
                    left:"-=5rem",
                    ease:Power0.easeNone
                });
            //Y좌표
            TweenMax.to($("#item1"),0.2,{
                    top:"-=0.5rem",
                    ease: Circ.easeOut
                });
            TweenMax.to($("#item1"),0.4,{
                    top:"+=4.5rem",
                    ease: Circ.easeIn,
                    delay:0.2,
                    onComplete:function() {
                        //에픽 착지 이펙트
                        $("#effect_land1").classList.add("act");
                        //에픽 대기 이펙트
                        $("#effect_wait1").classList.add("act");
                        //에픽 착지 사운드
                        sfxObj.epic_land.stop().play();
                    }
                });

    },
    //★탐색 종료
    end:function() {
        state ="waiting";
        //캐릭터 스프라이트 변경
        $("#main_character").classList.remove("attack");
        $("#main_character").classList.add("wait");
        //버튼 문구 변경 & 버튼 활성화
        $("#button_main").innerHTML = "탐색 개시";
        $("#button_left").disabled = false;
        $("#button_main").disabled = false;
        $("#button_right").disabled = false;
    }
};
var simulate = new simulateP();

//출력 관련
function displayP() {}
displayP.prototype = {
    //★탐색 전 부위/레벨 가중치 구축
    showRecord:function() {
        //텍스트 생성
        var text = "";
        for (i = 0;i < record_item.length;i++) {
            var tmp = record_item[i];
            var ttype = (record_item[i][2].sort1 === "방어구") ? record_item[i][2].sort2 : record_item[i][2].sort3;
            switch(typeof record_item[i]) {
                case "object":
                    text += "<p class='record_head'>" + thousand(record_item[i][0]) +
                        "회차 <span class='font_small color_gray'>(" + record_item[i][1] + ")</span></p>";
                    if (record_item[i][2].set === ""){
                        text += "<p class='record_item color_epic'>" + record_item[i][2].name +
                            "<span class='color_skyblue'> [x" + thousand(record_item[i][2].have) + "]</span>" +
                            "<span class='color_white font_small'> [Lv." + record_item[i][2].level.toString() + "]</span>" +
                            "<span class='color_white font_small'>[" + ttype + "]</span>" +
                            "</p>";
                    } else {
                        text += "<p class='record_item color_set'>" + record_item[i][2].name +
                            "<span class='color_skyblue'> [x" + thousand(record_item[i][2].have) + "]</span> " +
                            "<span class='color_white font_small'> [Lv." + record_item[i][2].level.toString() + "]</span>" +
                            "<span class='color_white font_small'>[" + ttype + "]</span>" +
                            "<span class='font_small'>(세트 : " +  record_item[i][4] + ")</span>" +
                            "</p>";
                    }
                    break;
                case "string":
                    text += "<p class='record_set color_yellow'>\"" + record_item[i] + "\" 세트 완성!</p>";

                    break;
            }
        }
        //텍스트 출력
        $("#record_box").innerHTML = text;
        //스크롤 내리기
        $("#record_box").scrollTop = $("#record_box").scrollHeight;
    },
    //★기록창 지우기
    clearRecord:function() {
        var myNode = $("#record_box");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
    }
};
var display = new displayP();

//=====================================================================
//※ 실행
//=====================================================================
window.onload = function() {
    //브금 실행
    bgmObj.gate.play();

    //※ 버튼 : 획득 기록
    $("#button_left").onclick = function() {
        //버튼들 비활성화
        $("#button_left").disabled = true;
        $("#button_main").disabled = true;
        $("#button_right").disabled = true;
        //메뉴창 열기
        $("#frame_slot_left").style.display = "block";
        TweenMax.to($("#frame_slot_left"),0.3,{xPercent:100});
        //메뉴창 열기 사운드
        sfxObj.slot_open.play();
        //획득내용 보여주기
        display.showRecord();
        //닫기 버튼
        $("#slot_left_close").onclick = function() {
            //메뉴창 닫기
            TweenMax.to($("#frame_slot_left"),0.3,{xPercent:0,
                onComplete:function() {
                    //버튼들 활성화
                    $("#button_left").disabled = false;
                    if (selectedDungeon.before !== "gate")
                        $("#button_main").disabled = false;
                    $("#button_right").disabled = false;
                }
            });
            //메뉴창 닫기 사운드
            sfxObj.slot_close.play();
            //획득내용 지우기
            display.clearRecord();
        };
    };

    //※ 버튼 : 던전 변경
    $("#button_right").onclick = function() {
        //버튼들 비활성화
        $("#button_left").disabled = true;
        $("#button_main").disabled = true;
        $("#button_right").disabled = true;
        //메뉴창 열기
        $("#frame_slot_right").style.display = "block";
        TweenMax.to($("#frame_slot_right"),0.3,{xPercent:-100});
        //메뉴창 열기 사운드
        sfxObj.slot_open.play();
        //던전 교체
        for (i=0;i<$$(".dg_list").length;i++) {
            (function() {
                var bt = $$(".dg_list")[i];
                bt.onclick = function() {
                    //메뉴창 닫기
                    TweenMax.to($("#frame_slot_right"),0.3,{xPercent:0});
                    //메인 버튼 문구 변경
                    $("#button_main").innerHTML = "입장 중...";
                    //던전 정보 변경
                    selectedDungeon.after = bt.dataset.target;
                    //던전 입장 이미지
                    $("#main_cover").style.display = "block";
                    $("#main_cover").style.opacity = "1";
                    $("#main_cover_bg").style.opacity = "1";
                    //던전 입장 사운드
                    sfxObj.slot_enter.play();
                    setTimeout(function() {
                        //===============================================================
                        //블랙 아웃 (던전 정보 반영)
                        $("#main_cover_bg").style.opacity = "0";
                        //던전 배경 변경
                        $("#frame_main").style.backgroundImage = "url('./img/bg/bg_" + bt.dataset.target + ".jpg')";
                        //캐릭터 배치
                        $("#main_character").classList.remove("gate");
                        $("#main_character").classList.add("dungeon");
                        //아이템 원위치
                        simulate.resetItem();
                        //아이템 드랍 부위/레벨 가중치 구축
                        simulate.build();
                        //===============================================================
                        setTimeout(function() {
                            //던전 등장
                            $("#main_cover").style.opacity = "0";
                            //기존 브금 종료
                            if (selectedDungeon.before !== "" && selectedDungeon.before !== selectedDungeon.after)
                                bgmObj[selectedDungeon.before].stop();
                            //새 브금 실행
                            if (selectedDungeon.before !== selectedDungeon.after)
                                bgmObj[selectedDungeon.after].play();
                            setTimeout(function() {
                                //던전 변경 완료
                                selectedDungeon.before = selectedDungeon.after;
                                selectedDungeon.after = "";
                                //클릭 가능
                                $("#main_cover").style.display = "none";
                                //버튼들 활성화
                                $("#button_left").disabled = false;
                                if (selectedDungeon.before !== "gate")
                                    $("#button_main").disabled = false;
                                $("#button_right").disabled = false;
                                //메인 버튼 문구 변경
                                $("#button_main").innerHTML = "탐색 개시";
                            },750);
                        },750);
                    },750);
                };
            })();
        }
        //닫기 버튼
        $("#slot_right_close").onclick = function() {
            //메뉴창 닫기
            TweenMax.to($("#frame_slot_right"),0.3,{xPercent:0,
                onComplete:function() {
                    //버튼들 활성화
                    $("#button_left").disabled = false;
                    if (selectedDungeon.before !== "gate")
                        $("#button_main").disabled = false;
                    $("#button_right").disabled = false;
                }
            });
            //메뉴창 닫기 사운드
            sfxObj.slot_close.play();
        };
    };

    //※ 버튼 : 탐색 개시
    $("#button_main").onclick = function() {
        //버튼 사운드
        sfxObj.slot_open.play();
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

    //스크롤바 이벤트
    function scrollLock(target) {
        target.classList.add("scroll_stop");
        target.scrollTop = target.scrollTop;
        void target.offsetWidth;
        setTimeout(function() {
            target.classList.remove("scroll_stop");
        }, 100);
    }
    $("#record_box").addEventListener('touchend', function(e){
        scrollLock(this);
        e.preventDefault();
    }, false);
    $("#dg_box").addEventListener('touchend', function(e){
        scrollLock(this);
        e.preventDefault();
    }, false);


};

//뒤로 버튼 경고음
window.onbeforeunload = function() {
    return '정말로 아라드 운세를 종료하시겠습니까?';
};



})();
