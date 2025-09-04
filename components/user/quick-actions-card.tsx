"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, FileText, Activity } from "lucide-react"

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          快捷操作
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/fragments">
              <FileText className="h-4 w-4 mr-2" />
              管理碎片
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/brain">
              <Activity className="h-4 w-4 mr-2" />
              第二大脑
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}