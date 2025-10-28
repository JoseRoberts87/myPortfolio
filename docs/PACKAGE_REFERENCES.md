# Package Documentation References

**Last Updated**: 2025-10-28

This document maintains links to the official documentation for all packages used in this project. Always refer to these when implementing features to avoid using outdated patterns.

---

## Frontend Framework

### Next.js 16.0.0
- **Official Docs**: https://nextjs.org/docs
- **App Router Docs**: https://nextjs.org/docs/app
- **API Reference**: https://nextjs.org/docs/app/api-reference
- **Migration Guide**: https://nextjs.org/docs/app/building-your-application/upgrading
- **GitHub**: https://github.com/vercel/next.js
- **Release Notes**: https://github.com/vercel/next.js/releases

**Key Concepts**:
- App Router (default in v13+)
- Server Components
- Turbopack (new bundler in v16)
- Route Handlers
- Middleware

### React 19.2.0
- **Official Docs**: https://react.dev/
- **Reference**: https://react.dev/reference/react
- **Blog**: https://react.dev/blog
- **GitHub**: https://github.com/facebook/react
- **What's New in React 19**: https://react.dev/blog/2024/12/05/react-19

**Key Features in v19**:
- Automatic JSX runtime
- React Compiler (experimental)
- Actions
- useOptimistic hook
- use() hook for promises

### TypeScript 5.9.3
- **Official Docs**: https://www.typescriptlang.org/docs/
- **Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html
- **Release Notes**: https://www.typescriptlang.org/docs/handbook/release-notes/overview.html
- **TypeScript 5.9**: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html
- **GitHub**: https://github.com/microsoft/TypeScript

**Useful References**:
- tsconfig.json options: https://www.typescriptlang.org/tsconfig
- Type declarations: https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html

---

## Styling & UI

### Tailwind CSS 4.1.16
- **Official Docs**: https://tailwindcss.com/docs
- **Installation**: https://tailwindcss.com/docs/installation
- **Next.js Guide**: https://tailwindcss.com/docs/installation/framework-guides/nextjs
- **Configuration**: https://tailwindcss.com/docs/configuration
- **Utility Classes**: https://tailwindcss.com/docs/utility-first
- **GitHub**: https://github.com/tailwindlabs/tailwindcss
- **Release Notes**: https://github.com/tailwindlabs/tailwindcss/releases

**⚠️ V4 Breaking Changes**: See `TAILWIND_V4_MIGRATION.md`

### @tailwindcss/postcss
- **NPM Package**: https://www.npmjs.com/package/@tailwindcss/postcss
- **Required for Tailwind v4 PostCSS integration**

### PostCSS 8.5.6
- **Official Docs**: https://postcss.org/
- **GitHub**: https://github.com/postcss/postcss
- **Plugin List**: https://www.postcss.parts/

### Autoprefixer 10.4.21
- **Official Docs**: https://github.com/postcss/autoprefixer
- **Browser Support**: https://github.com/postcss/autoprefixer#browsers

---

## Code Quality

### ESLint 9.38.0
- **Official Docs**: https://eslint.org/docs/latest/
- **Configuration**: https://eslint.org/docs/latest/use/configure/
- **Rules Reference**: https://eslint.org/docs/latest/rules/
- **Migration to v9**: https://eslint.org/docs/latest/use/migrate-to-9.0.0
- **GitHub**: https://github.com/eslint/eslint

### eslint-config-next 16.0.0
- **Documentation**: https://nextjs.org/docs/app/building-your-application/configuring/eslint
- **GitHub**: https://github.com/vercel/next.js/tree/canary/packages/eslint-config-next
- **Includes rules for**: React, React Hooks, Next.js best practices

---

## Planned Backend Stack

### FastAPI (Python)
- **Official Docs**: https://fastapi.tiangolo.com/
- **Tutorial**: https://fastapi.tiangolo.com/tutorial/
- **Deployment**: https://fastapi.tiangolo.com/deployment/
- **GitHub**: https://github.com/tiangolo/fastapi

### PostgreSQL
- **Official Docs**: https://www.postgresql.org/docs/
- **Tutorial**: https://www.postgresql.org/docs/current/tutorial.html

### Prisma ORM
- **Official Docs**: https://www.prisma.io/docs
- **Getting Started**: https://www.prisma.io/docs/getting-started
- **Prisma with Next.js**: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-monorepo
- **GitHub**: https://github.com/prisma/prisma

---

## Planned Data & ML Stack

### Python Data Science
- **pandas**: https://pandas.pydata.org/docs/
- **NumPy**: https://numpy.org/doc/
- **scikit-learn**: https://scikit-learn.org/stable/documentation.html

### Machine Learning
- **TensorFlow**: https://www.tensorflow.org/api_docs/python/tf
- **PyTorch**: https://pytorch.org/docs/stable/index.html
- **Hugging Face Transformers**: https://huggingface.co/docs/transformers/

### Computer Vision
- **OpenCV**: https://docs.opencv.org/
- **YOLO**: https://docs.ultralytics.com/

### Data Visualization (Frontend)
- **Recharts**: https://recharts.org/en-US/
- **D3.js**: https://d3js.org/

---

## Deployment & Infrastructure

### Vercel
- **Official Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://vercel.com/docs/frameworks/nextjs
- **CLI Reference**: https://vercel.com/docs/cli

### Railway
- **Official Docs**: https://docs.railway.app/
- **PostgreSQL**: https://docs.railway.app/databases/postgresql
- **Environment Variables**: https://docs.railway.app/develop/variables

### AWS (Future Migration)
- **AWS Documentation**: https://docs.aws.amazon.com/
- **EC2**: https://docs.aws.amazon.com/ec2/
- **RDS**: https://docs.aws.amazon.com/rds/
- **S3**: https://docs.aws.amazon.com/s3/
- **CloudFront**: https://docs.aws.amazon.com/cloudfront/
- **Route 53**: https://docs.aws.amazon.com/route53/

### Infrastructure as Code
- **Terraform**: https://developer.hashicorp.com/terraform/docs
- **AWS CloudFormation**: https://docs.aws.amazon.com/cloudformation/

### Containers
- **Docker**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/

---

## Version Control & CI/CD

### Git
- **Official Docs**: https://git-scm.com/doc
- **Pro Git Book**: https://git-scm.com/book/en/v2

### GitHub Actions
- **Official Docs**: https://docs.github.com/en/actions
- **Workflow Syntax**: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions

---

## NPM Packages Reference

### Package.json
View all installed packages and versions:
```bash
npm list --depth=0
```

### Check for Updates
```bash
npm outdated
```

### View Package Info
```bash
npm info <package-name>
```

---

## Important Notes

1. **Always Check Current Version**: Package APIs may change between versions. Always verify the documentation matches your installed version.

2. **Breaking Changes**: Pay special attention to major version updates (e.g., v3 → v4) as they often include breaking changes.

3. **Next.js + React Compatibility**: Ensure React version is compatible with Next.js version. Next.js 16 requires React 19+.

4. **TypeScript Versions**: Keep TypeScript updated but test thoroughly as type checking can become stricter.

5. **Tailwind CSS v4**: Major changes from v3. See `TAILWIND_V4_MIGRATION.md` for details.

---

## Update Checklist

When updating packages:
- [ ] Read release notes and migration guides
- [ ] Check for breaking changes
- [ ] Update this reference document
- [ ] Update TECH_STACK.md with new versions
- [ ] Test development build
- [ ] Test production build
- [ ] Update any changed APIs in codebase
- [ ] Commit changes with detailed message

---

## Quick Links

- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
- [Tailwind CSS Components](https://tailwindui.com/components)
- [React Examples](https://react.dev/learn)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Can I Use](https://caniuse.com/) - Browser compatibility
