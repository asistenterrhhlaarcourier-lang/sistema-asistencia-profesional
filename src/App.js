import React, { useState, useEffect } from 'react';
import { Clock, LogOut, Users, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// IMPORTANTE: Reemplaza esta URL con tu URL de Google Apps Script
const API_URL = process.env.REACT_APP_API_URL || 'https://script.google.com/macros/s/AKfycbwT_EgQ0yD0NcG34qLx72eFnWSlgQqvkc1zI256F4vnYxj8Ou8hT6MkjDwb4rMh0YwHIQ/exec';

// Servicio de API
const api = {
  login: async (usuario, password) => {
    const formData = new FormData();
    formData.append('action', 'login');
    formData.append('usuario', usuario);
    formData.append('password', password);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },
  
getPersonalPorCiudad: async (ciudad) => {
    try {
      console.log('📤 Obteniendo personal para:', ciudad);
      
      const url = `${API_URL}?action=getPersonalPorCiudad&ciudad=${encodeURIComponent(ciudad)}`;
      console.log('🔗 URL:', url);
      
      const response = await fetch(url,{
      method: 'GET',
      mode: 'cors', // Explícitamente solicitar CORS
      cache: 'no-cache'
    });
      const data = await response.json();
      
      console.log('📊 Personal recibido:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error en getPersonalPorCiudad:', error);
      throw error;
    }
  },
  
  registrarAsistencia: async (datos) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors', // Explícitamente solicitar CORS
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'registrarAsistencia',
        ...datos
      })
    });
    return response.json();
  },
  
  getAsistenciasDelDia: async (ciudad, fecha) => {
    const response = await fetch(`${API_URL}?action=getAsistenciasDelDia&ciudad=${encodeURIComponent(ciudad)}&fecha=${fecha}`);
    return response.json();
  }
};

// Componente Login
function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!usuario || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await api.login(usuario, password);
      if (result.success) {
        onLogin(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Clock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Sistema de Asistencia</h1>
          <p className="text-gray-500 mt-2">Ingresa tus credenciales</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="supervisor.ciudad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <XCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Credenciales de prueba:</p>
          <p>Usuario: supervisor.quito | Contraseña: demo123</p>
        </div>
      </div>
    </div>
  );
}

// Componente Dashboard Principal
function Dashboard({ user, onLogout }) {
  const [personal, setPersonal] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  
  const fechaHoy = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(fechaHoy);

  useEffect(() => {
    cargarDatos();
  }, [fecha]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [personalResult, asistenciasResult] = await Promise.all([
        api.getPersonalPorCiudad(user.ciudad),
        api.getAsistenciasDelDia(user.ciudad, fecha)
      ]);

      if (personalResult.success) {
        setPersonal(personalResult.data || []);
      }
      if (asistenciasResult.success) {
        setAsistencias(asistenciasResult.data || []);
      }
    } catch (err) {
      mostrarMensaje('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  const registrarAsistencia = async (datos) => {
    try {
      const datosCompletos = {
        ...datos,
        ciudad: user.ciudad,
        fecha: fecha,
        registradoPor: user.usuario
      };

      const result = await api.registrarAsistencia(datosCompletos);
      
      if (result.success) {
        mostrarMensaje('✓ Asistencia registrada correctamente', 'success');
        setSelectedPersona(null);
        cargarDatos();
      } else {
        mostrarMensaje(result.message, 'error');
      }
    } catch (err) {
      mostrarMensaje('Error al registrar asistencia', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Control de Asistencia</h1>
                <p className="text-sm text-gray-500">{user.ciudad} • {user.rol}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mensajes */}
      {mensaje && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`flex items-center gap-2 p-4 rounded-lg shadow-sm ${
            mensaje.tipo === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {mensaje.tipo === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{mensaje.texto}</span>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selector de Fecha */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <Calendar className="text-indigo-600" size={24} />
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de registro
              </label>
              <input
                type="date"
                value={fecha}
                max={fechaHoy}
                onChange={(e) => setFecha(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="text-sm text-gray-600">
              {new Date(fecha).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Cargando datos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Personal */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="text-indigo-600" size={24} />
                    <h2 className="text-lg font-semibold text-gray-800">Personal</h2>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {personal.length}
                  </span>
                </div>
              </div>
              <div className="p-4 max-h-[600px] overflow-y-auto">
                {personal.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">No hay personal registrado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {personal.map((persona) => {
                      const yaRegistrado = asistencias.some(a => a.idPersonal === persona.id);
                      return (
                        <div
                          key={persona.id}
                          onClick={() => !yaRegistrado && setSelectedPersona(persona)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            yaRegistrado
                              ? 'border-green-200 bg-green-50 cursor-not-allowed opacity-75'
                              : selectedPersona?.id === persona.id
                              ? 'border-indigo-500 bg-indigo-50 cursor-pointer shadow-md'
                              : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">
                                {persona.nombre} {persona.apellido}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">{persona.cargo}</p>
                            </div>
                            {yaRegistrado && (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle size={24} />
                                <span className="text-xs font-medium">Registrado</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Formulario de Registro */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Registrar Asistencia</h2>
              </div>
              <div className="p-6">
                {selectedPersona ? (
                  <RegistroForm
                    persona={selectedPersona}
                    onSubmit={registrarAsistencia}
                    onCancel={() => setSelectedPersona(null)}
                  />
                ) : (
                  <div className="text-center py-16">
                    <Users className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-500 font-medium">
                      Selecciona una persona para registrar su asistencia
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Haz clic en cualquier nombre de la lista
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Listado de Asistencias del Día */}
        {!loading && asistencias.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Asistencias Registradas
                </h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {asistencias.length} registros
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Personal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Entrada
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Salida
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Jornada
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Horas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {asistencias.map((asistencia, index) => (
                    <tr key={asistencia.idRegistro} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {asistencia.nombreCompleto}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                        {asistencia.horaEntrada || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                        {asistencia.horaSalida || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                          asistencia.tipoJornada === '6 horas'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {asistencia.tipoJornada}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                        {asistencia.horasTrabajadas ? `${asistencia.horasTrabajadas.toFixed(2)}h` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Componente Formulario de Registro
function RegistroForm({ persona, onSubmit, onCancel }) {
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [tipoJornada, setTipoJornada] = useState('6 horas');

  const handleSubmit = () => {
    if (!horaEntrada) {
      alert('Por favor ingresa la hora de entrada');
      return;
    }
    
    onSubmit({
      idPersonal: persona.id,
      nombreCompleto: `${persona.nombre} ${persona.apellido}`,
      horaEntrada,
      horaSalida,
      tipoJornada
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-lg border-2 border-indigo-200">
        <p className="font-bold text-gray-800 text-lg">
          {persona.nombre} {persona.apellido}
        </p>
        <p className="text-sm text-gray-600 mt-1">{persona.cargo}</p>
        <p className="text-xs text-indigo-600 mt-2 font-medium">ID: {persona.id}</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Hora de Entrada <span className="text-red-500">*</span>
        </label>
        <input
          type="time"
          value={horaEntrada}
          onChange={(e) => setHoraEntrada(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Hora de Salida <span className="text-gray-400 text-xs font-normal">(opcional)</span>
        </label>
        <input
          type="time"
          value={horaSalida}
          onChange={(e) => setHoraSalida(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Tipo de Jornada <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTipoJornada('4 horas')}
            className={`py-4 px-4 rounded-lg font-bold transition-all border-2 ${
              tipoJornada === '4 horas'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            4 Horas
          </button>
          <button
            type="button"
            onClick={() => setTipoJornada('6 horas')}
            className={`py-4 px-4 rounded-lg font-bold transition-all border-2 ${
              tipoJornada === '6 horas'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            6 Horas
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
        >
          ✓ Registrar
        </button>
      </div>
    </div>
  );
}

// App Principal
export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
