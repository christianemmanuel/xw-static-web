(function (win, doc) {
  // ### 1、通用方法

  var is = {

    str: function (a) {
      return typeof a === 'string';
    },
    und: function (a) {
      return a === void 0;
    },
    bol: function (a) {
      return typeof a === 'boolean';
    },
    true: function (a) {
      return a === true;
    },
    num: function (a) {
      return typeof a === 'number';
    },
    null: function (a) {
      return a === null;
    },
    fun: function (a) {
      return typeof a === 'function';
    },
    arr: function (a) {
      return Array.isArray(a);
    },
    obj: function (a) {
      return (a !== null && typeof a === 'object' && 'constructor' in a && a.constructor === Object);
    },
    emptyObj: function (a) {
      return this.obj(a) && a.length === 0;
    },
    emptyArr: function (a) {
      return this.arr(a) && a.length === 0;
    },

  }

  // 生成唯一标识符
  function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [],
      i;
    radix = radix || chars.length;

    if (len) {
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
      var r;
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random() * 16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }
    return uuid.join('');
  }

  // 判断数据类型
  function typeOf(d) {
    return Object.prototype.toString.call(d).slice(8, -1);
  }

  // 转成数组
  function toArray(el) {
    return [].slice.call(el);
  }

  // 获取HTMLElement元素的类名选择器
  function getClassSelector(el) {
    var arr = this.toArray(el.classList);
    return is.emptyArr(arr) ? '' : '.' + arr.join('.');
  }

  // 向上遍历（查找指定父级）closest
  function closest(ele, tar) {
    var _this = this;
    if (!Element.prototype.isPrototypeOf(ele)) {
      throw new TypeError(ele + 'is not a Element!');
    }
    var elArr = (function () {
      if (tar instanceof HTMLElement) return [tar];
      try {
        tar = doc.querySelectorAll(tar);
      } catch (err) {}
      var tarType = _this.typeOf(tar),
        tarTypeOptions = [
          'NodeList',
          'HTMLCollection',
          'Array',
        ];
      if (tarTypeOptions.indexOf(tarType) > -1) return _this.toArray(tar);
    })();
    do {
      if (elArr.indexOf(ele) > -1) return ele;
      ele = ele.parentElement;
    } while (ele !== null);
    return null;
  }

  // 扁平化数组：即Array.prototype.flat
  function flat(arr, d) {
    var _this = this;
    d = d || 1;
    return d > 0 ?
      arr.reduce(function (prev, now) {
        return prev.concat(Array.isArray(now) ? _this.flat(now, d - 1) : now);
      }, []) :
      arr.slice();
  }

  // 对数值数组：即Object.values
  function values(obj) {
    if (obj !== Object(obj)) throw new TypeError(obj + 'is a non-object');
    return Object.keys(obj).map(function (e) {
      return obj[e];
    });
  }

  // transitionend兼容支持
  function getTransitionend() {
    var el = doc.createElement('div');
    var transitions = {
      'transition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
    }
    for (var attr in transitions) {
      if (!is.und(el.style[attr])) return transitions[attr];
    }
  }

  // 即Array.prototype.find
  function find(arr, callback) {
    for (var i = 0, len = arr.length; i < len; i++) {
      var curItem = arr[i];
      if (callback(curItem, i, arr)) return curItem;
    }
  }

  function getPageVisibility() {
    var hiddenArr = [
        'hidden',
        'webkitHidden',
        'mozHidden',
      ],
      visibilityStateArr = [
        'visibilityState',
        'webkitVisibilityState',
        'mozVisibilityState',
      ];
    var values = [hiddenArr, visibilityStateArr].map(function (e) {
      return find(e, function (e) {
        return e in doc;
      });
    });
    return {
      hidden: values[0],
      visibilityState: values[1],
    }
  }

  // 获取元素的计算属性，参数：el元素、css属性、pseudoEl伪元素
  function computedCss(el, css, pseudoEl) {
    pseudoEl = pseudoEl || null;
    return win.getComputedStyle(el, pseudoEl)[css];
  }

  // 获取元素translate值
  function getTranslate(el) {
    if (!el instanceof Element) {
      throw new TypeError(el + 'is not a Element');
    }
    var transformArr = this.computedCss(el, 'transform').replace(/\(|\)/g, '').split(','),
      isThreeD = transformArr[0].indexOf('3d') > -1,
      translateArr = isThreeD ? transformArr.slice(12, 15) : transformArr.slice(4);
    var result = {
      x: 0,
      y: 0,
      z: 0,
    };
    Object.keys(result).forEach(function (key, i) {
      // 对于transform为none未设置和translateY没有的情况，自动补充为0
      result[key] = parseFloat(translateArr[i]) || 0;
    });
    return result;
  }

  function extend(tarObj, initObj) {
    is.und(tarObj) && (tarObj = {});
    is.und(initObj) && (initObj = {});
    var _this = this;
    Object.keys(initObj).forEach(function (key) {
      if (is.und(tarObj[key])) {
        tarObj[key] = initObj[key];
      } else if (is.obj(initObj[key]) && is.obj(tarObj[key]) && Object.keys(initObj[key]).length > 0) {
        _this.extend(tarObj[key], initObj[key]);
      }
    });
  }

  var _ = {
    uuid: uuid,
    flat: flat,
    find: find,
    values: values,
    typeOf: typeOf,
    extend: extend,
    closest: closest,
    toArray: toArray,
    computedCss: computedCss,
    getTranslate: getTranslate,
    getClassSelector: getClassSelector,
    pageVisibility: getPageVisibility(),
    transitionend: getTransitionend(),
  }


  // ### 2、参数中CSS样式对象的解析方法和类

  // 2.1 处理CSS样式对象工具类
  var CssUtils = {

    // 将小驼峰形式转成-连接符形式
    toConnectorForm: function (prop) {
      var rgep = /[A-Z]/g,
        res = null,
        matchedChar = '',
        replacedChar = function () {
          return '-' + matchedChar.toLowerCase();
        };
      while ((res = rgep.exec(prop)) !== null) {
        matchedChar = res[0];
        prop = prop.replace(matchedChar, replacedChar());
      };
      return prop;
    },

    // 将CSS对象的所有属性转成-连接符形式
    normalizeCssObj: function (cssObj) {
      var _this = this;
      Object.keys(cssObj).forEach(function (key) {
        var newKey = _this.toConnectorForm(key);
        if (newKey !== key) {
          cssObj[newKey] = cssObj[key];
          delete cssObj[key];
        }
      });
    },

    // 删除CSS对象的无用属性
    removeUselessKey: function (cssObj) {
      Object.keys(cssObj).forEach(function (key) {
        is.und(cssObj[key]) && (delete cssObj[key]);
      });
    },

    // 页面中添加CSS样式新规则，参数：[cssText,cssText,...]数组
    insertCssText: function (cssTextArr) {
      var getStyleSheets = function (sheets) {
          return [].slice.call(sheets).filter(function (e) {
            return !e.disabled === true && e.ownerNode.tagName.toLowerCase() === 'style';
          });
        },
        sheets = getStyleSheets(doc.styleSheets),
        lastSheet = sheets[sheets.length - 1];

      if (is.und(lastSheet)) {
        var s = doc.createElement('style');
        doc.head.appendChild(s);
        sheets = getStyleSheets(doc.styleSheets);
        lastSheet = sheets[sheets.length - 1];
      }
      cssTextArr.forEach(function (e) {
        try {
          lastSheet.insertRule(e, lastSheet.cssRules.length);
        } catch (err) {
          console.log(err)
        }
      });
    },

    // 获取cssText样式规则
    cssText: function (cssObj, key) {
      var value = Object.keys(cssObj).map(function (key) {
        return key + ':' + cssObj[key] + '!important;';
      }).join('');
      return key + '{' + value + '}';
    },

  }

  // 2.2 CssParser解析类

  function CssParser(cssParams) {
    var _this = this;

    this.cssParams = cssParams;
    this.cssParamsType = _.typeOf(this.cssParams);

    // 将要执行的cssParams函数形式的属性或其本身
    this.willExeCssFn = this.cssParamsType === 'Function' && this.cssParams;

    // 获取计算后的css对象
    this.computedCssObj = (function () {
      var typeOptions = ['Function', 'Object'],
        computedMethodFn = [_this.exeCssFnSelf, _this.generateCssObj],
        typeIndex = typeOptions.indexOf(_this.cssParamsType);
      return function (coord, absCoord, index) {
        return computedMethodFn[typeIndex].apply(_this, arguments);
      }
    })();

    this.init();
  }

  // 创建CssParser原型对象，并将自定义的css工具方法添加至其原型
  var CssParserProto = Object.create(CssUtils);

  // 初始化
  CssParserProto.init = function () {
    if (is.obj(this.cssParamsType)) {
      this.initCssParams();
    }
  };

  // 执行css对象中的函数或其本身
  CssParserProto.exeCssFnSelf = function (coord, absCoord, index) {
    var cssObj = this.willExeCssFn(coord, absCoord, index);
    this.normalizeCssObj(cssObj); // 再次标准化该css对象
    return cssObj;
  };

  // 初始化cssParams对象
  CssParserProto.initCssParams = function () {
    var type = this.cssParamsType,
      cssParams = this.cssParams;
    // 移除cssParams对象的无用属性
    this.removeUselessKey(cssParams);
    // 将cssParams对象属性名转成'-'连接符形式
    this.normalizeCssObj(cssParams);
  };

  // 生成计算后的css对象
  CssParserProto.generateCssObj = function (coord, absCoord, index) {
    var _this = this,
      cssObj = {},
      cssParams = this.cssParams;
    Object.keys(cssParams).forEach(function (key) {
      var item = cssParams[key];
      // 如果是函数，就获取其返回结果
      if (is.fun(item)) {
        _this.willExeCssFn = item;
        cssObj[key] = _this.willExeCssFn(coord, absCoord, index);
        return;
      }
      cssObj[key] = item;
    });
    return cssObj;
  };

  // 将CssParserProto绑定为CSSParser的原型
  CssParser.prototype = CssParserProto;


  // ### 3、轮播图主体代码部分

  // 初始化每张卡片要填入的css styleSheet的样式规则
  function initStyleRules() {
    var empile = this,
      params = empile.params,
      slides = empile.slides,
      slidesLen = slides.length,
      mediant = slides.mediant,
      dataAttrArr = slides.dataAttrArr,
      uidKey = slides.dataSlideId; // 卡片的'data-slide-id'属性名

    // 新建一个css规则解析类
    var cssParser = new CssParser(params.css),
      cssTextArr = [];

    // 插入需要计算的cssParams样式
    for (var index = 0; index < slidesLen; index++) {
      var coord = index - mediant, // 坐标系索引
        absCoord = Math.abs(coord); // 坐标系索引绝对值

      var uidVal = dataAttrArr[index].dataSlideId, // 卡片'data-slide-id'属性值
        selector = '[' + uidKey + '="' + uidVal + '"]'; // css规则选择器

      var cssObj = cssParser.computedCssObj(coord, absCoord, index), // 获取计算后的CssParams
          cssText = cssParser.cssText(cssObj, selector); // 生成cssText内容
      cssTextArr.push(cssText);
    }

    cssParser.insertCssText(cssTextArr); // 统一将cssText插入styleSheets中
  }


  // 初始化slides配置信息
  function initSlidesInfo() {
    var empile = this,
      wrapper = empile.wrapper,
      isClickSlide = empile.params.isClickSlide,
      list = _.toArray(wrapper.children),
      length = list.length,
      // 如11和12张卡片，中间卡片的左边均显示5张，即mediant中间索引为5
      mediant = Math.floor((length - 1) / 2),
      dataSlideId = 'data-slide-id',
      dataSlideIndex = 'data-slide-index',
      clickable = isClickSlide,
      dataAttrArr = list.map(function (item, index) {
        return {
          dataSlideId: _.uuid(14, 16),
          dataSlideIndex: index,
        }
      });

    return {
      // 继续前面的例子。如果要让第1张在中间显示，即它在新数组中的索引时5
      list: list.splice(length - mediant).concat(list),
      length: length,
      mediant: mediant,
      dataSlideId: dataSlideId,
      dataSlideIndex: dataSlideIndex,
      clickable: clickable,
      dataAttrArr: dataAttrArr,
    }
  }


  // slideTo
  function slideToPrev() {
    var empile = this,
      dataAttrArr = empile.slides.dataAttrArr;
    dataAttrArr.push(dataAttrArr.shift());
    empile.updateSlideDataAttr();
  }

  function slideToNext() {
    var empile = this,
      dataAttrArr = empile.slides.dataAttrArr;
    dataAttrArr.unshift(dataAttrArr.pop());
    empile.updateSlideDataAttr();
  }

  function slideToSlide(target) {
    var empile = this,
      slides = empile.slides,
      mediant = slides.mediant,
      dataAttrArr = slides.dataAttrArr;
    var index = +target.getAttribute(slides.dataSlideIndex),
      diffI = mediant - index;
    slides.dataAttrArr = dataAttrArr.splice(diffI).concat(dataAttrArr);
    empile.updateSlideDataAttr();
  }

  var slideTo = {
    slideToPrev: slideToPrev,
    slideToNext: slideToNext,
    slideToSlide: slideToSlide,
  }


  function onTransitionEnd() {
    var empile = this,
      waitForTransition = empile.params.waitForTransition,
      firstSlidesList = empile.slides.list[0];
    var transitionend = _.transitionend;
    firstSlidesList.addEventListener(transitionend, function () {
      waitForTransition && (empile.allowTransition = true);
      empile.autoplay.init();
    });
  }
  var fade = {
    onTransitionEnd: onTransitionEnd,
  }

  // update
  function updateSlideDataAttr() {
    var empile = this,
      slides = empile.slides,
      dataAttrArr = slides.dataAttrArr;
    slides.list.forEach(function (el, index) {
      el.setAttribute(slides.dataSlideId, dataAttrArr[index].dataSlideId);
      el.setAttribute(slides.dataSlideIndex, dataAttrArr[index].dataSlideIndex);
    });
  }
  var update = {
    updateSlideDataAttr: updateSlideDataAttr,
  }


  var prototypes = {
    slideTo: slideTo,
    update: update,
    fade: fade,
  }


  // Autoplay
  var Autoplay = {

    init: function () {
      var empile = this,
        autoplay = empile.params.autoplay,
        delay = 0;
      // 过滤筛选autoplay
      if (is.bol(autoplay)) {
        is.true(autoplay) && (delay = 4000);
      } else if (is.obj(autoplay)) {
        if (is.und(autoplay.delay)) throw new Error('autoplay.delay is not defined!')
        autoplay.delay = delay = parseFloat(autoplay.delay);
      }
      empile.params.autoplay = {
        delay: delay
      }

      // 如果delay时间是有效的，就准许自动轮播
      if (is.num(delay) && delay !== 0) {
        setTimeout(function () {
          empile.autoplay.onVisibilityChange();
        }, 0);

        return function () {
          empile.autoplay.run();
        }
      }
      return function () {}
    },

    run: function () {
      var empile = this,
        delay = empile.params.autoplay.delay;
      empile.autoplay.stop();
      empile.autoplay.timer = setInterval(function () {
        empile.slideToNext();
      }, delay);
    },

    stop: function () {
      var empile = this,
        delay = empile.params.autoplay.delay;
      if (delay) {
        return function () {
          clearInterval(empile.autoplay.timer);
          empile.autoplay.timer = void 0;
        }
      }
      return function () {};
    },

    onVisibilityChange: function () {
      var empile = this,
        autoplay = empile.params.autoplay,
        docHiddenOff = autoplay.docHiddenOff,
        pageHiddenAttr = _.pageVisibility.hidden,
        delay = 0;
      // 过滤筛选docHiddenOff
      if (is.bol(docHiddenOff)) {
        if (is.true(docHiddenOff)) delay = 2000;
        else return;
      } else if (is.obj(docHiddenOff)) {
        if (is.und(docHiddenOff.delay)) throw new Error('docHiddenOff.delay is not defined!');
        docHiddenOff.delay = delay = parseFloat(docHiddenOff.delay);
      }
      autoplay.docHiddenOff = {
        delay: delay
      }

      return function () {
        var autoplay = empile.autoplay,
          visiableTimer = null,
          isPageHidden = false,
          hiddenFn = delay === 0 ? function () {
            autoplay.stop()
          } : function () {
            isPageHidden = true;
            visiableTimer = setTimeout(function () {
              autoplay.stop();
            }, delay);
          },
          visiableFn = delay === 0 ? function () {
            clearTimeout(visiableTimer);
            autoplay.init();
          } : function () {
            if (isPageHidden) {
              isPageHidden = false;
              clearTimeout(visiableTimer);
              autoplay.init();
            }
          };
        doc.addEventListener('visibilitychange', function () {
          var pageHidden = doc[pageHiddenAttr];
          if (pageHidden) hiddenFn();
          else visiableFn();
        });
      }
    },

  }

  // Click
  var Click = {

    init: function () {
      var empile = this;
      empile.click.getCanClickEles();
      if (is.emptyArr(empile.click.canClickEles)) return;
      empile.click.run();
    },

    run: function () {
      var empile = this,
        wrapper = empile.wrapper,
        canClickEles = empile.click.canClickEles,
        slides = empile.slides,
        mediant = slides.mediant,
        dataSlideIndex = slides.dataSlideIndex,
        params = empile.params,
        waitForTransition = params.waitForTransition,
        navigation = params.navigation,
        transitionDuration = parseFloat(_.computedCss(slides.list[0], 'transition-duration')); // 过渡时长

      wrapper.parentElement.addEventListener('click', function (ev) {
        var willTar = _.find(canClickEles, function (e) {
          return e === _.closest(ev.target, e);
        });

        // 如果点击的不是目标元素或者目标元素是中间那张卡片，就不执行切换效果。
        if (is.und(willTar) || willTar.getAttribute(dataSlideIndex) == mediant) return;
        // 如果需要等待过渡完成并且过渡时间不为0
        if (waitForTransition && !!transitionDuration) {
          if (!empile.allowTransition) return
          empile.allowTransition = false;
        }
        
        empile.autoplay.stop();
        if (willTar === navigation.prevEl) {
          empile.slideToPrev();
        } else if (willTar === navigation.nextEl) {
          empile.slideToNext();
        } else {
          empile.slideToSlide(willTar);
        }
        
      });
    },

    getCanClickEles: function () {
      var empile = this,
        navigation = empile.params.navigation,
        slides = empile.slides,
        canClickEles = empile.click.canClickEles;
      Object.keys(navigation).forEach(function (e) {
        !is.null(navigation[e]) && canClickEles.push(navigation[e]);
      });
      is.true(slides.clickable) && canClickEles.push(slides.list);
      empile.click.canClickEles = _.flat(canClickEles, Infinity);
    },

  }


  var Empile = function (wrapper, params) {
    this.wrapper = wrapper;

    var defaultParams = {
      isClickSlide: false,
      waitForTransition: false,
      autoplay: false,
      navigation: {
        nextEl: null,
        prevEl: null,
      },
      css: {},
    }
    _.extend(params, defaultParams); // 存储修正后的params
    this.params = params;

    if(this.params.waitForTransition) this.allowTransition = true;

    _.extend(this, {
      slides: initSlidesInfo.call(this), // 存储slide卡片信息
      autoplay: {
        onVisibilityChange: Autoplay.onVisibilityChange.call(this),
        init: Autoplay.init.call(this),
        run: Autoplay.run.bind(this),
        stop: Autoplay.stop.call(this),
      },
      click: {
        canClickEles: [],
        init: Click.init.bind(this),
        run: Click.run.bind(this),
        getCanClickEles: Click.getCanClickEles.bind(this),
      },
    });

    Object.keys(prototypes).forEach(function (group) {
      Object.keys(prototypes[group]).forEach(function (method) {
        !Empile.prototype[method] && (Empile.prototype[method] = prototypes[group][method]);
      });
    });

    this.init();
  }

  Empile.prototype.init = function () {
    var empile = this;
    initStyleRules.call(empile);
    empile.updateSlideDataAttr(); // 给卡片设置所需的data-属性
    empile.autoplay.init(); // 初始化定时器
    empile.click.init(); // 初始化点击事件
    empile.onTransitionEnd(); // 初始化transitionend监听
  }

  win.CssParser = CssParser;
  win.Empile = Empile;

})(window, document);