Ext.define('App.view.fndescontocomercial.DescComercialGridNf',{
    extend: 'Ext.grid.Panel',
    xtype: 'fndescontocomercialgridnf',
    id: 'fndescontocomercialgridnf',
    itemId: 'fndescontocomercialgridnf',
    requires: [
        'Ext.ux.util.Format'
    ],
    constructor: function(config) {

        var me = this;
        var utilFormat = Ext.create('Ext.ux.util.Format');

        Ext.define('App.view.fndescontocomercial.modelgridnf', {
            extend: 'Ext.data.Model',
            fields:[{name:'emp',mapping:'emp'},
                    {name:'numeroNf',mapping:'numeroNf'},
                    {name:'idPessoa',mapping:'idPessoa'},
                    {name:'nome',mapping:'nome'},
                    {name:'dataEmissao',mapping:'dataEmissao'},
                    {name:'valor',mapping:'valor',type: 'number'}
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
                            text: 'Emissão',
                            dataIndex: 'dataEmissao',  
                            Width: 100
                        };
        var colvalor =  {
            text: 'Valor',
            dataIndex: 'valor',  
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
                            colvalor
                        ];
        

        Ext.applyIf(me, {

            store: Ext.create('Ext.data.Store', {
                model: 'App.view.fndescontocomercial.modelgridnf',
                proxy: {
                    type: 'ajax',
                    method:'POST',
                    url : BASEURL + '/api/fndescontocomercial/listarnfs',
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