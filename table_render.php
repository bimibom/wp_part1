<?php
/* ===============================
   File: table_render.php
   Version: v1.6.1
   =============================== */

// Shortcode handler for dynamic tables
function dynamic_table_shortcode($atts) {
    $atts = shortcode_atts(['table' => ''], $atts, 'dynamic_table');
    
    $table_name = sanitize_text_field($atts['table']);
    
    if (empty($table_name)) {
        return '<p>Error: Table name is required for shortcode [dynamic_table].</p>';
    }
    
    $config = get_dynamic_tables_config();
    if (!isset($config[$table_name])) {
        return '<p>Error: Table configuration not found for: ' . esc_html($table_name) . '</p>';
    }
    
    $table_id = 'dt-' . $table_name . '-' . uniqid();
    
    // Build table HTML - NOW WITHOUT THEAD.
    // DataTables will generate the header from the 'columns' configuration in JavaScript.
    $html = '<div class="dynamic-table-wrapper" data-table-name="' . esc_attr($table_name) . '">';
    $html .= '<table id="' . esc_attr($table_id) . '" class="dynamic-table display responsive nowrap" style="width:100%">';
    $html .= '</table>';
    $html .= '</div>';
    
    // Add initialization script
    $html .= "<script type=\"text/javascript\">";
    $html .= "jQuery(document).ready(function($) {";
    $html .= "if (typeof initDynamicTable === 'function') {";
    $html .= "initDynamicTable('" . esc_js($table_id) . "', '" . esc_js($table_name) . "');";
    $html .= "}});";
    $html .= "</script>";
    
    return $html;
}

add_shortcode('dynamic_table', 'dynamic_table_shortcode');