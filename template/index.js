const template = require('art-template');

class templateFacade {
    constructor(jsonObject) {
        this.jsonObject = jsonObject;
        this.ocTemplateH = __dirname + '/oc/object-h.art';
        this.ocTemplateM = __dirname + '/oc/object-m.art';
        this.javaTemplate = __dirname + '/java/object.art';
    }

    get javaObject() {
        return template(this.javaTemplate, this.jsonObject);
    }

    get ocObjectH() {
        return template(this.ocTemplateH, this.jsonObject);
    }

    get ocObjectM() {
        return template(this.ocTemplateM, this.jsonObject);
    }
}

module.exports = templateFacade;