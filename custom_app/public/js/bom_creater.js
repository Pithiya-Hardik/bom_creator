frappe.ui.form.on("BOM Creator", {
    onload: function (frm) {

        setTimeout(function() {
            // Replace '#dialog-id' with the actual ID or class of the dialog you want to hide
            var dialog = document.querySelector('.modal-content');
            // var a = document.querySelector('.modal-backdrop')
            if (dialog) {
                dialog.style.display = 'none';
                // a.style.display = 'none';
            }
            // Hide the overlay (dark screen)
            // var overlay = document.querySelector('.show'); // Replace with the actual overlay ID or class
            // if (overlay) {
            //     overlay.style.display = 'none';
            // }
            // document.getElementsByClassName("modal-backdrop")[0].remove()
        }, 100); // Adjust delay as needed

        let d = new frappe.ui.Dialog({
            title: 'Enter Details',
            fields: [
                {
                    fieldtype: 'Section Break',
                    fieldname: 'item_details',
                    label: __('Item Details')
                },
                {
                    label: 'Name',
                    fieldname: 'name',
                    fieldtype: 'Data',
                    reqd: 1
                },
                {
                    fieldtype: 'Column Break',
                    fieldname: 'column_break',
                    label: __()
                },
                {
                    label: 'Company',
                    fieldname: 'company',
                    fieldtype: 'Link',
                    options: 'Company',  // Specify the doctype for the link
                    reqd: 1,
                    default: cur_frm.doc.company

                },
                {
                    fieldtype: 'Section Break',
                    fieldname: 'operation_details1',
                    label: __()
                },
                {
                    label: 'Item Code',
                    fieldname: 'item_code',
                    fieldtype: 'Link',
                    options: "Item",
                    reqd: 1
                },
                {
                    fieldtype: 'Column Break',
                    fieldname: 'column_break1',
                    label: __()
                },
                {
                    label: 'Quantity',
                    fieldname: 'qty',
                    fieldtype: 'Int',
                    default: 1,
                    reqd: 1
                },
                {
                    fieldtype: 'Section Break',
                    fieldname: 'operation_details2',
                    label: __()
                },
                {
                    label: 'Currency',
                    fieldname: 'currency',
                    fieldtype: 'Link',
                    options: 'Currency',
                    reqd: 1,
                    default: 'INR'
                },
                {
                    fieldtype: 'Column Break',
                    fieldname: 'column_break2',
                    label: __()
                },
                {
                    label: 'Conversion Rate',
                    fieldname: 'conversion_rate',
                    fieldtype: 'Float',
                    default: 1
                },
                {
                    fieldtype: 'Section Break',
                    fieldname: 'operation_details',
                    label: __()
                },
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
                            options: 'Workstation Type',
                            in_list_view: 1,
                            reqd: 1
                        }
                    ],
                    data: []  // Initialize with empty data
                }
            ],
            size: 'medium', // small, large, extra-large 
            primary_action_label: 'Submit',
            primary_action(values) {
                frm.set_value("__newname", values.name)
                frm.set_value("item_code", values.item_code)
                frm.set_value("qty", values.qty)
                frm.set_value("currency", values.currency)

                // Clear existing rows in the child table before adding new ones
                frm.clear_table("custom_operastion_bom");

                // Add rows to the child table based on the dialog data
                values.operations.forEach(function (obj) {
                    let child = frm.add_child("custom_operastion_bom");
                    child.operation = obj['operation'];
                    child.workstation = obj['workstation'];
                    child.operation_time = obj['operation_time'];
                });

                // Refresh the child table field to display the updated data
                frm.refresh_field("custom_operastion_bom");
                // Hide the dialog
                d.hide();
            }
        });

        d.show();

    }
})