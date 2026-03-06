import React from "react";

interface FormattedMessageProps {
  text: string;
}

function formatInline(line: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(\[(\d+)\])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <span
          key={match.index}
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold mx-0.5 align-middle"
        >
          {match[4]}
        </span>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts;
}

export const FormattedMessage = ({ text }: FormattedMessageProps) => {
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-2.5 text-sm leading-relaxed">
      {paragraphs.map((paragraph, pIdx) => {
        const lines = paragraph.split("\n");

        // Check if this paragraph is a reference block
        const isRefBlock = lines[0]?.match(/^r[ée]f[ée]rences?\s*:/i);
        if (isRefBlock) {
          return (
            <div
              key={pIdx}
              className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/10"
            >
              <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1.5">
                📄 {lines[0]}
              </p>
              {lines.slice(1).map((line, i) => (
                <p key={i} className="text-xs text-muted-foreground pl-2 border-l-2 border-primary/20 mt-1">
                  {formatInline(line.trim())}
                </p>
              ))}
            </div>
          );
        }

        // Check if all lines are list items
        const listItems = lines.filter((l) => /^[-•]\s/.test(l.trim()));
        if (listItems.length > 0 && listItems.length === lines.filter((l) => l.trim()).length) {
          return (
            <ul key={pIdx} className="space-y-1.5 pl-1">
              {listItems.map((item, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                  <span>{formatInline(item.replace(/^[-•]\s/, ""))}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Regular paragraph (may contain mixed content)
        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, i) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              if (/^[-•]\s/.test(trimmed)) {
                return (
                  <div key={i} className="flex gap-2 items-start pl-1">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                    <span>{formatInline(trimmed.replace(/^[-•]\s/, ""))}</span>
                  </div>
                );
              }
              return <p key={i}>{formatInline(trimmed)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};
