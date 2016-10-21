/* eslint-disable */
const prefix = "ProseMirror-tooltip"

/**
 * Given a rectangular box, get four coordinates that
 * are in the middle of each side of the box.
 *
 * @param  {object} box
 * @returns {object}
 */
const getCenterPointsOfBoxSides = (box) => {
  return {
    top: {
      top: box.top,
      left: box.right - box.width / 2,
    },
    right: {
      top: box.bottom - box.height / 2,
      left: box.right,
    },
    bottom: {
      top: box.bottom,
      left: box.right - box.width / 2,
    },
    left: {
      top: box.bottom - box.height / 2,
      left: box.left,
    },
    width: box.width,
    height: box.height,
  }
}

/**
 * Given a rectangular box whos coordinates are relative to the viewport,
 * make it relative to the document.
 *
 * @param  {object} boundingRect
 * @return {object}
 */
const getDocumentRelativeRectFromViewportRelativeRect = (box) => {
  return {
    top: box.top + window.scrollY,
    bottom: box.bottom + window.scrollY,
    left: box.left + window.scrollX,
    right: box.right + window.scrollX,
    width: box.width,
    height: box.height,
  }
}

/**
 * Get the bounding rectangle for an element relative to the document.
 * @param  {DOMElement} element
 * @return {object}
 */
const getBoundingClientRectRelativeToDocument = (element) => {
  return getDocumentRelativeRectFromViewportRelativeRect(element.getBoundingClientRect())
}

const getViewportBounds = () => {
  const viewportBounds = {}
  viewportBounds.left = (window.pageXOffset || document.scrollLeft || 0) - (document.clientLeft || 0)
  viewportBounds.top = (window.pageYOffset || document.scrollTop || 0)  - (document.clientTop || 0)
  viewportBounds.right = viewportBounds.left + window.innerWidth
  viewportBounds.bottom = viewportBounds.top + window.innerHeight
  return viewportBounds;
}

// ;; Used to show tooltips. An instance of this class is a persistent
// DOM node (to allow position and opacity animation) that can be
// shown and hidden. It is positioned relative to a position (passed
// when showing the tooltip), and points at that position with a
// little arrow-like triangle attached to the node.
export default class Tooltip {
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
  constructor(wrapper, options) {

    this.wrapper = wrapper
    this.options = typeof options == "string" ? {direction: options} : options
    this.dir = this.options.direction || "top"
    this.pointer = wrapper.appendChild(elt("div", {class: prefix + "-pointer-" + this.dir + " " + prefix + "-pointer"}))
    this.pointerWidth = this.pointerHeight = null
    this.dom = wrapper.appendChild(elt("div", {class: prefix}))
    this.dom.addEventListener("transitionend", () => {
      if (this.dom.style.opacity == "0")
        this.dom.style.display = this.pointer.style.display = ""
    })

    this.isOpen = false
    this.lastLeft = this.lastTop = null
  }

  // :: ()
  // Remove the tooltip from the DOM.
  detach() {
    this.dom.parentNode.removeChild(this.dom)
    this.pointer.parentNode.removeChild(this.pointer)
  }

  getSize(node) {
    let wrap = this.wrapper.appendChild(elt("div", {
      class: prefix,
      style: "display: block; position: absolute"
    }, node))
    let size = {width: wrap.offsetWidth + 1, height: wrap.offsetHeight}
    wrap.parentNode.removeChild(wrap)
    return size
  }

  // :: (DOMNode, ?{left: number, top: number})
  // Make the tooltip visible, show the given node in it, and position
  // it relative to the given position. If `pos` is not given, the
  // tooltip stays in its previous place. Unless the tooltip's
  // direction is `"center"`, `pos` should definitely be given the
  // first time it is shown.
  open({tooltipContent, coords, element, className}) {
    let tooltipPossibleAnchorPoints
    if (coords) {
      tooltipPossibleAnchorPoints = getCenterPointsOfBoxSides(getDocumentRelativeRectFromViewportRelativeRect({
        top: coords.top,
        left: coords.left,
        right: coords.left,
        bottom: coords.top,
        width: 0,
        height: 0,
      }))
    } else if (element) {
      tooltipPossibleAnchorPoints = getCenterPointsOfBoxSides(getBoundingClientRectRelativeToDocument(element))
    }
    // let left = this.lastLeft = coords ? coords.left : this.lastLeft
    // let top = this.lastTop = coords ? coords.top : this.lastTop

    let size = this.getSize(tooltipContent)

    let around = getBoundingClientRectRelativeToDocument(this.wrapper)

    // Use the window as the bounding rectangle if no getBoundingRect
    // function is defined
    let boundingRect = (this.options.getBoundingRect || windowRect)()

    for (let child = this.dom.firstChild, next; child; child = next) {
      next = child.nextSibling
      if (child != this.pointer) this.dom.removeChild(child)
    }
    this.dom.appendChild(tooltipContent)

    this.dom.style.display = this.pointer.style.display = "block"

    if (this.pointerWidth == null) {
      this.pointerWidth = this.pointer.offsetWidth - 1
      this.pointerHeight = this.pointer.offsetHeight - 1
    }

    this.dom.style.width = size.width + "px"
    this.dom.style.height = size.height + "px"

    const directions = ['top', 'bottom', 'left', 'right']
    directions.unshift(this.dir)
    directions.splice(directions.indexOf(this.dir, 1), 1)
    const placements = []
    directions.forEach((direction) => {
      this.pointerHeight = 13
      this.pointerWidth = 22
      placements.push(this.getPlacementLayoutInfo({
        direction,
        size,
        anchorPos: {
          left: tooltipPossibleAnchorPoints[direction].left,
          top: tooltipPossibleAnchorPoints[direction].top
        }
      }))
    })

    // Apply the first tooltip placement that fits within the viewport.
    let i = 0
    for (; i < placements.length; i++) {
      let placement = placements[i]
      let viewportBounds = getViewportBounds()
      if (placement.bounds.left >= viewportBounds.left && placement.bounds.right <= viewportBounds.right && placement.bounds.top >= viewportBounds.top && placement.bounds.bottom <= viewportBounds.bottom) {
        this.pointer.classList.remove(`${prefix}-pointer-top`)
        this.pointer.classList.remove(`${prefix}-pointer-left`)
        this.pointer.classList.remove(`${prefix}-pointer-right`)
        this.pointer.classList.remove(`${prefix}-pointer-bottom`)
        this.pointer.classList.add(`${prefix}-pointer-${placement.direction}`)
        this.dom.style.left = placement.dom.left - around.left + "px"
        this.dom.style.top = placement.dom.top - around.top + "px"
        this.pointer.style.left = placement.pointer.left - around.left + "px"
        this.pointer.style.top = placement.pointer.top - around.top + "px"
        break
      }
    }
    // If no placement fits in viewport, just use the first one.
    if (i === placements.length) {
      let placement = placements[0]
      this.pointer.classList.remove(`${prefix}-pointer-top`)
      this.pointer.classList.remove(`${prefix}-pointer-left`)
      this.pointer.classList.remove(`${prefix}-pointer-right`)
      this.pointer.classList.remove(`${prefix}-pointer-bottom`)
      this.pointer.classList.add(`${prefix}-pointer-${placement.direction}`)
      this.dom.style.left = placement.dom.left - around.left + "px"
      this.dom.style.top = placement.dom.top - around.top + "px"
      this.pointer.style.left = placement.pointer.left - around.left + "px"
      this.pointer.style.top = placement.pointer.top - around.top + "px"
    }

    getComputedStyle(this.dom).opacity
    getComputedStyle(this.pointer).opacity
    this.dom.style.opacity = this.pointer.style.opacity = 1
    this.className = className;
    if(this.className){
      this.pointer.classList.add(this.className);
      this.dom.classList.add(this.className);
    }
    this.isOpen = true
  }

  /**
   * If the tooltip was to be placed in a specific direction, get the placement
   * information:
   *  - the bounding box of the tooltip
   *  - the DOM positioning of the tooltip and tooltipcontent elements
   *
   * @param  {string} options.direction      The direction of the tooltip (top, bottom, right, left)
   * @param  {object} options.size           The size of the tooltip content
   * @param  {object} options.anchorPos.left X coordinate for the anchor of the tooltip.
   * @param  {object} options.anchorPos.top  Y coordinate for the anchor of the tooltip.
   * @returns {object} Placement
   */
  getPlacementLayoutInfo({direction, size, anchorPos: {left, top}}) {
    const margin = 5

    // Use the window as the bounding rectangle if no getBoundingRect
    // function is defined
    let boundingRect = (this.options.getBoundingRect || windowRect)()

    // get the bounds for each direction
    // loop through them and find one that's on-screen. if none fit on screen,
    // use the center one?
    //
    let placementInfo = {
      direction: direction, dom: {}, pointer: {}, bounds: {}
    }
    if (direction == "top" || direction == "bottom") {
      // Calculate the tipLeft, ensuring it is within the bounding rectangle.
      let tipLeft = Math.max(boundingRect.left, Math.min(left - size.width / 2, boundingRect.right - size.width))
      placementInfo.dom.left = tipLeft
      placementInfo.pointer.left = left - this.pointerWidth / 2
      if (direction == "top") {
        let tipTop = top - margin - this.pointerHeight - size.height
        placementInfo.dom.top = tipTop
        placementInfo.pointer.top = tipTop + size.height
        placementInfo.bounds = {
          left: tipLeft,
          right: tipLeft + size.width,
          top: tipTop,
          bottom: tipTop + size.height + this.pointerHeight + margin
        }
      } else { // bottom
        let tipTop = top - + margin
        placementInfo.dom.top = tipTop + this.pointerHeight
        placementInfo.pointer.top = tipTop
        placementInfo.bounds = {
          left: tipLeft,
          right: tipLeft + size.width,
          top: tipTop,
          bottom: tipTop + size.height + this.pointerHeight + margin
        }
      }
    } else if (direction == "left" || direction == "right") {
      placementInfo.dom.top = top - size.height / 2
      placementInfo.pointer.top = top - this.pointerHeight / 2
      if (direction == "left") {
        let pointerLeft = left - margin - this.pointerWidth
        placementInfo.dom.left = pointerLeft - size.width
        placementInfo.pointer.left = pointerLeft + "px"
        placementInfo.bounds = {
          left: pointerLeft - size.width,
          right: pointerLeft + this.pointerWidth + margin,
          top: top - size.height / 2,
          bottom: top + size.height / 2
        }
      } else { // right
        let pointerLeft = left + margin
        placementInfo.dom.left = pointerLeft + this.pointerWidth
        placementInfo.pointer.left = pointerLeft
        placementInfo.bounds = {
          left: pointerLeft,
          right: pointerLeft + this.pointerWidth + size.width,
          top: top - size.height / 2,
          bottom: top + size.height / 2
        }
      }
    }
    // else if (direction == "center") {
    //   let top = Math.max(around.top, boundingRect.top), bottom = Math.min(around.bottom, boundingRect.bottom)
    //   let fromTop = (bottom - top - size.height) / 2
    //   this.dom.style.left = (around.width - size.width) / 2 + "px"
    //   this.dom.style.top = (top - around.top + fromTop) + "px"
    // }

    return placementInfo
  }

  // :: ()
  // Close (hide) the tooltip.
  close() {
    if (this.isOpen) {
      this.isOpen = false
      this.dom.style.opacity = this.pointer.style.opacity = 0
      if(this.className){
        this.dom.classList.remove(this.className);
        this.pointer.classList.remove(this.className);
      }
    }
  }
}

function windowRect() {
  return {
    left: 0, right: window.innerWidth,
    top: 0, bottom: window.innerHeight
  }
}

function insertCSS(css) {
  const cssNode = document.createElement("style")
  cssNode.textContent = "/* Tooltip CSS */\n" + css
  document.head.insertBefore(cssNode, document.head.firstChild)
}

function elt(tag, attrs, ...args) {
  let result = document.createElement(tag)
  if (attrs) for (let name in attrs) {
    if (name == "style")
      result.style.cssText = attrs[name]
    else if (attrs[name] != null)
      result.setAttribute(name, attrs[name])
  }
  for (let i = 0; i < args.length; i++) add(args[i], result)
  return result
}

function add(value, target) {
  if (typeof value == "string")
    value = document.createTextNode(value)

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) add(value[i], target)
  } else {
    target.appendChild(value)
  }
}

insertCSS(`

.${prefix} {
  position: absolute;
  display: none;
  box-sizing: border-box;
  -moz-box-sizing: border- box;
  overflow: hidden;

  -webkit-transition: width 0.4s ease-out, height 0.4s ease-out, left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;
  -moz-transition: width 0.4s ease-out, height 0.4s ease-out, left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;
  transition: width 0.4s ease-out, height 0.4s ease-out, left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;
  opacity: 0;

  border-radius: 5px;
  padding: 3px 7px;
  margin: 0;
  background: white;
  border: 1px solid #777;
  color: #555;

  z-index: 11;
}

.${prefix}-pointer {
  position: absolute;
  display: none;
  width: 0; height: 0;

  -webkit-transition: left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;
  -moz-transition: left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;
  transition: left 0.4s ease-out, top 0.4s ease-out, opacity 0.2s;
  opacity: 0;

  z-index: 12;
}

.${prefix}-pointer:after {
  content: "";
  position: absolute;
  display: block;
}

.${prefix}-pointer-top {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #777;
}

.${prefix}-pointer-top:after {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
  left: -6px; top: -7px;
}

.${prefix}-pointer-bottom {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #777;
}

.${prefix}-pointer-bottom:after {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid white;
  left: -6px; top: 1px;
}

.${prefix}-pointer-right {
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid #777;
}

.${prefix}-pointer-right:after {
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid white;
  left: 1px; top: -6px;
}

.${prefix}-pointer-left {
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid #777;
}

.${prefix}-pointer-left:after {
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid white;
  left: -7px; top: -6px;
}

.${prefix} input[type="text"],
.${prefix} textarea {
  background: #eee;
  border: none;
  outline: none;
}

.${prefix} input[type="text"] {
  padding: 0 4px;
}

`)
/* eslint-enable */
