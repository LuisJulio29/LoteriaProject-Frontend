import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LotteryScheduleProps {
  name: string;
  schedules: Record<string, string>;
}

const LotterySchedule: React.FC<LotteryScheduleProps> = ({ name, schedules }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-2">
      <button 
        className="flex justify-between items-center w-full text-left font-medium"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{name}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="pt-2 pb-1 pl-4 text-sm">
          {Object.entries(schedules).map(([key, value]) => (
            <p key={key} className="mb-1">
              <span className="font-medium">{key}: </span>
              {value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

const InfoModal: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es un dispositivo móvil basado en el ancho de la pantalla
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Consideramos móvil si es menor o igual a 768px
    };

    // Comprobar inicialmente
    checkIfMobile();

    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', checkIfMobile);

    // Limpiar el event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const lotterySchedules: LotteryScheduleProps[] = [
    {
      name: "Antioqueñita",
      schedules: {
        "Día": "Lunes a Sábado 10:00 AM - Domingos y Festivos 12:00 PM",
        "Tarde": "4:00 PM"
      }
    },
    {
      name: "Dorado",
      schedules: {
        "Día": "Lunes a Sábado 11:00 AM",
        "Tarde": "Lunes a Sábado 3:30 PM",
        "Noche": "Lunes a Sábado 10:15 PM - Domingos y Festivos 7:30 PM"
      }
    },
    {
        name: "Fantastica",
        schedules: {
          "Día": "Lunes a Sábado 1:00 PM",
          "Noche": "Lunes a Sábado 8:30 PM"
        }
    },
    {
        name: "Saman",
        schedules: {
          "Día": "Lunes a Sábado 1:00 PM",
          "Domingo y Festivos": " 7:00 PM"
        }
    },
    {
        name: "Paisita",
        schedules: {
          "Día": "Lunes a Sábado 1:00 PM - Domingos y Festivos 2:00 PM",
          "Noche" :"Lunes a Sábado 6:00 PM - Domingos y Festivos 8:00 PM",
          "Paisita 3": "Sábados 3:00 PM"
        }
    },
    {
        name: "Chontico",
        schedules: {
          "Día": "1:00 PM",
          "Noche" :"Lunes a Viernes 7:00 PM - Sabados : 10:00 PM - Domingos y Festivos 8:00 PM"
        }
    },
    {
        name: "Pijao De Oro",
        schedules: {
          "Día": "Lunes a Viernes : 2:00 PM",
          "Noche" :"Sabado : 9:00 PM - Domingo : 10:00 PM - Festivos 8:00 PM"
        }
    },
    {
        name: "Astro",
        schedules: {
          "Sol": "Lunes a Sábado 2:30 PM",
          "Luna" :"Lunes a Sábado 10:30 PM - Domingos y Festivos 8:30 PM"
        }
    },
    {
        name: "Sinuano",
        schedules: {
          "Día": "Lunes a Sábado 2:30 PM - Domingos y Festivos 1:00 PM",
          "Noche" :"Lunes a Sábado 10:30 PM - Domingos y Festivos 8:30 PM"
        }
    },
    {
        name: "Caribeña",
        schedules: {
          "Día": "2:30 PM",
          "Noche" :"Lunes a Sábado 10:30 PM - Domingos y Festivos 8:30 PM"
        }
    },
    {
        name: "Motilon",
        schedules: {
          "Tarde": "3:00 PM",
          "Noche" :"9:00 PM"
        }
    },
    {
        name: "Cafeterito",
        schedules: {
          "Tarde": "Lunes a Sábado 12:00 PM",
          "Noche" :"Lunes a Viernes 10:00 PM - Sabado 11:00 PM - Domingos y Festivos 9:00 PM"
        }
    },
    {
        name: "Culona",
        schedules: {
          "Día": "2:20 PM",
          "Noche" :"Lunes a Sábado 9:30 PM - Domingos y Festivos 8:00 PM"
        }
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
          <HelpCircle className="h-6 w-6 text-gray-700" />
          {isMobile && <span>Información</span>}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Información de Chances</DialogTitle>
        </DialogHeader>
        
        <div className="mt-2">
          <h3 className="font-bold text-lg text-center">Chances</h3>
          <div className="mt-2 space-y-2">
            <div>
              <h4 className="font-semibold">De Lunes a Viernes</h4>
              <ul className="pl-5 list-disc">
                <li>Día = 15 Chances</li>
                <li>Noche = 9 Chances</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Sabados</h4>
              <ul className="pl-5 list-disc">
                <li>Día = 14 Chances</li>
                <li>Noche = 12 Chances</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Domingos y Festivos</h4>
              <ul className="pl-5 list-disc">
                <li>Día = 8 Chances</li>
                <li>Noche = 12 Chances</li>
              </ul>
            </div>
          </div>
        </div>
        <div>
              <h4 className="font-semibold">Excepciones</h4>
              <ul className="pl-5 list-disc">
                <li>Jueves Noche = 10 Chances</li>
              </ul>
         </div>
        
        <div className="mt-2">
          <h3 className="font-bold text-lg mb-2">Horarios</h3>
          <div className="border rounded-md">
            {lotterySchedules.map((lottery) => (
              <LotterySchedule 
                key={lottery.name} 
                name={lottery.name} 
                schedules={lottery.schedules} 
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoModal;