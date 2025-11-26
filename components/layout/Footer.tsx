"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8 text-sm text-slate-600 font-sans">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* --- TOP SECTION: LINKS COLUMNS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Column 1: Football */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Football</h3>
            <ul className="space-y-2">
              <li><Link href="/?sport=football&league=39" className="hover:text-blue-600 transition-colors">Premier League</Link></li>
              <li><Link href="/?sport=football&league=2" className="hover:text-blue-600 transition-colors">Champions League</Link></li>
              <li><Link href="/?sport=football&league=140" className="hover:text-blue-600 transition-colors">La Liga</Link></li>
              <li><Link href="/?sport=football&league=135" className="hover:text-blue-600 transition-colors">Serie A</Link></li>
              <li><Link href="/?sport=football&league=78" className="hover:text-blue-600 transition-colors">Bundesliga</Link></li>
              <li><Link href="/?sport=football&league=61" className="hover:text-blue-600 transition-colors">Ligue 1</Link></li>
            </ul>
          </div>

          {/* Column 2: Basketball & US Sports */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">US Sports</h3>
            <ul className="space-y-2">
              <li><Link href="/?sport=nba" className="hover:text-blue-600 transition-colors">NBA</Link></li>
              <li><Link href="/?sport=nfl" className="hover:text-blue-600 transition-colors">NFL</Link></li>
              <li><Link href="/?sport=baseball" className="hover:text-blue-600 transition-colors">MLB (Baseball)</Link></li>
              <li><Link href="/?sport=hockey" className="hover:text-blue-600 transition-colors">NHL (Hockey)</Link></li>
              <li><Link href="/?sport=basketball&league=2" className="hover:text-blue-600 transition-colors">EuroLeague</Link></li>
            </ul>
          </div>

          {/* Column 3: Racing & Fighting */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Motorsport & MMA</h3>
            <ul className="space-y-2">
              <li><Link href="/?sport=f1" className="hover:text-blue-600 transition-colors">Formula 1</Link></li>
              <li><Link href="/?sport=mma" className="hover:text-blue-600 transition-colors">UFC / MMA</Link></li>
              <li><Link href="/?sport=f1&view=drivers" className="hover:text-blue-600 transition-colors">F1 Drivers</Link></li>
              <li><Link href="/?sport=f1&view=teams" className="hover:text-blue-600 transition-colors">F1 Teams</Link></li>
            </ul>
          </div>

          {/* Column 4: Global */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">International</h3>
            <ul className="space-y-2">
              <li><Link href="/?sport=football&league=1" className="hover:text-blue-600 transition-colors">World Cup</Link></li>
              <li><Link href="/?sport=football&league=4" className="hover:text-blue-600 transition-colors">Euro</Link></li>
              <li><Link href="/?sport=football&league=13" className="hover:text-blue-600 transition-colors">Copa Libertadores</Link></li>
              <li><Link href="/?sport=football&league=5" className="hover:text-blue-600 transition-colors">Nations League</Link></li>
            </ul>
          </div>

          {/* Column 5: Application */}
          <div className="col-span-2 lg:col-span-1">
             <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">FlashSport</h3>
             <ul className="space-y-2 text-xs">
               <li><a href="#" className="hover:text-blue-600">Terms of Use</a></li>
               <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
               <li><a href="#" className="hover:text-blue-600">GDPR</a></li>
               <li><a href="#" className="hover:text-blue-600">Contact</a></li>
             </ul>
          </div>
        </div>

        {/* --- MIDDLE SECTION: BRAND & SOCIAL --- */}
        <div className="border-t border-gray-100 pt-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">F</div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">FlashSport</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-6">
            <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all">
              <Facebook size={18} />
            </a>
            <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all">
              <Twitter size={18} />
            </a>
            <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all">
              <Instagram size={18} />
            </a>
          </div>

          {/* Mobile Apps (Visual Placeholders) */}
          <div className="flex gap-2">
            <button className="bg-slate-900 text-white px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-slate-800 transition-colors">
              <div className="text-[8px] uppercase leading-none text-left text-slate-400">Download on the<br/><span className="text-xs font-bold text-white">App Store</span></div>
            </button>
            <button className="bg-slate-900 text-white px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-slate-800 transition-colors">
              <div className="text-[8px] uppercase leading-none text-left text-slate-400">Get it on<br/><span className="text-xs font-bold text-white">Google Play</span></div>
            </button>
          </div>
        </div>

        {/* --- BOTTOM SECTION: COPYRIGHT --- */}
        <div className="border-t border-gray-100 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>Copyright © 2024 FlashSport.com</p>
          <div className="mt-2 md:mt-0 space-x-4">
            <a href="#" className="hover:text-slate-600">Lite Version</a>
            <a href="#" className="hover:text-slate-600">Set Privacy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}