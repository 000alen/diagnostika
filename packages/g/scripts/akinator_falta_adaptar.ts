import * as readline from "readline";

class symptoms {
    id: number;
    name: string;
    description: string;
    embedding: number[];

    constructor(id: number, name: string, description: string, embedding: number[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.embedding = embedding;
    }
}

class diseases {
    id: number;
    name: string;
    description: string;
    symptoms: symptoms[];
    probabilidad: number;

    constructor(id: number, name: string, description: string, symptoms: symptoms[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.symptoms = symptoms;
        this.probabilidad = 0;
    }
}

class diagnostic {
    enfermedades: diseases[];
    sintomasUnicos: symptoms[];

    constructor(enfermedades: diseases[]) {
        this.enfermedades = enfermedades;
        this.sintomasUnicos = this.obtenerSintomasUnicos();
        // console.log(this.sintomasUnicos.map(s => s.name));
        
    }

    calcularInicial(sintomasIniciales: symptoms[]) {
        console.log(sintomasIniciales)
        for (const sintoma of sintomasIniciales) {
            
            for (const e of this.enfermedades) {
                if (e.symptoms.some(s => s.name === sintoma.name)) {
                    e.probabilidad += (1-e.probabilidad)/(e.symptoms.length*e.symptoms.length);
                    e.symptoms = e.symptoms.filter(s => s.name !== sintoma.name);
                }
            }
        }
        this.sintomasUnicos = this.sintomasUnicos.filter(s => !sintomasIniciales.some(si => si.name === s.name));
        for (const e of this.enfermedades){
            console.log(e.probabilidad);
        }
    }

    async hacerPreguntas() {
        console.log("Responde 'si', 'no' o 'no lo sé' para las siguientes preguntas.\n");
        let cntPreguntas = 0;

        while (cntPreguntas < 6) {
            if (this.sintomasUnicos.length === 0) break;

            const sintoma = this.elegirMejorPregunta();
            const respuesta = await this.preguntarUsuario(`¿Tienes ${sintoma.name}? `);

            if (respuesta === "si") {
                for (const e of this.enfermedades) {
                    if (e.symptoms.some(s => s.name === sintoma.name)) {
                        e.probabilidad += (1-e.probabilidad)/(e.symptoms.length*e.symptoms.length);
                        e.symptoms = e.symptoms.filter(s => s.name !== sintoma.name);
                    }
                }
            }

            this.sintomasUnicos = this.sintomasUnicos.filter(s => s.name !== sintoma.name);
            cntPreguntas++;
            for (const e of this.enfermedades){
                console.log(e.probabilidad);
            }
        }
        this.mostrarResultado();
    }

    obtenerSintomasUnicos(): symptoms[] {
        const sintomas: symptoms[] = [];
        for (const enfermedad of this.enfermedades) {
            sintomas.push(...enfermedad.symptoms);
        }
        return Array.from(new Set(sintomas.map(s => s.name))).map(name => sintomas.find(s => s.name === name)!);
    }

    elegirMejorPregunta(): symptoms {
        let mejorSintoma: symptoms | null = null;
        let maxGanancia = -1;

        for (const sintoma of this.sintomasUnicos) {
            const ganancia = this.calcularGananciaInformacion(sintoma);
            if (ganancia > maxGanancia) {
                maxGanancia = ganancia;
                mejorSintoma = sintoma;
            }
        }

        return mejorSintoma!;
    }

    calcularGananciaInformacion(sintoma: symptoms): number {
        const total = this.enfermedades.length;
        const conSintoma = this.enfermedades.filter(e => e.symptoms.some(s => s.name === sintoma.name)).length;
        const sinSintoma = total - conSintoma;

        const pCon = total > 0 ? conSintoma / total : 0;
        const pSin = total > 0 ? sinSintoma / total : 0;

        const entropiaCon = pCon > 0 ? -pCon * Math.log2(pCon) : 0;
        const entropiaSin = pSin > 0 ? -pSin * Math.log2(pSin) : 0;

        return pCon * entropiaCon + pSin * entropiaSin;
    }

    mostrarResultado() {
        const enfermedadMasProbable = this.enfermedades.reduce((a, b) => 
            a.probabilidad > b.probabilidad ? a : b
        );
        console.log(`\nLa enfermedad más probable es: ${enfermedadMasProbable.name}`);
    }

    private preguntarUsuario(pregunta: string): Promise<string> {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        return new Promise((resolve) => {
            rl.question(pregunta, (respuesta) => {
                rl.close();
                resolve(respuesta.trim().toLowerCase());
            });
        });
    }
}

// Ejemplo de uso con objetos `symptoms`
const gripe = new diseases(1, "Gripe", "Infección viral que afecta las vías respiratorias", [
    new symptoms(1, "fiebre", "Aumento de la temperatura corporal", []),
    new symptoms(2, "tos", "Tos persistente", []),
    new symptoms(3, "dolor muscular", "Dolor en los músculos", [])
]);
const alergia = new diseases(2, "Alergia", "Reacción del sistema inmunológico a sustancias extrañas", [
    new symptoms(4, "estornudos", "Expulsión rápida de aire por la nariz", []),
    new symptoms(5, "picazón", "Sensación de irritación en la piel", []),
    new symptoms(6, "ojos llorosos", "Ojos que producen exceso de lágrimas", [])
]);
const covid = new diseases(3, "COVID-19", "diseases causada por el virus SARS-CoV-2", [
    new symptoms(7, "fiebre", "Aumento de la temperatura corporal", []),
    new symptoms(8, "tos", "Tos persistente", []),
    new symptoms(9, "pérdida del olfato", "Incapacidad para percibir olores", []),
    new symptoms(10, "dolor de cabeza", "Dolor en la cabeza", [])
]);

const sintomasIniciales = [gripe.symptoms[0], gripe.symptoms[1]];
const diagnostico = new diagnostic([gripe, alergia, covid]);

diagnostico.calcularInicial(sintomasIniciales);
diagnostico.hacerPreguntas();