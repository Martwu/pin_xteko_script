// 获取每个搜索结果的正则
const regex_search = /<h2><a target="_blank" href="(http:\/\/www\.dysfz\.cc\/movie.*\.html)">(.*)<\/a><\/h2>/g
// 获取下一页地址的正则
const regex_next_page = /<a class="next" href="(http:\/\/www\.dysfz\.cc\/key\/.*)">下一页<\/a>/g

// 资源 百度云 match [1] title, match[2] url， match[3] 密码
const regex_baiduyun = /<p>(.*?)<a href="(http:\/\/pan.baidu.com\/.*?)" target="_blank">百度云盘<\/a> 密码：([A-Za-z0-9]{4})\s*?.*?<\/p>/g
// 资源 磁力或者电驴 match[1] url, match[2] title
const regex_magnet_or_ed2k = /<p><a href="(magnet:\?xt=urn:btih:.*?|ed2k:\/\/.*?)" target="_blank">(.*?)<\/a><\/p>/g

const search_key = $text.URLEncode("同盟")
const url_main = `http://www.dysfz.cc/key/${search_key}/`

var search_result_title = []
var search_result_url = []

// 计数，当没有“下一页”后，才构建menu
var dealing_page = 1

function get_search_result(url) {
    $http.get({
        url: url,
        handler: function (resp) {
            var html = resp.data
            var tmp = {}
            var match = regex_search.exec(html)
            while (match != null) {
                search_result_title.push(match[2].replace(/<em>(.*)<\/em>/g, "$1"))
                search_result_url.push(match[1])
                match = regex_search.exec(html)
            }
            match = regex_next_page.exec(html)
            while (match != null) {
                // 接着解析下一页
                get_search_result(match[1])
                match = regex_next_page.exec(html)
                // 每当多一个“下一页”，计数+1
                dealing_page = dealing_page + 1
            }
            // 解析完成一页，计数-1
            dealing_page = dealing_page - 1
            if (dealing_page == 0) {
                if (search_result_title.length == 0) {
                    $ui.toast("搜索结果为空。")
                } else {
                    make_result_menu()
                }
            }
        }
    })
}

function get_result(url) {
    $http.get(
        {
            url: url,
            handler: function (resp) {
                var html = resp.data
                // b 百度云资源 t 磁力或者电驴
                var res_content = []
                var res_title = []

                var match = regex_baiduyun.exec(html)
                while (match != null) {
                    res_title.push('b: ' + match[1].replace(/.*<\/p>.*<p>/g, "").replace(/：/g, ""))
                    res_content.push({ u: match[2], p: match[3] })
                    match = regex_baiduyun.exec(html)
                }
                match = regex_magnet_or_ed2k.exec(html)
                while (match != null) {
                    res_title.push('t: ' + match[2])
                    res_content.push({ u: match[1] })
                    match = regex_magnet_or_ed2k.exec(html)
                }
                make_resource_menu(res_title, res_content)
            }
        }
    )
}

// 用解析结果生成搜索结果菜单。
function make_result_menu() {
    menu_content = {
        items: search_result_title,
        handler: function (title, idx) {
            get_result(search_result_url[idx])
        }
    }
    $ui.menu(menu_content)
}

function make_resource_menu(titles, contents) {
    menu_content = {
        items: titles,
        handler: function (title, idx) {
            if (title.indexOf("b: " == 0)) {
                $clipboard.text = contents[idx]["p"]
                $ui.toast("分享密码已拷贝至粘贴板")
                $safari.open({ url: contents[idx]["u"] })
            }
            if (title.indexOf("t: ") == 0) {
                $clipboard.text = contents[idx]["u"]
                $ui.toast("下载链接已拷贝至粘贴板")
            }
        }
    }
    $ui.menu(menu_content)
}

get_search_result(url_main)
//get_result("http://www.dysfz.cc/movie20527.html")