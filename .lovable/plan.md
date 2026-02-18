
# Newsletter Subscriber Tool — "NewsletterBot"

## What We're Building

A new tool called **Newsletter Subscriber** that takes a list of website URLs and an email address, then attempts to subscribe the user to newsletters using three progressive approaches:

- **Approach 1 — Known Platform APIs**: For Substack, Beehiiv, and ConvertKit, call their public subscription endpoints directly in the browser (no backend needed — these are public-facing APIs).
- **Approach 2 — Query Parameter Pre-fill**: For generic sites, detect common newsletter embed patterns (Mailchimp, Revue, generic `?email=` forms) and construct a pre-filled URL the tool opens for the user.
- **Approach 3 — Smart Fallback**: For all other sites, open the homepage in a new tab so the user can manually subscribe — but do it in a smart way, showing the user which sites fell through and why.

---

## How Each Approach Works

### Approach 1 — Direct API (Substack & Beehiiv)

These platforms expose a public HTTP POST endpoint that doesn't require authentication:

| Platform | Endpoint Pattern |
|----------|-----------------|
| Substack | `https://{publication}.substack.com/api/v1/free` with `{ email }` body |
| Beehiiv  | `https://www.beehiiv.com/subscribe/{pub_id}` (form POST) |

The tool detects if any pasted URL is a Substack or Beehiiv domain, extracts the publication slug, and fires the subscription request directly from the browser using `fetch()`.

### Approach 2 — Email Pre-fill URL (Mailchimp, etc.)

For known embed platforms, the tool constructs a URL with the email pre-filled:

- **Mailchimp**: `?EMAIL={email}` appended to the subscribe URL
- **Generic sites**: Try `?email={email}` as a query param and open the page

### Approach 3 — Fallback Open

For everything else, open the site in a new tab and display a clear status message: "Opened — manual sign-up needed."

---

## UI Design

The page will have two sections:

1. **Input area** — email field + textarea for URLs (one per line) + a "Subscribe" button
2. **Results table** — one row per URL showing:
   - The website domain
   - Method used (API / Pre-fill / Manual)
   - Status (Success / Opened / Failed)
   - A direct open-link button

---

## Files to Create / Modify

### New File: `src/pages/NewsletterSubscriber.tsx`
The main page containing:
- Email input with validation
- URL textarea (same parse pattern as MultiUrlOpener)
- Platform detection logic
- `fetch()` calls for Substack/Beehiiv
- Results display with status badges

### New File: `src/lib/newsletter-platforms.ts`
A utility file that contains:
- Platform detection functions (`isSubstack`, `isBeehiiv`, `isMailchimp`)
- Subscription logic for each platform
- Type definitions for `SubscriptionResult`

### Modified: `src/App.tsx`
Add route: `<Route path="/newsletter" element={<NewsletterSubscriber />} />`

### Modified: `src/pages/Dashboard.tsx`
Replace one "Coming Soon" tile with the new Newsletter Subscriber tool entry.

---

## Technical Notes

### CORS Consideration
Substack's public API (`/api/v1/free`) accepts cross-origin requests from browsers — it's designed for embeds. Beehiiv's public subscribe form is also cross-origin friendly. If a CORS error occurs for a specific platform, the tool automatically falls back to Approach 3 (open in new tab) and tells the user.

### No Backend Needed
All three approaches run entirely in the browser — no Supabase or edge functions required.

### Captcha Handling
- For Approach 1 (Substack/Beehiiv): These platforms don't show CAPTCHAs on their embedded subscribe endpoints.
- For Approach 2 & 3: Since the user opens the page themselves, any CAPTCHA is handled by the user manually — this is expected and communicated clearly in the UI.

### Platform Detection Logic (in `newsletter-platforms.ts`)
```
URL contains "substack.com"   → Approach 1 (Substack API)
URL contains "beehiiv.com"    → Approach 1 (Beehiiv API)
URL contains "mailchimp.com" or "list-manage.com" → Approach 2 (Pre-fill)
Everything else               → Approach 3 (Open tab)
```

---

## Result Status Badges

| Status | Color | Meaning |
|--------|-------|---------|
| Subscribed | Green | API call succeeded |
| Opened | Amber | Page opened, user must click subscribe |
| Failed | Red | API returned an error |
| Pending | Gray | Not yet processed |

---

## Summary of Changes

1. Create `src/lib/newsletter-platforms.ts` — platform detection + API helpers
2. Create `src/pages/NewsletterSubscriber.tsx` — full UI page
3. Edit `src/App.tsx` — add `/newsletter` route
4. Edit `src/pages/Dashboard.tsx` — add tile replacing first "Coming Soon"
