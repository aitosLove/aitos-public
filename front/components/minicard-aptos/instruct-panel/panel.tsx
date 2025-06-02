"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileEdit, RefreshCw, AlertCircle } from "lucide-react";

interface InstructPanelProps {
  title?: string;
  initialInstruct: string;
  fetchInstruct: () => Promise<string>;
  updateInstruct: (instruct: string) => Promise<void>;
}

export const InstructPanel: React.FC<InstructPanelProps> = ({
  title = "Instruct Panel",
  initialInstruct,
  fetchInstruct,
  updateInstruct,
}) => {
  const [instruct, setInstruct] = useState<string>(initialInstruct);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [tempInstruct, setTempInstruct] = useState<string>(instruct);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInstruct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchInstruct();
        setInstruct(data);
      } catch (err) {
        setError("Failed to load instruction data");
        console.error("Error loading instruct:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInstruct();
  }, [fetchInstruct]);

  const handleEditClick = () => {
    setTempInstruct(instruct);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await updateInstruct(tempInstruct);
      setInstruct(tempInstruct);
      setIsDialogOpen(false);
    } catch (err) {
      setError("Failed to update instruction data");
      console.error("Error updating instruct:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card-background p-6 rounded-xl border border-border shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">System instructions and configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-full hover:bg-muted transition-colors"
            onClick={handleEditClick}
            disabled={isLoading}
          >
            <FileEdit className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card/50 p-4 max-h-[28rem] overflow-y-auto">
        {isLoading && !instruct ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            <span>Loading instructions...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-rose-500 p-4">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="text-base text-foreground font-normal leading-relaxed whitespace-pre-wrap">
            {instruct}
          </div>
        )}
      </div>

     
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card-background border-border rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-primary">Edit Instructions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={tempInstruct}
              onChange={(e) => setTempInstruct(e.target.value)}
              className="min-h-[200px] focus-visible:ring-0 bg-background text-sm font-mono rounded-md border-border"
              placeholder="Enter your instructions here..."
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs font-medium"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-500 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};