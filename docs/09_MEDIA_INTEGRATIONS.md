# Media and External Integrations

## 1. itch.io
- Use the official project URL as the canonical play/store destination.
- Use official itch.io embed/widget support only where it works and is appropriate.
- Do not scrape itch.io pages or hotlink assets in violation of provider terms.
- Keep a visible external link as a fallback.
- Do not claim a game can be played inline unless the embed is tested.

## 2. YouTube
- Embed trailers/gameplay using supported YouTube embed URLs.
- Prefer privacy-enhanced embedding where appropriate.
- Lazy-load embeds and use a poster/thumbnail before user interaction.
- Do not autoplay.
- Provide a direct watch link fallback.

## 3. Cover art and screenshots
Initial approach:
1. Accept an image URL or upload through an approved storage path.
2. Validate URL protocol and content type where possible.
3. Use optimized image sizes and lazy loading.
4. Provide fallback artwork if the URL fails.
5. Require submitter confirmation of rights/permission.

Supabase Storage is optional for selected images; do not use it for game binaries or video hosting.

## 4. External link safety
- Allow only expected schemes (`https` preferred).
- Reject `javascript:`, `data:`, and other unsafe schemes for user-supplied links.
- Use safe external-link attributes.
- Do not render arbitrary HTML from user submissions.
- Consider a link-checking process, but do not make publication depend on unreliable external uptime.

## 5. Ownership and attribution
The platform is a showcase, not the owner of student games or third-party media. Attribute creators and respect license/consent requirements. Confirm institutional policy before using official BISCAST branding.
