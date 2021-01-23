
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

        var startX = 500;
        var startY = 1500;
        var width = 500;
        var height = 500;

        this.convertCanny(startX, startY, width, height)

        console.log("test");
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

        var img_u8 = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);
       
    
        var imageData = this.ctx.getImageData(startX, startY, width, height);

        jsfeat.imgproc.grayscale(imageData.data, width, height, img_u8);

        
        var r = 5;
        var kernel_size = (r+1) << 1;

        jsfeat.imgproc.gaussian_blur(img_u8, img_u8, kernel_size, 0);

        jsfeat.imgproc.canny(img_u8, img_u8, 0, 15);

        // render result back to canvas
        var data_u32 = new Uint32Array(imageData.data.buffer);
        var alpha = (0xff << 24);
        var i = img_u8.cols*img_u8.rows, pix = 0;
        while(--i >= 0) {
            pix = img_u8.data[i];
            if(pix != 0){
                data_u32[i] = alpha;
            }else
                data_u32[i] = 0;//alpha | (pix << 16) | (pix << 8) | pix;
            
        }
        this.ctx.putImageData(imageData, startX, startY);


    }
}

class analyzer{
    constructor(){
        console.log("new analyzer");
    }
}


class rectSelect{

    constructor(elmId) {
        $("#" + elmId).on("click", function(e){alert("test")});
    }


    mousedown() {
        console.log("mousdown")
    }

}