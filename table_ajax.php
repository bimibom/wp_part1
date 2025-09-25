<?php
/* ===============================
   File: table_ajax.php
   Version: v1.5.1
   =============================== */

// Ajax handler for fetching table data
add_action('wp_ajax_dyn_table_fetch', 'handle_dyn_table_fetch');
add_action('wp_ajax_nopriv_dyn_table_fetch', 'handle_dyn_table_fetch');

function handle_dyn_table_fetch() {
    global $wpdb;
    
    if (!wp_verify_nonce($_POST['nonce'], 'dyn_table_nonce')) {
        wp_die('Security check failed');
    }
    
    $table_name = sanitize_text_field($_POST['table']);
    $config = get_dynamic_tables_config();
    
    if (!isset($config[$table_name])) {
        wp_send_json_error('Table configuration not found');
        return;
    }
    
    $table_config = $config[$table_name];
    
    $all_columns = array_keys($table_config['columns']);
    $columns_sql = implode(', ', array_map('esc_sql', $all_columns));
    $sql = "SELECT {$columns_sql} FROM " . esc_sql($table_name) . " ORDER BY sort_order ASC, id ASC";
    
    $results = $wpdb->get_results($sql, ARRAY_A);
    
    if ($wpdb->last_error) {
        wp_send_json_error('Database error: ' . $wpdb->last_error);
        return;
    }
    
    $formatted_data = [];
    foreach ($results as $row) {
        $formatted_row = $row; 
        foreach ($formatted_row as $column_key => &$value) { 

            // === КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Пропускаем форматирование для ID ===
            if ($column_key === 'id') {
                continue; // ID остается чистым числом (или строкой без пробелов)
            }

            if (isset($table_config['columns'][$column_key])) {
                $column_config = $table_config['columns'][$column_key];
                
                switch ($column_config['type']) {
                    case 'decimal':
                        $value = $value ? number_format((float)$value, 2, ',', ' ') : '0,00';
                        break;
                    case 'int':
                        // Убедимся, что sort_order тоже не форматируется, если он int
                        if ($column_key !== 'sort_order') {
                           $value = $value ? number_format((int)$value, 0, '', ' ') : '0';
                        }
                        break;
                    case 'date':
                        if ($value && $value !== '0000-00-00') {
                            $value = date('d.m.Y', strtotime($value));
                        } else {
                            $value = '';
                        }
                        break;
                    default:
                        $value = esc_html($value);
                }
            }
        }
        unset($value); 
        $formatted_data[] = $formatted_row;
    }
    
    $response = [
        'data' => $formatted_data,
        'recordsTotal' => count($formatted_data),
        'recordsFiltered' => count($formatted_data)
    ];
    
    header('Content-Type: application/json');
    echo json_encode($response);
    wp_die();
}

// Generate nonce for Ajax security
function get_dyn_table_nonce() {
    return wp_create_nonce('dyn_table_nonce');
}