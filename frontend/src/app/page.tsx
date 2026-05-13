"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Code, Zap, Shield, Globe, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 flex flex-col items-center justify-center min-h-screen text-center">
        {/* Background Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] -z-10 animate-pulse" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-primary/20 text-sm font-medium text-primary mb-4">
            <Zap className="w-4 h-4 fill-primary" />
            <span>Yeni Nesil Mühendis Defteri</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-tight">
            Geleceği <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              Not Edin.
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Bir mühendisin ihtiyaç duyduğu her şey tek platformda. Teknik notlar, proje yönetimi, 
            AI destekli kod analizi ve profesyonel blog deneyimi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary-dark group">
              Hemen Başlayın
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg glass border-white/10">
              Nasıl Çalışır?
            </Button>
          </div>
        </motion.div>

        {/* Hero Image / Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-20 w-full max-w-6xl relative"
        >
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/10">
            <Image
              src="/hero.png"
              alt="Engineer Workspace"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
          
          {/* Floating Feature Tags */}
          <div className="absolute -top-6 -left-6 glass p-4 rounded-2xl shadow-xl animate-bounce" style={{ animationDuration: '4s' }}>
            <Code className="text-primary w-6 h-6" />
          </div>
          <div className="absolute top-1/2 -right-8 glass p-4 rounded-2xl shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
            <Globe className="text-accent w-6 h-6" />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="px-8 py-24 bg-surface-muted/50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Her Şey Mühendisler İçin Tasarlandı</h2>
            <p className="text-muted-foreground text-lg">Karmaşık projelerinizi ve fikirlerinizi düzene sokun.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BookOpen className="w-8 h-8 text-primary" />}
              title="Teknik Notlar"
              description="Markdown destekli, hiyerarşik not tutma sistemi ile teknik bilgilerinizi kristalleştirin."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-secondary" />}
              title="AI Destekli"
              description="OpenAI entegrasyonu ile notlarınızı özetleyin ve kod parçacıklarını anında analiz edin."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-accent" />}
              title="Güvenli Veri"
              description="Tüm verileriniz şifrelenmiş olarak saklanır ve sadece size özeldir."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-white/5 text-center text-muted-foreground">
        <p>© 2024 Bir Mühendisin Günlüğü. Tüm hakları saklıdır.</p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-8 rounded-3xl glass border-white/5 hover:border-primary/30 transition-colors group"
    >
      <div className="mb-6 p-4 bg-white/5 rounded-2xl inline-block group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
