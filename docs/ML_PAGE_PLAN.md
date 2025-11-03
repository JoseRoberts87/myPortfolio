# Machine Learning Page Implementation Plan

## Overview
Build out the Machine Learning expertise page to showcase sentiment analysis and NLP capabilities. This will complete the final expertise area of the portfolio (making it 100% feature-complete).

## Implementation Approach: Option A (Lightweight)

### Core Strategy
- Use pre-trained HuggingFace model (client-side inference via Transformers.js)
- Fast time to completion
- No backend ML endpoint required initially
- Integrate with existing Reddit posts data via backend API

## Feature Breakdown

### 1. Interactive Sentiment Classifier ✅
**Status**: Pending
**Components**:
- Text input area with placeholder examples
- Real-time sentiment prediction (Positive/Neutral/Negative)
- Confidence scores displayed as progress bars
- Example texts button to try pre-defined samples
- Prediction latency display

**Technical**:
- Use Transformers.js with `distilbert-base-uncased-finetuned-sst-2-english` model
- Client-side inference (no backend calls)
- React hook for model management: `useMLModel.ts`

### 2. Model Performance Dashboard ✅
**Status**: Pending
**Components**:
- Key metrics cards: Accuracy, Precision, Recall, F1-Score
- Confusion matrix visualization (Recharts heatmap)
- Dataset statistics display

**Technical**:
- Static metrics from model's evaluation report
- Recharts for confusion matrix visualization
- Metrics data stored in component or constants file

### 3. Explainability/Feature Analysis ✅
**Status**: Pending
**Components**:
- Word clouds for each sentiment class (Positive/Neutral/Negative)
- Top features list with importance weights
- Visual explanation of model reasoning

**Technical**:
- `react-wordcloud` library for word clouds
- Static feature importance data (from model analysis)
- Color-coded by sentiment type

### 4. Live Predictions on Real Data ✅
**Status**: Pending
**Components**:
- Display random Reddit post from database
- Show predicted sentiment with confidence
- Compare to actual sentiment (if available)
- "Try Another Post" button

**Technical**:
- Backend API call: `GET /api/v1/reddit/posts?limit=1&random=true`
- Client-side prediction on fetched post
- Comparison logic if ground truth available

### 5. Hero Section & Technical Details ✅
**Status**: Pending
**Components**:
- Page title and description
- Tech stack badges (HuggingFace, Transformers, BERT, PyTorch, etc.)
- Model architecture description
- Training approach overview
- Deployment strategy notes

## File Structure

```
src/
├── app/
│   └── machine-learning/
│       └── page.tsx                    # Main ML page
├── components/
│   └── MachineLearning/
│       ├── SentimentClassifier.tsx     # Interactive text input demo
│       ├── ModelMetrics.tsx            # Performance dashboard
│       ├── ConfusionMatrix.tsx         # Confusion matrix chart
│       ├── WordCloudSection.tsx        # Word clouds for sentiment
│       ├── LivePredictions.tsx         # Reddit post predictions
│       └── TechStack.tsx               # Tech details section
├── hooks/
│   └── useMLModel.ts                   # Hook for model loading/inference
├── lib/
│   └── mlModelData.ts                  # Static metrics, features data
└── types/
    └── ml.ts                           # TypeScript types for ML data

docs/
└── ML_PAGE_PLAN.md                     # This file
```

## Dependencies to Install

```bash
npm install @xenova/transformers
npm install react-wordcloud d3-cloud
```

## Implementation Phases

### Phase 1: Setup & Dependencies ⏳
- [ ] Install Transformers.js and word cloud libraries
- [ ] Create directory structure
- [ ] Define TypeScript types
- [ ] Create static model metrics data

### Phase 2: Core ML Inference ⏳
- [ ] Build `useMLModel` hook for Transformers.js
- [ ] Test model loading and inference
- [ ] Create `SentimentClassifier` component
- [ ] Add example texts and real-time prediction

### Phase 3: Visualizations ⏳
- [ ] Create `ModelMetrics` component with metrics cards
- [ ] Build `ConfusionMatrix` component with Recharts
- [ ] Implement `WordCloudSection` with react-wordcloud
- [ ] Style all visualization components

### Phase 4: Live Predictions ⏳
- [ ] Create `LivePredictions` component
- [ ] Integrate with Reddit posts API
- [ ] Add comparison logic (predicted vs actual)
- [ ] Add "Try Another Post" functionality

### Phase 5: Page Assembly & Polish ⏳
- [ ] Create main `page.tsx` for machine-learning route
- [ ] Assemble all components into page layout
- [ ] Add hero section with tech stack
- [ ] Add loading states and error handling
- [ ] Responsive design adjustments
- [ ] Test across different devices

### Phase 6: Testing & Documentation ⏳
- [ ] Manual testing of all features
- [ ] Cross-browser testing
- [ ] Update CLAUDE.md with ML page details
- [ ] Create PR and merge

## Success Criteria

- [ ] Users can input text and get real-time sentiment predictions
- [ ] Confidence scores are clearly displayed
- [ ] Model performance metrics are professionally presented
- [ ] Word clouds provide visual insight into sentiment features
- [ ] Live Reddit post predictions work smoothly
- [ ] Page matches design quality of other expertise pages
- [ ] All interactions are responsive and performant
- [ ] No console errors or warnings

## Future Enhancements (Post-MVP)

- Fine-tune model on actual Reddit dataset
- Add backend ML endpoint for server-side inference
- Implement SHAP values for better explainability
- Add model versioning and A/B testing
- Support multiple languages
- Add batch prediction mode
- Training/validation loss curves
- Real-time model retraining demo

## Notes

- Model will load on first use (may take 2-3 seconds)
- Show loading indicator during model initialization
- Consider caching model in browser storage
- Use lazy loading for heavy components
- Keep bundle size reasonable (Transformers.js is ~3-4MB)

## Timeline Estimate

- **Phase 1-2**: 2-3 hours
- **Phase 3-4**: 2-3 hours
- **Phase 5-6**: 1-2 hours
- **Total**: 5-8 hours of development time

---

**Status Legend**:
- ✅ Planned
- ⏳ In Progress
- ✔️ Complete
- ⚠️ Blocked
- ❌ Cancelled
