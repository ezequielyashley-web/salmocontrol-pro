'use client';

import { useState } from 'react';

export default function Home() {
  const [screen, setScreen] = useState<number>(1);
  const [pin, setPin] = useState<string>('');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Login Screen */}
        {screen === 1 && (
          <div className="text-center">
            <div className="text-6xl mb-4">🐟</div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900">SALMOCONTROL</h1>
            <p className="text-gray-800 mb-6">Ingrese su PIN</p>
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl"
                >
                  {pin.length > i ? '●' : '○'}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((num) => (
                <button
                  key={num}
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

        {/* Dashboard */}
        {screen === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Dashboard</h2>
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm font-semibold">
                ⚠️ MODO DEMO - Sin Base de Datos
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setScreen(3)}
                className="p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <div className="text-4xl mb-2">➕</div>
                <div className="font-bold">Nuevo Proceso</div>
              </button>
              <button 
                onClick={() => setScreen(11)}
                className="p-6 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <div className="text-4xl mb-2">📋</div>
                <div className="font-bold">Ver Procesos</div>
              </button>
            </div>
          </div>
        )}

        {/* Datos Básicos */}
        {screen === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Datos Básicos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Nº Palet</label>
                <input
                  type="text"
                  defaultValue="PAL-2024-0013"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tipo de Producto</label>
                <select className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900">
                  <option>Salmón Ahumado</option>
                  <option>Trucha Ahumada</option>
                  <option>Bacalao Ahumado</option>
                </select>
              </div>
              <button
                onClick={() => setScreen(4)}
                className="w-full p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
              >
                Continuar →
              </button>
              <button
                onClick={() => setScreen(2)}
                className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600"
              >
                ← Volver al Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Mensaje Final */}
        {screen === 4 && (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">¡Funciona Perfectamente!</h2>
            <p className="text-gray-800 mb-6">
              Tu app está lista para usar en el móvil
            </p>
            <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-6 text-left">
              <p className="text-green-900 text-sm font-bold mb-2">
                ✓ Login con PIN funcionando
              </p>
              <p className="text-green-900 text-sm font-bold mb-2">
                ✓ Navegación entre pantallas
              </p>
              <p className="text-green-900 text-sm font-bold mb-2">
                ✓ Formularios responsive
              </p>
              <p className="text-green-900 text-sm font-bold">
                ✓ Listo para deployment
              </p>
            </div>
            <button
              onClick={() => {
                setScreen(1);
                setPin('');
              }}
              className="w-full p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
            >
              🔄 Volver al Inicio
            </button>
          </div>
        )}

        {/* Ver Procesos */}
        {screen === 11 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Lista de Procesos</h2>
            <p className="text-gray-700 mb-6">No hay procesos registrados aún.</p>
            <button
              onClick={() => setScreen(2)}
              className="w-full p-4 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600"
              >
              ← Volver al Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}