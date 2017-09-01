// 输入空间，可编辑，即常规字符的控件
function get_view_origin_text(text_handle, text_result) {
  return {
    type: "input",
    props: {
      id: "origin_text",
      type: $kbType.default,
      text: $clipboard.text,
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
        text_handle(sender.text)
      },
      ready: function (sender) {
        sender.focus()
      },
      returned: function (sender) {
        text_handle(sender.text);
        $clipboard.text = $(text_result).text;
        $device.taptic();
        $app.close()
      }
    }
  }
}

// 文本控件，不可编辑，即base64字符串的控件
function get_view_b64_text(text_handle, text_result) {
  return {
    type: "label",
    props: {
      id: "b64_text",
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
function get_view_main(text_handle, text_result) {
  return {
    props: { title: "Base64 encode/decode" },
    views: [
      get_view_origin_text(text_handle, text_result),
      get_view_b64_text(text_handle, text_result),
    ]
  }
}

// 选择编码或者解码的菜单
menu_encode_or_decode = {
  items: ["编码", "解码"],
  handler: function (title, idx) {
    if (idx == 0) {
      b64_worker = $text.base64Encode
      text_result = "b64_text"
    } else {
      b64_worker = $text.base64Decode
      text_result = "origin_text"
    }
    text_handle = function (text) {
      var result = b64_worker(text)
      $(text_result).text = result
    }
    $ui.render(get_view_main(text_handle, text_result))
  }
}

$ui.menu(menu_encode_or_decode)