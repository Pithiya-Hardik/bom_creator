import frappe
from frappe import _

@frappe.whitelist()
def execute(filters=None):
    data = [] 

    # Fetch the BOM data
    bom_data = frappe.db.sql("""
        SELECT 
            bc.name as bom_creator,
            bc.item_code as finished_item
        FROM 
            `tabBOM Creator` bc
        WHERE 
            bc.docstatus = 1
        ORDER BY 
            bc.name
    """, as_dict=True)

    # Fetch sub-assembly items
    sub_assembly_items = frappe.db.sql("""
        SELECT 
            bci.parent as bom_creator, 
            bci.item_code as sub_assembly_item
        FROM 
            `tabBOM Creator Item` bci
        WHERE 
            bci.is_expandable = 1
        ORDER BY 
            bci.parent
    """, as_dict=True)

    # Fetch finished item operations
    finished_operations = frappe.db.sql("""
        SELECT 
            ob.parent as bom_creator, 
            ob.operation
        FROM 
            `tabOperastion Bom` ob
        WHERE 
            ob.parent IS NOT NULL
    """, as_dict=True)

    # Fetch sub-assembly operations
    sub_assembly_operations = frappe.db.sql("""
        SELECT 
            sao.parent as bom_creator, 
            sao.item_code as sub_assembly_item,
            sao.operation
        FROM 
            `tabSub Assemblies Oprastion` sao
        WHERE 
            sao.parent IS NOT NULL
    """, as_dict=True)

    # Process the data into a tree structure
    for row in bom_data:
        parent_bom = {
            "name": row.bom_creator,
            "operation_type": "Parent",
            "operation_name": row.finished_item
        }
        data.append(parent_bom)
        
        for op in finished_operations:
            if op.bom_creator == row.bom_creator:
                finished_operation = {
                    "name": op.operation_name,
                    "operation_type": "Finished Item Operation",
                    "operation_name": op.operation_name
                }
                data.append(finished_operation)
        
        for sub_item in sub_assembly_items:
            if sub_item.bom_creator == row.bom_creator:
                sub_assembly = {
                    "name": sub_item.sub_assembly_item,
                    "operation_type": "Sub Assembly Item",
                    "operation_name": sub_item.sub_assembly_item
                }
                data.append(sub_assembly)
                
                for op in sub_assembly_operations:
                    if op.bom_creator == row.bom_creator and op.sub_assembly_item == sub_item.sub_assembly_item:
                        sub_assembly_operation = {
                            "name": op.operation_name,
                            "operation_type": "Sub Assembly Operation",
                            "operation_name": op.operation_name
                        }
                        data.append(sub_assembly_operation)
    
    return data
