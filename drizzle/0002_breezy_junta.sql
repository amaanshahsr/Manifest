CREATE TABLE `companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_name` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `companies_company_name_unique` ON `companies` (`company_name`);--> statement-breakpoint
ALTER TABLE `manifests` ADD `company_id` integer REFERENCES companies(id);