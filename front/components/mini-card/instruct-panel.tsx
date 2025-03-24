"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const InstructPanel: React.FC = () => {
  // 管理 instruct 的状态，默认值可以根据需要调整
  const [instruct, setInstruct] = useState<string>(
    `You are an expert in decentralized finance (DeFi) strategies. Your task is to formulate a DeFi strategy tailored to the user’s current holdings using the provided information about various DeFi protocol pools. You will receive:

Pool Information: Details about each pool, including its size, annual percentage yield (APY), and the tokens involved.
Token Explanations: Descriptions of the tokens corresponding to each pool.
Optional Security Data: Audit reports or security assessments of the protocols, if available.`
  );
  // 管理 dialog 的打开状态
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  // 临时存储 dialog 中编辑的 instruct
  const [tempInstruct, setTempInstruct] = useState<string>(instruct);

  // 点击“Edit”按钮时，初始化临时值并打开 dialog
  const handleEditClick = () => {
    setTempInstruct(instruct);
    setIsDialogOpen(true);
  };

  // 点击“Save”按钮时，更新 instruct 并关闭 dialog
  const handleSave = () => {
    setInstruct(tempInstruct);
    setIsDialogOpen(false);
  };

  return (
    <Card className="w-full border-0 shadow-sm">
      {/* Card 头部：标题和编辑按钮 */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">Instruct Panel</CardTitle>
        <Button onClick={handleEditClick}>Edit</Button>
      </CardHeader>

      {/* Card 内容：展示当前的 instruct */}
      <CardContent>
        <div className="p-4 bg-gray-100 rounded-md">
          <p>{instruct}</p>
        </div>
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
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default InstructPanel;
