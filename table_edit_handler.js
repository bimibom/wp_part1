/* ===============================
   File: table_edit_handler.js
   Version: v2.0.0
   =============================== */

function initCellEditing(tableId, tableName, config) {
    const table = getDynamicTable(tableId);
    if (!table) return;

    const tableBody = jQuery(table.table().body());

    // 1. При фокусе
    tableBody.on('focusin', 'td[contenteditable="true"]', function() {
        // ... (без изменений)
        const cellElement = jQuery(this);
        if (typeof cellElement.data('original-value') === 'undefined') {
            cellElement.data('original-value', cellElement.text());
        }
    });

    // 2. Логика сохранения при потере фокуса
    tableBody.on('focusout', 'td[contenteditable="true"]', function() {
        const cellElement = jQuery(this);
        const originalValue = cellElement.data('original-value');
        let newValue = cellElement.text();
        cellElement.removeData('original-value');

        if (newValue === originalValue || newValue === '-') {
            if (newValue === '-') { cellElement.text(originalValue); }
            return;
        }

        const rowId = cellElement.closest('tr').data('id');
        const columnKey = cellElement.data('column-key');
        const cell = table.cell(this);

        if (!rowId || !columnKey || !cell.any()) {
            cellElement.text(originalValue);
            return;
        }

        const columnConfig = config.columns[columnKey];
        
        // === НОВЫЙ БЛОК ВАЛИДАЦИИ ===
        if (columnConfig.type === 'decimal' || columnConfig.type === 'int') {
            let tempValue = String(newValue).replace(/\s/g, '').replace(',', '.');
            let number = parseFloat(tempValue);

            if (isNaN(number)) {
                alert('Ошибка: Введено нечисловое значение.');
                cellElement.text(originalValue);
                return;
            }

            // Проверка 1: Диапазон (min/max)
            if (columnConfig.validation) {
                const min = columnConfig.validation.min;
                const max = columnConfig.validation.max;
                if ((typeof min !== 'undefined' && number < min) || (typeof max !== 'undefined' && number > max)) {
                    alert(`Ошибка: Значение должно быть в диапазоне от ${min} до ${max}.`);
                    cellElement.text(originalValue);
                    return;
                }
            }

            // Проверка 2: Разрядность (precision/scale)
            if (typeof columnConfig.precision !== 'undefined') {
                const parts = String(Math.abs(number)).split('.');
                const integerPartLength = parts[0].length;
                const maxIntegerLength = columnConfig.precision - (columnConfig.scale || 0);
                
                if (integerPartLength > maxIntegerLength) {
                    alert(`Ошибка: Слишком большое число. Максимум целых цифр: ${maxIntegerLength}.`);
                    cellElement.text(originalValue);
                    return;
                }
            }
            
            // Если все проверки пройдены, форматируем значение
            if (columnConfig.type === 'int') {
                number = Math.round(number);
                newValue = number.toLocaleString('ru-RU');
            } else {
                newValue = number.toLocaleString('ru-RU', {
                    minimumFractionDigits: columnConfig.scale || 0,
                    maximumFractionDigits: columnConfig.scale || 0
                });
            }
        }
        
        cell.data(newValue).invalidate();
        cellElement.text(newValue);

        jQuery.ajax({ /* ... (AJAX-запрос без изменений) ... */ 
            url: window.AgroGlobals.ajaxurl, type: 'POST', data: { action: 'dyn_table_update_cell', nonce: window.AgroGlobals.nonce, table: tableName, row_id: rowId, column: columnKey, value: newValue },
            success: function(response) { if (!response.success) { alert('Ошибка сохранения на сервере: ' + response.data); cell.data(originalValue).invalidate(); cellElement.text(originalValue); } },
            error: function(xhr, status, error) { alert('AJAX Ошибка: ' + error); cell.data(originalValue).invalidate(); cellElement.text(originalValue); }
        });
    });

    // 3. Обработка нажатий клавиш
    tableBody.on('keydown', 'td[contenteditable="true"]', function(e) {
        const cellElement = jQuery(this);
        // === ИСПРАВЛЕНИЕ: Получаем ключ колонки из data-атрибута ===
        const columnKey = cellElement.data('column-key');
        
        const columnConfig = config.columns[columnKey];
        const isNumeric = columnConfig.type === 'int' || columnConfig.type === 'decimal';
        const isInt = columnConfig.type === 'int';

        // ... (остальной код keydown без изменений) ...
        const key = e.key;
        const currentText = this.innerText;
        const selection = window.getSelection();
        const cursorPos = selection.anchorOffset;
        const hasSelection = selection.type === 'Range';
        if (key === 'Enter') { e.preventDefault(); this.blur(); return; }
        if (key === 'Escape') { e.preventDefault(); const val = cellElement.data('original-value'); if (typeof val !== 'undefined') { this.innerText = val; } this.blur(); return; }
        if (!isNumeric) return;
        const controlKeys = ['Backspace','Delete','Tab','Home','End','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
        if (controlKeys.includes(key)) return;
        if (e.ctrlKey || e.metaKey) { if (['a','c','v','x','A','C','V','X'].includes(key)) return; }
        if (key >= '0' && key <= '9') {
            if (!isInt) {
                const sepIndex = Math.max(currentText.indexOf(','), currentText.indexOf('.'));
                if (sepIndex >= 0 && cursorPos > sepIndex && !hasSelection) {
                    const decimalPart = currentText.substring(sepIndex + 1);
                    if (decimalPart.length >= 2) { e.preventDefault(); return; }
                }
            }
            return;
        }
        if (key === '-') { if (cursorPos === 0 && !currentText.includes('-')) return; e.preventDefault(); return; }
        if ((key === ',' || key === '.') && !isInt && !currentText.includes(',') && !currentText.includes('.')) { return; }
        e.preventDefault();
    });
    
    // 4. Обработка вставки
    tableBody.on('paste', 'td[contenteditable="true"]', function(e) {
        const cellElement = jQuery(this);
        // === ИСПРАВЛЕНИЕ: Получаем ключ колонки из data-атрибута ===
        const columnKey = cellElement.data('column-key');

        const columnConfig = config.columns[columnKey];
        const isNumeric = columnConfig.type === 'int' || columnConfig.type === 'decimal';
        if (!isNumeric) return;

        // ... (остальной код paste без изменений) ...
        e.preventDefault();
        const clipboardData = (e.originalEvent || e).clipboardData;
        let raw = clipboardData.getData('text/plain');
        if (!raw) {
            let html = clipboardData.getData('text/html');
            if (html) { let tmp = document.createElement("div"); tmp.innerHTML = html; let td = tmp.querySelector("td"); if (td) { raw = td.textContent; } else { raw = tmp.textContent; } }
        }
        if (!raw) { raw = clipboardData.getData('text/csv') || ''; }
        raw = raw.trim();
        let cleaned = raw.replace(/[^\d,.\-]/g, '');
        cleaned = cleaned.replace(/(?!^)-/g, '');
        let firstSepIndex = cleaned.search(/[,.]/);
        if (firstSepIndex !== -1) { cleaned = cleaned.substring(0, firstSepIndex + 1) + cleaned.substring(firstSepIndex + 1).replace(/[,.]/g, ''); }
        cleaned = cleaned.replace('.', ',');
        if (!cleaned) return;
        let number = parseFloat(cleaned.replace(',', '.'));
        if (isNaN(number)) return;
        if (columnConfig.type === 'int') { number = Math.round(number); cleaned = number.toString(); } else { number = parseFloat(number.toFixed(2)); cleaned = number.toString().replace('.', ','); }
        document.execCommand('insertText', false, cleaned);
    });
}