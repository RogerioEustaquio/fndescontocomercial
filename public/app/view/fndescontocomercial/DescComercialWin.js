Ext.define('App.view.fndescontocomercial.DescComercialWin', {
    extend: 'Ext.window.Window',
    xtype: 'descontocomercialwin',
    title: 'Notas',
    height: 300,
    width: 600,
    layout: 'fit',
    items: {  // Let's put an empty grid in just to illustrate fit layout
        xtype: 'fndescontocomercialgridnf'
    }
});