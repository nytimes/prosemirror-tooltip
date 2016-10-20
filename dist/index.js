module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/* eslint-disable */
	var prefix = "ProseMirror-tooltip";

	var getCenterPointsOfBoxSides = function getCenterPointsOfBoxSides(box) {
	  return {
	    top: {
	      top: box.top,
	      left: box.right - box.width / 2
	    },
	    right: {
	      top: box.bottom - box.height / 2,
	      left: box.right
	    },
	    bottom: {
	      top: box.bottom,
	      left: box.right - box.width / 2
	    },
	    left: {
	      top: box.bottom - box.height / 2,
	      left: box.left
	    }
	  };
	};

	// ;; Used to show tooltips. An instance of this class is a persistent
	// DOM node (to allow position and opacity animation) that can be
	// shown and hidden. It is positioned relative to a position (passed
	// when showing the tooltip), and points at that position with a
	// little arrow-like triangle attached to the node.

	var Tooltip = function () {
	  // :: (DOMNode, union<string, Object>)
	  // Create a new tooltip that lives in the wrapper node, which should
	  // be its offset anchor, i.e. it should have a `relative` or
	  // `absolute` CSS position. You'll often want to pass an editor's
	  // [`wrapper` node](#ProseMirror.wrapper). `options` may be an object
	  // containg a `direction` string and a `getBoundingRect` function which
	  // should return a rectangle determining the space in which the tooltip
	  // may appear. Alternatively, `options` may be a string specifying the
	  // direction. The direction can be `"top"`, `"bottom"`, `"right"`,
	  // `"left"`, or `"center"`. In the latter case, the tooltip has no arrow
	  // and is positioned centered in its wrapper node.
	  function Tooltip(wrapper, options) {
	    var _this = this;

	    _classCallCheck(this, Tooltip);

	    this.wrapper = wrapper;
	    this.options = typeof options == "string" ? { direction: options } : options;
	    this.dir = this.options.direction || "top";
	    this.pointer = wrapper.appendChild(elt("div", { class: prefix + "-pointer-" + this.dir + " " + prefix + "-pointer" }));
	    this.pointerWidth = this.pointerHeight = null;
	    this.dom = wrapper.appendChild(elt("div", { class: prefix }));
	    this.dom.addEventListener("transitionend", function () {
	      if (_this.dom.style.opacity == "0") _this.dom.style.display = _this.pointer.style.display = "";
	    });

	    this.isOpen = false;
	    this.lastLeft = this.lastTop = null;
	  }

	  // :: ()
	  // Remove the tooltip from the DOM.


	  _createClass(Tooltip, [{
	    key: "detach",
	    value: function detach() {
	      this.dom.parentNode.removeChild(this.dom);
	      this.pointer.parentNode.removeChild(this.pointer);
	    }
	  }, {
	    key: "getSize",
	    value: function getSize(node) {
	      var wrap = this.wrapper.appendChild(elt("div", {
	        class: prefix,
	        style: "display: block; position: absolute"
	      }, node));
	      var size = { width: wrap.offsetWidth + 1, height: wrap.offsetHeight };
	      wrap.parentNode.removeChild(wrap);
	      return size;
	    }

	    // :: (DOMNode, ?{left: number, top: number})
	    // Make the tooltip visible, show the given node in it, and position
	    // it relative to the given position. If `pos` is not given, the
	    // tooltip stays in its previous place. Unless the tooltip's
	    // direction is `"center"`, `pos` should definitely be given the
	    // first time it is shown.

	  }, {
	    key: "open",
	    value: function open(_ref) {
	      var _this2 = this;

	      var tooltipContent = _ref.tooltipContent;
	      var coords = _ref.coords;
	      var element = _ref.element;
	      var className = _ref.className;

	      var tooltipPossibleAnchorPoints = void 0;
	      if (coords) {
	        tooltipPossibleAnchorPoints = getCenterPointsOfBoxSides({
	          top: coords.top,
	          left: coords.left,
	          right: coords.left,
	          bottom: coords.top,
	          width: 0,
	          height: 0
	        });
	      } else if (element) {
	        tooltipPossibleAnchorPoints = getCenterPointsOfBoxSides(element.getBoundingClientRect());
	      }
	      // let left = this.lastLeft = coords ? coords.left : this.lastLeft
	      // let top = this.lastTop = coords ? coords.top : this.lastTop

	      var size = this.getSize(tooltipContent);

	      var around = this.wrapper.getBoundingClientRect();

	      // Use the window as the bounding rectangle if no getBoundingRect
	      // function is defined
	      var boundingRect = (this.options.getBoundingRect || windowRect)();

	      for (var child = this.dom.firstChild, next; child; child = next) {
	        next = child.nextSibling;
	        if (child != this.pointer) this.dom.removeChild(child);
	      }
	      this.dom.appendChild(tooltipContent);

	      this.dom.style.display = this.pointer.style.display = "block";

	      if (this.pointerWidth == null) {
	        this.pointerWidth = this.pointer.offsetWidth - 1;
	        this.pointerHeight = this.pointer.offsetHeight - 1;
	      }

	      this.dom.style.width = size.width + "px";
	      this.dom.style.height = size.height + "px";

	      // const margin = 5
	      // get the bounds for each placement
	      // loop through them and find one that's on-screen. if none fit on screen,
	      // use the center one?
	      var directions = ['top', 'bottom', 'left', 'right'];
	      directions.unshift(this.dir);
	      directions.splice(directions.indexOf(this.dir, 1), 1);
	      var placements = [];
	      directions.forEach(function (direction) {
	        placements.push(_this2.getPlacementLayoutInfo({
	          placement: direction,
	          size: size,
	          anchorPos: {
	            left: tooltipPossibleAnchorPoints[direction].left,
	            top: tooltipPossibleAnchorPoints[direction].top
	          }
	        }));
	      });

	      // Find a placement that fits within the viewport.
	      var i = 0;
	      for (; i < placements.length; i++) {
	        var placement = placements[i];
	        var viewportBounds = {};
	        viewportBounds.left = (window.pageXOffset || document.scrollLeft || 0) - (document.clientLeft || 0);
	        viewportBounds.top = (window.pageYOffset || document.scrollTop || 0) - (document.clientTop || 0);
	        viewportBounds.right = viewportBounds.left + window.innerWidth;
	        viewportBounds.bottom = viewportBounds.top + window.innerHeight;
	        if (placement.bounds.left + around.left >= viewportBounds.left && placement.bounds.right + around.left <= viewportBounds.right && placement.bounds.top + around.top >= viewportBounds.top && placement.bounds.bottom + around.top <= viewportBounds.bottom) {
	          this.pointer.classList.remove(prefix + "-pointer-top");
	          this.pointer.classList.remove(prefix + "-pointer-left");
	          this.pointer.classList.remove(prefix + "-pointer-right");
	          this.pointer.classList.remove(prefix + "-pointer-bottom");
	          this.pointer.classList.add(prefix + "-pointer-" + placement.direction);
	          if (placement.direction === 'top') {
	            this.pointerHeight = 12;
	            this.pointerWidth = 6;
	          }
	          if (placement.direction === 'bottom') {
	            this.pointerHeight = 22;
	            this.pointerWidth = 13;
	          }
	          this.dom.style.left = placement.dom.left + "px";
	          this.dom.style.top = placement.dom.top + "px";
	          this.pointer.style.left = placement.pointer.left + "px";
	          this.pointer.style.top = placement.pointer.top + "px";
	          break;
	        }
	      }
	      // If no placement fits in viewport, try the first one.
	      if (i === placements.length) {
	        var _placement = placements[0];
	        this.pointer.classList.remove(prefix + "-pointer-top");
	        this.pointer.classList.remove(prefix + "-pointer-left");
	        this.pointer.classList.remove(prefix + "-pointer-right");
	        this.pointer.classList.remove(prefix + "-pointer-bottom");
	        this.pointer.classList.add(prefix + "-pointer-" + _placement.direction);
	        if (_placement.direction === 'top') {
	          this.pointerWidth = 12;
	          this.pointerHeight = 6;
	        }
	        if (_placement.direction === 'bottom') {
	          this.pointerWidth = 22;
	          this.pointerHeight = 13;
	        }
	        this.dom.style.left = _placement.dom.left + "px";
	        this.dom.style.top = _placement.dom.top + "px";
	        this.pointer.style.left = _placement.pointer.left + "px";
	        this.pointer.style.top = _placement.pointer.top + "px";
	      }

	      getComputedStyle(this.dom).opacity;
	      getComputedStyle(this.pointer).opacity;
	      this.dom.style.opacity = this.pointer.style.opacity = 1;
	      this.className = className;
	      if (this.className) {
	        this.pointer.classList.add(this.className);
	        this.dom.classList.add(this.className);
	      }
	      this.isOpen = true;
	    }
	  }, {
	    key: "getPlacementLayoutInfo",
	    value: function getPlacementLayoutInfo(_ref2) {
	      var placement = _ref2.placement;
	      var size = _ref2.size;
	      var _ref2$anchorPos = _ref2.anchorPos;
	      var left = _ref2$anchorPos.left;
	      var top = _ref2$anchorPos.top;

	      var margin = 5;

	      // Use the window as the bounding rectangle if no getBoundingRect
	      // function is defined
	      var boundingRect = (this.options.getBoundingRect || windowRect)();

	      var around = this.wrapper.getBoundingClientRect();
	      // get the bounds for each placement
	      // loop through them and find one that's on-screen. if none fit on screen,
	      // use the center one?
	      //
	      var placementInfo = {
	        direction: placement, dom: {}, pointer: {}, bounds: {}
	      };
	      if (placement == "top" || placement == "bottom") {
	        // Calculate the tipLeft, ensuring it is within the bounding rectangle.
	        var tipLeft = Math.max(boundingRect.left, Math.min(left - size.width / 2, boundingRect.right - size.width));
	        placementInfo.dom.left = tipLeft - around.left;
	        placementInfo.pointer.left = left - around.left - this.pointerWidth / 2;
	        if (placement == "top") {
	          var tipTop = top - around.top - margin - this.pointerHeight - size.height;
	          placementInfo.dom.top = tipTop;
	          placementInfo.pointer.top = tipTop + size.height;
	          placementInfo.bounds = {
	            left: tipLeft,
	            right: tipLeft + size.width,
	            top: tipTop,
	            bottom: tipTop + size.height + this.pointerHeight + margin
	          };
	        } else {
	          // bottom
	          var _tipTop = top - around.top + margin;
	          placementInfo.dom.top = _tipTop + this.pointerHeight;
	          placementInfo.pointer.top = _tipTop;
	          placementInfo.bounds = {
	            left: tipLeft,
	            right: tipLeft + size.width,
	            top: _tipTop,
	            bottom: _tipTop + size.height + this.pointerHeight + margin
	          };
	        }
	      } else if (placement == "left" || placement == "right") {
	        placementInfo.dom.top = top - around.top - size.height / 2;
	        placementInfo.pointer.top = top - this.pointerHeight / 2 - around.top;
	        if (placement == "left") {
	          var pointerLeft = left - around.left - margin - this.pointerWidth;
	          placementInfo.dom.left = pointerLeft - size.width;
	          placementInfo.pointer.left = pointerLeft + "px";
	          placementInfo.bounds = {
	            left: pointerLeft - size.width,
	            right: pointerLeft + this.pointerWidth + margin,
	            top: top - around.top - size.height / 2,
	            bottom: top - around.top + size.height / 2
	          };
	        } else {
	          // right
	          var _pointerLeft = left - around.left + margin;
	          placementInfo.dom.left = _pointerLeft + this.pointerWidth;
	          placementInfo.pointer.left = _pointerLeft;
	          placementInfo.bounds = {
	            left: _pointerLeft,
	            right: _pointerLeft + this.pointerWidth + size.width,
	            top: top - around.top - size.height / 2,
	            bottom: top - around.top + size.height / 2
	          };
	        }
	      } else if (placement == "center") {
	        var _top = Math.max(around.top, boundingRect.top),
	            bottom = Math.min(around.bottom, boundingRect.bottom);
	        var fromTop = (bottom - _top - size.height) / 2;
	        this.dom.style.left = (around.width - size.width) / 2 + "px";
	        this.dom.style.top = _top - around.top + fromTop + "px";
	      }

	      return placementInfo;
	    }

	    // :: ()
	    // Close (hide) the tooltip.

	  }, {
	    key: "close",
	    value: function close() {
	      if (this.isOpen) {
	        this.isOpen = false;
	        this.dom.style.opacity = this.pointer.style.opacity = 0;
	        if (this.className) {
	          this.dom.classList.remove(this.className);
	          this.pointer.classList.remove(this.className);
	        }
	      }
	    }
	  }]);

	  return Tooltip;
	}();

	exports.default = Tooltip;


	function windowRect() {
	  return {
	    left: 0, right: window.innerWidth,
	    top: 0, bottom: window.innerHeight
	  };
	}

	function insertCSS(css) {
	  var cssNode = document.createElement("style");
	  cssNode.textContent = "/* Tooltip CSS */\n" + css;
	  document.head.insertBefore(cssNode, document.head.firstChild);
	}

	function elt(tag, attrs) {
	  var result = document.createElement(tag);
	  if (attrs) for (var name in attrs) {
	    if (name == "style") result.style.cssText = attrs[name];else if (attrs[name] != null) result.setAttribute(name, attrs[name]);
	  }

	  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	    args[_key - 2] = arguments[_key];
	  }

	  for (var i = 0; i < args.length; i++) {
	    add(args[i], result);
	  }return result;
	}

	function add(value, target) {
	  if (typeof value == "string") value = document.createTextNode(value);

	  if (Array.isArray(value)) {
	    for (var i = 0; i < value.length; i++) {
	      add(value[i], target);
	    }
	  } else {
	    target.appendChild(value);
	  }
	}

	insertCSS("\n\n." + prefix + " {\n  position: absolute;\n  display: none;\n  box-sizing: border-box;\n  -moz-box-sizing: border- box;\n  overflow: hidden;\n\n  -webkit-transition: width 0.4s ease-out, height 0.4s ease-out, left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;\n  -moz-transition: width 0.4s ease-out, height 0.4s ease-out, left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;\n  transition: width 0.4s ease-out, height 0.4s ease-out, left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;\n  opacity: 0;\n\n  border-radius: 5px;\n  padding: 3px 7px;\n  margin: 0;\n  background: white;\n  border: 1px solid #777;\n  color: #555;\n\n  z-index: 11;\n}\n\n." + prefix + "-pointer {\n  position: absolute;\n  display: none;\n  width: 0; height: 0;\n\n  -webkit-transition: left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;\n  -moz-transition: left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;\n  transition: left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;\n  opacity: 0;\n\n  z-index: 12;\n}\n\n." + prefix + "-pointer:after {\n  content: \"\";\n  position: absolute;\n  display: block;\n}\n\n." + prefix + "-pointer-top {\n  border-left: 6px solid transparent;\n  border-right: 6px solid transparent;\n  border-top: 6px solid #777;\n}\n\n." + prefix + "-pointer-top:after {\n  border-left: 6px solid transparent;\n  border-right: 6px solid transparent;\n  border-top: 6px solid white;\n  left: -6px; top: -7px;\n}\n\n." + prefix + "-pointer-bottom {\n  border-left: 6px solid transparent;\n  border-right: 6px solid transparent;\n  border-bottom: 6px solid #777;\n}\n\n." + prefix + "-pointer-bottom:after {\n  border-left: 6px solid transparent;\n  border-right: 6px solid transparent;\n  border-bottom: 6px solid white;\n  left: -6px; top: 1px;\n}\n\n." + prefix + "-pointer-right {\n  border-top: 6px solid transparent;\n  border-bottom: 6px solid transparent;\n  border-right: 6px solid #777;\n}\n\n." + prefix + "-pointer-right:after {\n  border-top: 6px solid transparent;\n  border-bottom: 6px solid transparent;\n  border-right: 6px solid white;\n  left: 1px; top: -6px;\n}\n\n." + prefix + "-pointer-left {\n  border-top: 6px solid transparent;\n  border-bottom: 6px solid transparent;\n  border-left: 6px solid #777;\n}\n\n." + prefix + "-pointer-left:after {\n  border-top: 6px solid transparent;\n  border-bottom: 6px solid transparent;\n  border-left: 6px solid white;\n  left: -7px; top: -6px;\n}\n\n." + prefix + " input[type=\"text\"],\n." + prefix + " textarea {\n  background: #eee;\n  border: none;\n  outline: none;\n}\n\n." + prefix + " input[type=\"text\"] {\n  padding: 0 4px;\n}\n\n");
	/* eslint-enable */

/***/ }
/******/ ]);