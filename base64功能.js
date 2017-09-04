// 输入空间，可编辑，即常规字符的控件
function get_view_origin_text(txt_handle, origin_txt, txt_tgt_id) {
  return {
    type: "input",
    props: {
      id: "origin_text",
      text: origin_txt,
      type: $kbType.default,
      font: $font("normal", 16),
      align: $align.left,
      clearButtonMode: 1,
    },
    layout: function (make) {
      make.top.leading.trailing.inset(10);
      make.height.equalTo(36)
    },
    events: {
      changed: function (sender) {
        txt_handle()
      },
      ready: function (sender) {
        sender.focus()
      },
      returned: function (sender) {
        txt_handle();
        $clipboard.text = $(txt_tgt_id).text;
        $device.taptic();
        $app.close()
      }
    }
  }
}

// 文本控件，不可编辑，即base64字符串的控件
function get_view_b64_text(b64_txt) {
  return {
    type: "label",
    props: {
      id: "b64_text",
      text: b64_txt,
      font: $font("normal", 16),
    },
    layout: function (make) {
      var origin_text = $("origin_text");
      make.left.equalTo(origin_text.left);
      make.top.equalTo(origin_text.bottom).offset(5);
      make.size.equalTo(origin_text)
    }
  }
}

// 主界面
function get_view_main(txt_handle, txt_src, txt_tgt, txt_tgt_id) {
  return {
    props: { title: "Base64 encode/decode" },
    views: [
      get_view_origin_text(txt_handle, txt_src, txt_tgt_id),
      get_view_b64_text(txt_tgt),
    ]
  }
}

// 选择编码或者解码的菜单
menu_encode_or_decode = {
  items: ["编码", "解码"],
  handler: function (title, idx) {
    if (idx == 0) {
      txt_src = $clipboard.text
      txt_tgt = $text.base64Encode($clipboard.text)
      txt_tgt_id = "b64_text"
      txt_handle = function () {
        var result = $text.base64Encode($("origin_text").text)
        $(txt_tgt_id).text = result
      }
    } else {
      txt_src = $text.base64Decode($clipboard.text)
      txt_tgt = $clipboard.text
      txt_tgt_id = "origin_text"
      txt_handle = function () {
        var result = $text.base64Decode($("b64_text").text)
        $(txt_tgt_id).text = result
      }
    }
    $ui.render(get_view_main(txt_handle, txt_src, txt_tgt, txt_tgt_id))
  }
}

$ui.menu(menu_encode_or_decode)