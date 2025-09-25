/* ===============================
   File: table_delete_handler.js
   Version: v1.5.0
   =============================== */

/**
 * Handles the row deletion process.
 * Prompts the user for confirmation, sends an AJAX request to the server,
 * and refreshes the table upon successful deletion.
 *
 * @param {object} context - The current context menu object.
 * @param {string} context.tableId - The HTML ID of the table.
 * @param {string} context.tableName - The database name of the table.
 * @param {object} context.rowData - The data object for the targeted row.
 */
function handleDeleteRow(context) {
    const { tableId, tableName, rowData } = context;

    // 1. Confirm the action with the user
    if (confirm('Вы уверены, что хотите удалить эту строку?')) {
        const table = window.DynamicTables[tableId];
        if (!table) {
            console.error('Delete handler: Table instance not found for ID:', tableId);
            return;
        }

        // 2. Extract the row ID from the 'id' property of the row data object
        const rowId = parseInt(String(rowData.id).replace(/\s/g, ''), 10);

        if (!rowId) {
            console.error('Delete handler: Could not extract a valid row ID from row data:', rowData);
            alert('Не удалось определить ID строки для удаления.');
            return;
        }

        console.log(`[DEBUG] Delete handler: Attempting to delete row with ID: ${rowId}`);

        // 3. Send the AJAX request to the server to perform the deletion
        jQuery.ajax({
            url: window.AgroGlobals.ajaxurl,
            type: 'POST',
            data: {
                action: 'dyn_table_delete_row',
                table: tableName,
                row_id: rowId,
                nonce: window.AgroGlobals.nonce
            },
            success: function(response) {
                if (response.success) {
                    console.log('Delete handler: Row deleted successfully. Server response:', response.data);
                    // 4. Refresh the table to show the changes
                    refreshTable(tableId);
                } else {
                    console.error('Delete handler: Error deleting row:', response.data);
                    alert('Ошибка при удалении строки: ' + response.data);
                }
            },
            error: function(xhr, status, error) {
                console.error('Delete handler: Ajax error deleting row:', error);
                alert('AJAX-ошибка при удалении строки: ' + error);
            }
        });
    }
}