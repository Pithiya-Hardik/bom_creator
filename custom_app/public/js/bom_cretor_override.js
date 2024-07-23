frappe.ui.form.on("BOM Creator", {
    make_new_entry(frm) {
        let dialog = new frappe.ui.Dialog({
            title: __("Multi-level BOM Creator"),
            fields: [
                {
                    label: __("Name"),
                    fieldtype: "Data",
                    fieldname: "name",
                    reqd: 1,
                },
                { fieldtype: "Column Break" },
                {
                    label: __("Company"),
                    fieldtype: "Link",
                    fieldname: "company",
                    options: "Company",
                    reqd: 1,
                    default: frappe.defaults.get_user_default("Company"),
                },
                { fieldtype: "Section Break" },
                {
                    label: __("Item Code (Final Product)"),
                    fieldtype: "Link",
                    fieldname: "item_code",
                    options: "Item",
                    reqd: 1,
                },
                { fieldtype: "Column Break" },
                {
                    label: __("Quantity"),
                    fieldtype: "Float",
                    fieldname: "qty",
                    reqd: 1,
                    default: 1.0,
                },
                { fieldtype: "Section Break" },
                {
                    label: __("Currency"),
                    fieldtype: "Link",
                    fieldname: "currency",
                    options: "Currency",
                    reqd: 1,
                    default: frappe.defaults.get_global_default("currency"),
                },
                { fieldtype: "Column Break" },
                {
                    label: __("Conversion Rate"),
                    fieldtype: "Float",
                    fieldname: "conversion_rate",
                    reqd: 1,
                    default: 1.0,
                },
                { fieldtype: "Section Break" },
                {
                    fieldtype: 'Table',
                    label: __('Operations'),
                    fieldname: 'operations',
                    in_place_edit: true,  // Enable inline editing
                    reqd: 1,
                    fields: [
                        {
                            fieldname: 'operation',
                            label: __('Operation'),
                            fieldtype: 'Link',
                            options: 'Operation',
                            in_list_view: 1,
                            reqd: 1
                        },
                        {
                            fieldname: 'operation_time',
                            label: __('Operation Time'),
                            fieldtype: 'Data',
                            in_list_view: 1,
                            reqd: 1
                        },
                        {
                            fieldname: 'workstation',
                            label: __('Workstation'),
                            fieldtype: 'Link',
                            options: 'Workstation',
                            in_list_view: 1,
                            reqd: 1
                        }
                    ],
                    data: []  // Initialize with empty data
                }
            ],
            primary_action_label: __("Create"),
            primary_action: (values) => {
                values.doctype = frm.doc.doctype;

                frappe.db.insert(values).then((doc) => {
                    frappe.set_route("Form", doc.doctype, doc.name);
                    frappe.call({
                        method:"custom_app.public.py.bom_creator_override.set_value_in_table",
                        args:{
                            value: values,
                            name: doc.name
                        },
                        callback:function(response){
                            setTimeout(() =>{
                                frm.reload_doc();
                            }, 1000)
                        }
                    })
                });
            
            },
        });

        dialog.fields_dict.item_code.get_query = "erpnext.controllers.queries.item_query";
        dialog.show();
    },

    build_tree(frm) {
		let $parent = $(frm.fields_dict["bom_creator"].wrapper);
		$parent.empty();
		frm.toggle_enable("item_code", false);

		frappe.require("/assets/custom_app/js/bom_configurator.bundle.js").then(() => {
			frappe.bom_configurator = new frappe.ui.BOMConfigurator1({
				wrapper: $parent,
				page: $parent,
				frm: frm,
				bom_configurator: frm.doc.name,
			});
		});
	},

    add_custom_buttons(frm) {
        console.log("this callllllllll")
		if (!frm.is_new()) {
			frm.add_custom_button(__("Rebuild Tree"), () => {
				frm.trigger("build_tree");
			});
		}

		if (frm.doc.docstatus === 1 && frm.doc.status !== "Completed") {
			frm.add_custom_button(__("Create Multi-level BOM"), () => {
				frm.trigger("create_multi_level_bom");
			});
		}
	},

    create_multi_level_bom(frm) {
        console.log("this function is call")
		frm.call({
			method: "enqueue_create_boms",
			doc: frm.doc,
            callback:function(r){
                console.log("this callllll")
            }
		});
	},

})