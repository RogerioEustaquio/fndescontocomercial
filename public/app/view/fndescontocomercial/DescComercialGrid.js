Ext.define('App.view.fndescontocomercial.DescComercialGrid',{
    extend: 'Ext.grid.Panel',
    xtype: 'fndescontocomercialgrid',
    id: 'fndescontocomercialgrid',
    itemId: 'fndescontocomercialgrid',
    requires: [
        'Ext.ux.util.Format'
    ],
    constructor: function(config) {

        var me = this;
        var utilFormat = Ext.create('Ext.ux.util.Format');

        Ext.define('App.view.fndescontocomercial.modelgrid', {
            extend: 'Ext.data.Model',
            fields:[{name:'emp',mapping:'emp'},
                    {name:'idLote',mapping:'idLote'},
                    {name:'data',mapping:'data'},
                    {name:'descricao',mapping:'descricao'},
                    {name:'valorDebito',mapping:'valorDebito',type: 'number'},
                    {name:'valorCredito',mapping:'valorCredito',type: 'number'},
                    {name:'complemento',mapping:'complemento'}
                    ]
        });

        var colemp =   {
                            text: 'Emp',
                            width: 52,
                            dataIndex: 'emp'
                        };
        var collote =   {
                            text: 'Lote',
                            width: 120,
                            dataIndex: 'idLote',
                            hidden: false
                        };
        var coldata =  {
                            text: 'Data',
                            dataIndex: 'data',
                            width: 140
                        };
        var coldescri= {
                            text: 'Descrição',
                            dataIndex: 'descricao',
                            width: 110
                        };
        var colvldeb =  {
                            text: 'Vl. Debito',
                            dataIndex: 'valorDebito',  
                            Width: 100,
                            renderer: function (v) {
                                return utilFormat.Value(v);
                            }
                        };
        var colvlcred =  {
            text: 'Vl. Credito',
            dataIndex: 'valorCredito',  
            Width: 100,
            renderer: function (v) {
                return utilFormat.Value(v);
            }
        };
        var colcomp =   {
                            text: 'Complemento',
                            dataIndex: 'complemento',            
                            flex: 1
                        };
        
        var colbtn =   {
            xtype:'actioncolumn',
            width:50,
            align: 'center',
            items: [
                {
                    iconCls: 'fa fa-plus green-text',
                    tooltip: 'NFs',
                    handler: function(grid, rowIndex, colIndex) {

                        var rec = grid.getStore().getAt(rowIndex);
                        var id = rec.get('id');
                        var emp= rec.get('emp');

                        var objWin = Ext.getCmp('descontocomercialwin');

                        if(objWin != null){
                            objWin.destroy();
                        }
                        
                        objWin = Ext.create('App.view.fndescontocomercial.DescComercialWin');
                        objWin.down('toolbar').down('form').down('#empnf').setValue(emp);
                        objWin.show();

                        // console.log(objWin.down('#btnvinculanf'));

                        objWin.down('#btnvinculanf').on('click',function (){
                            // grid.getStore().load();
                            // objWin.close();
                            console.log(rec.getData()); // Dados do boleto
                            console.log(objWin.down('grid').getSelection()[0].getData()); //Dados NF selecionada

                            Ext.Ajax.request({
                                url : BASEURL + '/api/fndescontocomercial/vincularnfboleto',
                                method: 'POST',
                                params: {emp: btnemp,
                                         dtinicio: btndtinicio,
                                         dtfim: btndtfim
                                        },
                                success: function (response) {

                                    var result = Ext.decode(response.responseText);
                                    if(result.success){

                                        console.log(result.data);

                                    }

                                }
                            });
                        });

                    }
                }]
        };

        var arraycolums = [ colemp,
                            collote,
                            coldata,
                            coldescri,
                            colvldeb,
                            colvlcred,
                            colcomp,
                            colbtn
                        ];
        

        Ext.applyIf(me, {

            store: Ext.create('Ext.data.Store', {
                model: 'App.view.fndescontocomercial.modelgrid',
                proxy: {
                    type: 'ajax',
                    method:'POST',
                    url : BASEURL + '/api/fndescontocomercial/descontofinanceiro',
                    encode: true,
                    format: 'json',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                autoLoad: true
            }),
            columns: arraycolums,
            listeners: {
            }

        });

        me.callParent(arguments);

    }


})