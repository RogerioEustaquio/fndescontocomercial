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
                                    name: 'empresas',
                                    id: 'empresas',
                                    width: 200,
                                    margin: '2 2 2 2',
                                    store: Ext.data.Store({
                                        fields: [{ name: 'coditem' }, { name: 'descricao' }],
                                        proxy: {
                                            type: 'ajax',
                                            url: BASEURL + '/api/fndescontocomercial/listarempresas',
                                            reader: {
                                                type: 'json',
                                                root: 'data'
                                            }
                                        }
                                    }),
                                    queryParam: 'codigo',
                                    queryMode: 'remote',
                                    displayField: 'nome',
                                    emptyText: 'Emp',
                                    forceSelection: true,
                                    disabled: false,
                                    listeners: {
                                    }
                                });

        var dtinicio = Ext.create('Ext.form.field.Date',{
                                    name: 'dtinicio',
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
                                    fieldLabel: 'Data',
                                    margin: '2 2 2 2',
                                    width: 135,
                                    labelWidth: 35,
                                    format: 'd/m/Y',
                                    altFormats: 'dmY',
                        //            maxValue: new Date(),
                                    emptyText: '__/__/____'
                                });

        Ext.applyIf(me, {


            items: [
                empbox,
                dtinicio,
                dtfim
            ]

        });

        me.callParent(arguments);
    }
});