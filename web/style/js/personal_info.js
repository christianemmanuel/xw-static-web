let userName, qqNumber, birthday , mailbox, telephone;

$(function () {
    userInfo();
    getBank();
    getBankCard();
    changePassword();
    initBankCardRecord();
})

function userInfo() {

    getUserInfo().done(d => {
        if (d.code == 0) {
            userName = d.data.lastName + d.data.firstName;
            qqNumber = d.data.qqnumber;
            birthday = d.data.birthday;
            mailbox =d.data.mailbox;
            telephone=d.data.telephone;
            $('.basic-info-text').find('#loginName').html(fun_filterTxt(d.data.loginName));
            $('.basic-info-text').find('#userName').html(fun_filterTxt(userName));
            $('.basic-info-text').find('#telephone').html(fun_filterTxt(d.data.reCodeTelephone));
            $('.basic-info-text').find('#email').html(fun_filterTxt(d.data.reCodeMailbox));
            if (qqNumber == '' || qqNumber == null || qqNumber == undefined) {
                $('.basic-info-text').find('#QQ').html('-');
            } else {
                $('.basic-info-text').find('#QQ').html(d.data.reCodeQQNumber);
            }
            if (birthday == '' || birthday == null || birthday == undefined) {
                $('.basic-info-text').find('#brd').html('-');
            } else {
                $('.basic-info-text').find('#brd').html(birthday);
            }
            if(mailbox){
                if (d.data.mailValidate == 1) {
                    $('.basic-info-text').find('#emailCheck').show();
                    $('.basic-info-text').find('#emailCheck').addClass('custom-btn-primary');
                    $('.basic-info-text').find('#emailCheck').html('验证')
                } else {
                    $('.basic-info-text').find('#emailCheck').show();
                    $('.basic-info-text').find('#emailCheck').addClass('custom-btn-gray');
                }
            }else{
                $('.basic-info-text').find('#emailCheck').hide();
            }

            if (userName && qqNumber && birthday && mailbox && telephone) {
                $('#infoBtn').hide();
            }

        }

    })
}


function openEmailDialog() {
    $('#dialog-body').show();
    $('#dialog-title').html("邮箱验证");
    $('#dialog-body').html(checkEmailHtml);
    initForm(userInfo);
    $('#dialog').modal()
}

function openPersonInfo() {
    $('#dialog-body').show();
    $('#dialog-title').html("完善个人信息");
    $('#dialog-body').html(personInfo(userName || '', qqNumber || '', birthday || '', mailbox || '', telephone || ''));
    initForm(userInfo);
    $('#dialog').modal()
    let nowDate, limitDate, startDate;
    nowDate = limitDate = startDate = new Date();
    limitDate.setFullYear(nowDate.getFullYear() - 18);
    limitDate.setTime(limitDate.getTime() - (1000 * 60 * 60 * 24));
    $('#birthdaySelect').datepicker({
        startView: 2,
        autoclose: true,
        language: "zh-CN",
        format: "yyyy-mm-dd",
        endDate: limitDate,
    });
}
function info_sendValidateCode() {
    let r = $('#info_telephone').parsley();
    r.validate();
    if (r.isValid() != null && !r.isValid()) {
        return;
    }
    var telephone = $.trim($("#info_telephone").val());
    let text = $('#info_phoneCode').text();
    buttonDisable($('#info_phoneCode'));
    get(`/member/getRegVVerficationCode?phone=${telephone}`).then(d => {
        buttonEnable($('#info_phoneCode'), text);
        if (d.code == 0) {
            $('#info_regPhoneCode').val(d.data);
            fun_buttonCutDown($('#info_phoneCode'), 60);
            info('验证码发送成功,请检查手机短信');
        } else {
            fun_buttonCutDown($('#info_phoneCode'), 10);
            error(d.message);
        }
    }).fail(() => {
        buttonEnable($('#info_phoneCode'), text)
    });
}

function changePassword() {
    $('#changePassword').parsley(DEFAULT_PARSLEY_CONFIG);
    $('#changePassword').submit(e => {
        e.preventDefault();
        let url = $(e.target).attr("action")
        let formData = toJsonObject($(e.target).serializeArray());
        let pwd = formData['password'];
        formData['oldPassword'] = hex_md5(formData['oldPassword']).toUpperCase();
        formData['password'] = hex_md5(pwd).toUpperCase();
        formData['plainPassword'] = pwd;

        let btn = $(e.target).find("#changePwdBtn")
        let text = btn.text();
        buttonDisable(btn);
        post(url, formData).done(d => {
            if (d.code == 0) {
                Swal.fire({
                    icon: 'success',
                    text: '修改成功'
                }).then(() => {
                    $(e.target)[0].reset()
                    $(e.target).parsley().reset();
                });
            } else {
                info(d.message)
                $(e.target).parsley().reset();
            }
        }).always(() => {
            buttonEnable(btn, text);
        });
    })
}

function openAddBank() {
    if(!userName || !telephone) {
        info('请先完善个人信息');
        return;
    }
    $('#dialog-body').html(bankHtml(userName));
    $('#bank_card_no').on('keyup', function () {
        this.value = this.value.replace(/\D/g, '');
    })
    initForm(getBankCard);
    $('#dialog-title').html("添加银行卡");
    $('#dialog').modal()
    let bankStr = '<option value="">请选择银行</option>';
    let html = bankDatas.map(b => {
        return '<option value="' + b.id + '">' + fun_filterTxt(b.bankName) + '</option>'
    }).join("");
    $('#banks').html(bankStr + html)
}
function openVirtualAddBank() {
    $('#dialog-body').html(virtualBankHtml);
    initForm(getBankCard);
    getDigitalCurrency();
    $('#dialog-title').html("新增虚拟取款账户");
    $('#dialog').modal()
}
function getBank() {
    cached.getValueAndThen({
        key: 'getBanks', get: () => {
            return get('/session/bank')
        }, expired_value: 60 * 60
    }).then(d => {
        if (d.code == 0) {
            bankDatas = d.data;
        } else {
            info(d.message);
        }
    })
}

function unbindBankCard(id) {

    Swal.fire({
        title: '请输入解绑银行卡号',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        showLoaderOnConfirm: true,
        preConfirm: (cardNumber) => {
            return get(`/session/bankcard/${id}`, {'cardNum': cardNumber}).done(d => {
                if (d.code != 0) {
                    Swal.showValidationMessage(
                        d.message
                    )
                } else {
                    Swal.fire({
                        icon: 'success',
                        text: '解绑成功'
                    }).then(() => {
                        getBankCard();
                        dataTable.ajax.reload();
                    })
                }
            })
        },
        allowOutsideClick: () => !Swal.isLoading()
    });
}

function getBankCard() {
    getUserBankCard().done(d => {
        if (d.code == 0) {
            let html = d.data.map(b => {
                var length = b.cardNum.length;
                var endNum = b.cardNum.substr(length - 4, 4);
                var bankId = getBankId(b.bankName);
                return ` <div class="default-bank-card bank-bg bank-bg-${bankId} bank-card">
                            <div class="bank-icon bank-icon-${bankId}"></div>
                            <div class="bank-name"><span class="name">${b.bankName}</span><span class="type">银行卡</span></div>
                            <i class=" delete-card remixicon-link-unlink" onclick="unbindBankCard(${b.id})"></i>
                            <div class="card-num">
                                <span>OOOO</span>
                                <span>OOOO</span>
                                <span>OOOO</span>
                                <span>${endNum}</span>
                            </div>
                        </div>`
            }).join("")
            html = html + ` <div class="default-bank-card new-card" onclick="openAddBank()">
                                <i class="remixicon-link"></i>
                                <span>添加银行卡</span>
                            </div>
                            <div class="default-bank-card new-card" onclick="openVirtualAddBank()">
                                <i class="remixicon-link"></i>
                                <span>添加虚拟币账户</span>
                            </div>`
            $('.bank-card-info').html(html)
        } else {
            info(d.message)
        }
    })
}

function getBankId(bankName) {
    let bankId = bankDatas.filter(b => b.bankName == bankName).map(b => b.id);
    return bankId;
}

function initForm(callback) {
    $('#dialog-body').show();
    $('#dialog-success').hide();
    $('#dialogForm').parsley(DEFAULT_PARSLEY_CONFIG);
    $('#dialogForm').submit(e => {
        e.preventDefault();
        let url = $(e.target).attr("action")
        let formData = toJsonObject($(e.target).serializeArray());
        let btn = $(e.target).find("#submit")
        let text = btn.text();
        buttonDisable(btn);
        post(url, formData).done(d => {
            if (d.code == 0) {
                $('#dialog-body').hide();
                $('#dialog-success').show();
                if (callback) {
                    callback();
                }
            } else {
                info(d.message)
            }
        }).always(() => {
            buttonEnable(btn, text);
        });
    })
}

function sendIdentifyCode() {
    post('session/message/accountMessage/createEmailValidCode').then(d => {
        if (d.code == 0) {
            fun_buttonCutDown($('#IdentifyCodeBtn'), 60);
        } else {
            info(d.message);
        }
    })
}

function getBindCardCode() {
    return get('/session/bankcard/getBindCardCode').done(d => {
        if (d.code != 0) {
            info(d.message);
        }else{
            $('#bank_phoneCodeId').val(d.data.codeId)
            fun_buttonCutDown($('#bank_phoneCode_btn'), 60);
        }
    })
}
function initBankCardRecord() {

    dataTable = $('#unbind-card-record').DataTable({
        autoWidth: false,
        lengthChange: false,
        ordering: false,
        info: false,
        searching: false,
        pageLength: 4,
        columns: [
            {data: "bankName", width: '85px'},
            {data: "bankAccount", width: "60px"},
            {data: "encryptCardNum", width: '70px'},
            {data: "cmbAddr", width: '70px'},
            {data: "createTime", width: "131px"},
            {data: "unbindingTime", width: "131px"}
        ],
        columnDefs: [
            {
                "targets": 2,
                "data": "encryptCardNum",
                "render": function (data, type, row, meta) {
                    data = data.substr(data.length - 4, data.length);
                    return `<div style="">*********${data}</div>`
                }
            },
            {
                "targets": 3,
                "data": "cmbAddr",
                "render": function (data, type, row, meta) {
                    return `<div style="width:100px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis; ">${data}</div>`
                }
            }],
        language: {
            "zeroRecords": "没有找到记录",
            "paginate": {
                "previous": "<i class='mdi mdi-chevron-left'>",
                "next": "<i class='mdi mdi-chevron-right'>"
            }
        },
        drawCallback: function () {
            $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
        },
        ajax: function (data, callback) {
            get('/session/bankcard/getBindingCardHistory').then(d => {
                if (d.code == 0) {
                    let data = d.data.map(record => {
                        return {
                            bankName: record.bankInfo.bankName,
                            bankAccount: record.bankAccount,
                            encryptCardNum: record.cardNum,
                            cmbAddr: record.cmbAddr,
                            createTime: record.fmtCreateTime,
                            unbindingTime: record.fmtUnbindingTime
                        }
                    })
                    let tableDate = {
                        data: data,
                        recordsTotal: data.length,
                        recordsFiltered: data.length
                    }
                    callback(tableDate);
                } else {
                    info(d.message);
                }
            })
        }
    });
}

function getDigitalCurrency(){
    get('/session/bank/getDigitalCurrency').then(d => {
        if (d.code == 0) {
        $.each(d.data.digitalCurrency, function(index,value){
            var html=`<input class="virtual-radio" type="radio" digitalcurrencyid="${value.id}" name="digitalCurrncyId" id="virtualType${value.id}" value="${value.id}">
                <label for="virtualType${value.id}" class="digital-currency-type usdt-img" id="virtualTypeLabel${value.id}">
                <img src="${cdn}style/img/digitalCurrency/${value.name.toUpperCase()}.png">${value.name.toUpperCase()}</label>`
            $("#digital-currency-list").append(html);
            $("#virtualTypeLabel" + value.id).data("data",value);
        });
        $(".digital-currency-type").click(function(){
            $("#digital-currency-protocol-list").empty();
            var protocolStatuses=$(this).data("data").protocolStatuses;
            $.each($(this).data("data").protocols, function(index,value){
                if(protocolStatuses[index]!=0){
                    var html=`<input class="virtual-radio" type="radio" name="digitalProtocol" id="${value}" digitalCurrencyProtocol="${value}" value="${value}">
                        <label for="${value}" class="procotol">${value}</label>`
                    $("#digital-currency-protocol-list").append(html);
                }
            });
            $("#digital-currency-protocol-list label").first().click();
        });
        $(".digital-currency-type").first().click();
    }
});
}

