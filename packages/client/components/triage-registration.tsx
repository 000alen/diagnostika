import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TriageContext } from "@/app/triage/page";
import { trpc } from "@client/lib/trpc-client";
import { User } from "lucide-react";
import Form from "next/form";
import { useContext } from "react";
import { z } from "zod";

const formDataSchema = z.object({
  rut: z.string(),
  name: z.string(),
  priority: z.number().min(1).max(5),
});

export default function TriageRegistration() {
  const { setPatientId } = useContext(TriageContext)!;

  const utils = trpc.useUtils();
  const { mutateAsync: createPatient } = trpc.createPatient.useMutation();
  const { mutateAsync: addToQueue } = trpc.addToQueue.useMutation();

  const action = async (formData: FormData) => {
    try {
      const data = formDataSchema.parse({
        rut: formData.get("rut") as string,
        name: formData.get("name") as string,
        priority: parseInt(formData.get("priority") as string),
      });

      await createPatient(data)
        .then(async (patient) => {
          setPatientId(patient.id);
          await addToQueue({ patientId: patient.id, priority: data.priority });
        })
        .then(() => utils.getQueue.invalidate());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="w-[22vw]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <User className="w-5 h-5 mr-2" />
          Registro de Paciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form action={action} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="rut">RUT</Label>
            <Input id="rut" name="rut" placeholder="12.345.678-9" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input name="name" id="name" placeholder="Juan Pérez" />
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

          <div className="space-y-1">
            <Label htmlFor="priority">Prioridad de Atención</Label>
            <Select name="priority" defaultValue="3">
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  <div className="flex items-center">
                    <div className="w-2 h-2 mr-2 bg-red-500 rounded-full"></div>
                    Nivel 1 - Resucitación
                  </div>
                </SelectItem>
                <SelectItem value="2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 mr-2 bg-orange-500 rounded-full"></div>
                    Nivel 2 - Emergencia
                  </div>
                </SelectItem>
                <SelectItem value="3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 mr-2 bg-yellow-500 rounded-full"></div>
                    Nivel 3 - Urgente
                  </div>
                </SelectItem>
                <SelectItem value="4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 mr-2 bg-green-500 rounded-full"></div>
                    Nivel 4 - Menos Urgente
                  </div>
                </SelectItem>
                <SelectItem value="5">
                  <div className="flex items-center">
                    <div className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></div>
                    Nivel 5 - No Urgente
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Registrar Paciente
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
