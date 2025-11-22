# @deepsel/deep-cms-react

React-specific utilities and hooks for DeepCMS themes.

## Installation

```bash
npm install @deepsel/deep-cms-react
```

## Features

- **React Hooks**: Custom hooks for language management, navigation, and page data
- **Components**: PageTransition component for client-side routing
- **State Management**: Zustand-based page data store

## Usage

### useLanguage Hook

```tsx
import { useLanguage } from '@deepsel/deep-cms-react';

function LanguageSwitcher() {
  const { language, setLanguage, availableLanguages } = useLanguage();
  
  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      {availableLanguages.map(lang => (
        <option key={lang.iso_code} value={lang.iso_code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### useNavigation Hook

```tsx
import { useNavigation } from '@deepsel/deep-cms-react';

function MyLink({ href, children }) {
  const { navigate } = useNavigation();
  
  return (
    <a href={href} onClick={(e) => {
      e.preventDefault();
      navigate(href);
    }}>
      {children}
    </a>
  );
}
```

### PageTransition Component

```tsx
import { PageTransition } from '@deepsel/deep-cms-react';

function App({ pageData }) {
  return (
    <>
      <PageTransition pageData={pageData} />
      {/* Your app content */}
    </>
  );
}
```

### usePageData Hook

```tsx
import { usePageData } from '@deepsel/deep-cms-react';

function MyComponent() {
  const { pageData, setPageData } = usePageData();
  
  return (
    <div>
      <h1>{pageData?.title}</h1>
    </div>
  );
}
```

## Dependencies

This package depends on `@deepsel/cms-utils` for framework-agnostic utilities.

## License

MIT
