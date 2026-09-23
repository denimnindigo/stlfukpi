# STL FU Weaving KPI — Final Web Package

This package is designed around the Supabase database populated from `Weaving KPI System 23 Sept.xlsx`.

## Included
- Mobile-first denim/indigo UI
- Supabase Auth login, visitor self-registration, email verification and password reset
- Role-aware navigation: Admin, Manager, Data Entry, Visitor
- Live Dashboard, Operator View, Daily KPI Entry, Fault & Downtime, Masters, Users and Excel reference
- Excel-aligned KPI calculations and 9-component scoring logic
- Original Excel workbook bundled for audit/reference

## Deploy
Upload all files in this folder to the root of the `denimnindigo/stlfkpi` GitHub repository and commit.

## Supabase user-control patch
Run `SUPABASE_ADMIN_USER_CONTROL.sql` once in Supabase SQL Editor if you want Admin-controlled pre-approval of Manager/Data Entry emails. The website never uses a service/secret key.

## Public frontend key
The app contains only the Supabase publishable key. Never add a secret/service_role key to this repository.
