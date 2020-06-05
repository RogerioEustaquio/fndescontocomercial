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
                                    width: 90,
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
                                    displayField: 'empresa',
                                    emptyText: 'Empresa',
                                    forceSelection: true,
                                    // disabled: false,
                                    listeners: {
                                    }
                                });

        var dtinicio = Ext.create('Ext.form.field.Date',{
                                    name: 'dtinicio',
                                    id: 'dtinicio',
                                    fieldLabel: 'Início',
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
                                    fieldLabel: 'Fim',
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

                                        myStore.load(function(records){

                                                        var objSoma = {debito:0,valor:0,mwm:0,mb:0};
                                                        for(var i=0;i<records.length;i++){
                                                            objSoma.debito = parseFloat(objSoma.debito) + parseFloat(records[i].getData().valorDebito);
                                                            objSoma.valor = parseFloat(objSoma.valor) + parseFloat(records[i].getData().valor);
                                                            objSoma.mwm = parseFloat(objSoma.mwm) + parseFloat(records[i].getData().valorMwm);
                                                            objSoma.mb = parseFloat(objSoma.mb) + parseFloat(records[i].getData().mb);
                                                        }

                                                        myStore.add({
                                                            emp: '<td colspan="3"> Total </td>',
                                                            valorDebito: objSoma.debito,
                                                            valor: objSoma.valor,
                                                            valorMwm: objSoma.mwm,
                                                            mb: objSoma.mb
                                                        });
                                                     }
                                                    );

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