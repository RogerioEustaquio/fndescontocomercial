Ext.define('App.view.fndescontocomercial.DescComercialConcluiWin', {
    extend: 'Ext.window.Window',
    xtype: 'descontocomercialconcluiwin',
    id: 'descontocomercialconcluiwin',
    title: 'Notas',
    height: 400,
    width: 860,
    layout: 'vbox',
    border: false,
    items: [
        {
            xtype: 'form',
            id: 'formnf',
            layout: 'hbox',
            width: '100%',
            border: true,
            layout: {
                type: 'hbox'
            },
            defaults: {
                labelAlign: 'top'
            },
            items:[
                {
                xtype:'displayfield',
                fieldLabel: 'NF',
                name: 'nf',
                id: 'nf',
                margin: '2 2 2 2',
                width: 80,
                value: '123'
            },
            {
                xtype:'displayfield',
                fieldLabel: 'Emissão',
                name: 'emissao',
                id: 'emissao',
                margin: '2 2 2 2',
                width: 80,
                value: '01/01/2020'
            },
            {
                xtype:'displayfield',
                fieldLabel: 'Nome',
                name: 'nome',
                id: 'nome',
                margin: '2 2 2 2',
                width: 200,
                value: 'Rogério'
            },
            {
                xtype:'displayfield',
                fieldLabel: 'Valor',
                name: 'valor',
                id: 'valor',
                margin: '2 2 2 2',
                width: 90,
                value: '100.00'
            },
            {
                xtype:'displayfield',
                fieldLabel: 'MWM',
                name: 'mwm',
                id: 'mwm',
                margin: '2 2 2 2',
                width: 90,
                value: '100.00'
            },
            {
                xtype:'displayfield',
                fieldLabel: 'MB',
                name: 'mb',
                id: 'mb',
                margin: '2 2 2 2',
                labelWidth: 90,
                value: '10.00'
            }]
        },
        {
            xtype: 'form',
            id: 'formvconlcusao',
            width: '100%',
            border: false,
            layout: {
                type: 'hbox'
            },
            defaults: {
                labelAlign: 'top'
            },
            items:[
                {
                    xtype: 'textareafield',
                    maxRows: 4,
                    fieldLabel: 'Comentário',
                    name: 'comentario',
                    id: 'comentario',
                    labelWidth: 80,
                    width: 600,
                    margin: '2 2 2 2'                    
                }
            ]
        }
    ],
    bbar:[
        '->',
        {
            xtype: 'form',
            id: 'formconlcusao',
            border: false,
            items:[
                {
                    xtype: 'button',
                    text: 'Concluir',
                    id: 'btnconsultarnf',
                    margin: '2 2 2 2',
                    handler: function(form) {
                    }
                }
            ]
        }
    ]

});