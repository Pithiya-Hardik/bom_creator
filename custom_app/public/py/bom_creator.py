import frappe
from frappe import _


@frappe.whitelist()
def set_opreation_bom(bom_creator, item, data, sub_items, sub_opration):
    data = frappe.json.loads(data)
    sub_items = frappe.json.loads(sub_items)
    sub_opration = frappe.json.loads(sub_opration)

    bom_name = frappe.db.sql(" select name from `tabBOM` where bom_creator=%s and item=%s ",(bom_creator, item), as_dict=True)

    for item in data:
        bom_creators = frappe.get_doc("BOM", bom_name[0]['name'])
        bom_creators.with_operations = 1
        bom_creators.append("operations",
                {
                    "operation": item["operation"],
                    "workstation_type": item["workstation"],
                    "time_in_mins": item["operation_time"],                
                },
            )
        bom_creators.save()

    for sub_item in sub_items:
        bom_name = frappe.db.sql(" select name from `tabBOM` where bom_creator=%s and item=%s and bom_creator_item=%s ",(bom_creator, sub_item['item_code'], sub_item['name']), as_dict=True)

        if bom_name:
            for sub_oprations in sub_opration:
                if sub_oprations['item_code'] == sub_item['item_code']:
                    add_opration = frappe.get_doc("BOM", bom_name[0]['name'])
                    add_opration.with_operations = 1
                    add_opration.append("operations",{
                        "operation": sub_oprations["operation"],
                        "workstation_type": sub_oprations["workstation"],
                        "time_in_mins": sub_oprations["operation_time"],
                    })
                    add_opration.save()

    frappe.msgprint(
        msg=_("Operation Added Successfully In BOM"),
        alert=True,
        indicator='green'
    )
   
    