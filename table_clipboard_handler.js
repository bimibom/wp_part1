/* ===============================
   File: table_clipboard_handler.js
   Version: v1.5.10
   =============================== */

const CLIPBOARD_STORAGE_KEY = 'dynamicTablesClipboard';

// --- HELPER FUNCTIONS ---

function getClipboardData() {
    try {
        const clipboardString = sessionStorage.getItem(CLIPBOARD_STORAGE_KEY);
        if (!clipboardString) return null;
        return JSON.parse(clipboardString);
    } catch (e) {
        console.error('Clipboard Helper: Error reading from sessionStorage', e);
        sessionStorage.removeItem(CLIPBOARD_STORAGE_KEY);
        return null;
    }
}

function setClipboardData(data, tableName, type) {
    try {
        const clipboardObject = { type, data, tableName, timestamp: Date.now() };
        sessionStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(clipboardObject));
        console.log(`[DEBUG] Clipboard Helper: Data of type '${type}' saved to sessionStorage.`, clipboardObject);
    } catch (e) {
        console.error('Clipboard Helper: Error saving to sessionStorage', e);
        alert('Не удалось сохранить данные в буфер обмена.');
    }
}

/**
 * NEW v1.5.10: Checks if two tables have compatible column structures.
 * @param {string} sourceTableName 
 * @param {string} targetTableName 
 * @returns {Promise<boolean>}
 */
async function checkCompatibility(sourceTableName, targetTableName) {
    if (sourceTableName === targetTableName) {
        console.log('[DEBUG] Compatibility check: Same table, compatible.');
        return true;
    }
    try {
        console.log(`[DEBUG] Compatibility check: Fetching configs for '${sourceTableName}' and '${targetTableName}'.`);
        const [sourceConfig, targetConfig] = await Promise.all([
            getTableConfig(sourceTableName),
            getTableConfig(targetTableName)
        ]);

        const sourceKeys = Object.keys(sourceConfig.columns);
        const targetKeys = Object.keys(targetConfig.columns);

        if (sourceKeys.length !== targetKeys.length) {
            console.warn('[DEBUG] Compatibility check: Different number of columns.');
            return false;
        }

        const isCompatible = sourceKeys.every(key => targetKeys.includes(key));
        console.log(`[DEBUG] Compatibility check: Result is ${isCompatible}.`);
        return isCompatible;

    } catch (error) {
        console.error('[FATAL] Compatibility check failed:', error);
        return false; // Fail safely
    }
}


// --- CORE HANDLER FUNCTIONS ---

function handleCopyRow(context) {
    setClipboardData(context.rowData, context.tableName, 'single');
}

function handleClearClipboard() {
    sessionStorage.removeItem(CLIPBOARD_STORAGE_KEY);
    console.log('[DEBUG] Clipboard Handler: Clipboard cleared from sessionStorage.');
}

async function handlePaste(context, position) {
    const clipboard = getClipboardData();

    if (!clipboard || !clipboard.data) {
        await handlePasteRow(context, position); // Paste new default row
        return;
    }
    
    // Use the appropriate handler based on clipboard type
    if (clipboard.type === 'bulk') {
        await handleBulkPaste(context, position);
    } else {
        await handlePasteRow(context, position);
    }
}

async function handlePasteRow(context, position) {
    const { tableName } = context;
    const clipboard = getClipboardData();
    
    if (clipboard) {
        const isCompatible = await checkCompatibility(clipboard.tableName, tableName);
        if (!isCompatible) {
            alert(`Ошибка: Нельзя вставить данные из таблицы "${clipboard.tableName}" в таблицу "${tableName}", так как у них разные структуры колонок.`);
            return;
        }
    }
    
    const dataToPaste = (clipboard && clipboard.type === 'single') ? clipboard.data : null;
    pasteRowWithData(context, dataToPaste, position);
}

async function handlePasteIntoEmptyTable(context) {
    const clipboard = getClipboardData();
    if (clipboard) {
        if (clipboard.type === 'bulk') {
            await handleBulkPaste(context, 'below');
        } else {
            await handlePasteRowIntoEmptyTable(context);
        }
    } else {
         await handlePasteRowIntoEmptyTable(context);
    }
}

async function handlePasteRowIntoEmptyTable(context) {
    const { tableName } = context;
    const clipboard = getClipboardData();

    if (clipboard) {
         const isCompatible = await checkCompatibility(clipboard.tableName, tableName);
         if (!isCompatible) {
            alert(`Ошибка: Нельзя вставить данные из таблицы "${clipboard.tableName}" в таблицу "${tableName}", так как у них разные структуры колонок.`);
            return;
         }
    }

    const dataToPaste = (clipboard && clipboard.type === 'single') ? clipboard.data : null;
    pasteRowWithData(context, dataToPaste, 'below');
}

function pasteRowWithData(context, dataToPaste, position) {
    const { tableId, tableName, $row } = context;
    const table = getDynamicTable(tableId);
    let targetSortOrder = 0;

    if ($row && $row.length) {
        const targetRowData = table.row($row).data();
        if (targetRowData) {
            targetSortOrder = parseInt(String(targetRowData.sort_order).replace(/\s/g, ''), 10) || 0;
        }
    }

    const rowDataObject = dataToPaste || {};
    sendInsertRowRequest(tableId, tableName, rowDataObject, targetSortOrder, position);
}

function sendInsertRowRequest(tableId, tableName, rowData, targetSortOrder, position) {
    jQuery.ajax({
        url: window.AgroGlobals.ajaxurl,
        type: 'POST',
        data: { action: 'dyn_table_insert_row', table: tableName, row_data: rowData, target_sort_order: targetSortOrder, position: position, nonce: window.AgroGlobals.nonce },
        success: function(response) {
            if (response.success) {
                console.log('Clipboard Handler: Single row inserted successfully.', response.data);
                refreshTable(tableId);
            } else {
                console.error('Error inserting row:', response.data);
                alert('Ошибка при вставке строки: ' + response.data);
            }
        },
        error: function(xhr, status, error) {
            console.error('Ajax error inserting row:', error);
            alert('AJAX-ошибка при вставке строки: ' + error);
        }
    });
}