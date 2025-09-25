/* ===============================
   File: table_context_menu.js
   Version: v1.6.0
   =============================== */

const VISIBILITY_STORAGE_KEY_PREFIX_MENU = 'dynTables_visibility_';

/**
 * Initialize context menu for a table.
 * @param {string} tableId - The HTML ID of the table element.
 * @param {string} tableName - The database table name.
 */
function initContextMenu(tableId, tableName) {
    const $table = jQuery('#' + tableId);

    if (jQuery('#table-context-menu').length === 0) {
        createContextMenuHTML();
        bindContextMenuEvents();
    }

    $table.off('contextmenu.dynamicTable').on('contextmenu.dynamicTable', 'tbody', function(e) {
        e.preventDefault();
        const dt = window.DynamicTables[tableId];
        const targetTr = jQuery(e.target).closest('tr');
        const clickedRowData = targetTr.length ? dt.row(targetTr).data() : null;

        // Allow context menu on empty table for pasting
        if (!clickedRowData && dt.data().length > 0) return;

        const selectedRows = dt.rows({ selected: true });
        window.currentContextMenu = {
            tableId: tableId,
            tableName: tableName,
            $row: clickedRowData ? targetTr : null,
            rowData: clickedRowData,
            selectedRowsCount: selectedRows.count(),
            selectedRowsData: selectedRows.data().toArray()
        };
        
        console.log('[DEBUG] Context Menu Triggered. Context:', window.currentContextMenu);
        showContextMenu(e.pageX, e.pageY);
        updateMenuState();
    });

    jQuery(document).off('click.hideContextMenu').on('click.hideContextMenu', function(e) {
        if (!jQuery(e.target).closest('#table-context-menu').length) {
            hideContextMenu();
        }
    });
}

/**
 * Create context menu HTML structure.
 */
function createContextMenuHTML() {
    const menuHTML = `
        <div id="table-context-menu" class="dt-context-menu">
            <ul>
                <li class="menu-section">Таблица:</li>
                <li data-action="toggle-filters">🔍 Фильтры</li>
                <li data-action="reset-table">🔄 Сброс</li>
                <li class="submenu">
                    Колонки ▸
                    <div class="submenu-content">
                        <ul id="columns-submenu"></ul>
                    </div>
                </li>
                <li class="separator"></li>
                <li data-action="export-excel">📊 Экспорт в Excel</li>
                <li class="separator"></li>
                <li class="menu-section">Строки:</li>
                <li data-action="clear-clipboard" id="clear-clipboard-item">
                    🧹 Очистить буфер <span id="clipboard-indicator" style="display:none;">🟢</span>
                </li>
                <li data-action="copy-row">📄 Копировать</li>
                <li class="submenu">
                    📥 Вставить ▸
                    <div class="submenu-content">
                        <ul>
                            <li data-action="paste-row" id="paste-row-item">Вставить строку</li>
                            <li class="separator" id="paste-separator"></li>
                            <li data-action="paste-above">Вставить выше</li>
                            <li data-action="paste-below">Вставить ниже</li>
                        </ul>
                    </div>
                </li>
                <li data-action="move-up">🔼 Вверх</li>
                <li data-action="move-down">🔽 Вниз</li>
                <li class="separator"></li>
                <li data-action="delete-row" class="danger">🗑 Удалить</li>
            </ul>
        </div>
    `;
    jQuery('body').append(menuHTML);
}

/**
 * Show and position the context menu.
 * @param {number} x - The horizontal coordinate.
 * @param {number} y - The vertical coordinate.
 */
function showContextMenu(x, y) {
    const $menu = jQuery('#table-context-menu');
    $menu.css({ left: x + 'px', top: y + 'px', display: 'block' });
    const menuWidth = $menu.outerWidth(), menuHeight = $menu.outerHeight();
    const windowWidth = jQuery(window).width(), windowHeight = jQuery(window).height();
    if (x + menuWidth > windowWidth) { $menu.css('left', (x - menuWidth) + 'px'); }
    if (y + menuHeight > windowHeight) { $menu.css('top', (y - menuHeight) + 'px'); }
}

/**
 * Hide the context menu.
 */
function hideContextMenu() {
    jQuery('#table-context-menu').hide();
}

/**
 * Update the menu's state (enabled/disabled items) based on the current context.
 */
function updateMenuState() {
    if (!window.currentContextMenu) return;
    const context = window.currentContextMenu;
    const table = window.DynamicTables[context.tableId];
    const totalRows = table ? table.data().length : 0;
    const selectedCount = context.selectedRowsCount || 0;
    const clipboard = getClipboardData();
    const hasClipboardData = clipboard && clipboard.data;

    jQuery('#clipboard-indicator').toggle(!!hasClipboardData);
    jQuery('#clear-clipboard-item').toggleClass('disabled', !hasClipboardData);
    
    if (totalRows === 0) {
        jQuery('#paste-row-item').show().removeClass('disabled');
        jQuery('#paste-separator, [data-action="paste-above"], [data-action="paste-below"]').hide();
        jQuery('[data-action="copy-row"], [data-action="move-up"], [data-action="move-down"], [data-action="delete-row"]').addClass('disabled');
        jQuery('[data-action="toggle-filters"], [data-action="reset-table"], [data-action="export-excel"]').addClass('disabled');
    } else {
        jQuery('#paste-row-item, #paste-separator').hide();
        jQuery('[data-action="paste-above"], [data-action="paste-below"]').show().removeClass('disabled'); 
        const canActOnRows = selectedCount > 0 || context.rowData;
        jQuery('[data-action="copy-row"], [data-action="delete-row"]').toggleClass('disabled', !canActOnRows);
        jQuery('[data-action="toggle-filters"], [data-action="reset-table"], [data-action="export-excel"]').removeClass('disabled');
    }

    if (totalRows <= 1) {
        jQuery('[data-action="move-up"], [data-action="move-down"]').addClass('disabled');
        jQuery('[data-action="toggle-filters"], [data-action="reset-table"]').addClass('disabled');
    }

    if (selectedCount > 1) {
        jQuery('[data-action="move-up"], [data-action="move-down"]').addClass('disabled');
    }
    
    let copyText = 'Копировать', deleteText = 'Удалить', pasteAboveText = 'Вставить выше', pasteBelowText = 'Вставить ниже', pasteRowText = 'Вставить строку';
    if (selectedCount > 1) {
        copyText = `Копировать строки (${selectedCount})`;
        deleteText = `Удалить строки (${selectedCount})`;
    }
    if (hasClipboardData && clipboard.type === 'bulk') {
        const pasteCount = Array.isArray(clipboard.data) ? clipboard.data.length : 0;
        if (pasteCount > 0) {
             pasteAboveText = `Вставить ${pasteCount} строк(и) выше`;
             pasteBelowText = `Вставить ${pasteCount} строк(и) ниже`;
             pasteRowText = `Вставить ${pasteCount} строк(и)`;
        }
    }
    jQuery('[data-action="copy-row"]').html(`📄 ${copyText}`);
    jQuery('[data-action="delete-row"]').html(`🗑 ${deleteText}`);
    jQuery('[data-action="paste-above"]').text(pasteAboveText);
    jQuery('[data-action="paste-below"]').text(pasteBelowText);
    jQuery('[data-action="paste-row"]').text(pasteRowText);

    updateColumnsSubmenu();
}

/**
 * Dynamically populate the "Columns" submenu based on the table's configuration
 * and the user's saved visibility settings.
 */
function updateColumnsSubmenu() {
    if (!window.currentContextMenu) return;
    const { tableName } = window.currentContextMenu;
    const storageKey = VISIBILITY_STORAGE_KEY_PREFIX_MENU + tableName;

    Promise.all([
        getTableConfig(tableName),
        Promise.resolve(localStorage.getItem(storageKey))
    ]).then(([config, userSettingsJson]) => {
        let userVisibility = {};
        if (userSettingsJson) {
            try { userVisibility = JSON.parse(userSettingsJson); } catch (e) { console.error("Error parsing user visibility settings in menu:", e); }
        }
        const $submenu = jQuery('#columns-submenu').empty();
        for (const columnKey in config.columns) {
            const column = config.columns[columnKey];
            const isVisible = userVisibility.hasOwnProperty(columnKey) ? userVisibility[columnKey] : column.visible;
            const $item = jQuery(`<li><label><input type="checkbox" ${isVisible ? 'checked' : ''} data-column="${columnKey}"> ${column.label}</label></li>`);
            $submenu.append($item);
        }
    }).catch(error => console.error('Error loading data for columns menu:', error));
}


/**
 * Bind click events to the context menu items.
 */
function bindContextMenuEvents() {
    jQuery(document).on('click.contextmenu', '#table-context-menu [data-action]', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const $item = jQuery(this);
        if ($item.hasClass('disabled')) return;
        handleContextMenuAction($item.data('action'));
        hideContextMenu();
    });
}

/**
 * DISPATCHER: Calls the appropriate handler function based on the action.
 * @param {string} action - The action from the data-action attribute.
 */
function handleContextMenuAction(action) {
    const context = window.currentContextMenu;
    if (!context) return;

    const isBulkSelection = context.selectedRowsCount > 1;

    switch (action) {
        case 'clear-clipboard': handleClearClipboard(); break;
        case 'copy-row':
            if (isBulkSelection) {
                handleBulkCopy(context);
            } else {
                handleCopyRow(context);
            }
            break;
        case 'paste-above': handlePaste(context, 'above'); break;
        case 'paste-below': handlePaste(context, 'below'); break;
        case 'paste-row': handlePasteIntoEmptyTable(context); break;
        
        case 'move-up': handleMoveRow(context, 'up'); break;
        case 'move-down': handleMoveRow(context, 'down'); break;
        
        case 'delete-row':
            if (isBulkSelection) {
                handleBulkDelete(context);
            } else {
                handleDeleteRow(context);
            }
            break;
        
        case 'toggle-filters':
        case 'reset-table':
        case 'export-excel':
            alert(`Функционал "${action}" будет реализован в следующих версиях.`);
            break;
            
        default:
            console.warn('Unknown context menu action:', action);
    }
}

window.initContextMenu = initContextMenu;
