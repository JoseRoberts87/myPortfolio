# GitHub Integration - Implementation Outline

## Overview
Add a comprehensive GitHub integration to showcase active development, popular repositories, contribution activity, and coding statistics. This proves to employers that you're an active, skilled developer.

---

## 1. Technical Architecture

### **API Strategy**
**Option A: GitHub REST API (Direct from Frontend)** ✅ RECOMMENDED
- **Why**: No backend needed, free tier: 60 requests/hour (unauthenticated), 5000/hour (authenticated)
- **Endpoint**: `https://api.github.com/users/{username}`
- **Benefits**: Simple, no server costs, real-time data
- **Drawbacks**: Rate limits, client-side only

**Option B: GitHub GraphQL API**
- **Why**: More efficient, single request for multiple data
- **Benefits**: Less rate limit usage, better performance
- **Drawbacks**: More complex queries

**Option C: Backend Proxy (FastAPI)**
- **Why**: Server-side caching, protect API tokens, bypass rate limits
- **Benefits**: Can cache data (update hourly), no rate limit issues
- **Drawbacks**: Requires backend changes

**Decision**: Start with Option A (REST), add caching layer if needed

---

## 2. Data to Display

### **A. User Profile Stats** (Single API call)
```
GET https://api.github.com/users/{username}
```
Response includes:
- Avatar, name, bio, location
- Public repos count
- Followers/Following
- Account creation date
- Profile URL

### **B. Repository List** (Single API call)
```
GET https://api.github.com/users/{username}/repos?sort=updated&per_page=6
```
Display:
- Top 6 repositories (by stars or recent activity)
- Repo name, description
- Stars, forks, watchers
- Primary language
- Last updated date
- Link to repo

### **C. Contribution Activity** (Requires scraping or GraphQL)
**Option 1**: Use GitHub's contribution SVG
```html
<img src="https://ghchart.rshah.org/{username}" />
```
**Option 2**: GitHub GraphQL API for detailed contribution data
**Option 3**: Third-party service (github-readme-stats)

### **D. Language Statistics** (Requires multiple repo calls)
```
GET https://api.github.com/repos/{username}/{repo}/languages
```
Aggregate across all repos to show:
- Top 5 languages by bytes
- Percentage breakdown
- Visual chart (pie or bar)

### **E. Recent Activity** (Single API call)
```
GET https://api.github.com/users/{username}/events/public?per_page=10
```
Show:
- Last 5-10 events (commits, PRs, issues)
- Event type icon
- Repository name
- Time ago

---

## 3. Component Structure

### **File Organization**
```
src/
├── app/
│   └── github/
│       └── page.tsx              # Main GitHub showcase page
├── components/
│   └── GitHub/
│       ├── GitHubProfile.tsx     # Profile card with stats
│       ├── GitHubRepos.tsx       # Repository grid
│       ├── GitHubActivity.tsx    # Recent activity feed
│       ├── GitHubLanguages.tsx   # Language breakdown chart
│       ├── GitHubContributions.tsx # Contribution graph
│       └── GitHubStats.tsx       # Overall stats cards
├── hooks/
│   └── useGitHub.ts              # Custom hook for GitHub API
├── lib/
│   └── github.ts                 # GitHub API service functions
└── types/
    └── github.ts                 # TypeScript types for GitHub data
```

---

## 4. Component Breakdown

### **A. GitHubProfile Component**
**Purpose**: Header card showing profile info
**Layout**:
- Left: Avatar (circular, 120x120)
- Right: Name, username, bio, location
- Stats row: Repos | Followers | Following
- "View on GitHub" button

**Data needed**: User profile API

---

### **B. GitHubStats Component**
**Purpose**: Key metrics in card format (similar to SkillsMatrix)
**Layout**: 4 cards in grid
1. **Total Repositories** - Count + icon
2. **Total Stars** - Sum across all repos
3. **Total Commits** - From contribution API
4. **Active Since** - Years active (2024 - creation year)

**Visualization**: Large number + label + icon

---

### **C. GitHubRepos Component**
**Purpose**: Showcase top/recent repositories
**Layout**: Grid of repo cards (3 columns desktop, 1 mobile)

**Each card shows**:
- Repo name (link)
- Description (truncated to 2 lines)
- Language badge (colored dot + name)
- Stats row: ⭐ Stars | 🍴 Forks | 👁️ Watchers
- Updated: "2 days ago"
- "View Code" button

**Sorting options**:
- Most stars (default)
- Recently updated
- Most forks

**Filter**: Show/hide forks

---

### **D. GitHubContributions Component**
**Purpose**: Contribution heatmap (like GitHub's)
**Options**:
1. Embed GitHub's image: `https://ghchart.rshah.org/{username}`
2. Use `react-github-calendar` library
3. Custom implementation with GraphQL data

**Recommendation**: Use `react-github-calendar` for easy styling

---

### **E. GitHubLanguages Component**
**Purpose**: Show programming language distribution
**Layout**:
- Donut/Pie chart (using Recharts, already installed)
- List view with percentages
- Color-coded by language

**Data processing**:
1. Fetch languages for each public repo
2. Aggregate total bytes per language
3. Calculate percentages
4. Display top 5-7 languages

---

### **F. GitHubActivity Component**
**Purpose**: Recent activity feed
**Layout**: Timeline/list of recent events

**Event types to show**:
- `PushEvent` - "Pushed to {repo}"
- `PullRequestEvent` - "Opened PR in {repo}"
- `IssuesEvent` - "Opened issue in {repo}"
- `CreateEvent` - "Created {repo}"
- `WatchEvent` - "Starred {repo}"

**Display**:
- Icon for event type
- Description
- Repository name (link)
- Time ago (e.g., "2 hours ago")

**Limit**: Show last 10 events

---

## 5. Custom Hook: useGitHub

### **Purpose**: Centralize GitHub API logic

```typescript
// Pseudocode structure
useGitHub(username: string) {
  - useState for data, loading, error
  - useEffect to fetch on mount
  - Return: { profile, repos, activity, loading, error, refetch }
}
```

### **Features**:
- Fetch all data in parallel
- Error handling (rate limits, network errors)
- Loading states
- Caching (localStorage, 1 hour TTL)
- Retry logic

---

## 6. TypeScript Types

### **Define types for**:
```typescript
// github.ts types needed
- GitHubUser (profile data)
- GitHubRepo (repository data)
- GitHubEvent (activity data)
- GitHubLanguages (language stats)
- GitHubStats (aggregated stats)
```

---

## 7. API Service Layer

### **src/lib/github.ts**

Functions to implement:
```typescript
- getGitHubUser(username)
- getGitHubRepos(username, options)
- getGitHubActivity(username)
- getGitHubRepoLanguages(username, repo)
- aggregateLanguageStats(repos)
```

**Error Handling**:
- Rate limit detection (429 status)
- Network errors
- User not found (404)
- Fallback to cached data

**Caching Strategy**:
- Store in localStorage
- TTL: 1 hour
- Key: `github_data_${username}_${timestamp}`

---

## 8. Page Layout (src/app/github/page.tsx)

### **Structure**:
```
1. Hero Section
   - Title: "GitHub Activity"
   - Subtitle: "Explore my open source work and contributions"

2. Profile Section
   - GitHubProfile component (full width card)

3. Stats Section
   - GitHubStats component (4-card grid)

4. Repositories Section
   - Heading + sort/filter controls
   - GitHubRepos component (grid)

5. Activity & Languages (Two columns)
   - Left: GitHubActivity (60% width)
   - Right: GitHubLanguages (40% width)

6. Contribution Graph Section
   - GitHubContributions component (full width)

7. Call-to-Action
   - "View Full Profile on GitHub" button
   - "Star My Repositories" message
```

---

## 9. Styling Approach

### **Use existing patterns**:
- `Section` component for layout sections
- `Card` component with `variant="bordered"`
- `Badge` for language tags
- Existing color scheme (purple accent)
- Dark mode support (already implemented)

### **Charts**:
- Use **Recharts** (already installed for Analytics page)
- Language donut chart
- Activity timeline

### **Icons**:
- Star, fork, eye icons (use emoji or lucide-react)
- GitHub logo

---

## 10. Integration Points

### **A. Add to Homepage** (src/app/page.tsx)
- Add GitHub section after Skills Matrix
- Show mini stats + link to full page
- "View GitHub Activity →" button

### **B. Add to Navigation** (src/components/Header.tsx)
- Add "GitHub" link to nav menu
- Position between "Contact" and other links

### **C. Add to Footer** (src/components/Footer.tsx)
- GitHub icon link in social links section

---

## 11. Configuration

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_GITHUB_USERNAME=JoseRoberts87
GITHUB_ACCESS_TOKEN=ghp_xxx  # Optional, for higher rate limits
```

### **Constants**
```typescript
// src/lib/constants.ts
GITHUB_USERNAME = 'JoseRoberts87'
GITHUB_API_BASE = 'https://api.github.com'
CACHE_TTL = 3600000 // 1 hour
```

---

## 12. Performance Considerations

### **Optimizations**:
1. **Lazy loading**: Load GitHub page on demand
2. **Image optimization**: Use Next.js `<Image>` for avatars
3. **Caching**: LocalStorage with 1-hour TTL
4. **Parallel fetching**: Use `Promise.all()` for multiple APIs
5. **Skeleton screens**: Show loading states
6. **Error boundaries**: Graceful failure handling

### **Rate Limit Strategy**:
- Monitor `X-RateLimit-Remaining` header
- Show warning at 10 requests remaining
- Cache aggressively
- Consider backend proxy if limits hit

---

## 13. Error Handling & Edge Cases

### **Scenarios to handle**:
1. **Rate limit exceeded** (429)
   - Show cached data
   - Display message: "GitHub API rate limit reached. Showing cached data."

2. **Network error**
   - Retry 3 times with exponential backoff
   - Show error message with "Retry" button

3. **No cached data + API error**
   - Show placeholder with message
   - Link to GitHub profile directly

4. **Empty repositories**
   - Show message: "No public repositories yet"

5. **Private repositories**
   - Only show public data
   - Note: "Showing {X} public repositories"

---

## 14. Testing Strategy

### **Unit Tests**:
- API service functions (mock fetch)
- Data aggregation logic (language stats)
- useGitHub hook behavior

### **Integration Tests**:
- Component rendering with mock data
- Error states
- Loading states

### **Manual Testing**:
- Different GitHub usernames
- Rate limit scenarios
- Mobile responsiveness
- Dark/light mode

---

## 15. Implementation Timeline

### **Phase 1: Core (2-3 hours)**
- Set up types and API service
- Create useGitHub hook
- Build GitHubProfile component
- Build GitHubRepos component
- Create basic page layout

### **Phase 2: Stats & Activity (1-2 hours)**
- Build GitHubStats component
- Build GitHubActivity component
- Add caching layer

### **Phase 3: Advanced Features (1-2 hours)**
- Build GitHubLanguages chart
- Add contribution graph
- Add sorting/filtering

### **Phase 4: Integration & Polish (1 hour)**
- Add to homepage
- Add to navigation
- Error handling
- Loading states
- Mobile optimization

**Total estimated time: 5-8 hours**

---

## 16. Dependencies to Install

```bash
# Required
npm install octokit  # Official GitHub API client (optional, simplifies API calls)

# Optional (if using custom contribution graph)
npm install react-github-calendar
npm install date-fns  # For date formatting
```

**Note**: Recharts already installed, will use for language chart

---

## 17. Success Metrics

### **What makes this successful**:
✅ Shows you're actively coding (contributions graph)
✅ Displays quality repos with stars/engagement
✅ Recent activity proves you're current
✅ Language diversity shows versatility
✅ Professional presentation impresses employers
✅ Fast loading (<2 seconds)
✅ Works on mobile
✅ Handles errors gracefully

---

## 18. Future Enhancements

**After initial implementation**:
- Add GitHub Actions status badges to repos
- Show PR/Issue statistics
- Display code review activity
- Add "trending repos" section
- Show contribution streaks
- Add organization repos
- Backend proxy with Redis caching
- GraphQL for efficiency

---

## Summary

This GitHub Integration will:
1. **Prove active development** via contribution graph and recent activity
2. **Showcase quality work** via top repositories with engagement metrics
3. **Display technical breadth** via language distribution
4. **Be professionally presented** using existing UI components and patterns
5. **Load quickly** with caching and parallel fetching
6. **Handle errors gracefully** with fallbacks and user feedback

**Recommended approach**: Start with REST API (Option A), implement core features first (Profile + Repos), then add enhancements (Activity, Languages, Contributions).

---

**Created**: 2025-11-03
**Status**: Ready for implementation
