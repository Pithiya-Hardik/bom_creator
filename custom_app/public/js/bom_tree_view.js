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
                        // console.log(data)
                        render_tree_view(data, frm);
                    }
                }
            });
        }
    }
});


function render_tree_view(data, frm) {
    let tree_view_html = '';

    let nodes = {}; // Map of all nodes
    let tree = []; // List of top-level nodes (parents)

    //     // Create nodes and identify the main parent
    data.forEach(row => {
        let node = {
            name: row.name,
            operation_name: row.operation_name,
            operation_type: row.operation_type,
            children: []
        };

        if (row.operation_type === "Parent") {
            nodes[row.name] = node;
            tree.push(node);
        }
    });

    // Establish parent-child relationships
    data.forEach(row => {
        if (row.operation_type === "Finished Item Operation") {
            let parentNode = nodes[row.name];
            if (parentNode) {
                parentNode.children.push({
                    name: row.operation_name,
                    operation_name: row.operation_name,
                    operation_type: row.operation_type,
                });
            }
        }
    });

    // Establish parent-child relationships for Sub Assembly Item
    data.forEach(row => {
        if (row.operation_type === "Sub Assembly Item") {
            let parentNode = nodes['Main Test']; // Assuming 'Main Test' is the top parent
            if (parentNode) {
                parentNode.children.push({
                    name: row.name,
                    operation_name: row.operation_name,
                    operation_type: row.operation_type,
                    children: []
                });
            }
        }
    });

    // Establish parent-child relationships for Sub Assembly Operation
    data.forEach(row => {
        if (row.operation_type === "Sub Assembly Operation") {
            let subAssemblyNode = nodes['Main Test']
            if (subAssemblyNode) {
                subAssemblyNode.children.push({
                    name: row.operation_name,
                    operation_name: row.operation_name,
                    operation_type: row.operation_type,
                    children: []
                });
            }
        }
    });
    console.log(nodes)


    // Render function to create HTML for a node
    function renderNode(node) {
        let html = `<li>${node.operation_name}`;
        if (node.children.length > 0) {
            html += `<ul>`;
            node.children.forEach(child => {
                html += `<li>${child.operation_name}</li>`;
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

    frm.fields_dict['custom_tree_view'].html(tree_view_html);
}

// function render_tree_view(data, frm) {
//     let tree_view_html = '';

//     let nodes = {}; // Map of all nodes
//     let tree = []; // List of top-level nodes (parents)

//     // Create nodes and identify the main parent
//     data.forEach(row => {
//         let node = {
//             name: row.name,
//             operation_name: row.operation_name,
//             operation_type: row.operation_type,
//             children: []
//         };

//         nodes[row.name] = node;

//         if (row.operation_type === "Parent") {
//             tree.push(node);
//         }
//     });

//     // Establish parent-child relationships for Finished Item Operation
//     data.forEach(row => {
//         if (row.operation_type === "Finished Item Operation") {
//             let parentNode = nodes[row.name];
//             if (parentNode) {
//                 parentNode.children.push({
//                     name: row.operation_name,
//                     operation_name: row.operation_name,
//                     operation_type: row.operation_type,
//                     children: []
//                 });
//             }
//         }
//     });

//     // Establish parent-child relationships for Sub Assembly Item
//     data.forEach(row => {
//         if (row.operation_type === "Sub Assembly Item") {
//             let parentNode = nodes['Main Test']; // Assuming 'Main Test' is the top parent
//             if (parentNode) {
//                 let subAssemblyItemNode = nodes[row.operation_name];
//                 if (subAssemblyItemNode) {
//                     parentNode.children.push(subAssemblyItemNode);
//                 } else {
//                     let newSubAssemblyItemNode = {
//                         name: row.operation_name,
//                         operation_name: row.operation_name,
//                         operation_type: row.operation_type,
//                         children: []
//                     };
//                     parentNode.children.push(newSubAssemblyItemNode);
//                     nodes[row.operation_name] = newSubAssemblyItemNode;
//                 }
//             }
//         }
//     });

//     // Establish parent-child relationships for Sub Assembly Operation
//     data.forEach(row => {
//         if (row.operation_type === "Sub Assembly Operation") {
//             let subAssemblyNode = nodes['Main Test'];
//             if (subAssemblyNode) {
//                 subAssemblyNode.children.push({
//                     name: row.operation_name,
//                     operation_name: row.operation_name,
//                     operation_type: row.operation_type,
//                     children: []
//                 });
//             }
//         }
//     });

//     console.log(nodes)

//     // Render function to create HTML for a node
//     function renderNode(node) {
//         let html = `<li>${node.operation_name}`;
//         if (node.children.length > 0) {
//             html += `<ul>`;
//             node.children.forEach(child => {
//                 html += renderNode(child);
//             });
//             html += `</ul>`;
//         }
//         html += `</li>`;
//         return html;
//     }

//     // Render only the main parent and its direct children
//     tree.forEach(rootNode => {
//         tree_view_html += `<ul>${renderNode(rootNode)}</ul>`;
//     });

//     frm.fields_dict['custom_tree_view'].html(tree_view_html);
// }