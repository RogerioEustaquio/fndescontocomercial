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
                    {name:'data',mapping:'data', type: 'date'},
                    {name:'descricao',mapping:'descricao'},
                    {name:'valorDebito',mapping:'valorDebito',type: 'number'},
                    {name:'valorCredito',mapping:'valorCredito',type: 'number'},
                    {name:'complemento',mapping:'complemento'},
                    {name:'numeroNota',mapping:'numeroNota'},
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
        var collote =   {
                            text: 'Lote',
                            width: 120,
                            dataIndex: 'idLote',
                            hidden: false
                        };
        var coldata =  {
                            text: 'Data',
                            dataIndex: 'data',
                            width: 140,
                            renderer: function (v) { 
                                return Ext.Date.format(v, 'd/m/Y')
                            }
                            // renderer: Ext.util.Format.dateRenderer('d/m/Y H:i')
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
        
        var colnf =  {
            text: 'NF',
            dataIndex: 'numeroNota',  
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

        var colrob =  {
            text: 'Valor MWM',
            dataIndex: 'valorMwm',  
            Width: 100,
            renderer: function (v) {
                return utilFormat.Value(v);
            }
        };
        var colmb =  {
            text: 'MB',
            dataIndex: 'mb',  
            Width: 100,
            renderer: function (v) {
                return utilFormat.Value(v);
            }
        };

        var colbtn =   {
            xtype:'actioncolumn',
            dataIndex: 'actioncolumn',  
            width:50,
            align: 'center',
            items: [
                {
                    iconCls: 'fa fa-plus green-text',
                    tooltip: 'NFs',
                    handler: function(grid, rowIndex, colIndex) {

                        var btnplus = this;
                        grid.getSelectionModel().select(rowIndex);
                        var rec = grid.getStore().getAt(rowIndex);

                        var objWin = Ext.getCmp('descontocomercialwin');

                        if(objWin != null){
                            objWin.destroy();
                        }
                        
                        objWin = Ext.create('App.view.fndescontocomercial.DescComercialWin');
                        objWin.down('toolbar').down('form').down('#empnf').setValue(rec.get('emp'));
                        objWin.down('#idlancamento').setValue(rec.get('idLote'));
                        objWin.show();
                        var urlAction = '/api/fndescontocomercial/inserirvinculonf';

                        if(rec.get('numeroNota')){ // Verificar se possível realizar alteração
                            btnplus.setDisabled(true);
                            objWin.down('#btnvinculanf').setDisabled(true);

                            Ext.Msg.show({
                                message: 'Já existe nota vinculada. Deseja continuar?',
                                buttons: Ext.Msg.YESNO,
                                fn: function(btn) {
                                    
                                    if (btn === 'yes') {
                                        objWin.down('#btnvinculanf').setDisabled(false);
                                        // Verificar permissão do usuário
                                        urlAction = '/api/fndescontocomercial/alterarvinculonf'

                                    }else{
                                        objWin.close();
                                    }
                                }
                            });
                        }

                        objWin.down('#btnvinculanf').on('click',function (){

                            var dadosnf = objWin.down('grid').getSelection();

                            if(dadosnf== ''){
                                Ext.Msg.alert('info', 'Selecione uma NF');

                            }else{
                                dadosnf = dadosnf[0].getData();

                                var param = {
                                    emp: rec.get('emp'),
                                    idlote: rec.get('idLote'),
                                    dtboleto: rec.get('data'),
                                    nrnf: dadosnf.numeroNf,
                                    dtemissao: dadosnf.dataEmissao,
                                    idpessoa: dadosnf.idPessoa
                                };

                                Ext.Ajax.request({
                                    url : BASEURL + urlAction,
                                    method: 'POST',
                                    params: param,
                                    success: function (response) {

                                        var result = Ext.decode(response.responseText);
                                        if(result.success){

                                            // console.log(result.message);
                                            Ext.Msg.alert('info', result.message);
                                            rec.set('numeroNota',dadosnf.numeroNf);
                                            rec.set('valor',dadosnf.valor);
                                            rec.set('valorMwm',dadosnf.valorMwm);
                                            rec.set('mb',dadosnf.mb);

                                            objWin.down('#btnvinculanf').setDisabled(true);
                                            btnplus.setDisabled(true);
                                            objWin.close();

                                        }

                                    }
                                });
                            }
 
                            
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
                            colnf,
                            colvalor,
                            colrob,
                            colmb,
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
                autoLoad: false
            }),
            columns: arraycolums,
            listeners: {
            }

        });

        me.callParent(arguments);

    }


})