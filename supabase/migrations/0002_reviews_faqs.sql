-- 0002_reviews_faqs.sql
-- reviews + faqs

create table if not exists reviews (
  id                 uuid primary key default gen_random_uuid(),
  product_id         text references products(id) on delete cascade,
  rating             int not null check (rating between 1 and 5),
  title              text,
  body               text not null,
  reviewer_name      text,                       -- 닉네임 (마스킹된 실명)
  reviewer_pet_type  text,                       -- '길냥이' | '집냥이' | '강아지' 등
  photos             jsonb,                      -- ["url1", "url2", ...]
  source             text not null default 'manual',  -- 'manual' | 'instagram' | 'imported'
  verified           boolean not null default false,  -- 실제 구매자 검증 여부
  display_order      int not null default 0,
  created_at         timestamptz not null default now()
);

create index if not exists idx_reviews_product
  on reviews(product_id, display_order desc);

create table if not exists faqs (
  id             uuid primary key default gen_random_uuid(),
  category       text not null,        -- '제품' | '배송' | '환불' | '돌봄'
  question       text not null,
  answer_html    text not null,
  display_order  int not null default 0,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  constraint faqs_category_check check (category in ('제품','배송','환불','돌봄'))
);

create index if not exists idx_faqs_active_order
  on faqs(active, category, display_order);
