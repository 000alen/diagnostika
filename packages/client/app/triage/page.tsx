'use client'

import { useState } from 'react'
import { Plus, X, Mic, MicOff, MoreVertical } from 'lucide-react'
import { Button } from '@client/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Panel {
  id: string
  title: string
  isRecording?: boolean
}

export default function TriageBoard() {
  const [panels, setPanels] = useState<Panel[]>([
    { id: '1', title: 'Waiting List' },
    { id: '2', title: 'Available Staff' },
    { id: '3', title: 'Recording Panel', isRecording: false },
  ])

  const addPanel = () => {
    const newPanel = {
      id: String(panels.length + 1),
      title: `Panel ${panels.length + 1}`,
    }
    setPanels([...panels, newPanel])
  }

  const removePanel = (id: string) => {
    setPanels(panels.filter(panel => panel.id !== id))
  }

  const toggleRecording = (id: string) => {
    setPanels(panels.map(panel =>
      panel.id === id ? { ...panel, isRecording: !panel.isRecording } : panel
    ))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-x-auto">
        {panels.map((panel) => (
          <Card key={panel.id} className="flex-none w-[400px] m-4 h-[calc(100vh-2rem)] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{panel.title}</CardTitle>
              <div className="flex items-center space-x-2">
                {panel.isRecording !== undefined && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRecording(panel.id)}
                  >
                    {panel.isRecording ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => removePanel(panel.id)}>
                      Delete Panel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <Textarea
                className="min-h-[calc(100vh-8rem)] resize-none"
                placeholder="Add your notes here..."
              />
            </CardContent>
          </Card>
        ))}
        <div className="flex-none p-4">
          <Button
            variant="outline"
            size="sm"
            className="h-[calc(100vh-2rem)] w-[100px]"
            onClick={addPanel}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

