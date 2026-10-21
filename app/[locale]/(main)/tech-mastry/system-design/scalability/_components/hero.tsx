"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowUpRight, BarChart4 } from "lucide-react";

export function ScalabilityHero() {
  return (
    <section className="space-y-10 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-transparent to-purple-500/10 rounded-3xl blur-3xl opacity-30"></div>
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-col items-center text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center p-4 rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-500 shadow-lg shadow-indigo-500/10"
        >
          <BarChart4 className="w-10 h-10" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-500">
            Scalabilité & Performance
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Techniques et principes pour concevoir des systèmes hautement
            évolutifs et performants à grande échelle
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          <Badge
            variant="secondary"
            className="text-sm px-4 py-1.5 bg-linear-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/20 transition-colors duration-300"
          >
            Load Balancing
          </Badge>
          <Badge
            variant="secondary"
            className="text-sm px-4 py-1.5 bg-linear-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/20 transition-colors duration-300"
          >
            Caching
          </Badge>
          <Badge
            variant="secondary"
            className="text-sm px-4 py-1.5 bg-linear-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/20 transition-colors duration-300"
          >
            Database Sharding
          </Badge>
          <Badge
            variant="secondary"
            className="text-sm px-4 py-1.5 bg-linear-to-r from-cyan-500/10 to-teal-500/10 border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/20 transition-colors duration-300"
          >
            CDN
          </Badge>
          <Badge
            variant="secondary"
            className="text-sm px-4 py-1.5 bg-linear-to-r from-teal-500/10 to-emerald-500/10 border-teal-500/20 hover:border-teal-500/40 hover:bg-teal-500/20 transition-colors duration-300"
          >
            Horizontal Scaling
          </Badge>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
      >
        <div className="p-6 rounded-xl border border-indigo-500/20 bg-background/60 backdrop-blur-xs hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 space-y-4 group">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold group-hover:text-indigo-500 transition-colors duration-300">
                Visualisations Interactives
              </h2>
            </div>
            <ArrowUpRight className="h-4 w-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="h-0.5 w-16 bg-linear-to-r from-indigo-500/50 to-purple-500/50 rounded-full group-hover:w-full transition-all duration-500"></div>
          <p className="text-muted-foreground">
            Explorez des visualisations interactives pour comprendre les
            concepts clés de scalabilité et de performance.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-purple-500/20 bg-background/60 backdrop-blur-xs hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 space-y-4 group">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-linear-to-br from-purple-500/10 to-pink-500/10 text-purple-500 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2H2v10h10V2Z" />
                  <path d="M22 12h-8v10h8V12Z" />
                  <path d="M12 12H2v10h10V12Z" />
                  <path d="M22 2h-8v8h8V2Z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold group-hover:text-purple-500 transition-colors duration-300">
                Principes Fondamentaux
              </h2>
            </div>
            <ArrowUpRight className="h-4 w-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="h-0.5 w-16 bg-linear-to-r from-purple-500/50 to-pink-500/50 rounded-full group-hover:w-full transition-all duration-500"></div>
          <p className="text-muted-foreground">
            Découvrez les principes fondamentaux qui sous-tendent la conception
            de systèmes évolutifs.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-blue-500/20 bg-background/60 backdrop-blur-xs hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 space-y-4 group">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-linear-to-br from-blue-500/10 to-cyan-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="m4.93 4.93 2.83 2.83" />
                  <path d="m16.24 16.24 2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                  <path d="m4.93 19.07 2.83-2.83" />
                  <path d="m16.24 7.76 2.83-2.83" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold group-hover:text-blue-500 transition-colors duration-300">
                Techniques Avancées
              </h2>
            </div>
            <ArrowUpRight className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="h-0.5 w-16 bg-linear-to-r from-blue-500/50 to-cyan-500/50 rounded-full group-hover:w-full transition-all duration-500"></div>
          <p className="text-muted-foreground">
            Apprenez des techniques avancées pour optimiser les performances et
            gérer la charge à grande échelle.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
