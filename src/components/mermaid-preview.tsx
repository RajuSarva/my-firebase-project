
"use client";

import { useEffect, useId, useState, useRef } from "react";
import mermaid from "mermaid";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { downloadFile } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

interface MermaidPreviewProps {
  chart: string;
  title: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    background: "#ffffff",
    primaryColor: "#F1EFF2",
    primaryTextColor: "#333",
    primaryBorderColor: "#94618E",
    lineColor: "#618E94",
    textColor: "#333",
    fontSize: "16px"
  }
});

export function MermaidPreview({ chart, title }: MermaidPreviewProps) {
  const id = useId();
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    if (chart) {
      try {
        mermaid
          .render(`mermaid-svg-${id}`, chart)
          .then(({ svg }) => {
            setSvg(svg);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Mermaid render error:", error);
            setSvg('<p class="text-destructive">Error rendering flowchart. Please check syntax.</p>');
            setLoading(false);
          });
      } catch (error) {
        console.error("Mermaid caught error:", error);
        setSvg('<p class="text-destructive">Invalid Mermaid syntax.</p>');
        setLoading(false);
      }
    } else {
        setSvg(null);
        setLoading(false);
    }
  }, [chart, id]);
  
  const downloadPNG = () => {
    if (!svg || !svgRef.current) return;
    
    const svgElement = svgRef.current.querySelector('svg');
    if (!svgElement) {
        console.error("Could not find SVG element to measure.");
        return;
    }

    const img = new Image();
    const svgDataUri = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));

    img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Get dimensions from the rendered SVG for accuracy
        const { width: svgWidth, height: svgHeight } = svgElement.getBoundingClientRect();
        
        if (svgWidth === 0 || svgHeight === 0) {
          console.error("Could not determine SVG dimensions from rendered element.");
          return;
        }

        const scale = 2; // For higher resolution
        const padding = 20 * scale;
        const headerHeight = 60 * scale;

        canvas.width = svgWidth * scale + padding * 2;
        canvas.height = svgHeight * scale + padding * 2 + headerHeight;

        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header Text
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        
        ctx.font = `bold ${16 * scale}px Arial`;
        ctx.fillText(title, canvas.width / 2, padding + (10 * scale));

        ctx.font = `${12 * scale}px Arial`;
        ctx.fillText(`Prepared by Team Geega Tech`, canvas.width / 2, padding + (28 * scale));
        ctx.fillText(`Date: ${currentDate}`, canvas.width / 2, padding + (44 * scale));

        // Draw Diagram
        const imageX = padding;
        const imageY = padding + headerHeight;
        ctx.drawImage(img, imageX, imageY, svgWidth * scale, svgHeight * scale);

        const pngUrl = canvas.toDataURL("image/png");
        downloadFile({ content: pngUrl, fileName: `${title || 'flowchart'}.png`, contentType: 'image/png' });
    };

    img.onerror = (error) => {
        console.error("Image load error:", error);
    };

    img.src = svgDataUri;
};


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title || "Generated Flowchart"}</CardTitle>
        {svg && (
            <Button variant="outline" size="sm" onClick={downloadPNG}>
              <Download className="mr-2 h-4 w-4" /> Download PNG
            </Button>
        )}
      </CardHeader>
      <CardContent className="min-h-[200px] flex items-center justify-center bg-card rounded-b-lg p-4 overflow-auto">
        {loading && <Skeleton className="w-full h-[300px]" />}
        {!loading && svg && (
          <div ref={svgRef} dangerouslySetInnerHTML={{ __html: svg }} />
        )}
        {!loading && !svg && (
          <p className="text-muted-foreground">Your generated flowchart will appear here.</p>
        )}
      </CardContent>
    </Card>
  );
}
