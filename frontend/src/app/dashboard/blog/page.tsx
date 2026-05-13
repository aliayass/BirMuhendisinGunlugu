"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Rocket, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BlogPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 relative">
      <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass border border-white/10 rounded-3xl p-12 max-w-2xl text-center space-y-6 relative z-10"
      >
        <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full flex items-center justify-center border border-white/5 mb-6">
          <PenTool className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-4xl font-black tracking-tight">Blog Yönetimi <span className="text-primary">Yakında!</span></h1>
        
        <p className="text-lg text-muted-foreground leading-relaxed">
          Kişisel notlarınızı ve projelerinizi dış dünyayla paylaşabileceğiniz, modern okuma deneyimi sunan Blog modülü şu anda yapım aşamasında. 
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-accent font-medium py-4">
          <Rocket className="w-5 h-5 animate-pulse" />
          <span>Bir sonraki fazda aktif edilecek.</span>
        </div>

        <Link href="/dashboard" className="inline-block mt-4">
          <Button variant="outline" className="rounded-xl border-white/10 glass hover:bg-white/5 gap-2 px-8 h-12">
            <ArrowLeft className="w-4 h-4" /> Genel Bakışa Dön
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
