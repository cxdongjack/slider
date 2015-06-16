(function($) {
  'use strict';

  var $$Slider = function() {
  	return this.init.apply(this, arguments);
  };
  var _pro = $$Slider.prototype;

  _pro.defaults = {
    container: null,
    wrap: null,
    panel: null,
    steps: 0,
    curIndex: 0,
    maxPage : 0,
    duration: 200,
    onChange: function() {},
    onChangeStart: function() {},
    onStart: function() {}
  };

  _pro.init = function(options) {
  	options = options || {};
    $.extend(this, this.defaults, options);

    this.findEl();
    this.setMax();
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
    this.steps = this.steps || this.panels.eq(0).width();
    // 正常情况下, panel的with应该通过遍历this.panels来计算
    // 但是由于reader在实例化得时候, panels里面只有一个, 因此此处直接设置宽度
    this.panels.css('width', this.steps);
    this.panel.css('width', this.steps * this.maxPage);
  };

  _pro.bindEvents = function() {
    var el = this.panel.get(0);
    el.addEventListener("touchstart", this.__touchStart.bind(this), !1);
    el.addEventListener("touchmove", this.__touchMove.bind(this), !1);
    el.addEventListener("touchend", this.__touchEnd.bind(this), !1);
    el.addEventListener("webkitTransitionEnd", this.__transitionEnd.bind(this), !1);
  };

  _pro.__touchStart = function(event) {
    var touch = event.touches[0];
    this._movestart = undefined; 
    this._disX = 0;
    this._coord = {x: touch.pageX,y: touch.pageY};
  };

  _pro.__touchMove = function(event) {
    if (!(event.touches.length > 1 || event.scale && 1 !== event.scale)) {
      var touch = event.touches[0];
      var distX = this._disX = touch.pageX - this._coord.x; 

      if (typeof this._movestart == "undefined") { 
        // 用户滑动的角度<45度, 滑动有效
        this._movestart = !!(Math.abs(distX) >= Math.abs(touch.pageY - this._coord.y));

        if(this.__isSlideToEdge(distX)) {
          this._movestart = !1;
        }
        
        if(this._movestart) {
          this.onStart();
        }
      }

      if(this._movestart) {
        event.preventDefault();
        if(Math.abs(distX) <= this.steps) {
          // this.setCoord(- this.curIndex * this.steps + distX);
          this._disX = distX;
        }
      } 
    }
  };

  _pro.__touchEnd = function() {
    if (this._movestart && Math.abs(this._disX) > 10) {
      this.delta = this._disX < 0 ? 1 : -1;
      // this.slideTo(this.delta + this.curIndex);
      this.deltaSlide(this.delta);
	  event.preventDefault();
    }
  };

  _pro.__transitionEnd = function() {
    var style = this.panel[0].style;
    style.webkitTransitionDuration 
      = style.MozTransitionDuration 
      = style.msTransitionDuration 
      = style.OTransitionDuration 
      = style.transitionDuration 
      = "0ms";

    // trigger
    this.delta && this.onChange(this.delta, this.curIndex, this.panels);
    this.delta = 0;
  };

  _pro.__isSlideToEdge = function(distX) {
    return (this.curIndex == 0 && distX >= 0) || (this.curIndex == (this.maxPage - 1) && distX <= 0);
  };

  _pro.setCoord = function(distX) {
    this.panel.css("-webkit-transform", "translate3d(" + distX +  "px,0px,0px)");
  };

  _pro.deltaSlide = function(delta) {
    this.slideTo(this.curIndex + delta);
  };

  _pro.slideTo = function(index) {
    var  style = this.panel[0].style;
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
    this.curIndex = index;
    this.setCoord(-(this.curIndex) * this.steps);
    return this;
  };

  _pro.setMax = function() {
    this.maxPage = this.panel.children().length;
    return this;
  };

  $.Slider = $$Slider;
  // return $$Slider;
})($);