const { bigCamelCase, javaClassName, ocClassName } = require('yapi-plugin-export-model/utils/stringUtils');
const dataType = require('yapi-plugin-export-model/utils/dataUtils');
const Model = require('yapi-plugin-export-model/converter/model');

/**
 * 处理Query数据
 *
 * @param {json} apiBody
 * @param {str} className
 */
function processQuery(apiBody, className) {
    let model = new Model();
    model.className = className;
    model.paramArray = (() => {
        let paramArray = [];
        for (let p of apiBody.req_query) {
            paramArray.push({
                name: p.name,
                type: dataType.string
            });
        }
        for (let p of apiBody.req_params) { //Path parameters
            paramArray.push({
                name: p.name,
                type: dataType.string
            });
        }
        return paramArray;
    })();
    return model;
}

/**
 * 处理`Raw`数据
 *
 * @param {str} className
 */
function processRaw(className) {
    let model = new Model();
    model.className = className;
    model.paramArray = (() => {
        let paramArray = [];
        paramArray.push({
            name: 'param',
            type: dataType.string
        });
        return paramArray;
    })();
    return model;
}

/**
 * 处理`File`数据
 *
 * @param {str} className
 */
function processFile(className) {
    let model = new Model();
    model.className = className;
    model.paramArray = (() => {
        let paramArray = [];
        paramArray.push({
            name: 'uploadFile',
            type: dataType.file
        });
        return paramArray;
    })();
    return model;
}

/**
 * 处理`Form`数据
 *
 * @param {json} apiBody
 * @param {str} className
 */
function processForm(apiBody, className) {
    let model = new Model();
    model.className = className;
    model.paramArray = (() => {
        let paramArray = [];
        for (let p of apiBody.req_body_form) {
            paramArray.push({
                name: p.name,
                type: p.type === 'text' ? dataType.string : dataType.file //in this time .formData type have only text or file
            });
        }
        return paramArray;
    })();
    return model;
}

/**
 * 处理`json`数据
 *
 * @param {str} className
 * @param {json} jsonParam
 */
function processJson(className, jsonParam) {
    let model = new Model();
    let innerClassArray = [];
    if (jsonParam && jsonParam.type) {
        switch (jsonParam.type) {
            case 'object':
                innerClassArray = [];
                model = processJsonObject(jsonParam, innerClassArray, className);
                if (innerClassArray.length > 0) model.innerClassArray = innerClassArray;
                break;
            case 'array':
                innerClassArray = [];
                model = processJsonArray(jsonParam, innerClassArray, className);
                if (innerClassArray.length > 0) model.innerClassArray = innerClassArray;
                break;
            default:
                model.className = className;
                model.paramArray = (() => {
                    let paramArray = [];
                    paramArray.push({
                        name: 'param',
                        type: dataType.get(jsonParam.type)
                    });
                    return paramArray;
                })();
                break;
        }
    }
    return model;
}

/**
 * 处理`{type:'object'}`对象
 *
 * @param {json} jsonParam 要解析的json对象
 * @param {array} innerClassArray 内部类数组
 * @param {str} className 主类的名称
 */
function processJsonObject(jsonParam, innerClassArray, className) {
    let model = new Model();
    className = className || "";
    innerClassArray = innerClassArray || [];

    model.className = className;
    let paramArray = [];

    if (jsonParam.properties) {
        for (var key in jsonParam.properties) {
            let property = jsonParam.properties[key];
            if (property.type === 'object') {
                innerClassArray.push(processJsonObject(property, innerClassArray, className + "." + key));
                paramArray.push({
                    innerClass: className + "." + key,
                    name: key,
                    type: dataType.get(key)
                });
            } else if (property.type === 'array') {
                var resultObject = processJsonArray(property, innerClassArray, className + '.' + key);
                var javaArrayType = processJavaArrayType(property.items, key, '');
                var ocArrayType = processOcArrayType(property.items, key, '');
                paramArray.push(
                    resultObject &&
                        innerClassArray.map((value) => { return value.className }).indexOf(resultObject.className) > -1 ?
                        {
                            innerClass: resultObject.className,
                            name: key,
                            type: dataType.other(javaArrayType, ocArrayType)
                        } : {
                            name: key,
                            type: dataType.other(javaArrayType, ocArrayType)
                        }
                );
            } else {
                paramArray.push({
                    name: key,
                    type: dataType.get(jsonParam.properties[key].type)
                });
            }
        }
    }
    model.paramArray = paramArray;
    return model;
}

/**
 * 处理`{type:'array'}`对象
 *
 * @param {jsonArray} array 要处理的对象
 * @param {array} innerClassArray 内部类数组
 * @param {str} className 主类名称
 */
function processJsonArray(array, innerClassArray, className) {
    let model = new Model();
    model.className = className;
    let paramArray = [];

    if (!array) return model;
    if (array.type === 'object') {
        innerClassArray.push(processJsonObject(array, innerClassArray, className));
    } else if (array.type === 'array') {
        processJsonArray(array.items, innerClassArray, className);
        var javaArrayType = processJavaArrayType(array.items, className, '');
        var ocArrayType = processOcArrayType(array.items, className, '');
        paramArray.push({
            name: 'list',
            type: dataType.other(javaArrayType, ocArrayType)
        })
        model.paramArray = paramArray;
    } else {
        model = processJsonArray(array.items, innerClassArray, className);
    }
    return model;
}

/**
 * 处理`{type:'array'}`对象的数据类型
 *
 * @param {jsonArray} array 要处理的对象
 * @param {str} objectType item类型
 * @param {str} resultType 最终的数据类型
 */
function processJavaArrayType(array, objectType, resultType) {
    if (array.type === 'array') {
        resultType = `List<${processJavaArrayType(array.items, objectType, resultType)}>`;
    } else if (array.type === 'object') {
        resultType = `List<${javaClassName(objectType)}>`;
    } else {
        resultType = `List<${javaClassName(array.type)}>`;
    }
    return resultType;
}

/**
 * 处理`{type:'array'}`对象的数据类型
 *
 * @param {jsonArray} array 要处理的对象
 * @param {str} objectType item类型
 * @param {str} resultType 最终的数据类型
 */
function processOcArrayType(array, objectType, resultType) {
    if (array.type === 'array') {
        resultType = `NSArray<${processOcArrayType(array.items, objectType, resultType)} *>`;
    } else if (array.type === 'object') {
        resultType = `NSArray<${ocClassName(objectType)} *>`;
    } else {
        resultType = `NSArray<${ocClassName(array.type)} *>`;
    }
    return resultType;
}

/**
 * 生成`Req`的json对象
 *
 * @param {json} apiBody
 */
function reqJson(apiBody) {
    let baseRequest =
    global.options ?
    global.options.baseRequest :
    {
        java: '',
        oc: ''
    };
    let className = bigCamelCase(apiBody.path, "Req");
    let model = new Model();
    switch (apiBody.req_body_type) {
        case 'form':
            model = processForm(apiBody, className);
            break;
        case 'file':
            model = processFile(className);
            break;
        case 'raw':
            model = processRaw(className);
            break;
        case 'json':
            var jsonParam = JSON.parse(apiBody.req_body_other);
            model = processJson(className, jsonParam);
            break;
        default:
            model = processQuery(apiBody, className);
            break;
    }
    model.fatherClass = baseRequest;
    return model;
}

/**
 * 生成`Res`的json对象
 *
 * @param {json} apiBody
 */
function resJson(apiBody) {
    let baseResponse =
    global.options ?
    global.options.baseResponse :
    {
        java: '',
        oc: ''
    };
    let className = bigCamelCase(apiBody.path, "Res");
    let model = new Model();
    if (apiBody.res_body) {
        let jsonParam = JSON.parse(apiBody.res_body);
        model = processJson(className, jsonParam);
    } else {
        model.className = className;
    }
    model.fatherClass = baseResponse;
    return model;
}

module.exports = {
    reqJson,
    resJson
};
