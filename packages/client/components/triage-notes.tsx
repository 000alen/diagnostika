"use client";

import { useState, useContext, useCallback } from "react";
import { Mic, MicOff, File } from "lucide-react";
import { Input as InputNextUI } from "@nextui-org/input";
//
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriageContext } from "@/app/triage/context";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import { trpc } from "@client/lib/trpc-client";

export default function TriageNotes() {
  const { patientId } = useContext(TriageContext)!;

  const [text, setText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  const [examName, setExamName] = useState("");
  const [examDescription, setExamDescription] = useState("");

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
  const { mutateAsync: addExamToSnapshot } =
    trpc.addExamToSnapshot.useMutation();

  const onSave = useCallback(async () => {
    await createSnapshot({ patientId: patientId! });

    await addToSnapshot({
      patientId: patientId!,
      description: text,
    });

    await buildGraph({ patientId: patientId! });
  }, [addToSnapshot, buildGraph, createSnapshot, patientId, text]);

  const onSaveExam = useCallback(async () => {
    await addExamToSnapshot({
      patientId: patientId!,
      exam: {
        t: new Date(),
        name: examName,
        description: examDescription,
      },
    });

    await buildGraph({ patientId: patientId! });
  }, [addExamToSnapshot, buildGraph, examDescription, examName, patientId]);

  return (
    <Card className="w-[50vw] bg-[#e7e7e7] shadow-md !rounded-[30px]">
      <CardHeader className="pt-5 pb-3 pl-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex text-[1.1rem] flex-col">
            <span>Notas del Paciente</span>
            <p className="text-sm font-normal text-gray-700">
              Transforma las notas de voz en texto
            </p>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="w-fit rounded-[14px] font-semibold"
              disabled={isTranscribing || !patientId}
              onClick={onSave}
            >
              Guardar
            </Button>
            <Button
              variant={isRecording ? "destructive" : "default"}
              onClick={
                isRecording
                  ? onStopRecording
                  : isPaused
                  ? togglePauseResume
                  : startRecording
              }
              className="w-fit bg-blue-700 rounded-[14px] font-semibold"
              disabled={isTranscribing}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4" />
                  Detener
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Grabar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 rounded-[20px] bg-white p-3 m-2">
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
          className="min-h-[140px] outline-none border-none shadow-none"
          placeholder="Las notas de voz aparecerán aquí..."
          style={{ resize: "none" }}
        />
      </CardContent>

      <hr className="mt-4 border-t-2 border-gray-300 h-[1px] w-full" />

      {/* Card header de Enviar */}
      <CardHeader className="pt-2 pb-3 pl-4 mb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex text-[1.1rem] flex-col">
            <span>Examen</span>
            <p className="text-sm font-normal text-gray-700">
              Escriba una transcripción de su examen para tener información
              adicional
            </p>
          </CardTitle>
          <div className="flex gap-2">
            <Button className="w-32 bg-blue-700" onClick={onSaveExam}>
              <>
                <File className="w-4 h-4 mr-2" />
                Enviar
              </>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 rounded-[20px] bg-white p-3 m-2 mb-0">
        <InputNextUI
          type="text"
          label="Titulo"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          placeholder="Examen de sangre"
        ></InputNextUI>
        <Textarea
          value={examDescription}
          onChange={(e) => setExamDescription(e.target.value)}
          className="h-fit min-h-[223px] max-h-[200px] outline-none border-none shadow-none"
          placeholder="Examenes de sangre, biopsa..."
          style={{ resize: "none" }}
        />
      </CardContent>
    </Card>
  );
}
