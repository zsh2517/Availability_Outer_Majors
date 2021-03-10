// ==UserScript==
// @name         Sub Script of Purify
// @namespace    http://zsh2517.com/
// @version      1.0
// @description  获取课表信息并输出，是外专业选课列表工具的一个子模块
// @author       zsh2517
// @match        http://jwts.hit.edu.cn/kbcx/queryGrkb
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
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
            if(ele.innerText.replace(" ", "") === "") { // the space is C2 A0 !!
                
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
                    if(ele.indexOf("-") != -1) {
                        ele = ele.split("-");
                        for(var i = Number(ele[0]); i <= Number(ele[1]); i++) {
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
    console.log(JSON.stringify(classlist));
})();