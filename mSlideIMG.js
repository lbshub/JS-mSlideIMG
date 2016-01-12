/**
 * LBS mSlideIMG 顺序版
 * Date: 2014-5-11
 * ===================================================
 * opts.mslide  外围容器/滑动事件对象(一个CSS选择器)
 * opts.mcontent  内容容器/滑动切换对象(一个CSS选择器) 
 * opts.index  索引(默认0) 指定显示哪个索引的标题、内容
 * opts.navShow  是否显示导航指示容器 默认true
 * opts.navClass  导航容器的类名(默认mnav)
 * opts.current  当前项的类名(默认current)
 * opts.auto  是否自动播放 默认false
 * opts.delay  自动播放间隔时间 默认5000(毫秒) 自动播放时有效
 * opts.duration  动画持续时间 默认400(毫秒)
 * ===================================================
 **/
;(function(exports, doc) {
	'use strict';
	exports.mSlideIMG = function(opts) {
		opts = opts || {};
		if (opts.mslide === undefined) return;
		this.mslide = typeof opts.mslide === 'string' ? doc.querySelector(opts.mslide) : opts.mslide;
		if (opts.mcontent === undefined) return;
		this.mcontent = typeof opts.mcontent === 'string' ? doc.querySelector(opts.mcontent) : opts.mcontent;
		this.mcontents = this.mcontent.children;

		this.length = this.mcontents.length;
		if (this.length < 1) return;
		if (opts.index > this.length - 1) opts.index = this.length - 1;
		this.index = this.oIndex = opts.index || 0;

		this.mnav = null;
		this.mnavs = [];
		this.navShow = opts.navShow === false ? false : true;
		this.navClass = opts.navClass || 'mnav';
		this.current = opts.current || 'current';

		this.auto = !!opts.auto || false;
		this.auto && (this.delay = opts.delay || 5000);
		this.duration = opts.duration || 400;
		this.timer = null;
		this.timeid = null;
		this.touch = {};
		this.cache = {};

		this.init();
	};
	mSlideIMG.prototype = {
		init: function(opts) {
			this.navShow && this.createNav();
			this.initSet();
			this.bind();
		},
		initSet: function() {
			this.refix();
			for (var i = 0; i < this.length; i++) {
				if (this.css(this.mcontents[i], 'cssFloat') !== 'left') this.mcontents[i].style.cssFloat = 'left';
				if (this.css(this.mcontents[i], 'position') === 'absolute') this.mcontents[i].style.position = 'relative';
				this.mcontents[i].className = this.mcontents[i].className.replace(this.current, '');
			}
			this.navShow && (this.mnavs[this.index].className += ' ' + this.current);
			this.mcontents[this.index].className += ' ' + this.current;
		},
		refix: function() {
			this.width = doc.documentElement.clientWidth || doc.body.clientWidth;
			this.mcontent.style.width = this.length * this.width + 'px';
			for (var i = 0; i < this.length; i++) this.mcontents[i].style.width = this.width + 'px';
			this.setTransform(-this.index * this.width);
		},
		createNav: function() {
			this.mnav = doc.createElement('ul');
			var li = null,
				i = 0;
			for (; i < this.length; i++) {
				li = doc.createElement('li');
				// li.innerHTML = i+1;
				this.mnavs.push(li);
				this.mnav.appendChild(li);
			}
			this.mnav.className = this.navClass;
			this.mslide.appendChild(this.mnav);
		},
		bind: function() {
			var _this = this;
			this.on(this.mslide, ['touchstart', 'pointerdown', 'MSPointerDown'], function(e) {
				_this.touchStart(e);
				_this.auto && _this.stop();
			});
			this.on(this.mslide, ['touchmove', 'pointermove', 'MSPointerMove'], function(e) {
				_this.touchMove(e);
				_this.auto && _this.stop();
			});
			this.on(this.mslide, ['touchend', 'touchcancel', 'pointerup', 'pointercancel', 'MSPointerUp', 'MSPointerCancel'], function(e) {
				_this.touchEnd(e);
				_this.auto && _this.play();
			});
			this.on(this.mcontent, ['transitionEnd', 'webkitTransitionEnd', 'oTransitionEnd', 'MSTransitionEnd'], function(e) {
				_this.transitionEnd(e);
			});
			this.on(window, ['resize', 'orientationchange'], function(e) {
				_this.timer && clearTimeout(_this.timer);
				_this.timer = setTimeout(function() {
					_this.refix();
				}, 100);
			});
			this.auto && this.play();
		},
		touchStart: function(e) {
			var point = e.touches ? e.touches[0] : e;
			this.touch.x = point.pageX;
			this.touch.y = point.pageY;
			// this.touch.x = e.touches[0].pageX;
			// this.touch.y = e.touches[0].pageY;
			this.touch.time = Date.now();
			this.touch.disX = 0;
			this.touch.disY = 0;
			this.touch.fixed = '';
		},
		touchMove: function(e) {
			if (this.touch.fixed === 'up') return;
			var point = e.touches ? e.touches[0] : e;
			this.touch.disX = point.pageX - this.touch.x;
			this.touch.disY = point.pageY - this.touch.y;
			// this.touch.disX = e.touches[0].pageX - this.touch.x;
			// this.touch.disY = e.touches[0].pageY - this.touch.y;
			if (this.touch.fixed === '') {
				if (Math.abs(this.touch.disY) > Math.abs(this.touch.disX)) {
					this.touch.fixed = 'up';
				} else {
					this.touch.fixed = 'left';
				}
			}
			if (this.touch.fixed === 'left') {
				e.stopPropagation();
				e.preventDefault();
				if ((this.index === 0 && this.touch.disX > 0) || (this.index === this.length - 1 && this.touch.disX < 0)) this.touch.disX /= 4;
				this.setTransform(this.touch.disX - this.index * this.width);
			}
		},
		touchEnd: function(e) {
			if (this.touch.fixed === 'left') {
				var _this = this,
					X = Math.abs(this.touch.disX);
				if ((Date.now() - this.touch.time > 50 && X > 10) || X > this.width / 2) {
					this.touch.disX > 0 ? this.index-- : this.index++;
					this.index < 0 && (this.index = 0);
					this.index > this.length - 1 && (this.index = this.length - 1);
					if (this.index !== this.oIndex) this.update();
				}
				this.setTransition(this.duration);
				this.setTransform(-this.index * this.width);
			}
		},
		transitionEnd: function() {
			this.setTransition();
		},
		update: function() {
			if (this.navShow) {
				this.mnavs[this.index].className += ' ' + this.current;
				this.mnavs[this.oIndex].className = this.mnavs[this.oIndex].className.replace(this.current, '').trim();
			}
			this.mcontents[this.index].className += ' ' + this.current;
			this.mcontents[this.oIndex].className = this.mcontents[this.oIndex].className.replace(this.current, '').trim();
			this.oIndex = this.index;
		},
		on: function(el, types, handler) {
			if (typeof types === 'string') return el.addEventListener(types, handler, false);
			for (var i = 0, l = types.length; i < l; i++) el.addEventListener(types[i], handler, false);
		},
		css: function(o, n) {
			return getComputedStyle(o, null)[n];
		},
		setTransition: function(time) {
			time = time || 0;
			this.setStyle(this.mcontent, 'transition', 'all ' + time + 'ms');
		},
		setTransform: function(v) {
			v = v || 0;
			this.setStyle(this.mcontent, 'transform', 'translate3d(' + v + 'px,0px,0px)');
			// this.setStyle(this.mcontent, 'transform', 'translateX(' + v + 'px)');
		},
		setStyle: function(el, p, v) {
			!this.cache[el] && (this.cache[el] = {});
			!this.cache[el][p] && (this.cache[el][p] = this.prefix(p));
			el.style[this.cache[el][p] || this.prefix(p)] = v;
		},
		prefix: function(p) {
			var style = document.createElement('div').style;
			if (p in style) return p;
			var prefix = ['webkit', 'Moz', 'ms', 'O'],
				i = 0,
				l = prefix.length,
				s = '';
			for (; i < l; i++) {
				s = prefix[i] + '-' + p;
				s = s.replace(/-\D/g, function(match) {
					return match.charAt(1).toUpperCase();
				});
				if (s in style) return s;
			}
		},
		play: function() {
			if (this.length < 2) {
				this.stop();
				return;
			}
			var _this = this;

			function start() {
				_this.index++;
				_this.index > _this.length - 1 && (_this.index = 0);
				_this.setTransition(_this.duration);
				_this.setTransform(-_this.index * _this.width);
				if (_this.index !== _this.oIndex) _this.update();
				_this.timeid = setTimeout(start, _this.delay);
			}
			this.timeid = setTimeout(start, this.delay);
			// this.timeid = setInterval(function() {
			// 	_this.index++;
			// 	_this.index > _this.length - 1 && (_this.index = 0);
			// 	_this.setTransition(_this.duration);
			// 	_this.setTransform(-_this.index * _this.width);
			// 	if (_this.index !== _this.oIndex) _this.update();
			// }, this.delay);
		},
		stop: function() {
			// this.timeid && clearInterval(this.timeid);
			this.timeid && clearTimeout(this.timeid);
			this.timeid = null;
		}
	}
}(window, document));