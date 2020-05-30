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

        var dtemissao = Ext.create('Ext.form.field.Date',{
                        name: 'Emissão',
                        id: 'dtemissao',
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
                                    id: 'btnconsultarnf',
                                    margin: '28 2 2 2',
                                    handler: function(form) {
                                        
                                        var empnf = form.up('form').down('#empnf').getValue();
                                        var nrnf = form.up('form').down('#nrnf').getValue();
                                        var dtemissao = form.up('form').down('#dtemissao').getRawValue();

                                        if(nrnf == '' && dtemissao == ''){
                                            Ext.Msg.alert('info', 'Informe numero da Nf ou Data');

                                        }else{

                                            var myStore =  me.up('panel').down('grid').getStore();
                                            var myproxy = myStore.getProxy();
                                            myproxy.setExtraParams({empnf: empnf,
                                                                    nrnf: nrnf,
                                                                    dtemissao: dtemissao
                                                                    });
                                            myStore.reload();
                                        }
                                    }
                                });

        Ext.applyIf(me, {

            items: [
                empbox,
                nrnf,
                dtemissao,
                consulta
            ]

        });

        me.callParent(arguments);
    }
});