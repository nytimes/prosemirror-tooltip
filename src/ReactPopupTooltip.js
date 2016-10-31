import React, {Component} from 'react';
import './ReactPopupTooltip.scss';

/**
 * Popup
 *
 * @desc - Alignments:
 *          justify = start||end, is this top (start) or bottom (end)
 *          align = start||center||end, placement of arrow in relation to justification
 *                  set arrow alignment vertically start(top)/center(middle)/end(bottom)
 */
class ReactPopupTooltip extends Component {
    static get START (){return 'start'}
    static get END (){return 'end'}
    static get CENTER (){return 'center'}
    static get HORIZONTAL (){return 'horizontal'}
    static get VERTICAL (){return 'vertical'}

    constructor(props) {
        super(props);
        this.state = {
            justify:ReactPopupTooltip.START,
            align:ReactPopupTooltip.CENTER,
            top:0,
            left:0,
            hidden:this.truthy(props.hidden),
        }
    }
    componentWillMount(){
    }

    /**
     * truthy - boolean based setter with default of true
     * @param val
     * @returns {boolean}
     */
    truthy(val = true) {
        return val;
    }
    componentDidMount(){

        this.setState({
            hidden:this.props.hidden
        })
    }

    /**
     * isEqual - shallow check on object to diff
     * @param obj1
     * @param obj2
     * @returns {boolean}
     */
    isEqual(obj1, obj2){
        let hasDiff = false;
        for (let prop of Object.keys(obj1)) {
            hasDiff = hasDiff || (obj1[prop] != obj2[prop]);
        }
        return !hasDiff;
    }
    shouldComponentUpdate(nextProps, nextState){
        return !this.isEqual(nextState, this.state) || !this.isEqual(nextProps, this.props);
    }
    position(){

        if(!this.props.containerElement || !this.props.targetBounds.width) return;
        if(this.container.parentElement != this.props.containerElement){
            this.props.containerElement.appendChild(this.container);

        }
        let bounding = this.props.containerElement.getBoundingClientRect();
        //this can probably get cleaned up
        let containerRect,
            containmentBounds = {
                left:this.props.containerElement.offsetLeft,
                width:bounding.width,
                right:this.props.containerElement.offsetLeft+bounding.width,
                bottom:bounding.height+this.props.containerElement.offsetTop,
                height:bounding.height,
                top:this.props.containerElement.offsetTop},
            left,
            top,
            justify = ReactPopupTooltip.START,
            align = ReactPopupTooltip.CENTER;
        containerRect = this.container.getBoundingClientRect();
        let targetCenterXPos = this.props.targetBounds.left + (this.props.targetBounds.width/2);
        left = (targetCenterXPos) - (containerRect.width/2);
        if (left<containmentBounds.left)
        {
            align = ReactPopupTooltip.START;
            left = this.props.targetBounds.left + (this.props.targetBounds.width / 2);
        }else if ((left+(containerRect.width*1.5))>(containmentBounds.right)){
            align = ReactPopupTooltip.END;
            left = this.props.targetBounds.left + (this.props.targetBounds.width/2) - containerRect.width;
        }
        top = this.props.targetBounds.top + (this.props.targetBounds.height)-bounding.top;

        // default view state is always below so we can just check for if we need to move above

        if(top+containerRect.height>containmentBounds.bottom) {
            let oldTop = top;
            top = (this.props.targetBounds.top - containerRect.height)-bounding.top;
            top = (top<0) ? oldTop : top;
            justify = (oldTop!=top)?ReactPopupTooltip.END:ReactPopupTooltip.START;

        }else{
            justify = ReactPopupTooltip.START
        }

        this.setState({
            top:top,
            left:left,
            justify:justify,
            align:align,
        });
    }
    get classNames() {
        return `Popup-Tooltip-Container${(this.state.hidden) ? ' hidden':''}`;
    }
    get styles ()
    {
        return Object.assign({
            top:this.state.top,
            left:this.state.left,
        }, this.props.style)
    }
    open(){
        this.setState({hidden:false});
    }
    close(){
        this.setState({hidden:true});
    }
    toggle(){
        this.setState({hidden:!this.state.hidden});
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.hidden === this.state.hidden) return;
        this.setState({
            hidden:nextProps.hidden
        })
    }
    get isOpen() {
        return !this.state.hidden;
    }
    render({children: children} = {}){
        // let children = (obj && obj.children ) ? obj.children : this.props.children;
        return (
            <div style={this.styles} data-align={this.state.align}  data-justify={this.state.justify} className={this.classNames} ref={(el) => this.container = el} tabIndex="-1">
            <div className="Popup-Tooltip-Arrow" ref={(el) => this.arrow = el}></div>
        <div className="Popup-Tooltip-Content">
            {children||this.props.children}
    </div>
        </div>
    );
    }
    componentDidUpdate(){
        // slightly dangerous to call position on the element which contains a set state, therefore shouldComponentUpdate makes certain we don't need to update anything as the default behavior is to update every time state is changed even if it hasn't
        this.position();
    }
}
ReactPopupTooltip.propTypes = {
    targetBounds:React.PropTypes.shape({
        width:React.PropTypes.number,
        height:React.PropTypes.number,
        top:React.PropTypes.number,
        right:React.PropTypes.number,
        bottom:React.PropTypes.number,
        left:React.PropTypes.number,
    }),
    containerElement:React.PropTypes.object,
    containingBounds:React.PropTypes.shape({
        width:React.PropTypes.number,
        height:React.PropTypes.number,
        top:React.PropTypes.number,
        right:React.PropTypes.number,
        bottom:React.PropTypes.number,
        left:React.PropTypes.number,
    }),
    hidden: React.PropTypes.bool
}
ReactPopupTooltip.defaultProps = {
    targetBounds:{width:0, height:0, top:0, right:0, bottom:0, left:0},
    containerElement: document.querySelector('body')
}
export default ReactPopupTooltip;