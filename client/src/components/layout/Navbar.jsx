import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeartbeat, FaBars, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 text-white text-2xl font-black tracking-tight group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 shadow-lg shadow-red-500/30 group-hover:scale-105 transition-transform duration-300">
            <FaHeartbeat className="text-white text-xl animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-extrabold">
            Sankat<span className="text-red-500 font-black">Mochan</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-slate-300 font-medium text-sm">
          {["Home", "Features", "How It Works", "Contact"].map((item) => {
            const href = `#${item.toLowerCase().replace(/\s+/g, "")}`;
            return (
              <li key={item}>
                <a
                  href={href}
                  className="relative py-1 hover:text-white transition duration-200 group flex items-center gap-1"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300 rounded-full" />
                </a>
              </li>
            );
          })}
        </ul>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/50 hover:bg-slate-800/80 hover:border-slate-600 text-slate-200 font-semibold text-sm transition-all duration-200 backdrop-blur-md"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="group px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            <span>Register</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 px-6 py-6 space-y-4 shadow-2xl"
        >
          {["Home", "Features", "How It Works", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "")}`}
              onClick={() => setIsOpen(false)}
              className="block text-slate-300 hover:text-white font-medium text-base py-2 border-b border-slate-900"
            >
              {item}
            </a>
          ))}

          <div className="pt-4 flex flex-col gap-3">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-3 rounded-xl border border-slate-800 bg-slate-900 text-white font-semibold text-sm"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/20"
            >
              Register
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
