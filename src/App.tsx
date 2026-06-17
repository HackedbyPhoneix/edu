/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  GraduationCap,
  Globe,
  Search,
  Award,
  BookOpen,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  FileText,
  Check,
  Plus,
  Phone,
  Mail,
  User,
  Clock,
  ChevronRight,
  MessageSquare,
  Star,
  Percent,
  X,
  FileCheck2,
  CheckSquare
} from 'lucide-react';
import { COUNTRIES, UNIVERSITIES, INITIAL_CHECKLIST, SUCCESS_STORIES, MOCK_BOT_RESPONSES } from './data';
import { CountryInfo, University, ChecklistItem, ChatMessage, SuccessStory } from './types';

// Asset path from the generated background image
const BG_IMAGE = "/src/assets/images/education_bg_1781722103722.jpg";

export default function App() {
  // Navigation active links (Scroll-to or view filters)
  const [activeSection, setActiveSection] = useState('home');

  // Interactive Dest Advisor State
  const [selectedCountryId, setSelectedCountryId] = useState<string>('usa');
  const activeCountry = COUNTRIES.find(c => c.id === selectedCountryId) || COUNTRIES[0];

  // Scholarship Simulator States
  const [gpa, setGpa] = useState<number>(3.5);
  const [ielts, setIelts] = useState<number>(6.5);
  const [acadLevel, setAcadLevel] = useState<'undergraduate' | 'postgraduate' | 'phd'>('postgraduate');
  const [extraCur, setExtraCur] = useState<'low' | 'mid' | 'high'>('mid');
  const [targetSearchUniversity, setTargetSearchUniversity] = useState('');

  // Document Checklist States
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Ivy Advisor Chat States
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'advisor',
      text: "Greetings! I'm Dr. Alistair, your AI Academic Advisor. Whether you're curious about scholarships, country visas, or GPA requirements, I'm here to map your trajectory. What destination or program do you have in mind today?",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAdvisorTyping, setIsAdvisorTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Free Counseling Form States
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    targetCountry: 'usa',
    qualification: 'Bachelor Degree (Completed)',
    fieldOfStudy: 'Engineering & Technology',
    additionalNotes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // University Search query helper
  const filteredUniversities = UNIVERSITIES.filter(uni => {
    const matchesCountry = uni.country === selectedCountryId;
    const matchesSearch = uni.name.toLowerCase().includes(targetSearchUniversity.toLowerCase()) || 
                          uni.city.toLowerCase().includes(targetSearchUniversity.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  // Calculate scholarship match logic
  const calculateScholarshipEligibility = (uni: University) => {
    let score = 0;
    
    // GPA contribution (max 40)
    const gpaDiff = gpa - uni.minGpa;
    if (gpaDiff >= 0.4) score += 40;
    else if (gpaDiff >= 0.1) score += 30;
    else if (gpaDiff >= -0.2) score += 20;
    else score += 10;

    // IELTS contribution (max 30)
    const ieltsDiff = ielts - uni.minIelts;
    if (ieltsDiff >= 1.0) score += 30;
    else if (ieltsDiff >= 0.0) score += 20;
    else if (ieltsDiff >= -0.5) score += 10;
    else score += 5;

    // Extra-Curriculars contribution (max 30)
    if (extraCur === 'high') score += 30;
    else if (extraCur === 'mid') score += 20;
    else score += 10;

    // Scale final waiver prediction %
    const predictedWaiver = Math.min(100, Math.max(10, Math.round(score)));
    return predictedWaiver;
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAdvisorTyping]);

  // Handle document file upload emulation
  const handleUploadClick = (id: string) => {
    setUploadStatus(id);
    setTimeout(() => {
      setChecklist(prev =>
        prev.map(item => {
          if (item.id === id) {
            const files = ['academic_record_final.pdf', 'academic_sop_revised_v2.pdf', 'recommendation_letter_stamped.pdf', 'ielts_report_signed.pdf', 'passport_scan_hd.pdf', 'resume_academic_2026.pdf'];
            const fileSizes = ['2.4 MB', '1.1 MB', '850 KB', '1.6 MB', '3.1 MB', '950 KB'];
            const index = Math.floor(Math.random() * files.length);
            return {
              ...item,
              uploaded: true,
              fileName: files[index],
              fileSize: fileSizes[index]
            };
          }
          return item;
        })
      );
      setUploadStatus(null);
    }, 1200);
  };

  const handleResetChecklist = () => {
    setChecklist(prev => prev.map(item => ({ ...item, uploaded: false, fileName: undefined, fileSize: undefined })));
  };

  // Calculate profile completeness %
  const totalRequiredDocs = checklist.filter(d => d.required).length;
  const uploadedRequiredDocs = checklist.filter(d => d.required && d.uploaded).length;
  const docsCompletenessScore = Math.round((uploadedRequiredDocs / totalRequiredDocs) * 100);

  // Send smart response in advisor portal
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'student',
      text: chatInput,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMsg]);
    const currentInput = chatInput.toLowerCase();
    setChatInput('');
    setIsAdvisorTyping(true);

    setTimeout(() => {
      let responseText = '';
      
      // Look up defined responses in data.ts
      const match = MOCK_BOT_RESPONSES.find(res =>
        res.keywords.some(keywords => currentInput.includes(keywords))
      );

      if (match) {
        responseText = match.answer;
      } else {
        // Compose personalized response referencing user metrics
        const preferredCountryName = COUNTRIES.find(c => c.id === selectedCountryId)?.name || 'your destination';
        responseText = `Splendid query regarding university programs. Based on your active dashboard telemetry (GPA: ${gpa}/4.0, English competency score: IELTS ${ielts}, seeking ${acadLevel} training with ${extraCur} co-curricular records), you possess very competitive prospects in institutions across ${preferredCountryName}! 

I highly recommend starting with specialized programs at institutions like ${filteredUniversities[0]?.name || 'our partner schools'} where your profile yields an estimated ${filteredUniversities[0] ? calculateScholarshipEligibility(filteredUniversities[0]) : 70}% scholarship premium.

Would you like resource assistance compiled for tuition funding applications or student visa entry procedures? Let me know!`;
      }

      setChatHistory(prev => [
        ...prev,
        {
          id: `advisor-${Date.now()}`,
          sender: 'advisor',
          text: responseText,
          timestamp: new Date()
        }
      ]);
      setIsAdvisorTyping(false);
    }, 1800);
  };

  // Handle consultation form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingForm(true);

    setTimeout(() => {
      setIsSubmittingForm(false);
      setFormSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen text-gray-100 font-sans selection:bg-brand-gold-glow selection:text-brand-emerald-dark bg-brand-emerald-dark relative overflow-x-hidden">
      
      {/* Absolute Ambient Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-25 contrast-125"
          style={{ backgroundImage: `url(${BG_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-emerald-dark/95 via-brand-emerald-dark/85 to-brand-emerald-dark" />
        <div className="absolute top-[20%] left-[10%] w-[45vw] h-[45vw] bg-brand-emerald-bright/5 rounded-full filter blur-[150px]" />
        <div className="absolute top-[60%] right-[5%] w-[35vw] h-[35vw] bg-brand-gold-glow/5 rounded-full filter blur-[120px]" />
      </div>

      {/* Floating Sparkle Elements decoration similar to the picture backdrop */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <div className="absolute top-24 left-1/4 w-1 h-32 bg-gradient-to-b from-brand-gold-rich/40 to-transparent animate-pulse-gold" />
        <div className="absolute top-48 right-1/4 w-1 h-44 bg-gradient-to-b from-brand-gold-rich/30 to-transparent animate-pulse-gold delay-1000" />
        <div className="absolute top-1/3 left-10 w-2 h-2 rounded-full bg-brand-gold-pale/30 animate-ping" />
        <div className="absolute top-2/3 right-12 w-2 h-2 rounded-full bg-brand-emerald-bright/30 animate-pulse" />
      </div>

      {/* Primary Header Glassmorphism */}
      <header className="sticky top-0 z-50 w-full px-4 lg:px-12 py-4 select-none">
        <nav className="max-w-7xl mx-auto flex items-center justify-between glass-premium rounded-2xl px-6 py-4.5 transition-all duration-300 hover:border-brand-gold-rich/40 shadow-2xl" id="main-nav">
          
          {/* Logo Brand matching the unique logo vibe of Green Genesis */}
          <a href="#home" className="flex items-center gap-3 active:scale-95 transition-transform group" id="nav-brand">
            <div className="p-2.5 bg-brand-gold-rich/10 rounded-xl border border-brand-gold-rich/30 flex items-center justify-center group-hover:border-brand-gold-rich/60 transition-colors">
              <Globe className="w-6 h-6 text-brand-gold-rich animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-widest text-[#ffffff] group-hover:text-brand-gold-rich transition-colors">EDU COMPASS</span>
              <span className="font-mono text-[9px] tracking-widest text-brand-gold-rich/80 uppercase font-semibold">Global Prestige Services</span>
            </div>
          </a>

          {/* Nav Links Desktop */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2.5">
            {[
              { id: 'home', label: 'Home' },
              { id: 'destinations', label: 'Destinations' },
              { id: 'scholarships', label: 'Scholarships' },
              { id: 'documents', label: 'Document Review' },
              { id: 'expert-chat', label: 'Ivy Advisor' },
              { id: 'stories', label: 'Success' }
            ].map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-2 text-[11px] font-bold tracking-widest uppercase rounded-xl transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'text-brand-gold-rich bg-brand-gold-rich/10 border-b-2 border-brand-gold-rich' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5 hover:scale-102'
                }`}
                id={`lnk-${item.id}`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Action Button Headers */}
          <div className="flex items-center gap-3">
            <a 
              href="#apply-form" 
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl border border-brand-gold-rich/50 text-brand-gold-rich hover:bg-brand-gold-rich hover:text-brand-emerald-dark transition-all duration-300 active:scale-95"
              id="btn-nav-assess"
            >
              <span>AUDIT FILE</span>
              <FileCheck2 className="w-3.5 h-3.5" />
            </a>
            <a 
              href="#expert-chat" 
              className="px-5 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl bg-gradient-to-r from-brand-gold-rich to-brand-gold-glow text-brand-emerald-dark shadow-xl hover:shadow-brand-gold-rich/40 hover:scale-105 transition-all duration-300 active:scale-95 flex items-center gap-1.5"
              id="btn-nav-consult"
            >
              <span>ADVISOR</span>
              <Sparkles className="w-3.5 h-3.5" />
            </a>
          </div>

        </nav>
      </header>

      {/* Main Body Layout */}
      <main className="max-w-7xl mx-auto px-4 lg:px-12 py-2 relative z-20">

        {/* Section 1: Hero Graphic Banner Space */}
        <section id="home" className="pt-12 pb-20 md:pt-20 md:pb-32 flex flex-col items-center justify-center text-center">
          
          {/* Typographic Centered Masterpiece styled with structural organic elements mimicking the Reference Image logo */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative select-none max-w-4xl"
            id="hero-logo-container"
          >
            {/* Elegant luxury gold badge */}
            <div className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-brand-gold-rich/8 border border-brand-gold-rich/30 font-mono text-[10px] text-brand-gold-pale uppercase tracking-[0.18em] mb-8 animate-float">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-rich animate-pulse-gold" />
              <span className="font-bold">PREMIUM ACADEMIC PATHWAY ALLIANCE v4.1</span>
            </div>

            {/* glowing gold backplane ring */}
            <div className="absolute inset-x-0 top-1/4 h-3/4 bg-brand-gold-rich/5 rounded-full filter blur-[60px] mix-blend-screen scale-75 animate-pulse" />

            <h1 className="font-serif text-6xl sm:text-8xl md:text-9xl tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#ecdcb5] to-[#a08f65] flex flex-col items-center justify-center font-black">
              
              {/* Top main display block */}
              <span className="relative z-10 select-none block tracking-tight filter drop-shadow-2xl glow-text-gold">
                EDUCOMPASS
              </span>

              {/* Bottom stylized custom text banner with vector line decoration */}
              <span className="text-xl sm:text-2xl md:text-3xl font-serif text-brand-gold-rich tracking-[0.35em] uppercase mt-4 block relative text-center">
                <span className="absolute -left-12 top-1/2 w-8 h-[1px] bg-brand-gold-rich/40 hidden sm:block" />
                GLOBAL GATEWAY
                <span className="absolute -right-12 top-1/2 w-8 h-[1px] bg-brand-gold-rich/40 hidden sm:block" />
              </span>

            </h1>

            {/* Subtext description aligned for international education consultancy */}
            <p className="mt-10 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-200 font-light leading-relaxed tracking-wide px-4">
              Beautifully mapping trajectories to elite world-class universities. Let our predictive criteria criteria engine align your transcript assets to prestigious scholarships and direct work visas.
            </p>

            {/* Hero Interactive Buttons Group */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="#scholarships" 
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-gold-rich via-brand-gold-glow to-brand-gold-rich text-brand-emerald-dark font-black tracking-widest uppercase rounded-xl shadow-2xl hover:shadow-brand-gold-rich/40 hover:scale-105 active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 font-sans"
              >
                <span>EVALUATE SCHOLARSHIPS</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </a>
              <a 
                href="#expert-chat" 
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:border-brand-gold-rich/40 text-white font-bold tracking-widest uppercase rounded-xl hover:bg-white/10 hover:scale-105 duration-200 transition-all flex items-center justify-center gap-2 font-sans"
              >
                <span>TALK WITH ALISTAIR</span>
                <MessageSquare className="w-4 h-4 text-brand-gold-rich" />
              </a>
            </div>

          </motion.div>

          {/* Dynamic Quick Metrics Tracker Bar (Mimicking the Event stats bar in the reference image) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-full max-w-5xl mt-16 sm:mt-24 glassmorphism rounded-[32px] p-6 sm:p-10 grid grid-cols-2 lg:grid-cols-4 gap-6 tracking-tight relative overflow-hidden"
            id="quick-stats-bar"
          >
            {/* Elegant luxury gold background line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold-rich/50 to-transparent" />
            
            <div className="text-center group border-r border-white/5 py-2">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-brand-gold-rich/10 rounded-2xl text-brand-gold-rich group-hover:scale-110 transition-transform group-hover:bg-brand-gold-rich/20 duration-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>
              <div className="font-mono text-4xl font-extrabold text-white tracking-tighter" id="stat-uni">700+</div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 uppercase mt-2">Prestige Universities</div>
            </div>

            <div className="text-center group sm:border-r border-white/5 py-2">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-brand-gold-rich/10 rounded-2xl text-brand-gold-rich group-hover:scale-110 transition-transform group-hover:bg-brand-gold-rich/20 duration-300">
                  <Globe className="w-6 h-6" />
                </div>
              </div>
              <div className="font-mono text-4xl font-extrabold text-white tracking-tighter" id="stat-countries">12+</div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 uppercase mt-2">Study Countries</div>
            </div>

            <div className="text-center group border-r border-white/5 py-2">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-brand-gold-rich/10 rounded-2xl text-brand-gold-rich group-hover:scale-110 transition-transform group-hover:bg-brand-gold-rich/20 duration-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <div className="font-mono text-4xl font-extrabold text-white tracking-tighter" id="stat-visa">98.2%</div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 uppercase mt-2">Visa Success Ratio</div>
            </div>

            <div className="text-center group py-2">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-brand-gold-rich/10 rounded-2xl text-brand-gold-rich group-hover:scale-110 transition-transform group-hover:bg-brand-gold-rich/20 duration-300">
                  <Award className="w-6 h-6" />
                </div>
              </div>
              <div className="font-mono text-4xl font-extrabold text-white tracking-tighter" id="stat-scholar">$15M+</div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 uppercase mt-2">Scholarships Secured</div>
            </div>

          </motion.div>

        </section>

        {/* Section 2: Global Destinations Explorer & Active Country Advisor */}
        <section id="destinations" className="py-16 border-t border-brand-gold-rich/10">
          
          {/* Header titles */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 text-brand-gold-rich font-mono text-xs font-bold tracking-widest uppercase mb-2">
                <Compass className="w-4 h-4 text-brand-gold-rich animate-pulse" />
                <span>Admission Pathways</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#f3f4f6] tracking-tight">
                Global Destination Explorer
              </h2>
              <p className="text-sm text-gray-400 mt-2 max-w-xl">
                Select your premier geographic target to query local living grades, study visa estimates, post-study work rules, and popular specialized courses.
              </p>
            </div>

            {/* Micro Quick Search country identifier search bar */}
            <div className="relative mt-4 md:mt-0 max-w-xs w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search country programs..."
                value={targetSearchUniversity}
                onChange={(e) => setTargetSearchUniversity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-brand-emerald-dark/45 border border-brand-gold-rich/20 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold-rich focus:ring-1 focus:ring-brand-gold-rich/35 transition-all"
              />
              {targetSearchUniversity && (
                <button onClick={() => setTargetSearchUniversity('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Main Grid for Destinations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
            
            {/* Left Column: Interactive Country Selection Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4.5" id="country-grid">
              {COUNTRIES.map(country => (
                <button
                  key={country.id}
                  onClick={() => setSelectedCountryId(country.id)}
                  className={`relative p-5 text-left rounded-2xl transition-all duration-400 group overflow-hidden ${
                    selectedCountryId === country.id
                      ? 'glassmorphism-gold scale-102 card-glow-active shadow-2xl'
                      : 'glassmorphism-light hover:scale-105'
                  }`}
                  id={`btn-country-${country.id}`}
                >
                  {/* Subtle top decoration ring */}
                  <div className={`absolute top-0 right-0 w-12 h-12 bg-brand-gold-rich/8 rounded-bl-full flex items-center justify-center transition-opacity ${selectedCountryId === country.id ? 'opacity-100' : 'opacity-0'}`} />

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl filter drop-shadow-lg transform group-hover:scale-110 duration-300 transition-transform" role="img" aria-label={country.name}>
                      {country.flag}
                    </span>
                    <span className="font-mono text-xs text-brand-gold-rich font-bold tracking-widest uppercase">
                      {country.costOfLiving}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-widest group-hover:text-brand-gold-rich transition-colors uppercase font-serif">
                    {country.name}
                  </h3>

                  <div className="mt-2 text-[10px] text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-brand-gold-rich/80" />
                    <span>Visa Match: {country.successRate}%</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Column: Dynamic Deep-Dive Country Specifications Card Dashboard */}
            <div className="lg:col-span-7 col-span-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCountry.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="glass-premium rounded-[32px] p-6 sm:p-10 relative overflow-hidden shadow-2xl border-brand-gold-rich/25"
                  id={`country-spec-card-${activeCountry.id}`}
                >
                  {/* Backdrop Crest Emblem placeholder */}
                  <div className="absolute -right-16 -bottom-16 text-white/5 font-serif text-[180px] pointer-events-none select-none">
                    {activeCountry.flag}
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl filter drop-shadow-xl" role="img" aria-label="Selected Flag">{activeCountry.flag}</span>
                      <div>
                        <h3 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-wide">
                          {activeCountry.name} Portal
                        </h3>
                        <p className="text-xs text-gray-400 font-mono tracking-wider mt-0.5">
                          Consolidated Territory Specifications File
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Visa Success Rate</div>
                      <div className="font-mono text-3xl font-black text-brand-gold-rich mt-1.5 glow-text-gold">
                        {activeCountry.successRate}%
                      </div>
                    </div>
                  </div>

                  {/* Core specifications parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mb-8">
                    
                    <div className="glassmorphism-light p-4.5 rounded-2xl hover:border-brand-gold-rich/25 duration-300 transition-all">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-widest mb-1">Average Academic Tuition</span>
                      <strong className="text-base text-brand-gold-pale font-mono block mt-1">
                        {activeCountry.avgTuition}
                      </strong>
                    </div>

                    <div className="glassmorphism-light p-4.5 rounded-2xl hover:border-brand-gold-rich/25 duration-300 transition-all">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-widest mb-1">Visa Processing Window</span>
                      <strong className="text-base text-brand-gold-pale font-mono block mt-1">
                        {activeCountry.visaTime}
                      </strong>
                    </div>

                    <div className="glassmorphism-light p-4.5 rounded-2xl hover:border-brand-gold-rich/25 duration-300 transition-all">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-widest mb-1">Post-Graduation Careers Term</span>
                      <strong className="text-sm text-gray-200 mt-1 block leading-relaxed font-sans">
                        {activeCountry.workPermit}
                      </strong>
                    </div>

                    <div className="glassmorphism-light p-4.5 rounded-2xl hover:border-brand-gold-rich/25 duration-300 transition-all">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-widest mb-1">Primary Intake Cohorts</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {activeCountry.keyIntakes.map((intake, i) => (
                          <span key={i} className="px-2.5 py-1 bg-brand-gold-rich/10 border border-brand-gold-rich/30 rounded-lg text-[9px] text-brand-gold-pale font-bold font-mono">
                            {intake}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Program list and University lists */}
                  <div className="mb-8">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-widest mb-4">Elite Specialized Departments</span>
                    <div className="flex flex-wrap gap-2">
                      {activeCountry.popularPrograms.map((prog, i) => (
                        <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 hover:border-brand-gold-rich/20 hover:text-brand-gold-rich rounded-xl text-xs text-gray-200 font-bold transition-all duration-250 cursor-default">
                          {prog}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Prestige Universities under this country */}
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-widest mb-4">
                      PRESTIGE CHARTERED ACADEMIES ({filteredUniversities.length})
                    </span>

                    {filteredUniversities.length === 0 ? (
                      <div className="text-center p-8 bg-white/3 rounded-2xl border border-dashed border-white/10">
                        <p className="text-xs text-gray-400">No partner universities found matching "{targetSearchUniversity}" under this territory.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="country-uni-list">
                        {filteredUniversities.map(uni => (
                          <div 
                            key={uni.id} 
                            className="bg-brand-emerald-dark/40 border border-white/5 p-4.5 rounded-2xl flex items-start gap-4 hover:border-brand-gold-rich/30 hover:scale-102 transition-all duration-300"
                          >
                            <span className="text-3xl p-2.5 bg-white/5 rounded-xl border border-white/5 block">{uni.logoUrl}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-white truncate uppercase tracking-widest font-mono">{uni.name}</h4>
                              <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400 font-mono">
                                <span>{uni.city} • {uni.ranking}</span>
                                <span className="text-[#fef08a] font-black">{uni.scholarshipGrantMax.split(' ')[0]} Max Aid</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </section>

        {/* Section 3: Interactive Scholarship Simulator Widget */}
        <section id="scholarships" className="py-16 border-t border-brand-gold-rich/10">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-brand-gold-rich font-mono text-xs font-bold tracking-widest uppercase mb-2">
              <Award className="w-4 h-4" />
              <span>Financial Aid Evaluator</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-white">
              Scholarship Matching Simulator
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Adjust your grade parameters, academic status, and proficiency scoring in real-time to compute prospective institutional waivers and matching waivers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column Parameters Controls */}
            <div className="lg:col-span-5 glass-premium rounded-[32px] p-6 sm:p-9 space-y-7 shadow-2xl border-brand-gold-rich/25">
              <div>
                <h3 className="font-serif text-xl text-white font-bold tracking-wide">
                  Candidate Credentials
                </h3>
                <p className="text-xs text-gray-400 font-mono tracking-wider mt-1">Adjust dials to calculate waiver compatibility</p>
              </div>

              {/* GPA Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-gray-300">Cumulative GPA Score</span>
                  <span className="px-3 py-1.5 bg-brand-gold-rich/15 border border-brand-gold-rich/40 text-brand-gold-glow font-mono rounded-xl text-xs font-black glow-text-gold select-none">{gpa.toFixed(2)} / 4.0</span>
                </div>
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="2.0"
                    max="4.0"
                    step="0.05"
                    value={gpa}
                    onChange={(e) => setGpa(parseFloat(e.target.value))}
                    className="w-full h-2 bg-brand-emerald-dark/80 rounded-lg appearance-none cursor-pointer accent-brand-gold-rich border border-white/5"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-gray-400 font-mono font-bold uppercase tracking-wider">
                  <span>2.0 Min Pass</span>
                  <span>3.0 Competitive</span>
                  <span>4.0 Elite Max</span>
                </div>
              </div>

              {/* IELTS/TOEFL score selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-gray-300">English Indicator (IELTS)</span>
                  <span className="px-3 py-1.5 bg-brand-gold-rich/15 border border-brand-gold-rich/40 text-brand-gold-glow font-mono rounded-xl text-xs font-black glow-text-gold select-none">Band {ielts.toFixed(1)}</span>
                </div>
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="4.5"
                    max="9.0"
                    step="0.5"
                    value={ielts}
                    onChange={(e) => setIelts(parseFloat(e.target.value))}
                    className="w-full h-2 bg-brand-emerald-dark/80 rounded-lg appearance-none cursor-pointer accent-brand-gold-rich border border-white/5"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-gray-400 font-mono font-bold uppercase tracking-wider">
                  <span>4.5 Int Prep</span>
                  <span>6.5 Metric Std</span>
                  <span>9.0 Professional</span>
                </div>
              </div>

              {/* Target Academic Degree Level */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider">Proposed Level of Training</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['undergraduate', 'postgraduate', 'phd'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setAcadLevel(level)}
                      className={`py-3 px-1 text-center text-[10px] font-black tracking-widest uppercase rounded-xl border transition-all duration-300 cursor-pointer ${
                        acadLevel === level
                          ? 'glassmorphism-gold text-brand-gold-glow border-brand-gold-rich scale-102 card-glow-active'
                          : 'glassmorphism-light text-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extras Rating */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider">Co-Curricular Assets Standard</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'mid', 'high'] as const).map(rating => (
                    <button
                      key={rating}
                      onClick={() => setExtraCur(rating)}
                      className={`py-3 px-1 text-center text-[10px] font-black tracking-widest uppercase rounded-xl border transition-all duration-300 cursor-pointer ${
                        extraCur === rating
                          ? 'glassmorphism-gold text-brand-gold-glow border-brand-gold-rich scale-102 card-glow-active'
                          : 'glassmorphism-light text-gray-300'
                      }`}
                    >
                      {rating} Portfolio
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 leading-normal font-medium italic">
                  *Portfolios include certified sports records, publications, leadership badges, and research.
                </p>
              </div>

            </div>

            {/* Right Column Real-time Evaluated Results List */}
            <div className="lg:col-span-7 glass-premium rounded-[32px] p-6 sm:p-9 shadow-2xl border-brand-gold-rich/20">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
                <div>
                  <h3 className="font-serif text-lg sm:text-parent text-white font-bold tracking-wide uppercase">
                    Waiver Projections Dashboard
                  </h3>
                  <p className="text-xs text-gray-400 font-mono tracking-wider mt-0.5">
                    Live scholarship alignment calculations matching credentials
                  </p>
                </div>
                
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-brand-gold-rich/10 border border-brand-gold-rich/30 rounded-full font-mono text-[9px] text-brand-gold-rich font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-brand-emerald-bright animate-ping" />
                  <span>Interactive Sync</span>
                </div>
              </div>

              {/* Dynamic Matching computation Cards layout */}
              <div className="space-y-5 max-h-[480px] overflow-y-auto pr-2" id="simulated-uni-list">
                {UNIVERSITIES.map(uni => {
                  const projectedWaiver = calculateScholarshipEligibility(uni);
                  let badgeColor = 'bg-red-500/10 border-red-500/30 text-red-400';
                  let matchRatingMsg = 'Prerequisites Unmet';
                  
                  if (projectedWaiver >= 80) {
                    badgeColor = 'bg-brand-emerald-bright/10 border-brand-emerald-bright/30 text-brand-emerald-bright';
                    matchRatingMsg = 'Elite Match Potential';
                  } else if (projectedWaiver >= 50) {
                    badgeColor = 'bg-brand-gold-rich/10 border-brand-gold-rich/30 text-brand-gold-glow';
                    matchRatingMsg = 'Strong Alignment';
                  }

                  const isCountryMatch = uni.country === selectedCountryId;

                  return (
                    <div 
                      key={uni.id}
                      className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                        isCountryMatch 
                          ? 'glassmorphism-gold border-brand-gold-rich/40 scale-101 shadow-xl' 
                          : 'glassmorphism border-white/5 opacity-85 hover:opacity-100'
                      }`}
                    >
                      {isCountryMatch && (
                        <div className="absolute top-0 right-0 py-1 px-3 bg-brand-gold-rich/15 border-l border-b border-brand-gold-rich/30 rounded-bl-xl font-mono text-[8px] text-brand-gold-pale font-extrabold uppercase tracking-widest">
                          Destination Synergy Match
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl p-3 bg-brand-emerald-dark/60 rounded-2xl border border-white/5 shadow-inner">
                            {uni.logoUrl}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm sm:text-base font-bold text-white tracking-widest font-mono uppercase">{uni.name}</h4>
                              <span className="text-[10px] font-bold uppercase bg-white/5 px-2 py-0.5 rounded text-gray-400 font-mono border border-white/5">{uni.ranking}</span>
                            </div>
                            <p className="text-xs text-gray-300 flex items-center gap-1.5 mt-1 font-mono">
                              <MapPin className="w-3.5 h-3.5 text-brand-gold-rich" />
                              <span>{uni.city}, {COUNTRIES.find(c => c.id === uni.country)?.name}</span>
                            </p>
                          </div>
                        </div>

                        {/* Calculations feedback */}
                        <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0 border-white/5">
                          <div className="sm:text-right">
                            <div className="font-mono text-[9px] text-gray-400 font-bold uppercase tracking-wider">Estimated Waiver</div>
                            <div className="font-mono text-3xl sm:text-4xl font-black text-brand-gold-glow mt-1.5 glow-text-gold inline-block">
                              {projectedWaiver}%
                            </div>
                          </div>
                          
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border sm:mt-3 ${badgeColor}`}>
                            {matchRatingMsg}
                          </span>
                        </div>
                      </div>

                      {/* Detail row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4.5 border-t border-white/5 text-[10px] text-gray-400 font-mono font-semibold uppercase tracking-wider">
                        <div>
                          <span className="block text-gray-500 font-extrabold">Min Req GPA</span>
                          <span className="text-[#ffffff] mt-1 block">{uni.minGpa} / 4.0</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 font-extrabold">Min IELTS</span>
                          <span className="text-[#ffffff] mt-1 block">Band {uni.minIelts}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 font-extrabold font-bold">Standard Tuition</span>
                          <span className="text-brand-gold-pale mt-1 block">{uni.avgTuitionYear}/Yr</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 font-extrabold">Max Available Capital</span>
                          <span className="text-brand-gold-pale mt-1 block overflow-hidden text-ellipsis truncate" title={uni.scholarshipGrantMax}>
                            {uni.scholarshipGrantMax}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </section>

        {/* Section 4: Document Upload Evaluation & Preparation Checklist */}
        <section id="documents" className="py-16 border-t border-brand-gold-rich/10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side checklist parameters */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center gap-1.5 text-brand-gold-rich font-mono text-xs font-bold tracking-widest uppercase mb-2">
                  <FileText className="w-4 h-4 text-brand-gold-rich" />
                  <span>Interactive Verification</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl text-white">
                  Academic Files Evaluator
                </h2>
                <p className="text-xs text-gray-400 mt-2">
                  Simulate file uploads of essential qualifications to evaluate your global "Admissions Readiness Rating" on our security sandbox instantly!
                </p>
              </div>

              {/* Dynamic Interactive Checklist Grid */}
              <div className="space-y-4" id="document-checklist">
                {checklist.map(item => (
                  <div 
                    key={item.id}
                    className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      item.uploaded 
                        ? 'glassmorphism-emerald border-brand-emerald-bright/50 scale-101 shadow-xl shadow-brand-emerald-bright/5' 
                        : 'glassmorphism-light hover:scale-102 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl border mt-0.5 ${item.uploaded ? 'bg-brand-emerald-bright/15 text-brand-emerald-bright border-brand-emerald-bright/40' : 'bg-white/5 text-gray-400 border-white/5'}`}>
                        {item.uploaded ? <Check className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white tracking-widest font-mono uppercase">{item.name}</h4>
                          {item.required && (
                            <span className="text-[8px] bg-brand-gold-rich/15 border border-brand-gold-rich/40 px-2 py-0.5 rounded-lg text-brand-gold-rich uppercase tracking-widest font-black select-none">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-300 mt-1.5 max-w-md">{item.description}</p>
                        
                        {item.uploaded && item.fileName && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-xl font-mono text-[9px] text-brand-emerald-bright font-semibold">
                            <span className="block font-bold">✓ {item.fileName}</span>
                            <span className="text-gray-400">({item.fileSize})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex items-center justify-end sm:justify-start">
                      {item.uploaded ? (
                        <span className="text-xs font-black tracking-widest uppercase text-brand-emerald-bright flex items-center gap-1.5 bg-brand-emerald-bright/10 px-4 py-2 rounded-xl border border-brand-emerald-bright/30 shadow-inner select-none">
                          Uploaded
                        </span>
                      ) : (
                        <button
                          onClick={() => handleUploadClick(item.id)}
                          disabled={uploadStatus === item.id}
                          className="px-5 py-2.5 bg-brand-gold-rich text-brand-emerald-dark text-xs font-black tracking-widest uppercase rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-lg hover:shadow-brand-gold-rich/30"
                          id={`btn-upload-${item.id}`}
                        >
                          {uploadStatus === item.id ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-brand-emerald-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Evaluating...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Simulate File</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleResetChecklist}
                  className="text-xs font-bold font-mono tracking-wider uppercase text-gray-400 hover:text-white underline underline-offset-4 transition-all duration-300 cursor-pointer"
                >
                  Reset Checklist Files
                </button>
              </div>

            </div>

            {/* Right side evaluation meter report card */}
            <div className="lg:col-span-5 glass-premium rounded-[32px] p-6 sm:p-9 space-y-7 shadow-2xl border-brand-gold-rich/25">
              
              <div>
                <h3 className="font-serif text-xl text-white font-bold tracking-wide">
                  Admissions Readiness Status
                </h3>
                <p className="text-xs text-gray-400 font-mono tracking-wider mt-1">
                  Evaluated readiness based on your compiled dossier portfolio
                </p>
              </div>

              <div className="glassmorphism-light p-6 sm:p-8 rounded-[24px] flex flex-col items-center text-center justify-center relative overflow-hidden" id="documents-meter-panel">
                
                {/* Gauge visualization code */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  
                  {/* Outer circle track */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      className="stroke-white/5"
                      strokeWidth="11"
                      fill="transparent"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      className="stroke-brand-gold-rich transition-all duration-1000 filter drop-shadow-[0_0_12px_rgba(197,160,89,0.4)]"
                      strokeWidth="11"
                      fill="transparent"
                      strokeDasharray={427}
                      strokeDashoffset={427 - (427 * docsCompletenessScore) / 100}
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center select-none">
                    <span className="font-mono text-4xl font-black text-brand-gold-glow glow-text-gold">{docsCompletenessScore}%</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Completeness</span>
                  </div>

                </div>

                <div className="mt-6 space-y-2">
                  <h4 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                    {docsCompletenessScore === 100 
                      ? 'Elite Admissions Ready!' 
                      : docsCompletenessScore >= 60 
                      ? 'Competitive Profile Standard' 
                      : docsCompletenessScore >= 20 
                      ? 'Preliminary File Standard' 
                      : 'Awaiting Dossier'
                    }
                  </h4>
                  <p className="text-xs text-gray-300 max-w-xs leading-relaxed font-light">
                    {docsCompletenessScore === 100 
                      ? 'Excellent. Your academic dossiers conform safely to elite specifications! Clear to register academic plans.'
                      : docsCompletenessScore >= 60 
                      ? 'Almost ready. Just require a few remaining mandatory uploads to satisfy standard visa structures.'
                      : 'Please simulate uploading the academic transcripts, passport scans, and recommendation letters to generate validation.'
                    }
                  </p>
                </div>

              </div>

              {/* Steps overview */}
              <div className="space-y-3.5 font-mono text-[11px] text-gray-300 font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2 justify-between">
                  <span>Mandatory Files Authenticated:</span>
                  <span className="font-bold text-white font-mono bg-white/5 px-2.5 py-1 rounded-xl">{uploadedRequiredDocs} of {totalRequiredDocs} Files</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-brand-gold-rich h-full relative" style={{ width: `${docsCompletenessScore}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/40 animate-pulse" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/10 text-[10px] font-sans text-gray-400 leading-relaxed flex items-start gap-2.5 lowercase tracking-normal">
                  <div className="p-1 px-1.5 bg-brand-gold-rich/10 text-brand-gold-rich font-bold rounded-lg text-[9px] uppercase font-mono tracking-wider select-none">Note:</div>
                  <p className="text-left font-light">All academic files are evaluated in absolute volatile sandbox memory. Absolute zero personal information gets logged outside of the web lifecycle.</p>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* Section 5: Ivy Admissions AI Advisor Portal Chat */}
        <section id="expert-chat" className="py-16 border-t border-brand-gold-rich/10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left side conversational board */}
            <div className="lg:col-span-8 flex flex-col justify-between glass-premium border-brand-gold-rich/25 rounded-[32px] overflow-hidden min-h-[520px] shadow-2xl animate-fade-in" id="advisor-chat-board">
              
              {/* Advisor Header banner */}
              <div className="px-6 py-5 bg-brand-emerald-deep/90 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <span className="text-3xl p-2.5 bg-brand-gold-rich/10 border border-brand-gold-rich/30 rounded-xl block">🎓</span>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-emerald-bright border-2 border-brand-emerald-dark rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm sm:text-base font-black text-white tracking-wide">Dr. Alistair, Ivy Admissions Advisor</h3>
                    <p className="text-[10px] sm:text-xs text-brand-gold-rich/80 font-mono tracking-wider font-semibold uppercase">Expert Regional Placements & Grants Specialist</p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-brand-gold-rich/10 border border-brand-gold-rich/30 rounded-full font-mono text-[9px] text-brand-gold-pale font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-brand-gold-rich" />
                  <span>Interactive 24/7 Service</span>
                </div>
              </div>

              {/* Chat Messaging logs display section */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5 max-h-[350px] text-xs">
                {chatHistory.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-[20px] p-5 leading-relaxed tracking-wide ${
                      msg.sender === 'student' 
                        ? 'bg-gradient-to-r from-brand-gold-rich to-brand-gold-glow text-brand-emerald-dark font-black rounded-tr-none shadow-xl' 
                        : 'glassmorphism-light border-white/10 text-gray-100 rounded-tl-none shadow-lg'
                    }`}>
                      {msg.sender === 'advisor' && (
                        <div className="font-serif text-[10px] text-brand-gold-rich font-black tracking-widest uppercase mb-1.5 flex items-center gap-1.5">
                          <span>EDUCOMPASS Ivy Officer</span>
                          <Sparkles className="w-3 h-3 text-brand-gold-rich animate-pulse-gold" />
                        </div>
                      )}
                      
                      <p className="whitespace-pre-line text-xs font-medium">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {isAdvisorTyping && (
                  <div className="flex justify-start">
                    <div className="glassmorphism-light border-white/10 text-gray-100 rounded-[20px] rounded-tl-none p-4.5 max-w-[85%] shadow-lg">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-brand-gold-rich rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-brand-gold-rich rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-brand-gold-rich rounded-full animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[10px] text-gray-400 font-mono ml-2 font-bold uppercase tracking-wider">Alistair is analyzing folders...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Send Input Box Form */}
              <form onSubmit={handleSendChat} className="p-4 bg-white/3 border-t border-white/5 flex gap-2.5 font-sans">
                <input
                  type="text"
                  placeholder="Ask Alistair (e.g. 'How do I apply to Harvard?', 'What scholarships are in Germany?')..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold-rich/60 focus:ring-1 focus:ring-brand-gold-rich/30 transition-all font-sans font-medium"
                  id="chat-user-input"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAdvisorTyping}
                  className="px-6 py-4 bg-gradient-to-r from-brand-gold-rich to-brand-gold-glow disabled:opacity-50 text-brand-emerald-dark text-xs font-black tracking-widest uppercase rounded-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-lg"
                  id="chat-send-submit"
                >
                  <span>Query</span>
                  <ArrowRight className="w-4 h-4 ml-0.5 animate-pulse" />
                </button>
              </form>

            </div>

            {/* Right side static/interactive details */}
            <div className="lg:col-span-4 glass-premium border-brand-gold-rich/20 rounded-[32px] p-6 sm:p-9 flex flex-col justify-between space-y-7 shadow-2xl">
              
              <div className="space-y-4">
                <h4 className="font-serif text-lg text-white font-bold tracking-wide uppercase">
                  Popular Consultation Queries
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                  Our neural core cross-examines international entry requirements instantly. Select any topic to auto-fill the query terminal:
                </p>

                <div className="space-y-2.5" id="suggested-queries">
                  {[
                    "What scholarships exist for IELTS 6.5 and GPA 3.4?",
                    "How does German free state tuition operate?",
                    "What documents are required for Canadian Study Permits?",
                    "Am I competitive for Stanford or Oxford programs?"
                  ].map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setChatInput(query);
                        // focus user input
                        document.getElementById('chat-user-input')?.focus();
                      }}
                      className="w-full text-left p-3.5 bg-white/4 border border-white/5 rounded-xl text-xs text-gray-300 hover:text-brand-gold-pale hover:bg-brand-gold-rich/10 hover:border-brand-gold-rich/30 duration-200 transition-all block truncate font-medium uppercase tracking-wide font-mono"
                    >
                      💡 {query}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-brand-gold-rich/5 border border-brand-gold-rich/25 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-brand-gold-rich">
                  <Star className="w-4 h-4 fill-brand-gold-rich" />
                  <span className="text-[10px] font-bold tracking-widest font-mono uppercase">Prestige Human Liaison</span>
                </div>
                <p className="text-[10px] text-gray-300 leading-relaxed font-medium">
                  Require official authorized representatives to look up specific, custom research, post-grad, or clinical programs? Submit our certified intake register directly below.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* Section 6: Real Global Alumni Placement Testimonial Slider */}
        <section id="stories" className="py-16 border-t border-brand-gold-rich/10">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-brand-gold-rich font-mono text-xs font-bold tracking-widest uppercase mb-2">
              <Star className="w-4 h-4" />
              <span>International Placements</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-white">
              Global Student Success Board
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Read real accounts of student alumni from secondary schools and colleges placed comfortably across world-class partner programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="success-stories-grid">
            {SUCCESS_STORIES.map(story => (
              <div 
                key={story.id}
                className="glassmorphism rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-b-2 hover:border-b-brand-gold-rich hover:bg-brand-emerald-deep/30 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-brand-gold-rich bg-brand-emerald-dark font-sans font-bold flex items-center justify-center text-xl text-brand-gold-rich select-none text-center">
                        {story.studentName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white tracking-wide group-hover:text-brand-gold-rich transition-colors">
                          {story.studentName}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                          Origin Candidate: {story.originCountry}
                        </span>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-brand-gold-rich/15 border border-brand-gold-rich/45 rounded-lg font-mono text-[9px] text-[#fef08a] font-bold">
                      {story.scholarshipValue}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 italic font-mono leading-relaxed tracking-wide mb-6 relative">
                    "{story.quote}"
                  </p>
                </div>

                <div className="border-t border-white/5 pt-4 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">{story.universityName}</span>
                    <span className="text-[9px] text-gray-400">• {story.destinationCountry}</span>
                  </div>

                  <span className="text-[9px] font-bold font-mono tracking-wider uppercase text-brand-gold-rich bg-white/5 px-2 py-1 rounded">
                    {story.program.split(' ').slice(0, 3).join(' ')}
                  </span>
                </div>

              </div>
            ))}
          </div>

        </section>

        {/* Section 7: Free Consultancy Application Intake Form */}
        <section id="apply-form" className="py-20 border-t border-brand-gold-rich/10">
          
          <div className="glass-premium rounded-[32px] p-8 sm:p-14 relative overflow-hidden max-w-4xl mx-auto shadow-2xl border-brand-gold-rich/25" id="application-form-panel">
            
            <div className="absolute top-0 right-0 w-44 h-44 bg-brand-gold-rich/5 rounded-bl-full pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Form text description Left */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-1.5 text-brand-gold-rich font-mono text-[10px] font-extrabold tracking-widest uppercase">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                  <span>Certified Verification</span>
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl text-white font-bold leading-tight tracking-wide">
                  Schedule Free Academic Auditing
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                  Ready to translate your study pathways into active admissions? Submitting this preliminary file initiates your formal dossier appraisal.
                </p>

                <div className="space-y-3.5 font-mono text-[10px] text-gray-300 pt-4 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Check className="w-4.5 h-4.5 text-brand-gold-rich" />
                    <span>Certified Academic Evaluation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4.5 h-4.5 text-brand-gold-rich" />
                    <span>Direct Pathway Matching Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4.5 h-4.5 text-brand-gold-rich" />
                    <span>Zero Enrollment Commission Fees</span>
                  </div>
                </div>
              </div>

              {/* Form Submission fields Right */}
              <div className="lg:col-span-7">
                
                {formSubmitted ? (
                  <div className="p-6 sm:p-8 bg-brand-emerald-deep/40 border border-brand-gold-rich/30 rounded-2xl text-center space-y-5 shadow-inner">
                    <div className="w-16 h-16 bg-gradient-to-r from-brand-gold-rich to-brand-gold-glow text-brand-emerald-dark rounded-full flex items-center justify-center mx-auto text-3xl font-black">
                      ✓
                    </div>
                    <h4 className="font-serif text-xl text-white font-bold tracking-wide uppercase">
                      Application Lodged Successfully!
                    </h4>
                    <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
                      Excellent. We have compiled your dossiers! An admissions specialist representing your region will review your cumulative score records and initiate communication.
                    </p>
                    
                    <div className="p-4.5 bg-brand-emerald-dark/60 rounded-xl border border-white/5 text-left text-[11px] font-mono text-gray-300 space-y-1.5 uppercase font-semibold tracking-wider">
                      <div><strong className="text-white">Reference Id:</strong> ECO-{Math.floor(Math.random() * 90000) + 10000}</div>
                      <div><strong className="text-white">Applicant Name:</strong> {formData.fullName || 'Prospective Student'}</div>
                      <div><strong className="text-white">Assessing Route:</strong> {COUNTRIES.find(c => c.id === formData.targetCountry)?.name || 'USA'} Visa Path</div>
                      <div><strong className="text-white">Intake Timeline:</strong> Autumn (Fall) Intake</div>
                    </div>

                    <button 
                      onClick={() => setFormSubmitted(false)}
                      className="px-5 py-3.5 bg-brand-gold-rich text-brand-emerald-dark text-xs font-black tracking-widest uppercase rounded-xl hover:scale-105 active:scale-95 transition-all w-full cursor-pointer shadow-lg"
                    >
                      Fill Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4.5 animate-fade-in" id="consultation-form">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Full Candidate Name *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. John Doe"
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold-rich transition-all h-12 font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Contact Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            required
                            placeholder="e.g. name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold-rich transition-all h-12 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Telephone / WhatsApp Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +1 555-0199"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold-rich transition-all h-12 font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Target Study Country *</label>
                        <select
                          value={formData.targetCountry}
                          onChange={(e) => setFormData(prev => ({ ...prev, targetCountry: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#121c17] border border-white/10 rounded-xl text-xs text-white uppercase focus:outline-none focus:border-brand-gold-rich transition-all h-12 font-bold cursor-pointer"
                        >
                          {COUNTRIES.map(c => (
                            <option key={c.id} value={c.id} className="bg-brand-emerald-dark text-white uppercase">{c.flag} {c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Current Qualification Status</label>
                        <select
                          value={formData.qualification}
                          onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#121c17] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-gold-rich transition-all h-12 font-bold cursor-pointer"
                        >
                          <option value="High School Diploma" className="bg-brand-emerald-dark text-white">Associate High School Diploma</option>
                          <option value="Bachelor Degree (Ongoing)" className="bg-brand-emerald-dark text-white">Undergrad Degree (Current Student)</option>
                          <option value="Bachelor Degree (Completed)" className="bg-brand-emerald-dark text-white">Bachelor Degree (Graduate)</option>
                          <option value="Master Degree" className="bg-brand-emerald-dark text-white">Postgrad Master Degree</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Proposed Professional Field</label>
                        <select
                          value={formData.fieldOfStudy}
                          onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#121c17] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-gold-rich transition-all h-12 font-bold cursor-pointer font-medium"
                        >
                          <option value="Engineering & Technology" className="bg-brand-emerald-dark text-white">Engineering & IT Technology</option>
                          <option value="Business & MBA Studies" className="bg-brand-emerald-dark text-white">Business Administration (MBA / MS)</option>
                          <option value="Health Sciences & Medicine" className="bg-brand-emerald-dark text-white">Health Sciences & Medicine</option>
                          <option value="Art & Product Design" className="bg-brand-emerald-dark text-white">Arts, Humanities & Design</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 font-mono text-[10px]">
                      <p className="text-[#fef08a] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-brand-gold-rich" />
                        <span>Applying with simulated gpa: {gpa.toFixed(2)} and ielts Band: {ielts.toFixed(1)} automatically computed</span>
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingForm}
                      className="w-full py-4 bg-gradient-to-r from-brand-gold-rich via-brand-gold-glow to-brand-gold-rich hover:scale-101 text-brand-emerald-dark text-xs font-black tracking-widest uppercase rounded-xl shadow-xl hover:shadow-brand-gold-rich/35 duration-200 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-4"
                      id="btn-lodge-assess"
                    >
                      {isSubmittingForm ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-brand-emerald-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>LODGING TO SECURE SYSTEM...</span>
                        </>
                      ) : (
                        <>
                          <span>LODGE EVALUATION DOSSIER</span>
                          <ChevronRight className="w-4.5 h-4.5 text-brand-emerald-dark" />
                        </>
                      )}
                    </button>

                  </form>
                )}

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* Footer layout */}
      <footer className="bg-brand-emerald-dark border-t border-brand-gold-rich/15 py-12 px-4 lg:px-12 select-none relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl p-1 bg-brand-gold-rich/15 border border-brand-gold-rich/30 rounded-lg">🎓</span>
              <span className="font-serif text-base tracking-widest text-[#f5f5f5]">EDU COMPASS</span>
            </div>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              Global and premium scholastic assessment counseling and study pathway placement portal. Empowering international thinkers from classrooms to world targets comfortably.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-widest text-white uppercase font-serif">Aura of Integrity</h4>
            <ul className="space-y-2 text-xs text-gray-400 font-mono">
              <li>• ISO 9001 Certified Intake</li>
              <li>• Approved British Council Agent</li>
              <li>• Qualified DAAD Germany Hub</li>
              <li>• Qualified Canadian Immigration Registry</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-widest text-white uppercase font-serif">Admissions Support</h4>
            <p className="text-xs text-gray-400 font-sans leading-normal">
              Any security or administrative inquiry? Contact regional office representative:
            </p>
            <div className="space-y-1.5 font-mono text-[10px] text-brand-gold-rich/90">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-gold-rich" />
                <span>support@educompass.global</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-gold-rich" />
                <span>+1 (800) 555-2026 Admissions</span>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 mt-10 pt-6 text-center text-[10px] text-gray-500 font-mono flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span>© 2026 EduCompass Global Consultancy Services. All Emulated Placements Guaranteed.</span>
          <div className="flex items-center justify-center gap-4">
            <a href="#home" className="hover:text-brand-gold-rich">Admissions Sandbox</a>
            <a href="#destinations" className="hover:text-brand-gold-rich">Legal Privacy</a>
            <a href="#scholarships" className="hover:text-brand-gold-rich">Terms & Guidelines</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
