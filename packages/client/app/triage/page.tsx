'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Users, Loader2, ExternalLink, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  FileText,
  Download,
  TestTube,
  Eye,
  ClipboardList,
  Activity,
  HeartPulse,
  FileSpreadsheet
} from 'lucide-react'

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
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-4xl font-bold mb-6">Panel de Triaje</h1>
        <div className="flex gap-8 justify-center h-[calc(100vh-8rem)]">
          {/* Patient Registration Panel - Left */}
          <Card className="w-[18vw]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl">
                <User className="h-5 w-5 mr-2" />
                Registro de Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="rut">RUT</Label>
                  <Input id="rut" placeholder="12.345.678-9" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input id="name" placeholder="Juan Pérez" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="age">Edad</Label>
                    <Input id="age" type="number" placeholder="25" />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="gender">Género</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m">Masculino</SelectItem>
                        <SelectItem value="f">Femenino</SelectItem>
                        <SelectItem value="o">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input id="height" type="number" placeholder="170" />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input id="weight" type="number" placeholder="70" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="emergency-contact">Contacto Emergencia</Label>
                  <Input id="emergency-contact" placeholder="+56 9 1234 5678" />
                </div>

                <Button className="w-full">Registrar Paciente</Button>
              </div>
            </CardContent>
          </Card>

          {/* Patient Notes Panel - Middle */}
          <Card className="w-[50vw]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Notas del Paciente</CardTitle>
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

          {/* Waiting List Panel - Right */}
          <Card className="w-[18vw]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-xl">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Lista de Espera
                </div>
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                  3 pacientes
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-4 bg-red-100 p-4 rounded-lg">
                  <Avatar>
                    <AvatarImage src="/placeholder-avatar.jpg" alt="John Doe" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">John Doe</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      30 min
                    </div>
                    <Progress value={75} className="h-2 mt-2" />
                  </div>
                  <div className="px-3 py-1 bg-red-200 rounded-full text-xs font-semibold">
                    Urgente
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-yellow-100 p-4 rounded-lg">
                  <Avatar>
                    <AvatarFallback>MP</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">María Pérez</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      15 min
                    </div>
                    <Progress value={45} className="h-2 mt-2" />
                  </div>
                  <div className="px-3 py-1 bg-yellow-200 rounded-full text-xs font-semibold">
                    Medio
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-green-100 p-4 rounded-lg">
                  <Avatar>
                    <AvatarFallback>RS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">Roberto Soto</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      5 min
                    </div>
                    <Progress value={25} className="h-2 mt-2" />
                  </div>
                  <div className="px-3 py-1 bg-green-200 rounded-full text-xs font-semibold">
                    Leve
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
   )
}