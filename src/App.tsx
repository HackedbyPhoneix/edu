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
        <nav className="max-w-7xl mx-auto flex items-center justify-between glassmorphism rounded-2xl px-6 py-4 transition-all duration-300 hover:border-brand-gold-rich/30" id="main-nav">
          
          {/* Logo Brand matching the unique logo vibe of Green Genesis */}
          <a href="#home" className="flex items-center gap-3 active:scale-95 transition-transform" id="nav-brand">
            <div className="p-2 bg-brand-gold-rich/15 rounded-lg border border-brand-gold-rich/40 flex items-center justify-center">
              <Globe className="w-6 h-6 text-brand-gold-rich animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg tracking-widest text-[#f5f5f5] hover:text-brand-gold-rich transition-colors">EDU COMPASS</span>
              <span className="font-mono text-[9px] tracking-wider text-brand-gold-rich/80 uppercase">Global Student Services</span>
            </div>
          </a>

          {/* Nav Links Desktop */}
          <div className="hidden md:flex items-center gap-1 xl:gap-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'destinations', label: 'Destinations' },
              { id: 'scholarships', label: 'Scholarships' },
              { id: 'documents', label: 'Document Review' },
              { id: 'expert-chat', label: 'Ivy Advisor' },
              { id: 'stories', label: 'Success Stories' }
            ].map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-lg transition-all duration-200 ${
                  activeSection === item.id 
                    ? 'text-brand-gold-rich bg-brand-gold-rich/10 border-b border-brand-gold-rich/60' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
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
              className="hidden lg:inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold tracking-wider uppercase rounded-xl border border-brand-gold-rich text-brand-gold-rich hover:bg-brand-gold-rich hover:text-brand-emerald-dark transition-all duration-200 active:scale-95"
              id="btn-nav-assess"
            >
              Free Assessment
            </a>
            <a 
              href="#expert-chat" 
              className="px-4.5 py-2 text-xs font-bold tracking-wider uppercase rounded-xl bg-brand-gold-rich text-brand-emerald-dark shadow-lg shadow-brand-gold-rich/20 hover:scale-105 transition-all duration-200 active:scale-95 flex items-center gap-1.5"
              id="btn-nav-consult"
            >
              <span>Instant Chat</span>
              <Sparkles className="w-3.5 h-3.5" />
            </a>
          </div>

        </nav>
      </header>

      {/* Main Body Layout */}
      <main className="max-w-7xl mx-auto px-4 lg:px-12 py-2 relative z-20">

        {/* Section 1: Hero Graphic Banner Space */}
        <section id="home" className="pt-8 pb-16 md:pt-14 md:pb-24 flex flex-col items-center justify-center text-center">
          
          {/* Typographic Centered Masterpiece styled with structural organic elements mimicking the Reference Image logo */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative select-none max-w-4xl"
            id="hero-logo-container"
          >
            {/* Glowing gold backplane ring */}
            <div className="absolute inset-0 bg-brand-gold-rich/5 rounded-full filter blur-[40px] mix-blend-screen scale-75 animate-pulse" />

            <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#eae0c5] to-[#a89975] flex flex-col items-center justify-center">
              
              {/* Top main display block */}
              <span className="relative z-10 select-none block tracking-wide filter drop-shadow-xl font-bold">
                EDUCOMPASS
              </span>

              {/* Bottom stylized custom text banner with vector line decoration */}
              <span className="text-xl sm:text-2xl md:text-3xl font-serif text-brand-gold-rich tracking-[0.35em] uppercase mt-4 block relative">
                <span className="absolute -left-12 top-1/2 w-8 h-[1px] bg-brand-gold-rich/40 hidden sm:block" />
                GLOBAL GATEWAY
                <span className="absolute -right-12 top-1/2 w-8 h-[1px] bg-brand-gold-rich/40 hidden sm:block" />
              </span>

            </h1>

            {/* Subtext description aligned for international education consultancy */}
            <p className="mt-8 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-gray-300 font-light leading-relaxed tracking-wide px-4">
              Awakening International Achievements from Campus Discovery to Visa Clearances. Beautifully bridging the gap between worldwide ambitions and the absolute world's leading academic campuses.
            </p>

          </motion.div>

          {/* Dynamic Quick Metrics Tracker Bar (Mimicking the Event stats bar in the reference image) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-full max-w-5xl mt-12 sm:mt-16 glassmorphism rounded-3xl p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 tracking-tight relative overflow-hidden"
            id="quick-stats-bar"
          >
            {/* Elegant luxury gold background line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold-rich/50 to-transparent" />
            
            <div className="text-center group border-r border-white/5 py-2">
              <div className="flex justify-center mb-2">
                <div className="p-2.5 bg-brand-gold-rich/10 rounded-full text-brand-gold-rich group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5.5 h-5.5" />
                </div>
              </div>
              <div className="font-mono text-3xl font-bold text-white tracking-tighter" id="stat-uni">700+</div>
              <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-gray-400 uppercase mt-1">Prestige Universities</div>
            </div>

            <div className="text-center group sm:border-r border-white/5 py-2">
              <div className="flex justify-center mb-2">
                <div className="p-2.5 bg-brand-gold-rich/10 rounded-full text-brand-gold-rich group-hover:scale-110 transition-transform">
                  <Globe className="w-5.5 h-5.5" />
                </div>
              </div>
              <div className="font-mono text-3xl font-bold text-white tracking-tighter" id="stat-countries">12+</div>
              <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-gray-400 uppercase mt-1">Study Countries</div>
            </div>

            <div className="text-center group border-r border-white/5 py-2">
              <div className="flex justify-center mb-2">
                <div className="p-2.5 bg-brand-gold-rich/10 rounded-full text-brand-gold-rich group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5.5 h-5.5" />
                </div>
              </div>
              <div className="font-mono text-3xl font-bold text-white tracking-tighter" id="stat-visa">98.2%</div>
              <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-gray-400 uppercase mt-1">Visa Success Ratio</div>
            </div>

            <div className="text-center group py-2">
              <div className="flex justify-center mb-2">
                <div className="p-2.5 bg-brand-gold-rich/10 rounded-full text-brand-gold-rich group-hover:scale-110 transition-transform">
                  <Award className="w-5.5 h-5.5" />
                </div>
              </div>
              <div className="font-mono text-3xl font-bold text-white tracking-tighter" id="stat-scholar">$15M+</div>
              <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-gray-400 uppercase mt-1">Scholarships Secured</div>
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
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4" id="country-grid">
              {COUNTRIES.map(country => (
                <button
                  key={country.id}
                  onClick={() => setSelectedCountryId(country.id)}
                  className={`relative p-5 text-left rounded-2xl transition-all duration-300 group overflow-hidden ${
                    selectedCountryId === country.id
                      ? 'bg-gradient-to-br from-brand-emerald-deep/80 to-brand-emerald-dark border border-brand-gold-rich shadow-xl'
                      : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/15'
                  }`}
                  id={`btn-country-${country.id}`}
                >
                  {/* Subtle top decoration ring */}
                  <div className={`absolute top-0 right-0 w-12 h-12 bg-brand-gold-rich/5 rounded-bl-full flex items-center justify-center transition-opacity ${selectedCountryId === country.id ? 'opacity-100' : 'opacity-0'}`} />

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl filter drop-shadow" role="img" aria-label={country.name}>
                      {country.flag}
                    </span>
                    <span className="font-mono text-xs text-brand-gold-rich font-medium tracking-widest uppercase">
                      {country.costOfLiving}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white tracking-wide group-hover:text-brand-gold-rich transition-colors">
                    {country.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-1.5 font-mono text-[9px] text-gray-400">
                    <CheckSquare className="w-3 h-3 text-brand-gold-rich/80" />
                    <span>Visa Odds: {country.successRate}%</span>
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
                  className="glassmorphism rounded-3xl p-6 sm:p-8 relative overflow-hidden"
                  id={`country-spec-card-${activeCountry.id}`}
                >
                  {/* Backdrop Crest Emblem placeholder */}
                  <div className="absolute -right-16 -bottom-16 text-white/5 font-serif text-[180px] pointer-events-none select-none">
                    {activeCountry.flag}
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl" role="img" aria-label="Selected Flag">{activeCountry.flag}</span>
                      <div>
                        <h3 className="font-serif text-2xl text-white font-semibold">
                          {activeCountry.name} Portal
                        </h3>
                        <p className="text-xs text-gray-400">
                          Comprehensive study passport details and statistics
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Visa Success Ratio</div>
                      <div className="font-mono text-2xl font-bold text-brand-gold-rich mt-0.5">
                        {activeCountry.successRate}%
                      </div>
                    </div>
                  </div>

                  {/* Core specifications parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mb-8">
                    
                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                      <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">Average Academic Tuition</span>
                      <strong className="text-sm text-white font-mono block mt-1.5 text-brand-gold-rich">
                        {activeCountry.avgTuition}
                      </strong>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                      <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">Student Visa Processing Time</span>
                      <strong className="text-sm text-white font-mono block mt-1.5 text-brand-gold-rich">
                        {activeCountry.visaTime}
                      </strong>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                      <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">Post-Graduation Careers Option</span>
                      <strong className="text-sm text-white font-sans block mt-1.5 text-gray-200">
                        {activeCountry.workPermit}
                      </strong>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                      <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">Primary Enrollment Intakes</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {activeCountry.keyIntakes.map((intake, i) => (
                          <span key={i} className="px-2 py-0.5 bg-brand-gold-rich/10 border border-brand-gold-rich/30 rounded text-[9px] text-[#fef08a] font-mono">
                            {intake}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Program list and University lists */}
                  <div className="mb-6">
                    <span className="text-xs text-gray-400 block font-semibold uppercase tracking-widest mb-3">Popular Specialized Disciplines</span>
                    <div className="flex flex-wrap gap-2">
                      {activeCountry.popularPrograms.map((prog, i) => (
                        <span key={i} className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-200 font-medium">
                          {prog}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Prestige Universities under this country */}
                  <div>
                    <span className="text-xs text-gray-400 block font-semibold uppercase tracking-widest mb-3">
                      Premium Partner Academies ({filteredUniversities.length})
                    </span>

                    {filteredUniversities.length === 0 ? (
                      <div className="text-center p-6 bg-white/3 rounded-xl border border-dashed border-white/10">
                        <p className="text-xs text-gray-400">No partner universities found matching "{targetSearchUniversity}" under this territory.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="country-uni-list">
                        {filteredUniversities.map(uni => (
                          <div 
                            key={uni.id} 
                            className="bg-brand-emerald-dark/50 border border-white/5 p-4 rounded-xl flex items-start gap-3 hover:border-brand-gold-rich/30 transition-colors"
                          >
                            <span className="text-2xl p-2 bg-white/5 rounded-lg">{uni.logoUrl}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{uni.name}</h4>
                              <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400 font-mono">
                                <span>{uni.city} • {uni.ranking}</span>
                                <span className="text-[#fef08a] font-semibold">{uni.scholarshipGrantMax.split(' ')[0]} Max Aid</span>
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
            <div className="lg:col-span-5 glassmorphism rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="font-serif text-lg text-white font-semibold border-b border-white/10 pb-3">
                Profile Parameters
              </h3>

              {/* GPA Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-300">Target Cumulative GPA</span>
                  <span className="text-brand-gold-rich font-mono">{gpa.toFixed(2)} / 4.0</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="4.0"
                  step="0.05"
                  value={gpa}
                  onChange={(e) => setGpa(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-gold-rich"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                  <span>2.0 (Pass)</span>
                  <span>3.0 (Good)</span>
                  <span>4.0 (Prefect)</span>
                </div>
              </div>

              {/* IELTS/TOEFL score selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-300">English Competency (IELTS Rating)</span>
                  <span className="text-brand-gold-rich font-mono">Band {ielts.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="4.5"
                  max="9.0"
                  step="0.5"
                  value={ielts}
                  onChange={(e) => setIelts(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-gold-rich"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                  <span>Band 4.5</span>
                  <span>Band 6.5 (Standard)</span>
                  <span>Band 9.0 (Native)</span>
                </div>
              </div>

              {/* Target Academic Degree Level */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-gray-300 block">Proposed Study Scheme</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['undergraduate', 'postgraduate', 'phd'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setAcadLevel(level)}
                      className={`py-2 px-1 text-center text-[10px] font-bold tracking-wider uppercase rounded-lg border transition-all ${
                        acadLevel === level
                          ? 'bg-brand-gold-rich/15 border-brand-gold-rich text-brand-gold-rich'
                          : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extras Rating */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-gray-300 block">Extra-Curricular Portfolio</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'mid', 'high'] as const).map(rating => (
                    <button
                      key={rating}
                      onClick={() => setExtraCur(rating)}
                      className={`py-2 px-1 text-center text-[10px] font-bold tracking-wider uppercase rounded-lg border transition-all ${
                        extraCur === rating
                          ? 'bg-brand-gold-rich/15 border-brand-gold-rich text-brand-gold-rich'
                          : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {rating} Profiles
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 leading-normal">
                  *Profiles include: sports credentials, research articles, community leadership projects, essays.
                </p>
              </div>

            </div>

            {/* Right Column Real-time Evaluated Results List */}
            <div className="lg:col-span-7 bg-brand-emerald-dark/40 border border-brand-gold-rich/10 rounded-3xl p-6 sm:p-8">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="font-serif text-lg text-white font-semibold">
                    Matching Fellowships & Waivers
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Live scholarship funding projections tailored to your stats
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-gold-rich/15 border border-brand-gold-rich/30 rounded-full font-mono text-[10px] text-brand-gold-rich font-bold">
                  <Star className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Real-time Sync</span>
                </div>
              </div>

              {/* Dynamic Matching computation Cards layout */}
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2" id="simulated-uni-list">
                {UNIVERSITIES.map(uni => {
                  const projectedWaiver = calculateScholarshipEligibility(uni);
                  let badgeColor = 'bg-red-500/10 border-red-500/30 text-red-400';
                  let matchRatingMsg = 'Low Probability';
                  
                  if (projectedWaiver >= 80) {
                    badgeColor = 'bg-brand-emerald-bright/10 border-brand-emerald-bright/30 text-green-400';
                    matchRatingMsg = 'Exceptional Match';
                  } else if (projectedWaiver >= 50) {
                    badgeColor = 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
                    matchRatingMsg = 'Strong Candidate';
                  }

                  const isCountryMatch = uni.country === selectedCountryId;

                  return (
                    <div 
                      key={uni.id}
                      className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                        isCountryMatch 
                          ? 'bg-gradient-to-r from-brand-emerald-deep/40 to-brand-emerald-dark/60 border-brand-gold-rich/30 hover:border-brand-gold-rich shadow' 
                          : 'bg-white/3 border-white/5 opacity-75 hover:opacity-100 hover:border-white/10'
                      }`}
                    >
                      {isCountryMatch && (
                        <div className="absolute top-0 right-0 py-0.5 px-2 bg-brand-gold-rich/15 border-bl border-brand-gold-rich/40 rounded-bl-lg font-mono text-[8px] text-[#fef08a] font-semibold uppercase tracking-wider">
                          Active Destination Match
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl p-2.5 bg-white/5 rounded-xl border border-white/5">
                            {uni.logoUrl}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-white tracking-wide">{uni.name}</h4>
                              <span className="text-xs uppercase bg-white/5 px-2 py-0.5 rounded text-gray-400 font-mono">{uni.ranking}</span>
                            </div>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 font-mono">
                              <MapPin className="w-3.5 h-3.5 text-brand-gold-rich" />
                              <span>{uni.city}, {COUNTRIES.find(c => c.id === uni.country)?.name}</span>
                            </p>
                          </div>
                        </div>

                        {/* Calculations feedback */}
                        <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                          <div>
                            <div className="font-mono text-xs text-gray-400 font-semibold uppercase tracking-wider">Estimated Waiver</div>
                            <div className="font-mono text-2xl font-black text-brand-gold-rich mt-0.5">
                              {projectedWaiver}%
                            </div>
                          </div>
                          
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border mt-2 block ${badgeColor}`}>
                            {matchRatingMsg}
                          </span>
                        </div>
                      </div>

                      {/* Detail row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/5 text-[10px] text-gray-400 font-mono">
                        <div>
                          <span className="block text-gray-500 font-bold uppercase tracking-wider">Min Required GPA</span>
                          <span className="text-gray-200 mt-0.5 block">{uni.minGpa} / 4.0</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 font-bold uppercase tracking-wider">Min IELTS Language</span>
                          <span className="text-gray-200 mt-0.5 block">Band {uni.minIelts}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 font-bold uppercase tracking-wider">Average Tuition Fee</span>
                          <span className="text-gray-200 mt-0.5 block">{uni.avgTuitionYear}/Yr</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 font-bold uppercase tracking-wider">Max Grants Record</span>
                          <span className="text-gray-200 mt-0.5 block overflow-hidden text-ellipsis truncate" title={uni.scholarshipGrantMax}>
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
              <div className="space-y-3.5" id="document-checklist">
                {checklist.map(item => (
                  <div 
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      item.uploaded 
                        ? 'bg-brand-emerald-deep/30 border-brand-emerald-bright/40 shadow-sm' 
                        : 'bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-xl border mt-0.5 ${item.uploaded ? 'bg-brand-emerald-bright/15 text-brand-emerald-bright border-brand-emerald-bright/30' : 'bg-white/5 text-gray-400 border-white/5'}`}>
                        {item.uploaded ? <Check className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white tracking-wide">{item.name}</h4>
                          {item.required && (
                            <span className="text-[8px] bg-brand-gold-rich/15 border border-brand-gold-rich/30 px-1.5 py-0.5 rounded text-brand-gold-rich uppercase tracking-wider font-bold">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 max-w-md">{item.description}</p>
                        
                        {item.uploaded && item.fileName && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg font-mono text-[9px] text-brand-emerald-bright">
                            <span className="block font-bold">✓ {item.fileName}</span>
                            <span className="text-gray-400">({item.fileSize})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex items-center justify-end sm:justify-start">
                      {item.uploaded ? (
                        <span className="text-xs font-semibold text-brand-emerald-bright flex items-center gap-1 bg-brand-emerald-bright/10 px-3 py-1.5 rounded-xl border border-brand-emerald-bright/20">
                          Uploaded
                        </span>
                      ) : (
                        <button
                          onClick={() => handleUploadClick(item.id)}
                          disabled={uploadStatus === item.id}
                          className="px-4 py-2 bg-brand-gold-rich text-brand-emerald-dark text-xs font-bold tracking-wider uppercase rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
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
                  className="text-xs text-gray-400 hover:text-white underline underline-offset-4 transition-all"
                >
                  Reset Checklist Files
                </button>
              </div>

            </div>

            {/* Right side evaluation meter report card */}
            <div className="lg:col-span-5 glassmorphism rounded-3xl p-6 sm:p-8 space-y-6">
              
              <div>
                <h3 className="font-serif text-lg text-white font-semibold border-b border-white/10 pb-3">
                  Admissions Readiness Rapport
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Evaluated readiness based on your compiled active documentation portfolio
                </p>
              </div>

              <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center justify-center relative overflow-hidden" id="documents-meter-panel">
                
                {/* Gauge visualization code */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  
                  {/* Outer circle track */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      className="stroke-white/10"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      className="stroke-brand-gold-rich transition-all duration-1000"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={402}
                      strokeDashoffset={402 - (402 * docsCompletenessScore) / 100}
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center">
                    <span className="font-mono text-3xl font-black text-white">{docsCompletenessScore}%</span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-1">Completeness</span>
                  </div>

                </div>

                <div className="mt-5 space-y-1">
                  <h4 className="text-sm font-semibold text-white">
                    {docsCompletenessScore === 100 
                      ? 'Elite Admissions Ready!' 
                      : docsCompletenessScore >= 60 
                      ? 'Competitive Profile Grade' 
                      : docsCompletenessScore >= 20 
                      ? 'Preliminary File Standard' 
                      : 'Awaiting Dossier'
                    }
                  </h4>
                  <p className="text-xs text-gray-400 max-w-xs mt-1 leading-normal">
                    {docsCompletenessScore === 100 
                      ? 'Excellent. Your academic dossiers conform safely to elite specifications! Submit for target assess now.'
                      : docsCompletenessScore >= 60 
                      ? 'Almost ready. Just require a few remaining mandatory uploads to satisfy legal visa standards.'
                      : 'Please simulate uploading the academic transcripts, passport scans, and proof files to generate validation.'
                    }
                  </p>
                </div>

              </div>

              {/* Steps overview */}
              <div className="space-y-3 font-mono text-[11px] text-gray-300">
                <div className="flex items-center gap-2 justify-between">
                  <span>Mandatory Checklist Target Met:</span>
                  <span className="font-bold text-white">{uploadedRequiredDocs} of {totalRequiredDocs} Files</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-gold-rich h-full" style={{ width: `${docsCompletenessScore}%` }} />
                </div>
                
                <div className="pt-4 border-t border-white/10 text-xs font-sans text-gray-400 leading-normal flex items-start gap-2.5">
                  <div className="p-1 px-1.5 bg-brand-gold-rich/10 text-brand-gold-rich font-bold rounded mt-0.5 text-[9px] uppercase font-mono">Note:</div>
                  <p>All academic and language scans are securely sandboxed locally. No live financial data of candidates is collected during emulation.</p>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* Section 5: Ivy Admissions AI Advisor Portal Chat */}
        <section id="expert-chat" className="py-16 border-t border-brand-gold-rich/10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left side conversational board */}
            <div className="lg:col-span-8 flex flex-col justify-between bg-brand-emerald-dark/50 border border-brand-gold-rich/15 rounded-3xl overflow-hidden min-h-[500px]" id="advisor-chat-board">
              
              {/* Advisor Header banner */}
              <div className="px-6 py-4.5 bg-brand-emerald-deep/90 border-b border-brand-gold-rich/15 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="text-3xl p-2 bg-brand-gold-rich/15 border border-brand-gold-rich/30 rounded-xl block">🎓</span>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-emerald-bright border-2 border-brand-emerald-dark rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-white tracking-wide">Dr. Alistair, Ivy Admissions Advisor</h3>
                    <p className="text-[10px] text-gray-400 font-mono">Expert Regional Placements & Grants Specialist</p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-brand-gold-rich/10 border border-brand-gold-rich/20 rounded-full font-mono text-[9px] text-[#fef08a] font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Avail Hours: 24/7 Digital</span>
                </div>
              </div>

              {/* Chat Messaging logs display section */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[340px] text-xs">
                {chatHistory.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-4.5 leading-relaxed tracking-wide ${
                      msg.sender === 'student' 
                        ? 'bg-brand-gold-rich text-brand-emerald-dark font-semibold rounded-br-none shadow' 
                        : 'bg-brand-emerald-deep/60 border border-white/5 text-gray-100 rounded-bl-none shadow-sm'
                    }`}>
                      {msg.sender === 'advisor' && (
                        <div className="font-serif text-[10px] text-brand-gold-rich font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5">
                          <span>EDUCOMPASS Ivy Officer</span>
                          <Sparkles className="w-3 h-3 text-brand-gold-rich" />
                        </div>
                      )}
                      
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {isAdvisorTyping && (
                  <div className="flex justify-start">
                    <div className="bg-brand-emerald-deep/60 border border-white/5 text-gray-100 rounded-2xl rounded-bl-none p-4 max-w-[85%]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-brand-gold-rich rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-brand-gold-rich rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-brand-gold-rich rounded-full animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[10px] text-gray-400 font-mono ml-1.5">Alistair is analyzing folders...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Send Input Box Form */}
              <form onSubmit={handleSendChat} className="p-4 bg-brand-emerald-deep/45 border-t border-brand-gold-rich/10 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Alistair (e.g. 'How do I apply to Harvard?', 'What scholarships are in Germany?')..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-5 py-3.5 bg-brand-emerald-dark/60 border border-brand-gold-rich/15 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold-rich focus:ring-1 focus:ring-brand-gold-rich/30 transition-all font-sans"
                  id="chat-user-input"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAdvisorTyping}
                  className="px-5 py-3 bg-brand-gold-rich disabled:opacity-50 text-brand-emerald-dark text-xs font-black tracking-widest uppercase rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  id="chat-send-submit"
                >
                  <span>Query</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

            </div>

            {/* Right side static/interactive details */}
            <div className="lg:col-span-4 glassmorphism rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <h4 className="font-serif text-base text-brand-gold-pale font-semibold">
                  Academic Help-desk Topics
                </h4>
                <p className="text-xs text-gray-400 leading-normal">
                  Our algorithm cross-examines student parameters instantaneously. Click any popular help prompt to load automatic consultations:
                </p>

                <div className="space-y-2" id="suggested-queries">
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
                      className="w-full text-left p-3 bg-white/4 border border-white/5 rounded-xl text-xs text-gray-300 hover:text-[#fef08a] hover:bg-white/8 hover:border-brand-gold-rich/20 transition-all block truncate"
                    >
                      💡 {query}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-brand-gold-rich/5 border border-brand-gold-rich/25 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-brand-gold-rich">
                  <Star className="w-4 h-4 fill-brand-gold-rich" />
                  <span className="text-xs font-bold tracking-wider font-mono">Expert Human Assistance</span>
                </div>
                <p className="text-[10px] text-gray-300 leading-normal">
                  Need official certified agents to look up specific, custom, master or doctoral projects? Submit an official regional assessing form directly below.
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
          
          <div className="glassmorphism rounded-[32px] p-8 sm:p-12 relative overflow-hidden max-w-4xl mx-auto" id="application-form-panel">
            
            <div className="absolute top-0 right-0 w-44 h-44 bg-brand-gold-rich/5 rounded-bl-full pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Form text description Left */}
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-1.5 text-brand-gold-rich font-mono text-[10px] font-bold tracking-widest uppercase">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Certified Verification</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-semibold leading-tight">
                  Schedule Free Academic Auditing
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Ready to translate your study pathways into active admissions? Submitting this preliminary file initiates your formal dossier appraisal.
                </p>

                <div className="space-y-3 font-mono text-[10px] text-gray-400 pt-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-brand-gold-rich" />
                    <span>Certified Academic Evaluation</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-brand-gold-rich" />
                    <span>Direct Pathway Matching Reports</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-brand-gold-rich" />
                    <span>Zero Enrollment Commission Fees</span>
                  </div>
                </div>
              </div>

              {/* Form Submission fields Right */}
              <div className="lg:col-span-7">
                
                {formSubmitted ? (
                  <div className="p-6 bg-brand-emerald-deep/40 border border-brand-gold-rich rounded-2xl text-center space-y-4">
                    <div className="w-14 h-14 bg-brand-gold-rich text-brand-emerald-dark rounded-full flex items-center justify-center mx-auto text-3xl font-sans">
                      ✓
                    </div>
                    <h4 className="font-serif text-lg text-white font-bold tracking-wide">
                      Application Lodged Successfully!
                    </h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto leading-normal">
                      Excellent. We have compiled your dossiers! An admissions specialist representing your region will review your cumulative score records and initiate communication.
                    </p>
                    
                    <div className="p-4 bg-brand-emerald-dark/60 rounded-xl border border-white/5 text-left text-[11px] font-mono text-gray-300 space-y-1">
                      <div><strong className="text-white">Reference Id:</strong> ECO-{Math.floor(Math.random() * 90000) + 10000}</div>
                      <div><strong className="text-white">Applicant Name:</strong> {formData.fullName || 'Prospective Student'}</div>
                      <div><strong className="text-white">Assessing Route:</strong> {COUNTRIES.find(c => c.id === formData.targetCountry)?.name || 'USA'} Visa Path</div>
                      <div><strong className="text-white">Intake Timeline:</strong> Autumn (Fall) Intake</div>
                    </div>

                    <button 
                      onClick={() => setFormSubmitted(false)}
                      className="px-4 py-2 bg-brand-gold-rich text-brand-emerald-dark text-xs font-bold tracking-wider uppercase rounded-xl hover:scale-105 active:scale-95 transition-all w-full cursor-pointer"
                    >
                      Fill Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4" id="consultation-form">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Candidate Name *</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. John Doe"
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2.5 bg-brand-emerald-dark/45 border border-brand-gold-rich/15 rounded-xl text-xs text-white focus:outline-none focus:border-brand-gold-rich transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Contact Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            required
                            placeholder="e.g. name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2.5 bg-brand-emerald-dark/45 border border-brand-gold-rich/15 rounded-xl text-xs text-white focus:outline-none focus:border-brand-gold-rich transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Telephone / WhatsApp Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +1 555-0199"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2.5 bg-brand-emerald-dark/45 border border-brand-gold-rich/15 rounded-xl text-xs text-white focus:outline-none focus:border-brand-gold-rich transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Study Country *</label>
                        <select
                          value={formData.targetCountry}
                          onChange={(e) => setFormData(prev => ({ ...prev, targetCountry: e.target.value }))}
                          className="w-full h-10 px-3 py-2 bg-brand-emerald-dark/45 border border-brand-gold-rich/20 rounded-xl text-xs text-white uppercase focus:outline-none focus:border-brand-gold-rich transition-all"
                        >
                          {COUNTRIES.map(c => (
                            <option key={c.id} value={c.id} className="bg-brand-emerald-dark text-white uppercase">{c.flag} {c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Current Qualification Status</label>
                        <select
                          value={formData.qualification}
                          onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                          className="w-full h-10 px-3 py-2 bg-brand-emerald-dark/45 border border-brand-gold-rich/20 rounded-xl text-xs text-white focus:outline-none focus:border-brand-gold-rich transition-all"
                        >
                          <option value="High School Diploma" className="bg-brand-emerald-dark text-white">Associate High School Diploma</option>
                          <option value="Bachelor Degree (Ongoing)" className="bg-brand-emerald-dark text-white">Undergrad Degree (Current Student)</option>
                          <option value="Bachelor Degree (Completed)" className="bg-brand-emerald-dark text-white">Bachelor Degree (Graduate)</option>
                          <option value="Master Degree" className="bg-brand-emerald-dark text-white">Postgrad Master Degree</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Proposed Professional Field</label>
                        <select
                          value={formData.fieldOfStudy}
                          onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                          className="w-full h-10 px-3 py-2 bg-brand-emerald-dark/45 border border-brand-gold-rich/20 rounded-xl text-xs text-white focus:outline-none focus:border-brand-gold-rich transition-all"
                        >
                          <option value="Engineering & Technology" className="bg-brand-emerald-dark text-white">Engineering & IT Technology</option>
                          <option value="Business & MBA Studies" className="bg-brand-emerald-dark text-white">Business Administration (MBA / MS)</option>
                          <option value="Health Sciences & Medicine" className="bg-brand-emerald-dark text-white">Health Sciences & Medicine</option>
                          <option value="Art & Product Design" className="bg-brand-emerald-dark text-white">Arts, Humanities & Design</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5 animate-pulse">
                      <p className="text-[10px] text-[#fef08a] font-semibold leading-normal">
                        *Tip: Setting your cumulative GPA to {gpa.toFixed(2)} and English indicator to {ielts.toFixed(1)} automatically matches partner criteria.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingForm}
                      className="w-full py-3.5 bg-brand-gold-rich hover:bg-brand-gold-glow text-brand-emerald-dark text-xs font-black tracking-widest uppercase rounded-xl shadow-lg shadow-brand-gold-rich/20 duration-200 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
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
                          <ChevronRight className="w-4 h-4" />
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
