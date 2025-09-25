<?php
/* ===============================
   File: table_config_ajax.php
   Version: v1.5.0
   =============================== */
// Ajax handler for getting table configuration
add_action('wp_ajax_dyn_table_get_config', 'handle_dyn_table_get_config');
add_action('wp_ajax_nopriv_dyn_table_get_config', 'handle_dyn_table_get_config');

function handle_dyn_table_get_config() {
    // Verify nonce for security
    if (!wp_verify_nonce($_POST['nonce'], 'dyn_table_nonce')) {
        wp_die('Security check failed');
    }
    
    $table_name = sanitize_text_field($_POST['table']);
    $config = get_dynamic_tables_config();
    
    if (!isset($config[$table_name])) {
        wp_send_json_error('Table configuration not found');
        return;
    }
    
    wp_send_json_success($config[$table_name]);
}