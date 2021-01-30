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


    changeEventAttached = false
    selectList = {} 

    constructor(domId) {
        this.domIdName = domId
        this.domObj = $("#" + domId);

        $(this.domObj).attr("class", "radio_select")

    }

    changeEvent (e, that) {
        $(e.target).parent().find("label").removeClass("selected");
        
        $(e.target).parent().find("label[for='"+e.target.id+"']").addClass("selected");

        this.handler(e.target.id, this.hanlderParam);

    }


    addElm(elmName, elmText, elmStyleClass, idIn, imgUrl) {

        var that = this;
        $(this.domObj).append($("<input/>")
            .attr({type: 'radio', name: elmName, value: elmText, id: idIn})
            .change(function(e) { that.changeEvent(e, that) })
        );

        var tmpDom = $("<label/>").attr({
            for : idIn
        });
        $(tmpDom).append($("<img>").attr({
            class : elmStyleClass,
            src : imgUrl
        }));

        $(this.domObj).append(tmpDom)
        
        var that = this;
    }

    attachHandler(handler, param) {
        this.handler = handler
        this.hanlderParam = param
    }


}