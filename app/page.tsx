'use client';

import { useState, useEffect } from 'react';

// Tipos
interface Receta {
  nombre: string;
  ingredientes: {
    nombre: string;
    cantidad: number;
    unidad: string;
  }[];
}

interface Proceso {
  id: string;
  numeroPalet: string;
  tipoProducto: string;
  operario: string;
  fecha: string;
  modo: 'cajas' | 'lomos';
  cantidadCajas?: number;
  cantidadLomos?: number;
  pesos: number[];
  pesoBruto: number;
  pesoNeto?: number;
  merma?: number;
  mermaPercentage?: number;
  temp1: string;
  temp2?: string;
  receta?: string;
  ingredientesAdaptados?: any[];
  completado: boolean;
  enProceso: boolean;
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
  const [modo, setModo] = useState<'cajas' | 'lomos' | null>(null);
  const [cantidad, setCantidad] = useState<number>(0);
  const [pesos, setPesos] = useState<number[]>([]);
  const [itemActual, setItemActual] = useState<number>(0);
  const [pesoTemporal, setPesoTemporal] = useState<string>('');
  const [pesoBruto, setPesoBruto] = useState<number>(0);
  const [pesoNeto, setPesoNeto] = useState<number>(0);
  const [temp1, setTemp1] = useState<string>('');
  const [temp2, setTemp2] = useState<string>('');
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<string>('');
  
  // Procesos y recetas
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [procesoActual, setProcesoActual] = useState<Proceso | null>(null);
  
  // Configuración de recetas
  const [pinAdmin, setPinAdmin] = useState<string>('');
  const [editandoReceta, setEditandoReceta] = useState<Receta | null>(null);
  const [nombreReceta, setNombreReceta] = useState<string>('');
  const [ingredientesTemp, setIngredientesTemp] = useState<{nombre: string; cantidad: string; unidad: string}[]>([]);
  
  // Ver detalle de proceso
  const [procesoDetalle, setProcesoDetalle] = useState<Proceso | null>(null);

  // Recetas por defecto
  const recetasPorDefecto: Receta[] = [
    {
      nombre: 'Receta Clásica',
      ingredientes: [
        { nombre: 'Sal', cantidad: 30, unidad: 'lb' },
        { nombre: 'Azúcar', cantidad: 15, unidad: 'lb' },
        { nombre: 'Pimienta negra', cantidad: 2, unidad: 'lb' },
        { nombre: 'Eneldo', cantidad: 1.5, unidad: 'lb' }
      ]
    }
  ];

  // Cargar datos desde localStorage
  useEffect(() => {
    const procesosGuardados = localStorage.getItem('salmocontrol_procesos');
    if (procesosGuardados) {
      setProcesos(JSON.parse(procesosGuardados));
    }
    
    const recetasGuardadas = localStorage.getItem('salmocontrol_recetas');
    if (recetasGuardadas) {
      setRecetas(JSON.parse(recetasGuardadas));
    } else {
      setRecetas(recetasPorDefecto);
      localStorage.setItem('salmocontrol_recetas', JSON.stringify(recetasPorDefecto));
    }
    
    generarNuevoPalet();
    setFecha(new Date().toISOString().split('T')[0]);
  }, []);

  const generarNuevoPalet = () => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const numeroAleatorio = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    setNumeroPalet(`PAL-${año}-${numeroAleatorio}`);
  };

  const guardarProcesoEnProgreso = () => {
    const pesoBrutoCalculado = pesos.reduce((a, b) => a + b, 0);
    
    const nuevoProceso: Proceso = {
      id: Date.now().toString(),
      numeroPalet,
      tipoProducto,
      operario,
      fecha,
      modo: modo!,
      cantidadCajas: modo === 'cajas' ? cantidad : undefined,
      cantidadLomos: modo === 'lomos' ? cantidad : undefined,
      pesos,
      pesoBruto: pesoBrutoCalculado,
      temp1,
      completado: false,
      enProceso: true,
      fechaCreacion: new Date().toISOString()
    };
    
    const nuevosProcesos = [...procesos, nuevoProceso];
    setProcesos(nuevosProcesos);
    localStorage.setItem('salmocontrol_procesos', JSON.stringify(nuevosProcesos));
    
    return nuevoProceso;
  };

  const completarProceso = (procesoId: string) => {
    const merma = pesoBruto - pesoNeto;
    const mermaPercentage = (merma / pesoBruto) * 100;
    
    let ingredientesAdaptados: any[] = [];
    if (recetaSeleccionada && modo === 'lomos') {
      const receta = recetas.find(r => r.nombre === recetaSeleccionada);
      if (receta) {
        const factor = cantidad / 100;
        ingredientesAdaptados = receta.ingredientes.map(ing => ({
          ...ing,
          cantidadAdaptada: (ing.cantidad * factor).toFixed(2)
        }));
      }
    }
    
    const procesosActualizados = procesos.map(p => 
      p.id === procesoId ? {
        ...p,
        pesoNeto,
        merma,
        mermaPercentage,
        temp2,
        receta: recetaSeleccionada,
        ingredientesAdaptados,
        completado: true,
        enProceso: false
      } : p
    );
    
    setProcesos(procesosActualizados);
    localStorage.setItem('salmocontrol_procesos', JSON.stringify(procesosActualizados));
  };

  const reiniciarProceso = () => {
    setOperario('');
    setModo(null);
    setCantidad(0);
    setPesos([]);
    setItemActual(0);
    setPesoTemporal('');
    setPesoBruto(0);
    setPesoNeto(0);
    setTemp1('');
    setTemp2('');
    setRecetaSeleccionada('');
    setProcesoActual(null);
    generarNuevoPalet();
    setFecha(new Date().toISOString().split('T')[0]);
    setScreen(2);
  };

  const guardarReceta = () => {
    if (!nombreReceta.trim()) {
      alert('Por favor ingresa un nombre para la receta');
      return;
    }
    
    const ingredientesFiltrados = ingredientesTemp.filter(i => 
      i.nombre.trim() && i.cantidad && parseFloat(i.cantidad) > 0
    );
    
    if (ingredientesFiltrados.length === 0) {
      alert('Por favor agrega al menos un ingrediente');
      return;
    }
    
    const nuevaReceta: Receta = {
      nombre: nombreReceta,
      ingredientes: ingredientesFiltrados.map(i => ({
        nombre: i.nombre,
        cantidad: parseFloat(i.cantidad),
        unidad: i.unidad
      }))
    };
    
    let recetasActualizadas;
    if (editandoReceta) {
      recetasActualizadas = recetas.map(r => 
        r.nombre === editandoReceta.nombre ? nuevaReceta : r
      );
    } else {
      recetasActualizadas = [...recetas, nuevaReceta];
    }
    
    setRecetas(recetasActualizadas);
    localStorage.setItem('salmocontrol_recetas', JSON.stringify(recetasActualizadas));
    
    setNombreReceta('');
    setIngredientesTemp([]);
    setEditandoReceta(null);
    setScreen(14);
  };

  const eliminarReceta = (nombreReceta: string) => {
    if (confirm(`¿Eliminar la receta "${nombreReceta}"?`)) {
      const recetasActualizadas = recetas.filter(r => r.nombre !== nombreReceta);
      setRecetas(recetasActualizadas);
      localStorage.setItem('salmocontrol_recetas', JSON.stringify(recetasActualizadas));
    }
  };

  const calcularIngredientes = () => {
    if (!recetaSeleccionada || modo !== 'lomos') return [];
    
    const receta = recetas.find(r => r.nombre === recetaSeleccionada);
    if (!receta) return [];
    
    const factor = cantidad / 100;
    return receta.ingredientes.map(ing => ({
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
            <p className="text-gray-800 mb-6">Ingrese su PIN (6 dígitos)</p>
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center text-xl text-gray-900"
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
                    } else if (num !== '' && pin.length < 6) {
                      const newPin = pin + num;
                      setPin(newPin);
                      if (newPin === '123456') {
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
                ⚠️ MODO DEMO - Datos en localStorage
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
              <button 
                onClick={() => setScreen(13)}
                className="p-6 bg-purple-500 text-white rounded-lg hover:bg-purple-600 shadow-md col-span-2"
              >
                <div className="text-4xl mb-2">⚙️</div>
                <div className="font-bold">Configurar Recetas</div>
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

        {/* PANTALLA 4: Captura de Foto */}
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
                💡 Función de cámara disponible en versión completa
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

        {/* PANTALLA 5: Selección Cajas o Lomos */}
        {screen === 5 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Modo de Trabajo</h2>
            <p className="text-gray-700 mb-6">¿Cómo quieres registrar los pesos?</p>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  setModo('cajas');
                  setScreen(6);
                }}
                className="w-full p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md"
              >
                <div className="text-4xl mb-2">📦</div>
                <div className="font-bold text-lg">Por Cajas</div>
                <p className="text-sm mt-2 opacity-90">Pesar cada caja individualmente</p>
              </button>
              
              <button
                onClick={() => {
                  setModo('lomos');
                  setScreen(6);
                }}
                className="w-full p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md"
              >
                <div className="text-4xl mb-2">🐟</div>
                <div className="font-bold text-lg">Por Lomos</div>
                <p className="text-sm mt-2 opacity-90">Pesar cada lomo individualmente</p>
              </button>
            </div>

            <button
              onClick={() => setScreen(4)}
              className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 mt-6"
            >
              ← Volver
            </button>
          </div>
        )}

        {/* PANTALLA 6: Cantidad */}
        {screen === 6 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Cantidad de {modo === 'cajas' ? 'Cajas' : 'Lomos'}
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                ¿Cuántas {modo === 'cajas' ? 'cajas' : 'lomos'} vas a procesar?
              </label>
              <input
                type="number"
                value={cantidad || ''}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                className="w-full p-4 border-2 border-gray-300 rounded-lg text-gray-900 text-2xl text-center"
                placeholder="0"
              />
              {modo === 'cajas' && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[18, 22, 24].map(num => (
                    <button
                      key={num}
                      onClick={() => setCantidad(num)}
                      className="p-3 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (cantidad > 0) {
                  setPesos(new Array(cantidad).fill(0));
                  setScreen(7);
                } else {
                  alert('Por favor ingresa una cantidad válida');
                }
              }}
              className="w-full p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
            >
              Continuar →
            </button>
            <button
              onClick={() => setScreen(5)}
              className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 mt-2"
            >
              ← Volver
            </button>
          </div>
        )}

        {/* El código continúa en el siguiente comentario... */}