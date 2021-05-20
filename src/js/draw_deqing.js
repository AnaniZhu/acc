var countries = [];
function draw_deqing(id, data) {
    //境内人口来源地，迁徙图
    var option = {
        tooltip: {
            formatter: function (params) {
                let html =  `${params.data.name} ->：${params.data.people}`;
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
            // data: ['浙江']  //新疆，横坐标似乎不能动态改变
        },
        // leaflet: {
        //     center: [119.967662, 30.534927],
        //     zoom: 4,
        //     roam: true,
        //     layerControl: {
        //         position: 'center'
        //     },
        //     // tiles: [{
        //     //     label: '天地图',
        //     //     urlTemplate: 'https://ditu.zjzwfw.gov.cn:443/mapserver/vmap/zjvmap/getMAP?styleId=tdt_kejiganyangshi_2017&token=3c0dcdf7-3c26-4d67-a4dd-be98e3ce5a7d&x={x}&y={y}&l={z}',
        //     //     options: {
        //     //         attribution: 'tianditu.com'
        //     //     }
        //     // }, {
        //     //     label: 'Open Street Map',
        //     //     urlTemplate: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        //     //     options: {
        //     //         attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
        //     //     }
        //     // }]
        // },
        geo: {
            map: "德清县",
            zoom: 1.2,
            roam: false,
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
                    trailLength: 0.4, //特效尾迹长度[0,1]值越大，尾迹越长重
                    symbol: 'arrow', //箭头图标
                    symbolSize: 7, //图标大小
                },
                itemStyle: {
                    normal: {
                        color:'#1DE9B6',
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
                symbolSize: 5,
                showEffectOn: "render",
                rippleEffect: {
                    period: 15,
                    scale: 4,
                    brushType: 'fill'
                },
                hoverAnimation: true,
                label: {
                    //地图黄点显示内容
                    normal: {
                        formatter: function (params) {
                            return params.name + "\n" + params.data.people;    //地图上展示文字 + 数值
                        },
                        position: "right",
                        show: true
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#1DE9B6',
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
//点击坐标点打开一个窗口
function addClickHandler(content, marker, map) {
    marker.addEventListener("mouseover", function (e) {
        openInfo(content, e, map)
    }
    );
}
//开启信息窗口
function openInfo(content, e, map) {
    var point = e.lnglat;
    // marker = new T.Marker(point);// 创建标注
    var markerInfoWin = new T.InfoWindow(content, { offset: new T.Point(0, -30) }); // 创建信息窗口对象
    map.openInfoWindow(markerInfoWin, point); //开启信息窗口
}

function init(sel, transform) {
    var upd = sel.selectAll('path.geojson').data(countries);
    upd.enter()
        .append('path')
        .attr("class", "geojson")
        .attr('stroke', 'black')
        .attr('fill', function (d, i) {
            return d3.hsl(Math.random() * 360, 0.9, 0.5)
        })
        .attr('fill-opacity', '0.1')
}

function redraw(sel, transform) {
    sel.selectAll('path.geojson').each(
        function (d, i) {
            d3.select(this).attr('d', transform.pathFromGeojson)
        }
    )
}