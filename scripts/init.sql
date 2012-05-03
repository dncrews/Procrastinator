DROP DATABASE IF EXISTS `procrastinate`;

CREATE DATABASE `procrastinate`;

grant all privileges on `procrastinate`.* to `procrastinate`@localhost identified by 'yourmom';

use `procrastinate`;

CREATE TABLE `users` (
  `email`    VARCHAR(100) PRIMARY KEY NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `phone`    VARCHAR(11)  NOT NULL
);

CREATE TABLE `messages` (
  `title`       TEXT,
  `description` TEXT,
  `email`       VARCHAR(100) NOT NULL,
  `when`        DATETIME
);
