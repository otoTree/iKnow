"use client"

import React, { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Fragment } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2, Info } from 'lucide-react'
import { priorityColors, priorityDotColors, statusColors } from './fragment-styles'
import { FragmentNodeData } from './fragment-utils'
import { FragmentDetail } from '@/components/fragment-detail'
import { FloatingChatButton } from '@/components/ai-chat/floating-chat-button'
import { DraggableFragment } from '@/components/ai-chat/draggable-fragment'
import { useAIChat } from '@/components/ai-chat/ai-chat-manager'

interface FragmentNodeProps {
  data: FragmentNodeData
}

export function FragmentNode({ data }: FragmentNodeProps) {
  const { fragment, onEdit, onDelete, onView, isExpanded, onToggleExpand } = data
  const [showDetail, setShowDetail] = useState(false)
  const { openChat, addFragmentToContext } = useAIChat()

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleExpand && fragment.id) {
      onToggleExpand(fragment.id.toString())
    }
  }

  const handleShowDetail = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
  }

  const handleSaveFragment = (updatedFragment: Fragment) => {
    if (onEdit) {
      onEdit(updatedFragment)
    }
    setShowDetail(false)
  }

  const handleChatStart = (fragment: Fragment) => {
    // 使用嵌入式聊天，在节点附近打开
    const nodeElement = document.querySelector(`[data-id="${fragment.id}"]`)
    let position = { x: 300, y: 100 }
    
    if (nodeElement) {
      const rect = nodeElement.getBoundingClientRect()
      position = {
        x: Math.min(rect.right + 20, window.innerWidth - 420),
        y: Math.max(rect.top - 50, 20)
      }
    }
    
    openChat([fragment], 'embedded')
  }

  const handleAddToContext = (e: React.MouseEvent) => {
    e.stopPropagation()
    addFragmentToContext(fragment)
  }

  // 简化节点视图
  if (!isExpanded) {
    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#555' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#555' }}
        />
        <DraggableFragment fragment={fragment}>
          <div 
            className={`relative w-16 h-16 rounded-full border-4 ${priorityColors[fragment.priority]} cursor-grab hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl group`}
            onClick={(e) => {
              // 只有在没有拖拽时才处理点击
              if (!e.defaultPrevented) {
                handleNodeClick(e)
              }
            }}
            title={fragment.title}
          >
            <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${priorityDotColors[fragment.priority]}`}></div>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-xs font-medium text-gray-700 truncate w-14 px-1" title={fragment.title}>
                  {fragment.title.substring(0, 6)}
                </div>
                <div className="text-xs text-gray-500">
                  {fragment.tags.length}个标签
                </div>
              </div>
            </div>
            {/* Chat按钮 */}
            <FloatingChatButton
              fragment={fragment}
              onChatStart={handleChatStart}
              position="top-right"
            />
            {/* 添加到上下文按钮 */}
            <Button
              size="sm"
              variant="ghost"
              className="absolute -bottom-2 -left-2 h-6 w-6 p-0 bg-white border border-gray-200 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-50"
              onClick={handleAddToContext}
              title="添加到AI对话上下文"
            >
              <span className="text-xs">+</span>
            </Button>
            {/* 详细信息按钮 */}
            <Button
              size="sm"
              variant="ghost"
              className="absolute -bottom-2 -right-2 h-6 w-6 p-0 bg-white border border-gray-200 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50"
              onClick={handleShowDetail}
              title="查看详细内容"
            >
              <Info className="h-3 w-3 text-blue-600" />
            </Button>
          </div>
        </DraggableFragment>
        {/* 详细内容弹窗 */}
        <FragmentDetail
          fragment={fragment}
          isOpen={showDetail}
          onClose={handleCloseDetail}
          onSave={handleSaveFragment}
        />
      </>
    )
  }

  // 展开节点视图
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
      <DraggableFragment fragment={fragment}>
      <Card className={`w-64 border-2 ${priorityColors[fragment.priority]} shadow-lg hover:shadow-xl transition-shadow relative group`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium truncate max-w-[160px]" title={fragment.title}>
            {fragment.title}
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 ml-2 flex-shrink-0"
            onClick={handleNodeClick}
          >
            ×
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className={statusColors[fragment.status]}>
            {fragment.status}
          </Badge>
          <Badge variant="outline">
            {fragment.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs text-gray-600 mb-2 line-clamp-2">
          {fragment.content.substring(0, 80)}...
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {fragment.tags.slice(0, 3).map((tag: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {fragment.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{fragment.tags.length - 3}
            </Badge>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {fragment.category || '未分类'}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
              onClick={handleShowDetail}
              title="查看详细内容"
            >
              <Info className="h-3 w-3" />
            </Button>
            {onView && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onView(fragment)
                }}
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(fragment)
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(fragment)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      {/* Chat按钮 */}
      <FloatingChatButton
        fragment={fragment}
        onChatStart={handleChatStart}
        position="top-right"
      />
      {/* 添加到上下文按钮 */}
      <Button
        size="sm"
        variant="outline"
        className="absolute top-2 left-2 h-8 px-2 bg-white/90 hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800"
        onClick={handleAddToContext}
        title="添加到AI对话上下文"
      >
        <span className="text-xs mr-1">+</span>
        <span className="text-xs">上下文</span>
      </Button>
      {/* 详细内容弹窗 */}
      <FragmentDetail
        fragment={fragment}
        isOpen={showDetail}
        onClose={handleCloseDetail}
        onSave={handleSaveFragment}
      />
    </Card>
    </DraggableFragment>
    </>
  )
}