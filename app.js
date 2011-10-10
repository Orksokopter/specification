var viewport;
var msg_store;
var param_store;
var msg_sortinfo;
var param_sortinfo;

function fit_grid_columns(grid) {
	var columns = grid.headerCt.getGridColumns();
	for (var i in columns)
	{
		if (columns.hasOwnProperty(i))
			grid.headerCt.expandToFit(columns[i]);
	}
}

Ext.onReady(function() {
	viewport = new Ext.Viewport({
		layout: 'fit',
		items: {
			xtype: "tabpanel",
			activeTab: 0,
			items: [
				{
					xtype: "grid",
					title: "Nachrichten",
					plugins: [
						new Ext.grid.plugin.CellEditing({
							clicksToEdit: 2
						})
					],
					viewConfig: {
						listeners: {
							afterrender: function(view) { fit_grid_columns(view.panel) },
							refresh: function(view) { fit_grid_columns(view.panel) }
						}
					},
					columns: [
						{
							dataIndex : 'type_id',
							header : 'Type ID',
							editor: {
								xtype: 'textfield',
								selectOnFocus: true
							},
							renderer: function(value) {
								return sprintf("0x%06x (%d)", parseInt(value), parseInt(value));
							},
							sortable: false
						},
						{
							dataIndex : 'key',
							header : 'Key',
							editor: {
								xtype: 'textfield'
							},
							sortable: false
						},
						{
							dataIndex : 'data',
							header : 'Data',
							editor: {
								xtype: 'textfield'
							},
							sortable: false
						},
						{
							dataIndex : 'flags',
							header : 'Flags',
							editor: {
								xtype: 'combobox',
								multiSelect: true,
								displayField: 'desc',
								queryMode: 'local',
								store: new Ext.data.Store({
									fields: [
										{type: 'string', name: 'key'},
										{type: 'string', name: 'desc'}
									],
									data: [
										{key: 'groundstation_to_primary', desc: 'Groundstation -> Primary'},
										{key: 'groundstation_to_secondary', desc: 'Groundstation -> Secondary'},
										{key: 'primary_to_groundstation', desc: 'Primary -> Groundstation'},
										{key: 'secondary_to_groundstation', desc: 'Secondary -> Groundstation'},
										{key: 'primary_to_secondary', desc: 'Primary -> Secondary'},
										{key: 'secondary_to_primary', desc: 'Secondary -> Primary'}
									]
								})
							},
							sortable: false
						}
					],
					store: msg_store = new Ext.data.Store({
						fields: [
							{ name: "index", type: "integer" },
							{ name: "type_id", type: "integer" },
							"key",
							"data",
							"flags"
						],
						autoLoad: true,
						autoSync: true,
						proxy: {
							type: 'ajax',
							reader: {
								type: 'json',
								root: "entries",
								idProperty: "index"
							},
							writer: {
								type: 'json',
								root: 'entries',
								encode: true,
								idProperty: "index"
							},
							api: {
								create: 'messages.php?create=1',
								read: 'messages.php?read=1',
								update: 'messages.php?update=1',
								destroy: 'messages.php?destroy=1'
							}
						},
						sorters: [
							msg_sortinfo = {
								'property' : 'type_id',
								'direction' : 'ASC'
							}
						],
						listeners: {
							update: function(store) {
								store.sort(msg_sortinfo);
							}
						}
					}),
					tbar: [
						{
							xtype: "button",
							text: "Neu",
							iconCls: 'addrow16x16',
							handler: function() {
								var current_entries = msg_store.collect("type_id");
								var next_type_id = parseInt(current_entries.pop())+1;

								var tmp = new msg_store.model({
									"type_id" : next_type_id,
									"key" : "LOLNEU",
									"data" : "",
									"flags" : ""
								});

								msg_store.add(tmp);
							}
						},
						{
							xtype: "button",
							text: "Als C++ enum anzeigen",
							iconCls: 'cpp16x16',
							handler: function() {
								Ext.Ajax.request({
									url: 'messages.php',
									method: 'get',
									params: {
										print_as_cpp: true
									},
									success: function(response, opts) {
										Ext.create('Ext.window.Window', {
											title: 'Man, das ist der beste Tag seit langem :|',
											height: 200,
											width: 400,
											layout: 'fit',
											items: {
												xtype: 'textareafield',
												value: response.responseText
											}
										}).show();
									}
								});
							}
						},
						{
							xtype: "button",
							text: "Als C enum anzeigen",
							iconCls: 'c16x16',
							handler: function() {
								Ext.Ajax.request({
									url: 'messages.php',
									method: 'get',
									params: {
										print_as_c: true
									},
									success: function(response, opts) {
										Ext.create('Ext.window.Window', {
											title: 'Man, das ist der beste Tag seit langem :|',
											height: 200,
											width: 400,
											layout: 'fit',
											items: {
												xtype: 'textareafield',
												value: response.responseText
											}
										}).show();
									}
								});
							}
						}
					],
					listeners: {
						itemcontextmenu: function(grid, record, item, rowindex, e) {
							new Ext.menu.Menu({
								items: {
									text: "Löschen",
									iconCls: 'deleterow16x16',
									handler: function() {
										msg_store.removeAt(rowindex);
									}
								}
							}).showAt(e.getXY());
							e.stopEvent();
						}
					}
				},
				{
					xtype: "grid",
					title: "Parameter",
					plugins: [
						new Ext.grid.plugin.CellEditing({
							clicksToEdit: 2
						})
					],
					viewConfig: {
						listeners: {
							afterrender: function(view) { fit_grid_columns(view.panel) },
							refresh: function(view) { fit_grid_columns(view.panel) }
						}
					},
					columns: [
						{
							dataIndex : 'type_id',
							header : 'Type ID',
							editor: {
								xtype: 'textfield',
								selectOnFocus: true
							},
							type: 'integer',
							renderer: function(value) {
								return sprintf("0x%06x (%d)", parseInt(value), parseInt(value));
							},
							sortable: false
						},
						{
							dataIndex : 'key',
							header : 'Key',
							editor: {
								xtype: 'textfield'
							},
							sortable: false
						}
					],
					store: param_store = new Ext.data.Store({
						root: "entries",
						idProperty: "index",
						fields: [
							{ name: "index", type: "integer" },
							{ name: "type_id", type: "integer" },
							"key"
						],
						autoLoad: true,
						autoSync: true,
						proxy: {
							type: 'ajax',
							reader: {
								type: 'json',
								root: "entries",
								idProperty: "index"
							},
							writer: {
								type: 'json',
								root: 'entries',
								encode: true,
								idProperty: "index"
							},
							api: {
								create: 'parameters.php?create=1',
								read: 'parameters.php?read=1',
								update: 'parameters.php?update=1',
								destroy: 'parameters.php?destroy=1'
							}
						},
						sorters: [
							param_sortinfo = {
								'property' : 'type_id',
								'direction' : 'ASC'
							}
						],
						listeners: {
							update: function(store) {
								store.sort(param_sortinfo);
							}
						}
					}),
					tbar: [
						{
							xtype: "button",
							text: "Neu",
							iconCls: 'addrow16x16',
							handler: function() {
								var current_entries = param_store.collect("type_id");
								var next_type_id = parseInt(current_entries.pop())+1;

								var tmp = new param_store.model({
									"type_id" : next_type_id,
									"key" : "LOLNEU",
									"data" : "",
									"flags" : ""
								});

								param_store.add(tmp);
							}
						},
						{
							xtype: "button",
							text: "Als C++ enum anzeigen",
							iconCls: 'cpp16x16',
							handler: function() {
								Ext.Ajax.request({
									url: 'parameters.php',
									method: 'get',
									params: {
										print_as_cpp: true
									},
									success: function(response, opts) {
										Ext.create('Ext.window.Window', {
											title: 'Man, das ist der beste Tag seit langem :|',
											height: 200,
											width: 400,
											layout: 'fit',
											items: {
												xtype: 'textareafield',
												value: response.responseText
											}
										}).show();
									}
								});
							}
						},
						{
							xtype: "button",
							text: "Als C enum anzeigen",
							iconCls: 'c16x16',
							handler: function() {
								Ext.Ajax.request({
									url: 'parameters.php',
									method: 'get',
									params: {
										print_as_c: true
									},
									success: function(response, opts) {
										Ext.create('Ext.window.Window', {
											title: 'Man, das ist der beste Tag seit langem :|',
											height: 200,
											width: 400,
											layout: 'fit',
											items: {
												xtype: 'textareafield',
												value: response.responseText
											}
										}).show();
									}
								});
							}
						},
						{
							xtype: "button",
							text: "Für den ParametersWidget-Konstruktor anzeigen",
							iconCls: 'qt16x16',
							handler: function() {
								Ext.Ajax.request({
									url: 'parameters.php',
									method: 'get',
									params: {
										print_as_qt: true
									},
									success: function(response, opts) {
										Ext.create('Ext.window.Window', {
											title: 'Man, das ist der beste Tag seit langem :|',
											height: 500,
											width: 600,
											layout: 'fit',
											items: {
												xtype: 'textareafield',
												value: response.responseText
											}
										}).show();
									}
								});
							}
						},
						{
							xtype: "button",
							text: "Für ParameterTypeIdToString anzeigen",
							iconCls: 'qt16x16',
							handler: function() {
								Ext.Ajax.request({
									url: 'parameters.php',
									method: 'get',
									params: {
										print_as_qt_1: true
									},
									success: function(response, opts) {
										Ext.create('Ext.window.Window', {
											title: 'Man, das ist der beste Tag seit langem :|',
											height: 500,
											width: 600,
											layout: 'fit',
											items: {
												xtype: 'textareafield',
												value: response.responseText
											}
										}).show();
									}
								});
							}
						}
					],
					listeners: {
						itemcontextmenu: function(grid, record, item, rowindex, e) {
							new Ext.menu.Menu({
								items: {
									text: "Löschen",
									iconCls: 'deleterow16x16',
									handler: function() {
										param_store.removeAt(rowindex);
									}
								}
							}).showAt(e.getXY());
							e.stopEvent();
						}
					}
				},
				{
					xtype: "panel",
					title: "Spezifikation",
					layout: "fit",
					items: {
						xtype: "htmleditor",
						itemId: "specs_edit"
					},
					tbar: [
						{
							xtype: "button",
							itemId: "save_button",
							id: "specs_save_button",
							text: "Speichern",
							handler: function(button) {
								var panel = button.ownerCt.ownerCt;
								var editor = panel.getComponent("specs_edit");

								panel.getEl().mask("Alter, ich speicher doch schon. Bleib mal locker.");
								Ext.Ajax.request({
									url: 'specs.php',
									method: 'post',
									params: {
										new_html: editor.getValue()
									},
									success: function(response, opts) {
										panel.getEl().unmask();
									}
								});
							}
						}
					],
					listeners: {
						activate: function(panel) {
							panel.getEl().mask("Wart halt mal");
							var editor = panel.getComponent("specs_edit");

							Ext.Ajax.request({
								url: 'specs.php',
								success: function(response, opts) {
									panel.getEl().unmask();
									editor.setValue(response.responseText);
								}
							});
						}
					}
				}
			]
		}
	}); // new viewport

}); // onReady