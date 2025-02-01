CREATE TABLE `manifests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manifest_id` integer NOT NULL,
	`status` text NOT NULL,
	`assigned_to` integer,
	FOREIGN KEY (`assigned_to`) REFERENCES `trucks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `manifests_manifest_id_unique` ON `manifests` (`manifest_id`);--> statement-breakpoint
CREATE TABLE `trucks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`registration` text NOT NULL,
	`driver_name` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trucks_registration_unique` ON `trucks` (`registration`);--> statement-breakpoint
DROP TABLE `users_table`;