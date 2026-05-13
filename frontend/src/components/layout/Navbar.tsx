"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Terminal, Cpu, BookOpen, PenTool, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass mx-4 mt-4 rounded-2xl"
    >
      <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
        <div className="p-2 bg-primary rounded-xl">
          <Terminal className="w-6 h-6 text-white" />
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Bir Mühendisin Günlüğü
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link href="/notes" className="hover:text-primary transition-colors flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Notlar
        </Link>
        <Link href="/projects" className="hover:text-primary transition-colors flex items-center gap-2">
          <Cpu className="w-4 h-4" /> Projeler
        </Link>
        <Link href="/blog" className="hover:text-primary transition-colors flex items-center gap-2">
          <PenTool className="w-4 h-4" /> Blog
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Button>
            </Link>
            <Button variant="outline" className="glass border-white/10 gap-2" onClick={logout}>
              <LogOut className="w-4 h-4" /> Çıkış Yap
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost">Giriş Yap</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 border-none">
                Kaydol
              </Button>
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
