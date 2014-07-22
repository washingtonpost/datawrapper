# Change all engines to InnoDB

ALTER TABLE `action` ENGINE = InnoDB;
ALTER TABLE `chart` ENGINE = InnoDB;
ALTER TABLE `job` ENGINE = InnoDB;
ALTER TABLE `session` ENGINE = InnoDB;
ALTER TABLE `stats` ENGINE = InnoDB;
ALTER TABLE `user` ENGINE = InnoDB;

# Update chart fields
ALTER TABLE chart CHANGE `author_id` `author_id` int(11) DEFAULT NULL;
ALTER TABLE chart ADD `public_url` varchar(255) DEFAULT NULL;
ALTER TABLE chart ADD `public_version` int(11) DEFAULT '0';
ALTER TABLE chart ADD `organization_id` varchar(128) DEFAULT NULL;
ALTER TABLE chart ADD `forked_from` varchar(5) DEFAULT NULL;

# Update job fields
ALTER TABLE job ADD `fail_reason` varchar(4096) NOT NULL;

# Update user
ALTER TABLE user ADD `oauth_signin` varchar(512) DEFAULT NULL;

# Create new tables
DROP TABLE IF EXISTS `organization`;
CREATE TABLE `organization`
(
    `id` VARCHAR(128) NOT NULL,
    `name` VARCHAR(512) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `deleted` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;


DROP TABLE IF EXISTS `plugin`;
CREATE TABLE `plugin`
(
    `id` VARCHAR(128) NOT NULL,
    `installed_at` DATETIME NOT NULL,
    `enabled` TINYINT(1) DEFAULT 0,
    `is_private` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;


DROP TABLE IF EXISTS `plugin_data`;
CREATE TABLE `plugin_data`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plugin_id` VARCHAR(128) NOT NULL,
    `stored_at` DATETIME NOT NULL,
    `key` VARCHAR(128) NOT NULL,
    `data` VARCHAR(4096),
    PRIMARY KEY (`id`),
    INDEX `plugin_data_FI_1` (`plugin_id`),
    CONSTRAINT `plugin_data_FK_1`
        FOREIGN KEY (`plugin_id`)
        REFERENCES `plugin` (`id`)
) ENGINE=InnoDB;


DROP TABLE IF EXISTS `plugin_organization`;
CREATE TABLE `plugin_organization`
(
    `plugin_id` VARCHAR(128) NOT NULL,
    `organization_id` VARCHAR(128) NOT NULL,
    PRIMARY KEY (`plugin_id`,`organization_id`),
    INDEX `plugin_organization_FI_2` (`organization_id`)
) ENGINE=MyISAM;


DROP TABLE IF EXISTS `user_organization`;
CREATE TABLE `user_organization`
(
    `user_id` INTEGER NOT NULL,
    `organization_id` VARCHAR(128) NOT NULL,
    `organization_role` TINYINT DEFAULT 1 NOT NULL,
    PRIMARY KEY (`user_id`,`organization_id`),
    INDEX `user_organization_FI_2` (`organization_id`)
) ENGINE=MyISAM;


# Add constraints
ALTER TABLE `action` ADD CONSTRAINT `action_FK_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `chart` ADD CONSTRAINT `chart_FK_1` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`);
ALTER TABLE `chart` ADD INDEX `chart_FI_2` (`organization_id`);
ALTER TABLE `chart` ADD CONSTRAINT `chart_FK_2` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`);
ALTER TABLE `chart` ADD INDEX `chart_FI_3` (`forked_from`);
ALTER TABLE `chart` ADD CONSTRAINT `chart_FK_3` FOREIGN KEY (`forked_from`) REFERENCES `chart` (`id`);

ALTER TABLE `job` ADD CONSTRAINT `job_FK_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);
ALTER TABLE `job` ADD CONSTRAINT `job_FK_2` FOREIGN KEY (`chart_id`) REFERENCES `chart` (`id`);
