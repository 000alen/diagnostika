'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Users, UserCheck, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TriageBoard() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRedirectButton, setShowRedirectButton] = useState(false)

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
      setShowRedirectButton(true)
    } else {
      setIsRecording(true)
      setShowRedirectButton(false)
    }
  }

  const redirectToPatientData = () => {
    window.open('https://ejemplo-historial-medico.com/paciente/123', '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6">Panel de Triaje</h1>
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        {/* Waiting List Panel - 1/5 width */}
        <Card className="w-1/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Lista de Espera
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 bg-red-100 p-4 rounded-lg">
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" alt="John Doe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-gray-500">Esperando: 30 min</p>
                <Progress value={75} className="h-2 mt-2" />
              </div>
              <div className="px-3 py-1 bg-red-200 rounded-full text-xs font-semibold">
                Urgente
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Notes Panel - Middle */}
        <Card className="flex-1 w-3/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notas del Paciente</CardTitle>
              <div className="flex gap-2">
                {showRedirectButton && (
                  <Button
                    variant="outline"
                    className="bg-green-500 text-white hover:bg-green-600"
                    onClick={redirectToPatientData}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Historial Médico
                  </Button>
                )}
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
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Available Staff Panel - Right */}
        <Card className="w-1/4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              Personal Disponible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Doctores</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <Avatar className="h-12 w-12 mb-1">
                        <AvatarFallback>D{i}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">Dr. {i}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Enfermeros</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <Avatar className="h-12 w-12 mb-1">
                        <AvatarFallback>N{i}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">Enf. {i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}