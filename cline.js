function exportData(exportDataModule, pid) {
    exportDataModule.model = {
        name: 'model',
        route: `/api/plugin/exportModel?type=json&pid=${pid}`,
        desc: '导出项目接口Model',
    };
}

module.exports = function () {
    this.bindHook('export_data', exportData);
};