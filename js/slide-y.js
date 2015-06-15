(function($) {
  'use strict';

  var $$Slider = function() {
  	return this.init.apply(this, arguments);
  };
  var _pro = $$Slider.prototype;

  _pro.defaults = {
    wrap: null,
    panel: null,
    steps: 0,
    curIndex: 0,
    maxPage : 0,
    duration: 300,
    onChangeStart: function() {},
    onChange: function() {},
    onStart: function() {}
  };

  _pro.init = function(options) {
  	options = options || {};
    $.extend(this, this.defaults, options);

    this.findEl();
    this.reset();
    this.bindEvents();
  };

  _pro.findEl = function() {
    this.wrap = $(this.wrap);
    if(!this.wrap.length) return;

    this.panel = $(this.panel) || this.wrap.children().first();
    if(!this.panel.length) return;

    this.panels = this.panel.children();
  };

  _pro.reset = function() {
  	// 每一页的宽度
    this.steps = this.steps || this.panels.eq(0).height();
    var max = this.maxPage = this.panel.children().length;
    this.panels.each(function() {
      $(this).css('z-index', max - $(this).index());
    });
  };

  _pro.bindEvents = function() {
    var el = this.panel.get(0);
    el.addEventListener("touchstart", this.__touchStart.bind(this), !1);
    el.addEventListener("touchmove", this.__touchMove.bind(this), !1);
    el.addEventListener("touchend", this.__touchEnd.bind(this), !1);
    el.addEventListener("webkitTransitionEnd", this.__transitionEnd.bind(this), !1);
  };

  _pro.__touchStart = function(event) {
    if (this.delta) {
      return;
    }

    var touch = event.touches[0];
    this._movestart = undefined; 
    this._disX = 0;
    this._coord = {x: touch.pageX,y: touch.pageY};
  };

  _pro.__touchMove = function(event) {
    if (this.delta) {
      return;
    }

    if (!(event.touches.length > 1 || event.scale && 1 !== event.scale)) {
      var touch = event.touches[0];
      var distX = this._disX = touch.pageY - this._coord.y; 

      // 防止来回滚动过头
      if (this._coord.range) {
        distX = Math.min(this._coord.range[1], Math.max(this._coord.range[0], distX));
      }

      if (typeof this._movestart == "undefined") { 
        // 用户滑动的角度<45度, 滑动有效
        this._movestart = !!(Math.abs(distX) >= Math.abs(touch.pageX - this._coord.x));

        if(this.__isSlideToEdge(distX)) {
          this._movestart = !1;
        }

        this._coord.range = distX > 0 ? [0, this.steps] : [-this.steps, 0];
        
        if(this._movestart) {
          this.onStart();
        }
      }

      if(this._movestart) {
        event.preventDefault();
        if(Math.abs(distX) <= this.steps) {
          // this.setCoord(distX);
          this._disX = distX;
        }
      } 
    }
  };

  _pro.__touchEnd = function() {
    if (this.delta) {
      return;
    }

    if (this._movestart && Math.abs(this._disX) > 0) {
      this._movestart = undefined;
      this.delta = this._disX < 0 ? 1 : -1;
      this.slideTo(this.delta + this.curIndex);
    }
  };

  _pro.__transitionEnd = function() {
    // clear
    var style = this.panels[this.delta > 0 ? this.curIndex : this.nextIndex].style;
    style.webkitTransitionDuration 
      = style.MozTransitionDuration 
      = style.msTransitionDuration 
      = style.OTransitionDuration 
      = style.transitionDuration 
      = '0ms';

    // 动画结束开始更新index
    this.curIndex = this.nextIndex;
    // trigger
    this.delta && this.onChange(this.delta, this.curIndex, this.panels);
    this.delta = 0;
  };

  _pro.__isSlideToEdge = function(distX) {
    return (this.curIndex == 0 && distX > 0) || (this.curIndex == (this.maxPage - 1) && distX < 0);
  };

  _pro.setCoord = function(distX) {
    // scroll down
    if (distX > 0) {
      this.panels.eq(this.curIndex - 1).css("transform", "translate3d(0px," + (-this.steps + distX) +  "px,0px)");
    } else {
      this.panels.eq(this.curIndex).css("transform", "translate3d(0px," + distX +  "px,0px)");
    }
  };

  _pro.slideTo = function(index) {
    var pos = this.delta > 0 ? this.curIndex : index;
    var  style = this.panels[pos].style;
    style.webkitTransitionDuration 
      = style.MozTransitionDuration 
      = style.msTransitionDuration 
      = style.OTransitionDuration 
      = style.transitionDuration 
      = this.duration + "ms";

    this.onChangeStart(this.delta, this.curIndex, this.panels);
    this.setIndex(index);
  };

  _pro.setIndex = function(index) {
    var direction = this.delta > 0 ? -1 : 1;
    this.setCoord(direction * this.steps);
    this.nextIndex = index;
    return this;
  };

  $.SliderY = $$Slider;
})($);