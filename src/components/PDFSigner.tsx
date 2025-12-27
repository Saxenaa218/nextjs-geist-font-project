"use client";

import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, FileUp, PenTool, RotateCcw, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export default function PDFSigner() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureX, setSignatureX] = useState([50]); // Percentage from left
  const [signatureY, setSignatureY] = useState([50]); // Percentage from top
  const [isProcessing, setIsProcessing] = useState(false);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string>("");
  
  const signatureCanvasRef = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      
      // Clean up previous URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      if (signedPdfUrl) {
        URL.revokeObjectURL(signedPdfUrl);
      }
      
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setSignedPdfUrl("");
      setSignatureDataUrl("");
    }
  };

  const handleClearSignature = () => {
    signatureCanvasRef.current?.clear();
  };

  const handleApplySignature = () => {
    if (signatureCanvasRef.current?.isEmpty()) {
      toast.error("Please draw a signature first");
      return;
    }
    
    const dataUrl = signatureCanvasRef.current?.toDataURL("image/png");
    if (dataUrl) {
      setSignatureDataUrl(dataUrl);
      setIsSignatureModalOpen(false);
      toast.success("Signature saved successfully");
    }
  };

  const handleEmbedSignature = async () => {
    if (!pdfFile || !signatureDataUrl) {
      toast.error("Please upload a PDF and draw a signature first");
      return;
    }

    setIsProcessing(true);

    try {
      // Read the PDF file
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Get the first page
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Embed the signature image
      const signatureImageBytes = await fetch(signatureDataUrl).then(res => res.arrayBuffer());
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      
      // Calculate signature dimensions (scale to reasonable size)
      const signatureWidth = 150;
      const signatureHeight = (signatureImage.height / signatureImage.width) * signatureWidth;

      // Calculate position based on percentages
      const x = (width * signatureX[0]) / 100 - signatureWidth / 2;
      const y = height - (height * signatureY[0]) / 100 - signatureHeight / 2;

      // Draw the signature on the page
      firstPage.drawImage(signatureImage, {
        x: Math.max(0, Math.min(x, width - signatureWidth)),
        y: Math.max(0, Math.min(y, height - signatureHeight)),
        width: signatureWidth,
        height: signatureHeight,
      });

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Create a blob and URL for the signed PDF
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      
      // Clean up previous signed PDF URL
      if (signedPdfUrl) {
        URL.revokeObjectURL(signedPdfUrl);
      }
      
      const url = URL.createObjectURL(blob);
      setSignedPdfUrl(url);
      
      toast.success("Signature applied successfully!");
    } catch (error) {
      console.error("Error embedding signature:", error);
      toast.error("Failed to embed signature. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!signedPdfUrl) {
      toast.error("Please apply the signature first");
      return;
    }

    const link = document.createElement("a");
    link.href = signedPdfUrl;
    link.download = `signed_${pdfFile?.name || "document.pdf"}`;
    link.click();
    toast.success("PDF downloaded successfully");
  };

  const handleStartOver = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    if (signedPdfUrl) {
      URL.revokeObjectURL(signedPdfUrl);
    }
    
    setPdfFile(null);
    setPdfUrl("");
    setSignedPdfUrl("");
    setSignatureDataUrl("");
    setSignatureX([50]);
    setSignatureY([50]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">PDF Signer</h1>
        <p className="text-muted-foreground">
          Sign your PDF documents securely in your browser
        </p>
      </div>

      {/* Privacy Notice */}
      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertTitle>100% Private & Secure</AlertTitle>
        <AlertDescription>
          Your PDF is processed entirely in your browser using JavaScript. No data is sent to any server.
          Your document never leaves your computer. All operations are performed client-side.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>1. Upload PDF</CardTitle>
              <CardDescription>Select a PDF file to sign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  {pdfFile ? `Selected: ${pdfFile.name}` : "Choose PDF File"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Signature Drawing */}
          <Card>
            <CardHeader>
              <CardTitle>2. Draw Signature</CardTitle>
              <CardDescription>Create your digital signature</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setIsSignatureModalOpen(true)}
                disabled={!pdfFile}
                className="w-full"
              >
                <PenTool className="mr-2 h-4 w-4" />
                {signatureDataUrl ? "Edit Signature" : "Draw Signature"}
              </Button>
              {signatureDataUrl && (
                <div className="mt-4 border rounded-md p-4 bg-muted">
                  <p className="text-sm text-muted-foreground mb-2">Current Signature:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={signatureDataUrl}
                    alt="Signature preview"
                    className="max-h-20 mx-auto"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Position Controls */}
          <Card>
            <CardHeader>
              <CardTitle>3. Position Signature</CardTitle>
              <CardDescription>Adjust where the signature appears</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="x-position">
                  Horizontal Position: {signatureX[0]}%
                </Label>
                <Slider
                  id="x-position"
                  min={0}
                  max={100}
                  step={1}
                  value={signatureX}
                  onValueChange={setSignatureX}
                  disabled={!pdfFile || !signatureDataUrl}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="y-position">
                  Vertical Position: {signatureY[0]}%
                </Label>
                <Slider
                  id="y-position"
                  min={0}
                  max={100}
                  step={1}
                  value={signatureY}
                  onValueChange={setSignatureY}
                  disabled={!pdfFile || !signatureDataUrl}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>4. Apply & Download</CardTitle>
              <CardDescription>Finalize your signed document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleEmbedSignature}
                disabled={!pdfFile || !signatureDataUrl || isProcessing}
                className="w-full"
                variant="default"
              >
                {isProcessing ? "Processing..." : "Apply Signature to PDF"}
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!signedPdfUrl}
                className="w-full"
                variant="secondary"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Signed PDF
              </Button>
              <Button
                onClick={handleStartOver}
                disabled={!pdfFile}
                className="w-full"
                variant="outline"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Start Over
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - PDF Preview */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>PDF Preview</CardTitle>
              <CardDescription>
                {signedPdfUrl
                  ? "Signed document preview"
                  : pdfUrl
                  ? "Original document preview"
                  : "Upload a PDF to preview"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(pdfUrl || signedPdfUrl) ? (
                <iframe
                  src={signedPdfUrl || pdfUrl}
                  className="w-full h-[600px] border rounded-md"
                  title="PDF Preview"
                />
              ) : (
                <div className="w-full h-[600px] border rounded-md flex items-center justify-center bg-muted">
                  <div className="text-center text-muted-foreground">
                    <FileUp className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>No PDF uploaded</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Signature Modal */}
      <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Draw Your Signature</DialogTitle>
            <DialogDescription>
              Use your mouse or touch screen to draw your signature below
            </DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed rounded-md p-2">
            <SignatureCanvas
              ref={signatureCanvasRef}
              canvasProps={{
                className: "w-full h-48 bg-white rounded-md",
              }}
            />
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearSignature}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsSignatureModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApplySignature}
            >
              Apply Signature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
