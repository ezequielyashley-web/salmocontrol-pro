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
    
    let ingredientesAdaptados = [];
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

        {/* PANTALLA 7: Registro de Pesos */}
        {screen === 7 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Pesos de {modo === 'cajas' ? 'Cajas' : 'Lomos'}
            </h2>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Progreso:</strong> {pesos.filter(p => p > 0).length} / {cantidad}
              </p>
              {pesos.filter(p => p > 0).length > 0 && (
                <>
                  <p className="text-sm text-blue-900 mt-1">
                    <strong>Total acumulado:</strong> {pesos.reduce((a,b) => a+b, 0).toFixed(2)} kg
                  </p>
                  <p className="text-sm text-blue-900">
                    <strong>Promedio:</strong> {(pesos.reduce((a,b) => a+b, 0) / pesos.filter(p => p > 0).length).toFixed(2)} kg
                  </p>
                </>
              )}
            </div>

            {itemActual < cantidad ? (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {modo === 'cajas' ? 'Caja' : 'Lomo'} {itemActual + 1}
                </h3>
                <input
                  type="number"
                  step="0.01"
                  value={pesoTemporal}
                  onChange={(e) => setPesoTemporal(e.target.value)}
                  placeholder="Peso en kg"
                  className="w-full p-4 border-2 border-gray-300 rounded-lg text-gray-900 text-2xl text-center mb-4"
                />
                <button
                  onClick={() => {
                    const peso = parseFloat(pesoTemporal);
                    if (peso > 0) {
                      const nuevosPesos = [...pesos];
                      nuevosPesos[itemActual] = peso;
                      setPesos(nuevosPesos);
                      setItemActual(itemActual + 1);
                      setPesoTemporal('');
                    } else {
                      alert('Por favor ingresa un peso válido');
                    }
                  }}
                  className="w-full p-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                >
                  Guardar Peso →
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 text-center">
                  <p className="text-green-900 font-bold text-lg">
                    ✓ Todos los pesos registrados
                  </p>
                  <p className="text-green-900 mt-2">
                    Peso Bruto Total: <strong>{pesos.reduce((a,b) => a+b, 0).toFixed(2)} kg</strong>
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 mb-6">
              {pesos.map((peso, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg text-center text-sm font-bold ${
                    peso > 0 
                      ? 'bg-green-500 text-white' 
                      : idx === itemActual 
                      ? 'bg-yellow-400 text-gray-900 animate-pulse'
                      : 'bg-gray-200 text-gray-500 border-2 border-dashed border-gray-400'
                  }`}
                >
                  {idx + 1}
                  {peso > 0 && <div className="text-xs mt-1">{peso}kg</div>}
                </div>
              ))}
            </div>

            {pesos.every(p => p > 0) && (
              <button
                onClick={() => {
                  setPesoBruto(pesos.reduce((a,b) => a+b, 0));
                  setScreen(8);
                }}
                className="w-full p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
              >
                Continuar →
              </button>
            )}
            
            <button
              onClick={() => setScreen(6)}
              className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 mt-2"
            >
              ← Volver
            </button>
          </div>
        )}

        {/* PANTALLA 8: Temperatura T1 */}
        {screen === 8 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Control de Temperatura - Día 1</h2>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                📊 <strong>Resumen del proceso:</strong>
              </p>
              <p className="text-sm text-blue-900 mt-2">
                • Modo: {modo === 'cajas' ? 'Por Cajas' : 'Por Lomos'}
              </p>
              <p className="text-sm text-blue-900">
                • Cantidad: {cantidad} {modo === 'cajas' ? 'cajas' : 'lomos'}
              </p>
              <p className="text-sm text-blue-900">
                • Peso Bruto: {pesoBruto.toFixed(2)} kg
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                T1 - Temperatura al salar
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={temp1}
                  onChange={(e) => setTemp1(e.target.value)}
                  className="w-full p-4 pr-12 border-2 border-gray-300 rounded-lg text-gray-900 text-2xl text-center"
                  placeholder="0.0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">
                  °C
                </span>
              </div>
            </div>

            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
              <p className="text-yellow-900 text-sm">
                💡 Ahora el salmón irá a ahumar. Guarda este proceso y continúa mañana para registrar la T2 y el peso después del ahumado.
              </p>
            </div>

            <button
              onClick={() => {
                if (temp1) {
                  guardarProcesoEnProgreso();
                  alert('✓ Proceso guardado. Continúa mañana después del ahumado.');
                  reiniciarProceso();
                } else {
                  alert('Por favor ingresa la temperatura T1');
                }
              }}
              className="w-full p-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
            >
              💾 Guardar y Continuar Mañana
            </button>
            <button
              onClick={() => setScreen(7)}
              className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 mt-2"
            >
              ← Volver
            </button>
          </div>
        )}

        {/* PANTALLA 9: Continuar Proceso - Peso Neto */}
        {screen === 9 && procesoActual && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Peso Neto - Día 2</h2>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Proceso:</strong> {procesoActual.numeroPalet}
              </p>
              <p className="text-sm text-blue-900">
                <strong>Peso Bruto (antes):</strong> {procesoActual.pesoBruto.toFixed(2)} kg
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Peso Neto (después del ahumado)
              </label>
              <input
                type="number"
                step="0.1"
                value={pesoNeto || ''}
                onChange={(e) => setPesoNeto(parseFloat(e.target.value) || 0)}
                className="w-full p-4 border-2 border-green-500 rounded-lg text-gray-900 text-2xl text-center"
                placeholder="0.0 kg"
              />
            </div>

            {pesoNeto > 0 && procesoActual.pesoBruto > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-gray-900 mb-3">Comparación:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Peso Bruto (fresco):</span>
                    <span className="font-bold text-gray-900">{procesoActual.pesoBruto.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Peso Neto (ahumado):</span>
                    <span className="font-bold text-green-700">{pesoNeto.toFixed(2)} kg</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Merma:</span>
                      <span className="font-bold text-red-700">
                        {(procesoActual.pesoBruto - pesoNeto).toFixed(2)} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Merma (%):</span>
                      <span className={`font-bold ${
                        ((procesoActual.pesoBruto - pesoNeto) / procesoActual.pesoBruto * 100) >= 10 && 
                        ((procesoActual.pesoBruto - pesoNeto) / procesoActual.pesoBruto * 100) <= 15
                          ? 'text-green-700'
                          : 'text-orange-700'
                      }`}>
                        {((procesoActual.pesoBruto - pesoNeto) / procesoActual.pesoBruto * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                {(((procesoActual.pesoBruto - pesoNeto) / procesoActual.pesoBruto * 100) < 10 || 
                  ((procesoActual.pesoBruto - pesoNeto) / procesoActual.pesoBruto * 100) > 15) && (
                  <div className="mt-3 p-2 bg-orange-100 border border-orange-400 rounded text-xs text-orange-900">
                    ⚠️ Merma fuera del rango normal (10-15%)
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => {
                if (pesoNeto > 0) {
                  setPesoBruto(procesoActual.pesoBruto);
                  setScreen(10);
                } else {
                  alert('Por favor ingresa el peso neto');
                }
              }}
              className="w-full p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
            >
              Continuar →
            </button>
          </div>
        )}

        {/* PANTALLA 10: Temperatura T2 */}
        {screen === 10 && procesoActual && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Control de Temperatura - Día 2</h2>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>T1 (ayer):</strong> {procesoActual.temp1}°C
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                T2 - Temperatura al día siguiente (opcional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={temp2}
                  onChange={(e) => setTemp2(e.target.value)}
                  className="w-full p-4 pr-12 border-2 border-gray-300 rounded-lg text-gray-900 text-2xl text-center"
                  placeholder="0.0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">
                  °C
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (procesoActual.modo === 'lomos') {
                  setScreen(12);
                } else {
                  completarProceso(procesoActual.id);
                  alert('✓ Proceso completado exitosamente');
                  reiniciarProceso();
                }
              }}
              className="w-full p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
            >
              {procesoActual.modo === 'lomos' ? 'Continuar a Recetas →' : 'Finalizar Proceso ✓'}
            </button>
            <button
              onClick={() => setScreen(9)}
              className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 mt-2"
            >
              ← Volver
            </button>
          </div>
        )}

        {/* PANTALLA 11: Lista de Procesos */}
        {screen === 11 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Lista de Procesos</h2>
            
            {procesos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-700">No hay procesos registrados</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {procesos.map((proceso) => (
                  <div
                    key={proceso.id}
                    onClick={() => {
                      if (proceso.enProceso) {
                        setProcesoActual(proceso);
                        setScreen(9);
                      } else {
                        setProcesoDetalle(proceso);
                        setScreen(16);
                      }
                    }}
                    className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{proceso.numeroPalet}</p>
                        <p className="text-sm text-gray-700">{proceso.tipoProducto}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full font-bold ${
                        proceso.completado 
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-400 text-gray-900'
                      }`}>
                        {proceso.completado ? '✓ Completado' : '⏳ En Proceso'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p><strong>Operario:</strong> {proceso.operario}</p>
                      <p><strong>Fecha:</strong> {proceso.fecha}</p>
                      <p><strong>Modo:</strong> {proceso.modo === 'cajas' ? 'Por Cajas' : 'Por Lomos'}</p>
                      <p><strong>Peso Bruto:</strong> {proceso.pesoBruto.toFixed(2)} kg</p>
                      {proceso.mermaPercentage && (
                        <p><strong>Merma:</strong> {proceso.mermaPercentage.toFixed(2)}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setScreen(2)}
              className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600"
            >
              ← Volver al Dashboard
            </button>
          </div>
        )}

        {/* PANTALLA 12: Selección de Receta */}
        {screen === 12 && procesoActual && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Selección de Receta</h2>
            
            {recetas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-700 mb-4">No hay recetas configuradas</p>
                <button
                  onClick={() => setScreen(13)}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600"
                >
                  Configurar Recetas
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Receta</label>
                  <select
                    value={recetaSeleccionada}
                    onChange={(e) => setRecetaSeleccionada(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900"
                  >
                    <option value="">Selecciona una receta</option>
                    {recetas.map(receta => (
                      <option key={receta.nombre} value={receta.nombre}>{receta.nombre}</option>
                    ))}
                  </select>
                </div>

                {recetaSeleccionada && (
                  <>
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
                      <h3 className="font-bold text-gray-900 mb-3">Ingredientes base (por 100 lomos):</h3>
                      <div className="space-y-2">
                        {recetas.find(r => r.nombre === recetaSeleccionada)?.ingredientes.map((ing, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">{ing.nombre}</span>
                            <span className="font-semibold text-gray-900">{ing.cantidad} {ing.unidad}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
                      <h3 className="font-bold text-gray-900 mb-3">
                        Receta adaptada para {procesoActual.cantidadLomos} lomos:
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Factor: {(procesoActual.cantidadLomos! / 100).toFixed(2)}x
                      </p>
                      <div className="space-y-2">
                        {calcularIngredientes().map((ing, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">{ing.nombre}</span>
                            <span className="font-bold text-green-900">
                              {ing.cantidadAdaptada} {ing.unidad}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={() => {
                    if (recetaSeleccionada) {
                      setCantidad(procesoActual.cantidadLomos!);
                      completarProceso(procesoActual.id);
                      alert('✓ Proceso completado con receta aplicada');
                      reiniciarProceso();
                    } else {
                      alert('Por favor selecciona una receta');
                    }
                  }}
                  className="w-full p-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                >
                  Finalizar Proceso ✓
                </button>
              </>
            )}

            <button
              onClick={() => setScreen(10)}
              className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 mt-2"
            >
              ← Volver
            </button>
          </div>
        )}

        {/* PANTALLA 13: PIN Admin Recetas */}
        {screen === 13 && (
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900">PIN de Administrador</h1>
            <p className="text-gray-800 mb-6">Ingrese PIN (6 dígitos)</p>
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center text-xl text-gray-900"
                >
                  {pinAdmin.length > i ? '●' : '○'}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((num, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (num === '⌫') {
                      setPinAdmin(pinAdmin.slice(0, -1));
                    } else if (num !== '' && pinAdmin.length < 6) {
                      const newPin = pinAdmin + num;
                      setPinAdmin(newPin);
                      if (newPin === '999999') {
                        setTimeout(() => {
                          setPinAdmin('');
                          setScreen(14);
                        }, 500);
                      }
                    }
                  }}
                  className="h-16 bg-purple-500 text-white rounded-lg text-xl font-bold hover:bg-purple-600 active:bg-purple-700"
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setPinAdmin('');
                setScreen(2);
              }}
              className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 mt-4"
            >
              ← Volver
            </button>
          </div>
        )}

        {/* PANTALLA 14: Gestión de Recetas */}
        {screen === 14 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Gestión de Recetas</h2>
            
            {recetas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-700 mb-4">No hay recetas configuradas</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {recetas.map((receta) => (
                  <div
                    key={receta.nombre}
                    className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{receta.nombre}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditandoReceta(receta);
                            setNombreReceta(receta.nombre);
                            setIngredientesTemp(receta.ingredientes.map(i => ({
                              nombre: i.nombre,
                              cantidad: i.cantidad.toString(),
                              unidad: i.unidad
                            })));
                            setScreen(15);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded font-bold hover:bg-blue-600"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => eliminarReceta(receta.nombre)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded font-bold hover:bg-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      {receta.ingredientes.map((ing, idx) => (
                        <p key={idx}>• {ing.nombre}: {ing.cantidad} {ing.unidad}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setEditandoReceta(null);
                setNombreReceta('');
                setIngredientesTemp([{nombre: '', cantidad: '', unidad: 'lb'}]);
                setScreen(15);
              }}
              className="w-full p-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 mb-2"
            >
              ➕ Agregar Nueva Receta
            </button>

            <button
              onClick={() => setScreen(2)}
              className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600"
            >
              ← Volver al Dashboard
            </button>
          </div>
        )}

        {/* PANTALLA 15: Editor de Receta */}
        {screen === 15 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {editandoReceta ? 'Editar Receta' : 'Nueva Receta'}
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">Nombre de la Receta</label>
              <input
                type="text"
                value={nombreReceta}
                onChange={(e) => setNombreReceta(e.target.value)}
                placeholder="Ej: Receta Clásica"
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            <h3 className="font-bold text-gray-900 mb-3">Ingredientes (por 100 lomos):</h3>
            
            <div className="space-y-3 mb-4">
              {ingredientesTemp.map((ing, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-3">
                  <div className="grid grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={ing.nombre}
                      onChange={(e) => {
                        const nuevo = [...ingredientesTemp];
                        nuevo[idx].nombre = e.target.value;
                        setIngredientesTemp(nuevo);
                      }}
                      placeholder="Ingrediente"
                      className="col-span-5 p-2 border border-gray-300 rounded text-gray-900 text-sm"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={ing.cantidad}
                      onChange={(e) => {
                        const nuevo = [...ingredientesTemp];
                        nuevo[idx].cantidad = e.target.value;
                        setIngredientesTemp(nuevo);
                      }}
                      placeholder="Cant."
                      className="col-span-3 p-2 border border-gray-300 rounded text-gray-900 text-sm"
                    />
                    <select
                      value={ing.unidad}
                      onChange={(e) => {
                        const nuevo = [...ingredientesTemp];
                        nuevo[idx].unidad = e.target.value;
                        setIngredientesTemp(nuevo);
                      }}
                      className="col-span-3 p-2 border border-gray-300 rounded text-gray-900 text-sm"
                    >
                      <option value="lb">lb</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="oz">oz</option>
                      <option value="L">L</option>
                      <option value="ml">ml</option>
                    </select>
                    <button
                      onClick={() => {
                        const nuevo = ingredientesTemp.filter((_, i) => i !== idx);
                        setIngredientesTemp(nuevo);
                      }}
                      className="col-span-1 p-2 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setIngredientesTemp([...ingredientesTemp, {nombre: '', cantidad: '', unidad: 'lb'}]);
              }}
              className="w-full p-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 mb-6"
            >
              ➕ Agregar Ingrediente
            </button>

            <button
              onClick={guardarReceta}
              className="w-full p-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 mb-2"
            >
              💾 Guardar Receta
            </button>

            <button
              onClick={() => {
                setNombreReceta('');
                setIngredientesTemp([]);
                setEditandoReceta(null);
                setScreen(14);
              }}
              className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600"
            >
              ← Cancelar
            </button>
          </div>
        )}

        {/* PANTALLA 16: Detalle de Proceso */}
        {screen === 16 && procesoDetalle && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Detalle del Proceso</h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Información General</h3>
                <div className="text-sm space-y-1 text-gray-700">
                  <p><strong>Palet:</strong> {procesoDetalle.numeroPalet}</p>
                  <p><strong>Producto:</strong> {procesoDetalle.tipoProducto}</p>
                  <p><strong>Operario:</strong> {procesoDetalle.operario}</p>
                  <p><strong>Fecha:</strong> {procesoDetalle.fecha}</p>
                  <p><strong>Modo:</strong> {procesoDetalle.modo === 'cajas' ? 'Por Cajas' : 'Por Lomos'}</p>
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Producción</h3>
                <div className="text-sm space-y-1 text-gray-700">
                  <p><strong>Cantidad:</strong> {procesoDetalle.modo === 'cajas' ? procesoDetalle.cantidadCajas : procesoDetalle.cantidadLomos}</p>
                  <p><strong>Peso Bruto:</strong> {procesoDetalle.pesoBruto.toFixed(2)} kg</p>
                  {procesoDetalle.pesoNeto && (
                    <>
                      <p><strong>Peso Neto:</strong> {procesoDetalle.pesoNeto.toFixed(2)} kg</p>
                      <p><strong>Merma:</strong> {procesoDetalle.mermaPercentage?.toFixed(2)}%</p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Temperatura</h3>
                <div className="text-sm space-y-1 text-gray-700">
                  <p><strong>T1:</strong> {procesoDetalle.temp1}°C</p>
                  {procesoDetalle.temp2 && <p><strong>T2:</strong> {procesoDetalle.temp2}°C</p>}
                </div>
              </div>

              {procesoDetalle.receta && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">Receta Aplicada</h3>
                  <div className="text-sm space-y-1 text-gray-700">
                    <p><strong>Nombre:</strong> {procesoDetalle.receta}</p>
                    {procesoDetalle.ingredientesAdaptados && (
                      <div className="mt-2">
                        <p className="font-semibold">Ingredientes:</p>
                        {procesoDetalle.ingredientesAdaptados.map((ing: any, idx: number) => (
                          <p key={idx}>• {ing.nombre}: {ing.cantidadAdaptada} {ing.unidad}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setProcesoDetalle(null);
                setScreen(11);
              }}
              className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600"
            >
              ← Volver a Procesos
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
