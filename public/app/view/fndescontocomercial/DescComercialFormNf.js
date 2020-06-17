Ext.define('App.view.fndescontocomercial.DescComercialFormNf', {
    extend: 'Ext.form.Panel',
    xtype: 'fndescontocomercialformnf',
    id: 'fndescontocomercialformnf',
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

        var empbox = Ext.create('Ext.form.field.Display',{
                                    fieldLabel: 'Empresa',
                                    width: 60,
                                    margin: '2 2 2 2',
                                    name: 'empnf',
                                    id: 'empnf'
                                });

        var nrnf = Ext.create('Ext.form.field.Text',{
                        fieldLabel: 'NF',
                        width: 100,
                        margin: '2 2 2 2',
                        name: 'nrnf',
                        id: 'nrnf'
                    });

        var iniemissao = Ext.create('Ext.form.field.Date',{
                        name: 'Emissão',
                        id: 'dtemissaoinicio',
                        fieldLabel: 'Início',
                        margin: '2 2 2 2',
                        width: 135,
                        labelWidth: 35,
                        format: 'd/m/Y',
                        altFormats: 'dmY',
            //            maxValue: new Date(),
                        emptyText: '__/__/____'
                    });
        var fimemissao = Ext.create('Ext.form.field.Date',{
            name: 'Emissão',
            id: 'dtemissaofim',
            fieldLabel: 'Fim',
            margin: '2 2 2 2',
            width: 135,
            labelWidth: 35,
            format: 'd/m/Y',
            altFormats: 'dmY',
//            maxValue: new Date(),
            emptyText: '__/__/____'
        });
        var nomecli = Ext.create('Ext.form.field.Text',{
            fieldLabel: 'Nome',
            width: 200,
            margin: '2 2 2 2',
            name: 'nome',
            id: 'nome',
            enableKeyEvents: true,
            listeners: {
                keyup: function(v) {
                    var valor = v.getValue().toUpperCase();
                    v.setValue(valor);
                }
            }
        });
        var consulta = Ext.create('Ext.Button', {
                                    text: 'Consultar',
                                    id: 'btnconsultarnf',
                                    margin: '28 2 2 2',
                                    handler: function(form) {
                                        
                                        var empnf = form.up('form').down('#empnf').getValue();
                                        var nrnf = form.up('form').down('#nrnf').getValue();
                                        var dtinicio = form.up('form').down('#dtemissaoinicio').getRawValue();
                                        var dtfim = form.up('form').down('#dtemissaofim').getRawValue();
                                        var nome = form.up('form').down('#nome').getRawValue();

                                        if(dtfim && dtinicio == ''){
                                            dtinicio = dtfim;
                                        }

                                        if(nrnf == '' && dtinicio == ''){
                                            Ext.Msg.alert('info', 'Informe numero da Nf ou Data');

                                        }else{

                                            var myStore =  me.up('panel').down('grid').getStore();
                                            var myproxy = myStore.getProxy();
                                            myproxy.setExtraParams({empnf: empnf,
                                                                    nrnf: nrnf,
                                                                    dtinicio: dtinicio,
                                                                    dtfim: dtfim,
                                                                    nome: nome
                                                                    });
                                            myStore.reload();
                                        }
                                    }
                                });

        Ext.applyIf(me, {

            items: [
                empbox,
                nrnf,
                iniemissao,
                fimemissao,
                nomecli,
                consulta
            ]

        });

        me.callParent(arguments);
    },

    gerarExcel: function() {
        var me = this;
        var grid = me.getMainpanel().down('tabpanel').getActiveTab();
        grid.setLoading({ msg: '<b>Gerando Arquivo.' });
        var myStore = me.getStore().getData();

        Ext.Ajax.request({
            url: BASEURL +'/api/fndescontocomercial/gerarexcel',
            method: 'POST',
            params: {dados: myStore,
                     nome: nome},
            success: function (response) {
                        var result = Ext.decode(response.responseText);
                        if(result.success){

                            var rsarray = result.data;
                            console.log(rsarray);

                        }
            }
        });

        window.open(BASEURL + '/temp/' + nome, '_self');
        setTimeout(function() { grid.setLoading(false); }, 10000);
    }
});