import { useEffect } from "react";
import type { PageData } from "@deepsel/cms-utils";
import { usePageData, usePageDataStore } from "./pageDataStore";
import { fetchPageData, parseSlugForLangAndPath } from "@deepsel/cms-utils";

interface PageTransitionProps {
  pageData: PageData;
  onPathChange?: (path: string) => void;
  onNavigate?: (url: string, event: MouseEvent) => void;
}

export function PageTransition({ 
  pageData, 
  onPathChange,
  onNavigate
}: PageTransitionProps) {
  // Initialize the page data store
  const { initialize, setPageData } = usePageData(pageData);

  // Client-side navigation function
  const navigateToUrl = async (url: string) => {
    try {
      const { lang, path } = parseSlugForLangAndPath(url);
      const newPageData = await fetchPageData(lang, path);
      
      if ('error' in newPageData || 'notFound' in newPageData) {
        window.location.href = url;
        return;
      }
      
      window.history.pushState(null, '', url);
      setPageData(newPageData);
      onPathChange?.(window.location.pathname);
      
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  useEffect(() => {
    // Initialize with the provided pageData
    initialize(pageData);
    
    // Set global flag to indicate PageTransition is active
    (window as any).pageTransition = true;
    
    return () => {
      (window as any).pageTransition = false;
    };
  }, [pageData, initialize]);

  useEffect(() => {
    // Update document title and meta tags when page data changes
    const { pageData: currentPageData } = usePageDataStore.getState();
    if (!currentPageData) return;

    // Update title
    if (currentPageData.seo_metadata?.title) {
      document.title = currentPageData.seo_metadata.title;
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && currentPageData.seo_metadata?.description) {
      metaDescription.setAttribute('content', currentPageData.seo_metadata.description);
    }

    // Update robots meta tag
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      const robotsContent = currentPageData.seo_metadata?.allow_indexing 
        ? 'index, follow' 
        : 'noindex, nofollow';
      metaRobots.setAttribute('content', robotsContent);
    }

    // Update html lang attribute
    if (currentPageData.lang) {
      document.documentElement.lang = currentPageData.lang;
    }
  }, [pageData]);

  useEffect(() => {
    // Watch for URL path changes (browser back/forward)
    const handlePathChange = async () => {
      const currentPath = window.location.pathname;
      
      try {
        const { lang, path } = parseSlugForLangAndPath(currentPath);
        const newPageData = await fetchPageData(lang, path);
        
        if (!('error' in newPageData) && !('notFound' in newPageData)) {
          setPageData(newPageData);
        }
      } catch (error) {
        console.error("Error fetching page data on path change:", error);
      }
      
      onPathChange?.(currentPath);
    };

    window.addEventListener("popstate", handlePathChange);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handlePathChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handlePathChange();
    };

    return () => {
      window.removeEventListener("popstate", handlePathChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [onPathChange, setPageData]);

  useEffect(() => {
    // Intercept all <a> tag clicks for client-side navigation
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (!link) return;

      const href = link.getAttribute('href');
      
      // Skip if no href or it's an external link
      if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      // Skip if it has target="_blank" or similar
      if (link.target && link.target !== '_self') {
        return;
      }

      // Skip if it's a hash link on the same page
      if (href.startsWith('#')) {
        return;
      }

      // Skip if modifier keys are pressed (allow opening in new tab)
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }

      // Skip if it has download attribute
      if (link.hasAttribute('download')) {
        return;
      }

      // Prevent default navigation and stop propagation
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      // Handle the navigation
      if (onNavigate) {
        onNavigate(href, event);
      } else {
        navigateToUrl(href);
      }
    };

    // Add click listener to document with capture phase to intercept early
    document.addEventListener('click', handleLinkClick, true);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [onNavigate, onPathChange, navigateToUrl]);

  return null;
}
