// 货币列表
const CURRENCY_LIST = {
  // "code": ["currency name", "symbol"]
  "CNY": ["人民币", "¥"],
  "USD": ["美元", "$"],
  "HKD": ["港元", "$"],
  "GBP": ["英镑", "£"],
  "JPY": ["日元", "¥"],
  "KRW": ["韩元", "₩"],
}
// 子views跟主view的间隔
const FRAME_WIDTH = 10
// 文字的尺寸
const FONT_SIZE = 20
// 货币名跟货币数字之间的间隔
const WIDTH_BETWEEN_TITLE_AND_BOX = 20
// 每一行的行高
const LINE_HEIGHT = 30

// config of view
var max_title_length = 0
for (var key in CURRENCY_LIST ) {
  len = CURRENCY_LIST[key][0].length
  if(max_title_length < len) {
    max_title_length = len
  }
}
var symbol_header = max_title_length * FONT_SIZE + WIDTH_BETWEEN_TITLE_AND_BOX
var currency_rates_list = {}

// 构建货币名称view的函数
function build_currency_title_view(code, coor) {
  result = {
    type: "label",
    props: {
      id: `${code}_title`,
      text: CURRENCY_LIST[code][0],
      font: $font("bold", FONT_SIZE)
    },
    layout: function(make) {
      make.left.inset(FRAME_WIDTH)
      make.top.inset(coor)
    }
  }
  return result
}

// 构建货币符号view的函数
function build_currency_symbol_view(code, coor) {
  result = {
    type: "label",
    props: {
      id: `${code}_symbol`,
      text: CURRENCY_LIST[code][1],
      font: $font("normal", FONT_SIZE)
    },
    layout: function(make) {
      make.left.inset(symbol_header+10)
      make.top.inset(coor)
    }
  }
  return result
}

// 构建货币输入view的函数
function build_currency_box_view(code, coor) {
  result = {
    type: "input",
    props: {
      type: $kbType.decimal,
      id: code,
      font: $font("normal", FONT_SIZE),
      align: $align.left,
      clearsOnBeginEditing: true,
    },
    layout: function(make) {
      //make.width.equalTo(130)
      make.left.equalTo(symbol_header+FONT_SIZE)
      make.right.inset(FRAME_WIDTH)
      make.top.inset(coor)
    },
    events: {
      changed: function(sender) {
        calc(code, sender.text)
      }
    }
  }
  return result
}

// 计算汇率并填充到其他货币输入view的函数
function calc(code, number) {
  var all_code = Object.keys(CURRENCY_LIST)
  _filter = function(subcode) { return subcode != code }
  other_code = all_code.filter(_filter)
  pre_get_rates = function (subcode, idx, data)  {
    $(subcode).text = ""
  }
  if (currency_rates_list[code] == null) {
    other_code.map(pre_get_rates)
    get_currency_rates(code, number)
  }
  _mapper = function(subcode, idx, data) {
    $(subcode).text = (number * currency_rates_list[code][subcode]).toFixed(2)
  }
  other_code.map(_mapper)
}

// 获取汇率的函数
function get_currency_rates(code, number) {
  $ui.loading(true)
  $http.get({
    url: `http://api.fixer.io/latest?base=${code}`,
    handler: function(resp) {
      $ui.loading(false)
      currency_rates_list[code] = resp.data.rates
      // 当成功获取到汇率时，计算一次。
      calc(code, number)
    }
  })
}

// 构建全部子view的函数
function get_subviews() {
  header_coor = FRAME_WIDTH
  var result = []
  _mapper = function(code, idx, data) {
    result.push(build_currency_box_view(code, header_coor + LINE_HEIGHT * idx))
    result.push(build_currency_symbol_view(code, header_coor + LINE_HEIGHT * idx))
    result.push(build_currency_title_view(code, header_coor + LINE_HEIGHT * idx))
  }
  Object.keys(CURRENCY_LIST).map(_mapper)
  return result
}

// app初始化的函数
function initialize(code) {
  $(code).text = 1
  calc(code, 1)
}

// 渲染
$ui.render({
  props: {
    title: "货币汇率"
  },
  views: get_subviews()
})


initialize("CNY")