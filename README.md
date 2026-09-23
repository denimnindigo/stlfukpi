# Weaving KPI Management System

GitHub Pages-ready prototype based on the current Weaving KPI Excel system.

## What is included
- Login screen (demo authentication)
- Management dashboard
- Filters by date, shift, operator and loom
- Daily KPI entry
- Fault & downtime entry
- Responsive desktop/mobile layout
- KPI calculation engine using the current 9-component weighting:
  - Production 20%
  - Efficiency 15%
  - Running/Availability 15%
  - Quality/Rejection 15%
  - Fault Control 10%
  - Downtime Control 10%
  - Housekeeping/SOP 5%
  - Attendance/Discipline 5%
  - Skill/Process Compliance 5%

## Demo login
- admin / admin123
- manager / manager123
- entry / entry123

## Important
This is a **front-end prototype**. The demo stores data in the browser's localStorage, so it is not suitable for real mill deployment yet.

### Production setup
Use:
- GitHub repository + GitHub Pages for the front end
- Supabase for secure authentication and shared database
- Row Level Security (RLS) for role permissions

Do not use the demo passwords for a real deployment.

## Deploy to GitHub Pages
1. Create a new GitHub repository, e.g. `denim-mill-kpi-system`.
2. Upload all files from this folder.
3. In GitHub: Settings → Pages → Deploy from branch → `main` → `/root`.
4. Open the generated Pages URL.

## Next production phase
1. Create Supabase project.
2. Create tables: users/profiles, operators, looms, shifts, daily_kpi, faults, standards.
3. Enable Supabase Auth.
4. Add role-based RLS.
5. Replace localStorage functions in `js/app.js` with Supabase calls.
6. Import the current Excel masters/data.
7. Add CSV/Excel export and monthly appraisal lock/approval.
