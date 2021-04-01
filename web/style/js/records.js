$(init);

function init() {
    $('[name=beginDate]').each((index, val) => {
        $(val).datepicker(datapickerConfig)
    });
    $('[name=endDate]').each((index, val) => {
        $(val).datepicker(datapickerConfig)
    });
    changeDateRange("today");
    changeType("deposit");

    getPlatforms().done(d => {
        if (d.code == 0) {
        let html = d.data.map(p => {
            return `<option value="${p.id}">${p.platformNameCn}</option>`;
        }).join("");

        $('#betPlatformSel').html(html);
    }
})
}

function changeType(type) {
    $('.record-pane').hide();
    $(`#${type}Pane`).show();
    $('.search-payment-type li').removeClass('badge badge-primary');
    $(`#${type}Menu`).addClass('badge badge-primary');
    $('#platformIdBox').hide();
    switch (type) {
        case 'deposit':
            initDepositTable();
            break;
        case 'withdraw':
            initWithdrawRecord();
            break;
        case 'account':
            initAccountRecord();
            break;
        case 'transfer':
            initTransferRecord();
            break;
        case 'prom':
            initPromRecord();
            break;
        case 'gameBet':
            $('#platformIdBox').show();
            initGameBetRecord();
            break;
    }
}

function changeDateRange(type) {
    $('.search-data-type li').removeClass('badge badge-primary');
    $(`#${type}Menu`).addClass('badge badge-primary');
    let start, end = moment().add(1, 'days').format('YYYY-MM-DD');
    switch (type) {
        case "today":
            start = moment().format('YYYY-MM-DD');
            break;
        case "three":
            start = moment().subtract(3, 'days').format('YYYY-MM-DD');
            break
        case "week":
            start = moment().subtract(1, 'week').format('YYYY-MM-DD');
            break
        case "month":
            start = moment().subtract(1, 'months').format('YYYY-MM-DD');
            break
    }
    $('[name=beginDate]').val(start);
    $('[name=endDate]').val(end);
}


function drawCallback() {
    $('.dataTables_paginate > .pagination').addClass('pagination-rounded');
}

function dateFormat(data, type, row, meta) {
    if (data) {
        return moment(data).format('YYYY-MM-DD HH:mm:ss');
    } else {
        return ''
    }
}

function promotionStatusFormat(data, type, row, meta) {
    switch (data) {
        case 1:
            return '待审核';
        case 2:
            return '已审核';
        case 3:
            return '已取消';
        case 4:
            return '已更改';
        default:
            return '';
    }
}

function statusFormat(data, type, row, meta) {
    if (data == '存款成功')
        return `<div class="badge badge-success">${data}</div>`;
    else if (data == '存款失败')
        return `<div class="badge badge-danger">${data}</div>`;
    else
        return `<div class="badge badge-warning">${data}</div>`;
}

function withdrawStatusFormat(data) {
    if (data == '提款成功')
        return `<div class="badge badge-success">${data}</div>`;
    else if(data == '提款失败')
        return `<div class="badge badge-danger">${data}</div>`;
    else
        return `<div class="badge badge-warning">${data}</div>`;

}

function ajaxCallback(type, data, callback) {
    let page = (data.start / data.length) + 1;
    page = page ? page : 1;
    let requestData = {
        "beginTime": $('[name=beginDate]').val(),
        'endTime': $('[name=endDate]').val(),
        'pageSize': data.length,
        'pageNo': page
    };
    if(type === 'gameBet') {
        requestData['platformId'] = $('#betPlatformSel').val();
    }
    get(recordUrl[type], requestData).done(d => {
        if (d.code == 0) {
            let tableData = {
                data: d.data.list,
                recordsTotal: d.data.totalNum,
                recordsFiltered: d.data.totalNum
            }
            callback(tableData);
        } else {
            error(d.message);
        }

    })
}

function initDepositTable() {
    let table = $('#depositRecord').DataTable({
        lengthChange: false,
        ordering: false,
        info: false,
        searching: false,
        pageLength: 10,
        retrieve: true,
        columns: [
            {"data": "serialNumber"},
            {"data": "depositType"},
            {"data": "depositAmount"},
            {"data": "depositStatus"},
            {"data": "commitDate"},
            {"data": "operateDate"}
        ],
        columnDefs: [{
            "targets": 3,
            "data": "depositStatus",
            "render": statusFormat
        }, {
            "targets": 4,
            "data": "commitDate",
            "render": dateFormat
        }, {
            "targets": 5,
            "data": "operateDate",
            "render": dateFormat
        }],
        language: language,
        drawCallback: drawCallback,
        ajax: (data, callback, settings) => ajaxCallback("deposit", data, callback)
    });
    $(`#search`).click(e => {
        table.ajax.reload();
    })
}

function initWithdrawRecord() {
    let table = $('#withdrawRecord').DataTable({
        lengthChange: false,
        ordering: false,
        info: false,
        searching: false,
        pageLength: 10,
        retrieve: true,
        columns: [
            {"data": "bankName"},
            {"data": "orderNo"},
            {"data": "amount"},
            {"data": "status"},
            {"data": "withdrawDate"},
            {"data": "payDate"}
        ],
        columnDefs: [{
            "targets": 3,
            "data": "status",
            "render": withdrawStatusFormat
        }, {
            "targets": 4,
            "data": "withdrawDate",
            "render": dateFormat
        }, {
            "targets": 5,
            "data": "payDate",
            "render": dateFormat
        }],
        language: language,
        drawCallback: drawCallback,
        ajax: (data, callback, settings) => ajaxCallback("withdraw", data, callback)
    });
    $(`#search`).click(e => {
        table.ajax.reload();
    })
}


function initAccountRecord() {
    let table = $('#accountRecord').DataTable({
        lengthChange: false,
        ordering: false,
        info: false,
        searching: false,
        pageLength: 10,
        retrieve: true,
        columns: [{"data": "serialNumber"},
            {"data": "typeName"},
            {"data": "platformName"},
            {"data": "recordAmount"},
            {"data": "showTime"}],
        columnDefs: [{
            "targets": 4,
            "render": dateFormat
        }],
        language: language,
        drawCallback: drawCallback,
        ajax: (data, callback, settings) => ajaxCallback("account", data, callback)
    });
    $(`#search`).click(e => {
        table.ajax.reload();
    })
}

function formatName(data, type, row, meta) {
    data =  data.toString().replace("Marlin", "东赢电竞");
    data =  data.toString().replace("YEB", "余额宝");
    return data.toString().replace("XJ", "东赢体育");
}

function initTransferRecord() {
    let table = $('#transferRecord').DataTable({
        lengthChange: false,
        ordering: false,
        info: false,
        searching: false,
        pageLength: 10,
        retrieve: true,
        columns: [{"data": "transferNumber"},
            {"data": "transferInfo"},
            {"data": "platformName"},
            {"data": "transferAmount"},
            {"data": "transferResult"},
            {"data": "transferTime"}],
        columnDefs: [{
            "targets": 1,
            "render": formatName
        }, {
            "targets": 2,
            "render": formatName
        }, {
            "targets": 4,
            "render": statusFormat
        }, {
            "targets": 5,
            "render": dateFormat
        }],
        language: language,
        drawCallback: drawCallback,
        ajax: (data, callback, settings) => ajaxCallback("transfer", data, callback)
    });
    $(`#search`).click(e => {
        table.ajax.reload();
    })
}


function initPromRecord() {
    let table = $('#promRecord').DataTable({
        lengthChange: false,
        ordering: false,
        info: false,
        searching: false,
        pageLength: 10,
        retrieve: true,
        columns: [{"data": "privilegeRecordNumber"},
            {"data": "bonus"},
            {"data": "bonusName"},
            {"data": "getStatus"},
            {"data": "getTime"}],
        columnDefs: [{
            "targets": 3,
            "render": promotionStatusFormat
        }, {
            "targets": 4,
            "render": dateFormat
        }],
        language: language,
        drawCallback: drawCallback,
        ajax: (data, callback, settings) => ajaxCallback("prom", data, callback)
    });
    $(`#search`).click(e => {
        table.ajax.reload();
    })
}

function initGameBetRecord() {
    let table = $('#gameBetRecord').DataTable({
        lengthChange: false,
        ordering: false,
        info: false,
        searching: false,
        pageLength: 10,
        retrieve: true,
        columns: [{"data": "privilegeRecordNumber"},
            {"data": "bonus"},
            {"data": "bonusName"},
            {"data": "getStatus"},
            {"data": "getTime"}],
        columnDefs: [{
            "targets": 3,
            "render": promotionStatusFormat
        }, {
            "targets": 4,
            "render": dateFormat
        }],
        language: language,
        drawCallback: drawCallback,
        ajax: (data, callback, settings) => ajaxCallback("gameBet", data, callback)
    });
    $(`#search`).click(e => {
        table.ajax.reload();
    })
}