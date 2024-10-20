-- Table: public.donations

-- DROP TABLE IF EXISTS public.donations;

CREATE TABLE IF NOT EXISTS public.donations
(
    id integer NOT NULL DEFAULT nextval('donations_id_seq'::regclass),
    user_id integer NOT NULL,  -- Foreign key to users table
    book_id integer NOT NULL,  -- Foreign key to books table
    donation_date timestamp without time zone DEFAULT now(),
    status character varying(50) COLLATE pg_catalog."default" DEFAULT 'pending',  -- Example statuses: pending, completed, canceled
    notes text,  -- Optional notes about the donation
    CONSTRAINT donations_pkey PRIMARY KEY (id),
    CONSTRAINT donations_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,  -- Delete donation record if the user is deleted
    CONSTRAINT donations_book_id_fkey FOREIGN KEY (book_id)
        REFERENCES public.books (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE  -- Delete donation record if the book is deleted
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.donations
    OWNER to operator;
