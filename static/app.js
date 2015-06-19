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

function url(key) {
    /** @namespace window.urls */
    return window.urls[key];
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
								create: url('messages_create'),
								read: url('messages'),
								update: url('messages_update'),
								destroy: url('messages_destroy')
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
							icon: url('static_dir') + 'edit-table-insert-row-under.png',
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
							icon: url('static_dir') + 'text-x-c++src.png',
							handler: function() {
								Ext.Ajax.request({
									url: url('messages_as_cpp_enum'),
									method: 'get',
									success: function(response) {
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
							icon: url('static_dir') + 'text-x-csrc.png',
							handler: function() {
								Ext.Ajax.request({
									url: url('messages_as_c_enum'),
									method: 'get',
									success: function(response) {
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
                            text: "Als Python enum-Klasse anzeigen",
                            icon: url('static_dir') + 'text-x-python.png',
                            handler: function () {
                                Ext.Ajax.request({
                                    url: url('messages_as_python_class'),
                                    method: 'get',
                                    params: {
                                        print_as_python_class: true
                                    },
                                    success: function (response) {
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
									icon: url('static_dir') + 'edit-table-delete-row.png',
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
								create: url('parameters_create'),
								read: url('parameters'),
								update: url('parameters_update'),
								destroy: url('parameters_destroy')
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
							icon: url('static_dir') + 'edit-table-insert-row-under.png',
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
							icon: url('static_dir') + 'text-x-c++src.png',
							handler: function() {
								Ext.Ajax.request({
									url: url('parameters_as_cpp_enum'),
									method: 'get',
									success: function(response) {
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
							icon: url('static_dir') + 'text-x-csrc.png',
							handler: function() {
								Ext.Ajax.request({
									url: url('parameters_as_c_enum'),
									method: 'get',
									success: function(response) {
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
                            text: "Als Python enum-Klasse anzeigen",
                            icon: url('static_dir') + 'text-x-python.png',
                            handler: function () {
                                Ext.Ajax.request({
                                    url: url('parameters_as_python_class'),
                                    method: 'get',
                                    success: function (response) {
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
									icon: url('static_dir') + 'edit-table-delete-row.png',
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
									url: url('specs'),
									method: 'post',
									params: {
										new_html: editor.getValue()
									},
									success: function() {
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
								url: url('specs'),
								success: function(response) {
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
