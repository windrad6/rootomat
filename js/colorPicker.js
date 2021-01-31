// Copyright (c) 2020 Manuel Pitz
//
// Licensed under the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>. This file may not be
// copied, modified, or distributed except according to those terms.


class colorPicker{



    selfEn = false
    domObj = Object
    colorRadio = Object
    colorName = ""
    colorLookup = {
        "color_black" : {"red":0,"green":0,"blue":0,"alpha":255},
        "color_red" : {"red":255,"green":0,"blue":0,"alpha":255}, 
        "color_green" : {"red":102,"green":255,"blue":51,"alpha":255}}

    constructor(elmId) {


        this.colorRadio = new radioClass(elmId);
        this.colorRadio.addElm("colorSelect","Black","color_black","color_black",{"color" : "black"})
        this.colorRadio.addElm("colorSelect","Red","color_red","color_red",{"color" : "#ff0000"})
        this.colorRadio.addElm("colorSelect","Green","color_green","color_green",{"color" : "#66ff33"})


        this.colorRadio.attachHandler(this.changeColor, this)
        this.colorRadio.selectElm("color_red", this)

    }

    changeColor(color, that) {
        that.colorName = color;
        console.log(this.colorName)
    }


    getColor() {
        return this.colorLookup[this.colorName]
    }

    enableSelf(enableIn) {
        this.selfEn = enableIn;
    }







}
