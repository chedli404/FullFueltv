import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { UserMenu } from '@/components/ui/auth/UserMenu';
import { CartIcon } from '@/components/ui/cart/CartIcon';
import { motion } from 'framer-motion';

const Header = () => {
  const [location] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location === path;
  };

  const closeNav = () => setMobileNavOpen(false);

  const navLinks = [
    { name: 'Videos', path: '/videos' },
    { name: 'Events', path: '/events' },
    { name: 'Music', path: '/music' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' }
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all ${scrolled ? 'bg-black bg-opacity-90 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Logo with 3D rotation animation */}
        <Link to="/" className="flex items-center">
          <motion.div
            className="w-[120px] h-[120px] md:w-[180px] md:h-[180px] relative"
            whileHover={{ 
              scale: 1.1,
              transition: { duration: 0.5 }
            }}
            initial={{ rotate: 0 }}
            animate={{ 
              rotate: 360,
              transition: { 
                duration: 12,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear"
              }
            }}
          >
            <img 
              src="/images/2.png" 
              alt="Full Fuel Logo" 
              className="w-full h-full object-contain" 
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center mt-12">
          <nav className="flex space-x-6 mr-6">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`nav-link text-white uppercase font-medium hover:text-primary transition-colors relative ${isActive(link.path) ? 'text-primary' : ''}`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-primary"></span>
                )}
              </Link>
            ))}
          </nav>
          
          {/* Cart Icon */}
          <div className="mr-3">
            <CartIcon />
          </div>
          
          {/* User Menu / Auth Button */}
          <UserMenu />
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileNavOpen(true)} 
          className="md:hidden text-white focus:outline-none"
          aria-label="Open mobile menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-[#1A1A1A] z-50 p-6 transition-transform duration-300 ${mobileNavOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center mb-8">
          {/* Logo in mobile menu */}
          <motion.div
            className="w-[100px] h-[100px] relative"
            whileHover={{ 
              scale: 1.1,
              transition: { duration: 0.5 }
            }}
            initial={{ rotate: 0 }}
            animate={{ 
              rotate: 360,
              transition: { 
                duration: 12,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear"
              }
            }}
          >
            <img 
              src="/images/3.png" 
              alt="Full Fuel Logo" 
              className="w-full h-full object-contain" 
            />
          </motion.div>
          
          <button 
            onClick={closeNav} 
            className="text-white focus:outline-none"
            aria-label="Close mobile menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col space-y-6">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`text-white uppercase font-medium hover:text-primary transition-colors ${isActive(link.path) ? 'text-primary' : ''}`}
              onClick={closeNav}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        
        {/* User Menu & Cart in Mobile Menu */}
        <div className="mt-8 mb-8 flex items-center">
          <div className="mr-4">
            <CartIcon />
          </div>
          <UserMenu />
        </div>
        
        <div className="mt-4 flex space-x-4">
          <a href="https://www.youtube.com/c/FullFuel" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
          </a>
          <a href="https://www.instagram.com/fullfuel.tv/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="https://www.facebook.com/FullFuel.tv/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
