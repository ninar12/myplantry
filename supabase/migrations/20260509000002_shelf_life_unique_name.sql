-- Unique constraint on name so upserts work correctly
alter table shelf_life
  add constraint shelf_life_name_key unique (name);
