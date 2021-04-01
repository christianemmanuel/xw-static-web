$(init)


function init() {
    refreshBalance('main');
    getPlatforms().done(d => {
        if (d.code == 0) {
            let html = d.data.filter(p => !NO_TRANSFER_PLATFORM.includes(p.platformCode))
                .map(p => {
                    return ` <div class="card-box ribbon-box card-platform">
                                <div class="ribbon ribbon-success float-left"><i class="mdi mdi-access-point mr-1"></i>${p.platformNameCn}</div>
                                <i class=" float-right mt-0 remixicon-refresh-line card-refresh" onclick="refreshBalance('${p.platformCode}')"></i>
                                <div class="ribbon-content card-content">
                                    <div class="platform-amount">
                                        <label>金额：</label><span id="${p.platformCode}Balance">刷新</span>
                                    </div>
                                    <div class="btn-platform">
                                        <button class="btn custom-btn-primary" 
                                        onclick="showDialog('${p.platformNameCn}','${p.platformCode}','deposit')">转入</button>
                                        <button class="btn btn-primary"
                                        onclick="showDialog('${p.platformNameCn}','${p.platformCode}','withdrawals')"
                                        >转出</button>
                                    </div>
                                </div>
                            </div>`;
                }).join("")

            $('.transfer-panel').html(html)

        }
    })
    $('#dialogForm').parsley(DEFAULT_PARSLEY_CONFIG);
    $('#dialogForm').submit(e => {
        e.preventDefault();
        let formData = toJsonObject($(e.target).serializeArray());
        let btn = $(e.target).find("#submit")
        let text = btn.text();
        buttonDisable(btn);
        post(`/session/balance/${formData['type']}/${formData['platform']}/${formData['amount']}/WEB`, formData).done(d => {
            if (d.code == 0) {
                //$('#dialog-body').hide();
                //$('#dialog-success').show();
                $('#dialog').modal('hide');
                info('提交成功');
                refreshBalance('main');
                refreshBalance(formData['platform']);
            } else {
                info(d.message)
            }
        }).always(() => {
            buttonEnable(btn, text);
        });
    })
}


function showDialog(name, code, type) {
    $('#dialog-body').show();
    $('#dialog-success').hide();
    let title = `<span id="avatarVip" class="badge badge-danger" style="font-size: 12px; font-weight: normal">主账户</span>
               <i class="remixicon-arrow-right-line"></i>
                 <span id="avatarVip" class="badge badge-success" style="font-size: 12px; font-weight: normal">${name}</span>`;
    if (type == 'withdrawals') {
        title = `<span id="avatarVip" class="badge badge-success" style="font-size: 12px; font-weight: normal">${name}</span>
                <i class="remixicon-arrow-right-line"></i>
                <span id="avatarVip" class="badge badge-danger" style="font-size: 12px; font-weight: normal">主账户</span>`;
    }
    $('#dialog-title').html(title);
    $('#platform').val(code);
    $('#type').val(type);
    $('#dialog').modal();
}

// function transfer() {
//
// }

