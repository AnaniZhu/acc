// let BASEURL='http://172.16.0.186:8085/crowd';//武庆明
let BASEURL='http://dqmigrationinternal.ytbig.cn:8287/crowd';//线上

var NODE_ENV = 'product', map, gb = { a3: 0, a1: 0, a2: 0 }, timer, pre = [];//product\\development
let data_view = [
    {
        name: '实时人数',
        val: 0,
        key: 'num'
    },
    {
        name: '在德峰值人数',
        val: 0,
        key: 'peak'
    },
    {
        name: '在德人群活力（岁数）',
        val: 0,
        key: 'sixty'
    },
    {
        name: '在德高收入人群占比',
        val: 0,
        key: 'high'
    },
    // {
    //     name: '谷值人数',
    //     val: 0,
    //     key: 'valleyVal'
    // },
    // {
    //     name: '外来人口',
    //     val: 0,
    //     key: 'foreign'
    // },
    // {
    //     name: '工作地数',
    //     val: 0,
    //     key: 'workplace'
    // },
    // {
    //     name: '居住地数',
    //     val: 0,
    //     key: 'live'
    // }
], 
form4 = [
    {
        name: '来源市内',
        val: 0,
        img: require('@/img/car.png'),
        key: 'inCity'
    },
    {
        name: '来源省内',
        val: 0,
        img: require('@/img/train.png'),
        key: 'intProvince'
    },
    {
        name: '来源国内',
        val: 0,
        img: require('@/img/map.png'),
        key: 'inDomestic'
    },
    {
        name: '来源国外',
        val: 0,
        img: require('@/img/plane.png'),
        key: 'inForeign'
    },
],
townAndVillageData = {},
isShowImmigration = true,//控制是否显示中国地图，中间地图轮播第一张默认显示
isShowImmigration1 = false,//控制是否显示中国地图，中间地图轮播第二张默认不显示
isIn = true,
globalVillageId = '',//村id
globalVillageName = '',//村名
globalTownId = '', 
globalIsShowVillage = '',
globalName = '';

function get_num() {
    $.ajax({
        url: BASEURL+'/crowdMigration',
        type: 'get',
        headers: { 'Access-Control-Allow-Origin': '*' },
        crossDomain: true,
        success: function (data) {
            //近三日
            let warkDayThreeX = [], warkDayThreeY = [], liveDayThreeX = [], liveDayThreeY = [];
            // //工作地
            data.recentPeakNum.true.forEach((v) => {
                warkDayThreeX.push(v.name);
                warkDayThreeY.push(v.workers);
                bar_chart2('bar3', { y: warkDayThreeY, x: warkDayThreeX, name: '工作地' })
            })
            //居住地
            data.recentPeakNum.false.forEach((v) => {
                liveDayThreeX.push(v.name);
                liveDayThreeY.push(v.workers);
                bar_chart2('bar4', { y: liveDayThreeY, x: liveDayThreeX, name: '居住地' });
            })

            //近1年新德清人数
            let yearTopX = [], yearTopY = []
            data.newDeqingNum.forEach((v) => {
                yearTopX.push(`${v.month}月`)
                yearTopY.push(v.pep)
                bar_chart2('bar1', { y: yearTopY, x: yearTopX, name: '新德清人数' })
            })

            //人口流入嘉奖村
            let focusRewardIn = ''
            if(data.focusReward.in){
                data.focusReward.in.forEach(v => {
                    focusRewardIn += `
                        <div class="person-item inflow-left">
                            <h5 class="person-title">${v.villageName}</h5>
                            <div class="person-num-wrapper">
                                <div class="person-num">
                                    <div class="person-num-item">去年：</div>
                                    <div>${v.lastYearInAcc ? v.lastYearInAcc : '0.0%'}</div>
                                </div>
                                <div class="person-num">
                                    <div class="person-num-item">前年：</div>
                                    <div>${v.threeYearsAgoInAcc ? v.threeYearsAgoInAcc : '0.0%'}</div>
                                </div>
                            </div>
                            <div class="person-province">高迁入率省份</div>
                            <div class="person-province-wrapper">
                                <div class="person-province single">${v.provinces}</div>
                                <div class="person-percentage">${v.provincesAcc ? v.provincesAcc : '0.0%'}</div>
                            </div>
                        </div>
                    `
                    $('#commendation').html(focusRewardIn)
                })
            }

            //人口流失关注村
            let focusRewardOut = '';
            if(data.focusReward.out) {
                data.focusReward.out.forEach(v => {
                    focusRewardOut += `<div class="person-item loss-left">
                            <h5 class="person-title">${v.villageName}</h5>
                            <div class="person-num-wrapper">
                                <div class="person-num">
                                    <div class="person-num-item">去年：</div>
                                    <div>${v.lastYearOutAcc ? v.lastYearOutAcc : '0.0%'}</div>
                                </div>
                                <div class="person-num">
                                    <div class="person-num-item">前年：</div>
                                    <div>${v.threeYearsAgoOutAcc ? v.threeYearsAgoOutAcc : '0.0%'}</div>
                                </div>
                            </div>
                            <div class="person-province">高迁出率省份</div>
                            <div class="person-province-wrapper">
                                <div class="person-province single">${v.provinces}</div>
                                <div class="person-percentage">${v.provincesAcc ? v.provincesAcc : '0.0%'}</div>
                            </div>
                        </div>`
                    $('#follow').html(focusRewardOut)
                })
            }

            //年龄分析
            let age = data.imageAnalysis.ageAcc, agex = Object.keys(age), agey = Object.values(age), obj_ag = {
                sixty: '36岁-60岁',
                thirtyFive: '18岁-35岁',
                eighteen: '18岁以下',
                sixtyOne: '61岁以上'
            };
            bar_chart1("bar6", {
                name: '年龄比例',
                per: '',
                colorY: '#447CC2',
                x: agex.map(v => obj_ag[v]),
                y: [
                    {
                        color1: '#0D1F3A',
                        color2: '#3BF7D6',
                        data: agey,
                    },
                ],
            })

            //男女
            pie_chart3('bar5', {
                sex: [{
                    name: '男性',
                    num: data.imageAnalysis.malefemale.male
                }, {
                    name: '女性',
                    num: data.imageAnalysis.malefemale.female
                },]
            })

            //来源地top10
            for (let x in data.foreignPeopleDistribute) {
                let st = '', cur = data.foreignPeopleDistribute[x], x1 = [], y = [], sum = 0;
                cur.forEach(v => {
                    x1.push(v.NAME)
                    y.push(v.NUM)
                    sum += v.NUM
                })
                switch (x) {
                    case "region":
                        st = 'bar8';
                        break;
                    case "inForeigns":
                        st = 'bar10';
                        break;

                    case "domestics":
                        st = 'bar9';
                        break;
                }
                bar_chart7(st, {
                    x: x1,
                    y: y,
                    sum: sum,
                    colorList: [
                        ['#8A5E13', '#FFDF30'],
                        ['#8A5E13', '#FFDF30'],
                        ['#0F6F68', '#40D7EF'],
                        ['#0F6F68', '#40D7EF'],
                        ['#0D2E97', '#5E6CFF'],
                        ['#0D2E97', '#5E6CFF'],
                    ],
                })
            }

            //在德数据概览
            let d1 = data.dataOverview;
            $('.numlist').html(data_view.map((v, i) => {
                if(i == 2) {
                    return `
                        <div>
                            <p>${d1.crowdDynamic.name.slice(0, 5)}</p>
                            <span>${v.name}</span>
                        </div>
                    `
                }else {
                    return `
                        <div>
                            <p>${d1[v.key]}</p>
                            <span>${v.name}</span>
                        </div>
                    `
                }
            }));
            $('.numlist div').each(function (one) {
                let p = $(one).find('p').eq(0), end = p.text();
                jumpNum(end, 1200, p)
            })

            //来源分析
            let val = data.imageAnalysis.sourceAnalysis
            $('.form4').html(form4.map(v => {
                return `
                    <div>
                        <img src="${v.img}" alt="">
                        <div>
                            <p>${val[v.key]}</p>
                            <span>${v.name}</span>
                        </div>
                    </div>
                `
            }).join(''))

            $('.form4 div p').each(function (i, one) {
                let p = $(one), end = p.text();
                jumpNum(end, 1200, p)
            })

            //分析
            $('.tbody').html('<ul>' + data.real.perception.map(v => {
                return `
                    <li class="tr">
                        <span>${v.date}</span>
                        <span>${v.num}</span>
                    </li>
                `
            }).join('') + '</ul>')

            $('.tbody').myScroll({
                speed: 40, //数值越大，速度越慢
                rowHeight: parseInt($('.tbody').eq(0).children().eq(0).css('height')) //li的高度
            });
        }
    })
}
function jumpNum(end, time, el) {
    let speed = Math.ceil(end / time), start = 0, times;
    times = setInterval(function () {
        if (start >= end) {
            el.text(end)
            clearInterval(times)
        } else {
            start += speed
            el.text(start)
        }
    }, 1)
}

//横向多色渐变2(带底色，不带坐标轴，横向，右标）
function bar_chart7(id, data) {
    let { sum, colorList } = data;
    let maxArr = [];
    data.y.forEach(v => {
        maxArr.push(sum);
    })
    let color = data.color || ['#6590CC', '#D4714D', '#FFDD63', '#99EAA1', '#FF6363', '#C499EA'];
    let option = {
        grid: {
            left: '5%',
            right: '5%',
            bottom: '12%',
            top: '5%',
            containLabel: true
        },
        xAxis: {
            show: true,
            type: 'value',
            axisLabel: {
                show: false,
            },
            splitLine: {
                show: false
            },
            axisLine: {
                show: false
            },
        },
        yAxis: [
            {
                type: 'category',
                inverse: true,
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#4279BE',
                        fontSize: 10,
                    },
                },
                splitLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                data: data.x  //名称
            },
            {
                type: 'category',
                inverse: true,
                axisTick: 'none',
                axisLine: 'none',
                show: true,
                axisLabel: {
                    textStyle: {
                        color: data.colorRight || '#ffffff',
                        fontSize: '12'
                    },
                    formatter: function (value) {
                        if (data.showNum) {
                            return value + (data.per || '')
                        } else {
                            return (value / sum * 100).toFixed(1) + '%';
                        }
                    },
                },
                data: data.y //实际数据
            }

        ],
        series: [
            {
                name: data.name || '人数',
                type: 'bar',
                zlevel: 1,
                itemStyle: {
                    normal: {
                        barBorderRadius: data.barBorderRadius || [0, 30, 30, 0],
                        color(v) {
                            let a = v.dataIndex;
                            a = a > 3 ? 2 : 1
                            return new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
                                offset: 0,
                                color: colorList[a][1]
                            }, {
                                offset: 1,
                                color: colorList[a][0]
                            }])
                        },
                    },
                },
                barWidth: '40%',
                data: data.y  //实际数据
            },
            {
                data: maxArr,
                type: "bar",
                barMaxWidth: "auto",
                barWidth: '40%',
                barGap: "-100%",
                zlevel: -1,
                itemStyle: {
                    normal: {
                        color: '#0F3E40',
                        barBorderRadius: [0, 30, 30, 0],
                    },
                },
            }
        ]
    };
    let chart = echarts.init(document.getElementById(id))
    chart.setOption(option, true)
}

/**
 * 柱状图
 */
function bar_chart1(id, data) {
    let arr = [], legend = null;
    data.y.forEach((v, i) => {
        let obj = {
            name: data.name,
            type: 'bar',
            barWidth: '40%',
            itemStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
                        offset: 0,
                        color: v.color1
                    },
                    {
                        offset: 1,
                        color: v.color2
                    }
                    ]),
                }
            },

            label: data.showYTop ? {
                normal: {
                    show: true,
                    color: '#fff',
                    position: 'top'
                }
            } : {},
            data: v.data
        };
        arr.push(obj);
    })
    if (data.legend) {
        legend = {
            right: 20,
            icon: 'roundRect',
            textStyle: {
                color: '#FFFFFF',
            },
            data: data.legend
        }
    }
    let option = {
        color: ['#3398DB'],
        tooltip: {
            trigger: 'axis',
            formatter: `{a} <br/>{b} : {c}${data.per}`
        },
        grid: {
            top: '15%',
            left: '3%',
            right: '4%',
            bottom: '5%',
            containLabel: true
        },
        legend,
        xAxis: [
            {
                type: 'category',
                data: data.x,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: data.color
                    }
                },
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    textStyle: {
                        fontSize: 10
                    },
                    color: '#fff',//y轴名字颜色
                },
            },
        ],
        yAxis: [
            {
                type: 'value',
                splitLine: {
                    show: data.showYLine || false,
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                axisTick: {
                    show: false
                },//不显示轴刻度
                axisLine: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        fontSize: 10
                    },
                    color: data.colorY || '#fff',//y轴名字颜色
                    interval: 0,//强制显示所有标签
                },
            },

        ],
        series: arr
    };
    let chart = echarts.init(document.getElementById(id));

    chart.setOption(option, true)
}

//特别样式圆环 一大一小颜色各异
function pie_chart3(id, data) {
    let { sex, color1, color2, color3, color4, radius1, radius2 } = data, color = [
        new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
            offset: 0,
            color: color1 || '#F78614'
        }, {
            offset: 1,
            color: color2 || '#FBC802'
        }]),
        new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
            offset: 0,
            color: color3 || '#348fe6'
        }, {
            offset: 1,
            color: color4 || '#625bef'
        }])
    ];
    let option = {
        color: color,
        legend: {
            orient: 'vertical',
            right: '15%',
            top: 'center',
            data: data.sex.map(v => v.name),
            textStyle: {
                color: '#fff',
            },
            icon: 'circle'
        },
        calculable: true,
        series: [
            {
                name: sex[0].name,
                type: 'pie',
                radius: radius1 || [32, 38],
                center: ['35%', '50%'],
                data: [{
                    value: sex[0].num,
                    name: '吴际帅\n牛亚莉',
                    label: {
                        show: false,
                    },
                    itemStyle: {
                        color: color[0]
                    },
                    labelLine: { show: false },
                },
                {
                    value: sex[1].num,
                    name: 'rose2',
                    itemStyle: {
                        color: "transparent"
                    },
                    labelLine: {
                        show: false

                    },
                }
                ]
            },
            {
                name: sex[1].name,
                type: 'pie',
                radius: radius2 || [28, 42],
                center: ['35%', '50%'],
                data: [{
                    value: sex[0].num,
                    name: '吴际帅\n牛亚莉',
                    label: {
                        show: false,
                    },
                    itemStyle: {
                        color: "transparent"
                    },
                    labelLine: {
                        show: false

                    },
                },
                {
                    value: sex[1].num,
                    name: '数量',
                    label: {
                        show: false,
                    },
                    itemStyle: {

                        color: color[1]
                    },

                    labelLine: {
                        show: false

                    },
                }
                ]
            }
        ]
    };
    if (data.className) {
        let myaaa = document.getElementsByClassName(id);
        for (var i = 0; i < myaaa.length; i++) {
            var myChart = echarts.init(myaaa[i]);
            myChart.setOption(option, true);
        }
        return;
    }

    let chart = echarts.init(document.getElementById(id))

    chart.setOption(option, true)
}

function bar_chart2(id, data) {
    let arr = [], legend = null;
    let obj = {
        name: data.name,
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
            normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(144,180,96,1)'
                },
                {
                    offset: 1,
                    color: 'rgba(229,249,203,0)'
                }
                ]),
            }
        },
        data: data.y
    };
    arr.push(obj);
    if (data.legend) {
        legend = {
            right: 20,
            icon: 'roundRect',
            textStyle: {
                color: '#FFFFFF',
            },
            data: data.legend
        }
    }
    let option = {
        color: ['#3398DB'],
        tooltip: {
            trigger: 'axis',
        },
        grid: {
            top: '15%',
            left: '3%',
            right: '4%',
            bottom: '5%',
            containLabel: true
        },
        legend,
        xAxis: [
            {
                type: 'category',
                data: data.x,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: data.color
                    }
                },
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    textStyle: {
                        fontSize: 10
                    },
                    color: '#fff',//y轴名字颜色
                    rotate: 30
                },
            }
        ],
        yAxis: [
            {
                type: 'value',
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                axisTick: {
                    show: false
                },//不显示轴刻度
                axisLine: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        fontSize: 10
                    },
                    color: '#fff',//y轴名字颜色
                    // interval: 0,//强制显示所有标签
                },
            }
        ],
        series: arr
    };

    let chart = echarts.init(document.getElementById(id));

    chart.setOption(option)
}

function init_swiper() {
    new Swiper('.l .middle', {
        cssMode: true,
        pagination: {
            el: '.swiper-middle',
            clickable: true,
        },
        mousewheel: true,
        keyboard: true,
        autoplay: {
            delay: 15000
        }
    });
    new Swiper('.bar2', {
        cssMode: true,
        pagination: {
            el: '.swiper-bt2',
            clickable: true,
        },
        mousewheel: true,
        keyboard: true,
        autoplay: {
            delay: 15000
        }
    });
    // new Swiper('.map', {
    //     cssMode: true,
    //     pagination: {
    //         el: '.swiper-map',
    //         clickable: true,
    //     },
    //     mousewheel: true,
    //     keyboard: true,
    //     autoplay: {
    //         delay: 15000
    //     }
    // });
    new Swiper('.r .middle', {
        cssMode: true,
        pagination: {
            el: '.swiper-middle',
            clickable: true,
        },
        mousewheel: true,
        keyboard: true,
        autoplay: {
            delay: 15000
        }
    });
    new Swiper('.people', {
        cssMode: true,
        pagination: {
            el: '.swiper-middle',
            clickable: true,
        },
        mousewheel: true,
        keyboard: true,
        autoplay: {
            delay: 15000
        }
    });
    new Swiper('.l .bottom', {
        cssMode: true,
        pagination: {
            el: '.swiper-bottom',
            clickable: true,
        },
        mousewheel: true,
        keyboard: true,
        autoplay: {
            delay: 15000
        }
    });
    new Swiper('.r .bottom', {
        cssMode: true,
        pagination: {
            el: '.swiper-bottom',
            clickable: true,
        },
        mousewheel: true,
        keyboard: true,
        autoplay: {
            delay: 15000
        }
    });
}
// 监听tab切换事件
function tabChange(name) {
    let dom = document.querySelectorAll(name);
    let chinaMap = document.getElementById("china-map")
    let villageMap = document.getElementById("village-map")
    for (let i = 0; i < dom.length; i++) {
        dom[i].onmouseover = function () {
            if (name == '.top-left-item') {//实时切入来源、域内人群改变事件
                if (i == 0) {//实时切入来源
                    dom[0].className = 'active';
                    dom[1].className = 'top-left-item';
                    chinaMap.classList.remove('hidden-map')
                    villageMap.classList.add('hidden-map')
                    isShowImmigration = true;
                    tomoveIn();
                } else if (i == 1) {//域内人群流动
                    dom[1].className = 'active';
                    dom[0].className = 'top-left-item';
                    chinaMap.classList.add('hidden-map')
                    villageMap.classList.remove('hidden-map')
                    isShowImmigration = false
                    inDomainCrowdFlow()
                }
            }else if(name == '.bottom-left-bottom-item'){//人口流入，人口流出
                if (i == 0) {//人口流入
                    dom[0].className = 'active';
                    dom[1].className = 'bottom-left-bottom-item';
                    isIn = true
                } else if (i == 1) {//人口流出
                    dom[1].className = 'active';
                    dom[0].className = 'bottom-left-bottom-item';
                    isIn = false
                }
                if(!isShowImmigration) inDomainCrowdFlow()
            }
        }
    }

}
//监听select选择事件
function selectChange(name,villageList = []) {
    let dom = document.querySelectorAll(name);
    let chinaMap = document.getElementById("china-map")
    let villageMap = document.getElementById("village-map")
    for (let i = 0; i < dom.length; i++) {
        if(i == 0) {//县
            // townAndVillage();//获取乡、镇列表
        }else {//镇、村
            dom[i].onchange = function () {
                console.log('监听改变',i,villageList);
               if(i == 1) {//监听镇改变事件
                    let villageListHtml = ''
                    townAndVillageData.forEach(item => {
                        if(item.townId == dom[i].value) {
                            villageList = item.villageList
                            villageList.forEach(i => {
                                villageListHtml += `<option value ="${i.villageId}">${i.villageName}</option>`
                            })
                            $("#village").html(villageListHtml)
                            globalVillageId = villageList[0].villageId//村id
                            globalVillageName = villageList[0].villageName//村名
                            console.log('镇改变',globalVillageId,globalVillageName,isShowImmigration);
                            if(isShowImmigration) {
                                chinaMap.classList.remove('hidden-map')
                                villageMap.classList.add('hidden-map')
                                tomoveIn()
                            }else{
                                chinaMap.classList.add('hidden-map')
                                villageMap.classList.remove('hidden-map')
                                inDomainCrowdFlow()
                                globalTownId = dom[i].value 
                                globalIsShowVillage = true
                                globalName = item.townName
                            }
                        }
                    })
                }else if(i == 2) {//监听村改变事件
                    villageList.forEach(item => {
                        if(item.villageId ==  dom[i].value) {
                            globalVillageId = item.villageId//村id
                            globalVillageName = item.villageName//村名
                            console.log('村改变',isShowImmigration,dom[i].value,globalVillageId,globalVillageName);
                            if(isShowImmigration) {
                                chinaMap.classList.remove('hidden-map')
                                villageMap.classList.add('hidden-map')
                                tomoveIn()
                            }else {
                                chinaMap.classList.add('hidden-map')
                                villageMap.classList.remove('hidden-map')
                                inDomainCrowdFlow()
                                globalVillageId = item.villageId,
                                globalTownId =  null, 
                                globalIsShowVillage = true, 
                                globalName = item.villageName
                            }
                        }
                    })
                   
                }
            }
        }
    }
}

//地图配置项
function map_option(id, data) {
    console.log('我要画图了',id,data);
    var option = {
        visualMap: {
            min: data.min,
            max: data.max,
            calculable: true,
            show: true,
            color: ['#f44336', '#fc9700', '#ffde00', '#ffde00', '#00eaff'],
            textStyle: {
                color: '#fff',
                fontSize: 12
            },
            itemWidth: '20',
            itemHeight: '100',
            bottom: 30,
            right: 50,
        },
        tooltip: {
            formatter: function (params) {
                let html =  `${params.data.fromName} -> ${params.data.toName}：${params.data.num}`;
                return html;
            }
        },
        yAxis: {
            type: 'value',
            scale: true,
            position: 'top',
            splitNumber: 1,
            boundaryGap: false,
            splitLine: {
                show: false
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                margin: 2,
                show: false,
                textStyle: {
                    color: '#aaa'
                }
            }
        },
        xAxis: {
            type: 'category',
            nameGap: 3,
            axisLine: {
                show: false,
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisTick: {
                show: false,
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisLabel: {
                interval: 0,
                fontSize: 12,
                textStyle: {
                    color: '#999',
                }
            },
        },
        geo: {
            map: data.map,
            zoom: 1.2,
            label: {
                emphasis: {
                    show: false,
                    color: '#fff',
                },
                formatter: function (params) {
                    return params.name;    //地图上展示文字 + 数值
                },
            },
            roam: true, //可放大缩小，禁止掉。
            itemStyle: {
                normal: {
                    color: 'rgba(51, 69, 89, .5)', //地图背景色
                    borderColor: '#516a89', //省市边界线00fcff 516a89
                    borderWidth: 1
                },
                emphasis: {
                    color: 'rgba(37, 43, 61, .5)' //悬浮背景
                }
            }
        },
        series: [
            {
                // 迁移线特效图
                type: 'lines',                    // 用于分层，z-index的效果
                // smooth:true,
                coordinateSystem: "geo",
                zlevel: 1,
                effect: {
                    show: true,  // 动效是否显示
                    period: 4, //箭头指向速度，值越小速度越快
                    trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
                    symbol: 'arrow', //箭头图标
                    symbolSize: 5, //图标大小
                },
                itemStyle: {
                    normal: {
                        borderWidth: 1,
                        lineStyle: {
                            type: 'solid',
                            shadowBlur: 5
                        },
                    }
                },
                lineStyle: {
                    normal: {
                        color: '#4ab2e5',
                        width: 1, //尾迹线条宽度
                        opacity: 1, //尾迹线条透明度
                        curveness: .3 //尾迹线条曲直度
                    }
                },
                data: data.y  // 特效的起始、终点位置
            },
            {
                name: "迁移人数",
                type: "effectScatter",
                coordinateSystem: "geo",
                data: data.x,
                //标记大小，地图上的圆点
                symbolSize: 2,
                showEffectOn: "render",
                rippleEffect: {
                    brushType: "stroke"
                },
                hoverAnimation: true,
                label: {
                    //地图黄点显示内容
                    normal: {
                        formatter:function (params) {
                            return params.name+"\n"+ params.data.num;    //地图上展示文字 + 数值
                        },
                        position: "right",
                        color: "#f4e925",
                        show: true
                    }
                },
                itemStyle: {
                    normal: {
                        color: "#f4e925",
                        shadowBlur: 10,
                        shadowColor: "#333"
                    }
                },
                zlevel: 2
            }
        ]
    };
    let chart = echarts.init(document.getElementById(id))
    chart.setOption(option, true)
}
function townAndVillage() {
    let count = 1;
    count ++;
    $.ajax({
        url: BASEURL+'/townAndVillage',
        type: 'get',
        headers: { 'Access-Control-Allow-Origin': '*' },
        crossDomain: true,
        success: function (data) {
            townAndVillageData = data
            // data.unshift({townId: 0, townName: "全部", villageList: [{villageId: 0, villageName: "全部"}]})
            let optionHtml = '';
            let villageOption = '';
            data.forEach((item,index) => {  
                optionHtml += `<option value ="${item.townId}">${item.townName}</option>`
                if(!index){
                    item.villageList.forEach(i => {
                        villageOption += `<option value ="${i.villageId}">${i.villageName}</option>`
                    })
                }
            })
            $("#village").html(villageOption)
            $("#town").html(optionHtml)
            globalVillageId = data[0].villageList[0].villageId//村id
            globalVillageName = data[0].villageList[0].villageName//村名
            document.getElementById("town").childNodes[0].selected = true
            document.getElementById("village").childNodes[0].selected = true
            document.getElementById("town").value=data[0].townId;
            document.getElementById("village").value=globalVillageId;
            tomoveIn();
            inDomainCrowdFlow()
            selectChange('.bottom-left-top-item',data[0].villageList)
        }
    })
}
//迁入来源
function tomoveIn() {
    $.ajax({
        url: BASEURL+'/tomoveIn',
        type: 'get',
        headers: { 'Access-Control-Allow-Origin': '*' },
        crossDomain: true,
        data: {
            villageId:globalVillageId,
        },
        success: function (data) {
            let x = [], y = [],max = [];
            data.forEach(v=>{
                let {NAME,NUM}=v;
                let coord=chinaGeoCoordMap[NAME];
                if(coord){
                    x.push({ name: NAME, value: coord,num: NUM,});
                    y.push([
                        {
                            name: NAME,
                            coord,
                            num: NUM,
                        },
                        {
                            name: globalVillageName,
                            coord: [119.977401,30.54251],
                            num: NUM,
                        },
                    ])
                    max.push(NUM)
                }
            })
            map_option('china-map', { map:'china',max: max.length ? Math.max(...max) : 0, min: 0, x, y })
        }
    })
}
// 域内人群流动 
function inDomainCrowdFlow() {
    $.ajax({
        url: BASEURL+'/inDomainCrowdFlow',
        type: 'get',
        headers: { 'Access-Control-Allow-Origin': '*' },
        data: {
            villageId:globalVillageId
        },
        crossDomain: true,
        success: function (data) {
            var x = [], y = [], max=[];
            let villageCoor= villages[globalVillageName];
            if(isIn) {
                //人群流入
                if(data.in) {
                    data.in.forEach(i => {
                        if(!i.inNum) return;
                        x.push({ name: i.NAME, value: villages[i.NAME],num: i.inNum, });
                        y.push([
                            {
                                name: i.NAME,
                                value: i.inNum,
                                coord: villages[i.NAME],
                                num: i.inNum,
                            },
                            {
                                name: globalVillageName,
                                coord: villageCoor,
                                num: i.inNum,
                            }
                        ])
                        max.push(i.inNum)
                    });
                }
            }else {
                //人群流出
                if(data.out) {
                    data.out.forEach(i => {
                        if(!i.outNum) return;
                        x.push({ name: i.NAME, value: villages[i.NAME],num: i.outNum,});
                        y.push([
                            {
                                name: globalVillageName,
                                coord: villageCoor,
                                num: i.outNum,
                            },
                            {
                                name: i.NAME,
                                value: i.inNum,
                                coord: villages[i.NAME],
                                num: i.outNum,
                            },
                        ])
                        max.push(i.outNum)
                    });
                }
            } 
            map_option('village-map', { map:'test',max: max.length ? Math.max(...max) : 0, min: 0, x, y })
        }
    })
}

window.onload = function () {
    townAndVillage();//获取街道、村数据。
    tabChange('.top-left-item')
    tabChange('.bottom-left-bottom-item')
    get_num();
    init_swiper();
}