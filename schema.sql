create database bamazon;
use bamazon;
create table products (
	item_id integer auto_increment not null,
    product_name varchar(50) not null,
    department_name varchar(50) not null,
    price decimal(9,2) not null,
    stock_quantity integer not null,
    primary key (item_id)
);