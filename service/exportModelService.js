const JSZip = require('jszip');
const templateFacade = require('../template/facade');
const JsonModel = require('../model/jsonModel');
const { reqJson, resJson } = require('../converter/jsonConverter');
const { bigCamelCase } = require('../utils/stringUtils');

class modelService {
    constructor(apiList) {
        this.apiList = apiList ? apiList : [];
        this.jsZip = new JSZip();
        this.iosDir = this.jsZip.folder('iOS');
        this.androidDir = this.jsZip.folder('Android');
    }

    get zip() {
        for (let apiGroup of this.apiList) {
            for (let api of apiGroup.list) {
                let dirName = bigCamelCase(api.path);

                let reqModel = reqJson(api);
                this.generateModel(reqModel, dirName);

                let resModel = resJson(api);
                this.generateModel(resModel, dirName);
            }
        }
        return this.jsZip.generateAsync({ type: 'nodebuffer' });
    }

    generateModel(model, dirName) {
        if (!(model instanceof JsonModel)) {
            return;
        }
        let className = model.object.className;
        let template = new templateFacade(model.object);

        this.iosDir.folder(dirName).file(`${className}.m`, template.ocObjectM);
        this.iosDir.folder(dirName).file(`${className}.h`, template.ocObjectH);
        this.androidDir.folder(dirName).file(`${className}.java`, template.javaObject);
    }

}

module.exports = modelService;