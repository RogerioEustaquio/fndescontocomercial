Ext.define('App.view.fndescontocomercial.DescComercialWinCred', {
    extend: 'Ext.window.Window',
    xtype: 'descontocomercialwincred',
    id: 'descontocomercialwincred',
    title: 'Notas',
    height: 440,
    width: 860,
    layout: 'fit',
    border: false,
    tbar: [
        {
            xtype: 'fndescontocomercialformnfcred'
        }
    ],
    items: {  // Let's put an empty grid in just to illustrate fit layout
        xtype: 'fndescontocomercialgridnfcred'
    },
    bbar:[
        {
            xtype: 'displayfield',
            fieldLabel: 'Lancamento',
            margin: '2 2 2 2',
            name: 'idlancamento',
            id: 'idlancamento',
            labelWidth: 70
        },
        '->',
        {
            xtype: 'form',
            border: false,
            items:[
                {
                    xtype: 'button',
                    text: 'Vincular',
                    id: 'btnvinculanfcred',
                    margin: '2 2 2 2',
                    handler: function(form) {
                        
                        // console.log(form.up('toolbar').up('window').down('grid').getStore().getData().items);
                    }
                }
            ]
        }
    ]
});