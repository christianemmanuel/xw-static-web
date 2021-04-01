$(function() {
    init();
});

function init() {

    initInbox()
    $('#inboxMenu').on('shown.bs.tab', function (e) {
        initInbox();
    })
    $('#outboxMenu').on('shown.bs.tab', function (e) {
        initOutbox();
    })


    $('#sendMail').parsley(DEFAULT_PARSLEY_CONFIG)
    $('#sendMail').submit(e => {
        e.preventDefault();
        let formData = toJsonObject($(e.target).serializeArray());
        let btn = $('#sendBtn')
        let text = btn.html();
        buttonDisable(btn);
        post(`/session/message/accountMessage/write`, formData).done(d => {
            if (d.code == 0) {
                success('提交成功').then(() => {
                    $(e.target)[0].reset();
                    $('#outboxMenu').tab('show')
                });
            } else {
                error(d.message)
            }
        }).always(() => {
            buttonEnable(btn, text);
        });
    });
}

let _messages;

function initInbox() {
    $('#inbox').pagination({
        dataSource: function (done) {
            let page = this.pageNumber;
            getMessage(page).done(d => {
                if (d.code == 0) {
                    done(d.data.list);
                }
            })
        },
        pageSize: 6,
        callback: function (data, pagination) {
            _messages = data
            let html = template(data);
            $('#inboxContainer').html(html);

        }
    })
}

function initOutbox() {
    $('#outbox').pagination({
        dataSource: function (done) {
            let page = this.pageNumber;
            get('/session/message/accountMessage/pageOutbox', {'pageNo': page}).done(d => {
                if (d.code == 0) {
                    done(d.data.list);
                }
            })
        },
        pageSize: 6,
        callback: function (data, pagination) {
            _messages = data
            let html = outTemplate(data);
            $('#outboxContainer').html(html);
        }
    })
}

function outTemplate(messages) {
    let html = messages.map(m => {
        return `<tr onclick="readMsg(${m.id},'outbox')">
                        <td class="title"><i class="remixicon-volume-up-fill "></i>${m.title}</td>
                        <td class="context">${m.content}</td>
                        <td class="date">${moment(m.sendTime).format('YYYY-MM-DD hh:mm:ss')}</td>
                    </tr>`;
    }).join("");
    return html;
}

var messageDetailStatus = ['', '未读', '已读'];
function template(messages) {
    let html = messages.map(m => {

        return `<tr onclick="readMsg(${m.id},'inbox')">
                        <td class="title"><i class="remixicon-volume-up-fill ${m.isRead == 1 ? 'text-success' : ''}"></i>${m.title}</td>
                        <td class="context">${m.content}</td>
                        <td class="date">${moment(m.sendTime).format('YYYY-MM-DD hh:mm:ss')}</td>
                        <td>${messageDetailStatus[m.isRead]}</td>
                    </tr>`;
    }).join("");
    return html;
}

function readMsg(id,type) {
    let message = _messages.filter(m => m.id == id), callback;
    if (message.length > 0) {
        message = message[0];
    }
    if(type == 'inbox' && message.isRead == 1){
            callback = initInbox;
    }
    showMessage(id, message.title, message.content, message.sendTime, callback)
}

function readAllMessage() {
    let unRead = _messages.filter(m => m.isRead == 1)
    if (unRead.length > 0) {
        post('/session/message/readAll').then((d) => {
            if (d.code == 0) {
                initInbox();
            }
        })
    }
}

function deleteAllMessage() {
    if (_messages.length > 0) {
        post('/session/message/deleteAll').then((d) => {
            if (d.code == 0) {
                initInbox();
            }
        })
    }
}
