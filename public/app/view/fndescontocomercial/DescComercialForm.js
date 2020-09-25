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

                                                        var objSoma = {debito:0,valor:0,mwm:0,mb:0,devmwm:0};
                                                        var dados = new Array();
                                                        for(var i=0;i<records.length;i++){
                                                            objSoma.debito = parseFloat(objSoma.debito) + parseFloat(records[i].getData().valorDebito);
                                                            objSoma.valor = parseFloat(objSoma.valor) + parseFloat(records[i].getData().valor);
                                                            objSoma.mwm = parseFloat(objSoma.mwm) + parseFloat(records[i].getData().valorMwm);
                                                            objSoma.mb = parseFloat(objSoma.mb) + parseFloat(records[i].getData().mb);
                                                            objSoma.devmwm = parseFloat(objSoma.devmwm) + parseFloat(records[i].getData().devValorMwm);

                                                            var data = Ext.Date.format(records[i].get('data'), 'd/m/Y');
                                                            var dtemissao = Ext.Date.format(records[i].get('dataEmissao'), 'd/m/Y');

                                                            dados[i] = 'emp:'+records[i].getData().emp;
                                                            dados[i] += '&idLote:'+records[i].getData().idLote;
                                                            dados[i] += '&lancamento:'+ data;
                                                            dados[i] += '&debito:'+records[i].getData().valorDebito;
                                                            dados[i] += '&complemento:'+records[i].getData().complemento;
                                                            dados[i] += '&nrnf:'+records[i].getData().numeroNota;
                                                            dados[i] += '&dtemissao:'+dtemissao;
                                                            dados[i] += '&nome:'+records[i].getData().nome;
                                                            dados[i] += '&valor:'+records[i].getData().valor;
                                                            dados[i] += '&valorMwm:'+records[i].getData().valorMwm;
                                                            dados[i] += '&mb:'+records[i].getData().mb;
                                                            dados[i] += '&dev:'+records[i].getData().dev;
                                                            dados[i] += '&devValorMwm:'+records[i].getData().devValorMwm;
                                                            dados[i] += '&comentarioConclusao:'+records[i].getData().comentarioConclusao;
                                                            dados[i] += ";";

                                                            var re = /null/gi;
                                                            var replaceLinha = dados[i];
                                                            dados[i]= replaceLinha.replace(re,'');

                                                        }

                                                        myStore.add({
                                                            emp: '<td colspan="3"> Total </td>',
                                                            valorDebito: objSoma.debito,
                                                            valor: objSoma.valor,
                                                            valorMwm: objSoma.mwm,
                                                            mb: null,
                                                            mbliq: null,
                                                            devValorMwm: objSoma.devmwm
                                                        });
                                                        
                                                        // Adicionar dados para parametros button excel
                                                        var btnExcel = me.up('toolbar').down('#fndescontocomercialarqform').down('button');
                                                        btnExcel.dado = dados.toString();
                                                        btnExcel.total= 'valorDebito:'+ objSoma.debito+'&valor:'+objSoma.valor+'&valorMwm:'+objSoma.mwm+'&mb:'+objSoma.mb+'&devmwm:'+objSoma.devmwm;

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