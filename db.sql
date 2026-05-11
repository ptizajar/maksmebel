CREATE TABLE IF NOT EXISTS public.category
(
    category_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    category_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT category_pkey PRIMARY KEY (category_id),
    CONSTRAINT "unique-category-name" UNIQUE (category_name)
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.category
    OWNER to postgres;

-- DROP INDEX IF EXISTS public.category_name;

CREATE INDEX IF NOT EXISTS category_name
    ON public.category USING btree
    (category_name COLLATE pg_catalog."default" DESC NULLS FIRST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.item
(
    item_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    item_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    article character varying COLLATE pg_catalog."default" NOT NULL,
    length numeric(10,2) NOT NULL,
    width numeric(10,2) NOT NULL,
    height numeric(10,2) NOT NULL,
    price numeric(10,2) NOT NULL,
    description character varying(500) COLLATE pg_catalog."default" NOT NULL,
    show boolean NOT NULL,
    category_id integer NOT NULL,
    weight numeric(10,2),
    quantity integer NOT NULL,
    CONSTRAINT item_pkey PRIMARY KEY (item_id),
    CONSTRAINT "unique-article" UNIQUE (article),
    CONSTRAINT "unique-item-name" UNIQUE (item_name),
    CONSTRAINT category_id FOREIGN KEY (category_id)
        REFERENCES public.category (category_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.item
    OWNER to postgres;

-- DROP INDEX IF EXISTS public.item_price;

CREATE INDEX IF NOT EXISTS item_price
    ON public.item USING btree
    (price DESC NULLS FIRST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.users
(
    user_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    company character varying(50) COLLATE pg_catalog."default" ,
    password character varying(50) COLLATE pg_catalog."default" NOT NULL,
    user_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    phone character varying(16) COLLATE pg_catalog."default" NOT NULL,
    is_admin boolean NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (user_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

-- DROP INDEX IF EXISTS public.users_login;

CREATE INDEX IF NOT EXISTS users_email
    ON public.users USING btree
    (email COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;


CREATE TABLE IF NOT EXISTS public.favourites
(
    item_id integer NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT fk_2 FOREIGN KEY (item_id)
        REFERENCES public.item (item_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_3 FOREIGN KEY (user_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS public.orders
(
    order_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    user_id integer NOT NULL,
    item_id integer NOT NULL,
    date timestamp with time zone NOT NULL,
    recall_date timestamp with time zone NOT NULL,
    price numeric (10,2) NOT NULL,
    status character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT orders_pkey PRIMARY KEY (order_id),
    CONSTRAINT fk_4 FOREIGN KEY (user_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_5 FOREIGN KEY (item_id)
        REFERENCES public.item (item_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.orders
    OWNER to postgres;

-- DROP INDEX IF EXISTS public.order_date;

CREATE INDEX IF NOT EXISTS order_date
    ON public.orders USING btree
    (date ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;


CREATE TABLE IF NOT EXISTS public.price_history
(
    item_id integer NOT NULL,
    changed_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    price numeric (10,2),
    CONSTRAINT price_history_pkey PRIMARY KEY (item_id, changed_at),
    CONSTRAINT fk_price_history_item FOREIGN KEY (item_id)
        REFERENCES public.item (item_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
