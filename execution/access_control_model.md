```markdown
# Access Control & Multi-Tenant Model – OpenObserve Assistant  
`/execution/access_control_model.md`

---

## 1. Overview

This document defines how access is scoped for schema, dashboards, and query execution in both MVP and production environments.

It covers:
- Data visibility (streams, dashboards)
- Execution authentication
- Governance roles and approval workflows

---

## 2. Data Visibility Rules

### ✅ MVP Phase

- Users only see **streams and dashboards from their selected deployment**
- Dashboards marked `visibility: public` are **visible across deployments**
- No auth enforcement beyond frontend selection

### 🔒 Production Phase

- Stream and dashboard visibility is strictly scoped by:
  - `org`
  - `deployment`
- Dashboards marked `public` are **only visible within the same deployment**
- Multi-tenant isolation is enforced at all levels

---

## 3. Query Execution Auth

### ✅ MVP Phase

- No token or auth check
- Auth cookies are manually injected into `curl` during onboarding
- All queries run under onboarding script context

### 🔐 Production Phase

- Users authenticate via SSO
- Token is passed via browser cookie or frontend auth header
- Server validates and signs outbound OpenObserve query request

---

## 4. Auth Token Storage

| Phase        | Auth Token Location         |
|--------------|------------------------------|
| **MVP**       | Hardcoded cookie or token in dev script |
| **Production**| Secure cookie in user’s browser via SSO |

---

## 5. Governance & Approval Rights

### Who Can Approve or Deprecate?

| Action               | Role Required            |
|----------------------|--------------------------|
| Mark field as `approved: true`     | Maintainer or Onboarding Reviewer |
| Set `visibility: exposed`          | Maintainer or Onboarding Reviewer |
| Mark `deprecated: true`            | Maintainer or Onboarding Reviewer |

> Contributors cannot approve or publish schema or dashboard items directly.

All changes are proposed via PR and reviewed by an authorized gatekeeper.

---

## 6. Future Extensions

- Fine-grained roles per org (e.g., editor vs reviewer)
- Expiry-based token for external clients
- Field-level access control per user group (optional)

---
```
