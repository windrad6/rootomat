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
    eraser = false

    constructor(imgUrl){
        console.log("start plantomat");



    } 

    clickEraseEn(e, that){
        if (that.eraser) {
            that.eraser = false;
            that.selector.setMode("square");
            $("#eraseEn").css("background-color" , "red");
            //check wether it is a touch device or mouse system
            if('ontouchstart' in window  /*|| navigator.maxTouchPoints > 0*/ || navigator.msMaxTouchPoints > 0)
                $(this.edgeCanvas).off('touchmove');
            else
                $(this.edgeCanvas).off('mousemove');
        } else {
            that.eraser = true;
            that.selector.setMode("erase");
            $("#eraseEn").css("background-color" , "green");
            var that = this;
            if('ontouchstart' in window  /*|| navigator.maxTouchPoints > 0*/ || navigator.msMaxTouchPoints > 0)
                $(this.edgeCanvas).mousemove(function(e, that){ that.erase(e, that)});
            else
                $(this.edgeCanvas).mousemove(function(e, that){ that.erase(e, that)});

        }
        
    
    }

    imageRead(origCanvas,edgeCanvas,that){
        that.origCanvas = document.getElementById(origCanvas);
        var offset = $(that.origCanvas).offset();
        that.absTopLeft.x = offset.left;
        that.absTopLeft.y = offset.top;

        //init canvas for edge outputs
        that.edgeCanvas = document.getElementById(edgeCanvas);
        $(that.edgeCanvas).css({ "top" : offset.top + 'px', "left" : offset.left + 'px'})
        that.edgeCanvas.width = 0;
        that.edgeCanvas.height = 0;
        
        that.edgeCtx = that.edgeCanvas.getContext('2d');
        that.edgeCtx.fillStyle = "rgb(0,255,0)";
        that.edgeCtx.strokeStyle = "rgb(0,255,0)";
        
        that.loadImage();
        that.selector = new rectSelect(origCanvas);
        that.selector.attachMouseupFcn(that.newSelection, that);

        //var that = this;
        $("#eraseEn").click(function(e){ that.clickEraseEn(e, that) })

    }

    init(origCanvas, edgeCanvas) {
        
        this.imgUrl = URL.createObjectURL(document.getElementById("imageFile").files[0]);
        this.img = new Image()
        
        this.img.src = this.imgUrl;
        var that = this
        this.img.onload = function(e) {that.imageRead(origCanvas,edgeCanvas,that)};




    }

    newSelection(selection, scope) {
        scope.convertCanny(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1);
    }

    erase(e, that) {

    }

    loadImage() {      

        
        this.origCanvas.width = this.img.naturalWidth;
        this.origCanvas.height = this.img.naturalHeight;  
        
        this.edgeCanvas.width = this.img.naturalWidth;
        this.edgeCanvas.height = this.img.naturalHeight;


        //draw original to canvas
        this.origCtx = this.origCanvas.getContext('2d');
        this.origCtx.fillStyle = "rgb(0,255,0)";
        this.origCtx.strokeStyle = "rgb(0,255,0)";
        this.origCtx.drawImage(this.img, 0, 0, this.img.naturalWidth, this.img.naturalHeight, 0, 0, this.img.naturalWidth, this.img.naturalHeight);

    }

    getEdgePxCount() {
        var imageData = this.edgeCtx.getImageData(0, 0, this.edgeCanvas.width, this.edgeCanvas.height);
        var edgePx = 0
        for (var pixel of imageData.data) {
            if (pixel != 0)
                edgePx ++;
        }
        $("#allEdgePixel").html(edgePx);
        //console.log("Total edge pixel: " + edgePx);
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
        $("#lastEdgePixel").html(black);
        console.log("Black:" + black);

        this.edgeCtx.putImageData(imageData, startX, startY);
        


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
    refDomObj = Object
    mouseupFcn = null
    scrollEn = false
    mode = "square"

    constructor(elmId) {
        this.refDomObj = $("#" + elmId)
        this.calcRefElmSize(elmId)
        this.init();
    }

    setMode(mode) {
        this.mode = mode;
    }

    init(){
        this.rectDomObj = $('<div />').appendTo('#canvasContainer');
        this.rectDomObj.attr('id', 'rectSelect');
        this.rectDomObj.css("border", "1px solid red");
        this.rectDomObj.css("position", "absolute");
        this.rectDomObj.hide();

        this.rect = {"x1" : 0, "x2" : 0, "y1" : 0, "y2" : 0};

        //check wether it is a touch device or mouse system
        if('ontouchstart' in window  /*|| navigator.maxTouchPoints > 0*/ || navigator.msMaxTouchPoints > 0){
            var that = this;
            document.addEventListener('touchmove',function(e) {that.mousemove(e.pageX, e.pageY, window.pageXOffset, window.pageYOffset, that);});
            document.addEventListener('touchend',function(e) {that.mouseup(e.pageX, e.pageY, window.pageXOffset, window.pageYOffset, that);});
            document.addEventListener('touchstart',function(e) {that.mousedown(e.pageX, e.pageY, window.pageXOffset, window.pageYOffset, that);});
            $("#scrollEn").click(function(e){that.scrollEnHandle(e, that)});
            this.scrollEn = true;
            $("#touchEn").css("background-color" , "green");
        } else {
            var that = this;
            $("#canvasContainer").mousedown(function(e){that.mousedown(e.clientX, e.clientY, 0, 0, that);});
            $("#canvasContainer").mouseup(function(e){that.mouseup(e.clientX, e.clientY, 0, 0, that);});
            $("#canvasContainer").mousemove(function(e){that.mousemove(e.clientX, e.clientY, 0, 0, that);});
            //$("#scrollEn").click(function(e){that.scrollEnHandle(e, that);});

        }

        
    }

    //manage scrolling on touch devices
    scrollEnHandle(e, that){
        if(that.scrollEn) {
            $("#scrollEn").css("background-color","red");
            $("html").css("touch-action", "none");
            that.scrollEn = false;
        } else if(!that.scrollEn) {
            $("#scrollEn").css("background-color","green");
            $("html").css("touch-action", "inherit")
            that.scrollEn = true;
        }
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

    mousedown(x, y, offsetX, offsetY, that) {

        if (this.scrollEn)return;
        if (this.mode != "square")return;

        if (! that.checkRefElmPos(x, y))
            return

        that.rect.x1 = x + $(document).scrollLeft() - offsetX;
        that.rect.y1 = y + $(document).scrollTop() - offsetY;

        that.calcDiv();
        that.rectDomObj.show();


    }

    mouseup(x, y, offsetX, offsetY, that) {
        if (this.scrollEn)return;
        if (this.mode != "square")return;

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

    mousemove(x, y, offsetX, offsetY, that) {
        if (this.scrollEn)return;
        if (this.mode != "square")return;

        if (! that.checkRefElmPos(x, y))
            return

        $("#currentPos").html("x: " + x + "y: " + y + " offX: " + offsetX + " offY: " + offsetY);

        that.rect.x2 = x + $(document).scrollLeft() - offsetX;
        that.rect.y2 = y + $(document).scrollTop() - offsetY;
        that.calcDiv();

    }


}