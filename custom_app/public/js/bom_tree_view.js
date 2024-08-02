// custom_bom_tree_view.js

frappe.ui.form.on('BOM Creator', {
    refresh: function (frm) {
        if (frm.doc.docstatus == 1) {
            frappe.call({
                method: "custom_app.public.py.bom_tree_view.execute",
                args: {
                    bom_creator_name: frm.doc.name
                },
                callback: function (r) {
                    if (r.message) {
                        let data = r.message;
                        console.log("data", data)
                        render_tree_view(data, frm);
                    }
                }
            });
        }
        frappe.call({
            method: "custom_app.public.py.bom_tree_view.calculate_total_amount",
            args: {
                name: frm.doc.name
            }
        })
    },

});


function render_tree_view(data, frm) {
    let tree_view_html = '';

    let nodes = {};
    let tree = [];

    data.forEach(row => {
        if (row.operation_type == "Parent") {
            let node = {
                operation_type: row.operation_type,
                operation_name: row.operation_name,
                children: []
            }

            nodes[row.name] = node;
            tree.push(node);
        }
        else if (row.operation_type == "Finished Item Operation") {
            let parentNode = nodes[row.name];
            if (parentNode) {
                parentNode.children.push({
                    operation_name: row.operation_name,
                    operation_type: row.operation_type,
                });
            }
        }
        else if (row.operation_type == "Sub Assembly Item") {
            let parentNode = nodes[row.name];
            if (parentNode) {
                var subAssemblyNode = {
                    item_code: row.item_code,
                    operation_name: row.operation_name,
                    operation_type: row.operation_type,
                    children: []
                };
                parentNode.children.push(subAssemblyNode);
                // Also add the subAssemblyNode to nodes so that it can be a parent to further nodes
                nodes[row.operation_name] = subAssemblyNode;
            }
        }
        else if (row.operation_type === "Sub Assembly Operation") {
            let data1 = nodes[row.name]
            data1.children.forEach(row1 => {
                if (row1.operation_type == "Sub Assembly Item") {
                    let subAssembly = row1
                    if (subAssembly) {
                        subAssembly.children.push({
                            item_code: row.item_code,
                            operation_name: row.operation_name,
                            operation_type: row.operation_type,
                        });
                    }
                }
            })
        }
    })

    function renderNode(node) {
        let html = `<li>${node.operation_name}`;
        if (node.children && node.children.length > 0) {
            html += `<ul>`;
            node.children.forEach(child => {
                html += renderNode(child);  // Recursively render child nodes
            });
            html += `</ul>`;
        }
        html += `</li>`;
        return html;
    }

    // Render only the main parent and its direct children
    tree.forEach(rootNode => {
        tree_view_html += `<ul>${renderNode(rootNode)}</ul>`;
    });

    // frm.fields_dict['custom_tree_view'].html(tree_view_html);
}
