const { bigCamelCase, javaClassName, ocClassName } = require('yapi-plugin-export-model/utils/stringUtils');

class JsonModel {

    object = {};

    set className(className) {
        this.object.className = bigCamelCase(className);
        this.object.javaClassName = javaClassName(className);
        this.object.ocClassName = ocClassName(className);
        return this;
    }

    set fatherClass(fatherClass) {
        this.object.fatherClass = fatherClass;
    }

    set paramArray(paramArray) {
        if (paramArray.constructor === Array && paramArray.length > 0) {
            this.object.paramArray = paramArray;
        }
    }

    set innerClassArray(innerClassArray) {
        if (innerClassArray.constructor === Array && innerClassArray.length > 0) {
            this.object.innerClassArray = innerClassArray.map(innerClass => {return innerClass.object});
        }
    }
}

module.exports = JsonModel;
