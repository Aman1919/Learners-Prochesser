import  { useEffect } from 'react';

const TawkTo = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/66fda66a37379df10df0f185/1i97d447c'; // New widget URL
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Tawk.to API event handlers to ensure it's loaded before accessing functions
    script.onload = () => {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      // Check if widget is initialized before using its functions
      window.Tawk_API.onLoad = () => {
        if (window.innerWidth < 768) {
          window.Tawk_API.hideWidget();
        }
      };
    };

    // Insert the script into the document
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);

    // Handle widget visibility on resize
    const handleResize = () => {
      if (window.Tawk_API && window.Tawk_API.hideWidget && window.Tawk_API.showWidget) {
        if (window.innerWidth < 768) {
          window.Tawk_API.hideWidget();
        } else {
          window.Tawk_API.showWidget();
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      document.head.removeChild(script); // Cleanup script when component unmounts
      window.removeEventListener('resize', handleResize); // Cleanup resize event listener
    };
  }, []);

  return null; // No visual component, as this is just for embedding the widget
};

export default TawkTo;
