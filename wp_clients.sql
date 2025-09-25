CREATE TABLE `wp_clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sort_order` int(10) unsigned NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `city` varchar(100) DEFAULT NULL,
  `created_at` date DEFAULT NULL COMMENT 'Дата регистрации',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci