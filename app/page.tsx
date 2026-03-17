'use client';

import { useState, useEffect } from 'react';

// Tipos
interface Proceso {
  id: string;
  numeroPalet: string;
  tipoProducto: string;
  operario: string;
  fecha: string;
  cantidadCajas: number;
  pesoBruto: number;
  pesoNeto: number;
  merma: number;
  mermaPercentage: number;
  pesosPorCaja: number[];
  temp1: string;
  temp2: string;
  receta: string;
  cantidadLomos: number;
  ingredientesAdaptados: any[];
  completado: boolean;
  fechaCreacion: string;
}

export default function Home() {
  const [screen, setScreen] = useState<number>(1);
  const [pin, setPin] = useState<string>('');
  
  // Datos del proceso actual
  const [numeroPalet, setNumeroPalet] = useState<string>('');
  const [tipoProducto, setTipoProducto] = useState<string>('Salmón Ahumado');
  const [operario, setOperario] = useState<string>('');
  const [fecha, setFecha] = useState<string>('');
  const [cantidadCajas, setCantidadCajas] = useState<number>(0);
  const [pesoBruto, setPesoBruto] = useState<number>(0);
  const [pesoNeto, setPesoNeto] = useState<number>(0);
  const [pesosPorCaja, setPesosPorCaja] = useState<number[]>([]);
  const [cajaActual, setCajaActual] = useState<number>(0);
  const [pesoTemporal, setPesoTemporal] = useState<string>('');
  const [temp1, setTemp1] = useState<string>('');
  const [temp2, setTemp2] = useState<string>('');
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<string>('Receta Clásica');
  const [cantidadLomos, setCantidadLomos] = useState<number>(100);
  
  // Lista de procesos guardados
  const [procesos, setProcesos] = useState<Proceso[]>([]);

  // Recetas disponibles
  const recetas = {
    'Receta Clásica': [
      { ingrediente: 'Sal', cantidad: 30, unidad: 'lb' },
      { ingrediente: 'Azúcar', cantidad: 15, unidad: 'lb' },
      { ingrediente: 'Pimienta negra', cantidad: 2, unidad: 'lb' },
      { ingrediente: 'Eneldo', cantidad: 1.5, unidad: 'lb' }
    ],
    'Receta Premium': [
      { ingrediente: 'Sal marina', cantidad: 35, unidad: 'lb' },
      { ingrediente: 'Azúcar morena', cantidad: 18, unidad: 'lb' },
      { ingrediente: 'Pimienta negra', cantidad: 2.5, unidad: 'lb' },
      { ingrediente: 'Eneldo fresco', cantidad: 2, unidad: 'lb' },
      { ingrediente: 'Limón', cantidad: 1, unidad: 'lb' }
    ],
    'Receta Picante': [
      { ingrediente: 'Sal', cantidad: 30, unidad: 'lb' },
      { ingrediente: 'Azúcar', cantidad: 15, unidad: 'lb' },
      { ingrediente: 'Pimienta roja', cantidad: 3, unidad: 'lb' },
      { ingrediente: 'Pimentón', cantidad: 2, unidad: 'lb' }
    ]
  };

  // Cargar procesos desde localStorage al iniciar
  useEffect(() => {
    const procesosGuardados = localStorage.getItem('salmocontrol_procesos');
    if (procesosGuardados) {
      setProcesos(JSON.parse(procesosGuardados));
    }
    
    // Generar número de palet automático
    const fecha = new Date();
    const año = fecha.getFullYear();
    const numeroAleatorio = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    setNumeroPalet(`PAL-${año}-${numeroAleatorio}`);
    
    // Fecha actual
    const fechaStr = fecha.toISOString().split('T')[0];
    setFecha(fechaStr);
  }, []);

  // Guardar proceso en localStorage
  const guardarProceso = () => {
    const merma = pesoBruto - pesoNeto;
    const mermaPercentage = (merma / pesoBruto) * 100;
    
    const factor = cantidadLomos / 100;
    const ingredientesAdaptados = recetas[recetaSeleccionada as keyof typeof recetas].map(ing => ({
      ...ing,
      cantidadAdaptada: (ing.cantidad * factor).toFixed(2)
    }));
    
    const nuevoProceso: Proceso = {
      id: Date.now().toString(),
      numeroPalet,
      tipoProducto,
      operario,
      fecha,
      cantidadCajas,
      pesoBruto,
      pesoNeto,
      merma,
      mermaPercentage,
      pesosPorCaja,
      temp1,
      temp2,
      receta: recetaSeleccionada,
      cantidadLomos,
      ingredientesAdaptados,
      completado: true,
      fechaCreacion: new Date().toISOString()
    };
    
    const nuevoProcesos = [...procesos, nuevoProceso];
    setProcesos(nuevoProcesos);
    localStorage.setItem('salmocontrol_procesos', JSON.stringify(nuevoProcesos));
  };

  // Reiniciar proceso
  const reiniciarProceso = () => {
    setOperario('');
    setCantidadCajas(0);
    setPesoBruto(0);
    setPesoNeto(0);
    setPesosPorCaja([]);
    setCajaActual(0);
    setPesoTemporal('');
    setTemp1('');
    setTemp2('');
    setCantidadLomos(100);
    
    // Generar nuevo número de palet
    const fecha = new Date();
    const año = fecha.getFullYear();
    const numeroAleatorio = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    setNumeroPalet(`PAL-${año}-${numeroAleatorio}`);
    
    setScreen(2);
  };

  // Calcular ingredientes adaptados
  const calcularIngredientes = () => {
    const factor = cantidadLomos / 100;
    return recetas[recetaSeleccionada as keyof typeof recetas].map(ing => ({
      ...ing,
      cantidadAdaptada: (ing.cantidad * factor).toFixed(2)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        
        {/* PANTALLA 1: Login */}
        {screen === 1 && (
          <div className="text-center">
            <div className="text-6xl mb-4">🐟</div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900">SALMOCONTROL</h1>
            <p className="text-gray-800 mb-6">Ingrese su PIN</p>
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl text-gray-900"
                >
                  {pin.length > i ? '●' : '○'}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((num, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (num === '⌫') {
                      setPin(pin.slice(0, -1));
                    } else if (num !== '' && pin.length < 4) {
                      const newPin = pin + num;
                      setPin(newPin);
                      if (newPin === '1234') {
                        setTimeout(() => setScreen(2), 500);
                      }
                    }
                  }}
                  className="h-16 bg-blue-500 text-white rounded-lg text-xl font-bold hover:bg-blue-600 active:bg-blue-700"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PANTALLA 2: Dashboard */}
        {screen === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Dashboard</h2>
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
              <p className="text-yellow-900 text-sm font-semibold">
                ⚠️ MODO DEMO - Datos guardados en localStorage
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setScreen(3)}
                className="p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md"
              >
                <div className="text-4xl mb-2">➕</div>
                <div className="font-bold">Nuevo Proceso</div>
              </button>
              <button 
                onClick={() => setScreen(11)}
                className="p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md"
              >
                <div className="text-4xl mb-2">📋</div>
                <div className="font-bold">Ver Procesos</div>
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA 3: Datos Básicos */}
        {screen === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Datos Básicos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Nº Palet</label>
                <input
                  type="text"
                  value={numeroPalet}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tipo de Producto</label>
                <select 
                  value={tipoProducto}
                  onChange={(e) => setTipoProducto(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900"
                >
                  <option>Salmón Ahumado</option>
                  <option>Trucha Ahumada</option>
                  <option>Bacalao Ahumado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Operario</label>
                <input
                  type="text"
                  value={operario}
                  onChange={(e) => setOperario(e.target.value)}
                  placeholder="Nombre del operario"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <button
                onClick={() => {
                  if (operario.trim()) {
                    setScreen(4);
                  } else {
                    alert('Por favor ingresa el nombre del operario');
                  }
                }}
                className="w-full p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
              >
                Continuar →
              </button>
              <button
                onClick={() => setScreen(2)}
                className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600"
              >
                ← Volver
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA 4: Captura de Foto (Simulada) */}
        {screen === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Captura de Foto</h2>
            <div className="mb-6">
              <div className="border-4 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-gray-700 mb-4">Foto del lote de etiqueta</p>
                <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600">
                  Tomar Foto (Simulado)
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                💡 En la versión completa, aquí se abrirá la cámara del dispositivo
              </p>
            </div>
            <button
              onClick={() => setScreen(5)}
              className="w-full p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
            >
              Continuar (Omitir Foto) →
            </button>
            <button
              onClick={() => setScreen(3)}
              className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 mt-2"
            >
              ← Volver
            </button>
          </div>
        )}

        {/* Continúa en el siguiente mensaje... */}