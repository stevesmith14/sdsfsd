"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Play, 
  Camera, 
  Link as LinkIcon, 
  FileText, 
  Lightbulb, 
  Code,
  Calendar,
  Trash2,
  Loader2,
  X,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";

interface ContentCardProps {
  item: {
    _id: string;
    type: string;
    title: string;
    summary: string;
    rawContent?: string;
    category: string;
    tags: string[];
    createdAt: string;
    processingStatus: string;
    importanceScore: number;
    sourcePlatform?: string;
    sourceUrl?: string;
    thumbnailUrl?: string;
  };
  layout?: "grid" | "list";
}

const getPlatformIcon = (platform?: string, type?: string) => {
  const iconClass = "w-4 h-4";
  if (platform?.toLowerCase().includes("youtube")) return <Play className={`${iconClass} text-red-500 fill-red-500`} />;
  if (platform?.toLowerCase().includes("instagram")) return <Camera className={`${iconClass} text-pink-500`} />;
  if (type === "note") return <FileText className={`${iconClass} text-emerald-500`} />;
  if (type === "idea") return <Lightbulb className={`${iconClass} text-amber-500`} />;
  if (type === "snippet") return <Code className={`${iconClass} text-sky-500`} />;
  return <LinkIcon className={`${iconClass} text-text-primary`} />;
};

export default function ContentCard({ item, layout = "grid" }: ContentCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isProcessing = item.processingStatus === "processing";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/content/${item._id}`, { method: "DELETE" });
      if (res.ok) window.location.reload();
      else alert("Delete failed");
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/content/${item._id}`);
  };

  const isList = layout === "list";

  return (
    <>
      <motion.div
        onClick={handleCardClick}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`group relative flex h-full overflow-hidden bg-bg-surface hover:bg-bg-elevated rounded-2xl border border-transparent hover:border-border transition-all duration-300 cursor-pointer select-none shadow-sm hover:shadow-md ${
          isList 
            ? "flex-col md:flex-row gap-6 p-6" 
            : "flex-col p-5"
        }`}
      >
        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/10 overflow-hidden z-20">
            <motion.div 
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-1/2 h-full bg-primary"
            />
          </div>
        )}

        {/* Thumbnail or Icon header */}
        {item.thumbnailUrl ? (
          <div className={`relative shrink-0 rounded-xl overflow-hidden bg-bg-root ${
            isList ? "w-full md:w-[280px] aspect-video" : "w-full aspect-[16/10] mb-5"
          }`}>
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
            <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-bg-surface/90 backdrop-blur-md shadow-sm flex items-center justify-center">
              {getPlatformIcon(item.sourcePlatform, item.type)}
            </div>
          </div>
        ) : (
          <div className={`flex items-start gap-4 ${isList ? "w-[280px] shrink-0" : "mb-5"}`}>
            <div className="w-12 h-12 rounded-2xl bg-bg-root border border-border flex items-center justify-center shrink-0 group-hover:bg-primary-glow group-hover:border-primary/20 transition-colors duration-300">
              {getPlatformIcon(item.sourcePlatform, item.type)}
            </div>
            {!isList && (
              <div className="flex-1 min-w-0 pt-1">
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest block truncate mb-1">
                  {item.category || "General"}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {(() => {
                    if (!item.createdAt) return "Just now";
                    const d = new Date(item.createdAt);
                    return isNaN(d.getTime()) ? "Just now" : format(d, "MMM d, yyyy");
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Metadata for list view when no thumbnail */}
          {isList && !item.thumbnailUrl && (
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
                {item.category || "General"}
              </span>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
                {(() => {
                  if (!item.createdAt) return "Just now";
                  const d = new Date(item.createdAt);
                  return isNaN(d.getTime()) ? "Just now" : format(d, "MMM d, yyyy");
                })()}
              </div>
            </div>
          )}
          
          <div className="flex-1 flex flex-col gap-3">
            <h4 className="text-[18px] md:text-[20px] font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
              {item.title}
            </h4>

            {/* User note preview */}
            {item.rawContent && item.type !== "link" && (
              <div className="bg-bg-root rounded-xl p-4 relative overflow-hidden mt-1">
                <div className="absolute top-0 left-0 w-[3px] h-full bg-primary/40" />
                <p className="text-[14px] text-text-secondary font-medium leading-relaxed line-clamp-2 italic">
                  &ldquo;{item.rawContent}&rdquo;
                </p>
              </div>
            )}

            {/* Summary */}
            <p className="text-[14px] text-text-secondary leading-relaxed line-clamp-3 font-medium mt-1">
              {item.summary || (isProcessing ? "Generating summary..." : "No summary available.")}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-border/50 flex items-center justify-between">
            <div className="flex flex-wrap gap-2 min-w-0 select-none">
              {item.tags?.slice(0, 3).map(tag => (
                <span 
                  key={tag} 
                  className="px-2.5 py-1 bg-bg-root rounded-md text-[11px] font-semibold text-text-muted hover:text-text-primary transition-colors"
                >
                  #{tag}
                </span>
              ))}
              {item.tags?.length > 3 && (
                <span className="text-[11px] text-text-muted font-bold self-center shrink-0 ml-1">+{item.tags.length - 3}</span>
              )}
            </div>
  
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteModal(true); }}
                disabled={isDeleting}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-error hover:bg-error-muted transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Delete"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-primary bg-primary-glow opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all transform sm:translate-x-2 sm:group-hover:translate-x-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Custom Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="modal-card p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-full bg-error-muted flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-error" />
                </div>
                <button onClick={() => setShowDeleteModal(false)} className="p-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer rounded-full hover:bg-bg-root">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-[20px] font-bold text-text-primary mb-2" style={{ fontFamily: 'var(--font-display)' }}>Delete Item?</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed mb-8">
                This will permanently remove <span className="text-text-primary font-bold">&ldquo;{item.title}&rdquo;</span> from your library. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="btn-outline flex-1 h-12 text-[14px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 h-12 rounded-xl bg-error text-white text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Permanently"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
