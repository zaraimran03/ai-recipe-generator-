import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full py-8 px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-4 border-t border-outline-variant/20 bg-surface">
      <span className="font-body-md text-body-md text-on-surface-variant">© 2024 AI Recipe Generator. Crafted for taste.</span>
      <div className="flex gap-6">
        <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="#">Privacy Policy</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="#">Terms of Service</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="#">Support</a>
      </div>
    </footer>
  );
};

export default Footer;
