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
    download = Object
    img = Object
    colorPicker = Object
    absTopLeft = {"x" : 0, "y" : 0}
    toolSelect = Object
    adaptiveToolMenu = Object
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

        this.download = new rectSelect("rectDownloadElm","edges");
        this.download.attachMouseupFcn(this.downloadImg, this);


    } 


    modeSwitch(mode, that) {

        if (that.modeSelect == "download") {
            that.download.enableSelf(false)
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
            that.download.enableSelf(true)
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
        this.toolSelect.addElm("toolSelect","Select","rectSelect","rectSelect",{"path" : "./images/select-drag.svg"})
        this.toolSelect.addElm("toolSelect","Pencil","pencilSelect","pencilSelect",{"path" : "./images/lead-pencil.svg"})
        //check wether it is a touch device or mouse system
        if('ontouchstart' in window  /*|| navigator.maxTouchPoints > 0*/ || navigator.msMaxTouchPoints > 0)
            this.toolSelect.addElm("toolSelect","Pan","pan","pan",{"path" : "./images/pan.svg"})
        this.toolSelect.addElm("toolSelect","Download","download","download",{"path" : "./images/cloud-download-outline.svg"})
        this.toolSelect.addElm("toolSelect","Erase","erase","erase",{"path" : "./images/eraser.svg"})
        this.toolSelect.attachHandler(this.modeSwitch, this)
        //check wether it is a touch device or mouse system
        if('ontouchstart' in window  /*|| navigator.maxTouchPoints > 0*/ || navigator.msMaxTouchPoints > 0)
            this.toolSelect.selectElm("pan")//this is done to trigger the disable pan on mobile devices
        this.toolSelect.selectElm("rectSelect")
    }


    createAdaptiveToolMenu(domId){
        this.adaptiveToolMenu = $("#" + domId)

        this.colorPicker = new colorPicker(domId);
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
        that.download.calcRefElmSize();

    }

    init(origCanvas, edgeCanvas) {
        
        if(document.getElementById("imageFile").files.length < 1){
            alert("Please select an image first");
            return;
        }
    
        this.imgUrl = URL.createObjectURL(document.getElementById("imageFile").files[0]);
        this.img = new Image()
        
        this.img.src = this.imgUrl;
        var that = this
        this.img.onload = function(e) {that.imageRead(origCanvas,edgeCanvas,that)};




    }
    downloadImg(selection, scope) {


        var dateObj = new Date();
        var dateStr =  dateObj.getFullYear() + "_" 
        + (((dateObj.getMonth() + 1) < 10)?'0':'') + (dateObj.getMonth() + 1) + "_" 
        + (((dateObj.getDate()) < 10)?'0':'') + dateObj.getDate() + "_" 
        + (((dateObj.getHours()) < 10)?'0':'') + dateObj.getHours() + "_" 
        + (((dateObj.getMinutes()) < 10)?'0':'') + dateObj.getMinutes() + "_" 
        + (((dateObj.getSeconds()) < 10)?'0':'') + dateObj.getSeconds()

        
        var fontSize = 15
        var texboxHeight = 2 * fontSize + 2//add little bit of margin
        var minWidth = 170

        var tmpCanvas = $("<canvas/>").attr({
            "width" : (minWidth > (selection.x2 - selection.x1))?minWidth:(selection.x2 - selection.x1),
            "height" : selection.y2 - selection.y1 + texboxHeight
        })
        tmpCanvas = tmpCanvas[0]
        var tmpCtx = tmpCanvas.getContext('2d')
        tmpCtx.fillStyle = "white";
        tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);



        var tmpOrig = scope.origCtx.getImageData(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1)
        var tmpEdge = scope.edgeCtx.getImageData(selection.x1, selection.y1, selection.x2 - selection.x1, selection.y2 - selection.y1)

        var edgePx = 0;
        for(var i = 0; i < tmpOrig.data.length; i+=4) {
            if( tmpEdge.data[i + 3] != 0) {//it is not an alpha pixel
                tmpOrig.data[i] = tmpEdge.data[i];
                tmpOrig.data[i + 1] = tmpEdge.data[i + 1];
                tmpOrig.data[i + 2] = tmpEdge.data[i + 2];
                tmpOrig.data[i + 3] = tmpEdge.data[i + 3];
                edgePx ++;
            }
        }
        tmpCtx.putImageData(tmpOrig, 0, 0);
        

        //add text

        tmpCtx.font = 'bold ' + fontSize + 'px Arial';
        tmpCtx.fillStyle = 'black';

        //Line1
        tmpCtx.fillText("Edge pixel: " + edgePx + " px", 0, tmpCanvas.height - texboxHeight + fontSize);

        //Line2
        tmpCtx.fillText(dateStr, 0, tmpCanvas.height - texboxHeight + (2 * fontSize));
        //end add text


        var dateObj = new Date();

        var tmpLink = document.createElement('a');
        tmpLink.download = 'plantomat' + dateStr + '.png';
        tmpLink.href = tmpCanvas.toDataURL("image/png");
        tmpLink.click();
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
        for (var i=0; i < imageData.data.length; i+=4) {
            if (imageData.data[i] != 0)
                edgePx ++;
        }
        $("#allEdgePixel").html(edgePx + " px");
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
        var color = this.colorPicker.getColor();
        var colorInt = (color.alpha << 24) | (color.blue << 16) | (color.green << 8) | color.red;
        

        var data_u32 = new Uint32Array(imageData.data.buffer);
        var i = img_u8.cols*img_u8.rows, pix = 0;
        var nonAlpha = 0
        while(--i >= 0) {
            pix = img_u8.data[i];
            if(pix != 0){
                data_u32[i] = colorInt;
                nonAlpha ++;
            }else
                data_u32[i] = 0;//alpha | (pix << 16) | (pix << 8) | pix;
            
        }
        $("#lastEdgePixel").html(nonAlpha + " px");

        this.edgeCtx.putImageData(imageData, startX, startY);
        


    }
}

class analyzer{
    constructor(){
        console.log("new analyzer");
    }
}
