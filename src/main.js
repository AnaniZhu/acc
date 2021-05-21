import './lib'

import './js'
import './css'

import './js/draw_deqing.js'

// echarts.registerMap('china', reg_china)
reg_chaina(echarts);
// echarts.registerMap('德清县', reg_deqing)
echarts.registerMap('test', test)


// 热更新
if (module.hot) {
  module.hot.accept();
}