/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, Position } from "reactflow";
import { Progress } from "@client/components/ui/progress";
import { Badge } from "@client/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@client/components/ui/popover";
import { Button } from "@client/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export function SymptomNode({ data }: { data: any }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="w-64 px-4 py-2 border rounded-md shadow-md cursor-pointer bg-amber-50 border-amber-200">
          <div className="font-bold text-amber-700">Symptom</div>
          <div className="font-semibold text-amber-900">{data.label}</div>
          <div className="mt-2">
            <div className="text-sm text-amber-700">Confidence Level</div>
            <Progress value={data.confidence} className="w-full bg-amber-200" />
            <div className="text-sm text-right text-amber-700">
              {data.confidence}%
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {data.tags.map((tag: any, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-amber-100 text-amber-700"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <Handle
            type="target"
            position={Position.Top}
            className="w-16 !bg-amber-500"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-16 !bg-amber-500"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h3 className="mb-2 font-semibold">{data.label} Justification</h3>
        <p className="text-sm text-gray-600">{data.justification}</p>
      </PopoverContent>
    </Popover>
  );
}

export function ExamNode({ data }: { data: any }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="w-64 px-4 py-2 border rounded-md shadow-md cursor-pointer bg-sky-50 border-sky-200">
          <div className="font-bold text-sky-700">Exam</div>
          <div className="font-semibold text-sky-900">{data.label}</div>
          <div className="mt-2 text-sm text-sky-700">{data.description}</div>
          <Handle
            type="target"
            position={Position.Top}
            className="w-16 !bg-sky-500"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-16 !bg-sky-500"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h3 className="mb-2 font-semibold">{data.label} Details</h3>
        <p className="text-sm text-gray-600">{data.details}</p>
        <div className="mt-2">
          <strong className="text-sm">Normal Range:</strong>
          <span className="ml-2 text-sm">{data.normalRange}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ExaminableNode({ data }: { data: any }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="w-64 px-4 py-2 border rounded-md shadow-md cursor-pointer bg-sky-100 border-sky-400">
          <div className="font-bold text-sky-700">Examinable</div>
          <div className="font-semibold text-sky-900">{data.label}</div>
          <div className="mt-2 text-sm text-sky-700">{data.description}</div>
          <Handle
            type="target"
            position={Position.Top}
            className="w-16 !bg-sky-500"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-16 !bg-sky-500"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h3 className="mb-2 font-semibold">{data.label} Details</h3>
      </PopoverContent>
    </Popover>
  );
}

export function DiagnosisNode({ data }: { data: any }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={`px-4 py-2 shadow-md rounded-md bg-emerald-50 border border-emerald-200 w-64 cursor-pointer ${
            data.rank > 1
              ? "opacity-70 hover:opacity-100 transition-opacity duration-200"
              : ""
          }`}
        >
          <div className="font-bold text-emerald-700">
            Diagnosis {data.rank}
          </div>
          <div className="font-semibold text-emerald-900">{data.label}</div>
          <div className="mt-2">
            <div className="text-sm text-emerald-700">Probability</div>
            <Progress
              value={data.probability}
              className="w-full bg-emerald-200"
            />
            <div className="text-sm text-right text-emerald-700">
              {data.probability}%
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log("Approved")}
              className="w-[45%] border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Aprobar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log("Rejected")}
              className="w-[45%] border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Rechazar
            </Button>
          </div>
          <Handle
            type="target"
            position={Position.Top}
            className="w-16 !bg-emerald-500"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h3 className="mb-2 font-semibold">{data.label} Information</h3>
        <p className="text-sm text-gray-600">{data.description}</p>
        <div className="mt-2">
          <strong className="text-sm">Recommended Action:</strong>
          <p className="mt-1 text-sm">{data.recommendedAction}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
