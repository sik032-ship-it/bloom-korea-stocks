interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
}

export const SpeechBubble = ({ children, className = "" }: SpeechBubbleProps) => {
  return (
    <div className={`relative bg-card border border-border rounded-2xl px-5 py-3 shadow-sm ${className}`}>
      {children}
      {/* Triangle pointer */}
      <div className="absolute -left-2 top-4 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-border" />
      <div className="absolute -left-[7px] top-4 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-card" />
    </div>
  );
};
