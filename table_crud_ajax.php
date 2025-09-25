<?php
/* ===============================
   File: table_crud_ajax.php
   Version: v1.7.1
   =============================== */

function _prepare_row_for_db($row_data, $table_config) {
    // ... (код функции без изменений)
    $insert_data = [];
    $format = [];
    foreach ($table_config['columns'] as $column_key => $column_config) {
        if ($column_key === 'id' || $column_key === 'sort_order') continue;
        $value_provided = isset($row_data[$column_key]);
        $value = $value_provided ? $row_data[$column_key] : $column_config['default'];
        switch ($column_config['type']) {
            case 'decimal':
                if ($value_provided) $value = str_replace([' ', ','], ['', '.'], $value);
                $insert_data[$column_key] = floatval($value); $format[] = '%f'; break;
            case 'int':
                if ($value_provided) $value = str_replace(' ', '', $value);
                $insert_data[$column_key] = intval($value); $format[] = '%d'; break;
            case 'date':
                if ($value && preg_match('/^(\d{2})\.(\d{2})\.(\d{4})$/', $value, $matches)) {
                    $value = $matches[3] . '-' . $matches[2] . '-' . $matches[1];
                }
                $insert_data[$column_key] = $value; $format[] = '%s'; break;
            default:
                $insert_data[$column_key] = $value; $format[] = '%s';
        }
    }
    return ['insert_data' => $insert_data, 'format' => $format];
}

add_action('wp_ajax_dyn_table_insert_row', 'handle_dyn_table_insert_row');
function handle_dyn_table_insert_row() { /* ... код без изменений ... */ global $wpdb; if (!wp_verify_nonce($_POST['nonce'], 'dyn_table_nonce')) { wp_send_json_error('Security check failed'); return; } $table_name = sanitize_text_field($_POST['table']); $row_data = $_POST['row_data'] ?? []; $target_sort_order = isset($_POST['target_sort_order']) ? intval($_POST['target_sort_order']) : 0; $position = isset($_POST['position']) ? sanitize_text_field($_POST['position']) : 'below'; $config = get_dynamic_tables_config(); if (!isset($config[$table_name])) { wp_send_json_error('Table configuration not found'); return; } $prepared_data = _prepare_row_for_db($row_data, $config[$table_name]); $insert_data = $prepared_data['insert_data']; $format = $prepared_data['format']; if ($position === 'above') { $new_sort_order = $target_sort_order; $wpdb->query($wpdb->prepare("UPDATE " . esc_sql($table_name) . " SET sort_order = sort_order + 1 WHERE sort_order >= %d", $target_sort_order)); } else { $new_sort_order = $target_sort_order + 1; $wpdb->query($wpdb->prepare("UPDATE " . esc_sql($table_name) . " SET sort_order = sort_order + 1 WHERE sort_order > %d", $target_sort_order)); } $insert_data['sort_order'] = $new_sort_order; if ($wpdb->insert($table_name, $insert_data, $format) === false) { wp_send_json_error('Database error: ' . $wpdb->last_error); return; } wp_send_json_success(['message' => 'Row inserted successfully', 'new_id' => $wpdb->insert_id, 'sort_order' => $new_sort_order]); }
add_action('wp_ajax_dyn_table_delete_row', 'handle_dyn_table_delete_row');
function handle_dyn_table_delete_row() { /* ... код без изменений ... */ global $wpdb; if (!wp_verify_nonce($_POST['nonce'], 'dyn_table_nonce')) { wp_send_json_error('Security check failed'); return; } $table_name = sanitize_text_field($_POST['table']); $row_id = intval($_POST['row_id']); if (!$row_id) { wp_send_json_error('Invalid row ID'); return; } $current_sort_order = $wpdb->get_var($wpdb->prepare("SELECT sort_order FROM " . esc_sql($table_name) . " WHERE id = %d", $row_id)); if ($wpdb->delete($table_name, ['id' => $row_id], ['%d']) === false) { wp_send_json_error('Database error: ' . $wpdb->last_error); return; } if ($current_sort_order !== null) { $wpdb->query($wpdb->prepare("UPDATE " . esc_sql($table_name) . " SET sort_order = sort_order - 1 WHERE sort_order > %d", $current_sort_order)); } wp_send_json_success(['message' => 'Row deleted successfully', 'deleted_id' => $row_id]); }
add_action('wp_ajax_dyn_table_move_row', 'handle_dyn_table_move_row');
function handle_dyn_table_move_row() { /* ... код без изменений ... */ global $wpdb; if (!wp_verify_nonce($_POST['nonce'], 'dyn_table_nonce')) { wp_send_json_error('Security check failed'); return; } $table_name = sanitize_text_field($_POST['table']); $row_id = intval($_POST['row_id']); $direction = sanitize_text_field($_POST['direction']); if (!$row_id) { wp_send_json_error('Invalid row ID'); return; } $current_row = $wpdb->get_row($wpdb->prepare("SELECT id, sort_order FROM " . esc_sql($table_name) . " WHERE id = %d", $row_id)); if (!$current_row) { wp_send_json_error('Row not found'); return; } $current_sort_order = (int)$current_row->sort_order; $target_sort_order = $direction === 'up' ? $current_sort_order - 1 : $current_sort_order + 1; if ($target_sort_order <= 0) { wp_send_json_error('Cannot move up further.'); return; } $target_row = $wpdb->get_row($wpdb->prepare("SELECT id, sort_order FROM " . esc_sql($table_name) . " WHERE sort_order = %d", $target_sort_order)); if (!$target_row) { wp_send_json_error('Target row for swap not found.'); return; } $wpdb->update($table_name, ['sort_order' => $target_sort_order], ['id' => $current_row->id]); $wpdb->update($table_name, ['sort_order' => $current_sort_order], ['id' => $target_row->id]); wp_send_json_success(['message' => 'Row moved successfully']); }
add_action('wp_ajax_dyn_table_bulk_delete_rows', 'handle_dyn_table_bulk_delete_rows');
function handle_dyn_table_bulk_delete_rows() { /* ... код без изменений ... */ global $wpdb; if (!wp_verify_nonce($_POST['nonce'], 'dyn_table_nonce')) { wp_send_json_error('Security check failed'); return; } $table_name = sanitize_text_field($_POST['table']); $row_ids = isset($_POST['row_ids']) && is_array($_POST['row_ids']) ? $_POST['row_ids'] : []; $sanitized_row_ids = array_map('intval', $row_ids); $sanitized_row_ids = array_filter($sanitized_row_ids, function($id) { return $id > 0; }); if (empty($sanitized_row_ids)) { wp_send_json_error('No valid row IDs provided.'); return; } $placeholders = implode(', ', array_fill(0, count($sanitized_row_ids), '%d')); $sql = $wpdb->prepare("DELETE FROM " . esc_sql($table_name) . " WHERE id IN ($placeholders)", $sanitized_row_ids); if ($wpdb->query($sql) === false) { wp_send_json_error('Database error during bulk deletion: ' . $wpdb->last_error); return; } $wpdb->query("SET @row_number = 0;"); if ($wpdb->query("UPDATE " . esc_sql($table_name) . " SET sort_order = (@row_number:=@row_number + 1) ORDER BY sort_order ASC") === false) { wp_send_json_error('Database error during sort_order re-indexing: ' . $wpdb->last_error); return; } wp_send_json_success(['message' => count($sanitized_row_ids) . ' rows deleted successfully.']); }
add_action('wp_ajax_dyn_table_bulk_insert_rows', 'handle_dyn_table_bulk_insert_rows');
function handle_dyn_table_bulk_insert_rows() { /* ... код без изменений ... */ global $wpdb; if (!wp_verify_nonce($_POST['nonce'], 'dyn_table_nonce')) { wp_send_json_error('Security check failed'); return; } $table_name = sanitize_text_field($_POST['table']); $rows_data = isset($_POST['rows_data']) && is_array($_POST['rows_data']) ? $_POST['rows_data'] : []; $target_sort_order = isset($_POST['target_sort_order']) ? intval($_POST['target_sort_order']) : 0; $position = isset($_POST['position']) ? sanitize_text_field($_POST['position']) : 'below'; $config = get_dynamic_tables_config(); if (!isset($config[$table_name])) { wp_send_json_error('Table configuration not found'); return; } if (empty($rows_data)) { wp_send_json_error('No data provided for insertion.'); return; } $table_config = $config[$table_name]; $insert_count = count($rows_data); if ($position === 'above') { $start_sort_order = $target_sort_order; $wpdb->query($wpdb->prepare("UPDATE " . esc_sql($table_name) . " SET sort_order = sort_order + %d WHERE sort_order >= %d", $insert_count, $start_sort_order)); } else { $start_sort_order = $target_sort_order + 1; $wpdb->query($wpdb->prepare("UPDATE " . esc_sql($table_name) . " SET sort_order = sort_order + %d WHERE sort_order > %d", $insert_count, $target_sort_order)); } $current_sort_order = $start_sort_order; foreach ($rows_data as $row_data) { $prepared_data = _prepare_row_for_db($row_data, $table_config); $insert_data = $prepared_data['insert_data']; $format = $prepared_data['format']; $insert_data['sort_order'] = $current_sort_order; if ($wpdb->insert($table_name, $insert_data, $format) === false) { wp_send_json_error('Database error during bulk insert at sort_order ' . $current_sort_order . ': ' . $wpdb->last_error); return; } $current_sort_order++; } wp_send_json_success(['message' => $insert_count . ' rows inserted successfully.']); }

add_action('wp_ajax_dyn_table_update_cell', 'handle_dyn_table_update_cell');
function handle_dyn_table_update_cell() {
    global $wpdb;
    if (!wp_verify_nonce($_POST['nonce'], 'dyn_table_nonce')) { wp_send_json_error('Security check failed'); return; }
    
    $table_name = sanitize_text_field($_POST['table']);
    $row_id = intval($_POST['row_id']); // intval() здесь правильно обработает чистый ID
    $column_key = sanitize_text_field($_POST['column']);
    $raw_value = wp_unslash($_POST['value']);

    if (empty($row_id) || empty($column_key)) { wp_send_json_error('Missing required parameters (row_id or column).'); return; }
    
    $config = get_dynamic_tables_config();
    if (!isset($config[$table_name]['columns'][$column_key])) { wp_send_json_error('Column configuration not found.'); return; }
    
    $column_config = $config[$table_name]['columns'][$column_key];
    $db_value = null; $format = null; $display_value = '';

    switch ($column_config['type']) {
        case 'decimal':
            $db_value = str_replace([' ', ','], ['', '.'], $raw_value); $db_value = floatval($db_value); $format = '%f'; $display_value = number_format($db_value, 2, ',', ' '); break;
        case 'int':
            $db_value = str_replace(' ', '', $raw_value); $db_value = intval($db_value); $format = '%d'; $display_value = number_format($db_value, 0, '', ' '); break;
        case 'date':
            if ($raw_value && preg_match('/^(\d{2})\.(\d{2})\.(\d{4})$/', $raw_value, $matches)) {
                $db_value = $matches[3] . '-' . $matches[2] . '-' . $matches[1];
            } else { $db_value = null; }
            $format = '%s'; $display_value = $raw_value; break;
        default:
            $db_value = sanitize_text_field($raw_value); $format = '%s'; $display_value = esc_html($db_value);
    }
    
    $result = $wpdb->update(esc_sql($table_name), [$column_key => $db_value], ['id' => $row_id], [$format], ['%d']);

    if ($result === false) {
        wp_send_json_error('Database error on update: ' . $wpdb->last_error);
        return;
    }
    
    wp_send_json_success(['message' => 'Cell updated successfully.', 'formattedValue' => $display_value]);
}
