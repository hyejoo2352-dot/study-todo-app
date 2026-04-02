## Plan: Minimal TODO app structure

TL;DR: Create a tiny Next.js App Router skeleton in `src/app` with just a root layout and a single page that manages todo state in-memory.

Steps

1. Create `src/app/layout.tsx` with the basic HTML structure and `children` rendering.
2. Create `src/app/page.tsx` as a client component with `useState` for `todos` and input text.
3. Implement add, toggle complete, and delete logic in `page.tsx`.
4. Keep file structure minimal; do not add localStorage or extra persistence yet.

Relevant files

- `src/app/layout.tsx`
- `src/app/page.tsx`

Verification

1. `npm run dev` should compile the app.
2. In the browser, the page should allow adding todos, showing the list, toggling complete, and deleting items.

Next step

- After this, add persistence (localStorage), filters, or separate components as requested.
