import frappe

@frappe.whitelist()
def set_opreation_bom(bom_creator, item, data):
    data = frappe.json.loads(data)

    bom_name = frappe.db.sql(" select name from `tabBOM` where bom_creator=%s and item=%s ",(bom_creator, item), as_dict=True)

    for item in data:
        bom_creator = frappe.get_doc("BOM", bom_name[0]['name'])
        bom_creator.with_operations = 1
        bom_creator.append("operations",
                {
                    "operation": item["operation"],
                    "workstation_type": item["workstation"],
                    "time_in_mins": item["operation_time"],                
                },
            )
        bom_creator.save()