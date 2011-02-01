/*global dojo, dijit, five18 */

/*

	Saker som stör mig och som borde fixas:
	1. Att jag måste skicka med title till flickar och dialoger istället för att hämta dem från dokumenten
	2. Att man inte kan byta namn på en flik när man sparar utan att stänga. (1.4??)
	3. Att det behövs en funktion mellan datastore och editDocumentInTab
	4. Det borde kollas då och då om man är inloggad. Annars blir det fel när man gör något oinloggad
	5. Det är kul att cacha formulär, men om man lägger in nya situationsplaner kommer de inte med

*/



// ----------------------------------------------------------------------------------------------------
// Forms
//
// Loads domino-forms, strips them of everything but the <form>-tag
// and makes a dijit.form.Form out of it. Caches the forms, so that
// they don't have to be loaded from the server every time.
// ----------------------------------------------------------------------------------------------------

var FormsContainer = function () {

	function loadForm(form, container) {
		dojo.xhrGet({
			url: five18.dbpath + form + "/new",
			formname: form,
			handleAs: 'text',
			container: container,
			formsObject: that,
			load: function (data, xhr) {
				xhr.args.container.attr('content', data);
				xhr.args.formsObject.saveToCache(xhr.args.formname, data);
			},
			error: function (error) {
				container.innerHTML = error;
			}
		});
	}
	
	var cached = [];
	var that = this;
	
	this.place = function (form, container, useCache) {
		if (useCache && cached[form]) {
			container.attr('content', cached[form]);
		} else {
			loadForm(form, container);
		}
	};
	
	this.saveToCache = function (formname, data) {
		cached[formname] = data;
	};
	
};

five18.forms = new FormsContainer();

// ----------------------------------------------------------------------------------------------------
//										Documents
// ----------------------------------------------------------------------------------------------------

five18.editDocument = function (unid, editIn) {
	dojo.xhrGet({
		url: five18.dbpath + 'pages/'+unid,
		container: editIn,
		handleAs: 'text',
		load: function (data, xhr) {
			xhr.args.container.attr('content', data);
			if (xhr.args.container.initHandler) {
				xhr.args.container.initHandler(xhr.args.container);
			}
			
		},
		error: function (error) {
			window.alert("fel: " + error);
		}
	});
};

five18.saveDocument = function (button, close) {
	var url;
	var f_node = five18.getEnclosingForm(button);
	
	if ((dijit.byNode(f_node)) && (!dijit.byNode(f_node).validate())) {
		window.alert("Formuläret är inte korrekt ifyllt");
	} else {
		dijit.findWidgets(f_node).disabled = true;
		if (f_node.unid.value === '') {
			url = f_node.action;
		} else {
			url = five18.dbpath + '0/' + f_node.unid.value + '?editdocument';
		}
		dojo.io.iframe.send({
			url: url,
			close: close,
			handleAs: 'json',
			timeout: 10000,
			form: f_node,
			handle: function (response, xhr) {
				if (response.success) {
					var containerWidget = dijit.getEnclosingWidget(xhr.args.form.parentNode);
					if (containerWidget.saveTo) {
						containerWidget.saveHandler(response.unid, dojo.formToObject(xhr.args.form), containerWidget.saveTo);
					}
					
					if (xhr.args.close) {
						var tmp = five18.destroyWidget(containerWidget);
					} else {
						five18.editDocument(response.unid, containerWidget);
					}
				} else {
					window.alert("Lyckades inte spara dokumentet. Försök igen!");
					dijit.findWidgets(xhr.args.form).disabled = false;
				}
			}
		});
	}
};

five18.deleteDocument = function (button) {
	var f_node = five18.getEnclosingForm(button);
	dojo.xhrPost({
		url: five18.dbpath + 'AjaxDeleteThread',
		unid: f_node.unid.value,
		form: f_node,
		content: {
			unid: f_node.unid.value
		},
		handleAs: 'json',
		load: function (response, xhr) {
			if (response.success) {
				var containerWidget = dijit.getEnclosingWidget(xhr.args.form.parentNode);
				if (containerWidget.deleteHandler) {
					containerWidget.deleteHandler(xhr.args.unid, containerWidget.saveTo);
				}
				five18.destroyWidget(containerWidget);
			}
			else {
				window.alert('Borttagningen misslyckades');
			}
		}
	});
};

five18.destroyWidget = function (widget) {
	var parentWidget = dijit.getEnclosingWidget(widget.domNode.parentNode);
	if (parentWidget && parentWidget.removeChild) {
		parentWidget.removeChild(widget);
	}
	widget.destroyRecursive();
};

// ----------------------------------------------------------------------------------------------------
// Nice things to have
// ----------------------------------------------------------------------------------------------------

five18.getEnclosingForm = function (widget) {
	var f_node = widget.domNode;
	console.log(f_node);
	while ((f_node.parentNode) && (f_node.nodeName != "FORM")) {
		f_node = f_node.parentNode;
		console.log(f_node);
	}
	if (f_node.nodeName=="FORM") {
		return f_node;
	} else {
		return null;
	}
}

five18.saveEditors = function(button) {
	var form = five18.getEnclosingForm(button);
	dojo.query('.RichTextEditable', form).forEach( function (node) {
		var widget = dijit.getEnclosingWidget(node);
		form.elements[widget.name].value = widget.savedContent;	
	});
}

five18.deleteAttachment = function (button) {
	var f_node = five18.getEnclosingForm(button);
	var preview = button.domNode.parentNode;
	var widget = preview.parentNode;
	var img = dojo.query("img", preview)[0];
	var picName = dojo.attr(img, "src").toLowerCase();
	picName = picName.substring(picName.indexOf('/$file/')+7, picName.length);
	if (picName.indexOf('?')>0) {
		picName = picName.substring(0, picName.indexOf('?'));
	}
	if (picName.indexOf('!')>0) {
		picName = picName.substring(0, picName.indexOf('!'));
	}
	var uploader = null;
	if (dojo.hasClass(widget, "five18singleFile")) {
		uploader = dojo.query(".five18uploader", widget)[0];
	}
				
	dojo.xhrPost({
		url: five18.dbpath + 'AjaxDeleteAttachment',
		unid: f_node.unid.value,
		uploader: uploader,
		preview: preview,
		content: {
			unid: f_node.unid.value,
			fileName: picName
		},
		handleAs: 'json',
		load: function (response, xhr) {
			if (response.success) {
				dojo.animateProperty({
					node: xhr.args.preview,
					properties: {
						height: {end: 0},
						opacity: {start:1, end: 0}
					}
				}).play();
				if (xhr.args.uploader) {
					dojo.fadeIn({node: xhr.args.uploader}).play();
				}
			}
			else {
				window.alert('Borttagningen av bifogad fil misslyckades');
			}
		}
	});
};

// ----------------------------------------------------------------------------------------------------
// Tabs
// ----------------------------------------------------------------------------------------------------

five18.openFormInTab = function (tabContainer, title, form, useCache, saveTo, saveHandler, initHandler) {
	if (!initHandler) {
		initHandler= null;
	}
	var tc = dijit.byId(tabContainer);
	var newTab = new dijit.layout.ContentPane({
		title: title, 
		closable: 'true', 
		selected: 'true', 
		onShow: five18.controlTabsShowTab,
		onClose: five18.controlTabsCloseTab,
		saveTo: saveTo, 
		saveHandler: saveHandler,
		initHandler: initHandler
	});
	five18.forms.place(form, newTab, useCache);
	tc.addChild(newTab);
	tc.selectChild(newTab);
};

five18.tabIdArray = [];

five18.controlTabsShowTab = function() {
	if (five18.tabIdArray[five18.tabIdArray.length-1] != this.id) {
		five18.tabIdArray.push(this.id);
	}
};

five18.controlTabsCloseTab = function() {
	var tmpArray = [];
	
	for (x in five18.tabIdArray) {
		if (five18.tabIdArray[x] != this.id) {tmpArray.push(five18.tabIdArray[x]);}
	}
	
	five18.tabIdArray = tmpArray;
	
	if (tmpArray.length>1) {
		dijit.byId('center').selectChild(five18.tabIdArray[five18.tabIdArray.length-1]);
	}
	return true;
};

five18.editDocumentInTab = function (tabContainer, title, unid, saveTo, saveHandler, deleteHandler, initHandler) {
	if (!initHandler) {
		initHandler= null;
	}
	var tc = dijit.byId(tabContainer);
	var newTab = new dijit.layout.ContentPane({
		title: title,
		closable: 'true', 
		selected: 'true',
		onShow: five18.controlTabsShowTab,
		onClose: five18.controlTabsCloseTab,
		saveTo: saveTo, 
		saveHandler: saveHandler,
		deleteHandler: deleteHandler,
		initHandler: initHandler,
		id: tabContainer + '-' + unid
	});
	five18.editDocument(unid, newTab);
	tc.addChild(newTab);
	tc.selectChild(newTab);
};

// ----------------------------------------------------------------------------------------------------
// DataStore
// ----------------------------------------------------------------------------------------------------

five18.refreshStore = function (unid, newData, saveTo) {
	saveTo.store.close();
	saveTo.store.fetch();
	saveTo._refresh();
};

five18.saveToStore = function (unid, newData, saveTo) {
	newData.unid = unid;
	saveTo.fetchItemByIdentity({
		identity: unid,
		onItem: function (item, request) {
			if (item) {
				for (var name in item) {
					if ((name !== 'unid') && (newData[name])) {
						saveTo.setValues(item, name, newData[name]);
					}
				}
			} else {
				var tmp = saveTo.newItem(newData);
			}
		},
		onError: function (item, request) {
			window.alert('Fel i saveToStore');
		}
	});
};

five18.deleteRefreshStore = function (unid, deleteFrom) {
	deleteFrom.store.fetchItemByIdentity({
		identity: unid,
		onItem: function (item, request) {
			deleteFrom.store.deleteItem(item);
		},
		onError: function (error, request) {
			window.alert("Lyckades inte radera");
		}
	});
};

five18.deleteFromStore = function (unid, deleteFrom) {
	deleteFrom.fetchItemByIdentity({
		identity: unid,
		onItem: function (item, request) {
			deleteFrom.deleteItem(item);
		},
		onError: function (error, request) {
			window.alert("Lyckades inte radera");
		}
	});
};

// ----------------------------------------------------------------------------------------------------
//										Dialog
// ----------------------------------------------------------------------------------------------------

five18.openFormInDialog = function (title, form, useCache, saveTo, saveHandler, initHandler) {
	five18.dialog = new dijit.Dialog();
	five18.forms.place(form, five18.dialog, useCache);
	five18.dialog.attr('title', title);
	five18.dialog.attr('saveTo', saveTo);
	five18.dialog.attr('saveHandler', saveHandler);
	if (initHandler) {
		five18.dialog.attr('initHandler', initHandler);
	}
	five18.dialog.attr('hide', five18.destroyDialog);
	five18.dialog.show();
};

five18.editDocumentInDialog = function (title, unid, saveTo, saveHandler, deleteHandler, initHandler) {
	five18.dialog = new dijit.Dialog();
	five18.editDocument(unid, five18.dialog);
	five18.dialog.attr('title', title);
	five18.dialog.attr('saveTo', saveTo);
	five18.dialog.attr('saveHandler', saveHandler);
	if (initHandler) {
		five18.dialog.attr('initHandler', initHandler);
	}
	five18.dialog.attr('deleteHandler', deleteHandler);
	five18.dialog.attr('hide', five18.destroyDialog);
	five18.dialog.show();
};

five18.destroyDialog = function (evt) {
	widget = dijit.getEnclosingWidget(evt.target);
	var parentWidget = dijit.getEnclosingWidget(widget.domNode.parentNode);
	if (parentWidget && parentWidget.removeChild) {
		parentWidget.removeChild(widget);
	}
	widget.destroyRecursive();
};

// ----------------------------------------------------------------------------------------------------
//									Simple List 
// ----------------------------------------------------------------------------------------------------

five18.saveToList = function (unid, data, saveTo) {
	var linkItem = dojo.byId(saveTo + unid);
	if (linkItem) {
		linkItem.innerHTML = data.Title;
		linkItem.onclick = "five18.editDocumentInDialog('" + data.Title + "', '" + unid + "', '" + saveTo + "', five18.saveToList, five18.deleteFromList);return false;";
	} else {
		var listItem = dojo.create('li', null, saveTo, 'last');
		var attrs = {
			id: saveTo + unid,
			href: '#',
			onclick: "five18.editDocumentInDialog('" + data.Title + "', '" + unid + "', '" + saveTo + "', five18.saveToList, five18.deleteFromList);return false;",
			innerHTML: data.Title
		};
		linkItem = dojo.create('a', attrs, listItem, 'first');
	}
};

five18.saveToDivList = function (unid, data, saveTo) {
	var linkItem = dojo.byId(saveTo + unid);
	if (linkItem) {
		linkItem.innerHTML = data.Title;
		linkItem.onclick = "five18.editDocumentInDialog('" + data.Title + "', '" + unid + "', '" + saveTo + "', five18.saveToDefinitionList, five18.deleteFromList);return false;";
	} else {
		var listItem = dojo.create('div', null, saveTo, 'last');
		dojo.attr(listItem, 'class', 'item');
		var attrs = {
			id: saveTo + unid,
			href: '#',
			onclick: "five18.editDocumentInDialog('" + data.Title + "', '" + unid + "', '" + saveTo + "', five18.saveToDefinitionList, five18.deleteFromList);return false;",
			innerHTML: data.Title
		};
		linkItem = dojo.create('a', attrs, listItem, 'first');
	}
};

five18.saveToDefinitionList = function (unid, data, saveTo) {
	var linkItem = dojo.byId(saveTo + unid);
	if (linkItem) {
		linkItem.innerHTML = data.Title;
		linkItem.onclick = "five18.editDocumentInDialog('" + data.Title + "', '" + unid + "', '" + saveTo + "', five18.saveToDefinitionList, five18.deleteFromList);return false;";
	} else {
		var listItem = dojo.create('dt', null, saveTo, 'last');
		var attrs = {
			id: saveTo + unid,
			href: '#',
			onclick: "five18.editDocumentInDialog('" + data.Title + "', '" + unid + "', '" + saveTo + "', five18.saveToDefinitionList, five18.deleteFromList);return false;",
			innerHTML: data.Title
		};
		linkItem = dojo.create('a', attrs, listItem, 'first');
	}
};

five18.deleteFromList = function (unid, deleteFrom) {
	var linkItem = dojo.byId(deleteFrom + unid);
	if (linkItem) {
		dojo.destroy(linkItem.parentNode);
	}
};

