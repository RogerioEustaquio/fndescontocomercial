Ext.define('App.view.fndescontocomercial.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'fndescontocomercialmain',
    id: 'descontocomercialmain',
    title: 'Débito',
    requires: [

    ],
    layout: 'fit',
    tbar: {
            border: false,
            items: [
                {
                    xtype: 'fndescontocomercialform'
                }
                ,'->',
                {
                    xtype: 'fndescontocomercialarqform'
                }
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

                //                     var grid = this.up('form').up('toolbar').up('panel').down('#fndescontocomercialgrid');

                //                     var myStore = grid.getStore();
                //                     var aqui = this;

                //                     var dados = new Array();
                //                     dados[0] = '{row:1,col:1,col:2}';
                //                     dados[1] = '{row:2,col:1,col:2}';
                //                     var nome = 'fndesccomercial';
                //                     aqui.params = {dados: [dados],nome: nome};
                //                     aqui.url = BASEURL + '/api/fndescontocomercial/gerarexcel';

                //                    console.log(aqui);

                //                     // Ext.Ajax.request({
                //                     //     url : BASEURL + '/api/fndescontocomercial/gerarexcel',
                //                     //     method: 'POST',
                //                     //     params: {dados: dados,nome: nome},
                //                     //     success: function (response) {
                //                     //         console.log(response.responseText);
                //                     //         var myWin = open("","_self");
                //                     //         myWin.document.write(response);
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