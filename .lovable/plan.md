

## Open Tools as Separate Pages (In-App Navigation)

Currently, clicking a tool on the dashboard opens it in a **new browser tab** (`target="_blank"`). You want it to simply navigate to the tool's page within the same browser tab instead.

### What Changes

**`src/pages/Dashboard.tsx`**
- Replace the `<a>` tag with React Router's `<Link>` component
- Remove `target="_blank"` so clicking navigates to `/pdf-link-genie` or `/gdrive` in the same tab
- The tools already have their own full-page layouts, so they'll display as standalone pages

### Result
- Clicking "PDF Link Genie" on the dashboard takes you to the PDF extractor page
- Clicking "GDrive DL" takes you to the Google Drive downloader page
- Users can use the browser back button to return to the dashboard

