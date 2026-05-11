-- insert into users (email, company, password, user_name,phone,is_admin) values ('admin','','c4ca4238a0b923820dcc509a6f75849b','','',true);


-- alter table item add column removed boolean default false;

alter table orders add column user_name varchar(100);
alter table orders add column phone varchar(15);