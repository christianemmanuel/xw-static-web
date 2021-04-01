$(init)

function init() {
    window.Parsley.addValidator("notequalto", {
        requirementType: "string",
        validateString: function (value, element) {
            return value !== $(element).val();
        }
    });
    $('#sportInsurance').on('show.bs.modal', insuranceDialog)
    $('#inviteFriends').on('show.bs.modal', invite_friends)
    $('#sportPane').on('show.bs.modal', sportConjecture)
    let param = getQueryParam("model")
    if (param && param == 'sport') {
        $('#sportPane').modal({show: true})
    }
}

function insuranceDialog(e) {
    $('#insurance-body').show();
    $('#insurance-success').hide();
    $('#playerAccount').val(user.loginName)
    $('#insuranceForm').parsley(DEFAULT_PARSLEY_CONFIG).reset();
    $('#insuranceForm').submit(e => {
        e.preventDefault();
        let formData = toJsonObject($(e.target).serializeArray());
        let url = $(e.target).attr('action')
        let btn = $(e.target).find('#submit')
        let text = btn.html();
        buttonDisable(btn);
        post(url, formData).done(d => {
            if (d.code == 0) {
                success('提交成功').then(() => {
                    $('#insurance-body').hide();
                    $('#insurance-success').show();
                });
            } else {
                error(d.msg)
            }
        }).always(() => {
            buttonEnable(btn, text);
        });
    })
}

function invite_friends(e) {
    $('#invite-body').show();
    $('#invite-success').hide();
    $('#loginName').val(user.loginName)
    $('#inviteForm').parsley(DEFAULT_PARSLEY_CONFIG).reset();
    $('#inviteForm').submit(e => {
        e.preventDefault();
        let formData = toJsonObject($(e.target).serializeArray());
        let url = $(e.target).attr('action')
        let btn = $(e.target).find('#inviteSubmit')
        let text = btn.html();
        buttonDisable(btn);
        post(url, formData).done(d => {
            if (d.code == 0) {
                success('提交成功').then(() => {
                    $('#invite-body').hide();
                    $('#invite-success').show();
                });
            } else {
                error(d.message)
            }
        }).always(() => {
            buttonEnable(btn, text);
        });
    })
}

function helpBonus() {

    info('救援金只可以进行老虎机游戏,如果未完成投注前,进行其他游戏将扣除全部盈利,返回本金').then(() => {
        get('/session/helpbonus/member/help-bonus').then(d => {
            if (d.code == 0) {
                success('提交成功');
            } else {
                error(d.message);
            }
        })
    })

}

function getCheckInPrivilege() {

    post('/session/checkInPrivilege/apply').done(d => {
        if (d.code == 0) {
            success(d.message);
        } else {
            error(d.message);
        }
    })
}

function getAppDepositBonu(t) {
    var applyBtn = $(t);
    applyBtn.attr('disabled', 'true');
    applyBtn.text('领取中...');
    post('/session/appDepositPrivilege/apply').done(d => {
        applyBtn.removeAttr('disabled');
        applyBtn.text('马上领取');
        if (d.code == 0) {
            success(d.message);
        } else {
            error(d.message);
        }
    });
}


function sportConjecture() {
    $('#sportContext').attr('src', event_site_host() + '/lottery/sportConjecture_web?token=' + wap_get_user().token);


}

function urlGoto(url) {
    window.location.href=url;
}