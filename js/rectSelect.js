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