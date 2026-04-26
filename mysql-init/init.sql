-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 26, 2026 at 09:58 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `my_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `Customer_ID` int(11) NOT NULL,
  `NAME` varchar(100) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Phone_No` varchar(20) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(200) NOT NULL,
  `suspended_status` tinyint(1) NOT NULL DEFAULT 0,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`Customer_ID`, `NAME`, `Email`, `Phone_No`, `username`, `password_hash`, `suspended_status`, `create_date`, `last_modified`) VALUES
(1, 'Bruno Mars', 'bruno789@gmail.com', '086756649', 'brunorose', 'ily123', 1, '2026-04-14 08:54:14', '2026-04-14 10:26:27'),
(2, 'John Snow', 'johnsnow987@gmail.com', '089543674', 'john444', '@12345', 0, '2026-04-16 20:18:55', '2026-04-16 20:19:29'),
(3, 'Harry Kane', 'ilovekane@hotspur.com', '0965478547', 'harrykane', 'kane123', 1, '2026-04-18 02:03:33', '2026-04-25 15:17:37'),
(4, 'Jason Wang', 'jasonoppa@northkorea.com', '0769754337', 'jasonwang', 'jason789', 1, '2026-04-18 02:04:52', '2026-04-18 02:05:24');

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `material_id` int(11) NOT NULL,
  `material_name` varchar(150) NOT NULL,
  `category` varchar(100) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `price_per_unit` decimal(10,2) DEFAULT 0.00,
  `quantity` int(11) DEFAULT 0,
  `threshold` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`material_id`, `material_name`, `category`, `unit`, `price_per_unit`, `quantity`, `threshold`, `created_at`, `updated_at`) VALUES
(1, 'Paper A4 Plain', 'Paper', 'Reem', 250.00, 20, 5, '2026-04-25 09:54:19', '2026-04-25 15:26:51'),
(3, 'A5 Glossy Paper', 'Paper', 'Reem', 250.00, 20, 5, '2026-04-25 10:01:34', '2026-04-25 10:01:34');

-- --------------------------------------------------------

--
-- Table structure for table `material_properties`
--

CREATE TABLE `material_properties` (
  `property_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `property_name` varchar(100) NOT NULL,
  `property_value` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `material_properties`
--

INSERT INTO `material_properties` (`property_id`, `material_id`, `property_name`, `property_value`) VALUES
(1, 3, 'Size', 'A5'),
(2, 3, 'Type', 'Glossy');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `sessions_id` varchar(500) DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `paper_size_id` int(11) NOT NULL,
  `paper_type_id` int(11) NOT NULL,
  `copy_amount` int(11) NOT NULL CHECK (`copy_amount` > 0),
  `price_per_unit` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `order_received_date` datetime NOT NULL,
  `pickup_date` datetime DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_date` datetime DEFAULT current_timestamp(),
  `last_modified_date` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `sessions_id`, `file_path`, `file_name`, `paper_size_id`, `paper_type_id`, `copy_amount`, `price_per_unit`, `total_price`, `status`, `order_received_date`, `pickup_date`, `note`, `created_date`, `last_modified_date`) VALUES
(1, 1, NULL, 'uploads\\f09ce897-14e1-4d49-bae6-b38766c3f2bf_CLO_1670706389_มหิศรา บุญมาแย้ม.JPG', 'CLO_1670706389_มหิศรา บุญมาแย้ม.JPG', 1, 2, 10, 10.00, 100.00, 'Cancelled', '2026-04-25 20:21:06', '2026-04-26 14:30:00', '2026-04-29T14:30:00', '2026-04-25 20:19:58', '2026-04-26 03:25:41'),
(2, 1, NULL, 'uploads\\58c6a3d4-e600-4edd-a8ad-b0b0937dd199_CLO_1670706389_มหิศรา บุญมาแย้ม.JPG', 'CLO_1670706389_มหิศรา บุญมาแย้ม.JPG', 1, 2, 10, 10.00, 100.00, 'Printing', '2026-04-25 20:22:36', '2026-04-26 14:30:00', '2026-04-29T14:30:00', '2026-04-25 20:19:58', '2026-04-26 03:26:45');

-- --------------------------------------------------------

--
-- Table structure for table `paper_sizes`
--

CREATE TABLE `paper_sizes` (
  `paper_size_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `paper_sizes`
--

INSERT INTO `paper_sizes` (`paper_size_id`, `name`, `description`, `created_date`) VALUES
(1, 'A3', NULL, '2026-04-25 14:27:06'),
(2, 'A4', NULL, '2026-04-25 14:27:06'),
(3, 'A5', NULL, '2026-04-25 14:27:06'),
(4, '4x6', NULL, '2026-04-25 14:27:06');

-- --------------------------------------------------------

--
-- Table structure for table `paper_types`
--

CREATE TABLE `paper_types` (
  `paper_type_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `paper_types`
--

INSERT INTO `paper_types` (`paper_type_id`, `name`, `description`, `created_date`) VALUES
(1, 'Plain', NULL, '2026-04-25 14:27:48'),
(2, 'Glossy', NULL, '2026-04-25 14:27:48'),
(3, 'Color', NULL, '2026-04-25 14:27:48'),
(4, '100lb', NULL, '2026-04-25 14:27:48');

-- --------------------------------------------------------

--
-- Table structure for table `pricing`
--

CREATE TABLE `pricing` (
  `pricing_id` int(11) NOT NULL,
  `paper_size_id` int(11) DEFAULT NULL,
  `paper_type_id` int(11) DEFAULT NULL,
  `price_per_unit` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_users`
--

CREATE TABLE `staff_users` (
  `USER_ID` int(11) NOT NULL,
  `NAME` varchar(100) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Phone_No` varchar(20) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(200) NOT NULL,
  `user_role` enum('Staff','Admin','Owner') NOT NULL DEFAULT 'Staff',
  `user_status` tinyint(1) NOT NULL DEFAULT 0,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff_users`
--

INSERT INTO `staff_users` (`USER_ID`, `NAME`, `Email`, `Phone_No`, `username`, `password_hash`, `user_role`, `user_status`, `create_date`, `last_modified`) VALUES
(1, 'Mahisara', 'netto@bu.ac.th', '0123456789', 'netto', '123456789', 'Admin', 1, '2026-03-25 03:11:54', '2026-04-13 23:24:35'),
(2, 'jame bond', 'jb007@example.com', '087456921368', 'jamebond007', 'mi666', 'Staff', 0, '2026-03-26 12:57:15', '2026-04-14 08:36:02'),
(3, 'Mahisara', 'mahinet666@example.com', '089654763', 'netto_2', '@123456', 'Staff', 1, '2026-03-30 13:37:26', '2026-04-25 06:23:31'),
(6, 'neymar', 'neymar123@hotmail.net', '099 - 999 - 9999', 'neymar123', 'ney12345', 'Owner', 1, '2026-04-13 15:20:46', '2026-04-13 15:20:46');

-- --------------------------------------------------------

--
-- Table structure for table `walkin_sessions`
--

CREATE TABLE `walkin_sessions` (
  `id` int(11) NOT NULL,
  `session_token` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`Customer_ID`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`material_id`);

--
-- Indexes for table `material_properties`
--
ALTER TABLE `material_properties`
  ADD PRIMARY KEY (`property_id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `fk_orders_user` (`user_id`),
  ADD KEY `fk_orders_paper_size` (`paper_size_id`),
  ADD KEY `fk_orders_paper_type` (`paper_type_id`);

--
-- Indexes for table `paper_sizes`
--
ALTER TABLE `paper_sizes`
  ADD PRIMARY KEY (`paper_size_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `paper_types`
--
ALTER TABLE `paper_types`
  ADD PRIMARY KEY (`paper_type_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `pricing`
--
ALTER TABLE `pricing`
  ADD PRIMARY KEY (`pricing_id`),
  ADD KEY `paper_size_id` (`paper_size_id`),
  ADD KEY `paper_type_id` (`paper_type_id`);

--
-- Indexes for table `staff_users`
--
ALTER TABLE `staff_users`
  ADD PRIMARY KEY (`USER_ID`);

--
-- Indexes for table `walkin_sessions`
--
ALTER TABLE `walkin_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `Customer_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `material_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `material_properties`
--
ALTER TABLE `material_properties`
  MODIFY `property_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `paper_sizes`
--
ALTER TABLE `paper_sizes`
  MODIFY `paper_size_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `paper_types`
--
ALTER TABLE `paper_types`
  MODIFY `paper_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pricing`
--
ALTER TABLE `pricing`
  MODIFY `pricing_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_users`
--
ALTER TABLE `staff_users`
  MODIFY `USER_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `walkin_sessions`
--
ALTER TABLE `walkin_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `material_properties`
--
ALTER TABLE `material_properties`
  ADD CONSTRAINT `material_properties_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `materials` (`material_id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_paper_size` FOREIGN KEY (`paper_size_id`) REFERENCES `paper_sizes` (`paper_size_id`),
  ADD CONSTRAINT `fk_orders_paper_type` FOREIGN KEY (`paper_type_id`) REFERENCES `paper_types` (`paper_type_id`),
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `customers` (`Customer_ID`) ON DELETE CASCADE;

--
-- Constraints for table `pricing`
--
ALTER TABLE `pricing`
  ADD CONSTRAINT `pricing_ibfk_1` FOREIGN KEY (`paper_size_id`) REFERENCES `paper_sizes` (`paper_size_id`),
  ADD CONSTRAINT `pricing_ibfk_2` FOREIGN KEY (`paper_type_id`) REFERENCES `paper_types` (`paper_type_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
