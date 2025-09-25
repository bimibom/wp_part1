/* ===============================
   File: table_visibility_handler.js
   Version: v1.6.1
   =============================== */

const VISIBILITY_STORAGE_KEY_PREFIX_HANDLER = 'dynTables_visibility_';

function initVisibilityControls(tableId, tableName) {
    const $contextMenu = jQuery('#table-context-menu');
    
    $contextMenu.off(`change.visibility.${tableId}`).on(`change.visibility.${tableId}`, '#columns-submenu input[type="checkbox"]', function() {
        if (window.currentContextMenu && window.currentContextMenu.tableId === tableId) {
            handleVisibilityChange(this, tableId, tableName);
        }
    });
    
    console.log(`[DEBUG] Visibility controls initialized for table: ${tableId}`);
}

function handleVisibilityChange(checkbox, tableId, tableName) {
    const $checkbox = jQuery(checkbox);
    const columnKey = $checkbox.data('column');
    const isVisible = $checkbox.is(':checked');
    const table = getDynamicTable(tableId);

    if (!table || !columnKey) {
        console.error('Visibility Handler: Could not get table instance or column key.');
        return;
    }

    try {
        const column = table.column(`${columnKey}:name`);
        if (column.length) {
            column.visible(isVisible);
            console.log(`[DEBUG] Visibility Handler: Set column '${columnKey}' visibility to ${isVisible}.`);
        } else {
            console.warn(`Visibility Handler: Column with name '${columnKey}' not found in table '${tableId}'.`);
        }
    } catch (e) {
        console.error('Visibility Handler: Error updating column visibility in UI.', e);
    }

    const storageKey = VISIBILITY_STORAGE_KEY_PREFIX_HANDLER + tableName;
    try {
        const storedSettingsRaw = localStorage.getItem(storageKey);
        if (storedSettingsRaw) {
            const settings = JSON.parse(storedSettingsRaw);
            settings[columnKey] = isVisible;
            localStorage.setItem(storageKey, JSON.stringify(settings));
            console.log(`[DEBUG] Visibility Handler: Updated settings for '${tableName}' in localStorage.`, settings);
        } else {
             console.warn(`Visibility Handler: Could not find settings for '${tableName}' in localStorage to update.`);
        }
    } catch (e) {
        console.error('Visibility Handler: Error updating localStorage.', e);
    }
}

window.initVisibilityControls = initVisibilityControls;