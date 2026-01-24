# Security Audit Report

## 1. File Upload Security
- **Findings**:
    - File size validation (5MB) is currently client-side only. A malicious user could bypass this to upload larger files directly to the storage API, potentially causing DoS or storage quota issues.
    - File extension extraction is naive (`file.name.split('.').pop()`).
    - Banner uploads rely on the `avatars` bucket. While covered by policies, it's semantic confusing.
- **Remediation**:
    - Ensure Supabase Storage bucket configuration enforces `maxFileSize`.
    - Use UUIDs for filenames instead of `Date.now()` to prevent collisions.
    - Validate MIME types against allowed extensions server-side (or in RLS).

## 2. Input Validation (XSS Prevention)
- **Findings**:
    - The `website` field uses `z.string().url()`. While generally safe, explicitly enforcing `http://` or `https://` schemas is recommended to prevent any obscure protocol attacks (e.g., `javascript:` if the validator is loose).
    - React escapes content, mitigating most XSS, but `href` attributes are sensitive sinks.
- **Remediation**:
    - Stricten Zod schema to `refine` URLs to start with `http` or `https`.

## 3. Storage Policies
- **Findings**:
    - RLS policies correctly enforce path isolation: `(storage.foldername(name))[1] = auth.uid()::text`. This is excellent and prevents users from writing to others' folders.
- **Status**: Secure.

## 4. IDOR / Authorization
- **Findings**:
    - `updateProfile` action checks `userId !== user.id`.
    - It also verifies uniqueness of username excluding the current user.
- **Status**: Secure.

## Recommended Actions
1. Update `update-profile.ts` to strictly validate URL protocols.
2. Update `edit-profile-dialog.tsx` to handle filenames more robustly.
