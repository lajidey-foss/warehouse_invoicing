frappe.ui.form.on('Sales Invoice', {    
    refresh(frm){
    let grid_button = frm.fields_dict["items"].grid.add_custom_button(__('My Action'), 
        function(){
            //frappe.msgprint(__("Frappetastic !!"));
            item_selector();
        });
        grid_button.removeClass('btn-secondary').addClass('btn-primary').addClass('order-1');
   },
   

});
function item_selector(){
    // method: 'erpnext.stock.dashboard.item_dashboard.get_data',

    var dialog = new frappe.ui.Dialog({
        title: __("Process CheckOut Items"),
        width: 400,
        fields: [
          {
            fieldname: "item",
            label: __("Search for Item"),
            fieldtype: "Link",
            options: "Item",
            /* get_query: () => {
              return { query: "erpnext.coTASTYTOM 70Gntrollers.queries.employee_query" };
            }, */
            reqd: 1,
            onchange: function () {
              //console.log(this.value)
              
  
                if (
                  dialog.fields_dict.item.value
                  
                ) {
                  options = [];
                  cur_dialog.refresh()                            

                    frappe.call({
                      method: 'erpnext.stock.dashboard.item_dashboard.get_data',
                      
                      args: {
                          item_code: dialog.fields_dict.item.value,
                      },
                      callback: function(r) {

                          if (r.message.length > 0 ){ //&& !current_doc
                            $(`<div class="modal-body ui-front">
                              <h2>${dialog.fields_dict.item.value}</h2>
                              <p>Begin Warehouse processing: </p>
                              <table class="table table-bordered">
                              <thead>
                                  <tr>
                                  <th>Available Qty</th>
                                  <th>Warehouse</th> 
                                  <th>Check Out Qty</th>
                                  </tr>
                              </thead>
                              <tbody></tbody>
                              </table>
                              </div>`).appendTo(dialog.body);
                              /* (r.message || []).forEach(function(row){ 
                                console.log("man of war zag bot: ", row.warehouse);
                                options.push(row.warehouse);
                                const tbody = $(dialog.body).find('tbody');
                                const tr = $(`
                                  <tr>
                                  <td>${row.actual_qty}</td>
                                  <td>${row.warehouse}</td>
                                  <td><input type="input" class="check-warehouse" data-warehouse="${row.warehouse}"> </td>
                                  </tr>
                                  `).appendTo(tbody)
                              }); */
                              
                              //cur_dialog.fields[1].options = options
                              
                            
                              r.message.forEach(element => {
                                options.push(element.warehouse);
                                  const tbody = $(dialog.body).find('tbody');
                                  const tr = $(`
                                      <tr>
                                      <td>${element.actual_qty}</td>
                                      <td>${element.warehouse}</td>
                                      <td><input type="input" class="check-warehouse" data-warehouse="${element.warehouse}"> </td>
                                      </tr>
                                      `).appendTo(tbody)                                      
                              });
                              console.log(options)
                              cur_dialog.refresh()
                                  
                          }
                      }
                  });
                }
            },
          },
          
        ],
        primary_action(data) {
          if (cur_dialog.no_unmarked_days_left) {
            frappe.call({
              method: "hr_addon.hr_addon.doctype.workday.workday.get_created_workdays", // Adjust to the correct path
              args: {
                  employee: dialog.fields_dict.employee.value,
                  date_from: dialog.fields_dict.date_from.value,
                  date_to: dialog.fields_dict.date_to.value
              },
              callback: function(response) {
                  if (response.message) {
                      let workdays = response.message;
                      console.log("Matched Workdays: ", workdays);
          
                      // Extract the list of dates from the matched workdays
                      let workday_dates = workdays.map(workday => workday.log_date);
          
                      // Convert the list of dates into a comma-separated string
                      let workday_dates_string = workday_dates.map(date => `• ${date.trim()}`).join('<br>'); 
                      frappe.msgprint(
                      __("Workday for the period: {0} - {1}, has already been processed for the Employee {2}. <br><br>For following dates workdays are available:<br>{3}",
                      [
                        frappe.datetime.str_to_user(dialog.fields_dict.date_to.value) ,
                        frappe.datetime.str_to_user(dialog.fields_dict.date_from.value),
                        dialog.fields_dict.employee.value,
                        workday_dates_string // Insert the formatted list of workday dates
                      ]));
                  }
              }
          });
          
          } else {
            frappe.call({
              method: "hr_addon.hr_addon.doctype.workday.workday.bulk_process_workdays",
              args: {
                data: data,
                flag : "Do not create workday"
                
              },
              callback: function (response) {
                  if (response.message) {
                      let missingDates = response.message.missing_dates;
                      console.log(response.message.flag)
                      let missing_dates_string = missingDates.length > 0 ? missingDates.join(", ") : "None";
                      frappe.confirm(
                        __("Are you sure you want to process the workday for {0} from {1} to {2}?<br><br>For the following dates workdays will be created:<br>{3}", [
                          data.employee,
                          frappe.datetime.str_to_user(data.date_from),
                          frappe.datetime.str_to_user(data.date_to),
                          missing_dates_string.split(',').map(date => `• ${date.trim()}`).join('<br>')
                      ]),
                        function () {
                          // If user clicks "Yes"
                          flag = ""
                          frappe.call({
                            method: "hr_addon.hr_addon.doctype.workday.workday.bulk_process_workdays",
                            args: {
                                data: data,
                                flag : "Create workday"
                               
                            },
                            callback: function (r) {
                                if (r.message === 1) {
                                  console.log(r.message.flag)
                                    frappe.show_alert({
                                        message: __("Workdays Processed"),
                                        indicator: "blue",
                                    });
                                    cur_dialog.hide();
                                }
                            },
                        });
                        },
                        function () {
                          console.log('no')
                          // If user clicks "No"
                          //frappe.msgprint('You clicked No!');
                          // Cancel the action here or do nothing
                        }
                      );
                      
                    
                  }
              }
          });
          
          }
          dialog.hide();
        },
        primary_action_label: __("Process CheckOut"),
      });
      dialog.$wrapper
          .find(".btn-modal-primary")
          .removeClass("btn-primary")
          .addClass("btn-dark");
        dialog.show();
        
    
};