# Scout

Field catalog for Thai rental and flip prospects. Capture a sign or any notes, review the structured record, then keep photos, location, notes, and an optional renovation plan.

## Stack

- Next.js 16
- Supabase (`sb_publishable` + `sb_secret`)
- OpenAI (vision + structured extraction)

## Setup

1. Copy `.env.example` to `.env.local` and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`)
   - `SUPABASE_SECRET_KEY` (`sb_secret_...`)
   - `OPENAI_API_KEY`
2. In the Supabase SQL editor, run `supabase/schema.sql`. Tables, types, and the storage bucket are prefixed with `realestate_scout_`.
3. Create your login from `/login` (or disable email confirmation in Auth if you want to sign in immediately).
4. `npm run dev`

Google Maps is optional. Until `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set, the map tab uses an OpenStreetMap placeholder.

## Capture flow

- **Notes / listing text** and **sign photos** both go through OpenAI, not OCR.
- Thai on signs is translated into English fields. The original photo and Thai text are kept.
- Device GPS is captured at input time and can be edited before save or later.
- Nothing is written until you confirm the preview.
- The **gallery** is for walkthrough / condition photos only. Sign shots stay separate.
