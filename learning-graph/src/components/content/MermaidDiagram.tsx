import React, { useEffect, useRef, useState, useId } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
});

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const uniqueId = useId().replace(/[:]/g, '_');

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      try {
        setError(null);
        const { svg: renderedSvg } = await mermaid.render(`mermaid-${uniqueId}`, chart.trim());
        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Mermaid rendering error:', err);
          setError(err?.message || 'Failed to render diagram');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, uniqueId]);

  if (error) {
    return (
      <div className="my-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs">
        <p className="font-semibold text-rose-600 dark:text-rose-400 mb-1">Diagram Render Error</p>
        <pre className="font-mono text-[11px] text-slate-600 dark:text-slate-400 overflow-x-auto">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="my-6 p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto flex justify-center items-center">
      {svg ? (
        <div
          ref={containerRef}
          className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="py-8 text-xs text-slate-400 animate-pulse">Rendering diagram...</div>
      )}
    </div>
  );
};
