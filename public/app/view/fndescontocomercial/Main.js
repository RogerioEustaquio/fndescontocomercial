Ext.define('App.view.fndescontocomercial.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'fndescontocomercialmain',
    id: 'descontocomercialmain',
    title: 'Debito',
    requires: [

    ],
    layout: 'fit',
    tbar: {
            border: false,
            items: [
                {
                    xtype: 'fndescontocomercialform'
                }
            ]
        },
    items: [
        {
            xtype: 'fndescontocomercialgrid'
        }
    ]

});