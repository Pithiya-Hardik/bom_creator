// custom_bom_tree_view.js

frappe.ui.form.on('BOM Creator', {
    refresh: function(frm) {
        if(frm.doc.docstatus == 1) {
            frappe.call({
                method: "custom_app.public.py.bom_tree_view.execute",
                args: {},
                callback: function(r) {
                    if (r.message) {
                        let data = r.message;
                        console.log("this callll", data)
                        render_tree_view(data);
                    }
                }
            });
        }
    }
});

function render_tree_view(data) {
    let tree_view_html = '';

    let parent_nodes = {};

    data.forEach(row => {
        if (row.operation_type === "Parent") {
            tree_view_html += `<ul><li>${row.operation_name}</li>`;
            parent_nodes[row.name] = `<ul>`;
        } else if (row.operation_type === "Sub Assembly Item") {
            parent_nodes[row.name] += `<li>${row.operation_name}</li><ul>`;
            parent_nodes[row.name + "_" + row.operation_name] = '';
        } else {
            if (row.operation_type === "Finished Item Operation" && parent_nodes[row.name]) {
                parent_nodes[row.name] += `<li>${row.operation_name}</li>`;
            } else if (row.operation_type === "Sub Assembly Operation" && parent_nodes[row.name + "_" + row.operation_name]) {
                parent_nodes[row.name + "_" + row.operation_name] += `<li>${row.operation_name}</li>`;
            }
        }
    });

    for (let key in parent_nodes) {
        parent_nodes[key] += `</ul>`;
        tree_view_html += parent_nodes[key] + `</ul>`;
    }

    frm.fields_dict['custom_tree_view'].html(tree_view_html);
}

