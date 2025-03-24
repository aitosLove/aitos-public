"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// 定义 InstructPanel 的 props 类型
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
  // 管理 instruct 的状态
  const [instruct, setInstruct] = useState<string>(initialInstruct);
  // 管理 dialog 的打开状态
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  // 临时存储 dialog 中编辑的 instruct
  const [tempInstruct, setTempInstruct] = useState<string>(instruct);
  // 加载状态
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 错误状态
  const [error, setError] = useState<string | null>(null);

  // 初始加载数据
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

  // 点击"Edit"按钮时，初始化临时值并打开 dialog
  const handleEditClick = () => {
    setTempInstruct(instruct);
    setIsDialogOpen(true);
  };

  // 点击"Save"按钮时，更新 instruct 并关闭 dialog
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
    <Card className="w-full">
      {/* Card 头部：标题和编辑按钮 */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <Button onClick={handleEditClick} disabled={isLoading}>
          Edit
        </Button>
      </CardHeader>

      {/* Card 内容：展示当前的 instruct */}
      <CardContent>
        {isLoading && !instruct ? (
          <div className="p-4 rounded-md bg-gray-100">Loading...</div>
        ) : error ? (
          <div className="p-4 rounded-md bg-red-50 text-red-500">{error}</div>
        ) : (
          <div className="p-4 rounded-md">
            <p>{instruct}</p>
          </div>
        )}
      </CardContent>

      {/* Dialog：编辑 instruct 的弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Instruct</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Textarea：编辑区域，默认显示当前 instruct */}
            <Textarea
              value={tempInstruct}
              onChange={(e) => setTempInstruct(e.target.value)}
              className="min-h-[200px]"
              placeholder="Enter your instruct here..."
            />
            {/* 保存按钮 */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
            {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
