import { Users, Clock, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { trpc } from "@client/lib/trpc-client";
import { useContext } from "react";
import { TriageContext } from "@/app/triage/page";

const priorityComponents = [
  <></>,
  <div
    key="resucitacion"
    className="px-1 py-1 text-xs font-semibold text-center bg-red-200 rounded-full"
  >
    <div className="px-3 py-1 text-xs font-semibold bg-red-200 rounded-full">
      Resucitación
    </div>
  </div>,
  <div
    key="emergencia"
    className="px-1 py-1 text-xs font-semibold text-center bg-orange-200 rounded-full"
  >
    <div className="px-3 py-1 text-xs font-semibold bg-orange-200 rounded-full">
      Emergencia
    </div>
  </div>,
  <div
    key="urgente"
    className="px-3 py-1 text-xs font-semibold text-center bg-yellow-200 rounded-full"
  >
    <div className="px-3 py-1 text-xs font-semibold bg-yellow-200 rounded-full">
      Urgente
    </div>
  </div>,
  <div
    key="menos-urgente"
    className="px-1 py-1 text-xs font-semibold text-center bg-green-200 rounded-full"
  >
    <div className="px-3 py-1 text-xs font-semibold bg-green-200 rounded-full">
      Menos urgente
    </div>
  </div>,
  <div
    key="no-urgente"
    className="px-3 py-1 text-xs font-semibold text-center bg-blue-200 rounded-full"
  >
    <div
      key="no-urgente"
      className="px-3 py-1 text-xs font-semibold bg-blue-200 rounded-full"
    >
      No urgente
    </div>
  </div>,
];

export default function TriageQueue() {
  const { setPatientId } = useContext(TriageContext)!;

  const utils = trpc.useUtils();
  const { data: queue = [] } = trpc.getQueue.useQuery();
  const { mutateAsync: removeFromQueue } = trpc.removeFromQueue.useMutation();

  return (
    <Card className="w-[22vw]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Lista de Espera
          </div>
          <span className="bg-gray-200 text-black px-2 py-0.5 rounded-full text-xs">
            <p className="p-2"> {queue.length} pacientes </p>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {queue.map((patient) => (
            <div
              key={patient.patientId}
              className="relative flex items-center p-4 space-x-4 bg-gray-200 rounded-lg"
            >
              <div className="flex-1">
                {/* <p className="font-medium">{patient.patientName}</p> */}

                <Button
                  variant="ghost"
                  onClick={() => setPatientId(patient.patientId)}
                  className="font-medium"
                >
                  {patient.patientName}
                </Button>

                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  30 min
                </div>
                <Progress value={75} className="h-2 mt-2" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-[5rem]">
                  {priorityComponents[5 - patient.priority]}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600"
                  onClick={async () =>
                    await removeFromQueue({
                      patientId: patient.patientId,
                    }).then(() => utils.getQueue.invalidate())
                  }
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
