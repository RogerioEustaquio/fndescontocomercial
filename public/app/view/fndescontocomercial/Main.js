Ext.define('App.view.fndescontocomercial.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'fndescontocomercialmain',
    id: 'descontocomercialmain',
    title: 'Debito',
    requires: [

    ],
    layout: 'fit',
    tbar: {
            border: false,
            items: [
                {
                    xtype: 'fndescontocomercialform'
                }
                // ,'->',
                // {
                //     xtype: 'form',
                //     layout: {
                //         type: 'hbox'
                //     },
                //     border: false,
                //     defaults: {
                //         labelAlign: 'top'
                //     },
                //     items: {
                //                 xtype: 'button',
                //                 text: 'xls',
                //                 margin: '28 2 2 2',
                //                 url: BASEURL + '/api/fndescontocomercial/gerarexcel',
                //                 handler: function(){

                //                     // var grid = this.up('form').up('toolbar').up('panel').down('#fndescontocomercialgrid');

                //                     // var myStore = grid.getStore();

                //                     // var dados = new Array();
                //                     // dados[0] = '{row:1,col:1,col:2}';
                //                     // dados[1] = '{row:2,col:1,col:2}';
                //                     // var nome = 'fndesccomercial';
                //                     // this.setParams({dados: [dados],nome: nome});
                //                     // console.log(this.params);

                //                     // Ext.Ajax.request({
                //                     //     url : BASEURL + '/api/fndescontocomercial/gerarexcel',
                //                     //     method: 'POST',
                //                     //     params: {dados: dados,nome: nome},
                //                     //     success: function (response) {
                //                     //         console.log(response.responseText);
                //                     //         open(response.responseText);
                //                     //     }
                //                     // });
                //                 }
                //             }
                // }
            ]
        },
    items: [
        {
            xtype: 'fndescontocomercialgrid'
        }
    ]

});