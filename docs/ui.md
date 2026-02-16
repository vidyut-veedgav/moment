# Moment - Core Pages Specification

## 1. Landing / Sign In Page

**Layout:**
- Centered single-column layout
- Logo/brand name at top
- Three placeholder image boxes in a row (representing app preview/features)
-   Share moments that matter
-   Reveal them together
-   Strengthen your connection
- Primary CTA button below images

**Components:**
- `<header>` - "Moment" branding
- Three `<div>` placeholders - equal width, side by side
- `<Button variant="default">` - Primary action (sign in/get started)

---

## 2. Home Page - Card View (Prompt Response)

**Layout:**
- Top navigation bar with streak tracker (weekly)
- Large centered card container
- Card displays partner's prompt response
- Next/Submit button at bottom right

**Card Structure:**
- Header: "Your partner said..."
- Body: Text content of response (variable length, scrollable if needed)
- Footer area for actions

**Components:**
- `<nav>` - Progress dots indicator
- `<Card>` - Main response container
  - Card header text
  - Card body with response text
  - `<Button>` - "Next" or "Submit" action

**States:**
- Waiting state: "Waiting for next prompt" message
- Active state: Shows partner's response

---

## 3. Response Reveal Page

**Layout:**
- Top progress indicator (same as #2)
- Two-column split layout
- Left column: "You said..." (user's response)
- Right column: "Your partner said..." (partner's response)
- Continue button at bottom right

**Components:**
- `<nav>` - Progress dots
- Two-column grid container
  - `<Card>` - Left: User's response
  - `<Card>` - Right: Partner's response
- `<Button>` - "Continue" action

**Purpose:** Side-by-side comparison of both responses before proceeding

---

## 4. Create Partnership Page

**Layout:**
- Centered single-column layout
- Header: "Create Your Partnership" or "Join a Partnership"
- Two options/tabs:
  - Create new partnership (generates invite link)
  - Join existing partnership (paste invite link/code)

**Create Partnership Flow:**
- User clicks "Create Partnership"
- System generates unique invite link/code
- Display link with copy button
- Share instructions (send to partner via text, email, etc.)
- "Waiting for partner to join..." state

**Join Partnership Flow:**
- Input field for invite link or code
- "Join Partnership" button
- Validates and connects partners

**Components:**
- `<Card>` - Main container for create/join options
- `<Tabs>` or toggle between Create/Join modes
- `<Input>` - For invite code/link
- `<Button>` - Copy link, Create, Join actions
- Toast/notification for successful copy or join

**States:**
- Initial: Choose create or join
- Creating: Show generated link + copy button
- Waiting: "Waiting for partner..." message
- Joined: Success message → redirect to home

---

## 5. History Page

**Layout:**
- Top navigation bar
- Grid or list view of past moments
- Each moment card shows:
  - Prompt text (truncated)
  - Date/timestamp
  - Preview of both responses (or indicator both completed)
- Click to view full reveal

**Components:**
- `<nav>` - Top navigation with back/home button
- Grid/List of `<Card>` items
  - Each card clickable
  - Shows prompt preview
  - Date metadata
  - Status indicator (completed/revealed)
- Filter/sort options (optional):
  - By date (newest/oldest)
  - By prompt category (if applicable)

**Card Structure:**
- Prompt text (1-2 lines, truncated)
- Small text: Date (e.g., "Feb 14, 2026")
- Visual indicator: Both partners responded

**Interaction:**
- Click card → Navigate to reveal page for that moment
- Infinite scroll or pagination for long history
- Empty state: "No moments yet. Create your first one!"