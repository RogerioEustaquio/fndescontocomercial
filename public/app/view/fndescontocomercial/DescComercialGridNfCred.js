Ext.define('App.view.fndescontocomercial.DescComercialGridNfCred',{
    extend: 'Ext.grid.Panel',
    xtype: 'fndescontocomercialgridnfcred',
    id: 'fndescontocomercialgridnfcred',
    itemId: 'fndescontocomercialgridnfcred',
    requires: [
        'Ext.ux.util.Format'
    ],
    constructor: function(config) {

        var me = this;
        var utilFormat = Ext.create('Ext.ux.util.Format');

        Ext.define('App.view.fndescontocomercial.modelgridnfcred', {
            extend: 'Ext.data.Model',
            fields:[{name:'emp',mapping:'emp'},
                    {name:'numeroNf',mapping:'numeroNf'},
                    {name:'idPessoa',mapping:'idPessoa'},
                    {name:'nome',mapping:'nome'},
                    {name:'dataEntrada',mapping:'dataEntrada',type:'date', dateFormat: 'd/m/Y'},
                    {name:'valor',mapping:'valor',type: 'number'},
                    {name:'valorMwm',mapping:'valorMwm',type: 'number'},
                    {name:'mb',mapping:'mb',type: 'number'}
                    ]
        });

        var colemp =   {
                            text: 'Emp',
                            width: 52,
                            dataIndex: 'emp'
                        };
        var colnf   =   {
                            text: 'NF',
                            width: 120,
                            dataIndex: 'numeroNf',
                            hidden: false
                        };
        var colidpe =  {
                            text: 'Id Pessoa',
                            dataIndex: 'idPessoa',
                            width: 140
                        };
        var colnome= {
                            text: 'Nome',
                            dataIndex: 'nome',
                            flex:1
                        };
        var colemissao =  {
                            text: 'Entrada',
                            dataIndex: 'dataEntrada',  
                            Width: 100,
                            renderer: function (v) { 
                                return Ext.Date.format(v, 'd/m/Y')
                            }
                        };
        var colvalor =  {
            text: 'Valor',
            dataIndex: 'valor',  
            Width: 100,
            renderer: function (v) {
                return utilFormat.Value(v);
            }
        };
        var colvmwm =  {
            text: 'Valor MWM',
            dataIndex: 'valorMwm',  
            Width: 100,
            renderer: function (v) {
                return utilFormat.Value(v);
            }
        };
        var arraycolums = [ colemp,
                            colnf,
                            colidpe,
                            colnome,
                            colemissao,
                            colvalor,
                            colvmwm
                        ];
        
        Ext.applyIf(me, {

            store: Ext.create('Ext.data.Store', {
                model: 'App.view.fndescontocomercial.modelgridnfcred',
                proxy: {
                    type: 'ajax',
                    method:'POST',
                    url : BASEURL + '/api/fndescontocomercial/listarnfscred',
                    encode: true,
                    format: 'json',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                autoLoad: false
            }),
            columns: arraycolums,
            listeners: {
            }

        });

        me.callParent(arguments);

    }


})