"use client";

import React from "react";
import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import "../globals.css";
import Link from "next/link";
import { Home } from "lucide-react";

interface Project {
  id?: number;
  title: string;
  cat: string;
  desc: string;
  tags: string[];
  img: string;
  link?: string;
  showOnHome?: boolean;
  homeSelectionOrder?: number | null;
}

function sortProjects(data: Project[]) {
  return [...data].sort((a: Project, b: Project) => {
    const aSelected = Boolean(a.showOnHome);
    const bSelected = Boolean(b.showOnHome);

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;

    if (aSelected && bSelected) {
      return (a.homeSelectionOrder ?? Number.MAX_SAFE_INTEGER) - (b.homeSelectionOrder ?? Number.MAX_SAFE_INTEGER);
    }

    return (b.id ?? 0) - (a.id ?? 0);
  });
}

function asProjectsArray(value: unknown): Project[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const candidate = item as Partial<Project>;

    return {
      id: typeof candidate.id === "number" ? candidate.id : index + 1,
      title: typeof candidate.title === "string" ? candidate.title : "",
      cat: typeof candidate.cat === "string" ? candidate.cat : "",
      desc: typeof candidate.desc === "string" ? candidate.desc : "",
      tags: Array.isArray(candidate.tags) ? candidate.tags.filter((tag): tag is string => typeof tag === "string") : [],
      img: typeof candidate.img === "string" ? candidate.img : "",
      link: typeof candidate.link === "string" ? candidate.link : "",
      showOnHome: Boolean(candidate.showOnHome),
      homeSelectionOrder:
        typeof candidate.homeSelectionOrder === "number" && Number.isInteger(candidate.homeSelectionOrder)
          ? candidate.homeSelectionOrder
          : null,
    };
  });
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        const response = await fetch('/api/projects', { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (!Array.isArray(data)) {
          clearTimeout(timeoutId);
          return;
        }

        setProjects(sortProjects(asProjectsArray(data)));
      } catch {
      } finally {
        clearTimeout(timeoutId);
      }
    };

    fetchProjects();
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-foreground">
      {/* Navbar removed as requested */}
      <section className="max-w-7xl mx-auto pt-4 px-2 sm:px-4 md:px-8">
        <div className="flex flex-col items-center justify-center mb-10 gap-2 sm:gap-4 md:gap-8 w-full">
            {/* House icon button removed as requested */}
          <div className="flex flex-col items-center text-center w-full">
            <div className="flex items-center gap-4 justify-center w-full">
              <div className="w-32 md:w-48 h-[3px] bg-[#ffb400]"></div>
              <span className="text-[#ffb400] font-black uppercase tracking-[0.4em] text-[11px] md:text-[12px]">Projects</span>
              <div className="w-32 md:w-48 h-[3px] bg-[#ffb400]"></div>
            </div>
            <h1 className="group text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-[1] md:leading-[0.85] tracking-tighter uppercase italic text-center mt-4 sm:mt-6">
              <span className="text-slate-900 transition-colors duration-300 group-hover:text-[#ffb400]">DIGITAL</span>{' '}<br />
              <span className="text-[#ffb400] not-italic transition-colors duration-300 group-hover:text-black">PROJECTS.</span>
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 md:gap-10">
          {projects.map((proj: Project, index: number) => (
            <div
              key={proj.id ?? index}
              className="group relative bg-slate-50/50 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-[2.5rem] p-2 sm:p-3 border border-slate-200/40 hover:bg-white hover:border-[#ffb400]/50 transition-all duration-500 shadow-[0_6px_24px_-8px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_48px_-12px_rgba(255,180,0,0.10)] flex flex-col min-h-0 overflow-visible"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg sm:rounded-[1.8rem] md:rounded-[2rem]">
                <Image
                  src={proj.img || "/logo.png"}
                  alt={proj.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {proj.cat && (
                  <div className="absolute top-4 md:top-6 left-4 md:left-6 bg-white/95 backdrop-blur-md border border-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl shadow-xl">
                    <span className="text-black font-black text-[9px] md:text-[10px] uppercase tracking-widest">{proj.cat}</span>
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-6 md:p-8 pb-6 sm:pb-8 md:pb-10 flex flex-col flex-grow gap-3 sm:gap-4 md:gap-5">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight italic leading-tight uppercase group-hover:text-[#ffb400] transition-colors duration-500">{proj.title}</h3>
                  <div className="w-8 sm:w-10 md:w-12 h-1 bg-[#ffb400] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm md:text-base leading-relaxed font-medium">
                  {proj.desc}
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2 py-1 md:py-2">
                  {proj.tags?.map((tag: string, tIndex: number) => (
                    <span
                      key={tIndex}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:bg-[#ffb400]/10 group-hover:border-[#ffb400]/20 group-hover:text-[#ffb400] transition-colors duration-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="pt-2 sm:pt-3 md:pt-4 mt-auto">
                  <a
                    href={proj.link || "#"}
                    target={proj.link ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between bg-black text-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px] hover:bg-[#ffb400] hover:text-black transition-all group/btn shadow-lg shadow-black/10 hover:shadow-[#ffb400]/20"
                  >
                    <span className="flex items-center gap-2 sm:gap-3">
                      Launch Experience
                    </span>
                    <ArrowUpRight size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Mobile only: Back to Home button below projects grid */}
        <div className="w-full flex justify-center mt-2 hidden">
          <a
            href="/"
            className="min-w-[120px] max-w-[180px] flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-black uppercase tracking-[0.15em] text-[11px] sm:text-[12px] hover:bg-[#ffb400] hover:text-black transition-all shadow-xl shadow-black/10 hover:shadow-[#ffb400]/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h5m4 0h5a1 1 0 001-1V10" />
            </svg>
            Back to Home
          </a>
        </div>
      </section>
      {/* Floating Home Button */}
      <Link
        href="/"
        aria-label="Back to Home"
        className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-[90] w-12 h-12 md:w-14 md:h-14 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-[#ffb400] shadow-2xl hover:bg-[#ffb400] hover:text-black hover:scale-110 transition-all duration-300 group"
      >
        <Home size={28} strokeWidth={2.5} />
      </Link>
    </main>
  );
}
