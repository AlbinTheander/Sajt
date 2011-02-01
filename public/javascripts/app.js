/*global dojo, dijit, five18.dbpath */

okm.openSettings = function() {
	if (document.forms['_Settings']) {
		dijit.byId('center').selectChild(document.forms['_Settings'].parentNode.id);
	} else {
		five18.openFormInTab('center', 'Settings', 'Settings', false, null, null)
	}
}

okm.onRowClick = function (e) {
				var unid = e.grid.store.getValue(e.grid.getItem(e.rowIndex), "unid");
				var title = e.grid.store.getValue(e.grid.getItem(e.rowIndex), "Title");
				five18.editDocumentInTab('center', title, unid, e.grid.store, five18.saveToStore, five18.deleteRefreshStore);
}
okm.openSettings = function() {
	if (document.forms['_Settings']) {
		dijit.byId('center').selectChild(document.forms['_Settings'].parentNode.id);
	} else {
		five18.openFormInTab('center', 'Settings', 'Settings', false, null, null)
	}
}

/*---------------------------------------------------------------------
	                          konstverk Grid
	---------------------------------------------------------------------*/
	okm.konstverkGridLoader = function () {
		okm.konstverkStore = new dojo.data.ItemFileWriteStore({
			url: five18.dbpath + "ViewJSon?openagent&viewname=itemsAdmin&label=Title&identifier=unid",
			clearOnClose: true
		});

		okm.konstverkLayout = [{
			field: 'id',
			name: 'ID',
			width: '30px'
		},
		{
			field: 'Title',
			name: 'Titel',
			width: '100px'
		},
		{
			field: 'konstnar',
			name: 'Konstn&auml;r',
			width: '100px'
		},
		{
			field: 'ar',
			name: '&Aring;r',
			width: '50px'
		},
		{
			field: 'stadsdel',
			name: 'Stadsdel',
			width: '100px'
		},
		{
			field: 'placering',
			name: 'Placering',
			width: '200px'
		},
		{
			field: 'typ',
			name: 'Typ',
			width: '100px'
		},
		{
			field: 'materialgrupper',
			name: 'Materialgrupper',
			width: '100px'
		},
		{
			field: 'miljo',
			name: 'milj&ouml;',
			width: '100px'
		},
		{
			field: 'x',
			name: 'X',
			width: '100px'
		},
		{
			field: 'y',
			name: 'Y',
			width: '100%'
		}];

		okm.konstverkGrid = new dojox.grid.DataGrid({
			store: okm.konstverkStore,
			clientSort: true,
			structure: okm.konstverkLayout,
			onRowClick: function (e) {
				var unid = e.grid.store.getValue(e.grid.getItem(e.rowIndex), "unid");
				var title = e.grid.store.getValue(e.grid.getItem(e.rowIndex), "Title");
				five18.editDocumentInTab('center', title, unid, e.grid.store, five18.saveToStore, five18.deleteFromStore);
			}
		}, document.createElement('div'));

		dojo.byId("konstverkGrid").appendChild(okm.konstverkGrid.domNode);
		okm.konstverkGrid.startup();
	};
	
	dojo.addOnLoad(okm.konstverkGridLoader);
	
	/*---------------------------------------------------------------------
	                          Puff Grid
	---------------------------------------------------------------------*/
	okm.puffGridLoader = function () {
		okm.puffStore = new dojo.data.ItemFileWriteStore({
			url: five18.dbpath + "ViewJSon?openagent&viewname=PuffAdmin&label=Title&identifier=unid",
			clearOnClose: true
		});

		okm.puffLayout = [{
			field: 'updated',
			name: 'Uppdaterad',
			width: '120px'
		},
		{
			field: 'Title',
			name: 'Titel',
			width: '300px'
		},
		{
			field: 'link',
			name: 'Link',
			width: '300px'
		}];

		okm.puffGrid = new dojox.grid.DataGrid({
			store: okm.puffStore,
			clientSort: true,
			structure: okm.puffLayout,
			onRowClick: function (e) {
				var unid = e.grid.store.getValue(e.grid.getItem(e.rowIndex), "unid");
				var title = e.grid.store.getValue(e.grid.getItem(e.rowIndex), "Title");
				five18.editDocumentInTab('center', title, unid, e.grid.store, five18.saveToStore, five18.deleteRefreshStore);
			}
		}, document.createElement('div'));

		dojo.byId("puffGrid").appendChild(okm.puffGrid.domNode);
		okm.puffGrid.startup();
	};
	
	dojo.addOnLoad(okm.puffGridLoader);