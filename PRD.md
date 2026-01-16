# Vinyl Collection Web Application - Implementation Plan

## Project Overview
A sophisticated vinyl collection management system with a subtle Japanese listening room aesthetic. Features collection tracking, visual wishlist mood board, dual now-playing (manual + Spotify), and a beautiful public gallery for sharing your collection.

**Current Status**: Phase 2 Complete - Supabase Infrastructure ready. Database migration with all 5 tables, RLS policies, and indexes created. Supabase client helpers (browser + server) and auth middleware implemented.

## Technology Stack
- **Frontend**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom Japanese listening room theme
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (owner-only admin, public viewing)
- **Storage**: Supabase Storage (images, audio clips)
- **Integrations**: Spotify Web API, optional Discogs API
- **Deployment**: Vercel

## Design Aesthetic
- Warm wood tones (#B59A76 primary) with minimal layout
- Vintage hi-fi equipment vibes (knobs, dials, analog meters)
- Clean typography, subtle textures
- Responsive grid view with hover details
- Not overtly Japanese, but captures the intimate warmth of a Tokyo listening room

## Database Schema

### Tables
1. **profiles** - User profiles (extends Supabase auth)
   - Owner flag for admin access

2. **vinyls** - Main collection
   - Core: artist, album, year, label, catalog_number
   - Details: pressing_info, country, format, rpm
   - Condition: sleeve_condition, media_condition
   - Media: cover_art_url, custom_photos[], audio_clips[]
   - Metadata: genre[], notes, purchase_info, discogs_id
   - Public readable, owner-only writable (RLS)

3. **wishlist_items** - Visual mood board
   - artist, album, cover_art_url
   - priority, target_price, notes, tags[]
   - position (for drag-and-drop ordering)
   - category for grouping

4. **now_playing** - Current listening
   - source: 'manual' or 'spotify'
   - vinyl_id (for manual selection)
   - spotify_track_name, spotify_artist_name, spotify_album_art_url (for Spotify)
   - One row per owner (UNIQUE constraint)

5. **spotify_tokens** - Encrypted OAuth tokens
   - access_token, refresh_token, expires_at
   - Owner-only access (RLS)

### Storage Buckets
- `vinyl-covers` - Album cover art
- `vinyl-photos` - Custom vinyl photos
- `audio-clips` - Sample audio recordings
- `wishlist-images` - Wishlist album covers

All buckets: public read, authenticated write

## Project Structure
```
aces-library/
├── app/
│   ├── (auth)/login/          # Owner login
│   ├── (dashboard)/            # Protected owner routes
│   │   ├── collection/         # Manage vinyls (CRUD)
│   │   └── wishlist/           # Manage wishlist
│   ├── (public)/gallery/       # Public view of collection
│   ├── api/
│   │   ├── vinyls/             # CRUD endpoints
│   │   ├── wishlist/           # Wishlist endpoints
│   │   ├── now-playing/        # Now playing management
│   │   └── spotify/            # OAuth + current track
│   ├── layout.tsx
│   ├── page.tsx                # Landing/home page
│   └── globals.css
├── components/
│   ├── collection/             # VinylGrid, VinylCard, VinylForm
│   ├── wishlist/               # WishlistGrid with drag-drop
│   ├── now-playing/            # NowPlaying display + Spotify
│   ├── gallery/                # PublicGallery view
│   ├── ui/                     # Reusable UI components
│   └── shared/                 # ImageUpload, AudioUpload
├── lib/
│   ├── supabase/               # Client & server helpers
│   ├── spotify/                # Spotify API client
│   ├── hooks/                  # useVinyls, useAuth, useSpotify
│   ├── store/                  # Zustand stores
│   └── types/                  # TypeScript definitions
├── supabase/
│   └── migrations/             # Database schema
├── tailwind.config.ts          # Custom theme (wood tones, analog colors)
└── next.config.js
```

## Implementation Phases

### Phase 1: Foundation Setup (Days 1-2)
**Goal**: Initialize project with basic infrastructure

1. Initialize Next.js with TypeScript
   ```bash
   npx create-next-app@latest aces-library --typescript --tailwind --app
   ```

2. Install core dependencies
   - `@supabase/supabase-js` + `@supabase/auth-helpers-nextjs`
   - `framer-motion` (animations)
   - `@dnd-kit/core` + `@dnd-kit/sortable` (wishlist drag-drop)
   - `zustand` (state management)
   - `react-hot-toast` (notifications)
   - `sharp` (image optimization)

3. Configure Tailwind with custom theme
   - Define wood color palette (50-900 shades)
   - Analog equipment grays
   - Warm accent colors (#FF9D57)
   - Custom fonts (Inter, serif for headings)
   - Vintage button/card styles

4. Set up environment variables
   - Supabase URL + anon key
   - Spotify client ID + secret
   - Optional Discogs API keys

5. Initialize Git and create `.gitignore`

### Phase 2: Supabase Setup (Days 2-3)
**Goal**: Database foundation with authentication

1. Create Supabase project via dashboard

2. Run database migration
   - Create all 5 tables with proper columns
   - Set up indexes (owner_id, artist, genre, created_at)
   - Enable RLS on all tables
   - Create policies:
     - Public SELECT on vinyls, wishlist_items, now_playing
     - Owner-only INSERT/UPDATE/DELETE
     - Owner-only access to spotify_tokens

3. Create storage buckets
   - vinyl-covers, vinyl-photos, audio-clips, wishlist-images
   - Set public read, authenticated write policies

4. Create Supabase client helpers
   - `lib/supabase/client.ts` (client components)
   - `lib/supabase/server.ts` (server components)

5. Set up type definitions
   - Generate database types from Supabase
   - Create `lib/types/vinyl.ts`, `lib/types/wishlist.ts`

**Critical Files**:
- `supabase/migrations/001_initial_schema.sql`
- `lib/supabase/client.ts`
- `lib/types/database.ts`

### Phase 3: Authentication & Layout (Days 3-4)
**Goal**: Owner authentication + base UI

1. Implement authentication
   - `lib/hooks/useAuth.ts` - Session management
   - `app/(auth)/login/page.tsx` - Login form
   - `components/auth/ProtectedRoute.tsx` - Route guard
   - Check `is_owner` flag in profiles table

2. Create layout components
   - `components/layout/Header.tsx` - Site header with navigation
   - `components/layout/Navigation.tsx` - Main nav (Collection, Wishlist)
   - Owner sees management links, public sees gallery link

3. Build base UI component library
   - `components/ui/Button.tsx` - Vintage button with wood gradient
   - `components/ui/Card.tsx` - Vinyl card with shadow
   - `components/ui/Input.tsx` - Form inputs
   - `components/ui/Modal.tsx` - Modals for forms
   - Apply Japanese listening room aesthetic

4. Create landing page (`app/page.tsx`)
   - Hero section introducing the collection
   - Link to public gallery
   - Owner login in header

**Critical Files**:
- `lib/hooks/useAuth.ts`
- `tailwind.config.ts`
- `app/globals.css`

### Phase 4: Vinyl Collection CRUD (Days 5-8)
**Goal**: Complete vinyl management system

1. API Routes
   - `app/api/vinyls/route.ts`
     - GET: Fetch all vinyls (with filters: search, genre, year)
     - POST: Create new vinyl (owner only)
   - `app/api/vinyls/[id]/route.ts`
     - GET: Single vinyl details
     - PATCH: Update vinyl (owner only)
     - DELETE: Delete vinyl (owner only)

2. State Management
   - `lib/store/vinylStore.ts` - Zustand store
   - `lib/hooks/useVinyls.ts` - Data fetching hook
   - Optimistic updates for smooth UX

3. Collection UI Components
   - `components/collection/VinylGrid.tsx`
     - Responsive grid (1-6 columns)
     - Hover reveals details overlay
     - Click opens detail view
   - `components/collection/VinylCard.tsx`
     - Album cover (Next.js Image)
     - Hover overlay: artist, album, year
     - Quick actions: edit, delete, set now playing
   - `components/collection/VinylDetail.tsx`
     - Full record view with all metadata
     - Photo gallery, audio clips
     - Edit button for owner
   - `components/collection/VinylForm.tsx`
     - Create/edit form
     - All fields: artist, album, year, label, pressing, condition, notes
     - Genre multi-select
   - `components/collection/FilterBar.tsx`
     - Search, genre filter, year range
   - `components/collection/SearchBar.tsx`
     - Real-time search with debounce

4. Media Upload
   - `components/shared/ImageUpload.tsx`
     - Drag-and-drop with react-dropzone
     - Preview thumbnails
     - Upload to Supabase Storage
     - Return public URL
   - `components/shared/AudioUpload.tsx`
     - MP3/WAV support, 10MB max
     - Waveform preview
     - Upload to audio-clips bucket

5. Collection Pages
   - `app/(dashboard)/collection/page.tsx` - Grid view
   - `app/(dashboard)/collection/[id]/page.tsx` - Detail view
   - `app/(dashboard)/collection/[id]/edit/page.tsx` - Edit form
   - Protected with auth guard

**Critical Files**:
- `app/api/vinyls/route.ts`
- `components/collection/VinylGrid.tsx`
- `components/collection/VinylCard.tsx`
- `components/collection/VinylForm.tsx`

### Phase 5: Wishlist Mood Board (Days 9-11)
**Goal**: Visual wishlist with drag-and-drop

1. API Routes
   - `app/api/wishlist/route.ts`
     - GET: Fetch wishlist items (ordered by position)
     - POST: Add item
     - PATCH: Reorder items (update positions)
     - DELETE: Remove item

2. Wishlist Components
   - `components/wishlist/WishlistGrid.tsx`
     - @dnd-kit integration for drag-and-drop
     - Visual feedback during drag
     - Auto-save position on drop
   - `components/wishlist/WishlistCard.tsx`
     - Album cover
     - Priority badge (High/Medium/Low)
     - Tags display
     - Target price
     - Quick delete button
   - `components/wishlist/DraggableItem.tsx`
     - Wrapper for drag-and-drop functionality

3. Wishlist Page
   - `app/(dashboard)/wishlist/page.tsx`
     - Grid view with drag-and-drop
     - Add new item button
     - Filter by tag/priority
   - Modal form for adding items

**Critical Files**:
- `components/wishlist/WishlistGrid.tsx`
- `app/api/wishlist/route.ts`

### Phase 6: Now Playing Feature (Days 12-15)
**Goal**: Manual + Spotify integration for currently playing

1. Manual Now Playing
   - `app/api/now-playing/route.ts`
     - GET: Fetch current now playing
     - POST: Set vinyl as now playing (owner only)
     - DELETE: Clear now playing
   - `components/now-playing/VinylSelector.tsx`
     - Dropdown to select vinyl from collection
     - "Set as now playing" button

2. Spotify Integration
   - `app/api/spotify/auth/route.ts`
     - OAuth 2.0 authorization flow
     - Callback handler
     - Token exchange
   - `app/api/spotify/current-track/route.ts`
     - Poll Spotify API for current track
     - Auto-update now_playing table when track changes
     - Token refresh logic
   - `lib/spotify/client.ts`
     - Spotify API wrapper
     - getCurrentTrack(), refreshToken()

3. Now Playing Display
   - `components/now-playing/NowPlaying.tsx`
     - Large album art display
     - Animated turntable effect (CSS rotation)
     - VU meter bars (animated gradient bars)
     - Display current source (manual or Spotify)
     - Poll Spotify API every 30s when active
   - Place prominently on collection page header

**Key Features**:
- Manual mode: Select any vinyl from collection
- Spotify mode: Auto-sync from Spotify
- Seamless switching between modes
- Visual indicator of which is active

**Critical Files**:
- `components/now-playing/NowPlaying.tsx`
- `app/api/spotify/current-track/route.ts`

### Phase 7: Public Gallery (Days 16-17)
**Goal**: Beautiful view-only gallery for sharing

1. Public Gallery Page
   - `app/(public)/gallery/page.tsx`
     - No authentication required
     - Fetch all vinyls via API
     - Server-side rendering for SEO

2. Gallery Components
   - `components/gallery/PublicGallery.tsx`
     - Masonry/grid layout
     - Smooth scroll animations (Framer Motion)
     - Filter by genre/year (client-side)
     - Search functionality
   - `components/gallery/GalleryCard.tsx`
     - Simplified card (no edit actions)
     - Click opens detail modal
     - Beautiful hover effects

3. Gallery Features
   - Show collection count
   - Display now playing status
   - Optional: Show wishlist as "Coming Soon"
   - Shareable URL

**Critical Files**:
- `app/(public)/gallery/page.tsx`
- `components/gallery/PublicGallery.tsx`

### Phase 8: Polish & Enhancement (Days 18-20)
**Goal**: Animations, optimizations, and aesthetic refinements

1. Design Enhancements
   - Add wood grain texture backgrounds
   - Implement analog dial components (Settings page)
   - Create VU meter animation for now playing
   - Fine-tune hover states and transitions
   - Add vintage button styles throughout

2. Performance Optimization
   - Lazy load images in grid (Next.js Image)
   - Implement pagination/infinite scroll for 100+ vinyls
   - Add loading skeletons
   - Optimize database queries with proper indexes
   - Image optimization pipeline (Sharp)

3. Optional: Discogs Integration
   - `lib/discogs/client.ts` - API wrapper
   - Search releases by artist + album
   - Auto-populate vinyl data
   - Import cover art
   - Manual override if needed

4. Responsive Design
   - Mobile grid (1-2 columns)
   - Tablet grid (3-4 columns)
   - Desktop grid (4-6 columns)
   - Touch-friendly drag-and-drop on mobile

5. Accessibility
   - ARIA labels on all interactive elements
   - Keyboard navigation for grid
   - Focus indicators
   - Alt text for all images

### Phase 9: Testing & Deployment (Days 21-22)
**Goal**: Production deployment on Vercel

1. Testing Checklist
   - [ ] Owner can log in/out
   - [ ] Owner can CRUD vinyls
   - [ ] Media uploads work (images, audio)
   - [ ] Wishlist drag-and-drop works
   - [ ] Manual now playing selection works
   - [ ] Spotify integration syncs correctly
   - [ ] Public gallery displays without auth
   - [ ] RLS policies prevent unauthorized edits
   - [ ] Responsive design on mobile/tablet/desktop

2. Vercel Deployment
   - Connect GitHub repo to Vercel
   - Configure environment variables in Vercel dashboard
   - Set up Supabase production environment variables
   - Configure build settings (Next.js framework)
   - Deploy to production

3. Post-Deployment
   - Test all features in production
   - Verify Supabase RLS policies work
   - Check Spotify OAuth callback URLs
   - Set up custom domain (optional)
   - Configure Vercel Analytics (optional)

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-domain.com/api/spotify/callback

# Discogs (optional)
DISCOGS_API_KEY=your_discogs_key
DISCOGS_API_SECRET=your_discogs_secret

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Design System Colors

```css
wood: {
  500: '#B59A76' /* Primary wood tone */
  600: '#9A7F5D' /* Darker wood */
}

warm: {
  500: '#FF9D57' /* Warm accent */
}

analog: {
  500: '#6B6B5E' /* Equipment gray */
  700: '#40403A' /* Dark metal */
}
```

## Key Technical Decisions

1. **App Router over Pages Router**: Modern Next.js pattern, better for RSC
2. **Zustand over Redux**: Simpler state management for this scale
3. **Supabase RLS**: Security at database level, reduces API boilerplate
4. **@dnd-kit**: Lightweight, accessible drag-and-drop
5. **Framer Motion**: Smooth animations without bloat
6. **Sharp**: Server-side image optimization for uploads
7. **Polling Spotify**: 30s interval, balance between freshness and rate limits

## Scalability Considerations

- Database indexes on frequently queried fields (artist, genre, owner_id)
- Pagination for collections over 100 items
- CDN delivery via Supabase Storage
- Next.js Image optimization with AVIF/WebP
- Edge caching on Vercel for public gallery

## Success Criteria

✅ Owner can manage ~80 vinyls with rich media
✅ Visual wishlist with drag-and-drop reordering
✅ Now playing with both manual selection and Spotify integration
✅ Public gallery is beautiful, fast, and shareable
✅ Japanese listening room aesthetic is subtle and sophisticated
✅ Responsive on all devices
✅ Deployed to Vercel and accessible online

## Verification Plan

After implementation, test the following end-to-end workflows:

1. **Collection Management**
   - Log in as owner
   - Add a new vinyl with cover art and custom photo
   - Edit existing vinyl to add notes
   - Delete a vinyl
   - Filter collection by genre
   - Search for vinyl by artist name

2. **Wishlist**
   - Add 5 items to wishlist
   - Drag items to reorder
   - Verify positions persist after reload
   - Add tags and priority
   - Delete an item

3. **Now Playing**
   - Manually set a vinyl as now playing
   - Verify it displays with animation
   - Connect Spotify account
   - Play a song on Spotify
   - Verify it syncs to now playing within 30s
   - Switch back to manual mode

4. **Public Gallery**
   - Log out
   - Navigate to `/gallery`
   - Verify collection displays without auth
   - Test search and filtering
   - Verify now playing shows on gallery

5. **Media Upload**
   - Upload a vinyl cover image
   - Add 2 custom photos
   - Upload an audio clip
   - Verify all display correctly
   - Check Supabase Storage bucket

6. **Responsive Design**
   - Test on mobile (375px width)
   - Test on tablet (768px width)
   - Test on desktop (1920px width)
   - Verify grid columns adapt
   - Test drag-and-drop on touch device

## Estimated Timeline

**Total: 3-4 weeks** for a fully functional MVP

- Phases 1-3: 4 days (Foundation, DB, Auth)
- Phase 4: 4 days (Vinyl CRUD)
- Phase 5: 3 days (Wishlist)
- Phase 6: 4 days (Now Playing + Spotify)
- Phase 7: 2 days (Public Gallery)
- Phase 8: 3 days (Polish)
- Phase 9: 2 days (Testing & Deployment)

This timeline assumes focused development. Adjust based on your schedule.

---

**Next Steps After Approval**: Initialize Next.js project, set up Supabase, and begin Phase 1 implementation.
