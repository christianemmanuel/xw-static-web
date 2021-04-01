
let protocolStatus = {};
$(getDigitCurrnecyType())

function bankCard() {
    getUserBankCard().done(d => {
        if (d.code == 0) {
            if (d.data.length <= 0) {
                info('您还没有绑定银行卡，请先绑定！').then(() => {
                    $.get("personal_info.html", data => $('.main-right-info').html(data))
                });
            } else {
                $(".select-cards").empty();
                $(".select-cards").append("<option value=''>请选择</option>");
                $.each(d.data, (n, v) => {
                    if(v.digitalCurrncyId==0){
                        let options = `<option value="${v.id}">${v.bankName} - ${v.cardNum}</option>`;
                        $("#bankcard-0").append(options);
                    }else{
                        if(protocolStatus[v.digitalCurrncyProtocol] != 0) {
                            let options = `<option value="${v.id}">${v.bankName}(${v.digitalCurrncyProtocol}) - ${v.cardNum}</option>`;
                            $("#bankcard-"+v.digitalCurrncyId).append(options);
                        }
                    }

                });
            }
        }
    });

    get('/session/record/withdrawalLowerAndLimit').done(d => {
        if (d.code == 0) {
            $('#withdraw-limit').html(parseNumber(d.data.withdrawLower) + '元 - ' + parseNumber(d.data.withdrawLimit) + '元');
            $('#today-withdraw-limit').html(parseNumber(d.data.dayTotalLimit) + '元，剩余：' + parseNumber(d.data.dayLeaveCount) + '次');
            $('#amount').attr('min', d.data.withdrawLower);
            $('#amount').attr('max', d.data.withdrawLimit);
            $('#amount').attr('data-parsley-range-message',
                `提款金额必须在${+d.data.withdrawLower}和${d.data.withdrawLimit}之间`);
            $('#usdt-limit').html("单笔限额："+d.data.digitalCurrencyWithdrawLower+"元 - "+d.data.digitalCurrencyWithdrawLimit+"元");
            $('#today-usdt-limit').html("今日可提款："+d.data.dayTotalLimit+ "元,剩余："+parseNumber(d.data.dayLeaveCount)+"次");
            $('#usdtAmount').attr('min',d.data.digitalCurrencyWithdrawLower);
            $('#usdtAmount').attr('max',d.data.digitalCurrencyWithdrawLimit);
            $('#usdtAmount').attr('data-parsley-range-message',
                `提款金额必须在${+d.data.digitalCurrencyWithdrawLower}和${d.data.digitalCurrencyWithdrawLimit}之间`);
        } else {
            error(d.message)
        }
    })

    $('#withdraw-form').parsley(DEFAULT_PARSLEY_CONFIG);
    $('#withdraw-form').submit(submit);
    $('#usdt-withdraw-form').parsley(DEFAULT_PARSLEY_CONFIG);
    $('#usdt-withdraw-form').submit(submit);

    $("#usdtAmount").on("input", function(){
        let data = $(".bank-active").parent().data("data");
        let number = Math.floor( floatdivide($(this).val(),data.withdrawRate) * 100 ) / 100;
        $("#preview-account").html(number + " " + data.name.toUpperCase());
    });
}

function submit(e) {
    e.preventDefault();
    let formData = toJsonObject($(e.target).serializeArray());
    let btn = $('#submit')
    let text = btn.html();
    buttonDisable(btn);
    post(`/session/balance/withdrawals`, formData).done(d => {
        if (d.code == 0) {
            confirm_success('提交成功', '系统提示', function() {
                location.reload();
            });
            //refreshHeaderMainBalance();
        } else {
            error(d.message)
        }
    }).always(() => {
        buttonEnable(btn, text);
    });

}
function parseNumber(numStr) {
    if(typeof  numStr === 'number')
        numStr = numStr + '';
    return numStr.replace(/\d+?(?=(?:\d{3})+$)/img, "$&,");
}

function getDigitCurrnecyType() {
    get('/session/bank/getDigitalCurrency').done(d => {
        if (d.code == 0) {
        $.each(d.data.digitalCurrency, function(index,value){
            for(let i=0 ; i<value.protocols.length ; i++){
                protocolStatus[value.protocols[i]] = value.protocolStatuses[i];
            }
            var html=`<section type="digitalCurrency" id="digitalCurrenyData${value.id}" class="draw-way" data-ways="usdt-form"><div>
                    <img class="usdt" src="${cdn}/style/img/digitalCurrency/${value.name.toUpperCase()}.png" alt="" srcset=""></div>
                    <p>${value.name.toUpperCase()}</p>
                    </section>`;
            $("#bank-way").append(html);
            $("#digitalCurrenyData" + value.id).data("data",value);
        });
        $('.draw-way').click(function() {
            $(this).find('div').addClass('bank-active');
            $(this).siblings('section').find('div').removeClass('bank-active');
            $('.form-content').hide();
            $('.' + $(this).data('ways')).show();
            let type = $(this).attr("type");
            let data = $(this).data("data");
            if(type != 'rmb'){
                var openProtocol='';
                for(var i in protocolStatus) {
                    if(protocolStatus[i]!=0)
                        openProtocol+=i+",";
                }
                $("#protocols").html(openProtocol.substr(0,openProtocol.length-1));
                $("#rate").html("1.00 "+data.name+" ≈ "+data.withdrawRate+" RMB");
                $("#preview-account").html("0 " + data.name.toLocaleUpperCase());
            }
        });
        $('.draw-way').first().click();
        bankCard();
    } else {
        error(d.message)
    }
})
}

function floatdivide(arg1, arg2) {
    let t1 = 0,
        t2 = 0,
        r1, r2;
    try {
        t1 = arg1.toString().split(".")[1].length;
    } catch (e) {}
    try {
        t2 = arg2.toString().split(".")[1].length;
    } catch (e) {}
    r1 = Number(arg1.toString().replace(".", ""));
    r2 = Number(arg2.toString().replace(".", ""));
    return (r1 / r2) * Math.pow(10, t2 - t1);
}
