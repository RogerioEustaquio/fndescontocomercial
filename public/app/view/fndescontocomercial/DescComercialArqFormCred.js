Ext.define('App.view.fndescontocomercial.DescComercialArqFormCred', {
    extend: 'Ext.form.Panel',
    xtype: 'fndescontocomercialarqformcred',
    id: 'fndescontocomercialarqformcred',
    layout: {
        type: 'hbox'
    },
    border: false,
    defaults: {
        labelAlign: 'top'
    },
    constructor: function() {
        var me = this;
        var dados = new Array();

        var params = {
            nome: 'fndesccomercial',
            dados: dados
        };

        Ext.applyIf(me, {
            items: {
                xtype: 'button',
                iconCls: 'fa fa-table',
                tooltip: 'Planilha',
                text: 'xls',
                margin: '28 2 2 2',
                dado : '',
                total: '',
                handler: function(){

                    var win = open('','forml');
                    var link = BASEURL + '/api/fndescontocomercial/gerarexcel';
                    var dados = this.dado;

                    var input = "<input type='hidden' name='dados' value='"+dados+"'></input>";
                    input +=  " <input type='hidden' name='nome' value='fndesccomercial'></input>";
                    input +=  " <input type='hidden' name='total' value='"+this.total+"'></input>";

                    var html = "<html><body><form id='forml' method='POST' action='"+link+"'> " +input+" </form></body></html>"

                    win.document.write(html);
                    win.document.close();
                    win.document.getElementById('forml').submit();
                }
            }

        });

        me.callParent(arguments);
    }
});