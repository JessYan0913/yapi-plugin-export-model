const exportModelController = require('./controller');

module.exports = function(){
    this.bindHook('add_router', function(addRouter){
        addRouter({
            controller: exportModelController,
            method: 'get',
            path: 'exportModel',
            action: 'exportData'
        })
    })
}