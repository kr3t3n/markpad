import React from 'react';

export function Privacy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <h1>Privacy Policy</h1>
        
        <p>Your privacy is important to us. It is Markpad's policy to respect your privacy regarding any information we may collect from you across our website.</p>

        <h2>Information We Collect</h2>
        <p>We only collect information about you if you voluntarily submit that information to us. This information may include:</p>
        <ul>
          <li>Your markdown content (stored locally in your browser)</li>
          <li>Theme preferences</li>
          <li>Layout preferences</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect in various ways, including to:</p>
        <ul>
          <li>Provide, operate, and maintain our website</li>
          <li>Save your preferences for a better experience</li>
          <li>Improve your user experience</li>
        </ul>

        <h2>Data Storage</h2>
        <p>All your markdown content and preferences are stored locally in your browser using cookies and local storage. We do not store any of your data on our servers.</p>

        <h2>Cookies</h2>
        <p>We use cookies to store your preferences and improve your experience. You can choose to disable cookies through your browser settings, but this may affect the functionality of certain features.</p>

        <h2>Third-Party Services</h2>
        <p>We do not share any personally identifying information publicly or with third-parties, except when required to by law.</p>

        <h2>Changes to This Policy</h2>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

        <h2>Contact Us</h2>
        <p>If you have any questions about our Privacy Policy, please contact us at hey@markpad.online.</p>
      </div>
    </div>
  );
}