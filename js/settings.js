// Copyright (c) 2021 Manuel Pitz
//
// Licensed under the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>. This file may not be
// copied, modified, or distributed except according to those terms.


class settings {

    multiColor = true;//this is only a temporary approach



    get(name) {
        if (this.hasOwnProperty( name ))
            return this[name];
    }

    exists(name) {
        if (this.hasOwnProperty( name ))
            return true;

        return false;
    }

    set(name, val) {
        if (this.hasOwnProperty( name )){
            this.name = val;
            return true;
        }

        return false
    }

}