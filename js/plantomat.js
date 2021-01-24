// Copyright (c) 2020 Manuel Pitz, RWTH Aachen University
//
// Licensed under the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>. This file may not be
// copied, modified, or distributed except according to those terms.


class plantomat {
    origCanvas = Object
    edgeCanvas = Object
    origCtx = Object
    edgeCtx = Object
    imgUrl = ""
    selector = Object
    img = Object
    absTopLeft = {"x" : 0, "y" : 0}

    constructor(imgUrl){
        console.log("start plantomat");
        this.imgUrl = imgUrl;
        this.img = new Image()
        
        this.img.src = this.imgUrl;
    } 

    init(origCanvas, edgeCanvas) {
        this.origCanvas = document.getElementById(origCanvas);
        var offset = $(this.origCanvas).offset();
        this.absTopLeft.x = offset.left;
        this.absTopLeft.y = offset.top;

        //init canvas for edge outputs
        this.edgeCanvas = document.getElementById(edgeCanvas);
        this.edgeCanvas.width = 0;
        this.edgeCanvas.height = 0;
        
        this.edgeCtx = this.edgeCanvas.getContext('2d');
        this.edgeCtx.fillStyle = "rgb(0,255,0)";
        this.edgeCtx.strokeStyle = "rgb(0,255,0)";
        
        this.loadImage();
        this.selector = new rectSelect(origCanvas);
        this.selector.attachMouseupFcn(this.newSelection, this);
    }

    newSelection(selection, scope) {
        scope.convertCanny(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
    }

    loadImage() {      

        
        this.origCanvas.width = this.img.naturalWidth;
        this.origCanvas.height = this.img.naturalHeight;    


        //draw original to canvas
        this.origCtx = this.origCanvas.getContext('2d');
        this.origCtx.fillStyle = "rgb(0,255,0)";
        this.origCtx.strokeStyle = "rgb(0,255,0)";
        this.origCtx.drawImage(this.img, 0, 0, this.img.naturalWidth, this.img.naturalHeight, 0, 0, this.img.naturalWidth, this.img.naturalHeight);

    }

    

    convertCanny(startX, startY, width, height) {
        startX = Math.round(startX);
        startY = Math.round(startY);
        width = Math.round(width);
        height = Math.round(height);


        var img_u8 = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);
       
    
        var imageData = this.origCtx.getImageData(startX, startY, width, height);

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


        //add white part to canvas and rearrange
        var newOffset = {"top" : 0, "left" : 0}
        var oldImgOffset = {"top" : 0, "left" : 0}
        
        var absTop = startY + this.absTopLeft.y;
        var absLeft = startX + this.absTopLeft.x;
        if (this.edgeCanvas.width == 0 && this.edgeCanvas.height == 0) {
            this.edgeCanvas.width = width
            this.edgeCanvas.height = height
            $(this.edgeCanvas).css({ "top" : absTop + 'px', "left" : absLeft + 'px'})
        } else {
            var oldImage = this.edgeCtx.getImageData(0, 0, this.edgeCanvas.width, this.edgeCanvas.height);

            var currentPos = $(this.edgeCanvas).offset();
            if (absTop < currentPos.top) {
                this.edgeCanvas.height = currentPos.top - absTop + this.edgeCanvas.height;
                $(this.edgeCanvas).css("top",  absTop + 'px');
                oldImgOffset.top = currentPos.top - absTop
            } else if (absTop > currentPos.top) {

                newOffset.top = absTop - currentPos.top
                this.edgeCanvas.height = absTop - currentPos.top + height;

            }
            if (absLeft < currentPos.left) {
                this.edgeCanvas.width = currentPos.left - absLeft + this.edgeCanvas.width;
                $(this.edgeCanvas).css("left",  absLeft + 'px');
                oldImgOffset.left = currentPos.left - absLeft
            } else if (absLeft > currentPos.left) {
                newOffset.left = absLeft - currentPos.left
                this.edgeCanvas.width = currentPos.left - absLeft + width;

            }
            this.edgeCtx.clearRect(0, 0, this.edgeCanvas.width, this.edgeCanvas.height);
            this.edgeCtx.putImageData(oldImage, oldImgOffset.left, oldImgOffset.top);


        }
        this.edgeCtx.putImageData(imageData, newOffset.left, newOffset.top );

        //this.origCtx.putImageData(imageData, startX, startY);
        


    }
}

class analyzer{
    constructor(){
        console.log("new analyzer");
    }
}


class rectSelect{
    
    rect = {"x1" : 0, "x2" : 0, "y1" : 0, "y2" : 0}
    refElm = {"x1" : 0, "x2" : 0, "y1" : 0, "y2" : 0}
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

        that.rect = {"x1" : 0, "x2" : 0, "y1" : 0, "y2" : 0};
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