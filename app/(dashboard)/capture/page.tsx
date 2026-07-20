import RecallifyLogo from "@/components/RecallifyLogo";
import SaveForm from "@/components/SaveForm";


export default function CapturePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10 pt-24 sm:pt-28 pb-12 px-4 sm:px-6 md:px-8 page-transition">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center mb-2">
          <RecallifyLogo size={48} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
          Capture Knowledge
        </h1>
        <p className="text-text-secondary text-sm md:text-base font-medium max-w-md mx-auto">
          Save a link or jot down a note. We'll automatically extract the insights and schedule them for review.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <SaveForm />
      </div>
    </div>
  );
}
