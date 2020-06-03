Ext.define('App.view.fndescontocomercial.DescComercialWin', {
    extend: 'Ext.window.Window',
    xtype: 'descontocomercialwin',
    id: 'descontocomercialwin',
    title: 'Notas',
    height: 440,
    width: 860,
    layout: 'fit',
    border: false,
    tbar: [
        {
            xtype: 'fndescontocomercialformnf'
        }
    ],
    items: {  // Let's put an empty grid in just to illustrate fit layout
        xtype: 'fndescontocomercialgridnf'
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
                    id: 'btnvinculanf',
                    margin: '2 2 2 2',
                    handler: function(form) {
                        
                        // console.log(form.up('toolbar').up('window').down('grid').getStore().getData().items);
                    }
                }
            ]
        }
    ]
});