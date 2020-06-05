Ext.define('App.view.fndescontocomercial.DescComercialFormCred', {
    extend: 'Ext.form.Panel',
    xtype: 'fndescontocomercialformcred',
    id: 'fndescontocomercialformcred',
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
                                    id: 'comboempresacred',
                                    itemId: 'comboempresacred',
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
                                    id: 'dtiniciocred',
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
                                    id: 'dtfimcred',
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
                                    id: 'btnconsultarcred',
                                    margin: '28 2 2 2',
                                    handler: function() {

                                        var btnemp        = me.down('#comboempresacred').getSelection().getData().empresa;
                                        var btndtinicio   = me.down('#dtiniciocred').getRawValue();
                                        var btndtfim      = me.down('#dtfimcred').getRawValue();

                                        var myStore =  me.up('panel').down('grid').getStore();
                                        var myproxy = myStore.getProxy();
                                        myproxy.setExtraParams({emp: btnemp,
                                                                dtinicio: btndtinicio,
                                                                dtfim: btndtfim
                                                                });

                                        myStore.load(function(records){

                                                        var objSoma = {credito:0,valor:0,mwm:0};
                                                        for(var i=0;i<records.length;i++){
                                                            objSoma.credito = parseFloat(objSoma.credito) + parseFloat(records[i].getData().valorCredito);
                                                            objSoma.valor = parseFloat(objSoma.valor) + parseFloat(records[i].getData().valor);
                                                            objSoma.mwm = parseFloat(objSoma.mwm) + parseFloat(records[i].getData().valorMwm);
                                                        }

                                                        myStore.add({
                                                            emp: '<td colspan="3"> Total </td>',
                                                            valorCredito: objSoma.credito,
                                                            valor: objSoma.valor,
                                                            valorMwm: objSoma.mwm
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