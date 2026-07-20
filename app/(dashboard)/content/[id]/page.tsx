"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Trash2, 
  Clock,
  Pencil,
  Globe,
  Database,
  Layers,
  ChevronDown,
  ChevronUp,
  BookOpen,
  X,
  Loader2
} from "lucide-react";
import ContentCard from "@/components/ContentCard";

export default function ContentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [editManual, setEditManual] = useState(false);
  const [manualDraft, setManualDraft] = useState("");
  const [editTitle, setEditTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/content/${id}`);
      const data = await res.json();
      if (data.success) {
        setItem(data.data.item);
        setRelatedItems(data.data.related || []);
        setManualDraft(data.data.item.manualNote || "");
        setTitleDraft(data.data.item.title || "");
      }
    } catch (err) {
      console.error("Fetch detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (payload: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Update failed");
      setItem(data.data);
      return true;
    } catch (err) {
      console.error("Update error:", err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/content/${id}`, { method: "DELETE" });
      if (res.ok) router.push("/library");
      else alert("Delete failed");
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const toggleRevealQuestion = (idx: number) => {
    setRevealedQuestions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 select-none">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.25em]">Loading...</span>
    </div>
  );

  if (!item) return (
    <div className="border border-dashed border-border p-12 rounded-xl flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto select-none mt-10">
       <div className="w-12 h-12 rounded-full bg-error-muted border border-error/15 flex items-center justify-center text-error">
          <Database className="w-5 h-5" />
       </div>
       <div className="space-y-1">
          <h2 className="text-base font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Item Not Found</h2>
          <p className="text-[12px] text-text-secondary leading-normal">This item may have been deleted or doesn't exist.</p>
       </div>
       <button onClick={() => router.push("/library")} className="btn-primary h-9 px-4 text-xs tracking-wider flex items-center gap-1.5 cursor-pointer mt-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
       </button>
    </div>
  );

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-8 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 md:px-8 page-transition">
        {/* Top Controls Header */}
        <nav className="flex items-center justify-between border-b border-border pb-4 select-none">
          <button 
            onClick={() => router.back()}
            className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-elevated active:scale-95 transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setShowDeleteModal(true)}
               className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error-muted active:scale-95 transition-all cursor-pointer"
               aria-label="Delete item"
             >
                <Trash2 className="w-4 h-4" />
             </button>
          </div>
        </nav>

        {/* Main Reading column */}
        <div className="space-y-10">
          
          {/* Header Section */}
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 select-none">
              <span className="badge-warm">
                <Layers className="w-3 h-3" /> {item.category || "General"}
              </span>
              <span className="px-3 py-1 bg-bg-root border border-border rounded-full text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> {item.sourcePlatform || item.type}
              </span>
            </div>

            {/* Dynamic Title with Edit Option */}
            <div className="relative group">
              {editTitle ? (
                <div className="space-y-3">
                   <input
                    className="w-full text-xl md:text-2xl font-bold pb-2 bg-transparent border-b border-primary text-text-primary focus:outline-none"
                    style={{ fontFamily: 'var(--font-display)' }}
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    maxLength={200}
                    autoFocus
                  />
                  <div className="flex gap-2 select-none">
                    <button onClick={async () => (await updateItem({ title: titleDraft })) && setEditTitle(false)} className="btn-primary h-8 px-4 text-[11px] uppercase font-bold cursor-pointer">Save</button>
                    <button onClick={() => { setEditTitle(false); setTitleDraft(item.title); }} className="btn-ghost h-8 px-4 text-[11px] uppercase font-bold cursor-pointer">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                    {item.title}
                  </h1>
                  <button 
                    onClick={() => setEditTitle(true)} 
                    className="p-1.5 rounded-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary hover:bg-bg-elevated cursor-pointer shrink-0 mt-1"
                    aria-label="Edit title"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Date and Source */}
            <div className="flex flex-wrap items-center gap-6 text-[11px] text-text-muted select-none border-b border-border pb-6">
               <div className="flex items-center gap-1.5 font-medium uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-primary-light" /> {(() => {
                    if (!item.createdAt) return "Just now";
                    const d = new Date(item.createdAt);
                    return isNaN(d.getTime()) ? "Just now" : d.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
                  })()}
               </div>
               {item.sourceUrl && (
                 <a 
                   href={item.sourceUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-all underline underline-offset-4 decoration-border-strong hover:decoration-text-secondary"
                 >
                   View Source
                 </a>
               )}
            </div>
          </div>

          {/* Personal Notes */}
          <section className="relative group">
             <div className="p-6 rounded-xl bg-bg-surface border border-border flex flex-col gap-4 relative overflow-hidden transition-colors hover:border-border-hover">
                <div className="absolute top-0 left-0 w-[3px] h-full bg-primary" />
                
                <div className="flex items-center justify-between select-none">
                   <div className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <Pencil className="w-3.5 h-3.5" /> Personal Notes
                   </div>
                   
                   {!editManual ? (
                      <button 
                        onClick={() => setEditManual(true)} 
                        className="p-1.5 hover:bg-bg-elevated rounded-md text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        aria-label="Edit notes"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                   ) : (
                      <div className="flex gap-2 select-none">
                        <button onClick={async () => (await updateItem({ manualNote: manualDraft })) && setEditManual(false)} className="px-3 py-1.5 bg-primary text-bg-root rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-accent-end transition-colors">Save</button>
                        <button onClick={() => { setEditManual(false); setManualDraft(item.manualNote || ""); }} className="px-3 py-1.5 bg-bg-elevated rounded-md text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors cursor-pointer">Cancel</button>
                      </div>
                   )}
                </div>

                {editManual ? (
                   <textarea
                    className="input-premium w-full min-h-[120px] text-[13px] leading-relaxed font-medium bg-bg-input"
                    value={manualDraft}
                    onChange={(e) => setManualDraft(e.target.value)}
                    maxLength={2000}
                    placeholder="Add your own notes, context, or takeaways here..."
                  />
                ) : (
                   <div className="text-[14px] text-text-primary leading-relaxed font-medium italic opacity-95">
                    &ldquo;{item.manualNote?.trim()?.length ? item.manualNote : "Tap the pencil icon to add your own notes or takeaways."}&rdquo;
                  </div>
                )}
             </div>
          </section>

          {/* AI Summary Section */}
          <section className="space-y-4">
              <div className="flex items-center gap-2.5 select-none">
                
                <h2 className="text-[18px] font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Summary</h2>
              </div>
              
              <div className="p-6 rounded-xl bg-bg-surface border border-border">
                 <p className="text-[14px] text-text-secondary leading-relaxed font-medium">
                   {item.summary || (item.processingStatus === "processing" ? "Generating summary..." : "No summary available.")}
                 </p>
              </div>
          </section>

          {/* Original Content */}
          {item.rawContent && item.type === "link" && (
            <section className="space-y-4">
               <div className="flex items-center gap-2.5 select-none">
                  <div className="w-8 h-8 rounded-lg bg-bg-surface border border-border flex items-center justify-center">
                     <BookOpen className="w-4 h-4 text-text-muted" />
                  </div>
                  <h2 className="text-[18px] font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Original Content</h2>
               </div>
               <div className="p-6 rounded-xl bg-bg-surface border border-border max-h-[300px] overflow-y-auto custom-scrollbar">
                  <p className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap font-medium">
                     {item.rawContent}
                  </p>
               </div>
            </section>
          )}

          {/* Flashcards */}
          {item.aiQuestions?.length > 0 && (
             <section className="space-y-5">
                <div className="space-y-1.5 select-none">
                  <div className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      Study Cards
                  </div>
                  <h2 className="text-[18px] font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Review these concepts</h2>
                </div>
                
                <div className="space-y-4">
                   {item.aiQuestions.map((q: any, i: number) => {
                     const questionText = typeof q === 'string' ? q : q.question;
                     const answerText = typeof q === 'object' ? q.answer : null;
                     const isRevealed = !!revealedQuestions[i];
                     
                     return (
                       <div 
                         key={i}
                         className="p-6 rounded-xl bg-bg-surface border border-border flex flex-col gap-4 transition-all duration-200 hover:border-border-hover"
                       >
                          <div className="flex items-start gap-4">
                            <div className="w-7 h-7 rounded-lg bg-bg-elevated border border-border flex items-center justify-center shrink-0 text-[11px] font-bold text-text-muted">
                              {i+1}
                            </div>
                            <div className="flex-1 mt-0.5">
                               <p className="text-[14px] font-bold text-text-primary leading-normal">{questionText}</p>
                            </div>
                          </div>

                          {answerText && (
                            <div className="pt-3 flex flex-col gap-3 border-t border-border mt-2 select-none">
                              <button
                                onClick={() => toggleRevealQuestion(i)}
                                className="self-start text-[11px] font-bold uppercase tracking-wider text-primary hover:text-primary-light flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                {isRevealed ? (
                                  <>Hide Answer <ChevronUp className="w-4 h-4" /></>
                                ) : (
                                  <>Reveal Answer <ChevronDown className="w-4 h-4" /></>
                                )}
                              </button>

                              <AnimatePresence initial={false}>
                                {isRevealed && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="overflow-hidden"
                                  >
                                    <p className="text-[13px] text-text-secondary leading-relaxed bg-bg-elevated p-4 rounded-lg border border-border mt-2 font-medium select-text">
                                      {answerText}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                       </div>
                     );
                   })}
                </div>
             </section>
          )}

          {/* Tags */}
          {item.tags?.length > 0 && (
            <section className="pt-6 border-t border-border select-none">
               <div className="flex flex-wrap gap-2">
                  {item.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-bg-surface border border-border rounded-md text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      #{tag}
                    </span>
                  ))}
               </div>
            </section>
          )}

          {/* Related Content */}
          {relatedItems.length > 0 && (
            <section className="space-y-5 pt-10 border-t border-border">
              <h3 className="text-[12px] font-bold text-text-primary uppercase tracking-[0.15em] select-none">
                Related Items
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedItems.map((relItem: any) => (
                  <ContentCard key={relItem._id} item={relItem} />
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Delete Confirmation Modal */}
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
              transition={{ duration: 0.15 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>Delete this item?</h3>
                <button onClick={() => setShowDeleteModal(false)} className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-6 font-medium">
                This will permanently remove <span className="text-text-primary">&ldquo;{item.title}&rdquo;</span>. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="btn-ghost flex-1 h-10 text-[13px] cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 h-10 rounded-lg bg-error text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
