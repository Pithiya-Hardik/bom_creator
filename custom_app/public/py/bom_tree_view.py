import frappe
from frappe import _

@frappe.whitelist()
def execute(bom_creator_name=None):
    data = [] 

    # Fetch the BOM data
    bom_data = frappe.db.sql("""
        SELECT 
            bc.name as bom_creator,
            bc.item_code as finished_item
        FROM 
            `tabBOM Creator` bc
        WHERE 
            bc.docstatus = 1 and
            bc.name = %s
        ORDER BY 
            bc.name
    """,(bom_creator_name), as_dict=True)

    # print("\n\nbom_data", bom_data)

    # Fetch sub-assembly items
    sub_assembly_items = frappe.db.sql("""
        SELECT 
            bci.parent as bom_creator, 
            bci.item_code as sub_assembly_item
        FROM 
            `tabBOM Creator Item` bci
        WHERE 
            bci.is_expandable = 1 and
            bci.parent = %s
        ORDER BY 
            bci.parent
    """,(bom_creator_name), as_dict=True)

    # print("\nsub_assembly_items", sub_assembly_items)

    # Fetch finished item operations
    finished_operations = frappe.db.sql("""
        SELECT 
            ob.parent as bom_creator, 
            ob.operation
        FROM 
            `tabOperastion Bom` ob
        WHERE 
            ob.parent =%s
    """,(bom_creator_name), as_dict=True)

    # print("\nfinished_operations", finished_operations)

    # Fetch sub-assembly operations
    sub_assembly_operations = frappe.db.sql("""
        SELECT 
            sao.parent as bom_creator, 
            sao.item_code as sub_assembly_item,
            sao.operation
        FROM 
            `tabSub Assemblies Oprastion` sao
        WHERE 
            sao.parent =%s
    """,(bom_creator_name), as_dict=True)

    # print("\nsub_assembly_operations", sub_assembly_operations)

    # Process the data into a tree structure
    for row in bom_data:
        bom_data1 = {
            "name": row.bom_creator,
            "operation_type": "Parent",
            "operation_name": row.finished_item,
        }

    for op in finished_operations:
        if op.bom_creator == row.bom_creator:
            finished_operations1 = {
                "name": row.bom_creator,
                "operation_type": "Finished Item Operation",
                "operation_name": op.operation
            }

    for sub_item in sub_assembly_items:        
        if sub_item.bom_creator == row.bom_creator:
            sub_assembly_items1 = {
                "name": sub_item.bom_creator,
                "item_code": sub_item.sub_assembly_item,
                "operation_type": "Sub Assembly Item",
                "operation_name": sub_item.sub_assembly_item,
            }
    for op in sub_assembly_operations:
        if op.bom_creator == row.bom_creator and op.sub_assembly_item == sub_item.sub_assembly_item:
            sub_assembly_operations1 = {
                "name": sub_item.bom_creator,
                "item_code": sub_item.sub_assembly_item,
                "operation_type": "Sub Assembly Operation",
                "operation_name": op.operation
            }

    
    
    return bom_data1, finished_operations1, sub_assembly_items1, sub_assembly_operations1



@frappe.whitelist()
def calculate_total_amount(name):
    self = frappe.get_doc("BOM Creator", name)

    main_operation = self.custom_operastion_bom
    items = self.items
    sub_assemblies_oprastion = self.custom_sub_assemblies_oprastion

    operation_amount = 0
    sub_assemblies_rawmaterial_amount = 0
    for item in main_operation:
        operation_amount += item.amount
    for sub_operation in sub_assemblies_oprastion:
        operation_amount += sub_operation.amount
    for items in items:
        sub_assemblies_rawmaterial_amount += items.amount

    total_amount = operation_amount + sub_assemblies_rawmaterial_amount
    frappe.db.set_value("BOM Creator", name, "custom_sub_assemblies__raw_materials_amount", sub_assemblies_rawmaterial_amount)
    frappe.db.set_value("BOM Creator", name, "custom_operation_amount", operation_amount)
    frappe.db.set_value("BOM Creator", name, "custom_total_amount", total_amount)