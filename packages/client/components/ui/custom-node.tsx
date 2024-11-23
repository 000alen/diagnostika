import React from 'react'
import { Handle, Position } from 'reactflow'
import { Progress } from "@client/components/ui/progress";
import { Badge } from "@client/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@client/components/ui/popover";
import { Button } from "@client/components/ui/button";
import { ThumbsUp, ThumbsDown } from 'lucide-react'

export function SymptomNode({ data }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="px-4 py-2 shadow-md rounded-md bg-amber-50 border border-amber-200 w-64 cursor-pointer">
          <div className="font-bold text-amber-700">Symptom</div>
          <div className="font-semibold text-amber-900">{data.label}</div>
          <div className="mt-2">
            <div className="text-sm text-amber-700">Confidence Level</div>
            <Progress value={data.confidence} className="w-full bg-amber-200" indicatorClassName="bg-amber-500" />
            <div className="text-sm text-right text-amber-700">{data.confidence}%</div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {data.tags.map((tag, ) => (
              <Badge key={index} variant="secondary" className="bg-amber-100 text-amber-700">{tag}</Badge>
            ))}
          </div>
          <Handle type="target" position={Position.Top} className="w-16 !bg-amber-500" />
          <Handle type="source" position={Position.Bottom} className="w-16 !bg-amber-500" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h3 className="font-semibold mb-2">{data.label} Justification</h3>
        <p className="text-sm text-gray-600">{data.justification}</p>
      </PopoverContent>
    </Popover>
  )
}

export function ExamNode({ data }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="px-4 py-2 shadow-md rounded-md bg-sky-50 border border-sky-200 w-64 cursor-pointer">
          <div className="font-bold text-sky-700">Exam</div>
          <div className="font-semibold text-sky-900">{data.label}</div>
          <div className="mt-2 text-sm text-sky-700">{data.description}</div>
          <Handle type="target" position={Position.Top} className="w-16 !bg-sky-500" />
          <Handle type="source" position={Position.Bottom} className="w-16 !bg-sky-500" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h3 className="font-semibold mb-2">{data.label} Details</h3>
        <p className="text-sm text-gray-600">{data.details}</p>
        <div className="mt-2">
          <strong className="text-sm">Normal Range:</strong>
          <span className="text-sm ml-2">{data.normalRange}</span>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function DiagnosisNode({ data }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className={`px-4 py-2 shadow-md rounded-md bg-emerald-50 border border-emerald-200 w-64 cursor-pointer ${data.rank > 1 ? 'opacity-70 hover:opacity-100 transition-opacity duration-200' : ''}`}>
          <div className="font-bold text-emerald-700">Diagnosis {data.rank}</div>
          <div className="font-semibold text-emerald-900">{data.label}</div>
          <div className="mt-2">
            <div className="text-sm text-emerald-700">Probability</div>
            <Progress value={data.probability} className="w-full bg-emerald-200" indicatorClassName="bg-emerald-500" />
            <div className="text-sm text-right text-emerald-700">{data.probability}%</div>
          </div>
          <div className="mt-2 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log('Approved')}
              className="w-[45%] border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log('Rejected')}
              className="w-[45%] border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
          <Handle type="target" position={Position.Top} className="w-16 !bg-emerald-500" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h3 className="font-semibold mb-2">{data.label} Information</h3>
        <p className="text-sm text-gray-600">{data.description}</p>
        <div className="mt-2">
          <strong className="text-sm">Recommended Action:</strong>
          <p className="text-sm mt-1">{data.recommendedAction}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

