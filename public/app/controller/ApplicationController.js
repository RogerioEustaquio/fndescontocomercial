Ext.define('App.controller.ApplicationController', {
    extend: 'Ext.app.Controller',

    requires: [
        
    ],

    control: {

    },

    routes: {
        'home': { action: 'mainAction' }
    },
    
    getViewport: function(){
        return App.getApplication().getMainView();
    },
    
    init: function() {
        var me = this;

        // Se não tiver logado
        me.mainAction();
    },
    
    mainAction: function(){
        var me = this,
        viewport = me.getViewport();
        
        if(viewport){
            viewport.add({
                itemId: 'applicationtab',
                region: 'center',
                title: 'Relatórios',
                xtype: 'panel',
                layout: 'fit'
            });
        }

        viewportTabs = viewport.down('#applicationtab');

        viewportTabs.add({
                            xtype: 'fndescontocomercialmain',
                            listeners: {
                                destroy: function(){
                                    me.redirectTo('home');
                                }
                            }
                        });

    }
    
});
