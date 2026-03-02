import Link from 'next/link';
import { Wifi, Shield, Zap, CircleDollarSign, CheckCircle, ArrowRight, Activity, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      {/* Background Orbs for Depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
              <Wifi size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground">AirLink<span className="text-primary italic">OS</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link href="#about" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Network</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-foreground hover:text-primary transition-colors">Login</Link>
            <Link
              href="/admin/dashboard"
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-widest mb-8 animate-reveal">
              <Zap size={14} className="fill-current" />
              Revolutionizing ISP Management
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-foreground mb-8 tracking-tighter leading-[0.9] animate-reveal">
              The OS for Your <br />
              <span className="gradient-text">Connected Future</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-medium leading-relaxed animate-reveal whitespace-pre-line" style={{ animationDelay: '0.1s' }}>
              Automate subscribers, dominate bandwidth, and secure your network
              with the world&apos;s most sophisticated ISP management platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-reveal" style={{ animationDelay: '0.2s' }}>
              <Link
                href="/login"
                className="group relative px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20"
              >
                Launch Dashboard
                <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-10 py-5 bg-white/5 dark:bg-white/5 border border-border rounded-2xl font-black text-lg hover:bg-white/10 transition-all backdrop-blur-md"
              >
                Client Portal
              </Link>
            </div>

            {/* Float Elements Mockup */}
            <div className="mt-24 relative max-w-5xl mx-auto animate-reveal" style={{ animationDelay: '0.4s' }}>
              <div className="aspect-video glass-card rounded-3xl overflow-hidden relative shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-purple-500/5" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-12 -right-8 glass-card p-6 rounded-2xl animate-float shadow-xl hidden lg:block" style={{ animationDuration: '4s' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center"><Activity /></div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">Revenue Boost</p>
                    <p className="text-xl font-black">+24.8% <span className="text-xs text-green-500">KES 420K</span></p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -left-8 glass-card p-6 rounded-2xl animate-float shadow-xl hidden lg:block" style={{ animationDuration: '5s', animationDelay: '-1s' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><Globe size={24} /></div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">Network Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-lg font-black text-foreground">Global Online</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">Engineered for Scale</h2>
              <p className="text-muted-foreground font-medium text-lg">Every tool you need to run a high-performance ISP.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="text-blue-500" />,
                  title: "Smart Bandwidth",
                  desc: "Integrated MikroTik API control for real-time speed limiting and intelligent subscriber management.",
                  color: "blue"
                },
                {
                  icon: <CircleDollarSign className="text-green-500" />,
                  title: "Auto Billing",
                  desc: "Automated recurring invoices, grace periods, and M-Pesa Express payment reconciliations.",
                  color: "green"
                },
                {
                  icon: <Shield className="text-purple-500" />,
                  title: "Enterprise Shield",
                  desc: "Military-grade RBAC and network encryption ensures your data stays private and secure.",
                  color: "purple"
                }
              ].map((f, i) => (
                <div key={i} className="glass-card p-10 group hover:-translate-y-2 transition-all cursor-default">
                  <div className={`w-16 h-16 bg-${f.color}-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
                  <ul className="mt-8 space-y-3">
                    {['Automated Provisioning', 'Real-time Analytics', 'Cloud Sync'].map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm font-bold text-foreground/70">
                        <CheckCircle size={14} className="text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-border px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black">A</div>
            <span className="text-xl font-black tracking-tighter">AirLink<span className="text-primary">OS</span></span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            © 2026 AirLink ISP Management System. Built for high-performance networks.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors font-bold text-sm">Privacy</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors font-bold text-sm">Terms</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors font-bold text-sm">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
