const baseController = require('controllers/base.js');
const interfaceModel = require('models/interface.js');
const projectModel = require('models/project.js');
const interfaceCatModel = require('models/interfaceCat.js');
const yapi = require('yapi.js');
const template = require('art-template');


class exportModelController extends baseController {
    constructor(ctx) {
        super(ctx);
        this.catModel = yapi.getInst(interfaceCatModel);
        this.interModel = yapi.getInst(interfaceModel);
        this.projectModel = yapi.getInst(projectModel);
    }

    async handleListClass(pid, status) {
        let result = await this.catModel.list(pid),
            newResult = [];
        for (let i = 0, item, list; i < result.length; i++) {
            item = result[i].toObject();
            list = await this.interModel.listByInterStatus(item._id, status);
            list = list.sort((a, b) => {
                return a.index - b.index;
            });
            if (list.length > 0) {
                item.list = list;
                newResult.push(item);
            }
        }

        return newResult;
    }

    handleExistId(data) {
        function delArrId(arr, fn) {
            if (!Array.isArray(arr)) return;
            arr.forEach(item => {
                delete item._id;
                delete item.__v;
                delete item.uid;
                delete item.edit_uid;
                delete item.catid;
                delete item.project_id;

                if (typeof fn === 'function') fn(item);
            });
        }

        delArrId(data, function (item) {
            delArrId(item.list, function (api) {
                delArrId(api.req_body_form);
                delArrId(api.req_params);
                delArrId(api.req_query);
                delArrId(api.req_headers);
                if (api.query_path && typeof api.query_path === 'object') {
                    delArrId(api.query_path.params);
                }
            });
        });

        return data;
    }

    async exportData(ctx) {
        let pid = ctx.request.query.pid;
        let type = ctx.request.query.type;
        let status = ctx.request.query.status;

        if (!pid) {
            ctx.body = yapi.commons.resReturn(null, 200, 'pid 不为空');
        }
        // let curProject;
        try {
            // curProject = await this.projectModel.get(pid);
            ctx.set('Content-Type', 'application/octet-stream');
            const list = await this.handleListClass(pid, status);

            switch (type) {
                case 'OpenAPIV2':
                    { //in this time, only implemented OpenAPI V2.0
                        let data = this.handleExistId(list);
                        let model = convertToJava(data);
                        ctx.set('Content-Disposition', `attachment; filename=model.java`);
                        return (ctx.body = model);
                    }
                default:
                    {
                        ctx.body = yapi.commons.resReturn(null, 400, 'type 无效参数')
                    }
            }
        } catch (error) {
            yapi.commons.log(error, 'error');
            ctx.body = yapi.commons.resReturn(null, 502, '下载出错');
        }
    }
}

function convertToJava(list) {
    let models = [];
    for (let aptTag of list) {
        for (let api of aptTag.list) {
            let apiItem = {};
            apiItem['className'] = generateClassNameByPath(api.path, 'Req');
            apiItem['parameters'] = (() => {
                let paramArray = [];
                for (let p of api.req_params) { //Path parameters
                    paramArray.push({
                        name: p.name,
                        type: 'String' //always be type string
                    });
                }
                for (let p of api.req_query) {
                    paramArray.push({
                        name: p.name,
                        type: 'String' //always be type string
                    });
                }
                switch (api.req_body_type) {
                    case 'form':
                        {
                            for (let p of api.req_body_form) {
                                paramArray.push({
                                    name: p.name,
                                    type: p.type === 'text' ? 'String' : 'File' //in this time .formData type have only text or file
                                });
                            }
                            break;
                        }
                    case 'json':
                        {
                            if (api.req_body_other) {
                                let jsonParam = JSON.parse(api.req_body_other);
                                if (jsonParam) {
                                    paramArray.push({
                                        name: 'root',
                                        schema: jsonParam //as same as swagger's format
                                    });
                                }
                            }
                            break;
                        }
                    case 'file':
                        {
                            paramArray.push({
                                name: 'uploadFile',
                                type: 'File'
                            });
                            break;
                        }
                    case 'raw':
                        {
                            paramArray.push({
                                schema: {
                                    type: 'String',
                                    format: 'binary'
                                }
                            });
                            break;
                        }
                    default:
                        break;
                }
                return paramArray;
            })();
            let object = template(__dirname + '/template/java/object.art', apiItem);
            models.push(object);
        }
    }
    return models;
}

function generateClassNameByPath(path, suffix) {
    return path.split('/').map((value) => {
        return value.replace(/^\S/, s => s.toUpperCase());
    }).join('') + suffix;
}

module.exports = exportModelController;
