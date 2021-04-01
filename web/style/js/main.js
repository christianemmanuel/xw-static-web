$(init)
let NO_TRANSFER_PLATFORM = ['XIN', 'fishjp', 'agdz', 'Ebet', 'IM', 'Marlin'];
let language = {
    "zeroRecords": "没有找到记录",
    "paginate": {
        "previous": "<i class='mdi mdi-chevron-left'>",
        "next": "<i class='mdi mdi-chevron-right'>"
    }
}, recordUrl = {
    deposit: "/session/record/deposit-record",
    withdraw: '/session/record/withdraw-record',
    account: '/session/record/member-money-record',
    transfer: '/session/record/transfer-record',
    prom: '/session/record/privilege-record',
    gameBet: '/session/record/game-bet-record'
}, datapickerConfig = {
    autoclose: true,
    language: "zh-CN",
    format: "yyyy-mm-dd",
    endDate: new Date(),
}

let bankDatas, dataTable;
let checkEmailHtml = `<form id="dialogForm" action="/session/message/accountMessage/submitEmailVaildate" novalidate>
                    <div class="form-group">
                        <label class="col-sm-3 col-form-label" style="text-align: right">验证码：</label>
                        <div class="col-sm-5">
                            <input type="input" class="form-control" id="emailCode" name="emailCode"
                             required
                             data-parsley-required-message="验证码不能为空"
                            >
                        </div>

                        <button type="button" id="IdentifyCodeBtn" onclick="sendIdentifyCode()" class="col-sm-4 btn btn-primary" style="margin-left: 10px">获取验证码</button>
                    </div>
                    <div class="form-group">
                        <button id="submit" type="submit" class="btn btn-primary">提交</button>
                    </div>
                </form>`;

let personInfo = (realName, qqNumber, birthday, mailbox, telephone) => {
    let html=`<form id="dialogForm" action="/session/member/updateMemberInfo" novalidate>`;
    if(!realName){
        html=html+`<div class="form-group">
                        <label class="col-sm-4 col-form-label">姓名：</label>
                        <div class="col-sm-8" >
                            <input type="input" name="realName" class="form-control" 
                                ${realName?'readonly':''}  value="${realName}"
                             required
                             data-parsley-required-message="姓名不能为空"
                             >
                        </div>
                    </div>`;
    }
    if(!qqNumber){
        html=html+`<div class="form-group">
                        <label class="col-sm-4 col-form-label">QQ：</label>
                        <div class="col-sm-8" >
                            <input type="input" name="qqnumber" class="form-control"
                                ${qqNumber?'readonly':''} value="${qqNumber}"
                                   minlength="5"
                                   maxlength="15"
                                   autocomplete="off" required
                                   data-parsley-required-message="QQ号码不能为空"
                                   data-parsley-length-message="QQ号码长度为5-15位"
                            >
                        </div>
                    </div>`;
    }
    if(!birthday){
        html=html+`<div class="form-group">
                        <label class="col-sm-4 col-form-label">生日：</label>
                        <div class="col-sm-8" >
                            <input type="input" id="birthdaySelect" name="birthday" class="form-control" 
                            readonly="readonly"  value="${birthday}"
                             required
                             data-parsley-required-message="生日不能为空"
                             >
                        </div>
                    </div>`;
    }
    if(!mailbox){
        html=html+`<div class="form-group">
                        <label class="col-sm-4 col-form-label">Email：</label>
                        <div class="col-sm-8" >
                            <input type="input" name="mailbox" class="form-control"
                                ${mailbox ? 'readonly' : ''} value="${mailbox}"
                                   autocomplete="off"
                                   pattern="^[A-Za-z0-9\\u4e00-\\u9fa5]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$"
                                   required
                                   data-parsley-required-message="邮箱不能为空"
                                   data-parsley-pattern-message="邮箱格式不正确"
                            >
                        </div>
                    </div>`;
    }
    if(!telephone){
        html=html+`<div class="form-group">
                        <label class="col-sm-4 col-form-label">手机：</label>
                        <div class="col-sm-8" >
                            <input type="input" name="telephone" class="form-control" id="info_telephone"
                                ${telephone ? 'readonly' : ''} value="${telephone}"
                                   maxlength="11" minlength="11"
                                   pattern="^[0-9]*[1-9][0-9]*$"
                                   autocomplete="off" required
                                   data-parsley-type-message="手机号必须为数字"
                                   data-parsley-required-message="手机号码不能为空"
                                   data-parsley-length-message="请输入11位手机号"
                                   data-parsley-pattern-message="请输入正确的手机号码"
                            >
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-4 col-form-label">验证码：</label>
                        <div class="col-sm-8" >
                            <input type="text" name="code" class="form-control" style="display: inline-block;width: 134px"
                                   autocomplete="off" minlength="4"
                                   maxlength="4" required
                                   data-parsley-required-message="验证码不能为空"
                                   data-parsley-length-message="验证码长度不正确"
                            >
                            <div class="input-group-append" style="display: inline-block;float: right;">
                                <button class="btn btn-primary" type="button" id="info_phoneCode"
                                        onclick="info_sendValidateCode()">获取验证码
                                </button>
                            </div>
                            <input type="hidden" name="codeId" id="info_regPhoneCode">
                        </div>
                    </div>`;
    }
    html=html+`<div class="form-group">
                        <button type="reset" class="btn btn-primary" style="margin-right: 20px">重置</button>
                        <button id="submit" class="btn btn-primary">提交</button>
                    </div>
                </form>`;
    return html;
}

let bankHtml = memberName => {
    return `<form id="dialogForm" action="/session/bankcard" novalidate>
                    <div class="form-group">
                        <label class="col-sm-4 col-form-label">银行名称：</label>
                        <div class="col-sm-8" style="width: 201px">
                            <select id="banks" name="bankId"  class="form-control"
                            required data-parsley-required-message="请选择提款银行"
                            >
                                <option>请选择</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-4 col-form-label">开户姓名：</label>
                        <div class="col-sm-8" >
                            <input type="input" name="memberName" readonly="readonly" class="form-control" value=" ${memberName}" >
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-4 col-form-label">银行卡号：</label>
                        <div class="col-sm-8" >
                            <input type="input" name="cardNum" class="form-control" id="bank_card_no"
                             autocomplete="off" minlength="12" 
                             maxlength="23" required
                             data-parsley-length-message="银行卡号不正确"
                             data-parsley-required-message="银行卡号不能为空" 
                            >
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-4 col-form-label">开户行地址：</label>
                        <div class="col-sm-8" >
                            <input type="input" name="cmbAddr" class="form-control" required
                                   data-parsley-required-message="开户地址不能为空">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-4 col-form-label">手机号码:</label>
                        <div class="col-sm-8" style="width: 201px">
                            <input type="text" class="form-control"  name="phone" placeholder="请输入绑定的手机号码" 
                            maxlength="11" minlength="11" pattern="^[0-9]*[1-9][0-9]*$" autocomplete="off" required 
                            data-parsley-type-message="手机号必须为数字" data-parsley-required-message="手机号码不能为空" 
                            data-parsley-length-message="请输入11位手机号" data-parsley-pattern-message="请输入正确的手机号码">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-4 col-form-label">手机验证码：</label>
                        <div class="col-sm-8" >
                            <input type="text" class="form-control validCode" name="code"
                                               autocomplete="off" minlength="4"
                                               maxlength="4" required
                                               data-parsley-required-message="验证码不能为空"
                                               style="width: 120px;display: inline-block;">
                                        <button type="button" onclick="getBindCardCode()" id="bank_phoneCode_btn"
                                                class="btn custom-btn-primary"
                                                style="margin-top: unset;height: 38px; margin-left: 10px;width: 120px;">获取验证码
                                        </button>
                        </div>
                        <input type="hidden" id="bank_phoneCodeId" name="codeId" />
                    </div>
                    <div class="form-group" style="color: #c32424;">若持卡人姓名不符可联系在线客服更正信息，感谢您的支持与理解！</div>
                    <div class="form-group" style="color: #c32424;">若10分钟内没有收到验证码，请联系在线客服咨询！</div>
                    <div class="form-group">
                        <button type="reset" class="btn btn-primary" style="margin-right: 20px">重置</button>
                        <button id="submit" class="btn btn-primary">提交</button>
                    </div>
                </form>`;
}

let virtualBankHtml = `<form id="dialogForm" action="/session/bankcard/addDigitalWallet" novalidate>
                    <div class="form-group">
                        <label class="col-sm-4 col-form-label">虚拟币账户:</label>
                        <div class="col-sm-8" style="width: 201px">
                            <input type="input" name="cardNum" id="digitalWallet" class="form-control" required 
                            data-parsley-required-message="账户不能为空">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-4 col-form-label">虚拟币种类:</label>
                        <div class="col-sm-8" id="digital-currency-list">
                            
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-4 col-form-label">协议:</label>
                        <div class="col-sm-8" id="digital-currency-protocol-list">
                            
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-4 col-form-label">手机号码:</label>
                        <div class="col-sm-8" style="width: 201px">
                            <input type="text" class="form-control" id="bind-telephone2" name="phone" placeholder="请输入绑定的手机号码" 
                            maxlength="11" minlength="11" pattern="^[0-9]*[1-9][0-9]*$" autocomplete="off" required 
                            data-parsley-type-message="手机号必须为数字" data-parsley-required-message="手机号码不能为空" 
                            data-parsley-length-message="请输入11位手机号" data-parsley-pattern-message="请输入正确的手机号码">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-sm-4 col-form-label">手机验证码:</label>
                        <div class="col-sm-8" >
                            <input type="text" class="form-control validCode" name="code"
                                               autocomplete="off" minlength="4"
                                               maxlength="4" required
                                               data-parsley-required-message="验证码不能为空"
                                               style="width: 120px;display: inline-block;">
                                        <button type="button" onclick="getBindCardCode()" id="bank_phoneCode_btn"
                                                class="btn custom-btn-primary"
                                                style="margin-top: unset;height: 38px; margin-left: 10px;width: 120px;">获取验证码
                                        </button>
                        </div>
                        <input type="hidden" id="bank_phoneCodeId" name="codeId" />
                    </div>
                    <div class="form-group" style="color: #c32424;">若10分钟内没有收到验证码，请联系在线客服咨询！</div>
                    <div class="form-group">
                        <button type="reset" class="btn btn-primary" style="margin-right: 20px">重置</button>
                        <button id="submit" class="btn btn-primary">提交</button>
                    </div>
                </form>`;

function init() {
    let page = getQueryParam("page");
    $('#avatarUserName').html(`${user.loginName}`);
    $('#avatarVip').html(`${user.vipName}`);
    $('#mainBalance').html(`￥` + parseFloat(user.balance).toFixed(2));
    $('#vipUrl').html(`${user.evip}`)
    if (page) {
        showPage(page);
    }
}

function refreshBalance(type) {
    $(`#${type}Balance`).html(`<span class="spinner-border spinner-border-sm" 
        role="status" aria-hidden="true"></span>Loading...`)
    getBalance(type).done(d => {
        if (d.code == 0) {
            if(type === 'main') {
                $('#loginInfo .account-amount .amount').text(`￥${d.data.toFixed(2)}`);
            }
            $(`#${type}Balance`).html(`￥${d.data.toFixed(2)}`);
            setLoginUserNewBalance(d.data.toFixed(2));
        } else {
            $(`#${type}Balance`).html('刷新');
        }
    });
}

function showPage(page) {

    $.get(`${page}.html`, data => {
        $('.main-right-info').html(data)
        $('.menu-item').each((index, val) => {
            $(val).removeClass('active');
        })
        $('#' + page).addClass('active');

    })
}
