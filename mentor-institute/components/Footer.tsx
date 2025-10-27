import React from 'react';
import { Link } from 'react-router-dom';

const SocialIcon: React.FC<{ href: string; title: string; children: React.ReactNode }> = ({ href, title, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
        <span className="sr-only">{title}</span>
        {children}
    </a>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold">Mentor Institute of Technologies</h3>
            <p className="mt-2 text-gray-300">
              Empowering the next generation of tech leaders with cutting-edge skills and hands-on training.
            </p>
            <p className="mt-2 text-gray-300">
              Navi Mumbai, Maharashtra, India.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link to="/courses" className="text-gray-300 hover:text-white">Courses</Link></li>
              <li><Link to="/gallery" className="text-gray-300 hover:text-white">Workshop</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold">Connect With Us</h4>
            <div className="mt-4 flex space-x-6">
                <SocialIcon href="#" title="Facebook">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                </SocialIcon>
                <SocialIcon href="#" title="Instagram">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" /></svg>
                </SocialIcon>
                <SocialIcon href="#" title="LinkedIn">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </SocialIcon>
                 <SocialIcon href="#" title="YouTube">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </SocialIcon>
                 <SocialIcon href="#" title="WhatsApp">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.42 1.29 4.88L2 22l5.27-1.38c1.41.81 3.02 1.29 4.73 1.29 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.14c-1.51 0-2.95-.41-4.22-1.14l-.3-.18-3.12.82.83-3.04-.2-.32c-.8-1.32-1.23-2.82-1.23-4.38 0-4.51 3.66-8.17 8.17-8.17s8.17 3.66 8.17 8.17-3.67 8.17-8.17 8.17zm4.52-6.13c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2s-1.42-1.74-1.66-2.04-.08-.24.04-.38c.11-.13.24-.34.36-.51.12-.16.16-.28.24-.46.08-.18.04-.34-.02-.46-.06-.12-.54-1.29-.74-1.77s-.4-.41-.54-.41-.28-.01-.38-.01h-.2c-.1 0-.26.04-.4.24-.14.2-.54.66-.54 1.62s.55 1.88.62 2.02c.08.14 1.03 1.73 2.53 2.49.36.18.64.28.86.36.42.16.8.14.98.08.24-.08.74-.3 1.05-.6.31-.28.31-.53.22-.68z" /></svg>
                </SocialIcon>
            </div>
            <p className="mt-4 text-gray-300">Follow us on social media for the latest updates and events.</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Mentor Institute of Technologies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;