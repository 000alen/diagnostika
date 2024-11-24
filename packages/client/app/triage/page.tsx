"use client"

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, File, Loader2, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input as InputNextUI } from "@nextui-org/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TriageBoard() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
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
    window.open("https://ejemplo-historial-medico.com/paciente/123", "_blank")
  }

  return (
    // Make the bacground of the following div to be a cool gradient from top to bottom with blurred, from a cool whiteish gray to a cool blueish, considering this is for medical purposes
    <div className="h-[100dvh] flex items-center justify-items-center bg-gradient-to-b from-[#f5f5f5] to-[#f0f9ff]">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex gap-5 justify-center h-fit">
          {/* Patient Registration Panel - Left */}
          <Card className="w-[20vw] bg-[#e7e7e7] shadow-md !rounded-[30px]">
            <CardHeader className="pb-2">
              <CardTitle className="flex text-[1.1rem] flex-col">
                <span>Registro de Paciente</span>
                <p className="font-normal text-sm text-gray-700">
                  Registra un nuevo paciente en la base de datos
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white p-4 m-2 rounded-[20px] h-fit">
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

                <div className="space-y-1 !mb-5">
                  <Label htmlFor="emergency-contact">Contacto Emergencia</Label>
                  <Input id="emergency-contact" placeholder="+56 9 1234 5678" />
                </div>

                <Button className="w-full rounded-full bg-blue-700">Registrar Paciente</Button>
              </div>
            </CardContent>
          </Card>

          {/* Patient Notes Panel - Middle */}
          <Card className="w-[50vw] bg-[#e7e7e7] shadow-md !rounded-[30px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex text-[1.1rem] flex-col">
                  <span>Notas del Paciente</span>
                  <p className="font-normal text-sm text-gray-700">
                    Transforma las notas de voz en texto
                  </p>
                </CardTitle>
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
                    className="w-32 bg-blue-700"
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
            <CardContent className="space-y-4 rounded-[20px] bg-white p-4 m-2">
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
                className="min-h-[150px] outline-none border-none shadow-none"
                placeholder="Las notas de voz aparecerán aquí..."
                style={{ resize: "none" }}
              />
            </CardContent>

            {/* Card header de Enviar */}

            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex text-[1.1rem] flex-col">
                  <span>Examen</span>
                  <p className="font-normal text-sm text-gray-700">
                    Escriba una transcripción de su examen para tener información adicional
                  </p>
                </CardTitle>
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
                    className="w-32 bg-blue-700"
                  >
                      <>
                        <File className="h-4 w-4 mr-2" />
                        Enviar
                      </>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 rounded-[20px] bg-white p-4 m-2">
              <InputNextUI type="text" label="Titulo"></InputNextUI>
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="h-fit min-h-[200px] max-h-[200px] outline-none border-none shadow-none"
                placeholder="Examenes de sangre, biopsa..."
                style={{ resize: "none" }}
              />
            </CardContent>

          </Card>

          
          {/* Waiting List Panel - Right */}
          <Card className="w-[20vw] bg-[#e7e7e7] shadow-md !rounded-[30px]">
            <CardHeader className="pb-2">
              <CardTitle className="flex text-[1.1rem] flex-col">
                <span>
                  Lista de Espera
                </span>
                <p className="font-normal text-sm text-gray-700">
                  Pacientes en espera de atención
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 rounded-[20px] bg-white p-2 m-2 h-[86%]">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 bg-red-100 p-2 rounded-[16px]">
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
                  </div>
                  <div className="px-3 py-1 bg-red-200 rounded-full text-xs font-semibold">
                    Urgente
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-yellow-100 p-2 rounded-[20px]">
                  <Avatar>
                    <AvatarFallback>MP</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">María Pérez</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      15 min
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-yellow-200 rounded-full text-xs font-semibold">
                    Medio
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-green-100 p-2 rounded-[20px]">
                  <Avatar>
                    <AvatarFallback>RS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">Roberto Soto</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      5 min
                    </div>
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