function bigCamelCase(str, suffix = '') {
    return str.split(/-|\.|\//).filter((value) => { return value && value.trim() }).map((value) => {
        return value.replace(/^\S/, s => s.toUpperCase());
    }).join('') + suffix;
}

function javaClassName(str, suffix = '') {
    let classArray = str.split(/-|\.|\//).filter((value) => { return value && value.trim() }).map((value) => {
        return value.replace(/^\S/, s => s.toUpperCase());
    });
    if (classArray.length <= 1) return classArray[0];
    return classArray.slice(1).join('') + suffix;
}

function ocClassName(str, suffix = '') {
    return str.split(/-|\.|\//).filter((value) => { return value && value.trim() }).map((value) => {
        return value.replace(/^\S/, s => s.toUpperCase());
    }).join('') + suffix;
}

module.exports = {
    bigCamelCase: bigCamelCase,
    javaClassName: javaClassName,
    ocClassName: ocClassName
};
