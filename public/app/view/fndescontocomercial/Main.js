Ext.define('App.view.fndescontocomercial.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'fndescontocomercialmain',
    id: 'descontocomercialmain',
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