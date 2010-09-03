/*!
 * Ext JS Library 3.0.0
 * Copyright(c) 2006-2009 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
 
Ext.onReady(function(){

	var AjaxWaiting;
	Ext.Ajax.on('beforerequest', function(){AjaxWaiting = Ext.Msg.wait("contacting R server... please wait...","waiting...");});
	Ext.Ajax.on('requestcomplete', function(){AjaxWaiting.hide();});
	Ext.Ajax.on('requestexception', function(){AjaxWaiting.hide();});	
	
	Ext.form.Field.prototype.msgTarget = 'side';
	Ext.QuickTips.init();

	var modelCount = 0;
	
	function thisModel(){
		return Ext.getCmp('cardLayout').getLayout().activeItem;
	}
		
	function updateVarDetails(){
	
		return false;
	}
	
	function showAnova(){

		if(!Ext.getCmp('modelList').anova)
			return false;
		
		anovaData = Ext.getCmp('modelList').anova;
		
		anovaGrid = new Ext.grid.GridPanel({
			enableHdMenu: false,
			border: false,
			store: {
				xtype: 'jsonstore',
				root: 'anova',
				fields: ['Name','Df','AIC','BIC','logLik','Chisq','Chi Df','Pr(>Chisq)'],
				data: Ext.getCmp('modelList') // has an .anova attached to it 				
			},
			columns: [
				{width: 70, header: 'Name', dataIndex: 'Name'},
				{width: 70, header: 'Df', dataIndex: 'Df'},
				{width: 70, header: 'AIC', dataIndex: 'AIC'},
				{width: 70, header: 'BIC', dataIndex: 'BIC'},
				{width: 70, header: 'logLik', dataIndex: 'logLik'},
				{width: 70, header: 'Chisq', dataIndex: 'Chisq'},
				{width: 70, header: 'Chi Df', dataIndex: 'Chi Df'},
				{width: 70, header: 'Pr(>Chisq)', dataIndex: 'Pr(>Chisq)'}
			]
		});	

		myWin = new Ext.Window({
			iconCls: 'book',
			title: "Analysis of Variance",
			closable: true,
			layout: 'fit',
			height: 55+(24*anovaData.length),
			width: 580,
			autoScroll: true,
			items: anovaGrid		
		});
		myWin.show();
	}
	
	function showCiteWindow(){

		if(!citeWindow){
			citeWindow = new Ext.Window({
				closeAction: 'hide',
				iconCls: 'bib',
				title: "Citing lme4",
				closable: true,
				layout: 'fit',
				height: 400,
				width: 700,
				autoScroll: false,
				items:{
					border: false,
					applyTo: 'citeDiv'
				}
			});	
		}
		citeWindow.show();	
	}
	
	function ResetWorkspaceModel(){

		for(var thisGroup in thisModel().targetGroups){
			removeRandom(thisGroup);
		}
		
		thisModel().fixef.getStore().loadData({"fixef":[{"id": 1,"name": "Intercept","estimate": "","SE": "","assign": "0","factor": "Intercept"}]});
		thisModel().fixef.predictors = new Array();
		thisModel().fixef.predictors[0] = "Intercept";
		
		thisModel().fixef.getTopToolbar().get(3).disable();
		thisModel().fixef.getTopToolbar().get(4).disable();
		
		//thisModel().model = new Object();
		thisModel().targetGroups = new Object();
		thisModel().totalRandomEffects = new Object();		
		thisModel().randomGroupCount = 0;	
		
		//Ext.getCmp('modelList').getStore().getById(thisModel().thisModelNumber).set('Model',"...");
		//updateModelDetails({});
		//Ext.getCmp('anovabutton').disable();
		
	}

	function clearAllTables(){
		numRecords = thisModel().fixef.getStore().getCount();

		for(var i = 0; i < numRecords; i++){
			thisModel().fixef.getStore().getAt(i).set('tvalue',"");
			thisModel().fixef.getStore().getAt(i).set('SE',"");
			thisModel().fixef.getStore().getAt(i).set('estimate',"");
			thisModel().fixef.getStore().getAt(i).commit();
		}


		thisModel().fixef.getTopToolbar().get(3).disable();
		thisModel().fixef.getTopToolbar().get(4).disable();
		
		var k=0;
		for(var thisGroup in thisModel().targetGroups){
			for(var i = 0; i < thisModel().targetGroups[thisGroup].getStore().getCount(); i++){
				thisModel().targetGroups[thisGroup].getStore().getAt(i).set('variance',"");
				thisModel().targetGroups[thisGroup].getStore().getAt(i).set('sd',"");
				thisModel().targetGroups[thisGroup].getStore().getAt(i).commit();
			}			
			thisModel().targetGroups[thisGroup].getTopToolbar().get(3).disable();
			thisModel().targetGroups[thisGroup].getTopToolbar().get(4).disable();
			thisModel().targetGroups[thisGroup].getTopToolbar().get(5).disable();
			thisModel().targetGroups[thisGroup].getTopToolbar().get(6).disable();
			k++;
		}
		//updateModelDetails({});
		//thisModel().model = new Object();
		//Ext.getCmp('modelList').getStore().getById(thisModel().thisModelNumber).set('Model',"...");		
	}
	
	
	function contextMenu(node, e){
	
		if(node.leaf){
			menu = new Ext.menu.Menu({            
				items: []
			});
			
			selectedNodes = Ext.getCmp('tree-panel').getSelectionModel().getSelectedNodes();
			selectedPredictors = new Array();		
			
			if(selectedNodes.length > 1){
				for(var i=0; i < selectedNodes.length; i++){
					thisPredictor = selectedNodes[i].id;
					selectedPredictors[i] = thisPredictor	
					
					menu.add({
						iconCls: 'add',
						thisPredictor: thisPredictor,
						text: 'Add Fixed Effect <b> '+thisPredictor +"</b>",
						handler : function() {addFixef(this.thisPredictor); return false;}			
					});
				}
				menu.add('-');	
				interactionTerm = selectedPredictors.join(':');	
		
				menu.add({
					iconCls: 'add',
					thisPredictor: interactionTerm, 
					text: 'Add Interaction Effect: <b> '+interactionTerm +"</b>",
					handler : function() {addFixef(this.thisPredictor); return false;}
				});
				menu.add('-');	
				
				menu.add({
					iconCls:'folder-add',
					thisPredictor: interactionTerm, 
					text: 'New Random Effects Group: <b> '+interactionTerm +"</b>",
					handler : function() {addRandom(this.thisPredictor);}
				});	
			
				
			} else {
			
				menu.add({
					iconCls: 'add',
					thisPredictor: node.text,
					text: 'Add Fixed Effect <b> '+node.text +"</b>",
					handler : function() {addFixef(this.thisPredictor)}	
				});		
				menu.add('-');	
				menu.add({
					iconCls:'folder-add',
					thisPredictor: node.text,
					text: 'New Random Effects Group: <b> '+node.text +"</b>",
					handler : function() {addRandom(this.thisPredictor)}	
				});			
			}
			e.stopEvent();
			menu.showAt(e.getPoint());	
		}
	}
	
	removeFixed = function(that){
		clearAllTables();
		
		predictor2remove = that.text;
		thisModel().fixef.predictors.remove(predictor2remove);
		while(thisModel().fixef.getStore().find('factor',predictor2remove)> -1){
			removeMe = thisModel().fixef.getStore().find('factor',predictor2remove);
			thisModel().fixef.getStore().removeAt(removeMe);
		}
	}

	function newModel(){
	
		modelCount++;
		
		populateMenu = function(that){
		
			menu2populate = that.items.get(0).menu;
			menu2populate.removeAll();
			predictors = thisModel().fixef.predictors;
			for(var j = 0; j < predictors.length; j++) {
				menu2populate.add({iconCls:'delete', text:predictors[j], handler: function() {removeFixed(this); populateMenu(that); return false;}});
			}		
		}

		var fixedMenu = {
			listeners: {'beforeshow': function() {populateMenu(this)}},
			xtype: 'menu',
			id: 'fixedMenu',
			items:[{
				text: 'Remove Predictor',
				iconCls:'delete',				
				menu:{ 
					id: 'fixefRemoveMenu'
				}
			}]					
		};

		var thisFixef = new Ext.grid.GridPanel({
			enableHdMenu: false,
			header: false,
			anchor:'100%',
			id: 'fixedEffects_' + modelCount,
			bodyStyle:'margin-bottom:10px;',
			store: new Ext.data.GroupingStore({
				reader: fixedReader,
				data: {"fixef":[{"id": 1,"name": "Intercept","estimate": "","SE": "","assign": "0","factor": "Intercept"}]},
				sortInfo:{field: 'assign', direction: "ASC"},
				groupField:'factor'
			}),

			columns: [
				{id:'name',header: "name", width: 60, sortable: false, dataIndex: 'name'},
				{header: "Estimate", align: 'right', width: 20, sortable: false, dataIndex: 'estimate'},
				{header: "SE", align: 'right', width: 20, sortable: false, dataIndex: 'SE'},
				{header: "t value", align: 'right', width: 20, sortable: false, dataIndex: 'tvalue'},
				{header: "Predictor", width: 20, hidden: true, sortable: false, dataIndex: 'factor'}
			],
			
			view: new Ext.grid.GroupingView({
				forceFit:true,
				groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "DF" : "DF"]})'
			}),
			
			tbar: [{iconCls: 'folder-open', menu:fixedMenu},"Fixed Effects",'->',
			{iconCls: 'icon-grid', text:'Cov Matrix', disabled:true, handler: function(){showMatrix("Fixed Effects Covariance Matrix",thisModel().model.fixedCov.fields,thisModel().model.fixedCov.data);}},
			{iconCls: 'icon-grid', text:'Cor Matrix', disabled:true, handler: function(){showMatrix("Fixed Effects Correlation Matrix",thisModel().model.fixedCor.fields,thisModel().model.fixedCor.data);}}
			],

			//title: "Fixed Effects",
			frame:false,
			//hideHeaders: true,
			width: 500,
			autoHeight: true,
			collapsible: true,
			disableSelection: true,
			animCollapse: true
		});
		
		thisFixef.predictors = new Array();
		thisFixef.predictors[0] = "Intercept";
		
		thisFixef.on('render', function() {
			new Ext.dd.DropZone(thisFixef.getView().scroller,{
				getTargetFromEvent: function(e) {return "fixedPanel"},
				ddGroup:'DragDrop',
				overClass:'nodeOverDragzone',
				onNodeDrop: fixedHandler
			});		
		});	

		Ext.getCmp('cardLayout').add({
			id: "Model_"+modelCount,
			bodyStyle:'background-color: #dfe8f6;',
			border: false,
			autoHeight: true,
			layout: 'anchor',
			items:[thisFixef]
		});
		
		Ext.getCmp('cardLayout').getLayout().setActiveItem("Model_"+modelCount);
		Ext.getCmp('currentModelPanel').setTitle("Model "+modelCount);
		Ext.getCmp('modelList').getStore().loadData([[modelCount, '...']],true);
		
		thisModel().thisModelNumber = modelCount;
		thisModel().fixef = thisFixef;
		thisModel().model = new Object();
		thisModel().targetGroups = new Object();
		thisModel().totalRandomEffects = new Object();		
		thisModel().randomGroupCount = 0;
		
		Ext.getCmp('modelList').getSelectionModel().selectRow(modelCount-1);
		Ext.getCmp('modelList').getSelectionModel().on('rowselect',setModelWorkspace);		
		
		//thisModel().getEl().hide().fadeIn({easing: 'easeOut', duration:.5});
		updateModelDetails({});
	}
	
	function setModelWorkspace(model,row,record){
		//row equals model number
		Ext.getCmp('cardLayout').getLayout().setActiveItem(row+1);
		//thisModel().getEl().hide().fadeIn({duration:.5});
		Ext.getCmp('currentModelPanel').setTitle("Model "+(row+1));
		updateModelDetails(thisModel().model)
	}


	function updateParameters(modelFit){
	
		//update fixed effects grid
		thisModel().fixef.getStore().loadData(modelFit);
		thisModel().fixef.getTopToolbar().get(3).enable();
		thisModel().fixef.getTopToolbar().get(4).enable();
		
		if(modelFit.anova) {
			Ext.getCmp('modelList').anova = modelFit.anova;
			Ext.getCmp('anovabutton').enable();
		} else {
			Ext.getCmp('modelList').anova = null;
			Ext.getCmp('anovabutton').disable();
		}
		//update random effects grids
		var k=0;
		for(var thisGroup in thisModel().targetGroups){
			thisModel().targetGroups[thisGroup].getStore().loadData(modelFit.randomCovMatrices[k]);
			thisModel().targetGroups[thisGroup].getTopToolbar().get(3).enable();
			thisModel().targetGroups[thisGroup].getTopToolbar().get(4).enable();
			thisModel().targetGroups[thisGroup].getTopToolbar().get(5).enable();
			thisModel().targetGroups[thisGroup].getTopToolbar().get(6).enable();
			
			thisModel().targetGroups[thisGroup].getTopToolbar().get(5).randomGroupCount = k;
			thisModel().targetGroups[thisGroup].getTopToolbar().get(6).randomGroupCount = k;			
			
			k++;
		}
		Ext.getCmp('modelList').getStore().getById(thisModel().thisModelNumber).set('Model',modelFit.formula);
		if(reportWindow){
			Ext.getCmp('reportWindow').destroy();
			reportWindow = null;
		}
		updateModelDetails(modelFit);
	}

	function fitModel(){
	
		if(Ext.getCmp('dependent').validate()){
			dependent = Ext.getCmp('dependent').value;
			DVfamily = Ext.getCmp('family').value;
			reml = Ext.getCmp('reml').value;
			//fixedIV = thisModel().fixef.getStore().collect('name');
			fixedIV = thisModel().fixef.predictors;
			dataFile = Ext.getCmp('tree-panel').dataFile;
			randomIV = new Array();
			thisModelNumber = thisModel().thisModelNumber;
			var k = 0;
			for(var thisGroup in thisModel().targetGroups){
				k++;
				if(thisModel().targetGroups[thisGroup].predictors.length == 0){
				
					alert("A Random Effects group '" + thisGroup.substring(3) + "' has no predictors in it! \n Add predictors or remove this group.");
					thisModel().targetGroups[thisGroup].getEl().highlight('ff0000', { attr: 'color', duration: 1 });					
					return false;
				}
				//randomIV[randomIV.length] = {"group":thisGroup.substring(3), "predictors":thisModel().targetGroups[thisGroup].getStore().collect('name')};
				randomIV[randomIV.length] = {"group":thisGroup.substring(3), "varName":thisGroup, "predictors":thisModel().targetGroups[thisGroup].predictors};
			}
			if(k==0){
				alert("Your model has no random effect terms!\n\nRight mouse-click a variable from the menu to add random effect groups.");
				return false;
			}
			request = {"thisModelNumber":thisModelNumber, "reml":reml, "dependent":dependent, "DVfamily":DVfamily, "fixedIV":fixedIV, "randomIV":randomIV};
			
			successFn = function(robjects, files){
				updateParameters(robjects.modelFit);
				thisModel().model = result.modelFit;
				Ext.getCmp('reportbutton').enable();
			}
			
			RExecuteScript({
				scriptname:'lme-model',
				inputs: {'lmeRequest': request},
				robjects: ["output"],
				//files: ["plot.png"],
				success: successFn
			});
		}
	}

	function fixedHandler(target, dd, e, data){

		if(data.node.leaf == true){
			addFixef(data.node.id);
		}		
	}
	
	function addFixef(predictor){
	
		targetGrid = thisModel().fixef;
		if(targetGrid.predictors.Contains(predictor)) {alert("This predictor is already in the model!"); return;}
		else {
			targetGrid.getStore().loadData({fixef:[{"id":predictor,"name":predictor,"factor":predictor}]},true); 
			targetGrid.predictors.push(predictor);	
		}
		clearAllTables();
	}
	
	function randomHandler(target, dd, e, data){
	
		if(data.node.leaf){
		
			predictor = data.node.id;
			
			targetGrid = thisModel().targetGroups[target];
			if(thisModel().totalRandomEffects[target.substring(3)].Contains(predictor)) {alert("This predictor is already in the model!")}

			else {
				targetGrid.getStore().loadData({variances:[{"id":predictor,"name":predictor,"factor":predictor}]},true); 
				targetGrid.predictors.push(predictor);
				
				thisModel().totalRandomEffects[target.substring(3)].push(predictor);
			}
			clearAllTables();
		}
	}

	var variableStore = new Ext.data.JsonStore({
		root:'children',
		idProperty: 'id',
		fields: [
			'id',
			'text'
		]
	});
	
	var dependent = new Ext.form.ComboBox({
		allowBlank: false,
		triggerAction: 'all',
		fieldLabel: 'Dependent', 
		forceSelection: true,		
		mode: 'local',
		id: 'dependent',
		typeAhead: false,
		editable: false,
		listeners: {'change': function() {clearAllTables();} },
		//allowBlank: false, 
		//emptyText: "Dependent Variable", 
		width: 150,
		blankText: "This field is required!",
		store: variableStore,
		valueField: 'id',
		displayField: 'text'		
	});
	
	var groupingVar = new Ext.form.ComboBox({
		triggerAction: 'all',
		editable: false,
		id: 'groupingVar',
		fieldLabel: 'Grouping', 
		forceSelection: true,
		mode: 'local',
		store: variableStore, 
		typeAhead: false, 
		emptyText: "Grouping", 
		width: 100,
		valueField: 'id',
		displayField: 'text'		
	});
	
	
	var mainPanel = {
		anchor:'100%',
		//bodyStyle:'margin-bottom: 3px; padding:5px;',
		autoHeight: true,
		xtype:'fieldset',
		collapsible: true,
		frame: false,
		title: "General Properties",
		items: [dependent, {fieldLabel:'Family', value: "gaussian", triggerAction: 'all', id:'family', mode: 'local', typeahead: true, editable: false, xtype: 'combo', width: 150, store:['gaussian','binomial','Gamma','inverse.gaussian','poisson','quasi','quasibinomial','quasipoisson'],listeners: {'change': function() {clearAllTables(); if(this.value == "gaussian") {Ext.getCmp('reml').setValue(true).enable();} else {Ext.getCmp('reml').setValue(false).disable();}}}}]
	}
	
	var optionalPanel = {
		anchor:'100%',
		//bodyStyle:'margin-bottom: 3px; padding:5px;',
		autoHeight: true,
		xtype:'fieldset',
		collapsible: true,
		frame: false,
		title: "Options",
		collapsed: true,
		items: [{fieldLabel:'REML', value: true, triggerAction: 'all', id: 'reml', mode: 'local', editable: false, xtype: 'combo', width: 150, store:[true,false],listeners: {'change': function() {clearAllTables();}}}]
	}	

    var fixedReader = new Ext.data.JsonReader({
	
		root: 'fixef',
		idProperty: 'id', 
		fields: [
		   {name: 'id'},
		   {name: 'name'},
		   {name: 'estimate'},
		   {name: 'SE'},
		   {name: 'assign'},	
		   {name: 'tvalue'},		   
		   {name: 'factor'}
		]
    });
	
	var randomReader = new Ext.data.JsonReader({
	
		root: 'variances',
		idProperty: 'id', 
		fields: [
			{name: 'id'},
			{name: 'name'},
			{name: 'variance'},
			{name: 'sd'}
		]
	});
	
	function showMatrix(title,fields,data){
		
		var columns = new Array();
		for(var i = 0; i < fields.length; i++){
			columns[i] = {"id":i, "header":fields[i] ,align: 'right', "dataIndex":fields[i]}
		}
		
		var matrixGrid = new Ext.grid.GridPanel({
			enableHdMenu: false,
			store: new Ext.data.ArrayStore({
				fields: fields,
				data: data
			}),
			columns: columns
			//stripeRows: true,
			//autoWidth: true,
			//autoHeight: true
		});
		
		width = fields.length*100+50;
		if(width < 250) width = 250;
		if(width > 800) width = 800;
		
		height = data.length * 25 + 60;
		if(height < 120) height = 120;
		if(height > 500) height = 500;

		var window = new Ext.Window({
			title: title,
			width: width,
			height: height,
			layout: 'fit',
			plain:true,
			bodyStyle:'padding:5px;',
			items: matrixGrid
		});
		window.show();	
	}
	
	function removeRandom(varName){
	
		thisModel().remove(thisModel().targetGroups[varName]);
		thisModel().targetGroups[varName].destroy();
		predictorsToRemove = thisModel().targetGroups[varName].predictors;
		for(var i=0; i < predictorsToRemove.length; i++){
			thisModel().totalRandomEffects[varName.substring(3)].remove(predictorsToRemove[i]);
		}
		delete thisModel().targetGroups[varName];	
		clearAllTables();
		
	}
	
	function addRandom(varName){
	
		varName = Math.floor(Math.random()*800+100) + varName;
		var randomEffects = new Ext.grid.GridPanel({
			enableHdMenu: false,
			header: false,
			bodyStyle:'margin-bottom:10px;',
			anchor:'100%',
			region: 'center',
			store: new Ext.data.Store({
				reader: randomReader//,
				//data: {"variances": [{"id": 1,"name": "Intercept", "variance":".", "sd":""}]} //dummy data 
			}),
			columns: [
				{id:'Predictor',header: "Predictor", width: 60, sortable: false, dataIndex: 'name'},
				{header: "Variance", align: 'right', width: 20, sortable: false, dataIndex: 'variance'},
				{header: "SD", align: 'right', width: 20, sortable: false, dataIndex: 'sd'}
			],
			
			tbar: [
				{iconCls:'folder-open'},
				"Random: <b>" + varName.substring(3) + "</b>",'->',
				{iconCls: 'collapse-all', text:'Effects', disabled:true, handler: function(){showMatrix("Random Effects: "+varName.substring(3), thisModel().model.ranef[varName.substring(3)].fields, thisModel().model.ranef[varName.substring(3)].data)}},
				{iconCls: 'pdf', text:'Dotplots', disabled:true, handler: function(){window.open("plots/."+thisModel().model.ranef[varName.substring(3)].plotfile+".pdf")}},
				{iconCls: 'icon-grid', text:'Cov Matrix', disabled:true, randomGroupCount:thisModel().randomGroupCount, handler: function(){showMatrix("Random Covariance Matrix: "+varName.substring(3),thisModel().model.randomCovMatrices[this.randomGroupCount].fields,thisModel().model.randomCovMatrices[this.randomGroupCount].CovMatrix);}},
				{iconCls: 'icon-grid', text:'Cor Matrix', disabled:true, randomGroupCount:thisModel().randomGroupCount, handler: function(){showMatrix("Random Correlation Matrix: "+varName.substring(3),thisModel().model.randomCovMatrices[this.randomGroupCount].fields,thisModel().model.randomCovMatrices[this.randomGroupCount].CorMatrix);}},
				{iconCls:'close', handler: function(){removeRandom(varName)}}				
			],
			
			viewConfig: {forceFit: true},

			//title: "Random Effects",
			frame:false,
			//hideHeaders: true,
			width: 500,
			autoHeight: true,
			//height: 150,
			collapsible: true,
			disableSelection: true,
			animCollapse: true
		});
		
		randomEffects.predictors = new Array();	
		randomEffects.number = thisModel().randomGroupCount;
		thisModel().randomGroupCount++;
		
		if(!thisModel().totalRandomEffects[varName.substring(3)]) thisModel().totalRandomEffects[varName.substring(3)] = new Array();
		
		if(!thisModel().totalRandomEffects[varName.substring(3)].Contains("Intercept")) {
			randomEffects.predictors.push("Intercept");
			randomEffects.getStore().loadData({"variances":[{"id":"Intercept","name":"Intercept"}]});
			thisModel().totalRandomEffects[varName.substring(3)].push("Intercept");
		}
		
		randomEffects.groupingVar = varName;
		thisModel().targetGroups[varName] = randomEffects;
		
		//Ext.getCmp('currentModelPanel').add(randomEffects);
		thisModel().add(randomEffects);
		thisModel().doLayout();
		//randomEffects.getEl().hide().fadeIn({duration:.5});
		
		new Ext.dd.DropZone(randomEffects.getView().scroller,{
			getTargetFromEvent: function(e) {return varName},
			ddGroup:'DragDrop',
			overClass:'nodeOverDragzone',
			onNodeDrop: randomHandler
		});			
	}
	
	function updateModelDetails(modelFit){
	
		var tpl = new Ext.Template(
			'<h1>Model Details:</h1>',
			'<p>Formula: {formula}</p>',
			'<p>REML: {REML}</p>',			
			'<p>Deviance: {Deviance} (DF:{DF})</p>',
			'<p>AIC: {AIC}</p>',
			'<p>BIC: {BIC}</p>',
			'<p>Sigma: {Sigma}</p>'
		);
		tpl.overwrite(Ext.getCmp('modelDetails').body, modelFit);
		//Ext.getCmp('modelDetails').getEl().fadeIn({ duration: 0.3 });

	}
	
    var uploadPanel = new Ext.FormPanel({
		id: 'uploadPanel',
		border: true,
		margins:'3 3 0 3',
		fileUpload: true,
		bodyStyle: 'padding: 5px 5px 5px 5px;',
		labelWidth: 100,
		region: 'north',
		height: 35,
		items: {
            xtype: 'fileuploadfield',
            fieldLabel: 'Upload new data',
			buttonOnly: true,
            name: 'datafile',
			timeout: 60000,
			url: '../brew/lme-upload',
	        waitMsg: 'Uploading your data...',			
			listeners: {
				'fileselected': function(fb, v){
					if(uploadPanel.getForm().isValid()){
						uploadPanel.getForm().submit({
							method: 'post',
							url: '../brew/lme-upload',
							waitMsg: 'Uploading data...',
							success: function(uploadPanel, o){
								rootNode = Ext.getCmp('tree-panel').getRootNode();
								// clear current tree:
								while (rootNode.childNodes.length > 0) {
									rootNode.removeChild(rootNode.item(0));
								}
								// add data to tree and DV
								Ext.getCmp('tree-panel').getRootNode().appendChild(o.result.variables);
								Ext.getCmp('dependent').getStore().loadData(o.result.variables[1]);
								Ext.getCmp('dependent').getStore().loadData(o.result.variables[0],true);
								Ext.getCmp('tree-panel').dataFile = o.result.dataFile;
								Ext.getCmp('tree-panel').varInfo =  o.result.varInfo;
								Ext.getCmp('uploadPanel').hide();
								Ext.getCmp('dataPanel').doLayout();
							},
							failure:function(uploadPanel, o){
								alert('R catched an error: '+o.result.error);
							}
						});
					}
					//Ext.getCmp('tree-panel').getRootNode().appendChild([{id:'bla1', text:'bla1',children:[{id:'bla2',text:'bla2',leaf:true}]}]);
				}
			}			
		}
    });

    var treePanel = new Ext.tree.TreePanel({
		selModel: new Ext.tree.MultiSelectionModel(),
		border: true,
		margins:'3 3 0 3',
		singleExpand: false,
		bodyStyle: 'padding: 5px 5px 5px 5px;',	
    	id: 'tree-panel',
		region: 'center',
		iconCls: 'downArrow',
    	//title: 'by Index',
        autoScroll: true,
        animate: true,
        //containerScroll: true,
		enableDrag: true,
		dragConfig: {ddGroup: 'DragDrop' },
       
        // tree-specific configs:
        rootVisible: false,
        lines: false,
        useArrows: true,
        //dataUrl:'../stockplot/tree-data.php',
		//dataUrl:'stocks.json',
        root: new Ext.tree.AsyncTreeNode({id:'root1'})
    });
	treePanel.on('contextmenu', contextMenu)
	 
	var detailEl;
    treePanel.on('click', function(n){
    	var sn = this.selModel.selNode || {}; // selNode is null on initial selection
    	if(n.leaf && n.id != sn.id && n.id != 'Intercept'){  // ignore clicks on folders and currently selected node 

		var bd = Ext.getCmp('details-panel').body;
			bd.update('').setStyle('background','#fff');
			
			myP = document.createElement('p');
			myP.className = "details-info";
			myPre = document.createElement('pre');
			myP.appendChild(myPre);
			myCode = document.createElement('code');
			myPre.appendChild(myCode);
			myTextNode = document.createTextNode(Ext.getCmp('tree-panel').varInfo[n.id].remove("NA").join('\r\n'));
			myCode.appendChild(myTextNode);
			detailEl = bd.createChild(); //create default empty div
			detailEl.appendChild(myP);

    		detailEl.hide().slideIn('l', {stopFx:true,duration:.2});
    	}
    });	
	
	var detailsPanel = {
		region: 'south',	
		border: true,
		header: false,
		margins:'0 3 3 3',
		id: 'details-panel',
        //title: 'Variable Details',
		titleCollapse: true,
		height: 165,
		collapsible: true,
		split: true,
        bodyStyle: 'padding-bottom:15px;background:#eee;',
		autoScroll: true,
		html: '<p class="details-info">Variable details will display here.</p>'
    };

	var dataPanel = {
		//bodyStyle: 'background-color: #AAAAEE;',
		id: 'dataPanel',
		region: 'west',
		layout: 'border',
		border: true,
		title: "Datapanel",
		margins:'5 0 5 5',
        width: 200,		
		items: [uploadPanel,treePanel,detailsPanel]		
	}	

	var cardLayout = new Ext.Panel({
		bodyStyle:'background-color: #dfe8f6;',
		anchor:'100%',
		layout:'card',
		activeItem: 0,
		id: 'cardLayout',
		border: false,
		items: [{
			bodyStyle:'background-color: #dfe8f6;',
			border: false,
			autoHeight: true,
			layout: 'anchor',
			items:[]
		}]
	});
	
	var currentModelPanel = {
		id: 'currentModelPanel',
		region: 'center',
		layout: 'anchor',
		margins:'5 0 5 5',
		//background-color: #dfe8f6
		bodyStyle:'background-color: #dfe8f6; padding:3px 20px 3px 3px; overflow-x: hidden; overflow-y: scroll;',
		border: true,
		//header: false,
		//autoScroll: true,
		title: "Current model",
		items: [mainPanel,optionalPanel,cardLayout],
		//bbar: [groupingVar,{xtype:'button', handler: function() {if(Ext.getCmp('groupingVar').value != null && Ext.getCmp('groupingVar').value != "") {addRandom(Ext.getCmp('groupingVar').value)}}, text:"Add!"},'->'],
		fbar: [{iconCls: 'fit', text:'Fit Model', handler: function() {fitModel();}},{iconCls: 'reset', text:'Reset', handler: function(){ResetWorkspaceModel();}}]
	}	
	
    var modelList = new Ext.grid.GridPanel({
		id: 'modelList',
		mode: 'local',
        store: new Ext.data.ArrayStore({
			fields: ['id', 'Model'],
			data: [
				//[1, '...']	
			],
			idIndex: 0 // id for each record will be the first element
		}),
        columns: [new Ext.grid.RowNumberer(),
            {header: "Model", width: 120, dataIndex: 'Model', sortable: true}
        ],
		sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
        viewConfig: {
            forceFit:true
        },
        //columnLines: true,
        height:200,
		//split: true,
		border: true,
		margins:'3 3 0 3',
		hideHeaders: true,
		autoScroll: true,
		region: 'center',
		fbar: [{iconCls: 'newModel', text: 'Add Model',handler: function(){newModel();}},{disabled: true, iconCls: 'book', id: 'anovabutton', text: 'Anova', handler: function() {showAnova();}}]
    });
	
	var reportWindow;	
	var citeWindow;

	var modelDetails = {
		margins:'3 3 3 3',
		id: 'modelDetails',
		layout: 'fit',
		html: '<h1> Model Details </h1>',
		region: 'south',
		height: 200,
		bodyStyle: {
			background: '#ffffff',
			padding: '7px'
		},
		border:true,
		buttons:[{
			text: "Analysis Report",
			iconCls: 'pdf',
			disabled: true,
			id: 'reportbutton',
			handler: function(){
				if(!reportWindow){
					reportWindow = new Ext.Window({
						closeAction: 'hide',
						id: 'reportWindow',
						width: 150,
						height: 160,
						title: "Analysis Report",
						autoLoad: {
							listeners: {'beforerequest': function(){}},
							url: '../brew/lme-report',
							timeout: 60000,
							method: "POST",
							disableCaching: true,
							params: {
								reportRequest: Ext.util.JSON.encode({'dataFile':Ext.getCmp('tree-panel').dataFile})
							}
						}
					});			
				}
				reportWindow.show();
			}	
		},{
			text: 'Cite',
			iconCls: 'bib',
			width: 50,
			handler: function() {showCiteWindow();}
		}]		
	}
	
	var modelSelectionPanel = {
		//bodyStyle: 'background-color: #AAAAEE;',
		region: 'east',
		layout: 'border',
		margins:'5 5 5 5',
		width: 250,
		border: true,
		title: "Model Selection",
		items: [modelList,modelDetails]
	}	
	
    new Ext.Viewport({
		id: 'viewport',
		bodyStyle: 'background: none',
		//bodyStyle: 'background-color: #FFFFFF;',
		layout: 'border',
		cls: 'viewport',
		title: 'Ext Layout Browser',
		items: [{
				xtype: 'box',
				region: 'north',
				applyTo: 'header',
				height: 30
			},
			dataPanel,
			currentModelPanel,
			modelSelectionPanel
		],
        renderTo: Ext.getBody()
    });
	
	newModel();
	
	new Ext.ToolTip({
        target: 'uploadPanel',
		dismissDelay: 0,
		trackMouse: true,
        html: '<h1>Upload Data</h1><p>Upload SPSS (*.sav), CSV, or Tab Delimited data.</p> <p> For csv/tabbed data, the first row should contain headers.</p>'
    });
});

Array.prototype.Contains = function(object) {
	if(this.indexOf(object) > -1) return true;
	return false;
}