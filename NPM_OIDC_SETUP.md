# NPM OIDC Setup for GitHub Actions

This repository uses GitHub Actions for automated npm publishing with OpenID Connect (OIDC) support.

## Current Setup

**Workflow**: `.github/workflows/publish.yml`
**Trigger**: Push to git tags matching pattern `v*.*.*` (e.g., `v1.6.1`)
**Publishing Method**: Uses `NPM_TOKEN` secret (traditional method)

## OIDC Configuration (Optional - Enhanced Security)

To enable OIDC-based publishing (no manual token refresh needed):

### 1. Configure OIDC in GitHub Repository

1. Go to repository Settings → Actions → Providers
2. Click "Add Provider"
3. Select **OpenID Connect**
4. Configure:
   - **Provider**: npm
   - **URL**: `https://registry.npmjs.org/`
   - **Client ID**: `npm`

### 2. Configure OIDC in npm Account

1. Go to npm → Account → Access Tokens
2. Click "Create Token" → "Publish" (Automation/Provisioning)
3. Select **"GitHub Actions"** as the provider
4. Configure trust:
   - **Repository**: `jeffersonwarrior/mclaude`
   - **Workflow**: `publish.yml`
5. Generate token

### 3. Add OIDC Token to GitHub

```bash
# In GitHub repository Settings → Secrets and variables → Actions:
# Add new secret:
NPM_TOKEN_OIDC = <oidc-token-from-npm>
```

### 4. Update Workflow (Optional)

To use OIDC instead of stored token, modify `.github/workflows/publish.yml`:

```yaml
- name: Publish to npm with OIDC
  uses: JS-DevTools/npm-publish@v3
  with:
    token: ${{ steps.get-token.outputs.token }}
    provenance: true
```

## Usage

### Publish a New Version

```bash
# Update version
npm version 1.6.2

# Push with tag
git push && git push --tags
```

The GitHub Actions workflow will automatically:
1. Checkout code
2. Install dependencies
3. Build project
4. Run tests
5. Publish to npm

## Benefits

- **No Manual Token Management**: OIDC tokens are short-lived
- **Enhanced Security**: No stored secrets in GitHub
- **Provenance**: Package provenance for verified publishing
- **Automatic**: No manual npm publish needed

## Manual Publishing (Fallback)

If GitHub Actions fails, you can still publish manually:

```bash
# Set npm token
export NPM_TOKEN="your-token-here"
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> ~/.npmrc

# Publish
npm publish
```
