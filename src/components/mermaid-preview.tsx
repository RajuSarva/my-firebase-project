
"use client";

import { useEffect, useId, useState } from "react";
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
    if (!svg) return;

    const img = new Image();
    const svgDataUri = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));

    img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Use the natural dimensions of the loaded image.
        const svgWidth = img.naturalWidth;
        const svgHeight = img.naturalHeight;
        
        if (svgWidth === 0 || svgHeight === 0) {
          console.error("Could not determine SVG dimensions from image.");
          return;
        }

        const scale = 2; // For higher resolution
        const padding = 40 * scale;
        const headerHeight = 80 * scale;

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
        
        ctx.font = `bold ${20 * scale}px Arial`;
        ctx.fillText(title, canvas.width / 2, padding + (10 * scale));

        ctx.font = `${14 * scale}px Arial`;
        ctx.fillText(`Prepared by Team Geega Tech`, canvas.width / 2, padding + (35 * scale));
        ctx.fillText(`Date: ${currentDate}`, canvas.width / 2, padding + (55 * scale));

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
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        )}
        {!loading && !svg && (
          <p className="text-muted-foreground">Your generated flowchart will appear here.</p>
        )}
      </CardContent>
    </Card>
  );
}
