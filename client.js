function exportData(exportDataModule, pid) {
    exportDataModule.model = {
      name: 'model',
      route: `/api/plugin/exportModel?type=OpenAPIV2&pid=${pid}`,
      desc: '导出项目接口文档为Android/IOS的Model'
    };
}

module.exports = function() {
    this.bindHook('export_data', exportData);
};