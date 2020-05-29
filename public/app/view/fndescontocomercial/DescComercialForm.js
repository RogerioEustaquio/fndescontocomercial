Ext.define('App.view.fndescontocomercial.DescComercialForm', {
    extend: 'Ext.form.Panel',
    xtype: 'fndescontocomercialform',
    id: 'fndescontocomercialform',
    requires: [

    ],
    layout: {
        type: 'hbox'
    },
    border: false,
    defaults: {
        labelAlign: 'top'
    },
    constructor: function() {
        var me = this;

        var empbox = Ext.create('Ext.form.ComboBox',{
                                    width: 70,
                                    fieldLabel: 'Empresas',
                                    // name: 'empresas',
                                    id: 'comboempresa',
                                    itemId: 'comboempresa',
                                    width: 200,
                                    margin: '2 2 2 2',
                                    store: Ext.data.Store({
                                        fields: [{ name: 'empresa' }, { name: 'nome' }],
                                        proxy: {
                                            type: 'ajax',
                                            url: BASEURL + '/api/fndescontocomercial/listarempresas',
                                            reader: {
                                                type: 'json',
                                                root: 'data'
                                            }
                                        }
                                    }),
                                    queryParam: 'empresa',
                                    queryMode: 'remote',
                                    displayField: 'nome',
                                    emptyText: 'Empresa',
                                    forceSelection: true,
                                    // disabled: false,
                                    listeners: {
                                    }
                                });

        var dtinicio = Ext.create('Ext.form.field.Date',{
                                    name: 'dtinicio',
                                    id: 'dtinicio',
                                    fieldLabel: 'Data',
                                    margin: '2 2 2 2',
                                    width: 135,
                                    labelWidth: 35,
                                    format: 'd/m/Y',
                                    altFormats: 'dmY',
                        //            maxValue: new Date(),
                                    emptyText: '__/__/____'
                                });

        var dtfim = Ext.create('Ext.form.field.Date',{
                                    name: 'dtfim',
                                    id: 'dtfim',
                                    fieldLabel: 'Data',
                                    margin: '2 2 2 2',
                                    width: 135,
                                    labelWidth: 35,
                                    format: 'd/m/Y',
                                    altFormats: 'dmY',
                        //            maxValue: new Date(),
                                    emptyText: '__/__/____'
                                });

        var consulta = Ext.create('Ext.Button', {
                                    text: 'Consultar',
                                    id: 'btnconsultar',
                                    margin: '28 2 2 2',
                                    handler: function() {

                                        var btnemp        = me.down('#comboempresa').getSelection().getData().empresa;
                                        var btndtinicio   = me.down('#dtinicio').getRawValue();
                                        var btndtfim      = me.down('#dtfim').getRawValue();

                                        var myStore =  me.up('panel').down('grid').getStore();
                                        var myproxy = myStore.getProxy();
                                        myproxy.setExtraParams({emp: btnemp,
                                                                dtinicio: btndtinicio,
                                                                dtfim: btndtfim
                                                                });
                                        myStore.reload();

                                        // Ext.Ajax.request({
                                        //     url : BASEURL + '/api/fndescontocomercial/descontofinanceiro',
                                        //     method: 'POST',
                                        //     params: {emp: btnemp,
                                        //              dtinicio: btndtinicio,
                                        //              dtfim: btndtfim
                                        //             },
                                        //     success: function (response) {

                                        //         var result = Ext.decode(response.responseText);
                                        //         if(result.success){

                                        //             var myStore =  me.up('panel').down('grid').getStore();
                                        //             myStore.removeAll();

                                        //             myStore.setData(result.data);

                                        //         }

                                        //     }
                                        // });
                                    }
                                });

        Ext.applyIf(me, {

            items: [
                empbox,
                dtinicio,
                dtfim,
                consulta
            ]

        });

        me.callParent(arguments);
    }
});