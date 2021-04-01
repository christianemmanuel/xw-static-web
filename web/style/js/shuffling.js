(function (doc) {

    var $ = function (el) {
        try {
            var item = doc.querySelectorAll(el);
            return item.length == 1 ? item[0] : item;
        } catch (err) {
            console.log(err)
        }
    }

    var info = console.info;

    var empile1 = new Empile($('.demo1>.containers'), {
        autoplay: {
            delay: 5000,
            docHiddenOff: true,
        },
        waitForTransition: true,
        isClickSlide: true,
        navigation: {
            nextEl: $('.demo1 .btn-right'),
            prevEl: $('.demo1 .btn-left'),
        },
        css: function (coord, absCoord) {
            var zIndex = 100 - absCoord,
                opacity = Math.pow(.92, absCoord).toFixed(3),
                scale = 'scale(' + Math.pow(.9, absCoord).toFixed(2) + ')',
                translateX = 'translateX(' + 100 * coord + 'px)';

            var transform = [translateX, scale].join(' ');
            return {
                zIndex: zIndex,
                opacity: opacity,
                transform: transform,
            }
        },

    });
    info(empile1)



})(document);