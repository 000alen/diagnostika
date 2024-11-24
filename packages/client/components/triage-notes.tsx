"use client";

import { useState, useContext, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriageContext } from "@/app/triage/page";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import { trpc } from "@client/lib/trpc-client";

export default function TriageNotes() {
  const { patientId } = useContext(TriageContext)!;

  const [text, setText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    isRecording,
    isPaused,
    mediaRecorder,
  } = useAudioRecorder({});

  const onStopRecording = useCallback(async () => {
    stopRecording();

    // if (!patientId) return;
    // if (!recordingBlobRef.current) return;

    mediaRecorder!.ondataavailable = async (e) => {
      console.log("ondataavailable");

      const formData = new FormData();
      formData.append("patientId", patientId!.toString());
      formData.append("audio", e.data!);

      try {
        setIsTranscribing(true);
        const response = await fetch("/api/transcription", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) return;

        const data = (await response.json()) as {
          text: string;
        };

        setText((prev) => `${prev}\n\n${data.text}`);
      } finally {
        setIsTranscribing(false);
      }
    };

    console.log("before requestData");

    mediaRecorder!.requestData();
  }, [mediaRecorder, patientId, stopRecording]);

  const { mutateAsync: createSnapshot } = trpc.createSnapshot.useMutation();
  const { mutateAsync: addToSnapshot } = trpc.addToSnapshot.useMutation();
  const { mutateAsync: buildGraph } = trpc.buildGraph.useMutation();

  const onSave = useCallback(async () => {
    await createSnapshot({ patientId: patientId! });

    await addToSnapshot({
      patientId: patientId!,
      description: text,
    });

    await buildGraph({ patientId: patientId! });
  }, [addToSnapshot, buildGraph, createSnapshot, patientId, text]);

  return (
    <Card className="w-[50vw]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Notas del Paciente</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={isRecording ? "destructive" : "default"}
              onClick={
                isRecording
                  ? onStopRecording
                  : isPaused
                  ? togglePauseResume
                  : startRecording
              }
              className="w-32"
              disabled={isTranscribing}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Detener
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Grabar
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              className="w-32"
              disabled={isTranscribing || !patientId}
              onClick={onSave}
            >
              Guardar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isRecording && (
          <Alert className="border-red-200 bg-red-50">
            <div className="flex items-center gap-2">
              <span className="flex w-3 h-3">
                <span className="absolute inline-flex w-3 h-3 bg-red-400 rounded-full opacity-75 animate-ping"></span>
                <span className="relative inline-flex w-3 h-3 bg-red-500 rounded-full"></span>
              </span>
              <AlertDescription>Grabando...</AlertDescription>
            </div>
          </Alert>
        )}

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[200px] mb-4"
          placeholder="Las notas de voz aparecerán aquí..."
        />
      </CardContent>
    </Card>
  );
}
