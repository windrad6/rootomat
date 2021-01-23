// Copyright (c) 2020 Manuel Pitz, RWTH Aachen University
//
// Licensed under the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>. This file may not be
// copied, modified, or distributed except according to those terms.


class plantomat {
    ctxObj = Object
    ctx = Object
    imgUrl = ""
    selector = Object
    img = Object

    constructor(imgUrl){
        console.log("start plantomat");
        this.imgUrl = imgUrl;
        this.img = new Image()
        
        this.img.src = this.imgUrl;
    } 

    calc(ctxId) {
        this.ctxObj = document.getElementById(ctxId);
       
        
        this.loadImage();
        this.selector = new rectSelect(ctxId);
        this.selector.attachMouseupFcn(this.newSelection, this);
    }

    newSelection(selection, scope) {
        scope.convertCanny(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
    }

    loadImage() {      

        
        this.ctxObj.width = this.img.naturalWidth;
        this.ctxObj.height = this.img.naturalHeight;    


        //draw original to canvas
        this.ctx = this.ctxObj.getContext('2d');
        this.ctx.fillStyle = "rgb(0,255,0)";
        this.ctx.strokeStyle = "rgb(0,255,0)";
        this.ctx.drawImage(this.img, 0, 0, this.img.naturalWidth, this.img.naturalHeight, 0, 0, this.img.naturalWidth, this.img.naturalHeight);

    }

    

    convertCanny(startX, startY, width, height) {
        startX = Math.round(startX);
        startY = Math.round(startY);
        width = Math.round(width);
        height = Math.round(height);


        var img_u8 = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);
       
    
        var imageData = this.ctx.getImageData(startX, startY, width, height);

        jsfeat.imgproc.grayscale(imageData.data, width, height, img_u8);

        
        var r = 5;
        var kernel_size = (r+1) << 1;

        jsfeat.imgproc.gaussian_blur(img_u8, img_u8, kernel_size, 0);

        jsfeat.imgproc.canny(img_u8, img_u8, 0, 12.5);

        // render result back to canvas
        var data_u32 = new Uint32Array(imageData.data.buffer);
        var alpha = (0xff << 24);
        var i = img_u8.cols*img_u8.rows, pix = 0;
        var black = 0
        while(--i >= 0) {
            pix = img_u8.data[i];
            if(pix != 0){
                data_u32[i] = alpha;
                black ++;
            }else
                data_u32[i] = 0;//alpha | (pix << 16) | (pix << 8) | pix;
            
        }
        console.log("Black:" + black);
        this.ctx.putImageData(imageData, startX, startY);


    }
}

class analyzer{
    constructor(){
        console.log("new analyzer");
    }
}


class rectSelect{
    
    rect = {x1 : 0, x2 : 0, y1 : 0, y2 : 0}
    refElm = {x1 : 0, x2 : 0, y1 : 0, y2 : 0}
    rectDomObj = Object
    mouseupFcn = null

    constructor(elmId) {
        this.rectDomObj = $('<div />').appendTo('body');
        this.rectDomObj.attr('id', 'rectSelect');
        this.rectDomObj.css("border", "1px solid red");
        this.rectDomObj.css("position", "absolute");
        this.rectDomObj.hide();

        

        $(document).mousedown(this, this.mousedown);
        $(document).mouseup(this, this.mouseup);
        $(document).mousemove(this, this.mousemove);

        this.calcRefElmSize(elmId)


    }

    //attach a function to be called on mouseup
    attachMouseupFcn(fcnPtr , scope){
        this.mouseupFcn = {"ptr" : fcnPtr, "scope" : scope}
    }

    //calculate the abs coordinates of the reference element (elmId)
    calcRefElmSize(elmId) {

        var offset = $("#" + elmId).offset();

        this.refElm.x1 = offset.left
        this.refElm.x2 = offset.left + $("#" + elmId).width();
        this.refElm.y1 = offset.top
        this.refElm.y2 = offset.top + $("#" + elmId).height();
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

    mousedown(e) {
        var that = e.data;

        that.rect.x1 = e.clientX + $(document).scrollLeft();
        that.rect.y1 = e.clientY + $(document).scrollTop();

        that.calcDiv();
        that.rectDomObj.show();


    }

    mouseup(e) {
        var that = e.data;

        if(that.mouseupFcn !== null) {
            //correct if square is not done left to right
            if (that.rect.x1 > that.rect.x2) {
                var tmp = that.rect.x1;
                that.rect.x1 = that.rect.x2;
                that.rect.x2 = tmp;
            }
            //correct if square is not done top to bottom
            if (that.rect.y1 > that.rect.y2) {
                var tmp = that.rect.y1;
                that.rect.y1 = that.rect.y2;
                that.rect.y2 = tmp;
            }

            //correct the 0 point of the rectangle to be relative to the elmId
            that.rect.x1 = that.rect.x1 - that.refElm.x1
            that.rect.x2 = that.rect.x2 - that.refElm.x1
            that.rect.y1 = that.rect.y1 - that.refElm.y1
            that.rect.y2 = that.rect.y2 - that.refElm.y1

            that.mouseupFcn.ptr(that.rect, that.mouseupFcn.scope);
        }

        that.rect = {x1 : 0, x2 : 0, y1 : 0, y2 : 0};
        that.rectDomObj.hide();
    }

    mousemove(e) {
        var that = e.data;

        if (! that.checkRefElmPos(e.clientX, e.clientY))
            return

        that.rect.x2 = e.clientX + $(document).scrollLeft();
        that.rect.y2 = e.clientY + $(document).scrollTop();
        that.calcDiv();

    }


}