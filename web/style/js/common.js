let DEFAULT_PARSLEY_CONFIG = {
    errorClass: 'is-invalid',
    successClass: 'is-valid',
    errorsWrapper: '<div class="invalid-tooltip">',
    errorTemplate: '<span></span>',
    trigger: 'change'
}
let cdn = 'https://sm.zzwangjie.com/resources/dy/';
const TIME_EXPIRED = "TIME_EXPIRED";
const GOT_EXPIRED = "GOT_EXPIRED";

class Cached {

    getValueAndThen({key, get, expired_type = TIME_EXPIRED, expired_value = 60} = {}) {
        let value = this.getAndCheck(key);
        if (value) {
            return Promise.resolve(value);
        } else {
            if (get) {
                return Promise.resolve(get()).then((d) => {
                    if (d.code == 0) {
                        let node = new CachedNode(key, d, expired_type, expired_value);
                        _setStorageData(key, node)
                    }
                    return d;
                })
            }
        }
    }

    getValue({key, expired_type = TIME_EXPIRED, expired_value = 60} = {}) {
        let value = this.getAndCheck(key);
        if (value) {
            return value;
        }
        return null;
    }

    getAndCheck(key) {
        try {
            let node = _getStorageData(key);
            if (node) {
                node = CachedNode.create(node);
                if (node.isExpired()) {
                    return node.value;
                } else {
                    _removeStorageData(key);
                    return null;
                }
            } else {
                return null;
            }
        } catch (e) {
            return null;
        }

    }
}

class CachedNode {
    constructor(key, value, expired_type, expired_value) {
        this.key = key;
        this.value = value;
        this.expired_type = expired_type;
        this.expired_value = expired_value;
        this.gotTimes = 1;
        this.expired_time = this.currentTime() + this.expired_value * 1000;
    }

    static create({key, value, expired_type, expired_value, gotTimes, expired_time}) {
        let node = new CachedNode();
        node.key = key;
        node.value = value;
        node.expired_type = expired_type;
        node.expired_value = expired_value;
        node.gotTimes = gotTimes;
        node.expired_time = expired_time;
        return node;
    }


    isExpired() {
        this.touch();
        if (this.expired_type == TIME_EXPIRED && this.currentTime() <= this.expired_time) {
            return true;
        } else if (this.expired_type == GOT_EXPIRED && this.gotTimes <= this.expired_value) {
            return true;
        } else {
            return false;
        }
    }

    touch() {
        this.gotTimes++;
    }

    currentTime() {
        return (new Date()).getTime();
    }
}

let cached = new Cached();

/**
 * 弹框封装类 callback使用
 * Alerts.info("test").then(result=>{})
 *
 */


function info(msg = "", title = "系统提示") {
    return Swal.fire({
        title: title,
        html: msg,
        confirmButtonText: '确认'
    })
}

function success(msg = "", title = "系统提示") {
    return Swal.fire({
        icon: "success",
        title: title,
        html: msg,
        confirmButtonText: '确认'
    })
}
function confirm_success(msg="",title = "系统提示",callback) {
    return Swal.fire({
        icon: "success",
        title: title,
        html: msg,
        confirmButtonText: '确认',
        onClose: () => {
            if(callback){
                callback();
            }
        }
    });
}
function error(msg) {
    msg = JSON.stringify(msg);
    return Swal.fire({
        icon: "error",
        html: msg,
        confirmButtonText: '确认'
    })
}


function request(url, httpMethod, requestData, contentType) {
    if (!wap_is_user_notexist()) {
        let user = wap_get_user();
        requestData.token = user.token;
    }
    return $.ajax({
        url: url,
        type: httpMethod,
        contentType: contentType,
        dataType: 'json',
        data: requestData,
        success: (d) => {
            let code = d.code;
            if (code == 12001 || code == 12002 || code == 12003 || code == 12004) {
                wap_logout();
                window.location.href = "/";
            }
        },
        error: function (XMLHttpRequest, textStatus) {
            error('系统异常：错误代码(' + XMLHttpRequest.responseText + ")")
        }
    });
}

function get(url, requestData = {}, dimain = wap_site_host(), contentType = 'application/x-www-form-urlencoded') {
    return request(dimain + url, 'GET', requestData, contentType)
}

function post(url, requestData = {}, dimain = wap_site_host(), contentType = 'application/x-www-form-urlencoded') {
    return request(dimain + url, 'POST', requestData, contentType)
}

function toJsonObject(array) {
    let o, h, i, e;
    o = {};
    h = o.hasOwnProperty;
    for (i = 0; i < array.length; i++) {
        e = array[i];
        if (!h.call(o, e.name)) {
            o[e.name] = e.value;
        }
    }
    return o;
}


/**
 * 当前页
 * @param page
 * @returns {*}
 */
function getMessage(page) {

    return get(`/session/message/accountMessage/pageInbox?pageNo=${page}`)

}

/**
 * 设置邮件已读
 * @param id
 * @returns {*}
 */
function readMessage(id) {
    return post(`/session/message/accountMessage/read`, {messageId: id})
}

/**
 * 获取所有游戏平台
 * @returns {void}
 */
function getPlatforms() {
    return get('/rest/api/platforms').done(d => {
        if (d.code != 0) {
            error(d.message);
        }
    });

}

/**
 * 获取平台游戏
 * @param id   平台ID
 * @returns {void}
 */
function getGames(id) {
    return get(`/rest/api/games?isWeb=0&platformId=${id}`).done(d => {
        if (d.code != 0) {
            error(d.message);
        }
    });
}

/**
 * 获取当前登陆用户信息
 */
function getUserInfo() {
    return get('/session/member').done(d => {
        if (d.code != 0) {
            error(d.message);
        }
    })
}

function getUserBankCard() {
    return get('/session/bankcard/use').done(d => {
        if (d.code != 0) {
            error(d.message);
        }
    })
}
function getBalance(type) {
    return get(`/session/balance/${type}`).done(d => {
        if (d.code != 0) {
            error(d.message);
        }
    })
}

// 时间格式化
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, // month
        "d+": this.getDate(), // day
        "h+": this.getHours(), // hour
        "m+": this.getMinutes(), // minute
        "s+": this.getSeconds(), // second
        "q+": Math.floor((this.getMonth() + 3) / 3), // quarter
        "S": this.getMilliseconds()
        // millisecond
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "")
            .substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

function isVivo() {
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('vivo') != -1 || ua.indexOf('oppo') != -1;
}

function _getStorageData(key) {
    var s_data = null;
    s_data = isVivo() ? $.cookie(key) : sessionStorage.getItem(key);
    try {
        return s_data == undefined || s_data == null ? null : JSON.parse(s_data);
    } catch (e) {
        return s_data == undefined || s_data == null ? null : s_data;
    }

    // if(isVivo()){ return $.cookie(key); } return sessionStorage.getItem(key);
}

function _setStorageData(key, value) {
    value = JSON.stringify(value)
    if (isVivo()) {
        var _date = new Date();
        _date.setHours(_date.getHours() + 4);
        $.cookie(key, value, {expires: _date, path: '/'});
        return;
    }
    sessionStorage.setItem(key, value);
}

function _removeStorageData(key) {
    if (isVivo()) {
        $.cookie(key, null, {path: '/'});
        return;
    }
    sessionStorage.removeItem(key);
}

function wap_site_host() {
    var testStatus = _getStorageData("rstTestStatus") | 0;
    return getRandomDomain('rst', testStatus);
}

//{'loginName':loginName,'memberName':memberName,'token':tokenValue,'vipName':d.data.vip.vipName,'vipLevel':d.data.vip.vipLevel,
//		'domain':d.data.domain,'cashierDomain':d.data.cashierDomain,'userDomain':'','balance':0}
//domain 服务器地址,cashierDomain 存款地址
var domain_urls = ['https://wrss1072ex.5ct5mm555.com/', 'https://wrss1092.5ct5mm555.com/'];

var all_domains = [{
    "rst": ['https://wrss1072ex.5ct5mm555.com/', 'https://wrss1092.5ct5mm555.com/'],
    "cr": ['https://wcrr.5ct5mm555.com/']
}, {"rst" : ['https://smart.jskpaper.com'], "cr" : ['https://lnks.jskpaper.com']}];

function wap_get_user() {
    var loginUser = _getStorageData("$user");
    if (loginUser == 'null' || loginUser == null || loginUser == undefined) {
        //正式
        var defaultDomain = _getStorageData('_df_domain_1');
        if (defaultDomain == undefined || defaultDomain == '' || defaultDomain == null) {
            defaultDomain = domain_urls[Math.floor(Math.random() * domain_urls.length)];
            _setStorageData('_df_domain_1', defaultDomain);
        }
        //defaultDomain="http://t196.xdy20.com:8080/";
        //defaultDomain="http://127.0.0.1:8080/";
        return {
            'loginName': '',
            'memberName': '',
            'token': '',
            'vipName': '',
            'vipLevel': '',
            'domain': wap_site_host(),
            'cashierDomain': '',
            'userDomain': '',
            'balance': 0
        };
    }
    loginUser.domain = wap_site_host();
    loginUser.cashierDomain = getRandomDomain('cr');
    return loginUser;
}

function checkRst() {
    var testUrl = getRandomDomain('rst', 0);
    $.ajax({
        url: testUrl + "/member/wrong",
        type: "GET",
        data: {},
        success: function (d) {
            _setStorageData('rstTestStatus', 0);
        },
        error: function (e) {
            _setStorageData('rstTestStatus', 1);
        }
    });
}

function getRandomDomain(type, i) {
    var index = i | (_getStorageData("rstTestStatus") | 0);
    return all_domains[index][type][Math.floor(Math.random() * all_domains[index][type].length)];
}

function wap_set_user(user) {
    _setStorageData('$user', user);
}

function wap_logout() {
    _removeStorageData('$user');
}

function wap_is_user_notexist() {
    var userData = _getStorageData("$user");
    var isNotExist = userData == null || userData == 'null' || userData == undefined;
    return isNotExist;
}


function wap_go_login(msg) {
    msg = (msg == null || msg == undefined) ? '' : msg;
    _setStorageData('_notice_msg', msg);
    window.location.href = "/";
}

function wap_check_ajaxerror(jqXHR) {
    if (jqXHR != null && jqXHR != undefined && jqXHR.status == 401 && jqXHR.responseJSON != undefined && jqXHR.responseJSON != null) {
        wap_if_session_out(jqXHR.responseJSON.code);
    }
}

function wap_if_session_out(code) {
    if (code == 12001 || code == 12002 || code == 12003 || code == 12004) {
        wap_session_out();
    }
}

function wap_session_out() {
    wap_logout();
    wap_go_login('登录超时，请重新登录');
}

function fun_filterTxt(txt) {
    if (txt == '' || txt == null || txt == undefined) {
        return '';
    }
    txt = txt + '';
    return txt.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fun_timeFormat(_timeStamp) {
    if (_timeStamp == null || _timeStamp == undefined) {
        return '';
    }
    // 比如需要这样的格式 yyyy-MM-dd hh:mm:ss
    var date = new Date(_timeStamp);
    Y = date.getFullYear() + '-';
    M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return Y + M + D + h + m + s;
}

function event_site_host() {
    //return "http://t182.xdy20.com:8080";
    return "https://wett.5ct5mm555.com";
    //return "http://127.0.0.1:8888";
}

function cashier_host() {
    return "https://wcrr.5ct5mm555.com";
    //return "http://127.0.0.1:8088/";
}

function fun_openGame(gamecode, pid, pfCode) {
    if (wap_is_user_notexist()) {
        info('请登录后再操作');
        return;
    }
    if (pfCode == undefined) {
        pfCode = '-1';
    }
    window.open(event_site_host() + '/ptweb/playGame?gameCode=' + gamecode + '&pid=' + pid + '&pfCode=' + pfCode + '&token=' + wap_get_user().token, 'games', 'height=768, width=1024,toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no');
}


function openELottery(redirectUrl) {
    if (wap_is_user_notexist()) {
        info('请登录后再操作');
        return;
    }
    window.open(event_site_host() + redirectUrl + '&token=' + wap_get_user().token, '_blank');
}

function urlOpen(url) {
    if (wap_is_user_notexist()) {
        info('请登录后再操作');
        return;
    }
    window.location.href = window.location.origin + url;
}

function fun_getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}



function openLiveChat() {
    var win = window.open('https://pasjh.nhtu7pebj.com/chatserver/chatwindow.aspx?planId=5&siteId=100016502', 'newWindow',
        'height=723px, width=625px,menubar=no,directories=no,resizable=no,toolbar=no,'
        + 'titlebar=no,status=no,scrollbars=no');
    win.moveTo(350, 15);
    return false;
}

function addScriptTag(src, callback) {
    var position = src.lastIndexOf("/") + 1;
    var fileName = src.substring(position);
    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", src);
    script.setAttribute("id", fileName);
    script.setAttribute("callback", callback);
    script.onerror = function (ev) {
        eval(callback + "('')");
    }
    document.body.appendChild(script);
}

function loadHTMLPage(url, callback, beforeCalback) {
    $.ajax({
        url: url,
        type: "GET",
        dataType: 'json',
        success: function (d) {
            var url;
            if (beforeCalback != null) {
                var returnUrl = beforeCalback(d);
                url = (returnUrl == undefined) ? url : returnUrl;
            } else {
                url = d.data.url;
            }
            addScriptTag(url, callback);
        }
    });
}

function getQueryParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

/**
 * 按钮倒计时
 * @param button
 * @param sec
 */
function fun_buttonCutDown(button, sec) {
    var text = button.text();
    var fun = button.attr("onclick");
    button.text(`已发送(${sec}s)`);
    button.addClass('disable');
    button.removeAttr("onclick", "");
    var interval = setInterval(function () {
        sec--;
        if (sec <= 0) {
            button.text(text);
            button.removeClass('disable');
            button.attr("onclick", fun);
            clearInterval(interval);
        } else {
            button.text(`已发送(${sec}s)`);
        }
    }, 1000);
}

function buttonDisable(btn) {

    btn.attr("disabled", true);
    btn.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>\n' +
        '  Loading...')
}

function buttonEnable(btn, text) {
    btn.removeAttr('disabled');
    btn.html(text)
}

function loadIndexMatchs() {
    return get('/esports/lastest/match').done(d => {
        if (d.code != 0) {
            error(d.message);
        }
    });
}

function setLoginUserNewBalance(b) {
    var loginUser = _getStorageData("$user");
    loginUser['balance'] = b;
    wap_set_user(loginUser);
}
