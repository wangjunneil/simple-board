# Graph Report - simple-board  (2026-05-06)

## Corpus Check
- 25 files · ~59,743 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 203 nodes · 297 edges · 17 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]

## God Nodes (most connected - your core abstractions)
1. `POST()` - 12 edges
2. `GET()` - 11 edges
3. `key()` - 10 edges
4. `Nullboard (Original Kanban App)` - 9 edges
5. `se()` - 8 edges
6. `ce()` - 8 edges
7. `Ee()` - 8 edges
8. `M()` - 8 edges
9. `BoardView Kanban Board Layout` - 8 edges
10. `resolveDeviceId()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `LoginPage()` --follows_in_user_flow--> `SimpleBoard Board List Page Screenshot — grid of two kanban board cards`  [INFERRED]
  src/app/login/page.tsx → images/sb-2-boards.png
- `SortableBoardItem()` --shows_component--> `SimpleBoard Board List Page Screenshot — grid of two kanban board cards`  [INFERRED]
  src/components/BoardList.tsx → images/sb-2-boards.png
- `nullboard.html (Original Version)` --is_the_same_artifact--> `Nullboard (Original Kanban App)`  [INFERRED]
  README.md → nullboard.html
- `Board Type (id, title, lists, createdAt)` --semantically_similar_to--> `BoardMeta Class (Nullboard Board Metadata)`  [INFERRED] [semantically similar]
  AGENTS.md → nullboard.html
- `Theme Type (light | dark)` --semantically_similar_to--> `Dark Theme CSS (.theme-dark)`  [INFERRED] [semantically similar]
  AGENTS.md → nullboard.html

## Hyperedges (group relationships)
- **Authentication Flow** — agents_middleware, agents_sbauth_cookie, agents_hmac_sha256_auth, agents_deviceid, agents_multi_password_isolation, readme_access_password [EXTRACTED 0.90]
- **Persistence & Cloud Sync Layer** — agents_localstorage, agents_mongodb_atlas, agents_sb_boards, agents_sb_preferences, agents_usesync, agents_deviceid [EXTRACTED 0.85]
- **Nullboard Core Data Management Classes** — nullboard_appconfig, nullboard_storage_class, nullboard_boardmeta [EXTRACTED 0.90]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (33): A(), at(), b(), be(), ce(), e(), Ee(), fe() (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (21): getClearCookieValue(), getCookieName(), getCookieValue(), getKey(), getPasswords(), getServerDeviceId(), signToken(), verifyToken() (+13 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (21): deviceId (SHA-256 Derived from Password), Dynamic import('mongodb') Lazy Loading, HMAC-SHA256 Token Authentication, localStorage Client Persistence, Global Auth Middleware (middleware.ts), MongoDB Atlas Cloud Sync, Multi-Password Data Isolation, Dynamic Import for Optional MongoDB Dependency (Silent Degradation) (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (17): Board Type (id, title, lists, createdAt), BoardProvider (React Context Provider), Font Type (Barlow | IBM Plex | Open Sans | Segoe UI | Maven Pro), List Type (id, title, notes), Note Type (id, text, collapsed, raw, color, completedAt?), React Context + useReducer State Management, Theme Type (light | dark), Undo/Redo with 50-Step History Stack (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.19
Nodes (16): ACCESS_PASSWORD Environment Variable, POST /api/auth Endpoint, Debug Hardcoded Password for Vercel Deployment, Device ID Derivation from Password SHA-256, Error Message Display, HMAC-SHA256 Authentication Token, httpOnly Session Cookie (sb-auth), localStorage Namespace Isolation by DeviceId (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.26
Nodes (11): createInitialState(), getDeviceId(), key(), loadActiveBoardId(), loadBoards(), loadFont(), loadTheme(), saveActiveBoardId() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (14): Add List Button (Disabled at 4 Lists), BoardView Kanban Board Layout, DONE List with Completed Note Dates, Drag Handles on Note Cards, Footer with Copyright and HELP Link, List Headers with Titles, List Columns with Note Cards, Logo Dropdown Menu (Boards, Import/Export, Font) (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (5): boardsReducer(), isCompletedList(), useBoardContext(), ListColumn(), useSync()

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (1): ErrorBoundary

### Community 9 - "Community 9"
Cohesion: 0.4
Nodes (3): SortableBoardItem(), LoginPage(), SimpleBoard Board List Page Screenshot — grid of two kanban board cards

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (1): SimpleBoard Favicon 16x16

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (1): SimpleBoard Android Chrome App Icon (192x192)

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (1): Apple Touch Icon - SimpleBoard App Icon

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (1): SimpleBoard PWA App Icon (512x512)

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (1): SimpleBoard Favicon 32x32 - Kanban Board App Icon

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (1): Nullboard Favicon (16×16)

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (1): SimpleBoard App Icon (16x16 Favicon)

## Knowledge Gaps
- **28 isolated node(s):** `Alexander Pankratov / swapped.ch`, `BSD 2-Clause + Commons Clause License`, `ACCESS_PASSWORD Environment Variable`, `MONGODB_URI Environment Variable`, `Next.js 16 (App Router)` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 8`** (6 nodes): `ErrorBoundary`, `.componentDidCatch()`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`, `ErrorBoundary.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `SimpleBoard Favicon 16x16`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `SimpleBoard Android Chrome App Icon (192x192)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `Apple Touch Icon - SimpleBoard App Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `SimpleBoard PWA App Icon (512x512)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `SimpleBoard Favicon 32x32 - Kanban Board App Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `Nullboard Favicon (16×16)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `SimpleBoard App Icon (16x16 Favicon)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GET()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `se()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `le()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `POST()` (e.g. with `isMongoAvailable()` and `getPreferencesCollection()`) actually correct?**
  _`POST()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `GET()` (e.g. with `middleware()` and `isMongoAvailable()`) actually correct?**
  _`GET()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Alexander Pankratov / swapped.ch`, `BSD 2-Clause + Commons Clause License`, `ACCESS_PASSWORD Environment Variable` to the rest of the system?**
  _28 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._