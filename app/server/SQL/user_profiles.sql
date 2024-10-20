-- Table: public.user_profiles

-- DROP TABLE IF EXISTS public.user_profiles;

CREATE TABLE IF NOT EXISTS public.user_profiles
(
    id integer NOT NULL DEFAULT nextval('user_profiles_id_seq'::regclass),
    user_id integer NOT NULL,  -- Foreign key to users table
    phone character varying(20) COLLATE pg_catalog."default",
    profile_picture character varying(255) COLLATE pg_catalog."default",  -- Optional for user-uploaded profile picture
    biography text,  -- Optional for users to write about themselves
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE  -- Delete user profile if the user is deleted
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.user_profiles
    OWNER to operator;
