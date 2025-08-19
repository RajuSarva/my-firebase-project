
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
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.crossOrigin = "anonymous"; // Fix for tainted canvas error
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const padding = 40;
      const headerHeight = 80; // Space for title, prepared by, and date

      canvas.width = Math.max(img.width, 600) + padding * 2;
      canvas.height = img.height + padding * 2 + headerHeight;

      const ctx = canvas.getContext("2d");
      if(ctx) {
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0,0, canvas.width, canvas.height);
        
        // Header Text
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        ctx.fillStyle = '#333';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, canvas.width / 2, padding + 10);

        ctx.font = '14px Arial';
        ctx.fillText(`Prepared by Team Geega Tech`, canvas.width / 2, padding + 35);
        ctx.fillText(`Date: ${currentDate}`, canvas.width / 2, padding + 55);

        // Draw Diagram
        const imageX = (canvas.width - img.width) / 2;
        ctx.drawImage(img, imageX, padding + headerHeight);

        const pngUrl = canvas.toDataURL("image/png");
        downloadFile({ content: pngUrl, fileName: `${title || 'flowchart'}.png`, contentType: 'image/png' });
        URL.revokeObjectURL(url);
      }
    };
    img.src = url;
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
