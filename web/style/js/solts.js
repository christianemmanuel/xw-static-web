$(function () {
    var queryParam = getQueryVariable('platform') || "pt";
    initSlots(queryParam);
});

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

let gameTypes = new Map();

function initSlots(platform) {
    cached.getValueAndThen({key: "getPlatforms", get: getPlatforms, expired_value: 60 * 60})
        .then(d => {
            if (d.code == 0) {
                let html = d.data.filter(p => p.ptype == 0).filter(p => p.platformCode != 'GPS'&&p.platformCode != 'ICG'&&p.platformCode != 'YEB').map(p => {
                    gameTypes.set(p.platformCode.toLowerCase(), p.pros);
                    return ` <div class="slot-menu" onclick="initGames(${p.platformNameCn == 'AG电子' ? 5 : p.id},'${p.platformCode.toLowerCase()}')" id="${p.platformCode.toLowerCase()}">
                            <div class="platform-log logo-${p.platformNameCn == 'SW' ? "sw" : p.platformCode.toLowerCase()}"></div>
                            <span>${p.platformNameCn == 'SW' ? 'SW电子' : p.platformNameCn}</span>
                        </div>`;
                }).join("")
                $('.slot-left').html(html)
                $('#' + platform).trigger('click')
            }
        })
}

function initGames(id, platformCode) {
    $('#proId').val(id)
    $('#proCode').val(platformCode)
    initGameType(id, platformCode)
    showGames(id, platformCode);
}

function initGameType(id, platformCode) {
    let typeList = gameTypes.get(platformCode);
    let html = "<option value='all' selected>所有游戏</option>";
    html = html + typeList.map(t => `<option value="${t.proCode}">${t.proName}</option>`).join("")
    $('#gameTypes').html(html);
    $('#gameTypes').change(() => showGames(id, platformCode));
}

function searchGames() {

    let id = $('#proId').val(), code = $('#proCode').val();
    showGames(id, code, name);

}

function showGames(id, platformCode) {
    $('.slot-menuActive').removeClass('slot-menuActive')
    $('#' + platformCode).addClass('slot-menuActive');
    let select = $('#gameTypes').val();
    let gameName = $('#gameName').val()
    cached.getValueAndThen({key: "getGames" + id, get: () => getGames(id), expired_value: 60 * 60})
        .then(d => {
            if (d.code == 0) {
                let data = d.data;
                if (select != 'all') {
                    data = data.filter(g => g.proCode == select);
                }
                if (gameName) {
                    data = data.filter(g => g.gameNameCn.indexOf(gameName) >= 0);
                }
                if (data.length != 0) {
                    $('#slotGamePane').show();
                    let pageSize = data.length < 20 ? data.length : 20;
                    $('#slotGamePane').pagination({
                        dataSource: data,
                        pageSize: pageSize,
                        callback: function (data, pagination) {
                            let html = template(data, platformCode);
                            $('#dataContainer').html(html);
                            gameAnimation();
                        }
                    })

                } else {
                    $('#slotGamePane').hide();
                }
            }
        })
}

function gameAnimation() {
    var t1 = new TimelineMax()
    t1.fromTo($('.slot-panel'), 0.5, {
        scale: .5,
        opacity: 0
    }, {
        scale: 1,
        opacity: 1
    })
}

function template(game, platformCode) {

    let html = game.map(g => {
        var gameCode = g.gameCode.toLowerCase();
        return `<div class="slot-panel">
                    <a class="start-game" href="javascript:fun_openGame('${g.gameCode}',${g.platformId})"></a>
                    <img src="${cdn}/style/img/slots/${platformCode}/${gameCode}.png">
                    <span>${fun_filterTxt(g.gameNameCn)}</span>
                </div>`;
    }).join("");

    return html;
}
