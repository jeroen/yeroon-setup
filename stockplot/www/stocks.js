/*!
 * Ext JS Library 3.0.0
 * Copyright(c) 2006-2009 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 *
 * This application is developed by Jeroen Ooms (www.jeroenooms.com)
 */
 
var phoenixURL = "/phoenix";

function PlotConfig(market,company,graphType,timeFrame){
 	this.market = market;
	this.company = company;
	this.graphType = graphType;
	this.timeFrame = timeFrame;
}

PlotConfig.prototype.toJSON = function() {
	return Ext.util.JSON.encode(this);
}

PlotConfig.prototype.toString = function() {
	return Ext.util.JSON.encode(this);
}

Ext.onReady(function(){

	Ext.QuickTips.init();
	
	// This is an inner body element within the Details panel created to provide a "slide in" effect
	// on the panel body without affecting the body's box itself.  This element is created on
	// initial use and cached in this var for subsequent access.
	var detailEl;
	
	var numberWorkspaces = 0;
	var TbarGraphType = 'S';
	var TbarTimeFrame = 3;
	
	
	function workspaceHTML(workspaceNumber){

		if(workspaceNumber==1){
			return '<div class="start-div"><div style="float:left; margin: 0 0 0 0; padding 0 0 0 0;" ><img src="images/layout-icon.gif" /></div><div style="display: block; margin-left:100px;"> <h2>Workspace '+workspaceNumber+'</h2><div><p><b>Double click</b> a company from the menu to open a new window.</p>	<p>To compare graphs you can <b>Drag and Drop</b> a company into the workspace window.</p> <p> Once you have plotted a graph, <b>Right Mouseclick</b> on it to change or update it.</p><p>Press <b>F11</b> to use this application in Full Screen</p><div id="demovideo"><p>Click <a href="http://www.youtube.com/watch?v=ieEX1yTvHFU" target="_blank">Here</a> for a short Demo Video!</p></div></div></div></div>'
		}
		return '<div class="start-div"><div style="float:left; margin: 0 0 0 0; padding 0 0 0 0;" ><img src="images/layout-icon.gif" /></div><div style="display: block; margin-left:100px;"> <h2>Workspace '+workspaceNumber+'</h2></div></div>';

	}

	function changeNumberGraphs() {
		
		this.ownerCt.ownerCt.removeAll();
		switch(this.value){
		
			case 1:
				var graphWindows = Ext.getCmp(workspacePanel.id).getActiveTab().graphWindows = new Array(1);
				
				graphWindows[0] = this.ownerCt.ownerCt.add({plotarea:true, flex:1,border:true, margins: '0 0 0 0', html: workspaceHTML(Ext.getCmp(workspacePanel.id).getActiveTab().workspaceNumber)});	
				break;
			case 2: 
				var graphWindows = Ext.getCmp(workspacePanel.id).getActiveTab().graphWindows = new Array(2);
				
				graphWindows[0] = this.ownerCt.ownerCt.add({plotarea:true, flex:1,border:true, margins: '0 0 0 0'});
				graphWindows[1] = this.ownerCt.ownerCt.add({plotarea:true, flex:1,border:true, margins: '2 0 0 0'});
				break;
			case 3:
				var graphWindows = Ext.getCmp(workspacePanel.id).getActiveTab().graphWindows = new Array(2);
				graphWindows[0] = this.ownerCt.ownerCt.add({
					plotarea:true, 
					flex:1,
					border:true, 
					margins:'0 0 2 0'
				});
				
				var subWindow = this.ownerCt.ownerCt.add({
					flex:1,
					border:false, 
					margins: '0 0 0 0', 
					layout:'hbox', 
					layoutConfig: {
						align : 'stretch'
					}					
				});
				graphWindows[1] = subWindow.add({plotarea:true, flex:1, border:true, margins: '0 2 0 0'});
				graphWindows[2] = subWindow.add({plotarea:true, flex:1, border:true, margins: '0 0 0 0'});
				break;	
				
			case 4:
				var graphWindows = Ext.getCmp(workspacePanel.id).getActiveTab().graphWindows = new Array(2);
				subWindow1 = this.ownerCt.ownerCt.add({
					flex:1,
					border:false, 
					margins: '0 0 0 0', 
					layout:'hbox', 
					layoutConfig: {
						align : 'stretch'
					}					
				});
				graphWindows[0] = subWindow1.add({plotarea:true, flex:1, border:true, margins: '0 0 0 0'});
				graphWindows[1] = subWindow1.add({plotarea:true, flex:1, border:true, margins: '0 0 0 2'});
				
				subWindow2 = this.ownerCt.ownerCt.add({
					flex:1,
					border:false, 
					margins: '0 0 0 0', 
					layout:'hbox', 
					layoutConfig: {
						align : 'stretch'
					}					
				});
				
				graphWindows[2] = subWindow2.add({plotarea:true, flex:1, border:true, margins: '2 0 0 0'});
				graphWindows[3] = subWindow2.add({plotarea:true, flex:1, border:true, margins: '2 0 0 2'});

				break;						
			

		}
		// create layout
		this.ownerCt.ownerCt.doLayout();
		
		//create droptargets
		//dropTargetElements = this.ownerCt.ownerCt.find('plotarea',true);
		dropTargetElements = Ext.getCmp(workspacePanel.id).getActiveTab().graphWindows;

		for(dropi=0; dropi < dropTargetElements.length; dropi++){
			//new Ext.dd.DropTarget(dropTargetElements[dropi].getEl().first().first(),{
			
			dropTargetElements[dropi].getEl().first().first().set({counter:dropi});
			
			new Ext.dd.DropTarget(dropTargetElements[dropi].getEl().first().first(),{
				ddGroup:'DragDrop',
				overClass:'nodeOverDragzone',
				notifyDrop: droppedHandler
			});
		}		
	}
	
	function workspacePDF(){

		var plotRequest = new Object();
		var graphWindows = Ext.getCmp(workspacePanel.id).getActiveTab().graphWindows;

		for(i = 0; i < graphWindows.length; i++){
			var plotConfig = graphWindows[i].plotConfig
			if(plotConfig == undefined | plotConfig == "") {
				plotRequest["plot"+i] = "NA";
			}
			else {
				plotRequest["plot"+i] = {};
				for(var thisprop in plotConfig){
					if(typeof plotConfig[thisprop] == "function") continue;
					plotRequest["plot"+i][thisprop] = plotConfig[thisprop];
				}			
			}		
		}
		
		pdfwin = window.open();
		pdfwin.document.write("Please wait...");
		
		RExecuteScript({
			scriptname: 'stockplot-ws',
			stateful: false,
			inputs: {'plotRequest': plotRequest},
			files: ["workspace.pdf"],
			success: function(robjects,files){
				pdfwin.location.href = files['workspace.pdf'].value;
			}
		});			
	}

	imageContext = function(e,t,o){
	
		if(Ext.getCmp(this.id) && Ext.getCmp(this.id).isXType('window')){
			thisWindow = Ext.getCmp(this.id);
		
		} else{
			counter = this.getAttribute('counter');
			thisWindow = Ext.getCmp(workspacePanel.id).getActiveTab().graphWindows[counter];
		}

		menu = new Ext.menu.Menu({            
			items: ['<b class="menu-title">'+thisWindow.plotConfig.company+'</b>',{
				text:"Graphtype", 
				iconCls: 'chartIcon',
				handler: function() {return false;},
				menu: {
					listeners: {
						'itemclick' : function(btn) {
							thisWindow.plotConfig.graphType = btn.value;
							updatePlot(thisWindow,thisWindow.plotConfig)
						} 
					},
					items:[{
						text:"Smoothed Plot",
						value: 'S',
						group: 'menuGraphType',
						checked: (thisWindow.plotConfig.graphType=='S')
						},{
						text:"High/Low Plot",
						value: 'H',
						group: 'menuGraphType',
						checked: (thisWindow.plotConfig.graphType=='H')
						}]
					}
			},{
				text:"Timeframe", 
				iconCls: 'calendarIcon',
				handler: function() {return false;},
				menu: {
					listeners: {
						'itemclick' : function(btn) {
							thisWindow.plotConfig.timeFrame = btn.value;
							updatePlot(thisWindow,thisWindow.plotConfig)
						} 
					},				
					items:[{
						text:"1 Month",
						value: '1',
						group: 'menuTimeFrame',
						checked: (thisWindow.plotConfig.timeFrame==1)
						},{
						text:"3 Months",
						value: '2',
						group: 'menuTimeFrame',
						checked: (thisWindow.plotConfig.timeFrame==2)
						},{
						text:"6 Months",
						value: '3',
						group: 'menuTimeFrame',
						checked: (thisWindow.plotConfig.timeFrame==3)
						},{
						text:"1 Year",
						value: '4',
						group: 'menuTimeFrame',
						checked: (thisWindow.plotConfig.timeFrame==4)
						},{
						text:"5 Years",
						value: '5',
						group: 'menuTimeFrame',
						checked: (thisWindow.plotConfig.timeFrame==5)
						}]
					}
				}, '-',{
					text: "Refresh",
					iconCls: "refresh2",
					handler: function(){updatePlot(thisWindow,thisWindow.plotConfig); }
				},{
					text: "Get PDF",
					iconCls: "pdf16",
					handler: function(){getPDF(thisWindow.plotConfig); }
				}
			]
		});
		menu.showAt(e.getPoint());	
		e.stopEvent();
	}
	
	function updatePlot(thisWindow,plotConfig){
		if(!thisWindow.isXType('window')){
			winWidth = thisWindow.getSize().width;
			winHeight = thisWindow.getSize().height;
		} else {
			winWidth = 585;
			winHeight = 450;
		}
		
		var plotRequest = new Object();
		
		// copy plotConfig properties:
		for (var key in plotConfig){
			plotRequest[key] = plotConfig[key];
		}
		
		// add size properties
		plotRequest['height'] = winHeight;
		plotRequest['width'] = winWidth;

		var myMask = new Ext.LoadMask(thisWindow.getLayoutTarget(), {msg:"Please wait..."});
		myMask.show();
		
		RExecuteScript({
			scriptname: 'stockplot-png',
			stateful: false,
			inputs: {'plotRequest': plotRequest},
			files: ["plot.png"],
			callback: function() {myMask.hide();},
			success: function(robjects,files){
				thisWindow.update('<img alt="plot" src="' + files['plot.png'].value + '" />');
			}
		});
	}

	function droppedHandler(source, e, data){
		
		var counter = this.getEl().getAttribute('counter');

		if(data.node.leaf == true){

			market = "AEX";		
			company = data.node.id.substring(3);
	
			thisWindow = Ext.getCmp(workspacePanel.id).getActiveTab().graphWindows[counter];
			thisWindow.plotConfig = new PlotConfig(market,company,TbarGraphType,TbarTimeFrame);
			updatePlot(thisWindow,thisWindow.plotConfig);
			
			Ext.get(this.id).on('contextmenu', imageContext);
		}
	}
	
    function addTab(){
		numberWorkspaces++;
		
        var newWorkspace = workspacePanel.add({
			workspaceNumber : numberWorkspaces,
			iconCls: 'tabs',
			closable: (numberWorkspaces!=1),
			title: 'Workspace ' + numberWorkspaces,
			layout: 'vbox',
			layoutConfig: {
				align : 'stretch'
			},		
			tbar: [{
				text: 'Add new Workspace',
				handler: addTab,
				iconCls:'new-tab'
			},'->',{
				xtype: 'combo',
				editable: false,
				//typeAhead: true,
				emptyText: 'Split Workspace',
				//id: 'myCombo',
				triggerAction: 'all',
				value: 1,
				lazyRender:true,
				mode: 'local',
				store: new Ext.data.ArrayStore({
					id: 0,
					fields: [
						'myId',
						'displayText'
					],
					data: [[1, '1 Graph'], [2, '2 Graphs'], [3, '3 Graphs'], [4, '4 Graphs']]
				}),
				forceSelection:true,
				valueField: 'myId',
				displayField: 'displayText',
				listeners:{
					'select': changeNumberGraphs
				}
			},'-',
			{	text:'Clear Workspace', 
			   iconCls: 'resetIcon',
			   handler: function() {
					this.ownerCt.getComponent(2).fireEvent('select');
				}
			},'-',
			{	text:'Export Workspace to PDF', 
			   iconCls: 'pdf16',
			   handler: function() {workspacePDF();}
			}],
			border:true
		}).show();
		
		newWorkspace.getTopToolbar().getComponent(2).fireEvent('select'); //.select(0,false);
		
    }

	updateDetails = function(n){
	
			if(!detailEl){
			var bd = Ext.getCmp('details-panel').body;
			bd.update('').setStyle('background','#fff');
			detailEl = bd.createChild(); //create default empty div
    		}
			//updates details panel:
    		//detailEl.hide().update(Ext.getDom(n.id+'-details').innerHTML).slideIn('l', {stopFx:true,duration:.2});
			if(n.isLeaf()){
				detailEl.hide().update(Ext.getDom('company-details').innerHTML).slideIn('l', {stopFx:true,duration:.2});
				document.getElementById('detailsHeader').innerHTML ="";
				document.getElementById('detailsHeader').appendChild(document.createTextNode(n.text));		
				document.getElementById('yahooLink').href = 'http://finance.yahoo.com/q?s=' + n.id.substring(3);
				document.getElementById('wikiLink').href = 'http://www.google.com/search?hl=en&q=site:en.wikipedia.org+' + n.text + '+' + n.id.substring(3).split(".")[0] + "&btnI=I'm+Feeling+Lucky&aq=f&oq=&aqi=";
			}

	}	
	
	switchWorkspace = function(node, copy){
	
		var oldGraphWindows = Ext.getCmp(workspacePanel.id).getActiveTab().graphWindows;
		
		if(copy){
			addTab();
			Ext.getCmp(workspacePanel.id).getActiveTab().getTopToolbar().getComponent(2).setValue(oldGraphWindows.length);
			Ext.getCmp(workspacePanel.id).getActiveTab().getTopToolbar().getComponent(2).fireEvent('select');
		}
		
		var newGraphWindows = Ext.getCmp(workspacePanel.id).getActiveTab().graphWindows;
		
		for(i = 0; i < newGraphWindows.length; i++){
		
			if((oldGraphWindows[i].plotConfig.company == undefined) || (oldGraphWindows[i].plotConfig.company == "") || (oldGraphWindows[i].plotConfig.company == "NA")){
				//do nuttin
			} else {
				newGraphWindows[i].plotConfig = new PlotConfig("AEX", node.id.substring(3), oldGraphWindows[i].plotConfig.graphType, oldGraphWindows[i].plotConfig.timeFrame);
				updatePlot(newGraphWindows[i], newGraphWindows[i].plotConfig);
				newGraphWindows[i].getEl().first().first().on('contextmenu', imageContext);
			}		
		}
	}
	
	contextMenu = function(node, e){
	
        //if(!menu){ // create context menu on first right click
		if(node.isLeaf()){
			that = this;
				menu = new Ext.menu.Menu({            
					items: [{
						//id: tabs.id + '-close',
						text: 'Switch workspace to <b> '+node.text +"</b>",
						iconCls: 'switchWorkspaceIcon',
						handler : function() {switchWorkspace(node, false)}
					},{
						//id: tabs.id + '-close',
						text: 'Copy workspace for <b> '+node.text +"</b>",
						iconCls: 'copyWorkspaceIcon',
						handler : function() {switchWorkspace(node, true)}
					}]
				});
			e.stopEvent();
			menu.showAt(e.getPoint());	
		} else {e.stopEvent();}
	}
    
	// Go ahead and create the TreePanel now so that we can use it below
    var treePanel = new Ext.tree.TreePanel({
    	id: 'tree-panel',
		iconCls: 'downArrow',
    	title: 'by Index',
        height: 300,
        autoScroll: true,
		lazyRender:true,
        animate: true,
        containerScroll: true,
		enableDrag: true,
		dragConfig: {ddGroup: 'DragDrop' },
		autoWidth: true,
        
        // tree-specific configs:
        rootVisible: false,
        lines: false,
        singleExpand: true,
        useArrows: true,
        dataUrl:'tree-data.php',
		//dataUrl:'stocks.json',
        root: new Ext.tree.AsyncTreeNode({id:'root1'})
    });
	
    var treePanel2 = new Ext.tree.TreePanel({
    	id: 'tree-panel2',
		iconCls: 'downArrow',
    	title: 'by Name',
        height: 300,
        autoScroll: true,
        animate: true,
        containerScroll: true,
		enableDrag: true,
		dragConfig: {ddGroup: 'DragDrop' },
		autoWidth: true,
        
        // tree-specific configs:
        rootVisible: false,
        lines: false,
        singleExpand: true,
        useArrows: true,
        dataUrl:'tree-data2.php',
		//dataUrl:'stocks.json',
        root: new Ext.tree.AsyncTreeNode({id:'root2'})
    });	

	treePanel.on('click', updateDetails);
	treePanel2.on('click', updateDetails);
	
	treePanel.on('contextmenu', contextMenu);
	treePanel2.on('contextmenu', contextMenu);	

	// Assign the changeLayout function to be called on tree node click.
    treePanel.on('dblclick', function(n){
		openStockWindow(n,n.parentNode.id,n.id.substring(3),this);
	});
	
    treePanel2.on('dblclick', function(n){
		openStockWindow(n,n.parentNode.id,n.id.substring(3),this);
	});
	
	openStockWindow = function(n,market,company,that){
	
    	var sn = that.selModel.selNode || {}; // selNode is null on initial selection
    	//if(n.leaf && n.id != sn.id){  // ignore clicks on folders and currently selected node 
    	if(n.leaf){ 	
			//updates content panel:
			//Ext.getCmp('content-panel').layout.setActiveItem(n.id + '-panel');
		
			
			thisWindow = new Ext.Window({
				layout:'fit',
				width:600,
				height:480,
				//autoWidth: true,
				//autoHeight: true,
				title: n.text,
				resizable: false,
				//maximizable: true,
				constrain: true,
				collapsible: true,
				pageX: Math.floor(250+Math.random()*150),
				pageY: Math.floor(20+Math.random()*150),
				renderTo: Ext.get('workspace-panel')
			});
			
			thisWindow.plotConfig = new PlotConfig(market,company,TbarGraphType,TbarTimeFrame);
			updatePlot(thisWindow,thisWindow.plotConfig);			
			
			Ext.get(thisWindow.id).on('contextmenu',imageContext);
			thisWindow.show(this);			
    	}
    }
	
	function getPDF(plotConfig){
		
		pdfwin = window.open();
		pdfwin.document.write("Please wait...");
		
		RExecuteScript({
			scriptname: 'stockplot-pdf',
			stateful: false,
			inputs: {'plotRequest': plotConfig},
			files: ["plot.pdf"],
			success: function(robjects,files){
				pdfwin.location.href = files['plot.pdf'].value;
			}
		});		
	}
    
	// This is the Details panel that contains the description for each example layout.
	var detailsPanel = {
		id: 'details-panel',
        title: 'Details',
		titleCollapse: true,
		height: 150,
		collapsible: true,
		region: 'south',		
		split: true,
        bodyStyle: 'padding-bottom:15px;background:#eee;',
		autoScroll: true,
		html: '<p class="details-info">When you select a company from the menu, some details will display here.</p>'
    };
	
	var tabTbar = [{
		text:"Smoothed Plot", 
		id: "graphTypeBtn",
		xtype: "splitbutton", 
		iconCls: 'chartIcon',
		menu:{
			listeners: {'itemclick' : function(btn) {TbarGraphType = btn.value; Ext.getCmp("graphTypeBtn").setText(btn.text); }}, 
			id: 'currentGraphType',
			items:[{
				text:"Smoothed Plot",
				group: 'graphType',
				checked: true,
				value: 'S'
				},{
				text:"High/Low Plot",
				group: 'graphType',
				checked: false,
				value: 'H'
				}]}
			},
		'-',{
		text:"6 Months", 
		id: "timeFrameBtn",
		xtype: "splitbutton",
		iconCls: 'calendarIcon',
		menu:{
			listeners: {'itemclick' : function(btn) {TbarTimeFrame = btn.value; Ext.getCmp("timeFrameBtn").setText(btn.text);}}, 
			id: 'currentTimeFrame',
			items:[{
				text:"1 Month",
				group: 'timeFrame',
				checked: false,
				value: 1
				},{
				text:"3 Months",
				group: 'timeFrame',
				checked: false,
				value: 2
				},{
				text:"6 Months",
				group: 'timeFrame',
				checked: true,
				value: 3
				},{
				text:"1 Year",
				group: 'timeFrame',
				checked: false,
				value: 4
				},{
				text:"5 Years",
				group: 'timeFrame',
				checked: false,
				value: 5
				}]
			}
		}/*,
		'-',{
			text: "Options",
			iconCls: 'chartIcon'
		}*/
	];

	
	var tabPanel = new Ext.TabPanel({
		tbar: tabTbar,
		activeTab: 0,
		id: 'tab-panel',
		region: 'center',
        height: 300,
		border: false,
        //minSize: 170,
        //autoScroll: true,
		tabPosition: 'bottom',
		items:[treePanel,treePanel2]

	});	
	
	var workspacePanel = new Ext.TabPanel({
		activeTab: 0,
		id: 'workspace-panel',
		region: 'center',
		margins: '2 5 5 0',	
        height: 350,
		border: false,		
        //minSize: 170,
		//items:[{title:"placeholder"}],
		tabPosition: 'bottom'//,
	});		
	
	// Finally, build the main layout once all the pieces are ready.  This is also a good
	// example of putting together a full-screen BorderLayout within a Viewport.
    new Ext.Viewport({
		id: 'viewport',
		layout: 'border',
		title: 'Ext Layout Browser',
		items: [{
			xtype: 'box',
			region: 'north',
			applyTo: 'header',
			height: 30
		},{
			layout: 'border',
	    	id: 'layout-browser',
	        region:'west',
	        border: false,
			border: true,
	        split:true,
			margins: '2 0 5 5',
	        width: 250,
	        minSize: 100,
	        maxSize: 500,
			items: [tabPanel, detailsPanel]
		},
			workspacePanel
		],
        renderTo: Ext.getBody()
    });

	addTab();	
	Ext.getCmp('viewport').doLayout();

	// EXTRA CODE //
	
	function openWindowWithPost(url,name,keys,values){
		var newWindow = window.open("", name); 
		if (!newWindow) return false;
		var html = "";
		html += "<html><head></head><body><form id='formid' method='post' action='" + url + "'>";
		if (keys && values && (keys.length == values.length))
		for (var i=0; i < keys.length; i++)
		html += "<input type='hidden' name='" + keys[i] + "' value='" + values[i] + "'/>";
		html += "</form><script type='text/javascript'>document.getElementById(\"formid\").submit()</script></body></html>";
		newWindow.document.write(html);
		return newWindow;
	}	
	
	// EXT MOZILLA BUGFIX FOR EXT.JS3.0.0 //
	Ext.override(Ext.Element, {
		contains: function(el) {
			return !el || (Ext.isGecko && Object.prototype.toString.call(el) == '[object XULElement]') ? false : 
					Ext.lib.Dom.isAncestor(this.dom, el.dom ? el.dom : el);
		}
	});	
	// END OF BUGFIX //	
	/*
	not needed if scripts are anonymous
	startPhoenix({
		username: 'testuser',
		password: 'secret',
		closeSessions: false
	});
	*/
});
