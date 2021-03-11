// ==UserScript==
// @name         外专业选课助手
// @namespace    http://zsh2517.com/
// @version      2.1
// @description  通过预设你已经有了的课程，从选课列表中过滤时间冲突的内容。同时支持自定义一些偏好选项
// @author       zsh2517
// @match        http://jwts.hit.edu.cn/xsxk/queryXsxkList
// @match        http://jwts.hit.edu.cn/xsxk/queryXsxkList?*
// @match        http://jwts.hit.edu.cn/kbcx/queryGrkb
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';
    const refuse_type = ["opacity", "displaynone"][0]; // 选择如何隐藏
    // 0 是透明化按钮，1 是不显示。一般情况下建议透明，而非彻底不显示该课程。

    const refuse = {
        teacher: [], // 如果不想选某个老师的课，添加到这里 比如 ["张三", "李四"]
        school: [], // 不包含这些学院的课程，比如 ["计算机科学与技术学院"]，这里可以排除自己的学院以及不想去的学院
        // 后面四个没做
        name_in_class: [], // 不包含某些字符的课程，比如 ["原子", "代数", "函数"]
        week: [], // 如果不想选择有第几周的课，添加到这里 [1, 2, 17, 18, 19]
        weekday: [], // 如果不想选周几的课，添加到这里 [6, 7]
        time: [], // 上午四节下午四节，晚上四节，依次排下来，不想选哪个的话添加，比如 早八和晚上的 [1, 9, 10, 11, 12]
    };



    var courseType = document.querySelector("body > div.Contentbox > div > div.address > a").innerHTML;
    if (courseType === "个人课表查询") {
        (function () {
            var tb = document.querySelector("body > div.Contentbox > div > div.xfyq_area.mt10 > div.xfyq_con > table > tbody");
            console.log(tb);
            var getclass = function (day, cls) {
                return tb.children[cls].children[day + 1];
            }
            var classlist = [];
            for (var day = 1; day <= 7; day++) {
                for (var cls = 1; cls <= 6; cls++) {
                    var ele = getclass(day, cls);
                    // console.log(`[${ele.innerText}]`);
                    if (ele.innerText.replace(" ", "") === "") { // the space is C2 A0 !!

                    } else {
                        var data = {}
                        data.name = ele.children[0].previousSibling.wholeText;
                        var text = ele.children[0].nextSibling.wholeText;
                        text = text.split("[");
                        data.teacher = text[0];
                        text = text[1].split("]");
                        data.week = text[0];
                        data.place = text[1].replace("周", "");
                        var temp = [];
                        data.week.split("，").forEach(ele => {
                            if (ele.indexOf("-") != -1) {
                                ele = ele.split("-");
                                for (var i = Number(ele[0]); i <= Number(ele[1]); i++) {
                                    temp.push(i);
                                }
                            } else {
                                temp.push(Number(ele));
                            }
                        })
                        data.week = temp;
                        data.weekday = day;
                        data.time = [cls * 2 - 1, cls * 2];
                        console.log(data);
                        classlist.push(data);
                    }
                }
            }
            // console.log(JSON.stringify(classlist));
            GM_setValue("schedule", classlist);
            console.log("课表保存成功");
            var newele = document.querySelector("#queryform").appendChild(document.createElement("div"));
            newele.innerText = `外专业选课助手：课表保存成功`;
            newele.style["font-size"] = `large`;
            newele.style["color"] = `red`;
            newele.style["text-align"] = `middle`;

            console.log(GM_getValue("schedule", classlist));
        })();
    }

    if (courseType === "外专业课程") {
        var already_class = GM_getValue("schedule");
        if(already_class === undefined) {
            console.log("无预设课表");
            var newele = document.querySelector(".search").appendChild(document.createElement("div"));
            newele.innerText = `外专业选课助手：无预设课表。请先打开课表界面进行导入（自动导入）`;
            newele.style["font-size"] = `large`;
            newele.style["color"] = `red`;
            newele.style["text-align"] = `middle`;
            return;
        }
        var table = [];
        for (var i = 0; i <= 20; i++) {
            var temp1 = [];
            for (var j = 0; j <= 7; j++) {
                var temp2 = [];
                for (var k = 0; k <= 12; k++) {
                    temp2.push("");
                }
                temp1.push(temp2);
            }
            table.push(temp1);
        }
    
        already_class.forEach(cls => {
            console.log(cls);
            cls.week.forEach(week => {
                table[week][cls.weekday][cls.time[0]] = `${cls.name} - ${cls.teacher}`;
                table[week][cls.weekday][cls.time[1]] = `${cls.name} - ${cls.teacher}`;
            })
        })
    
        console.log(table);
    
        var delete_courses = []
        for (var index = 2; index < 1 + document.querySelector("body > div.Contentbox > div > div.list > table > tbody").childNodes.length / 2; index++) {
            if (index == 21) {
                index = 21;
            }
            const separator = "◇";
            var element = document.querySelector(`body > div.Contentbox > div > div.list > table > tbody > tr:nth-child(${index})`);
            var data = {
                code: element.children[2].innerText,
                name: element.children[3].innerText,
                request: element.children[4].innerText,
                target: element.children[5].innerText,
                addr: element.children[6].innerText,
                type: element.children[8].innerText,
                school: element.children[9].innerText,
                score: element.children[10].innerText,
                length: element.children[11].innerText,
                capacity: element.children[12].innerText,
            }
            var cap = data.capacity.split("\n");
            cap[1] = cap[1].replace("对外", "");
            data.capacity = {
                total: {
                    cnt: Number(cap[0].split("/")[0]),
                    max: Number(cap[0].split("/")[1]),
                },
                out: {
                    cnt: Number(cap[1].split("/")[0]),
                    max: Number(cap[1].split("/")[1]),
                }
            }
            console.log(data.capacity);
            var info = element.children[7];
            data.teacher = info.querySelector("a").innerText;
            var text = info.querySelector("br").nextSibling.wholeText.slice(5);
            data.time = text.match(/\[.*?\]星期.第(\d+(,){0,1})+节◇.*?(?=[◇,])/g);
            var temp = [];
            console.log(data.time);
            debugger;
            if (data.time !== null) {
                data.time.forEach(ele => {
                    // console.log(typeof (ele));
                    var glb = element;
                    ele = ele.split(separator);
                    var 第几周 = ele[0].split("星期");
                    var 周几 = 第几周[1].split("第");
                    // console.log(周几[1]);
                    var 第几节课 = 周几[1].match(/\d+/g);
                    // console.log(第几节课);
                    // debugger;
                    第几周 = 第几周[0].slice(1, -2).replace("双", "");
                    第几周 = 第几周.replace("单", "");
                    周几 = 周几[0];
                    var 周次列表 = [];
                    第几周.split(",").forEach(ele => {
                        if (ele.indexOf("-") != -1) {
                            ele = ele.split("-");
                            for (var i = Number(ele[0]); i <= Number(ele[1]); i++) {
                                周次列表.push(i);
                            }
                        } else {
                            周次列表.push(Number(ele));
                        }
                    })
                    var week_map = { "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7 }
                    temp.push({
                        origin: ele[0],
                        place: ele[1],
                        weeks: 周次列表,
                        weekday: week_map[周几],
                        daytime: 第几节课.map(Number)
                    })
                })
                data.time = temp;
            }
            var reason = [];
            var free = "";
            // 时间冲突无法选择
            if (data.time !== null) {
                data.time.forEach(ele => {
                    ele.weeks.forEach(week => {
                        ele.daytime.forEach(daytime => {
                            console.log(week, ele.weekday, daytime);
                            if (table[week][ele.weekday][daytime] !== "" && free === "") {
                                free = table[week][ele.weekday][daytime];
                            }
                        })
                    })
                })
            }
            if (free !== "") {
                reason.push(`与课程 ${free} 冲突`);
            }
            // 容量已满无法选择

            if (data.capacity.total.max === data.capacity.total.cnt) {
                reason.push(`总容量已满`);
            }
            if (data.capacity.out.max === data.capacity.out.cnt) {
                reason.push(`对外容量已满`);
            }
            // 个人偏好原因
            if (refuse.teacher.indexOf(data.teacher) != -1) reason.push(`教师: ${data.teacher}`);
            if (refuse.school.indexOf(data.school) != -1) reason.push(`学院: ${data.school}`);


            if (reason.length > 0) {
                element.children[4].appendChild(document.createElement("div")).innerHTML = `<span style='color: red'>${reason.join(" ")}</span>`;
                delete_courses.push(data.name);
                switch (refuse_type) {
                    case "opacity":
                        element.children[0].children[0].style["opacity"] = "0.2";
                        break;
                    case "displaynone":
                        element.style["display"] = "none";
                        break;

                    default:
                        break;
                }
            }
        }
        var newele = document.querySelector(".search").appendChild(document.createElement("div"));
        newele.innerText = `外专业选课助手：本页面基于您设定的规则和已选课表，隐藏了 ${delete_courses.length} 个课程，分别为 ${delete_courses.join(" ")}`
        newele.style["font-size"] = `large`;
        newele.style["color"] = `red`;
        newele.style["text-align"] = `middle`;
    }
})();