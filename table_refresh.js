/* ===============================
   File: table_refresh.js
   Version: v1.5.0
   =============================== */

/**
 * Core refresh system for dynamic tables
 * Provides unified methods for updating table data after CRUD operations
 */

/**
 * Refresh a single cell in the table
 * @param {string} tableId - Table HTML ID
 * @param {number} rowIndex - Row index in DataTable
 * @param {number} columnIndex - Column index
 * @param {*} newValue - New cell value
 */
function refreshCell(tableId, rowIndex, columnIndex, newValue) {
    const table = window.DynamicTables[tableId];
    if (!table) {
        console.error('Table not found:', tableId);
        return;
    }
    
    try {
        // Update cell data
        table.cell(rowIndex, columnIndex).data(newValue);
        
        // Redraw only the affected row for performance
        table.row(rowIndex).draw(false);
        
        console.log('Cell refreshed:', tableId, rowIndex, columnIndex, newValue);
    } catch (error) {
        console.error('Error refreshing cell:', error);
    }
}

/**
 * Refresh an entire row in the table
 * @param {string} tableId - Table HTML ID
 * @param {number} rowIndex - Row index in DataTable
 * @param {Array} newRowData - New row data array
 */
function refreshRow(tableId, rowIndex, newRowData) {
    const table = window.DynamicTables[tableId];
    if (!table) {
        console.error('Table not found:', tableId);
        return;
    }
    
    try {
        // Update row data
        table.row(rowIndex).data(newRowData);
        
        // Redraw the row
        table.row(rowIndex).draw(false);
        
        console.log('Row refreshed:', tableId, rowIndex, newRowData);
    } catch (error) {
        console.error('Error refreshing row:', error);
    }
}

/**
 * Refresh the entire table (reload data from server)
 * @param {string} tableId - Table HTML ID
 */
function refreshTable(tableId) {
    const table = window.DynamicTables[tableId];
    if (!table) {
        console.error('Table not found:', tableId);
        return;
    }
    
    try {
        // Reload data from server
        table.ajax.reload(null, false); // false = keep current page
        
        console.log('Table refreshed:', tableId);
    } catch (error) {
        console.error('Error refreshing table:', error);
    }
}

/**
 * Add a new row to the table
 * @param {string} tableId - Table HTML ID
 * @param {Array} rowData - New row data
 * @param {string} position - 'top' or 'bottom'
 */
function addRowToTable(tableId, rowData, position = 'bottom') {
    const table = window.DynamicTables[tableId];
    if (!table) {
        console.error('Table not found:', tableId);
        return;
    }
    
    try {
        if (position === 'top') {
            // Add to beginning
            table.row.add(rowData).draw(false);
            // Move to top (DataTables adds to bottom by default)
            const newRowNode = table.row(':last').node();
            jQuery(newRowNode).prependTo(table.table().body());
        } else {
            // Add to end
            table.row.add(rowData).draw(false);
        }
        
        console.log('Row added to table:', tableId, rowData, position);
    } catch (error) {
        console.error('Error adding row to table:', error);
    }
}

/**
 * Remove a row from the table
 * @param {string} tableId - Table HTML ID
 * @param {number} rowIndex - Row index to remove
 */
function removeRowFromTable(tableId, rowIndex) {
    const table = window.DynamicTables[tableId];
    if (!table) {
        console.error('Table not found:', tableId);
        return;
    }
    
    try {
        // Remove row and redraw
        table.row(rowIndex).remove().draw(false);
        
        console.log('Row removed from table:', tableId, rowIndex);
    } catch (error) {
        console.error('Error removing row from table:', error);
    }
}

/**
 * Insert a row at specific position
 * @param {string} tableId - Table HTML ID
 * @param {Array} rowData - New row data
 * @param {number} targetIndex - Index where to insert
 * @param {string} position - 'above' or 'below'
 */
function insertRowAtPosition(tableId, rowData, targetIndex, position = 'below') {
    const table = window.DynamicTables[tableId];
    if (!table) {
        console.error('Table not found:', tableId);
        return;
    }
    
    try {
        // Add the row first
        const newRow = table.row.add(rowData);
        
        // Get the new row node
        const newRowNode = newRow.node();
        const targetRowNode = table.row(targetIndex).node();
        
        if (position === 'above') {
            jQuery(newRowNode).insertBefore(targetRowNode);
        } else {
            jQuery(newRowNode).insertAfter(targetRowNode);
        }
        
        // Redraw to update display
        table.draw(false);
        
        console.log('Row inserted at position:', tableId, rowData, targetIndex, position);
    } catch (error) {
        console.error('Error inserting row at position:', error);
    }
}