'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff, Bot, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default function PatientNotesPanel() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('notes')
  const [analysisReady, setAnalysisReady] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 100)
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false)
      setIsProcessing(true)

      // Simular procesamiento de la grabación
      await new Promise(resolve => setTimeout(resolve, 3000))

      setTranscript(prev => prev + "\nPaciente reporta dolor en el pecho y dificultad para respirar.")
      setIsProcessing(false)
      setAnalysisReady(true)
      setActiveTab('analysis') // Cambiar automáticamente a la pestaña de análisis
    } else {
      setIsRecording(true)
      setAnalysisReady(false)
    }
  }

  const simulateAiResponse = async () => {
    setAiResponse('')
    setIsProcessing(true)

    // Simular delay en el procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000))

    const response = "Análisis completo:\n\n" +
      "🚨 Nivel de Urgencia: Alto\n\n" +
      "Síntomas Principales:\n" +
      "- Dolor en el pecho\n" +
      "- Dificultad respiratoria\n\n" +
      "Recomendaciones:\n" +
      "1. Realizar ECG inmediatamente\n" +
      "2. Evaluar signos vitales\n" +
      "3. Considerar evaluación cardiológica urgente\n\n" +
      "⚡ Acción: Atención médica inmediata requerida"

    let index = 0
    const interval = setInterval(() => {
      if (index < response.length) {
        setAiResponse(prev => prev + response[index])
        index++
      } else {
        clearInterval(interval)
        setIsProcessing(false)
      }
    }, 20)
  }

  return (
    <Card className="flex-1 w-3/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Notas del Paciente</CardTitle>
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={toggleRecording}
            className="w-32"
            disabled={isProcessing}
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Detener
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Grabar
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">
              Notas
            </TabsTrigger>
            <TabsTrigger value="analysis" disabled={!analysisReady}>
              Análisis IA
              {analysisReady && <Badge variant="secondary" className="ml-2">Nuevo</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4">
            {isRecording && (
              <Alert className="bg-red-50 border-red-200">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <AlertDescription>
                    Grabando... Nivel de Audio: {audioLevel.toFixed(0)}%
                  </AlertDescription>
                </div>
              </Alert>
            )}
            {isProcessing && !isRecording && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <AlertDescription>
                  Procesando grabación...
                </AlertDescription>
              </Alert>
            )}
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[200px] mb-4"
              placeholder="Las notas de voz aparecerán aquí..."
            />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="bg-slate-50 p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-500" />
                  Análisis IA
                </h3>
                <Button
                  onClick={simulateAiResponse}
                  disabled={isProcessing || !transcript}
                  size="sm"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Actualizar Análisis'
                  )}
                </Button>
              </div>
              <div className="whitespace-pre-wrap font-mono text-sm text-slate-700 bg-white p-4 rounded border">
                {aiResponse || "Haga clic en 'Actualizar Análisis' para procesar las notas"}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}