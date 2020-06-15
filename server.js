const exportModelController = require('./controller/exportModelController');

module.exports = function(options){
    global.options = options;
    this.bindHook('add_router', function(addRouter){
        addRouter({
            controller: exportModelController,
            method: 'get',
            path: 'exportModel',
            action: 'exportData'
        })
    });
}