# Moment UI Component Specifications

## 1. PromptCard (Main Card Component)

### Purpose
Displays today's prompt and manages the full interaction flow from response input through reveal. This is the primary UI element users interact with daily.

### States

#### OPEN_PROMPT
- **Trigger**: User hasn't responded yet, card is in initial state
- **Visual**: Purple/lavender background, prompt text centered, "Respond" button
- **Layout**: Full card shows prompt question, button at bottom

#### RESPONDING
- **Trigger**: User taps "Respond" button
- **Visual**: White background, prompt question at top (smaller), large text input area, "Submit" button
- **Layout**: Textarea expands to fill card space with prompt question header

#### AWAITING_PARTNER
- **Trigger**: User submitted response, partner hasn't
- **Visual**: Gray background, "Waiting for partner to respond..." text with loading spinner
- **Layout**: Centered loading state with "Edit Response" button at bottom

#### READY_TO_REVEAL
- **Trigger**: Both partners have responded, neither has revealed yet
- **Visual**: Green background, "Ready to reveal" text centered
- **Layout**: Entire card acts as tap target (no button needed)

#### REVEALED
- **Trigger**: User taps card in READY_TO_REVEAL state
- **Visual**: Side-by-side layout showing both responses with headers "You said..." and "Your partner said..."
- **Layout**: Split card, "Continue" button at bottom

### Data Dependencies

**Fetch on mount**:
```typescript
GET /api/moments/today
Returns: {
  moment: Moment (id, promptId, partnershipId, status, createdAt)
  prompt: Prompt (question, type)
  responses: Response[] (userId, content, completedAt)
  revealStatus: RevealStatus[] (userId, revealedAt)
}
```

**Real-time subscription**:
```typescript
supabase
  .channel('moment-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'Response',
    filter: `promptId=eq.${todayPromptId}`
  })
  .subscribe()
```

### Interactions

1. **Tap "Respond"** → Transition to RESPONDING state
2. **Type response** → Enable submit button when valid (non-empty, <500 chars)
3. **Tap "Submit"** → POST to /api/responses, transition to AWAITING_PARTNER
4. **Tap "Edit Response"** → Return to RESPONDING state with pre-filled text
5. **Tap card (when green)** → Flip animation, POST to /api/reveal, transition to REVEALED
6. **Tap "Continue"** → Transition to WAITING_FOR_NEXT_PROMPT state

### Visual Design

**Uses shadcn `Card` component with custom state-based backgrounds**

**Card dimensions**:
- Mobile: Full width minus 32px padding (16px each side)
- Flexible height based on content

**Colors by state**:
- OPEN_PROMPT: `bg-purple-200`
- RESPONDING: `bg-white`
- AWAITING_PARTNER: `bg-gray-200`
- READY_TO_REVEAL: `bg-green-400`
- REVEALED: `bg-white`

**Animations**:
- Flip transition: 3D rotate Y-axis, 600ms cubic-bezier(0.4, 0.0, 0.2, 1)
- Loading spinner: Use shadcn spinner/loading icon in AWAITING_PARTNER state
- State transitions: Fade 200ms ease-in-out

**Typography**:
- Prompt question: text-xl font-semibold
- Response headers: text-sm font-medium text-muted-foreground
- Response content: text-base
- Buttons: Use shadcn `Button` default styling

### Edge Cases

1. **No moment exists for today**: Show shadcn `Alert` "No prompt available yet. Check back soon!"
2. **Partner deleted account**: Show shadcn `Alert` (destructive) "Your partner is no longer connected" with option to find new partner
3. **Network timeout during submit**: Show shadcn `Alert` with retry button, keep response text in state
4. **User navigates away mid-response**: Auto-save draft to localStorage every 30s
5. **Both partners reveal simultaneously**: Race condition handled by RevealStatus table (both records created)
6. **User tries to edit after partner responded**: Allow edit but show warning "Your partner has already responded"

---

## 2. StreakIndicator (Dot Navigation)

### Purpose
Shows weekly streak progress and allows navigation to specific past days.

### States

#### ACTIVE_DAY
- **Visual**: Filled black circle
- **Condition**: Moment exists and both partners revealed it

#### FUTURE_DAY
- **Visual**: Empty/outline circle
- **Condition**: Day hasn't occurred yet

#### CURRENT_DAY
- **Visual**: Larger filled circle with pulse animation
- **Condition**: Today's date

### Data Dependencies

```typescript
GET /api/moments/week
Returns: {
  moments: Array<{
    date: string
    status: MomentStatus
    dayOfWeek: string (M, T, W, Th, F, Sa, Su)
  }>
}
```

### Interactions

1. **Tap past day dot** → Navigate to that day's revealed moment (opens in MomentDetailView)
2. **Tap current day dot** → No action (already viewing today)
3. **Tap future day dot** → No action (disabled)

### Visual Design

**Layout**: Horizontal row of 7 circles, centered at top of screen
**Dot sizing**: 
- Normal: 8px diameter
- Current day: 12px diameter
- Spacing: 16px between centers

**Colors**:
- Active: black fill
- Future: gray-300 outline, no fill
- Current: black fill with subtle scale animation (1.0 → 1.1 → 1.0 loop)

### Edge Cases

1. **Week spans across month boundary**: Label dots with day number instead of letter
2. **Partnership created mid-week**: Only show dots from partnership start date forward
3. **Missed day in streak**: Show gray filled circle (completed but streak broken)

---

## 3. ResponseInput (Form Component)

### Purpose
Handles user text input for prompt responses.

### States

#### EMPTY
- **Visual**: Placeholder text, disabled submit button
- **Condition**: No text entered

#### VALID
- **Visual**: Active textarea, enabled submit button
- **Condition**: Text length 1-500 characters

#### SUBMITTING
- **Visual**: Disabled textarea and button, loading spinner on button
- **Condition**: POST request in flight

#### ERROR
- **Visual**: Destructive border on textarea, shadcn `Alert` (destructive variant) below
- **Condition**: Submission failed or validation error

### Data Dependencies

**Props from parent (PromptCard)**:
```typescript
{
  promptId: string
  existingResponse?: string // For edit mode
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
}
```

**Submit action**:
```typescript
POST /api/responses
Body: {
  promptId: string
  content: string
}
```

### Interactions

1. **Type in textarea** → Character counter updates, validate on each keystroke
2. **Tap "Submit"** → Validate, transition to SUBMITTING, POST request
3. **Success** → Parent handles state transition
4. **Error** → Show error message, stay in ERROR state with retry option
5. **Press Enter (desktop)** → Submit if valid (Shift+Enter for newline)

### Visual Design

**Uses shadcn `Textarea` and `Button` components**

**Textarea customization**:
- Min height: 120px
- Max height: 300px (scroll after)

**Character counter**:
- Position: Bottom right of textarea
- Color: Muted when under limit, destructive when over
- Format: "245/500"

**Submit button**: Use shadcn `Button` (default variant)
- Full width
- Shows loading spinner when submitting

### Edge Cases

1. **User exceeds 500 characters**: Disable submit, highlight counter in destructive color, prevent typing
2. **Network failure**: Show shadcn `Alert` (destructive) "Failed to submit. Retry?" with retry button
3. **User navigates away**: Auto-save to localStorage with 30s debounce
4. **Edit mode with existing response**: Pre-fill textarea, change button text to "Update"
5. **Rapid double-tap submit**: Debounce submission, ignore subsequent taps until complete

---

## 4. MomentGallery (Past Moments List)

### Purpose
Displays chronological list of past revealed moments for browsing.

### States

#### LOADING
- **Visual**: shadcn `Skeleton` components matching card layout
- **Condition**: Initial data fetch

#### LOADED
- **Visual**: List of moment preview cards
- **Condition**: Data fetched successfully

#### EMPTY
- **Visual**: Empty state with encouraging message
- **Condition**: No past moments exist

#### LOAD_MORE
- **Visual**: "Load more" button at bottom of list
- **Condition**: More than 10 moments exist

### Data Dependencies

```typescript
GET /api/moments?limit=10&offset=0
Returns: {
  moments: Array<{
    id: string
    date: string
    prompt: { question: string }
    responses: Array<{ userId: string, content: string }>
    previewText: string // First 100 chars of user's response
  }>
  hasMore: boolean
}
```

### Interactions

1. **Tap moment card** → Navigate to MomentDetailView for that moment
2. **Scroll to bottom** → Auto-load next page if hasMore is true
3. **Pull to refresh** → Reload first page

### Visual Design

**Uses shadcn `ScrollArea` for list, `Card` for items, `Skeleton` for loading**

**List layout**:
- Vertical stack
- 12px gap between cards
- Padding: 16px horizontal

**Moment preview card**: Use shadcn `Card`

**Card content**:
- Date: text-xs text-gray-500 (e.g., "Today", "Thursday 11/17")
- Prompt: text-sm font-medium, line-clamp-2
- Preview: text-sm text-gray-600, line-clamp-2

**Empty state**:
- Centered icon and text
- Message: "No moments yet! Complete today's prompt to start building memories together."

### Edge Cases

1. **Today's moment not revealed yet**: Don't show in list until revealed
2. **Infinite scroll hits error**: Show shadcn `Alert` "Failed to load more" with retry button
3. **Deleted moment**: Filter out on backend, don't show gaps
4. **Very long prompt text**: Truncate with ellipsis after 2 lines
5. **Partnership has 100+ moments**: Implement pagination, only fetch 10 at a time

---

## 5. MomentDetailView (Full Moment Display)

### Purpose
Shows complete view of a past revealed moment with both responses.

### States

#### LOADING
- **Visual**: shadcn `Skeleton` components matching revealed layout
- **Condition**: Fetching moment details

#### DISPLAYED
- **Visual**: Split layout with both full responses
- **Condition**: Data loaded successfully

### Data Dependencies

```typescript
GET /api/moments/:momentId
Returns: {
  moment: Moment
  prompt: Prompt
  responses: Response[] (full content)
}
```

### Interactions

1. **Tap back arrow** → Return to MomentGallery
2. **Swipe left/right** → Navigate to adjacent moment (chronologically)
3. **Long press response** → Show share option (copy text)

### Visual Design

**Layout**: Same as PromptCard REVEALED state
- Split screen vertically
- "You said..." on left
- "Your partner said..." on right
- Prompt question at top
- Date subtitle below prompt

**Navigation**:
- Back button: Top left corner
- Swipe gestures: Horizontal drag threshold 50px

### Edge Cases

1. **Moment deleted**: Show shadcn `Alert` (destructive) 404 message, redirect to gallery
2. **Network error**: Show shadcn `Alert` with retry button
3. **First/last moment in list**: Disable swipe in that direction
4. **Photo responses**: Display images instead of text (future consideration)

---

## 6. WaitingState (Post-Reveal Screen)

### Purpose
Displays after user has revealed today's prompt, showing completed state and past moments access.

### States

#### DISPLAYED
- **Visual**: "Waiting for next prompt" message, Past Moments list below
- **Condition**: Today's moment revealed, new prompt not available yet

### Data Dependencies

**Inherits MomentGallery data**:
```typescript
GET /api/moments?limit=5
```

**Also needs**:
```typescript
GET /api/partnerships/current
Returns: {
  streak: number
  lastUpdated: timestamp
}
```

### Interactions

1. **View past moments** → Scrollable MomentGallery embedded
2. **Tap "Load more"** → Expand to show more past moments
3. **Pull to refresh** → Check if new prompt available

### Visual Design

**Header section**:
- "Waiting for next prompt" text centered
- Streak indicator: "X day streak" with fire emoji
- Subtle animation: Gentle pulsing of streak number

**Past moments section**:
- Header: "Past Moments" text-lg font-semibold
- Embedded MomentGallery component
- Initially shows 5 most recent

**Feedback section** (per Figma): Use shadcn `Card`, `Textarea`, `Button`
- Bottom card: "Share your feedback!"
- Textarea for user input
- "Send" button
- POST to /api/feedback

### Edge Cases

1. **New prompt becomes available**: Auto-refresh, transition to OPEN_PROMPT state
2. **No past moments**: Hide Past Moments section entirely
3. **Streak broken**: Show encouraging message "Start a new streak today!"

---

## 7. AuthFlow (Landing + Google Sign-in)

### Purpose
Handles user authentication and initial partnership linking.

### States

#### LANDING
- **Visual**: Tether branding, "Sign in with Google" button
- **Condition**: No auth session exists

#### AUTHENTICATING
- **Visual**: Google OAuth flow (external)
- **Condition**: User tapped sign-in button

#### LINKING_PARTNER
- **Visual**: "Enter partner code" or "Generate link code"
- **Condition**: Authenticated but no partnership exists

#### AUTHENTICATED
- **Visual**: Redirect to PromptCard
- **Condition**: Valid session + partnership exists

### Data Dependencies

**Auth check on mount**:
```typescript
GET /api/auth/session
Returns: {
  user: User | null
  partnership: Partnership | null
}
```

**Google OAuth**:
```typescript
// Handled by Supabase Auth
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${location.origin}/auth/callback`
  }
})
```

**Partner linking**:
```typescript
POST /api/partnerships/link
Body: { code: string }
OR
POST /api/partnerships/generate
Returns: { code: string, expiresAt: timestamp }
```

### Interactions

1. **Tap "Sign in with Google"** → Launch OAuth flow
2. **OAuth callback** → Create/fetch user, check partnership status
3. **No partnership** → Show link code UI
4. **Enter code** → POST to /api/partnerships/link
5. **Generate code** → POST to /api/partnerships/generate, show code to share

### Visual Design

**Landing page**:
- Centered logo/branding
- "Moment" heading
- Three feature cards using shadcn `Card` (per Figma):
  - "Share moments that matter"
  - "Reveal them together"
  - "Build your streak"
- shadcn `Button` for Google sign-in at bottom

**Link code UI**: Use shadcn `Input`, `Button`, and `Card` components
- Two options: "Enter partner code" or "Generate link code"
- Code input: shadcn `Input` (6-character uppercase, monospace font)
- Generated code: Large display with shadcn `Button` (copy to clipboard)
- "Share this code with your partner"

### Edge Cases

1. **OAuth fails**: Show shadcn `Alert` (destructive) with "Try again" button
2. **Invalid link code**: Show shadcn `Alert` (destructive) "Code not found or expired"
3. **User already has partnership**: Skip linking, go straight to app
4. **Code expires during entry**: Detect on submit, show shadcn `Alert` "Code expired"
5. **Both partners generate codes**: First to link wins, other's code invalidated

---

## shadcn/ui Component Usage

This app uses shadcn/ui primitives throughout. Here's the mapping:

### Core UI Components
- **Button**: All CTAs (Respond, Submit, Continue, Sign in, etc.)
- **Card**: PromptCard, MomentGallery items, feature cards, feedback section
- **Input**: Partner code entry
- **Textarea**: Response input, feedback input
- **Alert**: All error and info messages (use destructive variant for errors)
- **Skeleton**: Loading states for MomentGallery and MomentDetailView
- **ScrollArea**: MomentGallery list container

### Form Components
- **Form**: AuthFlow partner linking
- **FormField**: Individual form inputs with validation

### Icons
- Use lucide-react icons (comes with shadcn):
  - Loading spinner
  - Back arrow
  - Copy button icon
  - Fire emoji alternative for streak (or use emoji)

### Theme Customization Needed
Define these in your shadcn theme config:
- **Primary**: Purple/lavender for OPEN_PROMPT state
- **Destructive**: Red for errors
- **Muted**: Gray for AWAITING_PARTNER state
- **Success**: Green for READY_TO_REVEAL state (custom color)
- **Border radius**: 16px for cards (lg), 12px for smaller cards

---

## Data Flow Summary

### On App Load
1. Check auth session (`/api/auth/session`)
2. If no auth → Show Landing
3. If auth but no partnership → Show Link Partner
4. If authenticated + partnership → Fetch today's moment (`/api/moments/today`)
5. Subscribe to real-time updates on Response table

### On Prompt Interaction
1. User submits response → POST `/api/responses`
2. Real-time triggers partner's UI to update to AWAITING_PARTNER
3. Partner submits → Real-time updates both to READY_TO_REVEAL
4. Either user taps reveal → POST `/api/reveal` (creates RevealStatus record)
5. Both users can now see revealed view

### On Navigation
1. Tap past moment → Fetch from `/api/moments/:id`
2. Gallery scroll → Paginated fetch with offset
3. Week navigation → Fetch week data `/api/moments/week`

---

## Technical Notes

### State Management Approach
- Use React Context for auth state (global)
- Component-level state for UI interactions (local)
- Supabase Realtime for server state sync
- No need for Redux/Zustand given small app scope

### Real-time Subscription Strategy
- Subscribe on PromptCard mount
- Filter by today's promptId
- Unsubscribe on unmount
- Handle reconnection on network recovery

### Mobile Optimizations
- Touch target minimum: 44x44px
- Prevent double-tap zoom on buttons
- Use `touch-action: manipulation` for instant taps
- Lazy load MomentGallery images

### Accessibility
- shadcn/Radix UI components handle ARIA labels, keyboard navigation, and focus management
- Ensure color contrast ratios meet WCAG AA for custom backgrounds (OPEN_PROMPT, READY_TO_REVEAL states)
- Use semantic HTML for custom components