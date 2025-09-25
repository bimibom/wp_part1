<?php
/* ===============================
   File: tables_config.php
   Version: v1.7.0 
   =============================== */
function get_dynamic_tables_config() {
    return [
        'wpagro_fields' => [
            'title' => 'Агро поля',
            'columns' => [
                'id'         => ['label' => 'ID', 'editable' => false, 'type' => 'int', 'default' => null, 'visible' => true],
                'sort_order' => ['label' => '№', 'editable' => false, 'type' => 'int', 'default' => 0, 'visible' => true], // Usually not editable by user directly
                'field_name' => ['label' => 'Поле №', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => true, 'maxLength' => 12],
                
				 'area_ha'    => ['label' => 'S, га', 'editable' => true, 'type' => 'decimal', 'precision' => 6, 'scale' => 2, // decimal(6,2) -> 4 цифры до запятой, 2 после
                               'validation' => ['min' => 0]],
               'bonitet'    => ['label' => 'Бонитет', 'editable' => true, 'type' => 'int', 'precision' => 3, 'scale' => 0, // decimal(3,0) -> 3 цифры до запятой, 0 после
                               'validation' => ['min' => 0, 'max' => 100]],
				
                'gumus'      => ['label' => 'Гумус (%)', 'editable' => true, 'type' => 'decimal', 'precision' => 5, 'scale' => 2, // decimal(5,2) -> 3 цифры до запятой, 2 после
                               'validation' => ['min' => 0, 'max' => 100]],
               
				'soil_type'  => [
                    'label' => 'Тип почвы', 'editable' => true, 'type' => 'select',
                    'options' => ['Бурая','Глинистая','Каштановая','Серая лесная','Суглинистая','Чернозём','Другое'],
                    'default' => 'Другое', 'visible' => true
                ],
              
				'n'          => ['label' => 'N', 'editable' => true, 'type' => 'int', 'default' => 0, 'visible' => false, 'validation' => ['min' => 0]],
      			'p'          => ['label' => 'P', 'editable' => true, 'type' => 'int', 'default' => 0, 'visible' => false, 'validation' => ['min' => 0]],
				'k'          => ['label' => 'K', 'editable' => true, 'type' => 'int', 'default' => 0, 'visible' => false, 'validation' => ['min' => 0]],
            
                'ph'         => ['label' => 'pH', 'editable' => true, 'type' => 'decimal', 'precision' => 3, 'scale' => 1, // decimal(3,1) -> 2 цифры до запятой, 1 после
                               'validation' => ['min' => 0, 'max' => 14]],
            
				'department' => ['label' => 'Отделение', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => true, 'maxLength' => 20],
                'region'     => ['label' => 'Область', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => true, 'maxLength' => 20],
                'district'   => ['label' => 'Район', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => true, 'maxLength' => 20],
                'sector'     => ['label' => 'Участок', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => false, 'maxLength' => 20],
                'ownership'  => [
                    'label' => 'Форма собственности', 'editable' => true, 'type' => 'select',
                    'options' => ['Государство','Фермер','Холдинг','Другое'],
                    'default' => 'Другое', 'visible' => true
                ],
                'sowing_date'=> ['label' => 'Дата посева', 'editable' => true, 'type' => 'date', 'default' => null, 'visible' => true],
            ]
        ],

        // --- ДОБАВЛЕННЫЙ БЛОК 1 ---
    'wpagro_fields2' => [
            'title' => 'Агро поля',
            'columns' => [
                'id'         => ['label' => 'ID', 'editable' => false, 'type' => 'int', 'default' => null, 'visible' => true],
                'sort_order' => ['label' => '№', 'editable' => false, 'type' => 'int', 'default' => 0, 'visible' => true], // Usually not editable by user directly
                'field_name' => ['label' => 'Поле №', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => true, 'maxLength' => 12],
                
				 'area_ha'    => ['label' => 'S, га', 'editable' => true, 'type' => 'decimal', 'precision' => 6, 'scale' => 2, // decimal(6,2) -> 4 цифры до запятой, 2 после
                               'validation' => ['min' => 0]],
               'bonitet'    => ['label' => 'Бонитет', 'editable' => true, 'type' => 'int', 'precision' => 3, 'scale' => 0, // decimal(3,0) -> 3 цифры до запятой, 0 после
                               'validation' => ['min' => 0, 'max' => 100]],
				
                'gumus'      => ['label' => 'Гумус (%)', 'editable' => true, 'type' => 'decimal', 'precision' => 5, 'scale' => 2, // decimal(5,2) -> 3 цифры до запятой, 2 после
                               'validation' => ['min' => 0, 'max' => 100]],
               
				'soil_type'  => [
                    'label' => 'Тип почвы', 'editable' => true, 'type' => 'select',
                    'options' => ['Бурая','Глинистая','Каштановая','Серая лесная','Суглинистая','Чернозём','Другое'],
                    'default' => 'Другое', 'visible' => true
                ],
              
				'n'          => ['label' => 'N', 'editable' => true, 'type' => 'int', 'default' => 0, 'visible' => false, 'validation' => ['min' => 0]],
      			'p'          => ['label' => 'P', 'editable' => true, 'type' => 'int', 'default' => 0, 'visible' => false, 'validation' => ['min' => 0]],
				'k'          => ['label' => 'K', 'editable' => true, 'type' => 'int', 'default' => 0, 'visible' => false, 'validation' => ['min' => 0]],
            
                'ph'         => ['label' => 'pH', 'editable' => true, 'type' => 'decimal', 'precision' => 3, 'scale' => 1, // decimal(3,1) -> 2 цифры до запятой, 1 после
                               'validation' => ['min' => 0, 'max' => 14]],
            
				'department' => ['label' => 'Отделение', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => true, 'maxLength' => 20],
                'region'     => ['label' => 'Область', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => true, 'maxLength' => 20],
                'district'   => ['label' => 'Район', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => true, 'maxLength' => 20],
                'sector'     => ['label' => 'Участок', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => false, 'maxLength' => 20],
                'ownership'  => [
                    'label' => 'Форма собственности', 'editable' => true, 'type' => 'select',
                    'options' => ['Государство','Фермер','Холдинг','Другое'],
                    'default' => 'Другое', 'visible' => true
                ],
                'sowing_date'=> ['label' => 'Дата посева', 'editable' => true, 'type' => 'date', 'default' => null, 'visible' => true],
            ]
        ],

        
        // --- ДОБАВЛЕННЫЙ БЛОК 2 ---
         'wpagro_fields3' => [
            'title' => 'Агро поля',
            'columns' => [
                'id'         => ['label' => 'ID', 'editable' => false, 'type' => 'int', 'default' => null, 'visible' => true],
                'sort_order' => ['label' => '№', 'editable' => false, 'type' => 'int', 'default' => 0, 'visible' => true], // Usually not editable by user directly
                'field_name' => ['label' => 'Поле №', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => true, 'maxLength' => 12],
                
				 'area_ha'    => ['label' => 'S, га', 'editable' => true, 'type' => 'decimal', 'precision' => 6, 'scale' => 2, // decimal(6,2) -> 4 цифры до запятой, 2 после
                               'validation' => ['min' => 0]],
               'bonitet'    => ['label' => 'Бонитет', 'editable' => true, 'type' => 'int', 'precision' => 3, 'scale' => 0, // decimal(3,0) -> 3 цифры до запятой, 0 после
                               'validation' => ['min' => 0, 'max' => 100]],
				
                'gumus'      => ['label' => 'Гумус (%)', 'editable' => true, 'type' => 'decimal', 'precision' => 5, 'scale' => 2, // decimal(5,2) -> 3 цифры до запятой, 2 после
                               'validation' => ['min' => 0, 'max' => 100]],
               
				'soil_type'  => [
                    'label' => 'Тип почвы', 'editable' => true, 'type' => 'select',
                    'options' => ['Бурая','Глинистая','Каштановая','Серая лесная','Суглинистая','Чернозём','Другое'],
                    'default' => 'Другое', 'visible' => true
                ],
              
				'n'          => ['label' => 'N', 'editable' => true, 'type' => 'int', 'default' => 0, 'visible' => false, 'validation' => ['min' => 0]],
      			'p'          => ['label' => 'P', 'editable' => true, 'type' => 'int', 'default' => 0, 'visible' => false, 'validation' => ['min' => 0]],
				'k'          => ['label' => 'K', 'editable' => true, 'type' => 'int', 'default' => 0, 'visible' => false, 'validation' => ['min' => 0]],
            
                'ph'         => ['label' => 'pH', 'editable' => true, 'type' => 'decimal', 'precision' => 3, 'scale' => 1, // decimal(3,1) -> 2 цифры до запятой, 1 после
                               'validation' => ['min' => 0, 'max' => 14]],
            
				'department' => ['label' => 'Отделение', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => true, 'maxLength' => 20],
                'region'     => ['label' => 'Область', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => true, 'maxLength' => 20],
                'district'   => ['label' => 'Район', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => true, 'maxLength' => 20],
                'sector'     => ['label' => 'Участок', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => false, 'maxLength' => 20],
                'ownership'  => [
                    'label' => 'Форма собственности', 'editable' => true, 'type' => 'select',
                    'options' => ['Государство','Фермер','Холдинг','Другое'],
                    'default' => 'Другое', 'visible' => true
                ],
                'sowing_date'=> ['label' => 'Дата посева', 'editable' => true, 'type' => 'date', 'default' => null, 'visible' => true],
            ]
        ],


        'wp_clients' => [
            'title' => 'Клиенты',
            'columns' => [
                'id'         => ['label' => 'ID', 'editable' => false, 'type' => 'int', 'default' => null, 'visible' => true],
                'sort_order' => ['label' => '№', 'editable' => false, 'type' => 'int', 'default' => 0, 'visible' => true],
                'name'       => ['label' => 'Имя', 'editable' => true, 'type' => 'text', 'default' => 'Баран Баранович', 'visible' => true],
                'email'      => ['label' => 'Email', 'editable' => true, 'type' => 'text', 'default' => '', 'visible' => true],
                'status'     => [
                    'label' => 'Статус','editable' => true,'type' => 'select',
                    'options' => ['active','inactive'],
                    'default' => 'active', 'visible' => true
                ],
                'city'       => [
                    'label' => 'Город','editable' => true,'type' => 'select',
                    'options' => ['Днепр','Киев','Лондон','Простоквашино','Херсон'],
                    'default' => '', 'visible' => true
                ],
                'created_at' => ['label' => 'Дата регистрации', 'editable' => true, 'type' => 'date', 'default' => null, 'visible' => true],
            ]

        ],
    ];
}