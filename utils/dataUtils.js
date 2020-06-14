const { bigCamelCase } = require('yapi-plugin-export-model/utils/stringUtils');

class DataType {

    static mapper = {
        string: this.string,
        integer: this.integer,
        boolean: this.boolean,
        array: this.array,
        number: this.number,
        object: this.object,
        null: this.null,
        file: this.file
    }

    static get string() {
        return {
            isBase: false,
            java: 'String',
            oc: 'NSString'
        };
    }

    static get integer() {
        return {
            isBase: true,
            java: 'int',
            oc: 'int'
        };
    }

    static get boolean() {
        return {
            isBase: true,
            java: 'boolean',
            oc: 'BOOL'
        };
    }

    static get array() {
        return {
            isBase: false,
            java: 'List',
            oc: 'NSArray'
        };
    }

    static get number() {
        return {
            isBase: false,
            java: 'Float',
            oc: 'NSNumber'
        };
    }

    static get object() {
        return {
            isBase: false,
            java: 'Object',
            oc: 'id'
        };
    }

    static get null() {
        return {
            isBase: true,
            java: 'null',
            oc: 'nil'
        };
    }

    static get file() {
        return {
            isBase: false,
            java: 'File',
            oc: 'File'
        }
    }

    static get(type) {
        type = type.toLowerCase();
        if(!this.mapper[type]) {
            return {
                isBase: false,
                java: bigCamelCase(type),
                oc: bigCamelCase(type)
            };
        }
        return this.mapper[type];
    }

    static other(javaType, ocType) {
        return {
            isBase: false,
            java: bigCamelCase(javaType),
            oc: bigCamelCase(ocType)
        };
    }
}

module.exports = DataType;
