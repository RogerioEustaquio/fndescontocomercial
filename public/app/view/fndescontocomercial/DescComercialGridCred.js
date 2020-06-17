Ext.define('App.view.fndescontocomercial.DescComercialGridCred',{
    extend: 'Ext.grid.Panel',
    xtype: 'fndescontocomercialgridcred',
    id: 'fndescontocomercialgridcred',
    itemId: 'fndescontocomercialgridcred',
    requires: [
        'Ext.ux.util.Format'
    ],
    constructor: function(config) {

        var me = this;
        var utilFormat = Ext.create('Ext.ux.util.Format');

        Ext.define('App.view.fndescontocomercial.modelgridcred', {
            extend: 'Ext.data.Model',
            fields:[{name:'emp',mapping:'emp'},
                    {name:'idLote',mapping:'idLote'},
                    {name:'data',mapping:'data', type: 'date', dateFormat: 'd/m/Y'},
                    {name:'descricao',mapping:'descricao'},
                    {name:'valorCredito',mapping:'valorCredito',type: 'number'},
                    {name:'complemento',mapping:'complemento'},
                    {name:'numeroNota',mapping:'numeroNota'},
                    {name:'dataEntrada',mapping:'dataEntrada', type: 'date', dateFormat: 'd/m/Y'},
                    {name:'valor',mapping:'valor',type: 'number'},
                    {name:'valorMwm',mapping:'valorMwm',type: 'number'},
                    {name:'comentarioConclusao',mapping:'comentarioConclusao'}
                    ]
        });

        var colemp =   {
                            text: 'Emp',
                            width: 52,
                            dataIndex: 'emp'
                        };
        var collote =   {
                            text: 'Lote',
                            width: 80,
                            dataIndex: 'idLote',
                            hidden: false
                        };
        var coldata =  {
                            text: 'Lançamento',
                            dataIndex: 'data',
                            width: 100,
                            renderer: function (v) {
                                var dt =  Ext.Date.format(v, 'd/m/Y');
                                return dt;
                                
                            }
                        };
        var colvlcred =  {
                            text: 'Credito',
                            dataIndex: 'valorCredito',  
                            width: 100,
                            renderer: function (v) {
                                return utilFormat.Value(v);
                            }
                        };
        var colcomp =   {
                            text: 'Complemento',
                            dataIndex: 'complemento',            
                            flex: 1
                        };
        
        var colnf =  {
            text: 'NF',
            dataIndex: 'numeroNota',  
            width: 80
        };
        var colemissao =  {
            text: 'Entrada',
            dataIndex: 'dataEntrada',
            width: 90,
            renderer: function (v) {
                var dt =  Ext.Date.format(v, 'd/m/Y');
                return dt;
            }
            // renderer: Ext.util.Format.dateRenderer('d/m/Y H:i')
        };
        var colnome =  {
            text: 'Nome',
            dataIndex: 'nome',  
            width: 120
        };

        var colvalor =  {
            text: 'Valor',
            dataIndex: 'valor',  
            width: 80,
            renderer: function (v) {
                return utilFormat.Value(v);
            }
        };

        var colrob =  {
            text: 'Valor MWM',
            dataIndex: 'valorMwm',  
            width: 96,
            renderer: function (v) {
                return utilFormat.Value(v);
            }
        };

        var colcoment =  {
            text: 'Conclusão',
            dataIndex: 'comentarioConclusao',  
            width: 80,
            hidden: true
        };

        var colbtn =   {
            xtype:'actioncolumn',
            dataIndex: 'actioncolumncred',  
            width:50,
            align: 'center',
            items: [
                {
                    iconCls: 'fa fa-plus blue-text',
                    tooltip: 'NFs',
                    getClass: function (value, meta, record) {
                        
                        if(record.get('emp').length > 3){
                            return 'x-hidden'; // when u want to hide icon
                        }else{
                            return 'fa fa-plus blue-text' ;
                        }
                    },
                    handler: function(grid, rowIndex, colIndex) {

                        var btnplus = this;
                        grid.getSelectionModel().select(rowIndex);
                        var rec = grid.getStore().getAt(rowIndex);

                        var objWin = Ext.getCmp('descontocomercialwincred');

                        if(objWin != null){
                            objWin.destroy();
                        }
                        
                        objWin = Ext.create('App.view.fndescontocomercial.DescComercialWinCred');
                        objWin.down('toolbar').down('form').down('#empnf').setValue(rec.get('emp'));
                        objWin.down('#idlancamento').setValue(rec.get('idLote'));
                        objWin.setTitle(rec.get('complemento'));
                        objWin.show();
                        var urlAction = '/api/fndescontocomercial/inserirvinculonf';

                        if(rec.get('numeroNota')){ // Verificar se possível realizar alteração
                            btnplus.setDisabled(true);
                            objWin.down('#btnvinculanfcred').setDisabled(true);

                            Ext.Msg.show({
                                message: 'Já existe nota vinculada. Deseja continuar?',
                                buttons: Ext.Msg.YESNO,
                                fn: function(btn) {
                                    
                                    if (btn === 'yes') {
                                        objWin.down('#btnvinculanfcred').setDisabled(false);
                                        // Verificar permissão do usuário
                                        urlAction = '/api/fndescontocomercial/alterarvinculonf'

                                    }else{
                                        objWin.close();
                                    }
                                }
                            });
                        }

                        objWin.down('#btnvinculanfcred').on('click',function (){

                            var dadosnf = objWin.down('grid').getSelection();

                            if(dadosnf== ''){
                                Ext.Msg.alert('info', 'Selecione uma NF');

                            }else{
                                dadosnf = dadosnf[0].getData();

                                var param = {
                                    emp: rec.get('emp'),
                                    idlote: rec.get('idLote'),
                                    dtboleto: rec.get('data'),
                                    nrnf: dadosnf.numeroNf,
                                    dtemissao: dadosnf.dataEntrada,
                                    idpessoa: dadosnf.idPessoa
                                };

                                Ext.Ajax.request({
                                    url : BASEURL + urlAction,
                                    method: 'POST',
                                    params: param,
                                    success: function (response) {

                                        var result = Ext.decode(response.responseText);
                                        if(result.success){

                                            // console.log(result.message);
                                            // Ext.Msg.alert('info', result.message);
                                            rec.set('numeroNota',dadosnf.numeroNf);
                                            rec.set('dataEntrada',dadosnf.dataEntrada);
                                            rec.set('nome',dadosnf.nome);
                                            rec.set('valor',dadosnf.valor);
                                            rec.set('valorMwm',dadosnf.valorMwm);

                                            objWin.down('#btnvinculanfcred').setDisabled(true);
                                            btnplus.setDisabled(true);
                                            objWin.close();

                                        }else{
                                            Ext.Msg.alert('info', result.message);
                                        }

                                    }
                                });
                            }
 
                            
                        });

                    }
                }]
        };

        var colbtn2 =   {
            xtype:'actioncolumn',
            id: 'actioncolumncred2', 
            dataIndex: 'actioncolumncred2',  
            width:50,
            align: 'center',
            items: [
                {
                    iconCls: 'fa fa-check',
                    tooltip: 'Conclusão',
                    getClass: function (value, meta, record) {

                        if(record.get('emp').length > 3){
                            return 'x-hidden'; // when u want to hide icon
                        }else{
                            var corcss = 'red-text';
                            if(record.get('numeroNota') == null){
                                return 'x-hidden';
                            }else{

                                if(record.get('comentarioConclusao') == null){
                                    corcss = 'orange-text' ;
    
                                }else{
                                    corcss = 'green-text' ;
                                }
                            }

                            return 'fa fa-check '+ corcss ;
                        }
                    },
                    handler: function(grid, rowIndex, colIndex) {

                        grid.getSelectionModel().select(rowIndex);
                        var rec = grid.getStore().getAt(rowIndex);

                        var objWin = Ext.getCmp('descontocomercialconcluiwin');

                        if(objWin != null){
                            objWin.destroy();
                        }
                        
                        objWin = Ext.create('App.view.fndescontocomercial.DescComercialConcluiWin');
                        objWin.setTitle(rec.get('complemento'));
                        objWin.show();

                        var formnf = objWin.down('#formnf');
                        
                        formnf.down('#nf').setValue(rec.get('numeroNota'));
                        var dtEmissao = Ext.Date.format(rec.get('dataEntrada'), 'd/m/Y');
                        formnf.down('#emissao').setValue(dtEmissao);
                        formnf.down('#emissao').setFieldLabel('Entrada');
                        formnf.down('#nome').setValue(rec.get('nome'));
                        formnf.down('#valor').setValue(rec.get('valor'));
                        formnf.down('#mwm').setValue(rec.get('valorMwm'));
                        formnf.down('#mb').setValue(rec.get('mb'));

                        objWin.down('#formvconlcusao').down('textareafield').setValue(rec.get('comentarioConclusao'));

                        objWin.down('#btnconsultarnf').on('click',function (){

                            var formc = objWin.down('#formvconlcusao');
                            var comentario = formc.down('#comentario').getValue();

                            if(comentario.length<2){
                                Ext.Msg.alert('info', 'Comentário invalido. ('+comentario+')');
                                return '';
                            }

                            var param = {
                                emp: rec.get('emp'),
                                idlote: rec.get('idLote'),
                                dtboleto: rec.get('data'),
                                nrnf: rec.get('numeroNota'),
                                dtemissao: dtEmissao,
                                comentario: comentario
                            };

                            Ext.Ajax.request({
                                url : BASEURL + '/api/fndescontocomercial/concluirvinculonf',
                                method: 'POST',
                                params: param,
                                success: function (response) {

                                    var result = Ext.decode(response.responseText);
                                    if(result.success){

                                        rec.set('comentarioConclusao',comentario);
                                        objWin.close();

                                    }else{
                                        Ext.Msg.alert('info', result.message);
                                    }

                                }
                            });

                        }
                );

                        
                    }
                }]
        };

        var arraycolums = [ colemp,
                            collote,
                            coldata,
                            colvlcred,
                            colcomp,
                            colnf,
                            colemissao,
                            colnome,
                            colvalor,
                            colrob,
                            colcoment,
                            colbtn,
                            colbtn2
                          ];
        
        Ext.applyIf(me, {

            store: Ext.create('Ext.data.Store', {
                model: 'App.view.fndescontocomercial.modelgridcred',
                proxy: {
                    type: 'ajax',
                    method:'POST',
                    url : BASEURL + '/api/fndescontocomercial/descontofinanceirocred',
                    encode: true,
                    format: 'json',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                autoLoad: false
            }),
            columns: arraycolums,
            listeners: {
            }

        });

        me.callParent(arguments);

    }


})