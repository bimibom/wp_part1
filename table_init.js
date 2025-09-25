/* ===============================
   File: table_init.js
   Version: v1.8.4
   =============================== */

window.DynamicTables = window.DynamicTables || {};
const VISIBILITY_STORAGE_KEY_PREFIX = 'dynTables_visibility_';

function initDynamicTable(tableId, tableName) {
    if (!window.AgroGlobals || !window.AgroGlobals.ajaxurl) { console.error('[FATAL] AgroGlobals not found.'); return; }
    const $table = jQuery('#' + tableId);
    if ($table.length === 0) { console.error('[FATAL] Table element not found:', tableId); return; }

    getTableConfig(tableName).then(config => {
        const visibilityStorageKey = VISIBILITY_STORAGE_KEY_PREFIX + tableName;
        let userVisibilitySettings = null;
        try { const storedSettings = localStorage.getItem(visibilityStorageKey); if (storedSettings) { userVisibilitySettings = JSON.parse(storedSettings); } } catch (e) { console.error('Error parsing visibility settings from localStorage:', e); }

        const dtColumns = [];
        const dtColumnDefs = [];
        let colIdx = 0;

        // --- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ v1.8.4: Мы строим dtColumns ВСЕГДА из полного списка ---
        for (const columnKey in config.columns) {
            const columnConfig = config.columns[columnKey];
            
            // Получаем видимость из localStorage, если она там есть
            const isVisible = (userVisibilitySettings && userVisibilitySettings.hasOwnProperty(columnKey))
                ? userVisibilitySettings[columnKey]
                : columnConfig.visible;

            dtColumns.push({ 
                data: columnKey,
                title: columnConfig.label,
                name: columnKey,
                visible: isVisible // Применяем настройку видимости здесь
            });
            if (columnConfig.type === 'int' || columnConfig.type === 'decimal') {
                dtColumnDefs.push({ targets: colIdx, type: 'num' });
            }
            colIdx++;
        }
        
        const selectedColor = '#dbeafe', hoverSelectedColor = '#bfdbfe';
        let wasSimpleClick = false;

        const dtConfig = {
            processing: true,
            serverSide: false,
            ajax: { url: window.AgroGlobals.ajaxurl, type: 'POST', data: { action: 'dyn_table_fetch', table: tableName, nonce: window.AgroGlobals.nonce || '' }, dataSrc: function(json) { if (json.data && Array.isArray(json.data)) { return json.data; } console.error('Ajax error or invalid data format:', json); return []; } },
            responsive: true,
            colResize: true,
            fixedHeader: { header: true, headerOffset: jQuery('body.admin-bar').length ? 32 : 0 },
            select: { style: 'os', blurable: true },
            pageLength: 25,
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Все"]],
            language: { processing: "Обработка...", search: "Поиск:", lengthMenu: "Показать _MENU_ записей", info: "Записи с _START_ до _END_ из _TOTAL_ записей", infoEmpty: "Записи с 0 до 0 из 0 записей", infoFiltered: "(отфильтровано из _MAX_ записей)", zeroRecords: "Записи отсутствуют.", emptyTable: "В таблице отсутствуют данные", paginate: { first: "Первая", previous: "Предыдущая", next: "Следующая", last: "Последняя" }, select: { rows: { _: "Выделено %d строк", 0: "", 1: "Выделена 1 строка" } } },
            dom: '<"top"lf>rt<"bottom"ip><"clear">',
            order: [[1, 'asc']],
            columns: dtColumns, // Передаем ПОЛНЫЙ массив колонок
            columnDefs: dtColumnDefs,

            // --- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ v1.8.4: Новая, надежная логика createdRow ---
            createdRow: function(row, data, dataIndex) {
                const tableApi = this.api();
                // Добавляем ID к строке TR
                jQuery(row).attr('data-id', data.id);

                // Перебираем ТОЛЬКО ВИДИМЫЕ ячейки
                jQuery(row).children('td').each(function(visibleColIndex) {
                    const cell = jQuery(this);
                    
                    // Получаем ИСТИННЫЙ индекс колонки (с учетом скрытых)
                    const originalColIndex = tableApi.column.index('fromVisible', visibleColIndex);
                    
                    // Получаем ключ колонки из нашего ПОЛНОГО массива dtColumns
                    const columnKey = dtColumns[originalColIndex].name;
                    
                    // Добавляем имя колонки к ячейке TD
                    cell.attr('data-column-key', columnKey);
                    
                    if (config.columns[columnKey] && config.columns[columnKey].editable) {
                        const type = config.columns[columnKey].type;
                        if (['text', 'int', 'decimal'].includes(type)) {
                            cell.attr('contenteditable', 'true');
                        }
                    }
                });
            }
        };
        
        try {
            const dataTable = $table.DataTable(dtConfig);
            window.DynamicTables[tableId] = dataTable;
            
            const tableBody = jQuery(dataTable.table().body());
            tableBody.on('mousedown', 'tr', function(e) { wasSimpleClick = !e.ctrlKey && !e.shiftKey; });
            dataTable.on('select.dt', function(e, dt, type, indexes) { if (type === 'row') { if (wasSimpleClick && dt.rows({ selected: true }).count() === 1) { dt.rows(indexes).deselect(); } else { dt.rows(indexes).nodes().to$().find('td').css('background-color', selectedColor); } } });
            dataTable.on('deselect.dt', function(e, dt, type, indexes) { if (type === 'row') { dataTable.rows(indexes).nodes().to$().find('td').css('background-color', ''); } });
            tableBody.on('mouseover', 'tr', function() { if (jQuery(this).hasClass('selected')) { jQuery(this).find('td').css('background-color', hoverSelectedColor); } });
            tableBody.on('mouseout', 'tr', function() { if (jQuery(this).hasClass('selected')) { jQuery(this).find('td').css('background-color', selectedColor); } });
            
            initContextMenuWithRetry(tableId, tableName, 0);
            initVisibilityControlsWithRetry(tableId, tableName, 0);
            initCellEditingWithRetry(tableId, tableName, config, 0);

        } catch (error) { console.error(`[FATAL] Error initializing DataTable for ${tableId}:`, error); }
    }).catch(error => { console.error(`[FATAL] Could not get config for table ${tableName}. Initialization failed.`, error); });
}

// ... (остальные функции без изменений) ...
function initCellEditingWithRetry(tableId, tableName, config, attempt) { if (typeof initCellEditing === 'function') { initCellEditing(tableId, tableName, config); } else if (attempt < 10) { setTimeout(function() { initCellEditingWithRetry(tableId, tableName, config, attempt + 1); }, 100 * (attempt + 1)); } else { console.warn('initCellEditing function not available after 10 attempts for table:', tableId); } }
function initVisibilityControlsWithRetry(tableId, tableName, attempt) { if (typeof initVisibilityControls === 'function') { initVisibilityControls(tableId, tableName); } else if (attempt < 10) { setTimeout(function() { initVisibilityControlsWithRetry(tableId, tableName, attempt + 1); }, 100 * (attempt + 1)); } else { console.warn('initVisibilityControls function not available after 10 attempts for table:', tableId); } }
function initContextMenuWithRetry(tableId, tableName, attempt) { if (typeof initContextMenu === 'function') { initContextMenu(tableId, tableName); } else if (attempt < 10) { setTimeout(() => initContextMenuWithRetry(tableId, tableName, attempt + 1), 100 * (attempt + 1)); } else { console.warn('initContextMenu function not available after 10 attempts for table:', tableId); } }
function getDynamicTable(tableId) { return window.DynamicTables[tableId] || null; }
async function getTableConfig(tableName) { return new Promise((resolve, reject) => { jQuery.ajax({ url: window.AgroGlobals.ajaxurl, type: 'POST', data: { action: 'dyn_table_get_config', table: tableName, nonce: window.AgroGlobals.nonce || '' }, success: (response) => { if (response.success) { for (const key in response.data.columns) { response.data.columns[key].data = key; } resolve(response.data); } else { reject(new Error(response.data || 'Failed to get table config')); } }, error: (xhr, status, error) => reject(new Error('Ajax error: ' + error)) }); }); }