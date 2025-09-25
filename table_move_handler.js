/* ===============================
   File: table_move_handler.js
   Version: v1.5.0
   =============================== */

/**
 * Handles moving a row up or down.
 * It sends an AJAX request to the server to update the sort_order
 * and then refreshes the table.
 *
 * @param {object} context - The current context menu object.
 * @param {string} context.tableId - The HTML ID of the table.
 * @param {string} context.tableName - The database name of the table.
 * @param {object} context.rowData - The data object for the targeted row.
 * @param {string} direction - The direction to move the row ('up' or 'down').
 */
function handleMoveRow(context, direction) {
    const { tableId, tableName, rowData } = context;
    const table = window.DynamicTables[tableId];
    if (!table) {
        console.error('Move handler: Table instance not found for ID:', tableId);
        return;
    }

    // 1. Extract the row ID from the 'id' property of the row data object.
    const rowId = parseInt(String(rowData.id).replace(/\s/g, ''), 10);

    if (!rowId) {
        console.error('Move handler: Could not extract a valid row ID from row data:', rowData);
        alert('Не удалось определить ID строки для перемещения.');
        return;
    }

    console.log(`[DEBUG] Move handler: Attempting to move row ID ${rowId} ${direction}.`);

    // 2. Send the AJAX request to the server.
    jQuery.ajax({
        url: window.AgroGlobals.ajaxurl,
        type: 'POST',
        data: {
            action: 'dyn_table_move_row',
            table: tableName,
            row_id: rowId,
            direction: direction,
            nonce: window.AgroGlobals.nonce
        },
        success: function(response) {
            if (response.success) {
                console.log('Move handler: Row moved successfully.', response.data);
                // 3. Refresh the entire table to reflect the new sort order.
                refreshTable(tableId);
            } else {
                console.error('Move handler: Error moving row:', response.data);
            }
        },
        error: function(xhr, status, error) {
            console.error('Move handler: Ajax error moving row:', error);
            alert('AJAX-ошибка при перемещении строки: ' + error);
        }
    });
}