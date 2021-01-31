// Copyright (c) 2020 Manuel Pitz
//
// Licensed under the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>. This file may not be
// copied, modified, or distributed except according to those terms.


class rootomat {
    origCanvas = Object
    edgeCanvas = Object
    origCtx = Object
    edgeCtx = Object
    imgUrl = ""
    selector = Object
    eraser = Object
    pencil = Object
    img = Object
    absTopLeft = {"x" : 0, "y" : 0}
    toolSelect = Object
    modeSelect = ""

    constructor(imgUrl){

        //check wether it is a touch device or mouse system
        if('ontouchstart' in window  /*|| navigator.maxTouchPoints > 0*/ || navigator.msMaxTouchPoints > 0)
            $("#touchEn").css("background-color" , "green");

        this.eraser = new rectSelect("rectEraseElm","edges");
        this.eraser.setSize(20);
        this.eraser.attachMouseupFcn(this.removePixel, this);

        this.pencil = new rectSelect("rectPencilElm","edges");
        this.pencil.setSize(20);
        this.pencil.attachMouseupFcn(this.newSelection, this);


        this.selector = new rectSelect("rectSelectElm","edges");
        this.selector.attachMouseupFcn(this.newSelection, this);


    } 


    modeSwitch(mode, that) {

        if (that.modeSelect == "download") {

        } else if (that.modeSelect == "rectSelect") {
            that.selector.enableSelf(false)
        } else if (that.modeSelect == "pan") {
            $("html").css("touch-action", "none")
        } else if (that.modeSelect == "pencilSelect") {
            that.pencil.enableSelf(false)
        } else if (that.modeSelect == "erase") {
            that.eraser.enableSelf(false)
        }

        if (mode == "download") {

        } else if (mode == "rectSelect") {
            that.selector.enableSelf(true)
        } else if (mode == "pan") {
            $("html").css("touch-action", "inherit");
        } else if (mode == "pencilSelect") {
            that.pencil.enableSelf(true)
        } else if (mode == "erase") {
            that.eraser.enableSelf(true)
        }
        
        that.modeSelect = mode;
    }

    createToolSelect(domId){
        this.toolSelect = new radioClass(domId);
        this.toolSelect.addElm("toolSelect","Select","rectSelect","rectSelect","./images/select-drag.svg")
        this.toolSelect.addElm("toolSelect","Pencil","pencilSelect","pencilSelect","./images/lead-pencil.svg")
        this.toolSelect.addElm("toolSelect","Pan","pan","pan","./images/pan.svg")
        this.toolSelect.addElm("toolSelect","Download","download","download","./images/cloud-download-outline.svg")
        this.toolSelect.addElm("toolSelect","Erase","erase","erase","./images/eraser.svg")
        this.toolSelect.attachHandler(this.modeSwitch, this)
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
        that.selector.calcRefElmSize();
        that.eraser.calcRefElmSize();
        that.pencil.calcRefElmSize();

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

    removePixel(selection, scope) {
        scope.edgeCtx.clearRect(selection.x1, selection.y1, selection.x2-selection.x1, selection.y2-selection.y1);
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

        this.edgeCtx.putImageData(imageData, startX, startY);
        


    }
}

class analyzer{
    constructor(){
        console.log("new analyzer");
    }
}
