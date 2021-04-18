// Copyright (c) 2020 Manuel Pitz
//
// Licensed under the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>. This file may not be
// copied, modified, or distributed except according to those terms.

class rectSelect{
    
    rect = {"x1" : 0, "x2" : 0, "y1" : 0, "y2" : 0}
    refElm = {"x1" : 0, "x2" : 0, "y1" : 0, "y2" : 0}
    rectDomObj = Object
    refDomObj = Object
    mouseupFcn = null
    selfEn = false
    size = -1

    constructor(elmId, refElm) {
        this.refDomObj = $("#" + refElm)
        this.calcRefElmSize()
        this.init(elmId,);
    }

    enableSelf(enableIn) {
        this.selfEn = enableIn;
    }

    init(elmId){
        this.rectDomObj = $('<div />').appendTo($(this.refDomObj).parent());
        this.rectDomObj.attr('id', elmId);
        this.rectDomObj.css("border", "1px solid red");
        this.rectDomObj.css("position", "absolute");
        this.rectDomObj.hide();

        this.rect = {"x1" : 0, "x2" : 0, "y1" : 0, "y2" : 0};

        //check wether it is a touch device or mouse system
        if('ontouchstart' in window  /*|| navigator.maxTouchPoints > 0*/ || navigator.msMaxTouchPoints > 0){
            $("#canvasContainer")[0].addEventListener('touchmove',(e) => {this.mousemove(e.pageX, e.pageY, window.pageXOffset, window.pageYOffset);});
            $("#canvasContainer")[0].addEventListener('touchend',(e) => {this.mouseup(e.pageX, e.pageY, window.pageXOffset, window.pageYOffset);});
            $("#canvasContainer")[0].addEventListener('touchstart',(e) => {this.mousedown(e.pageX, e.pageY, window.pageXOffset, window.pageYOffset);});
        } else {
            $("#canvasContainer").mousedown((e) => {this.mousedown(e.clientX, e.clientY, 0, 0);});
            $("#canvasContainer").mouseup((e) => {this.mouseup(e.clientX, e.clientY, 0, 0);});
            $("#canvasContainer").mousemove((e) => {this.mousemove(e.clientX, e.clientY, 0, 0);});
        }

        
    }
    setSize(sizeIn) {
        this.size = sizeIn;
    }


    //attach a function to be called on mouseup
    attachMouseupFcn(fcnPtr , scope){
        this.mouseupFcn = {"ptr" : fcnPtr, "scope" : scope}
    }

    //calculate the abs coordinates of the reference element (elmId)
    calcRefElmSize() {

        var offset = $(this.refDomObj).offset();

        this.refElm.x1 = offset.left
        this.refElm.x2 = offset.left + $(this.refDomObj).width();
        this.refElm.y1 = offset.top
        this.refElm.y2 = offset.top + $(this.refDomObj).height();
    }

    //check if mouse is outside the reference elm (elmId from constructor)
    checkRefElmPos(x , y) {
        if (x < this.refElm.x1 || x > this.refElm.x2 || y < this.refElm.y1 || y > this.refElm.y2 )
            return false;
        return true;
    }

    //calc a new div whis the current pos
    calcDiv() {
        var x3 = Math.min(this.rect.x1,this.rect.x2);
        var x4 = Math.max(this.rect.x1,this.rect.x2);
        var y3 = Math.min(this.rect.y1,this.rect.y2);
        var y4 = Math.max(this.rect.y1,this.rect.y2);

        this.rectDomObj.css("left", x3 + 'px');
        this.rectDomObj.css("top", y3 + 'px');
        this.rectDomObj.css("width", x4 - x3 + 'px');
        this.rectDomObj.css("height",  y4 - y3 + 'px');
    }

    calcCircle() {
        var x3 = Math.min(this.rect.x1,this.rect.x2);
        var x4 = Math.max(this.rect.x1,this.rect.x2);
        var y3 = Math.min(this.rect.y1,this.rect.y2);
        var y4 = Math.max(this.rect.y1,this.rect.y2);

        this.rectDomObj.css("left", this.rect.x2 - this.size/2 + 'px');
        this.rectDomObj.css("top", this.rect.y2 - this.size/2 + 'px');
        this.rectDomObj.css("width", + this.size + 'px');
        this.rectDomObj.css("height",  + this.size + 'px');
    }

    mousedown(x, y, offsetX, offsetY) {

        if (!this.selfEn)return;

        /*if (!this.checkRefElmPos(x, y))
            return
*/
        this.rect.x1 = x + $(document).scrollLeft() - offsetX;
        this.rect.y1 = y + $(document).scrollTop() - offsetY;


        if(this.size != -1)
            this.calcCircle()
        else
            this.calcDiv();
        this.rectDomObj.show();


    }

    mouseup(x, y, offsetX, offsetY) {
        if (!this.selfEn)return;

        /*if (!this.checkRefElmPos(x, y))
            return
*/
        if(this.mouseupFcn !== null) {
            //correct if square is not done left to right
            if (this.rect.x1 > this.rect.x2) {
                var tmp = this.rect.x1;
                this.rect.x1 = this.rect.x2;
                this.rect.x2 = tmp;
            }
            //correct if square is not done top to bottom
            if (this.rect.y1 > this.rect.y2) {
                var tmp = this.rect.y1;
                this.rect.y1 = this.rect.y2;
                this.rect.y2 = tmp;
            }

            //correct the 0 point of the rectangle to be relative to the elmId
            var coordinates = {"x1" : 0,"x2" : 0,"y1" : 0,"y2" : 0}
            if (this.size != -1) {
                coordinates.x1 = this.rect.x2 - this.size/2  - this.refElm.x1
                coordinates.y1 = this.rect.y2 - this.size/2 - this.refElm.y1
                coordinates.x2 = this.rect.x2 + this.size/2 - this.refElm.x1
                coordinates.y2 = this.rect.y2 + this.size/2 - this.refElm.y1
            } else {
                coordinates.x1 = this.rect.x1 - this.refElm.x1
                coordinates.x2 = this.rect.x2 - this.refElm.x1
                coordinates.y1 = this.rect.y1 - this.refElm.y1
                coordinates.y2 = this.rect.y2 - this.refElm.y1
            }

            this.mouseupFcn.ptr(coordinates, this.mouseupFcn.scope);
        }

        this.rect = {"x1" : 0, "x2" : 0, "y1" : 0, "y2" : 0};
        this.rectDomObj.hide();
    }

    mousemove(x, y, offsetX, offsetY) {
        if (!this.selfEn)return;

        /*if (!this.checkRefElmPos(x, y))
            return;
*/
        if(this.rect.y1 == 0 || this.rect.x1 == 0)
            return;

        this.rect.x2 = x + $(document).scrollLeft() - offsetX;
        this.rect.y2 = y + $(document).scrollTop() - offsetY;
        if(this.size != -1) {
            var coordinates = {"x1" : 0,"x2" : 0,"y1" : 0,"y2" : 0}
            
            coordinates.x1 = this.rect.x2 - this.size/2  - this.refElm.x1
            coordinates.y1 = this.rect.y2 - this.size/2 - this.refElm.y1
            coordinates.x2 = this.rect.x2 + this.size/2 - this.refElm.x1
            coordinates.y2 = this.rect.y2 + this.size/2 - this.refElm.y1
            this.mouseupFcn.ptr(coordinates, this.mouseupFcn.scope);
            this.calcCircle()
        } else {
            this.calcDiv();

        }
            

    }
}