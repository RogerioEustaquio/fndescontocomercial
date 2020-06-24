Ext.define('App.view.fndescontocomercial.MainCred', {
    extend: 'Ext.panel.Panel',
    xtype: 'fndescontocomercialmaincred',
    id: 'descontocomercialmaincred',
    title: 'Credito',
    requires: [

    ],
    layout: 'fit',
    tbar: {
            border: false,
            items: [
                {
                    xtype: 'fndescontocomercialformcred'
                }
                ,'->',
                {
                    xtype: 'fndescontocomercialarqformcred'
                }
            ]
        },
    items: [
        {
            xtype: 'fndescontocomercialgridcred'
        }
    ]

});