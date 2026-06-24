"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Award,
  Download,
  Share2,
  Linkedin,
  Twitter,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CertificateRevealProps {
  certificateId: string;
  courseTitle: string;
  userName: string;
  issuedAt: string;
  className?: string;
}

export function CertificateReveal({
  certificateId,
  courseTitle,
  userName,
  issuedAt,
  className,
}: CertificateRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const certificateUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/certificates/${certificateId}`;

  const handleShare = (platform: "linkedin" | "twitter" | "copy") => {
    const text = `J'ai obtenu mon certificat "${courseTitle}" sur FYGS ! 🎉`;

    switch (platform) {
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`,
          "_blank",
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(certificateUrl)}`,
          "_blank",
        );
        break;
      case "copy":
        navigator.clipboard.writeText(certificateUrl);
        toast.success("Lien copié !");
        break;
    }
    setShowShareMenu(false);
  };

  const formattedDate = new Date(issuedAt).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="pre-reveal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center space-y-6 p-8"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Award className="h-20 w-20 text-yellow-500 mx-auto" />
            </motion.div>
            <h2 className="text-2xl font-bold">Félicitations !</h2>
            <p className="text-muted-foreground">
              Vous avez terminé le cours &ldquo;{courseTitle}&rdquo;
            </p>
            <Button size="lg" onClick={() => setRevealed(true)}>
              Révéler mon certificat
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="certificate"
            initial={{ opacity: 0, y: 40, rotateX: 45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="space-y-6"
          >
            {/* Certificate card */}
            <div className="relative border-2 border-yellow-500/50 rounded-xl p-8 bg-gradient-to-br from-yellow-50/10 to-amber-50/5 overflow-hidden">
              {/* Corner decorations */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-yellow-500/30 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-yellow-500/30 rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-yellow-500/30 rounded-br-lg" />

              <div className="text-center space-y-4">
                <Award className="h-12 w-12 text-yellow-500 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Certificat de réussite
                  </p>
                  <h3 className="text-xl font-bold">{courseTitle}</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-medium">{userName}</p>
                  <p className="text-sm text-muted-foreground">
                    Délivré le {formattedDate}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {certificateId}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" asChild>
                <a href={`/api/certificates/${certificateId}/pdf`} download>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </a>
              </Button>

              <div className="relative">
                <Button onClick={() => setShowShareMenu((s) => !s)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>

                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 right-0 bg-popover border rounded-lg shadow-lg p-2 z-50 min-w-[180px]"
                  >
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-accent text-sm"
                    >
                      <Linkedin className="h-4 w-4 text-blue-600" />
                      LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare("twitter")}
                      className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-accent text-sm"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter / X
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-accent text-sm"
                    >
                      <Link2 className="h-4 w-4" />
                      Copier le lien
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
