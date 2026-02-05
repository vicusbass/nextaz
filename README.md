# necstaz

Wines

## Setup

```bash
npm install
```

This automatically sets up git hooks via `simple-git-hooks` (runs on `npm install` through the `prepare` script).

## Development

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
```

## Code Formatting

Prettier runs automatically on staged files when you commit (via `lint-staged`).

```bash
npm run format        # Format all files
npm run format:check  # Check formatting (CI)
```

## Environment Variables

| Variable | Service | Required |
|---|---|---|
| `SUPABASE_URL` | Supabase | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Yes |
| `RESEND_API_KEY` | Resend | Yes |
| `RESEND_TEMPLATE_CUSTOMER_CONFIRMATION` | Resend | For order emails |
| `RESEND_TEMPLATE_ADMIN_NOTIFICATION` | Resend | For order emails |
| `NETOPIA_API_KEY` | Netopia | For payments |
| `NETOPIA_POS_SIGNATURE` | Netopia | For payments |
| `NETOPIA_PUBLIC_KEY` | Netopia | For IPN verification |
| `NETOPIA_SANDBOX` | Netopia | Set `true` for testing |
| `MAILERLITE_API_KEY` | MailerLite | For newsletter |
