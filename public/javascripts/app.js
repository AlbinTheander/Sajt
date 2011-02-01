/*global dojo, dijit, five18.dbpath */

app.onRowClick = function (e) {
				var unid = e.grid.store.getValue(e.grid.getItem(e.rowIndex), "unid");
				var title = e.grid.store.getValue(e.grid.getItem(e.rowIndex), "Title");
				five18.editDocumentInTab('center', title, unid, e.grid.store, five18.saveToStore, five18.deleteRefreshStore);
}

/*---------------------------------------------------------------------
	                          pages Grid
	---------------------------------------------------------------------*/
	app.pagesGridLoader = function () {
		app.pagesStore = new dojo.data.ItemFileWriteStore({
			url: five18.dbpath + "/pages.js",
			clearOnClose: true
		});

		app.pagesLayout = [{
			field: 'id',
			name: 'ID',
			width: '30px'
		},
		{
			field: 'title',
			name: 'title',
			width: '300px'
		}];

		app.pagesGrid = new dojox.grid.DataGrid({
			store: app.pagesStore,
			clientSort: true,
			structure: app.pagesLayout,
			onRowClick: function (e) {
				var unid = e.grid.store.getValue(e.grid.getItem(e.rowIndex), "unid");
				var title = e.grid.store.getValue(e.grid.getItem(e.rowIndex), "Title");
				five18.editDocumentInTab('center', title, unid, e.grid.store, five18.saveToStore, five18.deleteFromStore);
			}
		}, document.createElement('div'));

		dojo.byId("pagesGrid").appendChild(app.pagesGrid.domNode);
		app.pagesGrid.startup();
	};
	
	dojo.addOnLoad(app.pagesGridLoader);