# Git Workflow & Branching Strategy

**Last Updated**: 2025-10-28

This document outlines the Git workflow and branching strategy for the portfolio project.

---

## Branch Structure

### Main Branch
- **`main`** - Production-ready code
- Always stable and deployable
- Protected branch - no direct commits
- All changes come through Pull Requests

### Feature Branches
Created for new features, enhancements, or experiments.

**Naming Convention**: `feature/<feature-name>`

Examples:
- `feature/navigation-components`
- `feature/landing-page`
- `feature/data-pipeline`
- `feature/ml-sentiment-analysis`
- `feature/cv-object-detection`

### Bugfix Branches
Created for fixing bugs or issues.

**Naming Convention**: `bugfix/<issue-description>`

Examples:
- `bugfix/tailwind-postcss-error`
- `bugfix/api-connection-timeout`
- `bugfix/layout-responsive-issues`

### Hotfix Branches
Created for urgent fixes in production.

**Naming Convention**: `hotfix/<issue-description>`

Examples:
- `hotfix/critical-security-patch`
- `hotfix/deployment-failure`

### Refactor Branches
Created for code refactoring without changing functionality.

**Naming Convention**: `refactor/<refactor-description>`

Examples:
- `refactor/component-structure`
- `refactor/api-endpoints`

### Documentation Branches
Created for documentation-only changes.

**Naming Convention**: `docs/<doc-description>`

Examples:
- `docs/api-documentation`
- `docs/deployment-guide`

---

## Workflow Process

### 1. Starting a New Feature

```bash
# Make sure you're on main and up to date
git checkout main
git pull origin main

# Create a new feature branch
git checkout -b feature/navigation-components
```

### 2. Working on the Feature

```bash
# Make changes to files
# ...

# Stage changes
git add <files>

# Commit with descriptive message
git commit -m "Add responsive navigation header component

- Create Header component with mobile menu
- Add navigation links for all sections
- Implement dark mode toggle
- Add smooth scroll behavior

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Continue making commits as needed
```

### 3. Pushing to GitHub

```bash
# Push the branch to GitHub (first time)
git push -u origin feature/navigation-components

# Subsequent pushes
git push
```

### 4. Creating a Pull Request

**After pushing the branch**:
1. **Do NOT create the PR yourself** - The user will create it
2. User will review the changes
3. User may request changes or provide feedback
4. Make requested changes in the same branch
5. Push additional commits to address feedback

### 5. Addressing PR Feedback

```bash
# Make requested changes
# ...

# Commit and push
git add <files>
git commit -m "Address PR feedback: Update navigation styling"
git push

# The PR will automatically update with new commits
```

### 6. After PR is Merged

```bash
# Switch back to main
git checkout main

# Pull the latest changes (including your merged PR)
git pull origin main

# Delete the local feature branch (optional but recommended)
git branch -d feature/navigation-components
```

---

## Commit Message Guidelines

### Format
```
<Short summary (50 chars or less)>

<Detailed description of changes>
- Bullet point 1
- Bullet point 2
- Bullet point 3

<Optional: Related issue or context>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Good Examples

```
Add sentiment analysis ML model endpoint

- Create FastAPI endpoint for sentiment prediction
- Integrate BERT model for text classification
- Add input validation and error handling
- Include confidence scores in response
- Write unit tests for model inference

Resolves data pipeline phase requirements.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
Fix responsive layout issues on mobile devices

- Adjust navigation menu for small screens
- Fix hero section padding on mobile
- Update card grid to stack on mobile
- Test across multiple device sizes

Fixes layout breaking on screens < 640px.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Message Types

- **Add**: New feature or functionality
- **Update**: Changes to existing functionality
- **Fix**: Bug fixes
- **Refactor**: Code restructuring without functionality change
- **Remove**: Deletion of code or features
- **Docs**: Documentation changes
- **Test**: Adding or updating tests
- **Style**: Code style/formatting changes
- **Chore**: Maintenance tasks (dependencies, config, etc.)

---

## Branch Naming Best Practices

### ✅ Good Branch Names
- `feature/user-authentication`
- `bugfix/navbar-overflow`
- `refactor/api-client-structure`
- `docs/installation-guide`
- `feature/ml-model-training`

### ❌ Bad Branch Names
- `fix` (too vague)
- `johns-changes` (personal, not descriptive)
- `temp` (unclear purpose)
- `feature-1` (not descriptive)
- `updates` (too generic)

---

## Working with Multiple Features

### Scenario: Starting a new feature while another is in review

```bash
# Current branch is being reviewed
git checkout main
git pull origin main

# Start new feature from updated main
git checkout -b feature/analytics-dashboard

# Work on new feature independently
# ...
```

### Scenario: Need to update feature branch with latest main

```bash
# Switch to your feature branch
git checkout feature/navigation-components

# Pull latest main
git fetch origin main

# Rebase or merge (prefer rebase for cleaner history)
git rebase origin/main

# Or merge if you prefer
git merge origin/main

# Push updated branch (may need force push if rebased)
git push --force-with-lease
```

---

## Important Rules

### ✅ DO
- Create a new branch for every feature/bugfix
- Use descriptive branch names
- Write clear, detailed commit messages
- Push branches to GitHub when feature is complete
- Keep commits focused and atomic
- Pull latest main before creating new branches
- Test your changes before pushing

### ❌ DON'T
- Commit directly to `main`
- Create PRs yourself (user will do this)
- Push untested code
- Make unrelated changes in the same branch
- Use generic commit messages like "fix stuff" or "updates"
- Work on multiple unrelated features in one branch
- Force push without `--force-with-lease` (can lose work)

---

## Branch Lifecycle Example

```
main (v1.0)
  |
  ├─> feature/navigation-components
  |     ├─ commit: Add Header component
  |     ├─ commit: Add navigation links
  |     ├─ commit: Implement mobile menu
  |     └─ push to GitHub
  |        └─ [USER CREATES PR]
  |           └─ [USER REVIEWS & MERGES]
  |              └─ merged back to main (v1.1)
  |
  └─> feature/landing-page (starts from v1.1)
        ├─ commit: Design hero section
        ├─ commit: Add CTA buttons
        └─ ...
```

---

## Tools & Commands Reference

### Check current branch
```bash
git branch
```

### View all branches (including remote)
```bash
git branch -a
```

### Delete local branch
```bash
git branch -d feature/old-feature
```

### Delete remote branch (after PR merge)
```bash
git push origin --delete feature/old-feature
```

### View commit history
```bash
git log --oneline --graph --all
```

### Check branch status
```bash
git status
```

### View remote branches
```bash
git remote -v
git branch -r
```

---

## Checklist for Each Feature

- [ ] Create feature branch from latest `main`
- [ ] Implement feature with focused commits
- [ ] Test changes locally
- [ ] Update relevant documentation
- [ ] Update TODO.md if needed
- [ ] Push branch to GitHub
- [ ] Wait for user to create PR
- [ ] Address any PR feedback
- [ ] After merge, pull latest main
- [ ] Delete local feature branch

---

## GitHub Integration

### Setting Up Remote Tracking

```bash
# Check current remotes
git remote -v

# Should show:
# origin  https://github.com/username/portfolio.git (fetch)
# origin  https://github.com/username/portfolio.git (push)
```

### Pushing New Branch for First Time

```bash
# -u sets upstream tracking
git push -u origin feature/navigation-components

# Subsequent pushes just need:
git push
```

---

## Emergency Procedures

### Accidentally Committed to Main

```bash
# Don't push! Move commits to new branch
git branch feature/accidental-commits
git reset --hard origin/main
git checkout feature/accidental-commits
```

### Need to Undo Last Commit (Not Pushed)

```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes and undo commit
git reset --hard HEAD~1
```

### Pushed Wrong Changes

```bash
# If no one else has pulled:
git revert <commit-hash>
git push

# Contact user before force pushing!
```

---

## Summary

1. **Always work in feature branches**
2. **Push completed features to GitHub**
3. **User creates and manages PRs**
4. **Address feedback in the same branch**
5. **Keep main branch clean and stable**

This workflow ensures code quality through review while maintaining a clean, organized repository structure.
