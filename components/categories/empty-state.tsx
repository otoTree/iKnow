"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Folder, Plus } from "lucide-react"

interface EmptyStateProps {
  onCreateCategory: () => void
}

export function EmptyState({ onCreateCategory }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">暂无分类</h3>
        <p className="text-muted-foreground mb-4">
          创建你的第一个分类来开始组织知识碎片
        </p>
        <Button onClick={onCreateCategory}>
          <Plus className="w-4 h-4 mr-2" />
          创建分类
        </Button>
      </CardContent>
    </Card>
  )
}