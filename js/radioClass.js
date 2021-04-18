// Copyright (c) 2020 Manuel Pitz
//
// Licensed under the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>. This file may not be
// copied, modified, or distributed except according to those terms.

class radioClass{
    domIdName = ""
    domObj = Object
    handler = Object
    hanlderParam = Object
    radioType = ""


    changeEventAttached = false

    constructor(domId) {
        this.domIdName = domId
        this.domObj = $("#" + domId);

        $(this.domObj).addClass("radio_select")

    }

    changeEvent (e, that) {
        $(e.target).parent().find("label").removeClass("selected");
        $(e.target).parent().find("label[for='"+e.target.id+"']").addClass("selected");

        that.handler(e.target.id, that.hanlderParam);

    }

    selectElm(id) {
        var e = {"target" : Object}
        e.target = $(this.domObj).find("input[id='" + id + "']")[0]
        this.changeEvent(e , this)
    }


    addElm(elmName, elmText, elmStyleClass, idIn, lableElm) {

        var that = this;
        $(this.domObj).append($("<input/>")
            .attr({type: 'radio', name: elmName, value: elmText, id: idIn})
            .change(function(e) { that.changeEvent(e, that) })
        );

        var tmpDom = $("<label/>").attr({
            for : idIn
        });
        if (typeof lableElm.path != "undefined"){
            $(tmpDom).append($("<img>").attr({
                class : elmStyleClass,
                src : lableElm.path})
            );
            this.radioType = "img"
        }else if (typeof lableElm.color != "undefined"){
            $(tmpDom).append($("<div>")
                .attr({
                    class : elmStyleClass})
                .css({"background-color" : lableElm.color})
                .html("&nbsp;")
                );
            this.radioType = "div"
        }


        $(this.domObj).append(tmpDom)
    }

    attachHandler(handler, param) {
        this.handler = handler
        this.hanlderParam = param
    }


}