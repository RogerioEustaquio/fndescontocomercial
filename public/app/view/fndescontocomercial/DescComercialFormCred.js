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
                                                        var dados = new Array();
                                                        for(var i=0;i<records.length;i++){
                                                            objSoma.credito = parseFloat(objSoma.credito) + parseFloat(records[i].getData().valorCredito);
                                                            objSoma.valor = parseFloat(objSoma.valor) + parseFloat(records[i].getData().valor);
                                                            objSoma.mwm = parseFloat(objSoma.mwm) + parseFloat(records[i].getData().valorMwm);

                                                            var data = Ext.Date.format(records[i].get('data'), 'd/m/Y');
                                                            var dtemissao = Ext.Date.format(records[i].get('dataEntrada'), 'd/m/Y');

                                                            dados[i] = 'emp:'+records[i].getData().emp;
                                                            dados[i] += '&idLote:'+records[i].getData().idLote;
                                                            dados[i] += '&lancamento:'+ data;
                                                            dados[i] += '&credito:'+records[i].getData().valorCredito;
                                                            dados[i] += '&complemento:'+records[i].getData().complemento;
                                                            dados[i] += '&nrnf:'+records[i].getData().numeroNota;
                                                            dados[i] += '&dtemissao:'+dtemissao;
                                                            dados[i] += '&nome:'+records[i].getData().nome;
                                                            dados[i] += '&valor:'+records[i].getData().valor;
                                                            dados[i] += '&valorMwm:'+records[i].getData().valorMwm;
                                                            dados[i] += '&mb:0';
                                                            dados[i] += '&dev:';
                                                            dados[i] += '&devValorMwm:0';
                                                            dados[i] += '&comentarioConclusao:'+records[i].getData().comentarioConclusao;
                                                            dados[i] += ";";

                                                            var re = /null/gi;
                                                            var replaceLinha = dados[i];
                                                            dados[i]= replaceLinha.replace(re,'');
                                                        }

                                                        myStore.add({
                                                            emp: '<td colspan="3"> Total </td>',
                                                            valorCredito: objSoma.credito,
                                                            valor: objSoma.valor,
                                                            valorMwm: objSoma.mwm
                                                        });

                                                        // Adicionar dados para parametros button excel
                                                        var btnExcel = me.up('toolbar').down('#fndescontocomercialarqformcred').down('button');
                                                        btnExcel.dado = dados.toString();
                                                        btnExcel.total= 'valorCredito:'+ objSoma.credito+'&valor:'+objSoma.valor+'&valorMwm:'+objSoma.mwm+'&mb:0&devmwm:0';

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