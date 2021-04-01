let user = wap_get_user();
const Interval_TIME = 60 * 1000
initTime();
initLoginStatus();
checkRst();
$(function () {
    initNav();
    headerNavMenu();
    $('.customer-right .customer-right-logo .back-top').click(function () {
        $('html').scrollTop(0);
    });
    $('.customer-right .customer-center').hover(function () {
        $('.customer-right').css('right', '0');
    }, function () {
        $('.customer-right').css('right', '-170px');
    });
    initMessage();
    loadNotice();
    loadAgentCode();
    initForm();
    initDialog();
    headerDownload();
    $('#headerNotice').click(function () {
        $.ajax({
            dataType: "jsonp",
            url: wap_site_host() + '/notice/notice',
            success: function (resultData) {
                if (resultData.code == 0) {
                    var noticeData = resultData.data;
                    var appendHtml = '<div class="layui-tab" lay-filter="noticeTab">';
                    var tabHtml = '<ul class="layui-tab-title">',
                        contentHtml = '<div class="layui-tab-content notice-list-content">';
                    var firstTypeId = '';
                    $.each(noticeData.types, function (n, value) {
                        var li_className = '';
                        var div_className = '';
                        if (n == 0) {
                            li_className = 'layui-this';
                            div_className = 'layui-show';
                            firstTypeId = value.id;
                        }
                        tabHtml += '<li class="' + li_className + '" type-id="' + value.id + '">' + fun_filterTxt(value.typeName) + '</li>';
                        contentHtml += '<div class="layui-tab-item ' + div_className + '"></div>';
                    });
                    tabHtml += '</ul>';
                    contentHtml += '</div>';
                    layer.open({
                        type: 1,
                        title: false,
                        area: ['800px', '600px'],
                        closeBtn: 1,
                        shadeClose: true,
                        content: appendHtml + tabHtml + contentHtml + '</div>',
                        success: function () {
                            fun_showNotice("" + firstTypeId, 0);
                        }
                    });
                    layui.element.on('tab(noticeTab)', function (data) {
                        var typeId = $(this).attr('type-id');
                        fun_showNotice(typeId, data.index);
                    });

                }
            }
        });
    });
});

function initNav() {
    $('#navigationMenu').find('li').each((index, val) => {
        $(val).removeClass('active');
    })
    let url = window.location.pathname;
    url = url.substring(url.lastIndexOf("/") + 1, url.indexOf("\."));
    try {
        var headerNavSelect = $('#navigationMenu >li.header-' + url + '-nav');
        if (headerNavSelect.length > 0) {
            headerNavSelect.addClass('active');
        } else {
            $('#navigationMenu > li.header-index-nav').addClass('active');
        }
    } catch (e) {
        $('#navigationMenu > li.header-index-nav').addClass('active');
    }

}

function initTime() {
    document.getElementById('realTime').innerHTML = 'GTM+8 ' + new Date().toLocaleString() + ' 星期' + '日一二三四五六'.charAt(new Date().getDay());
    setInterval("realTime.innerHTML= 'GTM+8 ' + new Date().toLocaleString()+' 星期'+'日一二三四五六'.charAt(new Date().getDay());", 1000);

}

function initLoginStatus() {
    if (wap_is_user_notexist()) {
        $("#loginUI").show();
    } else {
        // let loginUser = wap_get_user();
        $("#loginInfo").show();
        $(".vip").html(`<span class="badge badge-warning">${user.vipName}</span>`)
        $("#userName").html(user.loginName);
        $(".amount").html(`￥${user.balance}`)
    }
}


function initDialog() {
    $('#findPassword').on('show.bs.modal', refreshCode)
    $('#find-by-tel-tab').on('show.bs.tab', refreshCode)
    $('#find-by-email-tab').on('show.bs.tab', refreshCode)
    $('#find-account-by-email-tab').on('show.bs.tab', refreshCode)
    $('#findPassword').on('hide.bs.modal', () => {
        $('.findPassword-form').each((i, e) => {
            e.reset();
            $(e).parsley().reset();
        })
        $('.findPassword-modal-body').show();
        $('#success').hide();
    });
    $('#registeredModal').on('show.bs.modal', () => {
        $('#registered').show();
        $('.registered-success').hide();
        $('form[id=registered]')[0].reset();
        $('form[id=registered]').parsley().reset();
        initAgentCode();
    });

}

function loadNotice() {
    cached.getValueAndThen({key: 'getNotice', get: () => get('/notice/init')}).then(d => {
        if (d.code == 0) {
            var html = '';
            $.each(d.data, function (n, value) {
                html += '<span onclick="showMsg(this)">' + value.content + '</span>';
            });
            $('.station-notice').html(html);
            noticePlay();
        }
    });
}

function noticePlay() {
    var obj = $(".station-notice-box span");
    var d = $('.station-notice').width();
    obj.clone().appendTo(obj.parent());
    obj.parent().parent().width(d);
    var t = d / 50;
    var tl = new TimelineLite();
    tl.from($('.station-notice-box'), 0.5, {y: -10, opacity: 0});
    tl.to(
        obj.parent(),
        t,
        {
            x: "-" + (d + 1),
            ease: Linear.easeNone,
            repeat: -1,
        }
    );
}

function showMsg(domSpan) {
    let text = $(domSpan).html();
    let name = text.slice(0, text.search(/[:|：]/) + 1)
    let content = text.slice(text.search(/[:|：]/) + 1, text.lastIndexOf('（'))
    let time = text.slice(text.lastIndexOf('（') + 1, text.lastIndexOf('）'));
    let html = `<div class="pop-notice">
                        <p class="name">${name}</p>
                        <p class="content">${content}</p>
                        <p class="time">${time}</p>
                    </div>`;
    info(html);
}

function loadAgentCode() {
    var tpageUrl = window.location.href;
    if (tpageUrl.length < 6)
        return;
    var acode = tpageUrl.substr(tpageUrl.length - 6);
    if (checkCode(acode)) {
        $.ajax({
            url: wap_site_host() + "/member/getAgentByCode",
            data: {"agentCode": acode},
            type: "POST",
            dataType: 'json',
            success: function (d) {
                if (d.code == 0) {
                    _setStorageData('$agentInfoCode', d.data);
                } else {
                    _removeStorageData('$agentInfoCode');
                }
            }
        });
    }
}

function initAgentCode() {
    var agentCode = _getStorageData("$agentInfoCode");
    if (agentCode) {
        $('#agentCode').val(agentCode);
        $('#agentCode').attr("readonly", true);
        $('.agent-code').css('opacity', '0')
    }
}

function checkCode(code) {
    var digits = new Array('f', 'x', 'a', 'b', 'c', 'd', 'e', 'g', 'h', 'i');
    var number = "";
    for (var i = 0; i < code.length; i++) {
        for (var j = 0; j < digits.length; j++) {
            if (code.charAt(i) == digits[j])
                number += j;
        }
    }
    if (number.length == 6)
        return true
    else
        return false;
}


function initForm() {
    $('#registered').parsley(DEFAULT_PARSLEY_CONFIG);
    $('#loginForm').parsley(DEFAULT_PARSLEY_CONFIG);
    $('#findByTelephone').parsley(DEFAULT_PARSLEY_CONFIG);
    $('#findByEmail').parsley(DEFAULT_PARSLEY_CONFIG);
    $('#findAccountByEmail').parsley(DEFAULT_PARSLEY_CONFIG);

    // Parsley.addAsyncValidator("checkAgentCode", function (xhr) {
    //     let d = xhr.responseJSON;
    //     return d.data;
    // }, wap_site_host() + "/member/checkAgentCode?value={value}");
    Parsley.addAsyncValidator("checkLoginName", function (xhr) {
        let d = xhr.responseJSON;
        return d.data.status == 0;
    }, wap_site_host() + "/member/checkLoginName?loginName={value}");
    Parsley.addAsyncValidator("checkMailbox", function (xhr) {
        let d = xhr.responseJSON;
        return d.data.status == 0;
    }, wap_site_host() + "/member/check-mailbox?mail={value}");
    Parsley.addAsyncValidator("checkTelephone", function (xhr) {
        let d = xhr.responseJSON;
        return d.data.status == 0;
    }, wap_site_host() + "/member/check-telephone?phone={value}");
    $('#loginForm').submit(login_submit);
    $('#registered').submit(register_submit);
    $('#findByTelephone').submit(findPassword_submit);
    $('#findByEmail').submit(findPassword_submit);
    $('#findAccountByEmail').submit(findPassword_submit);
}


function login_submit(event) {
    event.preventDefault();
    let formData = toJsonObject($(event.target).serializeArray());
    let loginUrl = document.location.href;
    $(event.target)[0].reset();
    $(event.target).parsley().reset();
    login(formData['loginName'], formData['password'], loginUrl).done(d => {
        if (d.code == 0) {
            window.location.href = "/";
        } else {
            error(d.message);
        }
    });
}


function register_submit(event) {
    event.preventDefault();
    let formData = toJsonObject($(event.target).serializeArray());
    formData['url'] = document.location.href;
    formData['regCarrier'] = checkPlaform();
    formData['regFrom'] = getRegFrom();
    register(formData);
}

function findPassword_submit(event) {
    event.preventDefault();
    let url = $(event.target).attr("action")
    let formData = toJsonObject($(event.target).serializeArray());
    let btn = $(event.target).find("button").last();
    let text = btn.text();
    buttonDisable(btn);
    get(url, formData).done(d => {
        if (d.code == 0) {
            $('.findPassword-modal-body').hide();
            if(text=='修改密码'){
                $('#success2').show();
            }else{
                $('#success').show();
            }
        } else {
            error(d.message)
        }
    }).always(() => {
        buttonEnable(btn, text);
    });
}


function refreshCode() {
    get('/member/verificationCode').then(d => {
        if (d.code == 0) {
            $('[id=verificationCodeImg]').attr('src', d.data.img);
            $('#randomCodeId').val(d.data.id);
        } else {
            error(d.message);
        }
    })
}

function getUpdatePasswordCodeByPhone(){
    var loginName=$('#phoneLoginName').val().trim();
    var phone=$('#getCodePhone').val().trim();
    if(loginName.length==0){
        error('请输入有效玩家账号');
        return;
    }
    if(phone.length==0){
        error('请输入预留手机号');
        return;
    }
    get('/member/getForgetPasswordCode',{'loginName':loginName, 'phone':phone,}).then(d=>{
        if(d.code==0){
            $('#phoneCodeId').val(d.data.codeId)
            info("已经发送验证短信,请查看手机短信!")
        }else{
            error(d.message);
        }
    });
}

function getUpdatePasswordCodeByEmail(){
    var loginName=$('#emailLoginName').val().trim();
    var email=$('#getCodeEmail').val().trim();
    if(loginName.length==0){
        error('请输入有效玩家账号');
        return;
    }
    if(email.length==0){
        error('请输入预留手机号');
        return;
    }
    get('/member/getForgetPasswordCode',{'loginName':loginName, 'email':email,}).then(d=>{
        if(d.code==0){
        $('#emailCodeId').val(d.data.codeId)
        info("已经发送验证邮箱,请查看电子邮箱!")
    }else{
        error(d.message);
    }
});
}

function login(loginName, password, loginUrl) {
    let data = {
        loginName: loginName, password: hex_md5(password).toUpperCase(), loginUrl: loginUrl, way: "WEB",
        activeDevice: '', activeSystem: ''
    }
    return post("/member/login", data).done(d => {
        if (d.code == 0) {
            let user = {
                'loginName': d.data.loginName,
                'memberName': d.data.memberName,
                'token': d.data.token,
                'vipName': d.data.vip.vipName,
                'vipLevel': (parseInt(d.data.vip.vipLevel) - 1),
                'domain': wap_get_user().domain,
                'cashierDomain': d.data.cashierDomain,
                'userDomain': d.data.domain,
                'evip': d.data.vip.exclusiveUrl,
                'balance': d.data.balance
            };
            wap_set_user(user);
        }
    });

}

function register(data) {
    post('/member', JSON.stringify(data), undefined, 'application/json').then(d => {
        if (d.code == 0) {
            login(data['loginName'], data['password'], data['url']).done(d => {
                if (d.code == 0) {
                    $('#registered').hide();
                    $('#registeredModal .success').show();
                } else {
                    error(d.message);
                }
            })
        } else {
            error(d.message);
        }
    })
}

function sendValidateCode() {

    let r = $('#telephone').parsley();
    r.validate();
    if (r.isValid() != null && !r.isValid()) {
        return;
    }
    var telephone = $.trim($("#telephone").val());

    let text = $('#phoneCode').text();
    buttonDisable($('#phoneCode'));
    get(`/member/getRegVVerficationCode?phone=${telephone}`).then(d => {
        buttonEnable($('#phoneCode'), text)
        if (d.code == 0) {
            $('#regPhoneCode').val(d.data);
            fun_buttonCutDown($('#phoneCode'), 60);
            info('验证码发送成功,请检查手机短信');
        } else {
            fun_buttonCutDown($('#phoneCode'), 10);
            error(d.message);
        }
    }).fail(() => {
        buttonEnable($('#phoneCode'), text)
    });
}


function checkPlaform() {
    var car = "WEB";
    if (/AppleWebKit.*mobile/i.test(navigator.userAgent)
        || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/
            .test(navigator.userAgent))) {
        if (window.location.href.indexOf("?mobile") < 0) {
            try {
                if (/Android|webOS|iPhone|iPod|BlackBerry/i
                    .test(navigator.userAgent)) {
                    car = "PHONE";
                } else if (/iPad/i.test(navigator.userAgent)) {
                    car = "UNKNOW";
                }
            } catch (e) {
            }
        }
    }
    return car;
}

function getRegFrom() {
    var ref;
    if (document.referrer.length > 0) {
        ref = document.referrer;
    }
    try {
        if (ref.length == 0 && opener.location.href.length > 0) {
            ref = opener.location.href;
        } else {
            ref = document.location.href
        }
    } catch (e) {
        ref = document.location.href
    }
    return ref;
}

let messageId;

function initMessage() {
    if (wap_is_user_notexist()) {
        return;
    }
    if (messageId)
        clearTimeout(messageId);
    getMessage(1).done(d => {
        if (d.code == 0) {
            let messages = d.data.list.filter(item => item.isRead == 1).map(item => {
                return `<a href="javascript:void(0);" class="dropdown-item notify-item" 
                        onclick="showMessage(${item.id},'${item.title}','${item.content}',${item.sendTime})">
                                    <div class="notify-icon bg-soft-primary text-primary">
                                        <i class="mdi mdi-comment-account-outline"></i>
                                    </div>
                                    <input id="id" hidden value="${item.id}">
                                    <p class="notify-details">
                                        <small class="text-muted">${item.title}</small>
                                        ${item.content}
                                    </p>
                                </a>`
            })
            let count = messages.length;
            let html = messages.join("");
            if (count > 0) {
                $('#msgCount').html(count);
                $('#msgCount').show();
            } else {
                $('#msgCount').hide();
            }
            $('#msgList').html(html);
        }
    })
    messageId = setTimeout(() => initMessage(), Interval_TIME);
}

function createMsgHtml(name, content, time) {
    time = moment(time).format("YYYY-MM-DD hh:mm:ss");
    let html = `<div class="pop-notice">
                    <p class="name">尊敬的${name},您好：</p>
                    <p class="content">${content}</p>
                    <p class="time">${time}</p>
                </div>`;
    return html;
}

function showMessage(id, title, content, time, callback) {

    let html = createMsgHtml(user.loginName, content, time)
    Swal.fire({
        title: title,
        html: html,
        confirmButtonText: '确认'
    })
    readMessage(id).done(d => {
        callback();
    })
}

function readAllMessage() {
    $('#msgList a').each(function () {
        let id = $(this).find('#id').val();
        readMessage(id)
    })
    $('#msgList').html('');
    $('#msgCount').hide();
}

function headerNavMenu() {
    $('#navigationMenu > li').hover(function () {
        var subMenu = $(this).find('.header-sub-menu-container');
        if (subMenu) {
            subMenu.css('height', '300px');
        }
    }, function () {
        var subMenu = $(this).find('.header-sub-menu-container');
        if (subMenu) {
            subMenu.css('height', '0');
        }
    });
}

function fun_showNotice(id, index) {
    $.ajax({
        dataType: "jsonp",
        url: wap_site_host() + '/notice/notice?typeId=' + id,
        success: function (resultData) {
            if (resultData.code == 0) {
                var noticeData = resultData.data;
                var appendHtml = '<table class="layui-table"><tbody>';
                $.each(noticeData.noticeList, function (n, value) {
                    appendHtml +=
                        '    <tr>' +
                        '      <td>' + fun_filterTxt(value.content) + '</td>' +
                        '      <td style="width: 80px;">' + fun_timeFormat(value.createTime) + '</td>' +
                        '    </tr>';
                });
                appendHtml += '</tbody></table>';
                $('.notice-list-content div').eq(index).html(appendHtml);
            }
        }
    });
}

function refreshHeaderMainBalance() {
    $('#loginInfo .account-amount .amount').html(`<span class="spinner-border spinner-border-sm" 
        role="status" aria-hidden="true"></span>Loading...`)
    getBalance('main').done(d => {
        if (d.code == 0) {
            $('#loginInfo .account-amount .amount').text(`￥${d.data.toFixed(2)}`);
            $(`#mainBalance`).html(`￥${d.data.toFixed(2)}`);
            setLoginUserNewBalance(d.data.toFixed(2));
        } else {
            $('#loginInfo .account-amount .amount').html('刷新');
        }
    });
}

function logout() {
    get('/session/member/logout').always(d=>{
        wap_logout();
        window.location.href = "/";
    });
}

function loadCustomerInfo() {
    cached.getValueAndThen({key: 'otherSetting', get: () => get('/rest/api/otherSetting')}).then(d => {
        if (d.code == 0) {
            if(d.data==undefined)
                return;
            var data = JSON.parse(d.data);
            /*$('.customer_qq_number').html(data.qqnumber);*/
            $('.customer-right .customer-center .customer-content').click(function() {
                window.open(data.liveurl,"newWindow","height=723px, width=625px,menubar=no,directories=no,resizable=no,toolbar=no,titlebar=no,status=no,scrollbars=no").moveTo(350,15);
            });
        }
});
}
function headerDownload() {
    var all_box_url="ytgg8866.com";
    var esports_box_url="xwesport.app";
    var sport_box_url = "dygames.app";
    var agentCodeCache = _getStorageData("$agentInfoCode");
    var agentCode = agentCodeCache == null ? "" : agentCodeCache;
    var host = window.location.href;
    var arrUrl = host.split("//");
    var currUrl = arrUrl[1].split("/");
    var realUrl = currUrl[0];
    if (realUrl == 'www.dyvip52.com') {
        all_box_url="dyvip52gg.com";
        esports_box_url="dyvip52esport.app";
        agentCode = '105435';
        sport_box_url = 'dyvip52games.app';
    }
    var all_url = "https://"+all_box_url+"?url=" + realUrl + "&agentCode=" + agentCode;
    var esports_url = "https://"+esports_box_url+"?url=" + realUrl + "&agentCode=" + agentCode;
    var sport_url = "https://"+sport_box_url+"?url=" + realUrl + "&agentCode=" + agentCode;
    createQRCode('heard_all_img',all_url, 'https://sm.zzwangjie.com/resources/dy/style/img/favicon.ico', '97', '97');
    createQRCode('heard_esport_img',esports_url, 'https://sm.zzwangjie.com/resources/dy/style/img/favicon.ico', '97', '97');
    createQRCode('heard_sport_img',sport_url, 'https://sm.zzwangjie.com/resources/dy/style/img/favicon.ico', '97', '97');
    $('#heard_all_url').attr('href', all_url).text(all_box_url);
    $('#heard_esport_url').attr('href', esports_url ).text(esports_box_url);
    $('#heard_sport_url').attr('href', sport_url).text(sport_box_url);
}