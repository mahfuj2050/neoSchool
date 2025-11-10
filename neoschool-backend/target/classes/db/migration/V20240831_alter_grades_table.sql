-- Alter grades table to change range_min and range_max to DOUBLE
ALTER TABLE grades 
MODIFY COLUMN range_min DOUBLE NOT NULL,
MODIFY COLUMN range_max DOUBLE NOT NULL;
