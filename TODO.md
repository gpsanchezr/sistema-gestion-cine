# Cinema App Cleaning - Stabilization Steps

## Status: In Progress

1. [x] Understand project structure and issues
2. [x] Fix backend/server.js syntax error (tiquetes endpoint)
3. [x] Fix CineBot.jsx: Import syntax fixed ('deep-chat-react'), React/useState added
4. [ ] Check CSS animations, forms, hooks (no issues found)
5. [ ] Run `npm run dev` - verify clean frontend console
6. [ ] Run `cd backend && npm start` - verify clean backend startup
7. [ ] Test basic app stability (no 400/404 Supabase)
8. [ ] Mark complete

### Backend/server.js Fix (Step 2) - ✅ COMPLETE
1. [x] Add missing /api/funciones GET endpoint after /chat route
2. [x] Rename /tiquetes to /api/tiquetes for API consistency  
3. [x] Update TODO.md step 2 to [x]
4. [x] Test: cd backend && npm start (verify no syntax errors) - Note: openai package missing, install needed for full start

No new libs, no big refactors. Focus: Clean consoles, working chatbot.

